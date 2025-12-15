// ========================================
// EMPLOYEE APPOINTMENT DATA STRUCTURES
// ========================================
// Interfaces for employee schedule, appointments, and client management
// Designed for easy backend integration with Supabase
// ========================================

import { User, BookingStatus, BaseProfile, Rating } from './Shared-DataStructure';

// ========================================
// 1. EMPLOYEE PROFILE INTERFACES
// ========================================

/**
 * Employee profile information
 * Extends BaseProfile with employee-specific fields
 * Maps to Supabase employees table
 */
export interface EmployeeProfile extends BaseProfile {
    // Business relationship
    businessId: string;             // UUID - which business they work for
    
    // Professional information
    role: string;                   // Job title (e.g., "Senior Barber", "Stylist")
    specialization: string[];       // Array of specializations (e.g., ["Haircut", "Beard"]) - populated from EmployeeSpecialization table
    experience: number;             // Years of experience
    bio?: string;                   // Professional bio
    certifications?: string[];      // Array of certifications
    
    // Work details
    chairNumber?: string;           // Assigned chair/station number
    hourlyRate?: number;            // Hourly rate in cents
    commissionRate?: number;        // Commission percentage (0-100)
    isAvailable: boolean;           // Is employee available for bookings?
    
    // Performance metrics
    rating: Rating;                 // Standardized rating (0-5 scale)
    totalAppointments: number;      // Total appointments completed
    totalRevenue: number;           // Total revenue generated (in cents)
    
    // Additional timestamps
    lastActiveAt?: string;          // Last active timestamp (ISO string)
}

/**
 * Simplified employee for display purposes
 * Used in dropdowns and selection lists
 */
export interface EmployeeSummary {
    id: string;
    displayName: string;
    username: string;
    profileImage?: string;
    role: string;
    specialization: string[];
    rating: Rating;                 // Standardized rating (0-5 scale)
    isAvailable: boolean;
    chairNumber?: string;
}

// ========================================
// 2. SHIFT AND SCHEDULE INTERFACES
// ========================================

/**
 * Employee shift information
 * Maps to Supabase shifts table
 */
export interface EmployeeShift {
    // Primary identifiers
    id: string;                     // UUID - shift ID
    employeeId: string;             // UUID - employee ID
    businessId: string;             // UUID - business ID
    
    // Shift details
    date: string;                   // Date in YYYY-MM-DD format
    startTime: string;              // Start time in HH:MM format
    endTime: string;                // End time in HH:MM format
    duration: number;               // Duration in minutes
    
    // Shift status
    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    isBreakTime: boolean;           // Is this a break period?
    
    // Location and notes
    location: string;               // Work location (e.g., "Main Salon", "Chair 03")
    notes?: string;                 // Shift notes
    
    // Timestamps
    createdAt: string;              // When shift was created (ISO string)
    updatedAt: string;              // When shift was last updated (ISO string)
    confirmedAt?: string;           // When shift was confirmed (ISO string)
    startedAt?: string;             // When shift started (ISO string)
    endedAt?: string;               // When shift ended (ISO string)
}

/**
 * Employee availability for booking
 * Used in availability management
 */
export interface EmployeeAvailability {
    id: string;                     // UUID - availability ID
    employeeId: string;             // UUID - employee ID
    dayOfWeek: number;              // Day of week (0-6, Sunday = 0)
    startTime: string;              // Available start time (HH:MM)
    endTime: string;                // Available end time (HH:MM)
    isAvailable: boolean;           // Is available during this time?
    breakStartTime?: string;        // Break start time (HH:MM)
    breakEndTime?: string;          // Break end time (HH:MM)
    maxAppointments?: number;       // Maximum appointments during this period
    notes?: string;                 // Availability notes
}

/**
 * Weekly schedule for employee
 * Used in schedule display and management
 */
export interface WeeklySchedule {
    employeeId: string;             // Employee ID
    weekStartDate: string;          // Week start date (YYYY-MM-DD)
    shifts: EmployeeShift[];        // Shifts for the week
    totalHours: number;             // Total scheduled hours
    totalAppointments: number;      // Total appointments scheduled
    availability: EmployeeAvailability[];  // Availability for the week
}

// ========================================
// 3. APPOINTMENT INTERFACES
// ========================================

/**
 * Employee appointment (from employee's perspective)
 * Maps to Supabase appointments table
 */
export interface EmployeeAppointment {
    // Primary identifiers
    id: string;                     // UUID - appointment ID
    employeeId: string;             // UUID - employee ID
    customerId: string;             // UUID - customer ID
    businessId: string;             // UUID - business ID
    
    // Customer information
    customerName: string;           // Customer's full name
    customerPhone: string;          // Customer's phone number
    customerEmail?: string;         // Customer's email
    customerImage?: string;         // Customer's profile image
    
    // Service details
    serviceId: string;              // UUID - service ID
    serviceName: string;            // Service name
    serviceDescription?: string;    // Service description
    duration: number;               // Service duration in minutes
    price: number;                  // Service price in cents
    
    // Scheduling
    scheduledDate: string;          // Date in YYYY-MM-DD format
    scheduledStartTime: string;     // Start time in HH:MM format
    scheduledEndTime: string;       // End time in HH:MM format
    
    // Status and progress
    status: BookingStatus;          // Appointment status
    progress: 'scheduled' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled';
    
    // Service details
    notes?: string;                 // Service notes
    specialRequests?: string;       // Customer special requests
    beforePhotos?: string[];        // Before service photos
    afterPhotos?: string[];         // After service photos
    
    // Payment and pricing
    totalPrice: number;             // Total price in cents
    tipAmount?: number;             // Tip amount in cents
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    
    // Review and feedback
    customerRating?: number;        // Customer's rating (1-5)
    customerReview?: string;        // Customer's review text
    employeeNotes?: string;         // Employee's internal notes
    
    // Timestamps
    createdAt: string;              // When appointment was created (ISO string)
    updatedAt: string;              // When appointment was last updated (ISO string)
    confirmedAt?: string;           // When appointment was confirmed (ISO string)
    checkedInAt?: string;           // When customer checked in (ISO string)
    startedAt?: string;             // When service started (ISO string)
    completedAt?: string;           // When service completed (ISO string)
    cancelledAt?: string;           // When appointment was cancelled (ISO string)
}

/**
 * Appointment summary for list displays
 * Used in appointment lists and dashboards
 */
export interface AppointmentSummary {
    id: string;
    customerName: string;
    customerImage?: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    status: BookingStatus;
    totalPrice: number;
    isToday: boolean;
    isTomorrow: boolean;
    timeUntilAppointment: string;   // Human readable time (e.g., "2 hours", "Tomorrow")
}

// ========================================
// 4. CLIENT MANAGEMENT INTERFACES
// ========================================

/**
 * Client information for employees
 * Used in client management and history
 */
export interface ClientData {
    // Primary identifiers
    id: string;                     // UUID - client ID
    customerId: string;             // UUID - customer ID
    businessId: string;             // UUID - business ID
    
    // Personal information
    name: string;                   // Client's full name
    phone: string;                  // Client's phone number
    email?: string;                 // Client's email
    profileImage?: string;          // Client's profile image
    
    // Client details
    dateOfBirth?: string;           // Date of birth (YYYY-MM-DD)
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    emergencyContact?: string;      // Emergency contact information
    notes?: string;                 // Client notes
    
    // Service history
    totalAppointments: number;      // Total appointments with this client
    lastAppointmentDate?: string;   // Date of last appointment
    nextAppointmentDate?: string;   // Date of next appointment
    totalSpent: number;             // Total amount spent (in cents)
    averageRating: Rating;          // Standardized rating (0-5 scale)
    
    // Preferences
    preferredServices: string[];    // Array of preferred service IDs
    preferredTimeSlots: string[];   // Array of preferred time slots
    specialRequests?: string;       // Special requests or notes
    
    // Status
    isActive: boolean;              // Is client active?
    isVIP: boolean;                 // Is VIP client?
    loyaltyPoints: number;          // Loyalty points balance
    
    // Timestamps
    createdAt: string;              // When client was added (ISO string)
    updatedAt: string;              // Last update (ISO string)
    lastVisitAt?: string;           // Last visit date (ISO string)
}

/**
 * Client appointment history
 * Used in client history screens
 */
export interface ClientAppointmentHistory {
    id: string;
    date: string;                   // Date in YYYY-MM-DD format
    time: string;                   // Time in HH:MM format
    services: string[];             // Array of service names
    employee: string;               // Employee name
    duration: number;               // Duration in minutes
    totalCost: number;              // Total cost in cents
    status: BookingStatus;
    notes?: string;                 // Service notes
    rating?: Rating;                // Standardized rating (0-5 scale)
    review?: string;                // Client's review
    canBookAgain: boolean;          // Can book this service again?
}

// ========================================
// 5. EMPLOYEE DASHBOARD INTERFACES
// ========================================

/**
 * Employee dashboard statistics
 * Used in employee dashboard and analytics
 */
export interface EmployeeDashboardStats {
    // Today's metrics
    todayAppointments: number;      // Appointments today
    todayRevenue: number;           // Revenue today (in cents)
    todayHours: number;             // Hours worked today
    
    // This week's metrics
    weekAppointments: number;       // Appointments this week
    weekRevenue: number;            // Revenue this week (in cents)
    weekHours: number;              // Hours worked this week
    
    // This month's metrics
    monthAppointments: number;      // Appointments this month
    monthRevenue: number;           // Revenue this month (in cents)
    monthHours: number;             // Hours worked this month
    
    // Performance metrics
    averageRating: Rating;          // Standardized rating (0-5 scale)
    customerSatisfaction: number;   // Customer satisfaction percentage
    repeatCustomers: number;        // Number of repeat customers
    
    // Upcoming
    upcomingAppointments: number;   // Upcoming appointments
    nextAppointment?: {             // Next appointment details
        id: string;
        customerName: string;
        serviceName: string;
        scheduledTime: string;
        timeUntil: string;
    };
}

/**
 * Employee notification
 * Used in employee notification system
 */
export interface EmployeeNotification {
    id: string;                     // UUID - notification ID
    employeeId: string;             // UUID - employee ID
    type: 'appointment' | 'schedule' | 'request' | 'message' | 'system' | 'reminder';
    title: string;                  // Notification title
    message: string;                // Notification message
    priority: 'high' | 'medium' | 'low';
    isRead: boolean;                // Has employee read this?
    actionUrl?: string;             // Action URL if applicable
    actionData?: any;               // Additional action data
    createdAt: string;              // When notification was created (ISO string)
    readAt?: string;                // When notification was read (ISO string)
}

// ========================================
// 6. APPOINTMENT MANAGEMENT INTERFACES
// ========================================

/**
 * Appointment update request
 * Used when updating appointment details
 */
export interface UpdateAppointmentRequest {
    appointmentId: string;          // Appointment to update
    status?: BookingStatus;         // New status
    notes?: string;                 // Service notes
    specialRequests?: string;       // Special requests
    beforePhotos?: string[];        // Before photos
    afterPhotos?: string[];         // After photos
    employeeNotes?: string;         // Employee notes
    startedAt?: string;             // When service started
    completedAt?: string;           // When service completed
}

/**
 * Check-in request
 * Used when customer checks in
 */
export interface CheckInRequest {
    appointmentId: string;          // Appointment to check in
    checkInTime: string;            // Check-in time (ISO string)
    notes?: string;                 // Check-in notes
}

/**
 * Service completion request
 * Used when completing a service
 */
export interface CompleteServiceRequest {
    appointmentId: string;          // Appointment to complete
    completedAt: string;            // Completion time (ISO string)
    afterPhotos?: string[];         // After service photos
    employeeNotes?: string;         // Employee notes
    serviceQuality: 'excellent' | 'good' | 'fair' | 'poor';
    customerSatisfaction: 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied';
}

// ========================================
// 7. EXPORT ALL TYPES
// ========================================

// Re-export shared types for convenience
export type { BookingStatus } from './Shared-DataStructure';
