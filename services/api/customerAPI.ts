// 🎯 CUSTOMER API SERVICE
// Mock API implementation that simulates real backend calls
// Updated to use standardized data structures and improved architecture

// ========================================
// STANDARDIZED DATA STRUCTURES
// ========================================
import { 
  UserProfile, 
  LocationData, 
  NotificationData, 
  BaseProfile, 
  Rating 
} from '../../app/structure/Shared-DataStructure';

// Note: These interfaces are defined in our data structure files
// For now, we'll define them locally until the files are fully integrated
interface BookingDisplay {
  id: string;
  customerId: string;
  salonId: string;
  employeeId: string;
  services: Array<{ id: string; name: string; price: number; duration: number }>;
  scheduledDate: string;
  scheduledTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalPrice: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingSummary {
  id: string;
  salonName: string;
  salonImage: string;
  employeeName: string;
  employeeImage: string;
  serviceNames: string[];
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalPrice: number;
  currency: string;
}

interface BookingCreationRequest {
  salonId: string;
  employeeId?: string;
  services: Array<{ id: string; name: string; price: number; duration: number }>;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
}

interface BookingUpdateRequest {
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

interface BookingReviewSubmission {
  bookingId: string;
  rating: number; // Changed to number for simplicity
  reviewText: string;
  photos?: string[];
  isAnonymous: boolean;
}

interface SalonCard {
  id: string;
  name: string;
  barbers: number;
  rating: string; // Changed to string for UI compatibility
  posts: number;
  image: string;
  services?: Array<{ id: string; name: string; price: string; duration: string }>;
  city?: string;
  distance?: string;
}

interface SalonService {
  id: string;
  name: string;
  price: string;
  duration: string;
}

import { 
  BookingCore, 
  BookingServiceSnapshot, 
  BookingReview, 
  Payment, 
  Salon, 
  Employee, 
  Service 
} from '../../app/structure/Database-Schema';

// ========================================
// ERROR HANDLING & UTILITIES
// ========================================
import { BookingError } from '../../app/structure/Error-Handling';
import { getAppointmentsRepository, AppointmentEntity } from '../repository/appointments';

// ========================================
// LEGACY MOCK DATA (for backward compatibility)
// ========================================
import { AppMockData, PostComment, PostCommentReply, ProfileReview } from '../mock/AppMockData';

// ===========================================
// API INTERFACE - STANDARDIZED FOR MOCK AND REAL API
// ===========================================

export interface CustomerAPI {
  // ========================================
  // AUTHENTICATION & PROFILE
  // ========================================
  getCurrentUser(): Promise<UserProfile>;
  updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
  
  // ========================================
  // EXPLORE & DISCOVERY
  // ========================================
  getFeaturedServices(): Promise<Service[]>;
  getStandardServices(): Promise<Service[]>;
  getExtraServices(): Promise<{ key: string; label: string; }[]>;
  getSalonCards(filters?: SalonFilters): Promise<SalonCard[]>;
  getSalonDetails(salonId: string): Promise<Salon>;
  getSalonServices(salonId: string): Promise<SalonService[]>;
  
  // ========================================
  // SEARCH & FILTERING
  // ========================================
  searchSalons(query: string, filters?: SalonFilters): Promise<SalonCard[]>;
  searchServices(query: string): Promise<Service[]>;
  getCities(): Promise<LocationData[]>;
  getCategories(): Promise<string[]>;
  
  // ========================================
  // BOOKING MANAGEMENT
  // ========================================
  // Booking CRUD Operations
  createBooking(bookingData: BookingCreationRequest): Promise<BookingDisplay>;
  updateBooking(bookingId: string, updates: BookingUpdateRequest): Promise<BookingDisplay>;
  cancelBooking(bookingId: string, reason?: string): Promise<boolean>;
  getBooking(bookingId: string): Promise<BookingDisplay>;
  getCustomerBookings(filters?: BookingFilters): Promise<BookingSummary[]>;
  
  // Booking Availability
  getAvailableTimeSlots(salonId: string, date: string): Promise<TimeSlot[]>;
  getAvailableEmployees(salonId: string, date: string, time: string): Promise<Employee[]>;
  
  // ========================================
  // REVIEWS & RATINGS
  // ========================================
  submitReview(review: BookingReviewSubmission): Promise<boolean>;
  getBookingReviews(bookingId: string): Promise<BookingReview[]>;
  
  // Post Comments
  addPostComment(postId: string, comment: string): Promise<PostComment>;
  getPostComments(postId: string): Promise<PostComment[]>;
  likePostComment(commentId: string): Promise<boolean>;
  replyToComment(commentId: string, reply: string): Promise<PostCommentReply>;
  
  // Profile Reviews (for salon/employee profiles)
  addProfileReview(profileId: string, profileType: 'salon' | 'employee', rating: number, comment: string): Promise<ProfileReview>;
  getProfileReviews(profileId: string, profileType: 'salon' | 'employee'): Promise<ProfileReview[]>;
  likeProfileReview(reviewId: string): Promise<boolean>;
  updateProfileReview(reviewId: string, rating: number, comment: string): Promise<ProfileReview>;
  deleteProfileReview(reviewId: string): Promise<boolean>;
  
  // ========================================
  // PAYMENT & LOYALTY
  // ========================================
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getAvailableRewards(): Promise<AvailableReward[]>;
  getLoyaltyData(): Promise<LoyaltyData>;
  
  // ========================================
  // NOTIFICATIONS & MESSAGING
  // ========================================
  getNotifications(): Promise<NotificationData>;
  markNotificationAsRead(notificationId: string): Promise<boolean>;
  getMessagePreviews(): Promise<MessagePreview[]>;
  
  // ========================================
  // LEGACY SUPPORT (for backward compatibility)
  // ========================================
  // These methods maintain compatibility with existing UI components
  getFollowings(): Promise<Following[]>;
  getTrendingCards(page?: number, limit?: number): Promise<TrendingCard[]>;
  getPosts(page?: number, limit?: number): Promise<Post[]>;
  searchUsers(query: string): Promise<SearchItem[]>;
  getPreviousAppointments(): Promise<PreviousAppointment[]>;
  getUserProfile(): Promise<UserProfile>;
  getAvailableServices(): Promise<AvailableService[]>;
  getTimeSlots(): Promise<TimeSlot[]>;
  getUpcomingBookings(): Promise<UpcomingBooking[]>;
  getAppointmentSalons(): Promise<AppointmentSalon[]>;
  getAppointmentServices(): Promise<AppointmentService[]>;
  getSalonHours(): Promise<SalonHours[]>;
  getSalonStaff(): Promise<SalonStaff[]>;
  getSalonPosts(): Promise<SalonPost[]>;
  getSearchSalons(): Promise<SearchSalon[]>;
  getSearchBarbers(): Promise<SearchBarber[]>;
  getSearchServices(): Promise<SearchService[]>;
  getStaffMembers(): Promise<StaffMember[]>;
  getCalendarDays(): Promise<CalendarDay[]>;
  getTimeSlotsForDate(date: Date): Promise<TimeSlot[]>;
  getExtendedSalons(): Promise<ExtendedSalon[]>;
  getServiceMappings(): Promise<{ [key: string]: ServiceMapping }>;
  getDefaultBooking(): Promise<DefaultBooking>;
}

// ========================================
// FILTER INTERFACES
// ========================================

export interface SalonFilters {
  city?: string;
  services?: string[];
  rating?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  distance?: number; // in km
  availability?: {
    date: string;
    time?: string;
  };
}

export interface BookingFilters {
  status?: 'upcoming' | 'completed' | 'cancelled' | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  salonId?: string;
  employeeId?: string;
  limit?: number;
  offset?: number;
}

// ========================================
// LEGACY TYPES (for backward compatibility)
// ========================================
// Import legacy types from mock data
type Following = any;
type TrendingCard = any;
type Post = any;
type SearchItem = any;
type PreviousAppointment = any;
type AvailableService = any;
type TimeSlot = any;
type UpcomingBooking = any;
type AppointmentSalon = any;
type AppointmentService = any;
type SalonHours = any;
type SalonStaff = any;
type SalonPost = any;
type SearchSalon = any;
type SearchBarber = any;
type SearchService = any;
type PaymentMethod = any;
type AvailableReward = any;
type StaffMember = any;
type CalendarDay = any;
type ExtendedSalon = any;
type ServiceMapping = any;
type DefaultBooking = any;
type LoyaltyData = any;
type MessagePreview = any;

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Helper function to generate realistic available slots for a specific date
function generateAvailableSlotsForDate(date: Date): TimeSlot[] {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 19; // 7 PM
  const interval = 30; // 30 minutes
  
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();
  
  // Different availability patterns for different days
  let baseAvailability = 0.7; // 70% base availability
  let maxSlots = 20; // Maximum slots per day
  
  // Weekend availability (Saturday = 6, Sunday = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    baseAvailability = 0.5; // 50% availability on weekends
    maxSlots = 15; // Fewer slots on weekends
  }
  
  // Monday/Tuesday (busier days)
  if (dayOfWeek === 1 || dayOfWeek === 2) {
    baseAvailability = 0.6; // 60% availability
    maxSlots = 18;
  }
  
  // Generate slots with realistic availability
  let availableCount = 0;
  const maxAvailableSlots = Math.floor(Math.random() * maxSlots) + 5; // 5-20 slots
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Determine if this slot should be available
      let isAvailable = false;
      
      // Skip lunch break (12:00-13:00) - lower availability
      if (hour === 12) {
        isAvailable = Math.random() < 0.3; // 30% availability during lunch
      }
      // Skip early morning (9:00-10:00) - lower availability
      else if (hour === 9) {
        isAvailable = Math.random() < 0.4; // 40% availability early morning
      }
      // Skip late afternoon (17:00-19:00) - lower availability
      else if (hour >= 17) {
        isAvailable = Math.random() < 0.5; // 50% availability late afternoon
      }
      // Peak hours (10:00-17:00) - higher availability
      else {
        isAvailable = Math.random() < baseAvailability;
      }
      
      // Ensure we don't exceed the maximum available slots for this day
      if (isAvailable && availableCount < maxAvailableSlots) {
        availableCount++;
      } else {
        isAvailable = false;
      }
      
      slots.push({
        id: `${hour}-${minute}`,
        time: timeString,
        isAvailable,
        isSelected: false,
        price: generateSlotPrice(hour, dayOfWeek)
      });
    }
  }
  
  return slots;
}

// Helper function to generate realistic pricing for time slots
function generateSlotPrice(hour: number, dayOfWeek: number): string {
  let basePrice = 25; // Base price
  
  // Weekend pricing (Saturday = 6, Sunday = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    basePrice = 30; // Higher price on weekends
  }
  
  // Peak hours pricing (10:00-17:00)
  if (hour >= 10 && hour < 17) {
    basePrice += 5; // Premium pricing for peak hours
  }
  
  // Early morning discount (9:00-10:00)
  if (hour === 9) {
    basePrice -= 5; // Discount for early morning
  }
  
  return `$${basePrice}`;
}

// ===========================================
// MOCK API IMPLEMENTATION
// ===========================================

export const customerAPI: CustomerAPI = {
  
  // ========================================
  // AUTHENTICATION & PROFILE
  // ========================================
  async getCurrentUser(): Promise<UserProfile> {
    await simulateNetworkDelay(200);
    const legacyUser = AppMockData.customer.userProfile;
    return {
      id: 'customer-1',
      userId: 'user-1',
      displayName: legacyUser.displayName,
      username: legacyUser.username,
      email: 'customer@example.com',
      phone: '+1-555-0123',
      profileImage: legacyUser.profileImage,
      userType: 'customer',
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    await simulateNetworkDelay(300);
    const currentUser = await this.getCurrentUser();
    return { ...currentUser, ...updates };
  },

  // ========================================
  // EXPLORE & DISCOVERY
  // ========================================
  async getFeaturedServices(): Promise<any[]> {
    await simulateNetworkDelay(300);
    // Return the original AppMockData format for UI compatibility
    return AppMockData.customer.featuredServices;
  },

  async getStandardServices(): Promise<any[]> {
    await simulateNetworkDelay(200);
    // Return the original AppMockData format for UI compatibility
    return AppMockData.customer.standardServices;
  },

  async getExtraServices(): Promise<{ key: string; label: string; }[]> {
    await simulateNetworkDelay(150);
    return AppMockData.customer.extraServices;
  },

  async getSalonCards(filters?: SalonFilters): Promise<SalonCard[]> {
    await simulateNetworkDelay(500);
    // Transform legacy salon data to new SalonCard format
    return AppMockData.customer.sampleSalons.map(salon => ({
      id: salon.id,
      name: salon.name,
      barbers: salon.barbers,
      rating: salon.rating, // Keep as string for UI compatibility
      posts: salon.posts,
      image: salon.image,
      services: salon.services?.map(service => ({
        id: service.id,
        name: service.name,
        price: service.price,
        duration: service.duration
      })),
      city: 'Vancouver', // Default city
      distance: '0.5 km' // Mock distance
    }));
  },

  async getSalonDetails(salonId: string): Promise<Salon> {
    await simulateNetworkDelay(400);
    // Transform legacy salon data to new Salon format
    const legacySalon = AppMockData.customer.sampleSalons.find(s => s.id === salonId);
    if (!legacySalon) {
      throw new BookingError({
        code: 'SALON_NOT_FOUND',
        message: `Salon with ID ${salonId} not found`,
        userMessage: 'Salon not found. Please try again.',
        statusCode: 404
      });
    }
    
    return {
      id: legacySalon.id,
      businessId: 'business-1',
      name: legacySalon.name,
      description: 'Premium salon services',
      address: '123 Main St',
      city: 'Vancouver',
      state: 'BC',
      zipCode: 'V6B 1A1',
      phone: '+1-555-0123',
      email: 'info@salon.com',
      image: legacySalon.image,
      rating: parseFloat(legacySalon.rating),
      totalReviews: legacySalon.posts,
      isActive: true,
      timezone: 'America/Vancouver',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  async getSalonServices(salonId: string): Promise<SalonService[]> {
    await simulateNetworkDelay(300);
    const legacySalon = AppMockData.customer.sampleSalons.find(s => s.id === salonId);
    if (!legacySalon) {
      throw new BookingError({
        code: 'SALON_NOT_FOUND',
        message: `Salon with ID ${salonId} not found`,
        userMessage: 'Salon not found. Please try again.',
        statusCode: 404
      });
    }
    
    return legacySalon.services?.map(service => ({
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration
    })) || [];
  },

  // ========================================
  // SEARCH & FILTERING
  // ========================================
  async searchSalons(query: string, filters?: SalonFilters): Promise<SalonCard[]> {
    await simulateNetworkDelay(400);
    const allSalons = await this.getSalonCards();
    
    let filteredSalons = allSalons;
    
    // Apply text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredSalons = filteredSalons.filter(salon => 
        salon.name.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.city) {
        filteredSalons = filteredSalons.filter(salon => salon.city === filters.city);
      }
      if (filters.rating) {
        filteredSalons = filteredSalons.filter(salon => parseFloat(salon.rating) >= filters.rating!);
      }
    }
    
    return filteredSalons;
  },

  async searchServices(query: string): Promise<Service[]> {
    await simulateNetworkDelay(250);
    const allServices = await this.getStandardServices();
    const lowerQuery = query.toLowerCase();
    
    return allServices.filter(service => 
      service.name.toLowerCase().includes(lowerQuery)
    );
  },

  async getCities(): Promise<LocationData[]> {
    await simulateNetworkDelay(100);
    return AppMockData.customer.cities.map(city => ({
      id: city.id,
      name: city.name,
      currentLocation: '49.2827,-123.1207',
      availableLocations: ['Vancouver', 'Toronto', 'Montreal']
    }));
  },

  async getCategories(): Promise<string[]> {
    await simulateNetworkDelay(100);
    return AppMockData.customer.categories.map(cat => cat.label);
  },

  // ========================================
  // BOOKING MANAGEMENT
  // ========================================
  async createBooking(bookingData: BookingCreationRequest): Promise<BookingDisplay> {
    await simulateNetworkDelay(800);
    
    try {
      // Get repository
      const appointmentsRepo = getAppointmentsRepository();
      
      // Calculate totals and duration
      const totalPrice = bookingData.services.reduce((sum: number, service: any) => sum + service.price, 0);
      const totalDuration = bookingData.services.reduce((sum: number, service: any) => sum + service.duration, 0);
      
      // Calculate end time from start time + duration
      const [startHour, startMin] = bookingData.scheduledTime.split(':').map(Number);
      const endMinutes = startHour * 60 + startMin + totalDuration;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      // Get employee name (lookup from TempDB if needed)
      let employeeName = 'Unknown Employee';
      let employeeId = bookingData.employeeId || 'employee-1';
      
      // Try to get employee name from TempDB
      try {
        const TempDB = require('../../data/TemporaryDatabase').TempDB;
        const employees = TempDB.getEmployeesByBusiness('business_001');
        const employee = employees.find((e: any) => e.id === employeeId || e.employeeId === employeeId);
        if (employee) {
          employeeName = employee.name;
        }
      } catch (e) {
        console.warn('Could not lookup employee name:', e);
      }
      
      // Get salon/business info
      const businessId = 'business_001'; // Default business ID
      const serviceNames = bookingData.services.map(s => s.name).join(', ');
      const serviceId = bookingData.services[0]?.id || 'service-1';
      
      // Get customer info (for now using default - should come from auth context)
      const customerId = 'customer-1'; // TODO: Get from auth context
      const customerName = 'Customer'; // TODO: Get from auth context
      const customerPhone = ''; // TODO: Get from auth context
      
      // Create appointment entity
      const appointmentEntity = await appointmentsRepo.create({
        customerId,
        customerName,
        customerPhone,
        customerEmail: undefined,
        employeeId,
        employeeName,
        businessId,
        serviceId,
        serviceName: serviceNames,
        date: bookingData.scheduledDate,
        startTime: bookingData.scheduledTime,
        endTime,
        duration: totalDuration,
        status: 'confirmed',
        price: totalPrice,
        notes: bookingData.notes,
        specialRequests: undefined,
      });
      
      // Convert to BookingDisplay format
      const newBooking: BookingDisplay = {
        id: appointmentEntity.id,
        customerId: appointmentEntity.customerId,
        salonId: bookingData.salonId,
        employeeId: appointmentEntity.employeeId,
        services: bookingData.services,
        scheduledDate: appointmentEntity.date,
        scheduledTime: appointmentEntity.startTime,
        status: appointmentEntity.status as 'confirmed' | 'pending' | 'cancelled' | 'completed',
        totalPrice: appointmentEntity.price,
        currency: 'CAD',
        notes: appointmentEntity.notes,
        createdAt: appointmentEntity.createdAt,
        updatedAt: appointmentEntity.updatedAt
      };
      
      return newBooking;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      throw new BookingError({
        code: 'BOOKING_CREATION_FAILED',
        message: error?.message || 'Failed to create booking',
        userMessage: 'Failed to create booking. Please try again.',
        statusCode: 500
      });
    }
  },

  async updateBooking(bookingId: string, updates: BookingUpdateRequest): Promise<BookingDisplay> {
    await simulateNetworkDelay(600);
    
    try {
      const appointmentsRepo = getAppointmentsRepository();
      
      // Prepare update data
      const updateData: Partial<AppointmentEntity> = {};
      
      if (updates.scheduledDate) {
        updateData.date = updates.scheduledDate;
      }
      
      if (updates.scheduledTime) {
        updateData.startTime = updates.scheduledTime;
        // Recalculate end time if duration is known (would need to fetch appointment first)
      }
      
      if (updates.status) {
        updateData.status = updates.status;
      }
      
      if (updates.notes !== undefined) {
        updateData.notes = updates.notes;
      }
      
      // Update appointment
      const updatedEntity = await appointmentsRepo.update(bookingId, updateData);
      
      // Convert to BookingDisplay format
      // Need to reconstruct services array - for now use serviceName
      const services = updatedEntity.serviceName.split(',').map((name, idx) => ({
        id: `${updatedEntity.serviceId}-${idx}`,
        name: name.trim(),
        price: updatedEntity.price / updatedEntity.serviceName.split(',').length, // Estimate
        duration: updatedEntity.duration / updatedEntity.serviceName.split(',').length // Estimate
      }));
      
      return {
        id: updatedEntity.id,
        customerId: updatedEntity.customerId,
        salonId: 'salon-1', // TODO: Lookup from businessId
        employeeId: updatedEntity.employeeId,
        services,
        scheduledDate: updatedEntity.date,
        scheduledTime: updatedEntity.startTime,
        status: updatedEntity.status as 'confirmed' | 'pending' | 'cancelled' | 'completed',
        totalPrice: updatedEntity.price,
        currency: 'CAD',
        notes: updatedEntity.notes,
        createdAt: updatedEntity.createdAt,
        updatedAt: updatedEntity.updatedAt
      };
    } catch (error: any) {
      console.error('Error updating booking:', error);
      throw new BookingError({
        code: 'BOOKING_UPDATE_FAILED',
        message: error?.message || 'Failed to update booking',
        userMessage: 'Failed to update booking. Please try again.',
        statusCode: 500
      });
    }
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<boolean> {
    await simulateNetworkDelay(400);
    
    try {
      const appointmentsRepo = getAppointmentsRepository();
      
      // Update appointment status to cancelled
      await appointmentsRepo.update(bookingId, {
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by customer'
      });
      
      console.log(`Booking ${bookingId} cancelled${reason ? ` with reason: ${reason}` : ''}`);
      return true;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  },

  async getBooking(bookingId: string): Promise<BookingDisplay> {
    await simulateNetworkDelay(300);
    
    // Simulate fetching a specific booking
    return {
      id: bookingId,
      customerId: 'customer-1',
      salonId: 'salon-1',
      employeeId: 'employee-1',
      services: [{ id: '1', name: 'Haircut', price: 35, duration: 30 }],
      scheduledDate: '2024-01-20',
      scheduledTime: '14:00',
      status: 'confirmed',
      totalPrice: 35,
      currency: 'CAD',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  async getCustomerBookings(filters?: BookingFilters): Promise<BookingSummary[]> {
    await simulateNetworkDelay(500);
    
    try {
      // Get repository
      const appointmentsRepo = getAppointmentsRepository();
      
      // Get customer ID (for now using default - should come from auth context)
      const customerId = 'customer-1'; // TODO: Get from auth context
      
      // Load appointments from repository
      const appointments = await appointmentsRepo.listByCustomer(customerId);
      
      // Apply filters if provided
      let filteredAppointments = appointments;
      
      if (filters) {
        // Filter by status
        if (filters.status && filters.status !== 'all') {
          if (filters.status === 'upcoming') {
            filteredAppointments = filteredAppointments.filter(apt => {
              const aptDate = new Date(apt.date + 'T' + apt.startTime);
              const now = new Date();
              return apt.status !== 'cancelled' && apt.status !== 'completed' && aptDate >= now;
            });
          } else if (filters.status === 'completed') {
            filteredAppointments = filteredAppointments.filter(apt => apt.status === 'completed');
          } else if (filters.status === 'cancelled') {
            filteredAppointments = filteredAppointments.filter(apt => apt.status === 'cancelled');
          }
        }
        
        // Filter by date range
        if (filters.dateRange) {
          filteredAppointments = filteredAppointments.filter(apt => {
            const aptDate = apt.date;
            return aptDate >= filters.dateRange!.start && aptDate <= filters.dateRange!.end;
          });
        }
        
        // Filter by salon
        if (filters.salonId) {
          // Note: We don't have salonId in AppointmentEntity, so we'd need to look it up
          // For now, skip this filter or implement lookup
        }
        
        // Filter by employee
        if (filters.employeeId) {
          filteredAppointments = filteredAppointments.filter(apt => apt.employeeId === filters.employeeId);
        }
      }
      
      // Get salon/business info for display (lookup from TempDB)
      const TempDB = require('../../data/TemporaryDatabase').TempDB;
      const businesses = TempDB.getBusinesses ? TempDB.getBusinesses() : [];
      const defaultBusiness = businesses[0] || { name: 'Salon', image: 'https://via.placeholder.com/100' };
      
      // Transform to BookingSummary format
      const bookingSummaries: BookingSummary[] = filteredAppointments.map(apt => {
        // Lookup salon/business name
        const business = businesses.find((b: any) => b.id === apt.businessId) || defaultBusiness;
        const salonName = business.name || 'Salon';
        const salonImage = business.image || defaultBusiness.image || 'https://via.placeholder.com/100';
        
        // Split service names if they're comma-separated
        const serviceNames = apt.serviceName.split(',').map(s => s.trim());
        
        return {
          id: apt.id,
          salonName,
          salonImage,
          employeeName: apt.employeeName,
          employeeImage: 'https://via.placeholder.com/100', // TODO: Lookup employee image
          serviceNames,
          scheduledDate: apt.date,
          scheduledTime: apt.startTime,
          duration: apt.duration,
          status: apt.status as 'confirmed' | 'pending' | 'cancelled' | 'completed',
          totalPrice: apt.price,
          currency: 'CAD'
        };
      });
      
      // Sort by date (most recent first)
      bookingSummaries.sort((a, b) => {
        const dateA = new Date(a.scheduledDate + 'T' + a.scheduledTime);
        const dateB = new Date(b.scheduledDate + 'T' + b.scheduledTime);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Apply limit/offset if provided
      if (filters?.limit) {
        const offset = filters.offset || 0;
        return bookingSummaries.slice(offset, offset + filters.limit);
      }
      
      return bookingSummaries;
    } catch (error: any) {
      console.error('Error loading customer bookings:', error);
      // Return empty array on error (or could throw)
      return [];
    }
  },

  async getAvailableTimeSlots(salonId: string, date: string): Promise<TimeSlot[]> {
    await simulateNetworkDelay(200);
    return AppMockData.customer.timeSlots;
  },

  async getAvailableEmployees(salonId: string, date: string, time: string): Promise<Employee[]> {
    await simulateNetworkDelay(300);
    
    // Transform legacy staff data to new Employee format
    return AppMockData.customer.staffMembers.map(staff => ({
      id: staff.id,
      businessId: 'business-1',
      userId: `user-${staff.id}`,
      displayName: staff.name,
      email: `${staff.name.toLowerCase().replace(/\s+/g, '.')}@salon.com`,
      role: staff.role,
      experience: 5,
      bio: 'Professional stylist',
      chairNumber: '1',
      hourlyRate: 25,
      commissionRate: 0.1,
      isAvailable: staff.status === 'Available',
      rating: parseFloat(staff.rating),
      totalAppointments: 100,
      totalRevenue: 2500,
      totalReviews: 50,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  },

  // ========================================
  // REVIEWS & RATINGS
  // ========================================
  async submitReview(review: BookingReviewSubmission): Promise<boolean> {
    await simulateNetworkDelay(500);
    console.log('Submitting review:', review);
    return true;
  },

  async getBookingReviews(bookingId: string): Promise<BookingReview[]> {
    await simulateNetworkDelay(300);
    return [
      {
        id: 'review-1',
        bookingId,
        customerId: 'customer-1',
        rating: 5,
        reviewText: 'Great service!',
        photos: [],
        isAnonymous: false,
        createdAt: new Date().toISOString()
      }
    ];
  },

  // ========================================
  // PAYMENT & LOYALTY
  // ========================================
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await simulateNetworkDelay(250);
    return AppMockData.customer.paymentMethods;
  },

  async getAvailableRewards(): Promise<AvailableReward[]> {
    await simulateNetworkDelay(300);
    return AppMockData.customer.availableRewards;
  },

  async getLoyaltyData(): Promise<LoyaltyData> {
    await simulateNetworkDelay(150);
    return AppMockData.bookingConfirmation.loyaltyData;
  },

  // ========================================
  // NOTIFICATIONS & MESSAGING
  // ========================================
  async getNotifications(): Promise<NotificationData> {
    await simulateNetworkDelay(200);
    
    // Note: Supabase integration is handled directly in the component
    // This API method is kept for backward compatibility
    // Fallback to mock data
    return {
      unreadCount: 1,
      latestNotification: {
        id: 'notif-1',
        userId: 'customer-1',
        title: 'Appointment Reminder',
        message: 'Your appointment is tomorrow at 2:00 PM',
        type: 'booking_reminder',
        isRead: false,
        isArchived: false,
        createdAt: new Date().toISOString()
      }
    };
  },

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    await simulateNetworkDelay(100);
    
    // Note: Supabase integration is handled directly in the component
    // This API method is kept for backward compatibility
    console.log(`Marking notification ${notificationId} as read`);
    return true;
  },

  async getMessagePreviews(): Promise<MessagePreview[]> {
    await simulateNetworkDelay(300);
    return AppMockData.customer.messagePreviews;
  },

  // ========================================
  // LEGACY SUPPORT (for backward compatibility)
  // ========================================
  async getFollowings(): Promise<Following[]> {
    await simulateNetworkDelay(200);
    return AppMockData.customer.followings;
  },

  async getTrendingCards(page: number = 0, limit: number = 10): Promise<TrendingCard[]> {
    await simulateNetworkDelay(400);
    const start = page * limit;
    const end = start + limit;
    return AppMockData.customer.trendingCards.slice(start, end);
  },

  async getPosts(page: number = 0, limit: number = 20): Promise<Post[]> {
    await simulateNetworkDelay(600);
    const start = page * limit;
    const end = start + limit;
    return AppMockData.customer.posts.slice(start, end);
  },

  async searchUsers(query: string): Promise<SearchItem[]> {
    await simulateNetworkDelay(250);
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return AppMockData.customer.searchData.filter(item => 
      item.name.toLowerCase().includes(lowerQuery)
    );
  },

  async getPreviousAppointments(): Promise<PreviousAppointment[]> {
    await simulateNetworkDelay(300);
    return AppMockData.customer.previousAppointments;
  },

  async getUserProfile(): Promise<UserProfile> {
    await simulateNetworkDelay(200);
    return await this.getCurrentUser();
  },

  async getAvailableServices(): Promise<AvailableService[]> {
    await simulateNetworkDelay(200);
    return AppMockData.customer.availableServices;
  },

  async getTimeSlots(): Promise<TimeSlot[]> {
    await simulateNetworkDelay(100);
    return AppMockData.customer.timeSlots;
  },

  async getUpcomingBookings(): Promise<UpcomingBooking[]> {
    await simulateNetworkDelay(400);
    return AppMockData.customer.upcomingBookings;
  },

  async getAppointmentSalons(): Promise<AppointmentSalon[]> {
    await simulateNetworkDelay(350);
    return AppMockData.customer.appointmentSalons;
  },

  async getAppointmentServices(): Promise<AppointmentService[]> {
    await simulateNetworkDelay(200);
    return AppMockData.customer.appointmentServices;
  },

  async getSalonHours(): Promise<SalonHours[]> {
    await simulateNetworkDelay(250);
    return AppMockData.customer.salonHours;
  },

  async getSalonStaff(): Promise<SalonStaff[]> {
    await simulateNetworkDelay(300);
    return AppMockData.customer.salonStaff;
  },

  async getSalonPosts(): Promise<SalonPost[]> {
    await simulateNetworkDelay(200);
    return AppMockData.customer.salonPosts;
  },

  async getSearchSalons(): Promise<SearchSalon[]> {
    await simulateNetworkDelay(300);
    return AppMockData.customer.searchSalons;
  },

  async getSearchBarbers(): Promise<SearchBarber[]> {
    await simulateNetworkDelay(250);
    return AppMockData.customer.searchBarbers;
  },

  async getSearchServices(): Promise<SearchService[]> {
    await simulateNetworkDelay(200);
    return AppMockData.customer.searchServices;
  },

  async getStaffMembers(): Promise<StaffMember[]> {
    await simulateNetworkDelay(300);
    return AppMockData.customer.staffMembers;
  },

  async getCalendarDays(): Promise<CalendarDay[]> {
    await simulateNetworkDelay(200);
    return AppMockData.customer.calendarDays;
  },

  async getTimeSlotsForDate(date: Date): Promise<TimeSlot[]> {
    await simulateNetworkDelay(150);
    
    // Generate available slots based on date and realistic availability
    const availableSlots = generateAvailableSlotsForDate(date);
    
    // Return only available slots to prevent double bookings
    return availableSlots.filter((slot: TimeSlot) => slot.isAvailable);
  },


  async getExtendedSalons(): Promise<ExtendedSalon[]> {
    await simulateNetworkDelay(250);
    return AppMockData.customer.extendedSalons;
  },

  async getServiceMappings(): Promise<{ [key: string]: ServiceMapping }> {
    await simulateNetworkDelay(100);
    return AppMockData.bookingConfirmation.serviceMappings;
  },

  async getDefaultBooking(): Promise<DefaultBooking> {
    await simulateNetworkDelay(50);
    return AppMockData.bookingConfirmation.defaultBooking;
  },

  // ========================================
  // POST COMMENTS
  // ========================================
  async addPostComment(postId: string, comment: string): Promise<PostComment> {
    await simulateNetworkDelay(300);
    const customerId = 'customer-1'; // In real app, get from auth context
    const customerName = 'John Doe'; // In real app, get from user profile
    
    const newComment: PostComment = {
      id: `comment-${Date.now()}`,
      postId,
      customerId,
      customerName,
      comment,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };
    
    // Add to mock data
    if (!AppMockData.customer.postComments) {
      AppMockData.customer.postComments = [];
    }
    AppMockData.customer.postComments.push(newComment);
    
    return newComment;
  },

  async getPostComments(postId: string): Promise<PostComment[]> {
    await simulateNetworkDelay(200);
    if (!AppMockData.customer.postComments) {
      return [];
    }
    return AppMockData.customer.postComments.filter((c: any) => c.postId === postId);
  },

  async likePostComment(commentId: string): Promise<boolean> {
    await simulateNetworkDelay(200);
    if (!AppMockData.customer.postComments) {
      return false;
    }
    const comment = AppMockData.customer.postComments.find((c: any) => c.id === commentId);
    if (comment) {
      comment.likes = (comment.likes || 0) + 1;
      return true;
    }
    return false;
  },

  async replyToComment(commentId: string, reply: string): Promise<PostCommentReply> {
    await simulateNetworkDelay(300);
    const customerId = 'customer-1';
    const customerName = 'John Doe';
    
    const newReply: PostCommentReply = {
      id: `reply-${Date.now()}`,
      commentId,
      customerId,
      customerName,
      reply,
      createdAt: new Date().toISOString()
    };
    
    // Add reply to comment
    if (AppMockData.customer.postComments) {
      const comment = AppMockData.customer.postComments.find((c: any) => c.id === commentId);
      if (comment) {
        if (!comment.replies) {
          comment.replies = [];
        }
        comment.replies.push(newReply);
      }
    }
    
    return newReply;
  },

  // ========================================
  // PROFILE REVIEWS
  // ========================================
  async addProfileReview(profileId: string, profileType: 'salon' | 'employee', rating: number, comment: string): Promise<ProfileReview> {
    await simulateNetworkDelay(300);
    const customerId = 'customer-1';
    const customerName = 'John Doe';
    
    const newReview: ProfileReview = {
      id: `review-${Date.now()}`,
      profileId,
      profileType,
      customerId,
      customerName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      verified: false,
      helpful: 0
    };
    
    // Add to mock data
    if (!AppMockData.customer.profileReviews) {
      AppMockData.customer.profileReviews = [];
    }
    AppMockData.customer.profileReviews.push(newReview);
    
    return newReview;
  },

  async getProfileReviews(profileId: string, profileType: 'salon' | 'employee'): Promise<ProfileReview[]> {
    await simulateNetworkDelay(200);
    if (!AppMockData.customer.profileReviews) {
      return [];
    }
    return AppMockData.customer.profileReviews.filter(
      (r: any) => r.profileId === profileId && r.profileType === profileType
    );
  },

  async likeProfileReview(reviewId: string): Promise<boolean> {
    await simulateNetworkDelay(200);
    if (!AppMockData.customer.profileReviews) {
      return false;
    }
    const review = AppMockData.customer.profileReviews.find((r: any) => r.id === reviewId);
    if (review) {
      review.helpful = (review.helpful || 0) + 1;
      return true;
    }
    return false;
  },

  async updateProfileReview(reviewId: string, rating: number, comment: string): Promise<ProfileReview> {
    await simulateNetworkDelay(300);
    const customerId = 'customer-1'; // In real app, get from auth context
    
    if (!AppMockData.customer.profileReviews) {
      throw new Error('Reviews not found');
    }
    
    // Find the review and verify it belongs to the current customer
    const review = AppMockData.customer.profileReviews.find((r: any) => r.id === reviewId && r.customerId === customerId);
    if (!review) {
      throw new Error('Review not found or does not belong to current customer');
    }
    
    // Update the review
    review.rating = rating;
    review.comment = comment;
    review.createdAt = new Date().toISOString(); // Update timestamp
    
    // Also update in owner's reviews if it exists there
    if (AppMockData.owner.customerReviews) {
      const ownerReview = AppMockData.owner.customerReviews.find((r: any) => r.id === reviewId);
      if (ownerReview) {
        ownerReview.rating = rating;
        ownerReview.comment = comment;
      }
    }
    
    return review;
  },

  async deleteProfileReview(reviewId: string): Promise<boolean> {
    await simulateNetworkDelay(300);
    const customerId = 'customer-1'; // In real app, get from auth context
    
    console.log('[deleteProfileReview] Called with reviewId:', reviewId);
    console.log('[deleteProfileReview] Current customerId:', customerId);
    
    // Initialize array if it doesn't exist
    if (!AppMockData.customer.profileReviews) {
      AppMockData.customer.profileReviews = [];
      console.log('[deleteProfileReview] Initialized profileReviews array');
      return false;
    }
    
    console.log('[deleteProfileReview] Total reviews in array:', AppMockData.customer.profileReviews.length);
    console.log('[deleteProfileReview] All review IDs:', AppMockData.customer.profileReviews.map((r: any) => r.id));
    
    // Find the review by ID
    const reviewIndex = AppMockData.customer.profileReviews.findIndex((r: any) => r.id === reviewId);
    
    if (reviewIndex === -1) {
      console.log('[deleteProfileReview] Review not found by ID:', reviewId);
      return false;
    }
    
    const review = AppMockData.customer.profileReviews[reviewIndex];
    console.log('[deleteProfileReview] Found review:', review);
    console.log('[deleteProfileReview] Review customerId:', review.customerId);
    
    // Verify it belongs to the current customer
    if (review.customerId !== customerId) {
      console.log('[deleteProfileReview] Review does not belong to current customer');
      console.log('[deleteProfileReview] Expected:', customerId, 'Got:', review.customerId);
      return false;
    }
    
    // Remove the review from customer reviews
    AppMockData.customer.profileReviews.splice(reviewIndex, 1);
    console.log('[deleteProfileReview] Review deleted from customer profileReviews');
    console.log('[deleteProfileReview] Remaining reviews:', AppMockData.customer.profileReviews.length);
    
    // Also remove from owner's customer reviews if it exists there
    if (AppMockData.owner.customerReviews && Array.isArray(AppMockData.owner.customerReviews)) {
      const ownerReviewIndex = AppMockData.owner.customerReviews.findIndex((r: any) => r.id === reviewId);
      if (ownerReviewIndex !== -1) {
        AppMockData.owner.customerReviews.splice(ownerReviewIndex, 1);
        console.log('[deleteProfileReview] Review deleted from owner customerReviews');
      }
    }
    
    console.log('[deleteProfileReview] Delete successful!');
    return true;
  },
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Simulates network delay for realistic API behavior
 */
async function simulateNetworkDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulates network error (for testing error handling)
 */
export function simulateNetworkError(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Network error')), 500);
  });
}

// ===========================================
// REAL API IMPLEMENTATION (FOR FUTURE USE)
// ===========================================

/**
 * When backend is ready, replace the mock implementation above with this:
 * This template shows how to integrate with Supabase
 */
/*
export const customerAPI: CustomerAPI = {
  async getFeaturedServices(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new BookingError({
        code: 'FETCH_SERVICES_FAILED',
        message: error.message,
        userMessage: 'Failed to load services. Please try again.',
        statusCode: 500
      });
    }
  },
  
  async createBooking(bookingData: BookingCreationRequest): Promise<BookingDisplay> {
    try {
      // Use transaction handling for booking creation
      const { data, error } = await supabase.rpc('create_booking_transaction', {
        booking_data: bookingData
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new BookingError({
        code: 'BOOKING_CREATION_FAILED',
        message: error.message,
        userMessage: 'Failed to create booking. Please try again.',
        statusCode: 400
      });
    }
  },
  
  // ... implement all other methods with real Supabase calls
};
*/
