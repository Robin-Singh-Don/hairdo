// 🎯 CENTRALIZED MOCK DATA FOR ENTIRE APPLICATION
// This file contains ALL sample/hardcoded data for easy backend replacement

import { DEFAULT_POINTS_CONFIG } from '../../constants/PointsConfig';

// ===========================================
// TYPES DEFINITIONS
// ===========================================

export interface Service {
  key: string;
  label: string;
  image: string;
  color: string;
  gradient: string[];
  icon: string;
  popular?: boolean;
  trending?: boolean;
}

export interface SalonService {
  id: string;
  name: string;
  price: string;
  duration: string;
}

export interface Salon {
  id: string;
  name: string;
  barbers: number;
  rating: string;
  posts: number;
  image: string;
  services: SalonService[];
}

export interface Following {
  id: string;
  name: string;
  image: string;
}

export interface TrendingCard {
  id: string;
  name: string;
  subtitle: string;
  image: string;
}

export interface Post {
  id: string;
  name: string;
  subtitle: string;
  image: string;
}

export interface SearchItem {
  id: string;
  type: 'user' | 'store';
  name: string;
  image: string;
}

export interface City {
  id: string;
  name: string;
}

// Staff/Barber interface for all-barbers page
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'Available' | 'Busy' | 'Offline';
  rating: string;
  photo: { uri: string };
  tag: string;
  locked: boolean;
}

// Calendar and time slot interfaces for all-slots page
export interface CalendarDay {
  id: number;
  date: Date;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  isTomorrow: boolean;
  availableSlots: number;
  isAvailable: boolean;
}


export interface Category {
  key: string;
  label: string;
  icon: string;
}

export interface PreviousAppointment {
  type: string;
  label: string;
  image: { uri: string };
}

export interface UserProfile {
  username: string;
  displayName: string;
  profileImage: string;
}

export interface MessagePreview {
  id: string;
  name: string;
  profileImage: string;
  lastMessage: string;
  timestamp: string;
}

export interface AvailableService {
  id: string;
  name: string;
  duration: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable?: boolean;
  isSelected?: boolean;
}

// Extended salon interface for salons-list page
export interface ExtendedSalon {
  id: string;
  name: string;
  city: string;
  barbers: number;
  rating: number;
  posts: number;
  image: string;
  distance: string;
  priceRange: string;
}

export interface UpcomingBooking {
  id: string;
  service: string;
  salon: string;
  barber: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  profileImage: string;
  salonImage?: string; // Add salonImage field for consistency
  rating: number;
  haircutPhoto: string;
  haircutDescription: string;
  mediaItems: any[];
  inspirationPhotos?: string[];
  specialInstructions?: string;
}

// Employee Types
export interface Barber {
  id: number;
  name: string;
  avatar: string;
}

export interface Day {
  day: string;
  date: number;
  fullDate: string;
}

export interface EmployeeAppointment {
  id: number;
  clientName: string;
  clientAvatar: string;
  phone: string;
  service: string;
  time: string;
  duration: number;
  startTime: number;
  endTime: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'unpaid';
  statusIcon: string;
  statusText: string;
  barberId: number;
  barber: string;
  date: number;
}

export interface ClientData {
  id: number;
  name: string;
  phone: string;
  avatar: string | null;
  rating: number | null;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  service: string | null;
  staff: string | null;
  time: string | null;
  date: string;
  timeValue: number | null;
}

export interface EmployeeService {
  id: string;
  name: string;
  price: string;
  duration: string;
}

export interface WorkingHours {
  start: string;
  end: string;
  isWorking: boolean;
}

export interface BreakTime {
  start: string;
  end: string;
  type: 'lunch' | 'break';
}

export interface Availability {
  workingHours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  breakTimes: BreakTime[];
}

export interface EmployeeNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'reminder' | 'schedule' | 'general';
  isRead: boolean;
  route?: string;
  params?: any;
}

export interface EmployeeTimeOffRequest {
  id: string;
  type: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  duration: 'half_day' | 'full_day' | 'multiple_days';
  halfDayPeriod?: 'AM' | 'PM';
  reason: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// OWNER TYPES
// ===========================================

export interface OwnerBusinessData {
  today: {
    revenue: number;
    appointments: number;
    customers: number;
    satisfaction: number;
    staffUtilization: number;
  };
  yesterday: {
    revenue: number;
    appointments: number;
    customers: number;
    satisfaction: number;
    staffUtilization: number;
  };
}

export interface OwnerScheduleData {
  time: string;
  customer: string;
  service: string;
  staff: string;
}

// Schedule Management Interfaces
export interface StaffScheduleRequest {
  id: string;
  staffId: number;
  staffName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  requestedAt: string;
  approvedAt?: string;
}

export interface ApprovedStaffSchedule {
  id: string;
  staffId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'scheduled' | 'active' | 'completed' | 'absent' | 'cancelled';
  actualStartTime?: string; // HH:MM - when staff actually started
  actualEndTime?: string; // HH:MM - when staff actually ended
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerAnalytics {
  totalRevenue: number;
  totalAppointments: number;
  totalCustomers: number;
  averageSatisfaction: number;
  staffUtilization: number;
  revenueGrowth: number;
  appointmentGrowth: number;
  customerGrowth: number;
  satisfactionGrowth: number;
}

export interface OwnerStaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string | null;
  hourlyRate: number;
  workingHours: string;
  appointmentsHandled: number;
  revenueGenerated: number;
  rating: number;
  isActive: boolean;
}

export interface OwnerCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  totalSpent: number;
  lastVisit: string;
  status: 'active' | 'inactive' | 'vip';
  preferences: string[];
}

export interface OwnerRevenue {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  growth: number;
  breakdown: {
    services: number;
    products: number;
  };
}

export interface OwnerReport {
  id: string;
  title: string;
  type: 'revenue' | 'staff' | 'customer' | 'analytics';
  period: string;
  generatedAt: string;
  data: any;
}

export interface OwnerNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'booking' | 'schedule' | 'achievement' | 'general';
  isRead: boolean;
}

export interface OwnerProfilePost {
  id: string;
  type: 'text' | 'image' | 'video';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isPromotion: boolean;
}

export interface CustomerReview {
  id: number;
  customerName: string;
  avatar: string;
  rating: number;
  service: string;
  staff: string;
  date: string;
  comment: string;
  verified: boolean;
  ownerReply?: string;
  ownerReplyDate?: string;
}

export interface RevenueTrendData {
  monthlyRevenue: number[];
  periods: Array<{
    key: string;
    label: string;
  }>;
  currentYearRevenue: number;
  previousYearRevenue: number;
  yearOverYearChange: string;
}

// Marketing Campaign Interface
export interface MarketingCampaign {
  id: string;
  name: string;
  offerType: 'discount' | 'referral' | 'loyalty';
  offerName: string;
  discount?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'active' | 'paused' | 'completed' | 'draft';
  message: string;
  
  // Images
  photos: string[]; // Array of image URIs/URLs
  logo?: string; // Logo image URI/URL
  posterImage?: string; // Poster image URI/URL
  
  // Share platforms
  sharePlatforms: string[]; // Array of platform IDs
  
  // Settings
  autoRespond: boolean;
  responseMessage?: string;
  
  // Metrics
  views: number;
  clicks: number;
  conversions: number; // Appointments booked
  revenue: number; // Revenue from this campaign
  
  // Budget & Spending
  boostBudget?: number;
  boostEnabled: boolean;
  spent: number; // Amount spent on promotion
  
  // Tracking
  createdAt: string;
  updatedAt: string;
}

export interface BookingPreferences {
  allowOnlineBooking: boolean;
  autoConfirmBooking: boolean;
  allowSameDayBooking: boolean;
  allowWaitlist: boolean;
  allowAdvanceBooking: boolean;
  maxAdvanceDays: number;
  allowCancellation: boolean;
  cancellationHours: number;
  allowRescheduling: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  waitlistMax: number;
}

// Booking Confirmation Types
export interface ServiceMapping {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
}

export interface DefaultBooking {
  barberName: string;
  barberPhoto: string;
  salonName: string;
  selectedDate: string;
  selectedTime: string;
  source: string;
  location: string;
  contact: string;
  salonImage?: string;
}

export interface LoyaltyActivity {
  date: string;
  activity: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
}

export interface LoyaltyData {
  currentPoints: number;
  recentActivity: LoyaltyActivity[];
  monthlyStats: {
    totalEarned: number;
    totalRedeemed: number;
  };
}

export interface BookingConfirmationData {
  serviceMappings: { [key: string]: ServiceMapping };
  defaultBooking: DefaultBooking;
  loyaltyData: LoyaltyData;
}

export interface EmployeePayroll {
  id: string;
  name: string;
  position: string;
  grossSalary: number;
  overtime: number;
  bonus: number;
  commission: number;
  federalTax: number;
  stateTax: number;
  localTax: number;
  healthInsurance: number;
  retirement: number;
  otherDeductions: number;
  netPay: number;
  payDate: string;
  paymentMethod: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface BookingPreferences {
  allowOnlineBooking: boolean;
  autoConfirmBooking: boolean;
  allowSameDayBooking: boolean;
  allowWaitlist: boolean;
  allowAdvanceBooking: boolean;
  maxAdvanceDays: number;
  allowCancellation: boolean;
  cancellationHours: number;
  allowRescheduling: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  waitlistMax: number;
}

export interface BankAccount {
  id: string;
  businessId: string;
  bankName: string;
  accountNumber: string; // Last 4 digits for display, full number encrypted in backend
  routingNumber: string;
  accountHolderName: string;
  accountType: 'checking' | 'savings';
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessPaymentMethod {
  id: string;
  businessId: string;
  name: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'cash';
  enabled: boolean;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutSettings {
  businessId: string;
  autoPayouts: boolean;
  schedule: 'daily' | 'weekly' | 'monthly';
  minimumThreshold: number; // in cents
  emailNotifications: boolean;
  smsNotifications: boolean;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number; // in cents
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string; // ISO date string
  createdAt: string;
}

export interface StaffRolePermissions {
  roleKey: string;
  name: string;
  permissions: {
    manageAppointments: boolean;
    manageStaff: boolean;
    viewReports: boolean;
    manageSettings: boolean;
  };
}

export interface SchedulingDefaults {
  defaultShiftDuration: number; // hours
  maxAppointmentsPerDay: number;
  bufferTimeBetweenAppointments: number; // minutes
  allowOvertime: boolean;
  allowSelfScheduling: boolean;
}

export interface StaffNotificationSettings {
  notifyNewAppointments: boolean;
  notifyCancellations: boolean;
  notifyScheduleChanges: boolean;
}

export interface OwnerNotificationSettings {
  businessId: string;
  // Notification Channels
  emailNotifications: boolean;
  pushNotifications: boolean;
  // Appointment Notifications
  appointmentBooked: boolean;
  appointmentCancelled: boolean;
  appointmentReminder: boolean;
  // Payment Notifications
  paymentReceived: boolean;
  // Staff Notifications
  staffScheduleChange: boolean;
  // Customer Engagement
  customerReview: boolean;
  // Frequency Settings
  immediateNotifications: boolean;
  dailySummary: boolean;
  // Business Alerts
  lowInventory: boolean;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'desktop' | 'laptop';
  location: string;
  lastActive: string;
  isCurrent: boolean;
  ipAddress?: string;
}

export interface RecoveryOptions {
  backupEmail: string;
  recoveryPhone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface OwnerSecuritySettings {
  businessId: string;
  userId: string;
  // Authentication Settings
  twoFactorAuth: boolean;
  twoFactorAuthMethod?: 'sms' | 'email' | 'authenticator';
  biometricLogin: boolean;
  // Session Management
  sessionTimeout: boolean;
  sessionTimeoutMinutes: number;
  loginNotifications: boolean;
  // Device Management
  deviceManagement: boolean;
  devices: Device[];
  // Recovery Options
  recoveryOptions: RecoveryOptions;
  // Password Information
  passwordLastChanged?: string;
  passwordExpiresInDays?: number;
  // Security Actions
  lastPasswordChange?: string;
  lastSecurityUpdate?: string;
  updatedAt: string;
}

export interface StaffManagementSettings {
  businessId: string;
  roles: StaffRolePermissions[];
  schedulingDefaults: SchedulingDefaults;
  notificationSettings: StaffNotificationSettings;
  updatedAt: string;
}

export interface BusinessInfo {
  name: string;
  type: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  industry: string;
  currency: string;
  language: string;
}

export interface WorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface LocationInfo {
  address: string;
  workingHours: WorkingHours;
}

export interface BrandingInfo {
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface PoliciesInfo {
  cancellationPolicy: string;
  refundPolicy: string;
  serviceDefaults: string;
}

export interface GeneralSettings {
  businessId: string;
  businessInfo: BusinessInfo;
  locationInfo: LocationInfo;
  brandingInfo: BrandingInfo;
  policiesInfo: PoliciesInfo;
  updatedAt: string;
}

export interface RevenueData {
  totalRevenue: number;
  netProfit: number;
  expenses: number;
  grossMargin: number;
  outstandingPayments: number;
  avgTransactionValue: number;
  customersServed: number;
  revenuePerCustomer: number;
  futureBookingsValue: number;
  recurringRevenue: number;
}

export interface ServiceRevenue {
  name: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface EmployeeRevenue {
  name: string;
  revenue: number;
  customers: number;
  avatar: string;
}

export interface TopCustomer {
  name: string;
  totalSpent: number;
  visits: number;
  lastVisit: string;
  avatar: string;
}

// Client Appointment Analysis Types
export interface ClientAppointment {
  id: string;
  clientName: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  duration: number;
  status: 'completed' | 'cancelled' | 'no-show' | 'upcoming';
  revenue: number;
  clientType: 'new' | 'returning';
}

export interface ClientAnalysis {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  totalSpent: number;
  lastVisit: string;
  averageRating: number;
  preferredServices: string[];
  clientType: 'new' | 'returning';
}

export interface ServiceAnalysis {
  name: string;
  appointments: number;
  revenue: number;
  averageDuration: number;
  popularity: number;
}

export interface StaffAnalysis {
  id: string;
  name: string;
  appointments: number;
  revenue: number;
  utilization: number;
  rating: number;
}

// AdminHomeScreen specific types
export interface AdminAppointment {
  id: number;
  clientName: string;
  customerName: string; // Alias for clientName
  phone: string;
  time: string;
  service: string;
  barber: string;
  startTime: number;
  endTime: number;
  date: string;
  customerPhoto: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'unpaid';
  statusIcon: string;
  statusText: string;
}

// EmployeeProfileScreen specific types
export interface EmployeeReview {
  id: string;
  clientName: string;
  clientImage: string;
  rating: number;
  review: string;
  date: string;
  service: string;
}

export interface EmployeeProfileData {
  profileImage: string;
  username: string;
  displayName: string;
  followers: number;
  following: number;
}

// Customer appointment page specific types
export interface AppointmentSalon {
  id: string;
  name: string;
  city: string;
  barbers: number;
  rating: string;
  posts: number;
  image: { uri: string };
  distance?: string;
  priceRange?: string;
  services?: string[];
  isOpen?: boolean;
  nextAvailable?: string;
}

export interface AppointmentService {
  key: string;
  label: string;
}

// SalonDetailsScreen specific types
export interface SalonHours {
  day: string;
  hours: string;
  status: string;
}

export interface SalonStaff {
  name: string;
  photo: string;
}

export interface SalonPost {
  id: string;
  image: string;
  label: string;
  comments?: PostComment[];
  likes?: number;
  authorId?: string;
  authorName?: string;
  authorImage?: string;
  createdAt?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  customerId: string;
  customerName: string;
  customerImage?: string;
  comment: string;
  createdAt: string;
  likes?: number;
  replies?: PostCommentReply[];
}

export interface PostCommentReply {
  id: string;
  commentId: string;
  customerId: string;
  customerName: string;
  customerImage?: string;
  reply: string;
  createdAt: string;
}

export interface ProfileReview {
  id: string;
  profileId: string; // salonId or employeeId
  profileType: 'salon' | 'employee';
  customerId: string;
  customerName: string;
  customerImage?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  verified: boolean;
  helpful?: number;
}

// Search page specific types
export interface SearchSalon {
  id: string;
  name: string;
  city: string;
  barbers: number;
  rating: string;
  posts: number;
  image: string;
  type: string;
}

export interface SearchBarber {
  id: string;
  name: string;
  location: string;
  rating: string;
  posts: number;
  image: string;
  type: string;
}

export interface SearchService {
  id: string;
  name: string;
  category: string;
  image: string;
  type: string;
}

// BookingConfirmationScreen specific types
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  last4?: string;
  type?: string;
  email?: string;
  isDefault: boolean;
}

export interface AvailableReward {
  id: string;
  title: string;
  description: string;
  points: number;
  discount: string;
  validUntil: string;
  isApplicable: boolean;
}

// ===========================================
// CENTRALIZED MOCK DATA
// ===========================================

export const AppMockData = {
  
  // 🏠 CUSTOMER SIDE DATA
  customer: {
    // Explore page data
    featuredServices: [
      { 
        key: 'haircut', 
        label: 'Haircut', 
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        color: '#4A90E2',
        gradient: ['#4A90E2', '#357ABD'],
        icon: 'cut',
        popular: true
      },
      { 
        key: 'haircut_beard', 
        label: 'Haircut & Beard', 
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
        color: '#8E44AD',
        gradient: ['#8E44AD', '#6C3483'],
        icon: 'cut',
        trending: true
      },
    ],

    standardServices: [
      { 
        key: 'beard', 
        label: 'Beard', 
        image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=beard',
        color: '#2ECC71',
        gradient: ['#2ECC71', '#27AE60'],
        icon: 'cut'
      },
      { 
        key: 'long_hair', 
        label: 'Long hair', 
        image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=longhair',
        color: '#E74C3C',
        gradient: ['#E74C3C', '#C0392B'],
        icon: 'cut'
      },
      { 
        key: 'styling', 
        label: 'Styling', 
        image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=styling',
        color: '#F39C12',
        gradient: ['#F39C12', '#E67E22'],
        icon: 'cut'
      },
      { 
        key: 'facial', 
        label: 'Facial', 
        image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=facial',
        color: '#9B59B6',
        gradient: ['#9B59B6', '#8E44AD'],
        icon: 'cut'
      },
      { 
        key: 'coloring', 
        label: 'Coloring', 
        image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=coloring',
        color: '#E91E63',
        gradient: ['#E91E63', '#C2185B'],
        icon: 'cut'
      },
      { 
        key: 'more', 
        label: 'More', 
        image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=more',
        color: '#607D8B',
        gradient: ['#607D8B', '#455A64'],
        icon: 'ellipsis-horizontal'
      },
    ],

    extraServices: [
      { key: 'kids_haircut', label: 'Kids Haircut' },
      { key: 'head_massage', label: 'Head Massage' },
      { key: 'cuts_fades', label: 'Cuts and Fades' },
      { key: 'perm', label: 'Perm' },
      { key: 'straightening', label: 'Straightening' },
      { key: 'shave', label: 'Shave' },
      { key: 'eyebrow', label: 'Eyebrow Shaping' },
      { key: 'threading', label: 'Threading' },
      { key: 'waxing', label: 'Waxing' },
      { key: 'spa', label: 'Spa Treatment' },
      { key: 'bridal', label: 'Bridal Styling' },
      { key: 'makeup', label: 'Makeup' },
      { key: 'hair_treatment', label: 'Hair Treatment' },
      { key: 'scalp', label: 'Scalp Care' },
      { key: 'nails', label: 'Nails' },
      { key: 'tattoo', label: 'Tattoo' },
      { key: 'piercing', label: 'Piercing' },
    ],

    sampleSalons: [
      {
        id: '1',
        name: "Man's Cave Salon",
        barbers: 8,
        rating: '90%',
        posts: 78,
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
        services: [
          { id: '1', name: 'Haircut', price: '$35', duration: '30 min' },
          { id: '2', name: 'Beard Trim', price: '$20', duration: '20 min' },
          { id: '3', name: 'Haircut & Beard', price: '$50', duration: '45 min' },
          { id: '4', name: 'Hair Styling', price: '$40', duration: '35 min' },
          { id: '5', name: 'Hair Color', price: '$80', duration: '90 min' },
          { id: '6', name: 'Facial', price: '$45', duration: '40 min' },
        ]
      },
      {
        id: '2',
        name: 'Elite Barbershop',
        barbers: 12,
        rating: '95%',
        posts: 120,
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
        services: [
          { id: '1', name: 'Premium Haircut', price: '$45', duration: '35 min' },
          { id: '2', name: 'Beard Grooming', price: '$25', duration: '25 min' },
          { id: '3', name: 'Full Service', price: '$65', duration: '60 min' },
          { id: '4', name: 'Hair Treatment', price: '$60', duration: '45 min' },
          { id: '5', name: 'Scalp Massage', price: '$30', duration: '20 min' },
        ]
      },
      {
        id: '3',
        name: 'Classic Cuts',
        barbers: 6,
        rating: '88%',
        posts: 45,
        image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center',
        services: [
          { id: '1', name: 'Classic Haircut', price: '$30', duration: '25 min' },
          { id: '2', name: 'Beard Trim', price: '$18', duration: '15 min' },
          { id: '3', name: 'Kids Haircut', price: '$20', duration: '20 min' },
          { id: '4', name: 'Senior Haircut', price: '$25', duration: '30 min' },
        ]
      },
      {
        id: '4',
        name: 'Downtown Barbers',
        barbers: 10,
        rating: '92%',
        posts: 85,
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
        services: [
          { id: '1', name: 'Modern Haircut', price: '$40', duration: '30 min' },
          { id: '2', name: 'Beard Styling', price: '$22', duration: '20 min' },
          { id: '3', name: 'Hair & Beard Combo', price: '$55', duration: '50 min' },
          { id: '4', name: 'Hair Wash & Style', price: '$35', duration: '25 min' },
          { id: '5', name: 'Hair Coloring', price: '$75', duration: '80 min' },
        ]
      }
    ],

    // Home page data
    followings: [
      { id: '1', name: 'Alex', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: '2', name: 'Sara', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: '3', name: 'John', image: 'https://randomuser.me/api/portraits/men/65.jpg' },
      { id: '4', name: 'Mia', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: '5', name: 'Leo', image: 'https://randomuser.me/api/portraits/men/12.jpg' },
    ],

    trendingCards: Array.from({ length: 30 }).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Shark.${i + 1}`,
      subtitle: i % 2 === 0 ? 'Hair salon' : 'Barber',
      image: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
      ][i % 3],
    })),

    posts: Array.from({ length: 100 }).map((_, i) => ({
      id: (i + 1).toString(),
      name: `User${i + 1}`,
      subtitle: i % 2 === 0 ? 'Makeup Artist' : 'Hair Stylist',
      image: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
      ][i % 3],
    })),

    searchData: [
      { id: '1', type: 'user' as const, name: 'Alex', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: '2', type: 'user' as const, name: 'Sara', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: '3', type: 'store' as const, name: 'Shark.11', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
      { id: '4', type: 'store' as const, name: 'Robin.10', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
      { id: '5', type: 'user' as const, name: 'John', image: 'https://randomuser.me/api/portraits/men/65.jpg' },
      { id: '6', type: 'store' as const, name: 'Bella.22', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80' },
    ],

    // Appointment page data
    cities: [
      { id: '1', name: 'Vancouver' },
      { id: '2', name: 'Toronto' },
      { id: '3', name: 'Calgary' },
      { id: '4', name: 'Montreal' },
      { id: '5', name: 'Ottawa' },
      { id: '6', name: 'Edmonton' },
      { id: '7', name: 'Winnipeg' },
      { id: '8', name: 'Quebec City' },
      { id: '9', name: 'Victoria' },
      { id: '10', name: 'Halifax' }
    ],

    // All-barbers page data
    staffMembers: [
      {
        id: '1',
        name: 'Shark.11',
        role: "+ Men's hair Salon",
        status: 'Available' as const,
        rating: '90%',
        photo: { uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center' },
        tag: '3 Pendings, 1h 35 min',
        locked: false
      },
      {
        id: '2',
        name: 'Alex B.',
        role: "+ Men's hair Salon",
        status: 'Busy' as const,
        rating: '95%',
        photo: { uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&h=100&fit=crop&crop=center' },
        tag: '4 Pendings, 2h 15 min',
        locked: true
      },
      {
        id: '3',
        name: 'Jamie S.',
        role: "+ Men's hair Salon",
        status: 'Available' as const,
        rating: '88%',
        photo: { uri: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=100&h=100&fit=crop&crop=center' },
        tag: '2 Pendings, 1h 20 min',
        locked: false
      },
      {
        id: '4',
        name: 'Taylor R.',
        role: "+ Men's hair Salon",
        status: 'Available' as const,
        rating: '92%',
        photo: { uri: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=100&h=100&fit=crop&crop=center' },
        tag: '5 Pendings, 2h 45 min',
        locked: true
      },
      {
        id: '5',
        name: 'Jordan P.',
        role: "+ Men's hair Salon",
        status: 'Available' as const,
        rating: '89%',
        photo: { uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=center' },
        tag: '3 Pendings, 1h 50 min',
        locked: false
      },
      {
        id: '6',
        name: 'Morgan K.',
        role: "+ Men's hair Salon",
        status: 'Offline' as const,
        rating: '91%',
        photo: { uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=center' },
        tag: '0 Pendings, 0h 0 min',
        locked: true
      },
      {
        id: '7',
        name: 'Chris D.',
        role: "+ Men's hair Salon",
        status: 'Available' as const,
        rating: '87%',
        photo: { uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=center' },
        tag: '4 Pendings, 2h 10 min',
        locked: false
      },
      {
        id: '8',
        name: 'Sam T.',
        role: "+ Men's hair Salon",
        status: 'Busy' as const,
        rating: '94%',
        photo: { uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=center' },
        tag: '6 Pendings, 3h 15 min',
        locked: true
      }
    ],

    // All-slots page data - generate calendar for next 30 days
    calendarDays: (() => {
      const calendar = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = date.getDate();
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const isToday = i === 0;
        const isTomorrow = i === 1;
        
        // Don't generate hardcoded slot numbers - let the API determine availability
        const isAvailable = true; // All dates are potentially available
        
        calendar.push({
          id: i,
          date,
          dayName,
          dayNumber,
          monthName,
          isToday,
          isTomorrow,
          availableSlots: 0, // Will be updated by API
          isAvailable,
        });
      }
      
      return calendar;
    })(),

    // Time slots for a selected date (9 AM - 7 PM, 30 min intervals)
    timeSlots: (() => {
      const slots = [];
      const startHour = 9; // 9 AM
      const endHour = 19; // 7 PM
      const interval = 30; // 30 minutes
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const isAvailable = Math.random() > 0.3; // 70% availability
          
          slots.push({
            id: `${hour}-${minute}`,
            time: timeString,
            isAvailable,
            isSelected: false,
          });
        }
      }
      
      return slots;
    })(),

    // Salons-list page data - extended salon information
    extendedSalons: [
      {
        id: '1',
        name: "Man's Cave Salon",
        city: 'Vancouver',
        barbers: 8,
        rating: 4.8,
        posts: 78,
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
        distance: '0.2 km',
        priceRange: '$$'
      },
      {
        id: '2',
        name: 'Elite Barbershop',
        city: 'Vancouver',
        barbers: 12,
        rating: 4.9,
        posts: 120,
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
        distance: '0.5 km',
        priceRange: '$$$'
      },
      {
        id: '3',
        name: 'Classic Cuts',
        city: 'Vancouver',
        barbers: 6,
        rating: 4.4,
        posts: 45,
        image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center',
        distance: '0.8 km',
        priceRange: '$'
      },
      {
        id: '4',
        name: 'Downtown Barbers',
        city: 'Vancouver',
        barbers: 10,
        rating: 4.6,
        posts: 89,
        image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop&crop=center',
        distance: '1.2 km',
        priceRange: '$$'
      },
      {
        id: '5',
        name: 'Hair Masters',
        city: 'Vancouver',
        barbers: 15,
        rating: 4.7,
        posts: 156,
        image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=200&fit=crop&crop=center',
        distance: '1.8 km',
        priceRange: '$$$'
      },
      {
        id: '6',
        name: 'Style Studio',
        city: 'Vancouver',
        barbers: 7,
        rating: 4.5,
        posts: 67,
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=center',
        distance: '2.1 km',
        priceRange: '$$'
      },
      {
        id: '7',
        name: 'Gentleman\'s Cut',
        city: 'Vancouver',
        barbers: 9,
        rating: 4.8,
        posts: 98,
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=center',
        distance: '2.5 km',
        priceRange: '$$$'
      },
      {
        id: '8',
        name: 'Modern Barber',
        city: 'Vancouver',
        barbers: 11,
        rating: 4.6,
        posts: 112,
        image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=center',
        distance: '3.0 km',
        priceRange: '$$'
      }
    ],

    categories: [
      { key: 'hair', label: 'Hair', icon: '💇' },
      { key: 'beard', label: 'Beard', icon: '✂️' },
      { key: 'facial', label: 'Facial', icon: '💆' },
      { key: 'nails', label: 'Nails', icon: '💅' },
    ],

    previousAppointments: [
      { 
        type: 'previous', 
        label: 'June 11 at 10:30 AM', 
        image: { uri: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=177&h=95&fit=crop&crop=center' } 
      },
      { 
        type: 'previous', 
        label: 'May 25 at 2:15 PM', 
        image: { uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=177&h=95&fit=crop&crop=center' } 
      },
    ],

    // Inbox page data
    userProfile: {
      username: 'Robin.10',
      displayName: 'Robin Singh',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    },

    messagePreviews: [
      {
        id: '1',
        name: 'Jenny Wilson',
        profileImage: 'https://via.placeholder.com/48',
        lastMessage: 'Hi Peter! Do u want 2 come 2 the cinema tonight?',
        timestamp: '1 hour',
      },
      {
        id: '2',
        name: 'Wade Warren',
        profileImage: 'https://via.placeholder.com/48',
        lastMessage: 'Hi man! What film?',
        timestamp: '1 hour',
      },
      {
        id: '3',
        name: 'Courtney Henry',
        profileImage: 'https://via.placeholder.com/48',
        lastMessage: 'Do you have any holidays coming up?',
        timestamp: '1 hour',
      },
    ],

    // Bookings page data
    availableServices: [
      { id: '1', name: 'Haircut & Styling', duration: '45 min' },
      { id: '2', name: 'Beard Trim', duration: '20 min' },
      { id: '3', name: 'Hair Color', duration: '90 min' },
      { id: '4', name: 'Hair Treatment', duration: '60 min' },
      { id: '5', name: 'Shampoo & Blow Dry', duration: '30 min' },
      { id: '6', name: 'Kids Haircut', duration: '30 min' },
      { id: '7', name: 'Senior Haircut', duration: '40 min' },
      { id: '8', name: 'Emergency Haircut', duration: '25 min' }
    ],


    upcomingBookings: [
      {
        id: '1',
        service: 'Haircut & Styling',
        salon: 'Elite Salon',
        barber: 'Mike Johnson',
        date: 'Tomorrow',
        time: '2:00 PM',
        duration: '45 min',
        price: '$45',
        status: 'confirmed' as const,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        rating: 0,
        haircutPhoto: '',
        haircutDescription: '',
        mediaItems: [],
        inspirationPhotos: [
          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center'
        ],
        specialInstructions: 'I want a modern fade with textured top, similar to the photos. Please keep it professional for work.',
      },
      {
        id: '2',
        service: 'Beard Trim',
        salon: 'Classic Cuts',
        barber: 'David Wilson',
        date: 'Dec 20',
        time: '11:00 AM',
        duration: '20 min',
        price: '$25',
        status: 'confirmed' as const,
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        rating: 0,
        haircutPhoto: '',
        haircutDescription: '',
        mediaItems: [],
        inspirationPhotos: [
          'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center'
        ],
        specialInstructions: 'Clean, professional beard trim. Keep it neat for business meetings.',
      }
    ],

    // Appointment page data
    appointmentSalons: [
      {
        id: '1',
        name: "Man's Cave Salon",
        city: 'Vancouver',
        barbers: 8,
        rating: '90%',
        posts: 78,
        image: { uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center' },
      },
      {
        id: '2',
        name: "Elite Barbershop",
        city: 'Vancouver',
        barbers: 12,
        rating: '95%',
        posts: 120,
        image: { uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center' },
      },
      {
        id: '3',
        name: "Classic Cuts",
        city: 'Vancouver',
        barbers: 6,
        rating: '88%',
        posts: 45,
        image: { uri: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center' },
      },
      {
        id: '4',
        name: "Downtown Barbers",
        city: 'Toronto',
        barbers: 10,
        rating: '92%',
        posts: 89,
        image: { uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop&crop=center' },
      },
      {
        id: '5',
        name: "Style Studio",
        city: 'Montreal',
        barbers: 15,
        rating: '94%',
        posts: 156,
        image: { uri: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80' },
      },
      {
        id: '6',
        name: "Urban Cuts",
        city: 'Vancouver',
        barbers: 7,
        rating: '87%',
        posts: 62,
        image: { uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80' },
      }
    ],

    appointmentServices: [
      { key: 'hair', label: 'Hair' },
      { key: 'beard', label: 'Beard' },
      { key: 'facial', label: 'Facial' },
      { key: 'nails', label: 'Nails' },
      { key: 'coloring', label: 'Coloring' },
      { key: 'styling', label: 'Styling' },
      { key: 'treatment', label: 'Treatment' },
      { key: 'massage', label: 'Massage' },
      { key: 'waxing', label: 'Waxing' },
      { key: 'manicure', label: 'Manicure' },
      { key: 'pedicure', label: 'Pedicure' },
      { key: 'eyebrows', label: 'Eyebrows' }
    ],

    // SalonDetailsScreen data
    salonHours: [
      { day: 'Monday', hours: '8:00 AM - 7:00 PM', status: 'Open' },
      { day: 'Tuesday', hours: '8:00 AM - 7:00 PM', status: 'Open' },
      { day: 'Wednesday', hours: '8:00 AM - 7:00 PM', status: 'Open' },
      { day: 'Thursday', hours: '8:00 AM - 7:00 PM', status: 'Open' },
      { day: 'Friday', hours: '8:00 AM - 8:00 PM', status: 'Open' },
      { day: 'Saturday', hours: '9:00 AM - 6:00 PM', status: 'Open' },
      { day: 'Sunday', hours: '10:00 AM - 5:00 PM', status: 'Closed' }
    ],

    salonStaff: [
      { name: 'Shark.11', photo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center' },
      { name: 'Alex B.', photo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&h=100&fit=crop&crop=center' },
      { name: 'Jamie S.', photo: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=100&h=100&fit=crop&crop=center' },
      { name: 'Taylor R.', photo: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=100&h=100&fit=crop&crop=center' },
      { name: 'Jordan P.', photo: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=center' },
      { name: 'Morgan K.', photo: 'https://images.unsplash.com/photo-1494790108755-2616c3b5d9b1?w=100&h=100&fit=crop&crop=center' },
      { name: 'Chris D.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center' },
      { name: 'Sam T.', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center' }
    ],

    salonPosts: [
      { id: '1', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', label: 'Modern Fade' },
      { id: '2', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', label: 'Classic Cut' },
      { id: '3', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', label: 'Beard Trim' },
      { id: '4', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80', label: 'Kids Style' },
    ],
    
    // Post comments (dynamic, will be populated by API)
    postComments: [] as PostComment[],
    
    // Profile reviews (for salon/employee profiles)
    profileReviews: [] as ProfileReview[],

    // Search page data
    searchSalons: [
      {
        id: '1',
        name: "Man's Cave Salon",
        city: 'Vancouver',
        barbers: 8,
        rating: '90%',
        posts: 78,
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
        type: 'salon'
      },
      {
        id: '2',
        name: 'Elite Barbershop',
        city: 'Vancouver',
        barbers: 12,
        rating: '95%',
        posts: 120,
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
        type: 'salon'
      },
      {
        id: '3',
        name: 'Classic Cuts',
        city: 'Vancouver',
        barbers: 6,
        rating: '88%',
        posts: 45,
        image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center',
        type: 'salon'
      }
    ],

    searchBarbers: [
      {
        id: '1',
        name: 'Shark.11',
        location: 'Vancouver',
        rating: '95%',
        posts: 45,
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
        type: 'barber'
      },
      {
        id: '2',
        name: 'Alex B.',
        location: 'Vancouver',
        rating: '92%',
        posts: 38,
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
        type: 'barber'
      },
      {
        id: '3',
        name: 'Jamie S.',
        location: 'Vancouver',
        rating: '89%',
        posts: 52,
        image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center',
        type: 'barber'
      }
    ],

    searchServices: [
      {
        id: '1',
        name: 'Hair Cut',
        category: 'Hair',
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
        type: 'service'
      },
      {
        id: '2',
        name: 'Beard Trim',
        category: 'Beard',
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
        type: 'service'
      },
      {
        id: '3',
        name: 'Hair Styling',
        category: 'Hair',
        image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center',
        type: 'service'
      }
    ],

    // BookingConfirmationScreen data
    paymentMethods: [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: 'card',
        last4: '4242',
        type: 'Visa',
        isDefault: true,
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'logo-paypal',
        email: 'user@example.com',
        isDefault: false,
      },
      {
        id: 'cash',
        name: 'Pay at Salon',
        icon: 'cash',
        isDefault: false,
      }
    ],

    availableRewards: [
      {
        id: '1',
        title: 'First Visit Discount',
        description: 'Get 15% off your first appointment',
        points: 0,
        discount: '15%',
        validUntil: '2024-12-31',
        isApplicable: true
      },
      {
        id: '2',
        title: 'Loyalty Points Reward',
        description: 'Use 500 points for $10 off',
        points: 500,
        discount: '$10',
        validUntil: '2024-11-30',
        isApplicable: false
      },
      {
        id: '3',
        title: 'Referral Bonus',
        description: 'Get $5 off for referring a friend',
        points: 0,
        discount: '$5',
        validUntil: '2024-12-15',
        isApplicable: true
      }
    ]
  },

  // 👨‍💼 EMPLOYEE SIDE DATA
  employee: {
    // AdminHomeScreen data
    barbers: [
      { id: 1, name: 'Shark.11', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, name: 'Puneet.10', avatar: 'https://randomuser.me/api/portraits/men/44.jpg' },
      { id: 3, name: 'Jeet.12', avatar: 'https://randomuser.me/api/portraits/men/65.jpg' },
      { id: 4, name: 'Abhay.0', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
    ],

    days: [
      { day: 'S', date: 1, fullDate: 'Sunday, Dec 1' },
      { day: 'M', date: 2, fullDate: 'Monday, Dec 2' },
      { day: 'T', date: 3, fullDate: 'Tuesday, Dec 3' },
      { day: 'W', date: 4, fullDate: 'Wednesday, Dec 4' },
      { day: 'T', date: 5, fullDate: 'Thursday, Dec 5' },
      { day: 'F', date: 6, fullDate: 'Friday, Dec 6' },
      { day: 'S', date: 7, fullDate: 'Saturday, Dec 7' },
    ],


    appointments: [
      {
        id: 1,
        clientName: 'Robin Singh',
        clientAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        phone: '778-xxx-xxxx',
        service: 'Hair Cut',
        time: '7:00-7:35',
        duration: 35,
        startTime: 7,
        endTime: 7.58,
        status: 'confirmed' as const,
        statusIcon: '✅',
        statusText: 'Confirmed',
        barberId: 1,
        barber: 'Shark.11',
        date: 1
      },
      {
        id: 2,
        clientName: 'Abhay Bhatia',
        customerName: 'Abhay Bhatia',
        phone: '664-xxx-xxxx',
        service: 'Beard Trim',
        customerPhoto: 'https://randomuser.me/api/portraits/men/45.jpg',
        date: new Date().toDateString(),
        time: '7:50-8:10',
        barber: 'Jeet.12',
        startTime: 7.83,
        endTime: 8.17,
        status: 'pending' as const,
        statusIcon: '⏳',
        statusText: 'Pending'
      },
      {
        id: 3,
        clientName: 'John Doe',
        customerName: 'John Doe',
        phone: '555-xxx-xxxx',
        service: 'Haircut',
        customerPhoto: 'https://randomuser.me/api/portraits/men/50.jpg',
        date: new Date().toDateString(),
        time: '8:30-9:00',
        barber: 'Puneet.10',
        startTime: 8.5,
        endTime: 9,
        status: 'confirmed' as const,
        statusIcon: '✅',
        statusText: 'Confirmed'
      },
      {
        id: 4,
        clientName: 'Jane Smith',
        customerName: 'Jane Smith',
        phone: '444-xxx-xxxx',
        service: 'Hair Styling',
        customerPhoto: 'https://randomuser.me/api/portraits/women/40.jpg',
        date: new Date().toDateString(),
        time: '9:15-9:45',
        barber: 'Abhay.0',
        startTime: 9.25,
        endTime: 9.75,
        status: 'pending' as const,
        statusIcon: '⏳',
        statusText: 'Pending'
      },
      {
        id: 5,
        clientName: 'Mike Johnson',
        customerName: 'Mike Johnson',
        phone: '333-xxx-xxxx',
        service: 'Haircut & Styling',
        customerPhoto: 'https://randomuser.me/api/portraits/men/71.jpg',
        date: new Date().toDateString(),
        time: '10:00-10:30',
        barber: 'Shark.11',
        startTime: 10,
        endTime: 10.5,
        status: 'cancelled' as const,
        statusIcon: '❌',
        statusText: 'Cancelled'
      },
      {
        id: 6,
        clientName: 'Sarah Wilson',
        customerName: 'Sarah Wilson',
        phone: '222-xxx-xxxx',
        service: 'Hair Coloring',
        customerPhoto: 'https://randomuser.me/api/portraits/women/72.jpg',
        date: new Date().toDateString(),
        time: '10:45-11:15',
        barber: 'Jeet.12',
        startTime: 10.75,
        endTime: 11.25,
        status: 'confirmed' as const,
        statusIcon: '✅',
        statusText: 'Confirmed'
      },
      {
        id: 7,
        clientName: 'David Brown',
        customerName: 'David Brown',
        phone: '111-xxx-xxxx',
        service: 'Beard Trim',
        customerPhoto: 'https://randomuser.me/api/portraits/men/73.jpg',
        date: new Date().toDateString(),
        time: '11:30-12:00',
        barber: 'Puneet.10',
        startTime: 11.5,
        endTime: 12,
        status: 'unpaid' as const,
        statusIcon: '💳',
        statusText: 'Unpaid'
      },
      {
        id: 8,
        clientName: 'Emma Davis',
        phone: '999-xxx-xxxx',
        avatar: null as string | null,
        rating: null,
        status: 'pending' as const,
        service: null,
        staff: null,
        time: null,
        date: '11/11/2024',
        timeValue: null
      },
    ],

    // AppointmentsScreen data
    clientsData: [
      {
        id: 1,
        name: 'Shark.11',
        phone: '+1 778 xxx-xxxx',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 98,
        status: 'confirmed' as const,
        service: 'Hair Cut',
        staff: 'Michel James',
        time: '2:30 PM',
        date: '11/11/2024',
        timeValue: 14.5
      },
      {
        id: 2,
        name: 'Hardik.12',
        phone: '+1 778 xxx-xxxx',
        avatar: null as string | null,
        rating: null,
        status: 'pending' as const,
        service: null,
        staff: null,
        time: null,
        date: '11/11/2024',
        timeValue: null
      },
      {
        id: 3,
        name: 'Puneet.10',
        phone: '+1 778 xxx-xxxx',
        avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
        rating: 95,
        status: 'confirmed' as const,
        service: 'Beard Trim',
        staff: 'Michel James',
        time: '4:00 PM',
        date: '11/11/2024',
        timeValue: 16.0
      },
      {
        id: 4,
        name: 'Jeet.12',
        phone: '+1 778 xxx-xxxx',
        avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
        rating: 92,
        status: 'completed' as const,
        service: 'Full Service',
        staff: 'Michel James',
        time: '10:30 AM',
        date: '11/10/2024',
        timeValue: 10.5
      }
    ],

    // Add more employee data as needed
    services: [],

    // AdminHomeScreen appointments data
    adminAppointments: [
      {
        id: 1,
        clientName: 'Robin Singh',
        customerName: 'Robin Singh',
        phone: '778-xxx-xxxx',
        service: 'Haircut & Styling',
        customerPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        date: new Date().toDateString(),
        time: '7:00-7:35',
        barber: 'Shark.11',
        startTime: 7,
        endTime: 7.58,
        status: 'confirmed' as const,
        statusIcon: '✅',
        statusText: 'Confirmed'
      },
    ],

    availability: {
      workingHours: {
        monday: { start: '9:00 AM', end: '6:00 PM', isWorking: true },
        tuesday: { start: '9:00 AM', end: '6:00 PM', isWorking: true },
        wednesday: { start: '9:00 AM', end: '6:00 PM', isWorking: true },
        thursday: { start: '9:00 AM', end: '6:00 PM', isWorking: true },
        friday: { start: '9:00 AM', end: '6:00 PM', isWorking: true },
        saturday: { start: '10:00 AM', end: '4:00 PM', isWorking: true },
        sunday: { start: '10:00 AM', end: '4:00 PM', isWorking: false },
      },
      breakTimes: [
        { start: '12:00 PM', end: '1:00 PM', type: 'lunch' as const },
        { start: '3:00 PM', end: '3:15 PM', type: 'break' as const }
      ]
    },

    notifications: [
      {
        id: '1',
        title: 'New Appointment',
        message: 'Shark.11 booked an appointment for tomorrow at 2:30 PM',
        time: '2 hours ago',
        type: 'appointment' as const,
        isRead: false
      },
      {
        id: '2',
        title: 'Appointment Reminder',
        message: 'You have an appointment with Hardik.12 in 30 minutes',
        time: '1 hour ago',
        type: 'reminder' as const,
        isRead: false
      },
      {
        id: '3',
        title: 'Schedule Update',
        message: 'Your schedule for next week has been updated',
        time: '3 hours ago',
        type: 'schedule' as const,
        isRead: true
      }
    ],

    // EmployeeProfileScreen data
    employeeReviews: [
      {
        id: '1',
        clientName: 'Sarah Johnson',
        clientImage: 'https://randomuser.me/api/portraits/women/32.jpg',
        rating: 5,
        review: 'Michel is absolutely amazing! He gave me the perfect haircut and was so professional. Highly recommend!',
        date: '2 days ago',
        service: 'Hair Cut'
      },
      {
        id: '2',
        clientName: 'Mike Davis',
        clientImage: 'https://randomuser.me/api/portraits/men/44.jpg',
        rating: 5,
        review: 'Best barber in town! Always does exactly what I ask for. Great attention to detail.',
        date: '1 week ago',
        service: 'Beard Trim'
      },
      {
        id: '3',
        clientName: 'Lisa Chen',
        clientImage: 'https://randomuser.me/api/portraits/women/25.jpg',
        rating: 4,
        review: 'Really happy with my new hairstyle. Michel is very skilled and friendly. Will definitely come back!',
        date: '2 weeks ago',
        service: 'Hair Styling'
      },
      {
        id: '4',
        clientName: 'John Smith',
        clientImage: 'https://randomuser.me/api/portraits/men/65.jpg',
        rating: 5,
        review: 'Excellent service! Michel really knows his craft. The fade was perfect and exactly what I wanted.',
        date: '3 weeks ago',
        service: 'Hair Cut'
      },
      {
        id: '5',
        clientName: 'Emma Wilson',
        clientImage: 'https://randomuser.me/api/portraits/women/12.jpg',
        rating: 5,
        review: 'Michel is a true artist! He transformed my hair and I love it. Very professional and clean shop.',
        date: '1 month ago',
        service: 'Hair Coloring'
      }
    ],

    employeeProfileData: {
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      username: 'Michel.11',
      displayName: 'Michel James',
      followers: 127,
      following: 68,
    },

    // Time Off Requests data (shared with owner)
    timeOffRequests: [] as (EmployeeTimeOffRequest & { employeeId?: number })[],
  },

  // 🏢 OWNER SIDE DATA
  owner: {
    // Dashboard data
    businessData: {
      today: {
        revenue: 19783,
        appointments: 24,
        customers: 18,
        satisfaction: 4.8,
        staffUtilization: 85
      },
      yesterday: {
        revenue: 18250,
        appointments: 22,
        customers: 16,
        satisfaction: 4.6,
        staffUtilization: 78
      }
    },

    scheduleData: [
      { time: '09:00 AM', customer: 'John Smith', service: 'Men\'s Haircut', staff: 'Mike Chen' },
      { time: '10:15 AM', customer: 'Emily Clark', service: 'Color & Style', staff: 'Sarah Johnson' },
      { time: '12:30 PM', customer: 'David Lee', service: 'Beard Trim', staff: 'Mike Chen' },
      { time: '02:00 PM', customer: 'Sophia Patel', service: 'Blowout', staff: 'Emma Davis' },
      { time: '03:30 PM', customer: 'Michael Brown', service: 'Men\'s Haircut', staff: 'Alex Rodriguez' },
    ],

    analytics: {
      totalRevenue: 19783,
      totalAppointments: 24,
      totalCustomers: 18,
      averageSatisfaction: 4.8,
      staffUtilization: 85,
      revenueGrowth: 8.4,
      appointmentGrowth: 9.1,
      customerGrowth: 12.5,
      satisfactionGrowth: 4.3
    },

    // Staff Management data
    staffMembers: [
      {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Manager',
        email: 'sarah@manscavesalon.com',
        phone: '+1 (555) 123-4567',
        avatar: null as string | null,
        hourlyRate: 25,
        workingHours: '9:00 AM - 6:00 PM',
        appointmentsHandled: 45,
        revenueGenerated: 2250,
        rating: 4.8,
        isActive: true
      },
      {
        id: 2,
        name: 'Mike Chen',
        role: 'Senior Stylist',
        email: 'mike@manscavesalon.com',
        phone: '+1 (555) 234-5678',
        avatar: null as string | null,
        hourlyRate: 22,
        workingHours: '10:00 AM - 7:00 PM',
        appointmentsHandled: 38,
        revenueGenerated: 1980,
        rating: 4.7,
        isActive: true
      },
      {
        id: 3,
        name: 'Emily Rodriguez',
        role: 'Junior Stylist',
        email: 'emily@manscavesalon.com',
        phone: '+1 (555) 345-6789',
        avatar: null as string | null,
        hourlyRate: 18,
        workingHours: '11:00 AM - 8:00 PM',
        appointmentsHandled: 28,
        revenueGenerated: 1440,
        rating: 4.5,
        isActive: true
      }
    ],

    // Customer data
    customers: [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        totalAppointments: 12,
        totalSpent: 480,
        lastVisit: '2024-01-15',
        status: 'active' as const,
        preferences: ['Men\'s Haircut', 'Beard Trim']
      },
      {
        id: '2',
        name: 'Emily Clark',
        email: 'emily.clark@email.com',
        phone: '+1 (555) 234-5678',
        totalAppointments: 8,
        totalSpent: 320,
        lastVisit: '2024-01-14',
        status: 'active' as const,
        preferences: ['Color & Style', 'Blowout']
      },
      {
        id: '3',
        name: 'David Lee',
        email: 'david.lee@email.com',
        phone: '+1 (555) 345-6789',
        totalAppointments: 15,
        totalSpent: 600,
        lastVisit: '2024-01-16',
        status: 'active' as const,
        preferences: ['Men\'s Haircut', 'Beard Trim', 'Styling']
      }
    ],

    // Revenue data
    revenueData: {
      daily: 19783,
      weekly: 138481,
      monthly: 593640,
      yearly: 7123680,
      growth: 8.4,
      breakdown: {
        services: 15826,
        products: 3957
      }
    },

    // Reports data
    reports: [
      {
        id: '1',
        title: 'Monthly Revenue Report',
        type: 'revenue' as const,
        period: 'January 2024',
        generatedAt: '2024-01-31T23:59:59Z',
        data: {
          totalRevenue: 593640,
          totalAppointments: 720,
          averageAppointmentValue: 825,
          topServices: ['Men\'s Haircut', 'Color & Style', 'Beard Trim']
        }
      },
      {
        id: '2',
        title: 'Staff Performance Report',
        type: 'staff' as const,
        period: 'January 2024',
        generatedAt: '2024-01-31T23:59:59Z',
        data: {
          totalStaff: 8,
          averageRating: 4.7,
          topPerformer: 'Sarah Johnson',
          totalHours: 1280
        }
      }
    ],

    // Notifications data
    notifications: [
      {
        id: '1',
        title: 'New Appointment Booking',
        message: 'John Smith booked a Men\'s Haircut for tomorrow at 2:00 PM',
        time: '2 minutes ago',
        type: 'booking' as const,
        isRead: false
      },
      {
        id: '2',
        title: 'Staff Schedule Update',
        message: 'Mike Chen requested time off for next Friday',
        time: '1 hour ago',
        type: 'schedule' as const,
        isRead: false
      },
      {
        id: '3',
        title: 'Revenue Target Reached',
        message: 'Congratulations! You\'ve reached 90% of your daily revenue target',
        time: '3 hours ago',
        type: 'achievement' as const,
        isRead: true
      }
    ],

    // Business settings
    businessSettings: {
      businessName: 'Man\'s Cave Salon',
      address: '123 Main Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@manscavesalon.com',
      hours: {
        monday: '9:00 AM - 8:00 PM',
        tuesday: '9:00 AM - 8:00 PM',
        wednesday: '9:00 AM - 8:00 PM',
        thursday: '9:00 AM - 8:00 PM',
        friday: '9:00 AM - 9:00 PM',
        saturday: '9:00 AM - 9:00 PM',
        sunday: '10:00 AM - 6:00 PM'
      },
      services: ['Men\'s Haircut', 'Beard Trim', 'Color & Style', 'Blowout', 'Styling'],
      policies: {
        cancellationPolicy: '24 hours notice required',
        refundPolicy: 'Full refund within 48 hours',
        latePolicy: '15 minute grace period'
      }
    },

    // Payroll data
    employeePayrolls: [
      {
        id: '1',
        name: 'Sarah Johnson',
        position: 'Senior Stylist',
        grossSalary: 3500,
        overtime: 200,
        bonus: 500,
        commission: 800,
        federalTax: 450,
        stateTax: 180,
        localTax: 70,
        healthInsurance: 120,
        retirement: 200,
        otherDeductions: 50,
        netPay: 4000,
        payDate: 'Dec 15, 2024',
        paymentMethod: 'Direct Deposit',
        status: 'approved' as const
      },
      {
        id: '2',
        name: 'Mike Chen',
        position: 'Barber',
        grossSalary: 3200,
        overtime: 150,
        bonus: 300,
        commission: 600,
        federalTax: 400,
        stateTax: 160,
        localTax: 60,
        healthInsurance: 120,
        retirement: 180,
        otherDeductions: 30,
        netPay: 3600,
        payDate: 'Dec 15, 2024',
        paymentMethod: 'Direct Deposit',
        status: 'pending' as const
      },
      {
        id: '3',
        name: 'Emma Davis',
        position: 'Junior Stylist',
        grossSalary: 2800,
        overtime: 100,
        bonus: 200,
        commission: 400,
        federalTax: 350,
        stateTax: 140,
        localTax: 50,
        healthInsurance: 120,
        retirement: 150,
        otherDeductions: 20,
        netPay: 3000,
        payDate: 'Dec 15, 2024',
        paymentMethod: 'Check',
        status: 'approved' as const
      }
    ],

    // Revenue data by period
    revenueDataByPeriod: {
      day: {
        totalRevenue: 2500,
        netProfit: 1800,
        expenses: 700,
        grossMargin: 72,
        outstandingPayments: 300,
        avgTransactionValue: 125,
        customersServed: 20,
        revenuePerCustomer: 125,
        futureBookingsValue: 5000,
        recurringRevenue: 800
      },
      week: {
        totalRevenue: 17500,
        netProfit: 12600,
        expenses: 4900,
        grossMargin: 72,
        outstandingPayments: 2100,
        avgTransactionValue: 125,
        customersServed: 140,
        revenuePerCustomer: 125,
        futureBookingsValue: 35000,
        recurringRevenue: 5600
      },
      month: {
        totalRevenue: 75000,
        netProfit: 54000,
        expenses: 21000,
        grossMargin: 72,
        outstandingPayments: 9000,
        avgTransactionValue: 130,
        customersServed: 577,
        revenuePerCustomer: 130,
        futureBookingsValue: 150000,
        recurringRevenue: 24000
      },
      year: {
        totalRevenue: 1450000,
        netProfit: 986000,
        expenses: 464000,
        grossMargin: 68,
        outstandingPayments: 95000,
        avgTransactionValue: 130,
        customersServed: 11150,
        revenuePerCustomer: 130,
        futureBookingsValue: 180000,
        recurringRevenue: 60000
      }
    },

    // Service revenue breakdown
    serviceRevenue: [
      { name: 'Haircuts', revenue: 45000, percentage: 36, color: '#4CAF50' },
      { name: 'Coloring', revenue: 35000, percentage: 28, color: '#2196F3' },
      { name: 'Styling', revenue: 25000, percentage: 20, color: '#FF9800' },
      { name: 'Products', revenue: 15000, percentage: 12, color: '#9C27B0' },
      { name: 'Other', revenue: 5000, percentage: 4, color: '#607D8B' }
    ],

    // Employee revenue performance
    employeeRevenue: [
      { name: 'Sarah Johnson', revenue: 25000, customers: 180, avatar: '👩‍💼' },
      { name: 'Mike Chen', revenue: 22000, customers: 165, avatar: '👨‍💼' },
      { name: 'Emma Davis', revenue: 20000, customers: 150, avatar: '👩‍🎨' },
      { name: 'Alex Rodriguez', revenue: 18000, customers: 135, avatar: '👨‍🎨' }
    ],

    // Top customers
    topCustomers: [
      { name: 'John Smith', totalSpent: 2500, visits: 15, lastVisit: '2 days ago', avatar: '👨‍💼' },
      { name: 'Sarah Wilson', totalSpent: 2200, visits: 12, lastVisit: '1 week ago', avatar: '👩‍💼' },
      { name: 'Mike Johnson', totalSpent: 1800, visits: 10, lastVisit: '3 days ago', avatar: '👨‍🎨' },
      { name: 'Emma Davis', totalSpent: 1600, visits: 8, lastVisit: '1 week ago', avatar: '👩‍🎨' }
    ],

    // Client Appointment Analysis Data
    clientAppointments: [
      {
        id: '1',
        clientName: 'Sarah Johnson',
        service: 'Haircut & Style',
        staff: 'Emma Davis',
        date: '2024-01-15',
        time: '10:00 AM',
        duration: 60,
        status: 'completed' as const,
        revenue: 85,
        clientType: 'returning' as const
      },
      {
        id: '2',
        clientName: 'Mike Chen',
        service: 'Hair Color',
        staff: 'Alex Rodriguez',
        date: '2024-01-15',
        time: '2:00 PM',
        duration: 120,
        status: 'completed' as const,
        revenue: 120,
        clientType: 'new' as const
      },
      {
        id: '3',
        clientName: 'Emma Wilson',
        service: 'Beard Trim',
        staff: 'Sarah Wilson',
        date: '2024-01-16',
        time: '11:30 AM',
        duration: 30,
        status: 'upcoming' as const,
        revenue: 45,
        clientType: 'returning' as const
      }
    ],

    clientAnalysis: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@email.com',
        phone: '+1-555-0123',
        totalAppointments: 12,
        totalSpent: 1020,
        lastVisit: '2024-01-15',
        averageRating: 4.8,
        preferredServices: ['Haircut & Style', 'Hair Color'],
        clientType: 'returning' as const
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@email.com',
        phone: '+1-555-0456',
        totalAppointments: 3,
        totalSpent: 360,
        lastVisit: '2024-01-15',
        averageRating: 4.6,
        preferredServices: ['Hair Color', 'Styling'],
        clientType: 'new' as const
      }
    ],

    serviceAnalysis: [
      { name: 'Haircut & Style', appointments: 25, revenue: 2125, averageDuration: 60, popularity: 40 },
      { name: 'Hair Color', appointments: 15, revenue: 1800, averageDuration: 120, popularity: 25 },
      { name: 'Beard Trim', appointments: 20, revenue: 900, averageDuration: 30, popularity: 20 },
      { name: 'Full Service', appointments: 10, revenue: 1200, averageDuration: 90, popularity: 15 }
    ],

    staffAnalysis: [
      { id: '1', name: 'Emma Davis', appointments: 30, revenue: 2550, utilization: 85, rating: 4.8 },
      { id: '2', name: 'Alex Rodriguez', appointments: 25, revenue: 2025, utilization: 75, rating: 4.6 },
      { id: '3', name: 'Sarah Wilson', appointments: 20, revenue: 1800, utilization: 70, rating: 4.7 }
    ],

    // Owner profile posts data
    ownerProfilePosts: [
      {
        id: '1',
        type: 'image',
        content: 'New haircut styles available! Book your appointment today.',
        imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&h=200&fit=crop&crop=center',
        likes: 24,
        comments: 8,
        timestamp: '2 hours ago',
        isPromotion: false
      },
      {
        id: '2',
        type: 'video',
        content: 'Behind the scenes of our premium styling service',
        videoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=200&fit=crop&crop=center',
        likes: 45,
        comments: 12,
        timestamp: '1 day ago',
        isPromotion: true
      },
      {
        id: '3',
        type: 'text',
        content: 'We\'re excited to announce our new location opening next month! Stay tuned for more updates.',
        likes: 18,
        comments: 5,
        timestamp: '3 days ago',
        isPromotion: false
      }
    ],

    // Owner profile data
    ownerProfile: {
      name: "Man's Cave Salon",
      handle: "@manscave_salon",
      bio: "Premium men's hair salon specializing in modern cuts and styling. Book your appointment today!",
      updatedAt: new Date().toISOString(),
    },

    // Customer reviews data
    // Schedule Management data
    scheduleRequests: [
      {
        id: 'req-1',
        staffId: 2,
        staffName: 'Mike Chen',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        notes: 'Available for full day',
        status: 'pending' as const,
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'req-2',
        staffId: 3,
        staffName: 'Emily Rodriguez',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '18:00',
        notes: 'Prefer later start time',
        status: 'pending' as const,
        requestedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ] as StaffScheduleRequest[],

    approvedSchedules: [
      {
        id: 'schedule-1',
        staffId: 1,
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '18:00',
        status: 'scheduled' as const,
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        updatedAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        id: 'schedule-2',
        staffId: 2,
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '19:00',
        status: 'scheduled' as const,
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        updatedAt: new Date(Date.now() - 604800000).toISOString(),
      },
    ] as ApprovedStaffSchedule[],

    // Time Off Requests data
    timeOffRequests: [
      {
        id: 'timeoff-1',
        employeeId: 2,
        type: 'vacation',
        startDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
        duration: 'multiple_days',
        reason: 'Family vacation trip',
        notes: 'Planning a family trip to the mountains',
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'timeoff-2',
        employeeId: 3,
        type: 'sick',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        duration: 'full_day',
        reason: 'Medical appointment',
        notes: 'Need to visit doctor for annual checkup',
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'timeoff-3',
        employeeId: 1,
        type: 'personal',
        startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        duration: 'half_day',
        halfDayPeriod: 'AM',
        reason: 'Personal errands',
        notes: 'Need to handle some personal matters in the morning',
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ] as (EmployeeTimeOffRequest & { employeeId?: number })[],

    customerReviews: [
      {
        id: 1,
        customerName: 'Sarah Johnson',
        avatar: '👩',
        rating: 5,
        service: 'Hair Cut & Style',
        staff: 'Mike Chen',
        date: '2 hours ago',
        comment: 'Absolutely amazing experience! Mike really listened to what I wanted and delivered beyond my expectations. The salon has a great atmosphere and the staff is very professional.',
        verified: true
      },
      {
        id: 2,
        customerName: 'Emma Rodriguez',
        avatar: '👩‍🦱',
        rating: 4,
        service: 'Hair Color',
        staff: 'Sarah Wilson',
        date: '5 hours ago',
        comment: 'Great color job! Sarah was very knowledgeable and helped me choose the perfect shade. The salon is clean and modern.',
        verified: true
      },
      {
        id: 3,
        customerName: 'David Kim',
        avatar: '👨',
        rating: 5,
        service: 'Beard Trim',
        staff: 'Alex Rodriguez',
        date: '1 day ago',
        comment: 'Perfect beard trim! Alex is a true professional. Quick service and excellent results.',
        verified: false
      },
      {
        id: 4,
        customerName: 'Lisa Thompson',
        avatar: '👩‍💼',
        rating: 5,
        service: 'Hair Wash & Blow Dry',
        staff: 'Sarah Wilson',
        date: '3 days ago',
        comment: 'Perfect blow dry! Sarah really knows how to work with my hair type. The salon has a relaxing vibe and the products they use smell amazing.',
        verified: true
      },
      {
        id: 5,
        customerName: 'Maria Garcia',
        avatar: '👩‍🦳',
        rating: 3,
        service: 'Full Service Package',
        staff: 'Mike Chen',
        date: '5 days ago',
        comment: 'The service was okay, but I had to wait longer than expected. The final result was good though.',
        verified: true
      },
      {
        id: 6,
        customerName: 'Jennifer Lee',
        avatar: '👩‍🎨',
        rating: 5,
        service: 'Highlights',
        staff: 'Sarah Wilson',
        date: '1 week ago',
        comment: 'Best highlights I\'ve ever had! Sarah is incredibly talented. The salon is beautiful and the staff is friendly. Highly recommend!',
        verified: true
      },
      {
        id: 7,
        customerName: 'Amanda Brown',
        avatar: '👩‍💼',
        rating: 4,
        service: 'Perm & Style',
        staff: 'Mike Chen',
        date: '1 week ago',
        comment: 'Great perm! The curls turned out exactly how I wanted. Mike was very professional and explained everything clearly.',
        verified: true
      },
      {
        id: 8,
        customerName: 'Rachel Smith',
        avatar: '👩‍🦰',
        rating: 5,
        service: 'Hair Cut',
        staff: 'Sarah Wilson',
        date: '2 weeks ago',
        comment: 'Love my new haircut! Sarah really understood my vision and made it even better. The salon has a great atmosphere and everyone is so welcoming.',
        verified: true
      }
    ],

    // Revenue trend data
    revenueTrendData: {
      monthlyRevenue: [8500, 9200, 8800, 10500, 11200, 9800, 12500, 11800, 13200, 12800, 14100, 12500],
      periods: [
        { key: 'day', label: 'Today' },
        { key: 'week', label: 'Week' },
        { key: 'month', label: 'Month' },
        { key: 'quarter', label: 'Quarter' },
        { key: 'year', label: 'Year' }
      ],
      currentYearRevenue: 14100,
      previousYearRevenue: 8500,
      yearOverYearChange: '65.9'
    },

    // Marketing Campaigns data
    marketingCampaigns: [
      {
        id: 'campaign-1',
        name: 'Spring Special',
        offerType: 'discount',
        offerName: 'Spring Special 20% Off Haircuts',
        discount: '20',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: 'active',
        message: 'Get 20% off on all haircuts this spring! Book now and save. Limited time offer.',
        photos: [],
        logo: '',
        posterImage: '',
        sharePlatforms: ['facebook', 'instagram'],
        autoRespond: true,
        responseMessage: 'Thank you for your interest! We\'ll get back to you soon.',
        views: 1245,
        clicks: 342,
        conversions: 28,
        revenue: 2850,
        boostBudget: 150,
        boostEnabled: true,
        spent: 120,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'campaign-2',
        name: 'Loyalty Rewards Program',
        offerType: 'loyalty',
        offerName: 'Earn Double Points',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        message: 'Join our loyalty program and earn double points on all services this month!',
        photos: [],
        logo: '',
        posterImage: '',
        sharePlatforms: ['facebook', 'twitter', 'whatsapp'],
        autoRespond: true,
        responseMessage: 'Thank you for your interest!',
        views: 892,
        clicks: 234,
        conversions: 45,
        revenue: 4520,
        boostBudget: 200,
        boostEnabled: true,
        spent: 185,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'campaign-3',
        name: 'Referral Bonus',
        offerType: 'referral',
        offerName: 'Refer a Friend, Get $10 Off',
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        message: 'Refer a friend and both of you get $10 off your next appointment!',
        photos: [],
        logo: '',
        posterImage: '',
        sharePlatforms: ['email', 'sms'],
        autoRespond: false,
        views: 567,
        clicks: 156,
        conversions: 32,
        revenue: 3120,
        boostBudget: 100,
        boostEnabled: false,
        spent: 0,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'campaign-4',
        name: 'Winter Sale',
        offerType: 'discount',
        offerName: 'Winter Sale 30% Off All Services',
        discount: '30',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'completed',
        message: 'Winter sale with 30% off on all services. Great success!',
        photos: [],
        logo: '',
        posterImage: '',
        sharePlatforms: ['facebook', 'instagram', 'twitter'],
        autoRespond: true,
        responseMessage: 'Thank you for your interest!',
        views: 3456,
        clicks: 1023,
        conversions: 156,
        revenue: 12450,
        boostBudget: 300,
        boostEnabled: true,
        spent: 285,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'campaign-5',
        name: 'Holiday Special',
        offerType: 'discount',
        offerName: 'Holiday Special 25% Off',
        discount: '25',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'completed',
        message: 'Holiday special promotion for the festive season.',
        photos: [],
        logo: '',
        posterImage: '',
        sharePlatforms: ['facebook', 'instagram'],
        autoRespond: true,
        views: 2890,
        clicks: 892,
        conversions: 128,
        revenue: 9870,
        boostBudget: 250,
        boostEnabled: true,
        spent: 220,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'campaign-6',
        name: 'Grand Opening',
        offerType: 'discount',
        offerName: 'Grand Opening 50% Off First Visit',
        discount: '50',
        startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'completed',
        message: 'Grand opening special - 50% off for first-time customers!',
        photos: [],
        logo: '',
        posterImage: '',
        sharePlatforms: ['facebook', 'instagram', 'twitter', 'whatsapp'],
        autoRespond: true,
        views: 5234,
        clicks: 1876,
        conversions: 234,
        revenue: 15680,
        boostBudget: 500,
        boostEnabled: true,
        spent: 450,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ] as MarketingCampaign[],

    // Booking preferences
    bookingPreferences: {
      allowOnlineBooking: true,
      autoConfirmBooking: false,
      allowSameDayBooking: false,
      allowWaitlist: false,
      allowAdvanceBooking: true,
      maxAdvanceDays: 30,
      allowCancellation: true,
      cancellationHours: 24,
      allowRescheduling: true,
      requireDeposit: false,
      depositPercentage: 20,
      waitlistMax: 10,
    } as BookingPreferences,

    // Banking information
    bankAccounts: [
      {
        id: 'bank-1',
        businessId: 'business_001',
        bankName: 'Chase Bank',
        accountNumber: '1234',
        routingNumber: '021000021',
        accountHolderName: 'Man\'s Cave Salon LLC',
        accountType: 'checking' as const,
        isPrimary: true,
        isVerified: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'bank-2',
        businessId: 'business_001',
        bankName: 'Bank of America',
        accountNumber: '5678',
        routingNumber: '026009593',
        accountHolderName: 'Man\'s Cave Salon LLC',
        accountType: 'savings' as const,
        isPrimary: false,
        isVerified: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ] as BankAccount[],

    paymentMethods: [
      {
        id: 'pm-1',
        businessId: 'business_001',
        name: 'Credit/Debit Cards',
        type: 'card' as const,
        enabled: true,
        icon: 'card',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pm-2',
        businessId: 'business_001',
        name: 'PayPal',
        type: 'paypal' as const,
        enabled: true,
        icon: 'logo-paypal',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pm-3',
        businessId: 'business_001',
        name: 'Apple Pay',
        type: 'apple_pay' as const,
        enabled: false,
        icon: 'logo-apple',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pm-4',
        businessId: 'business_001',
        name: 'Google Pay',
        type: 'google_pay' as const,
        enabled: false,
        icon: 'logo-google',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ] as BusinessPaymentMethod[],

    payoutSettings: {
      businessId: 'business_001',
      autoPayouts: true,
      schedule: 'weekly' as const,
      minimumThreshold: 10000, // $100.00 in cents
      emailNotifications: true,
      smsNotifications: false,
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    } as PayoutSettings,

    paymentTransactions: [
      {
        id: 'txn-1',
        bookingId: 'booking-1',
        customerName: 'John Smith',
        amount: 12500, // $125.00 in cents
        method: 'Credit Card',
        status: 'completed' as const,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'txn-2',
        bookingId: 'booking-2',
        customerName: 'Sarah Johnson',
        amount: 8550, // $85.50 in cents
        method: 'PayPal',
        status: 'completed' as const,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'txn-3',
        bookingId: 'booking-3',
        customerName: 'Mike Chen',
        amount: 20000, // $200.00 in cents
        method: 'Credit Card',
        status: 'completed' as const,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ] as PaymentTransaction[],

    // Staff Management Settings
    staffManagementSettings: {
      businessId: 'business_001',
      roles: [
        {
          roleKey: 'admin',
          name: 'Admin',
          permissions: {
            manageAppointments: true,
            manageStaff: true,
            viewReports: true,
            manageSettings: true,
          },
        },
        {
          roleKey: 'manager',
          name: 'Manager',
          permissions: {
            manageAppointments: true,
            manageStaff: false,
            viewReports: true,
            manageSettings: false,
          },
        },
        {
          roleKey: 'stylist',
          name: 'Stylist',
          permissions: {
            manageAppointments: false,
            manageStaff: false,
            viewReports: false,
            manageSettings: false,
          },
        },
        {
          roleKey: 'receptionist',
          name: 'Receptionist',
          permissions: {
            manageAppointments: true,
            manageStaff: false,
            viewReports: true,
            manageSettings: false,
          },
        },
      ],
      schedulingDefaults: {
        defaultShiftDuration: 8,
        maxAppointmentsPerDay: 15,
        bufferTimeBetweenAppointments: 15,
        allowOvertime: true,
        allowSelfScheduling: false,
      },
      notificationSettings: {
        notifyNewAppointments: true,
        notifyCancellations: true,
        notifyScheduleChanges: true,
      },
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    } as StaffManagementSettings,

    // General Settings
    generalSettings: {
      businessId: 'business_001',
      businessInfo: {
        name: "Man's Cave Salon",
        type: "Hair Salon & Barber Shop",
        phone: "+1 (555) 123-4567",
        email: "info@manscavesalon.com",
        website: "www.manscavesalon.com",
        taxId: "TAX123456789",
        industry: "Beauty & Personal Care",
        currency: "CAD",
        language: "English",
      },
      locationInfo: {
        address: "123 Main Street, New York, NY 10001",
        workingHours: {
          monday: "9:00 AM - 7:00 PM",
          tuesday: "9:00 AM - 7:00 PM",
          wednesday: "9:00 AM - 7:00 PM",
          thursday: "9:00 AM - 7:00 PM",
          friday: "9:00 AM - 8:00 PM",
          saturday: "9:00 AM - 6:00 PM",
          sunday: "10:00 AM - 4:00 PM",
        },
      },
      brandingInfo: {
        tagline: "Where Style Meets Tradition",
        description: "Premium hair salon and barber shop offering modern cuts with classic techniques.",
        primaryColor: "#000000",
        secondaryColor: "#666666",
      },
      policiesInfo: {
        cancellationPolicy: "24 hours notice required",
        refundPolicy: "Full refund within 48 hours",
        serviceDefaults: "Standard service duration: 60 minutes",
      },
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    } as GeneralSettings,

    // Owner Notification Settings
    ownerNotificationSettings: {
      businessId: 'business_001',
      emailNotifications: true,
      pushNotifications: true,
      appointmentBooked: true,
      appointmentCancelled: true,
      appointmentReminder: true,
      paymentReceived: true,
      staffScheduleChange: true,
      customerReview: true,
      immediateNotifications: true,
      dailySummary: false,
      lowInventory: false,
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    } as OwnerNotificationSettings,

    // Owner Security Settings
    ownerSecuritySettings: {
      businessId: 'business_001',
      userId: 'owner_001',
      twoFactorAuth: false,
      biometricLogin: true,
      sessionTimeout: true,
      sessionTimeoutMinutes: 30,
      loginNotifications: true,
      deviceManagement: true,
      devices: [
        {
          id: 'device_001',
          name: 'iPhone 14 Pro',
          type: 'phone',
          location: 'New York, NY',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          isCurrent: true,
          ipAddress: '192.168.1.100',
        },
        {
          id: 'device_002',
          name: 'MacBook Pro',
          type: 'laptop',
          location: 'New York, NY',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          isCurrent: false,
          ipAddress: '192.168.1.101',
        },
        {
          id: 'device_003',
          name: 'iPad Air',
          type: 'tablet',
          location: 'New York, NY',
          lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          isCurrent: false,
          ipAddress: '192.168.1.102',
        },
      ],
      recoveryOptions: {
        backupEmail: 'john.doe@manscave.com',
        recoveryPhone: '+1 (555) 123-4567',
        isEmailVerified: true,
        isPhoneVerified: true,
      },
      passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      passwordExpiresInDays: 90,
      lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastSecurityUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    } as OwnerSecuritySettings,
  },

  // Booking confirmation data
  bookingConfirmation: {
    // Service mapping for booking confirmation
    serviceMappings: {
      'haircut': {
        id: '1',
        name: 'Haircut & Styling',
        duration: '45 min',
        price: 35,
        description: 'Professional haircut with styling',
      },
      'beard': {
        id: '2',
        name: 'Beard Trim',
        duration: '20 min',
        price: 15,
        description: 'Beard shaping and trimming',
      },
      'haircut_beard': {
        id: '3',
        name: 'Haircut & Beard Combo',
        duration: '60 min',
        price: 45,
        description: 'Complete haircut and beard styling',
      },
      'long_hair': {
        id: '4',
        name: 'Long Hair Styling',
        duration: '50 min',
        price: 40,
        description: 'Professional long hair styling',
      },
      'styling': {
        id: '5',
        name: 'Hair Styling',
        duration: '30 min',
        price: 25,
        description: 'Professional hair styling',
      },
      'facial': {
        id: '6',
        name: 'Facial Treatment',
        duration: '40 min',
        price: 30,
        description: 'Complete facial treatment',
      },
      'coloring': {
        id: '7',
        name: 'Hair Coloring',
        duration: '90 min',
        price: 60,
        description: 'Professional hair coloring',
      },
      'kids_haircut': {
        id: '8',
        name: 'Kids Haircut',
        duration: '30 min',
        price: 20,
        description: 'Professional kids haircut',
      },
      'head_massage': {
        id: '9',
        name: 'Head Massage',
        duration: '25 min',
        price: 25,
        description: 'Relaxing head massage',
      },
      'cuts_fades': {
        id: '10',
        name: 'Cuts and Fades',
        duration: '50 min',
        price: 40,
        description: 'Professional cuts and fades',
      },
      'perm': {
        id: '11',
        name: 'Perm',
        duration: '120 min',
        price: 80,
        description: 'Professional perm treatment',
      },
      'straightening': {
        id: '12',
        name: 'Hair Straightening',
        duration: '90 min',
        price: 70,
        description: 'Professional hair straightening',
      },
      'shave': {
        id: '13',
        name: 'Shave',
        duration: '15 min',
        price: 12,
        description: 'Professional shave service',
      },
      'eyebrow': {
        id: '14',
        name: 'Eyebrow Shaping',
        duration: '15 min',
        price: 10,
        description: 'Professional eyebrow shaping',
      },
      'threading': {
        id: '15',
        name: 'Threading',
        duration: '20 min',
        price: 15,
        description: 'Professional threading service',
      },
      'waxing': {
        id: '16',
        name: 'Waxing',
        duration: '30 min',
        price: 25,
        description: 'Professional waxing service',
      },
      'spa': {
        id: '17',
        name: 'Spa Treatment',
        duration: '60 min',
        price: 50,
        description: 'Relaxing spa treatment',
      },
      'bridal': {
        id: '18',
        name: 'Bridal Styling',
        duration: '120 min',
        price: 100,
        description: 'Special bridal styling service',
      },
      'makeup': {
        id: '19',
        name: 'Makeup',
        duration: '45 min',
        price: 35,
        description: 'Professional makeup service',
      },
      'hair_treatment': {
        id: '20',
        name: 'Hair Treatment',
        duration: '60 min',
        price: 45,
        description: 'Professional hair treatment',
      },
      'scalp': {
        id: '21',
        name: 'Scalp Care',
        duration: '30 min',
        price: 25,
        description: 'Professional scalp care',
      },
      'nails': {
        id: '22',
        name: 'Nail Care',
        duration: '30 min',
        price: 25,
        description: 'Professional nail care service',
      },
      'tattoo': {
        id: '23',
        name: 'Tattoo',
        duration: '120 min',
        price: 150,
        description: 'Professional tattoo service',
      },
      'piercing': {
        id: '24',
        name: 'Piercing',
        duration: '30 min',
        price: 40,
        description: 'Professional piercing service',
      },
    },

    // Default booking values
    defaultBooking: {
      barberName: 'Shark.11',
      barberPhoto: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center',
      salonName: "Man's Cave Salon",
      selectedDate: 'Tomorrow',
      selectedTime: '11:30 AM',
      source: 'all-slots',
      location: '9785, 132St, Vancouver',
      contact: '(555) 123-4567',
      salonImage: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop',
    },

    // Loyalty points data
    loyaltyData: {
      currentPoints: DEFAULT_POINTS_CONFIG.CURRENT_POINTS,
      recentActivity: [
        { date: 'Dec 15', activity: '+50 points - Haircut', type: 'earned' as const, points: 50 },
        { date: 'Dec 10', activity: '+25 points - Beard Trim', type: 'earned' as const, points: 25 },
        { date: 'Dec 8', activity: '-500 points - $5 Off Reward', type: 'redeemed' as const, points: 500 },
        { date: 'Dec 1', activity: '+35 points - Haircut', type: 'earned' as const, points: 35 },
      ],
      monthlyStats: {
        totalEarned: 110,
        totalRedeemed: 500,
      },
    },
  }
};

// ===========================================
// CONVENIENCE EXPORTS FOR BACKWARD COMPATIBILITY
// ===========================================

export const customerData = AppMockData.customer;
export const employeeData = AppMockData.employee;
export const ownerData = AppMockData.owner;
