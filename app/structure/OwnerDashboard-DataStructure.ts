// ========================================
// OWNER DASHBOARD DATA STRUCTURES
// ========================================
// Interfaces for owner dashboard, business management, and analytics
// Designed for easy backend integration with Supabase
// ========================================

import { User, BookingStatus, BaseProfile, Rating } from './Shared-DataStructure';

// ========================================
// 1. BUSINESS MANAGEMENT INTERFACES
// ========================================

/**
 * Business profile information
 * Maps to Supabase businesses table
 */
export interface BusinessProfile {
    // Primary identifiers
    id: string;                     // UUID - business ID
    ownerId: string;                // UUID - owner's user ID
    name: string;                   // Business name
    slug: string;                   // URL slug (e.g., "downtown-barbershop")
    
    // Business details
    description?: string;           // Business description
    category: string;               // Business category (e.g., "Barbershop", "Salon")
    phone: string;                  // Business phone number
    email: string;                  // Business email
    website?: string;               // Business website URL
    
    // Location information
    address: string;                // Street address
    city: string;                   // City
    state: string;                  // State/Province
    zipCode: string;                // ZIP/Postal code
    country: string;                // Country
    coordinates?: {                 // GPS coordinates
        lat: number;
        lng: number;
    };
    
    // Business hours
    businessHours: BusinessHours;   // Operating hours
    timezone: string;               // Business timezone
    
    // Branding
    logo?: string;                  // Business logo URL
    coverImage?: string;            // Cover image URL
    primaryColor?: string;          // Primary brand color
    secondaryColor?: string;        // Secondary brand color
    
    // Status and settings
    isActive: boolean;              // Is business active?
    isVerified: boolean;            // Is business verified?
    isPublic: boolean;              // Is business publicly visible?
    
    // Subscription and billing
    subscriptionPlan: 'basic' | 'premium' | 'enterprise';
    subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trial';
    subscriptionExpiresAt?: string; // Subscription expiration date
    
    // Timestamps
    createdAt: string;              // When business was created (ISO string)
    updatedAt: string;              // Last update (ISO string)
    verifiedAt?: string;            // When business was verified (ISO string)
}

/**
 * Business operating hours
 * Used in business profile and scheduling
 */
export interface BusinessHours {
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
}

/**
 * Hours for a specific day
 */
export interface DayHours {
    isOpen: boolean;                // Is business open this day?
    openTime?: string;              // Opening time (HH:MM)
    closeTime?: string;             // Closing time (HH:MM)
    breakStartTime?: string;        // Break start time (HH:MM)
    breakEndTime?: string;          // Break end time (HH:MM)
    notes?: string;                 // Special notes for this day
}

// ========================================
// 2. DASHBOARD METRICS INTERFACES
// ========================================

/**
 * Daily business metrics
 * Used in dashboard KPI cards
 */
export interface DailyMetrics {
    date: string;                   // Date in YYYY-MM-DD format
    revenue: number;                // Revenue in cents
    appointments: number;           // Number of appointments
    customers: number;              // Number of unique customers
    satisfaction: number;           // Average customer satisfaction (0-100)
    staffUtilization: number;       // Staff utilization percentage (0-100)
    walkIns: number;                // Number of walk-in customers
    cancellations: number;          // Number of cancellations
    noShows: number;                // Number of no-shows
    averageAppointmentValue: number; // Average appointment value in cents
    totalHours: number;             // Total staff hours worked
}

/**
 * Weekly business metrics
 * Used in weekly analytics
 */
export interface WeeklyMetrics {
    weekStartDate: string;          // Week start date (YYYY-MM-DD)
    weekEndDate: string;            // Week end date (YYYY-MM-DD)
    totalRevenue: number;           // Total revenue in cents
    totalAppointments: number;      // Total appointments
    totalCustomers: number;         // Total unique customers
    averageSatisfaction: number;    // Average satisfaction (0-100)
    averageStaffUtilization: number; // Average staff utilization (0-100)
    newCustomers: number;           // New customers this week
    returningCustomers: number;     // Returning customers this week
    topServices: ServiceMetrics[];  // Top performing services
    topStaff: StaffMetrics[];       // Top performing staff
}

/**
 * Monthly business metrics
 * Used in monthly analytics
 */
export interface MonthlyMetrics {
    month: string;                  // Month in YYYY-MM format
    totalRevenue: number;           // Total revenue in cents
    totalAppointments: number;      // Total appointments
    totalCustomers: number;         // Total unique customers
    averageSatisfaction: number;    // Average satisfaction (0-100)
    averageStaffUtilization: number; // Average staff utilization (0-100)
    revenueGrowth: number;          // Revenue growth percentage
    customerGrowth: number;         // Customer growth percentage
    appointmentGrowth: number;      // Appointment growth percentage
    topServices: ServiceMetrics[];  // Top performing services
    topStaff: StaffMetrics[];       // Top performing staff
}

// ========================================
// 3. STAFF MANAGEMENT INTERFACES
// ========================================

/**
 * Staff member information
 * Extends BaseProfile with staff-specific fields
 * Used in staff management
 */
export interface StaffMember extends BaseProfile {
    // Business relationship
    businessId: string;             // UUID - business ID
    
    // Professional information
    role: string;                   // Job title
    specialization: string[];       // Specializations - populated from EmployeeSpecialization table
    experience: number;             // Years of experience
    hourlyRate?: number;            // Hourly rate in cents
    commissionRate?: number;        // Commission percentage (0-100)
    
    // Work details
    chairNumber?: string;           // Assigned chair/station
    isAvailable: boolean;           // Is available for bookings?
    startDate: string;              // Employment start date
    endDate?: string;               // Employment end date (if applicable)
    
    // Performance metrics
    rating: Rating;                 // Standardized rating (0-5 scale)
    totalAppointments: number;      // Total appointments
    totalRevenue: number;           // Total revenue generated (in cents)
    customerSatisfaction: number;   // Customer satisfaction percentage
    
    // Additional timestamps
    lastActiveAt?: string;          // Last active timestamp (ISO string)
}

/**
 * Staff performance metrics
 * Used in staff analytics and rankings
 */
export interface StaffMetrics {
    staffId: string;                // Staff member ID
    staffName: string;              // Staff member name
    totalAppointments: number;      // Total appointments
    totalRevenue: number;           // Total revenue generated (in cents)
    averageRating: Rating;          // Standardized rating (0-5 scale)
    customerSatisfaction: number;   // Customer satisfaction percentage
    utilizationRate: number;        // Utilization rate percentage (0-100)
    repeatCustomers: number;        // Number of repeat customers
    newCustomers: number;           // Number of new customers
    cancellationRate: number;       // Cancellation rate percentage (0-100)
    noShowRate: number;             // No-show rate percentage (0-100)
}

// ========================================
// 4. CUSTOMER MANAGEMENT INTERFACES
// ========================================

/**
 * Customer information for owners
 * Extends BaseProfile with customer-specific fields
 * Used in customer management and analytics
 */
export interface CustomerData extends BaseProfile {
    // Business relationship
    businessId: string;             // UUID - business ID
    
    // Customer details
    dateOfBirth?: string;           // Date of birth (YYYY-MM-DD)
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    emergencyContact?: string;      // Emergency contact information
    notes?: string;                 // Customer notes
    
    // Service history
    totalAppointments: number;      // Total appointments
    totalSpent: number;             // Total amount spent (in cents)
    averageAppointmentValue: number; // Average appointment value (in cents)
    lastAppointmentDate?: string;   // Date of last appointment
    nextAppointmentDate?: string;   // Date of next appointment
    
    // Customer status
    isVIP: boolean;                 // Is VIP customer?
    loyaltyPoints: number;          // Loyalty points balance
    customerSince: string;          // Customer since date (ISO string)
    
    // Preferences
    preferredServices: string[];    // Array of preferred service IDs
    preferredStaff: string[];       // Array of preferred staff IDs
    preferredTimeSlots: string[];   // Array of preferred time slots
    
    // Additional timestamps
    lastVisitAt?: string;           // Last visit date (ISO string)
}

/**
 * Customer analytics
 * Used in customer analytics and insights
 */
export interface CustomerAnalytics {
    totalCustomers: number;         // Total number of customers
    newCustomers: number;           // New customers this period
    returningCustomers: number;     // Returning customers this period
    vipCustomers: number;           // VIP customers
    averageCustomerValue: number;   // Average customer value (in cents)
    customerRetentionRate: number;  // Customer retention rate percentage
    topCustomers: CustomerData[];   // Top customers by value
    customerGrowthRate: number;     // Customer growth rate percentage
}

// ========================================
// 5. SERVICE MANAGEMENT INTERFACES
// ========================================

/**
 * Service information
 * Used in service management
 */
export interface ServiceData {
    id: string;                     // UUID - service ID
    businessId: string;             // UUID - business ID
    name: string;                   // Service name
    description?: string;           // Service description
    category: string;               // Service category
    duration: number;               // Duration in minutes
    price: number;                  // Price in cents
    isActive: boolean;              // Is service active?
    isPopular: boolean;             // Is popular service?
    requiresAppointment: boolean;   // Requires appointment?
    maxConcurrent: number;          // Maximum concurrent bookings
    bufferTime: number;             // Buffer time in minutes
    createdAt: string;              // When service was created (ISO string)
    updatedAt: string;              // Last update (ISO string)
}

/**
 * Service performance metrics
 * Used in service analytics
 */
export interface ServiceMetrics {
    serviceId: string;              // Service ID
    serviceName: string;            // Service name
    totalBookings: number;          // Total bookings
    totalRevenue: number;           // Total revenue (in cents)
    averageRating: Rating;          // Standardized rating (0-5 scale)
    popularityScore: number;        // Popularity score (0-100)
    utilizationRate: number;        // Utilization rate percentage (0-100)
    averageDuration: number;        // Average actual duration in minutes
    cancellationRate: number;       // Cancellation rate percentage (0-100)
}

// ========================================
// 6. ANALYTICS AND REPORTING INTERFACES
// ========================================

/**
 * Business analytics data
 * Used in analytics dashboard
 */
export interface BusinessAnalytics {
    // Time period
    period: 'today' | 'week' | 'month' | 'quarter' | 'year';
    startDate: string;              // Period start date (ISO string)
    endDate: string;                // Period end date (ISO string)
    
    // Revenue analytics
    revenue: {
        total: number;              // Total revenue in cents
        growth: number;             // Growth percentage
        target: number;             // Revenue target in cents
        targetProgress: number;     // Target progress percentage (0-100)
        dailyAverage: number;       // Daily average revenue in cents
        topServices: ServiceMetrics[]; // Top revenue services
    };
    
    // Appointment analytics
    appointments: {
        total: number;              // Total appointments
        growth: number;             // Growth percentage
        completed: number;          // Completed appointments
        cancelled: number;          // Cancelled appointments
        noShows: number;            // No-show appointments
        averageDuration: number;    // Average duration in minutes
        peakHours: string[];        // Peak hours
    };
    
    // Customer analytics
    customers: {
        total: number;              // Total customers
        new: number;                // New customers
        returning: number;          // Returning customers
        growth: number;             // Growth percentage
        retentionRate: number;      // Retention rate percentage
        averageValue: number;       // Average customer value in cents
        topCustomers: CustomerData[]; // Top customers
    };
    
    // Staff analytics
    staff: {
        total: number;              // Total staff members
        active: number;             // Active staff members
        averageUtilization: number; // Average utilization percentage
        topPerformers: StaffMetrics[]; // Top performing staff
        averageRating: number;      // Average staff rating
    };
    
    // Satisfaction analytics
    satisfaction: {
        average: number;            // Average satisfaction (0-100)
        trend: number;              // Satisfaction trend percentage
        totalReviews: number;       // Total reviews
        positiveReviews: number;    // Positive reviews
        negativeReviews: number;    // Negative reviews
    };
}

/**
 * Revenue overview data
 * Used in revenue analytics
 */
export interface RevenueOverview {
    period: string;                 // Period description
    totalRevenue: number;           // Total revenue in cents
    revenueGrowth: number;          // Revenue growth percentage
    averageDailyRevenue: number;    // Average daily revenue in cents
    revenueByService: ServiceMetrics[]; // Revenue by service
    revenueByStaff: StaffMetrics[]; // Revenue by staff
    revenueByDay: DailyMetrics[];   // Revenue by day
    revenueByMonth: MonthlyMetrics[]; // Revenue by month
    targetRevenue: number;          // Target revenue in cents
    targetProgress: number;         // Target progress percentage (0-100)
}

// ========================================
// 7. NOTIFICATION INTERFACES
// ========================================

/**
 * Owner notification
 * Used in owner notification system
 */
export interface OwnerNotification {
    id: string;                     // UUID - notification ID
    businessId: string;             // UUID - business ID
    type: 'appointment' | 'staff' | 'customer' | 'revenue' | 'system' | 'alert';
    title: string;                  // Notification title
    message: string;                // Notification message
    priority: 'high' | 'medium' | 'low';
    isRead: boolean;                // Has owner read this?
    actionUrl?: string;             // Action URL if applicable
    actionData?: any;               // Additional action data
    createdAt: string;              // When notification was created (ISO string)
    readAt?: string;                // When notification was read (ISO string)
}

// ========================================
// 8. EXPORT ALL TYPES
// ========================================

// Re-export shared types for convenience
export type { BookingStatus } from './Shared-DataStructure';
