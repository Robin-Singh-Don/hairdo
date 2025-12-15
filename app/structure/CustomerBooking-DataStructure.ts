// ========================================
// CUSTOMER BOOKING DATA STRUCTURES
// ========================================
// Frontend DTOs for customer booking, appointment, and payment flows
// These are optimized for React components and API responses
// ========================================

import { User, BookingStatus, PaymentStatus, Rating } from './Shared-DataStructure';
import { BookingCore, BookingServiceSnapshot, BookingReview, Payment } from './Database-Schema';

// ========================================
// 1. AGGREGATED BOOKING INTERFACES (Frontend DTOs)
// ========================================

/**
 * Complete booking with all related data
 * This is what you get from Supabase joins for detailed views
 */
export interface Booking {
    // Core booking data
    core: BookingCore;
    
    // Related data (populated via Supabase joins)
    services: BookingServiceSnapshot[];
    review?: BookingReview;
    payments: Payment[];
    
    // Display data (computed from joins)
    salonName: string;
    salonImage: string;
    employeeName: string;
    employeeImage: string;
    customerName: string;
    customerImage: string;
    
    // Computed fields
    duration: number;               // Total duration in minutes
    serviceNames: string[];         // Array of service names
    canCancel: boolean;             // Can customer cancel this booking?
    canReschedule: boolean;         // Can customer reschedule this booking?
    canReview: boolean;             // Can customer review this booking?
}

/**
 * Service details for display
 * This is a frontend-friendly version of BookingServiceSnapshot
 */
export interface BookingService {
    id: string;                     // Service ID
    name: string;                   // Service name (e.g., "Haircut", "Beard Trim")
    description?: string;           // Service description
    duration: number;               // Service duration in minutes
    price: number;                  // Service price in cents
    category: string;               // Service category (e.g., "Hair", "Beard")
    isPopular?: boolean;            // Is this a popular service?
}

// ========================================
// 2. BOOKING DISPLAY INTERFACES
// ========================================

/**
 * Simplified booking for list displays
 * Used in "My Bookings" and appointment history
 */
export interface BookingSummary {
    id: string;
    salonName: string;
    salonImage: string;
    employeeName: string;
    employeeImage: string;
    serviceNames: string[];         // Array of service names
    scheduledDate: string;          // Date in YYYY-MM-DD format
    scheduledTime: string;          // Time in HH:MM format
    duration: number;               // Duration in minutes
    status: BookingStatus;
    totalPrice: number;             // Price in cents
    canCancel: boolean;             // Can customer cancel this booking?
    canReschedule: boolean;         // Can customer reschedule this booking?
    canReview: boolean;             // Can customer review this booking?
}

/**
 * Upcoming booking for dashboard display
 * Used in customer dashboard and appointment reminders
 */
export interface UpcomingBooking {
    id: string;
    salonName: string;
    salonImage: string;
    employeeName: string;
    employeeImage: string;
    serviceName: string;            // Primary service name
    scheduledDate: string;          // Date in YYYY-MM-DD format
    scheduledTime: string;          // Time in HH:MM format
    duration: number;               // Duration in minutes
    status: BookingStatus;
    totalPrice: number;             // Price in cents
    specialInstructions?: string;
    isToday: boolean;               // Is this booking today?
    isTomorrow: boolean;            // Is this booking tomorrow?
    timeUntilAppointment: string;   // Human readable time (e.g., "2 hours", "Tomorrow")
}

/**
 * Previous booking for history display
 * Used in booking history and past appointments
 */
export interface PreviousBooking {
    id: string;
    salonName: string;
    salonImage: string;
    employeeName: string;
    employeeImage: string;
    serviceName: string;            // Primary service name
    completedDate: string;          // Date when service was completed
    completedTime: string;          // Time when service was completed
    duration: number;               // Duration in minutes
    totalPrice: number;             // Price in cents
    customerRating?: number;        // Customer's rating (1-5)
    customerReview?: string;        // Customer's review text
    canBookAgain: boolean;          // Can customer book this service again?
    canReview: boolean;             // Can customer still review this booking?
}

// ========================================
// 3. BOOKING CREATION INTERFACES
// ========================================

/**
 * Data needed to create a new booking
 * Used in booking confirmation and checkout flow
 * Backend will calculate duration from serviceIds
 */
export interface CreateBookingRequest {
    salonId: string;                // Selected salon
    employeeId: string;             // Selected employee
    serviceIds: string[];           // Selected services (backend calculates duration)
    scheduledDate: string;          // Selected date (YYYY-MM-DD)
    scheduledTime: string;          // Selected time (HH:MM)
    specialInstructions?: string;   // Customer instructions
    inspirationPhotos?: string[];   // Inspiration photos
    paymentMethodId: string;        // Payment method to use
    rewardsUsed?: string[];         // Rewards to apply
    pointsRedeemed?: number;        // Points to redeem
}

/**
 * Available time slot for booking
 * Used in time slot selection
 */
export interface AvailableTimeSlot {
    time: string;                   // Time in HH:MM format
    isAvailable: boolean;           // Is this slot available?
    isBooked: boolean;              // Is this slot already booked?
    duration: number;               // Available duration in minutes
    employeeId?: string;            // Which employee is available
    employeeName?: string;          // Employee name for display
}

/**
 * Available date for booking
 * Used in date selection
 */
export interface AvailableDate {
    date: string;                   // Date in YYYY-MM-DD format
    displayDate: string;            // Display date (e.g., "Today", "Tomorrow", "Mar 15")
    isAvailable: boolean;           // Is this date available?
    availableSlots: number;         // Number of available time slots
    isToday: boolean;               // Is this today?
    isTomorrow: boolean;            // Is this tomorrow?
}

// ========================================
// 4. BOOKING CONFIRMATION INTERFACES
// ========================================

/**
 * Booking confirmation data
 * Used in booking confirmation screen
 */
export interface BookingConfirmation {
    bookingId: string;              // Newly created booking ID
    confirmationNumber: string;     // Human-readable confirmation number
    salonName: string;              // Salon name
    salonAddress: string;           // Salon address
    salonPhone: string;             // Salon phone number
    employeeName: string;           // Employee name
    employeeImage: string;          // Employee image
    services: BookingService[];     // Selected services
    scheduledDate: string;          // Scheduled date
    scheduledTime: string;          // Scheduled time
    duration: number;               // Total duration
    totalPrice: number;             // Total price in cents
    paymentMethod: string;          // Payment method used
    specialInstructions?: string;   // Special instructions
    nextSteps: string[];            // Array of next step instructions
    salonContactInfo: {             // Salon contact information
        phone: string;
        email: string;
        address: string;
    };
}

// ========================================
// 5. BOOKING MANAGEMENT INTERFACES
// ========================================

/**
 * Booking cancellation request
 * Used when customer cancels a booking
 */
export interface CancelBookingRequest {
    bookingId: string;              // Booking to cancel
    reason?: string;                // Cancellation reason
    refundRequested: boolean;       // Does customer want refund?
}

/**
 * Booking reschedule request
 * Used when customer reschedules a booking
 */
export interface RescheduleBookingRequest {
    bookingId: string;              // Booking to reschedule
    newDate: string;                // New date
    newTime: string;                // New time
    reason?: string;                // Reschedule reason
}

/**
 * Booking review submission
 * Used when customer submits a review
 */
export interface BookingReviewSubmission {
    bookingId: string;              // Booking being reviewed
    rating: Rating;                 // Standardized rating (0-5 scale)
    reviewText: string;             // Review text
    photos?: string[];              // Review photos
    isAnonymous: boolean;           // Is review anonymous?
}

// ========================================
// 6. BOOKING FILTERS AND SEARCH
// ========================================

/**
 * Booking filter options
 * Used in booking history and search
 */
export interface BookingFilters {
    status?: BookingStatus[];       // Filter by status
    dateFrom?: string;              // Filter from date
    dateTo?: string;                // Filter to date
    salonId?: string;               // Filter by salon
    employeeId?: string;            // Filter by employee
    serviceId?: string;             // Filter by service
    minPrice?: number;              // Minimum price filter
    maxPrice?: number;              // Maximum price filter
}

/**
 * Booking search parameters
 * Used in booking search functionality
 */
export interface BookingSearchParams {
    query?: string;                 // Search query
    filters: BookingFilters;        // Applied filters
    sortBy?: 'date' | 'price' | 'status' | 'salon';  // Sort option
    sortOrder?: 'asc' | 'desc';    // Sort order
    page?: number;                  // Page number
    limit?: number;                 // Results per page
}

// ========================================
// 7. BOOKING STATISTICS
// ========================================

/**
 * Customer booking statistics
 * Used in customer dashboard and analytics
 */
export interface BookingStats {
    totalBookings: number;          // Total number of bookings
    completedBookings: number;      // Number of completed bookings
    cancelledBookings: number;      // Number of cancelled bookings
    totalSpent: number;             // Total amount spent (in cents)
    averageRating: number;          // Average rating given
    favoriteSalon?: {               // Most frequent salon
        id: string;
        name: string;
        bookingCount: number;
    };
    favoriteService?: {             // Most frequent service
        id: string;
        name: string;
        bookingCount: number;
    };
    lastBookingDate?: string;       // Date of last booking
    nextBookingDate?: string;       // Date of next booking
}

// ========================================
// 8. EXPORT ALL TYPES
// ========================================

// Re-export shared types for convenience
export type { BookingStatus, PaymentStatus } from './Shared-DataStructure';
