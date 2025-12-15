// ========================================
// DATABASE SCHEMA INTERFACES
// ========================================
// Normalized database tables for Supabase
// These represent the actual database structure
// ========================================

import { Rating, Currency } from './Shared-DataStructure';

// ========================================
// 1. CORE BOOKING TABLES
// ========================================

/**
 * Main bookings table - lean and focused
 * Maps to Supabase 'bookings' table
 */
export interface BookingCore {
    // Primary identifiers
    id: string;                     // UUID primary key
    customerId: string;             // UUID references customers(id)
    salonId: string;                // UUID references salons(id)
    employeeId: string;             // UUID references employees(id)
    
    // Scheduling
    scheduledStart: string;         // timestamptz - ISO timestamp
    scheduledEnd: string;           // timestamptz - ISO timestamp
    
    // Status
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'failed';
    
    // Pricing (all in cents)
    basePrice: number;              // Base price before discounts
    discountAmount: number;         // Discount applied (default 0)
    taxAmount: number;              // Tax amount (default 0)
    totalPrice: number;             // Final price (base - discount + tax)
    currency: Currency;             // Currency for this booking (e.g., 'USD', 'CAD')
    
    // Customer preferences
    specialInstructions?: string;   // Customer special requests
    requestedEmployeeId?: string;   // Customer's requested employee (may differ from assigned employeeId)
    
    // Payment
    paymentMethodId?: string;       // UUID references payment_methods(id)
    paymentIntentId?: string;       // Stripe payment intent ID (for initial payment request only)
    
    // Loyalty (lightweight - for simple cases)
    pointsEarned: number;           // Points earned from this booking
    pointsRedeemed: number;         // Points redeemed for this booking
    
    // Soft delete
    isDeleted: boolean;             // Is record soft deleted? (default false)
    deletedAt?: string;             // When record was soft deleted (ISO string)
    
    // Timestamps
    createdAt: string;              // timestamptz default now()
    updatedAt: string;              // timestamptz default now()
    confirmedAt?: string;           // When confirmed
    cancelledAt?: string;           // When cancelled
    completedAt?: string;           // When completed
}

/**
 * Booking services snapshot table
 * Maps to Supabase 'booking_services' table
 * Preserves historical service data even if service catalog changes
 */
export interface BookingServiceSnapshot {
    id: string;                     // UUID primary key
    bookingId: string;              // UUID references bookings(id)
    serviceId: string;              // UUID references services(id)
    name: string;                   // Service name at time of booking
    category: string;               // Service category at time of booking
    duration: number;               // Duration in minutes at time of booking
    price: number;                  // Price in cents at time of booking
}

/**
 * Booking reviews table
 * Maps to Supabase 'booking_reviews' table
 * Separate table keeps main booking table lean
 */
export interface BookingReview {
    id: string;                     // UUID primary key
    bookingId: string;              // UUID references bookings(id)
    customerId: string;             // UUID references customers(id) - for traceability
    rating: number;                 // Rating 1-5 (raw database value)
    reviewText?: string;            // Review text
    photos?: string[];              // Review photos (array of URLs)
    isAnonymous: boolean;           // Is review anonymous?
    createdAt: string;              // timestamptz default now()
}

/**
 * Booking rewards table (optional)
 * Maps to Supabase 'booking_rewards' table
 * 
 * LOYALTY/REWARDS ARCHITECTURE:
 * 
 * SIMPLE SYSTEM (BookingCore fields):
 * - pointsEarned: Points earned from this booking (for basic loyalty)
 * - pointsRedeemed: Points redeemed for this booking (for basic rewards)
 * - Use for: Simple earn/spend point systems
 * 
 * COMPLEX SYSTEM (BookingReward table):
 * - Multiple reward types per booking (discounts, free services, etc.)
 * - Detailed reward tracking and analytics
 * - Complex loyalty tiers and promotions
 * - Use for: Advanced loyalty programs with multiple reward types
 * 
 * RELATIONSHIP:
 * - Use BookingCore fields for simple point systems
 * - Use BookingReward table for complex multi-reward scenarios
 * - Both can coexist for migration purposes
 */
export interface BookingReward {
    id: string;                     // UUID primary key
    bookingId: string;              // UUID references bookings(id)
    rewardId: string;               // UUID references rewards(id)
    pointsRedeemed: number;         // Points redeemed
    pointsEarned: number;           // Points earned
    discountAmount: number;         // Discount amount in cents
}

/**
 * Payments table
 * Maps to Supabase 'payments' table
 * 
 * PAYMENT ARCHITECTURE:
 * - paymentIntentId (in BookingCore): Initial Stripe payment intent for booking
 * - Payment table: All payment events (initial payment, refunds, partial payments, retries)
 * 
 * RELATIONSHIP:
 * - BookingCore.paymentIntentId → Stripe payment intent (for booking creation)
 * - Payment.transactionId → Can reference the same Stripe payment intent or subsequent transactions
 * - Multiple Payment records per booking allowed (refunds, partial payments, etc.)
 */
export interface Payment {
    id: string;                     // UUID primary key
    bookingId: string;              // UUID references bookings(id)
    amount: number;                 // Amount in cents
    method: string;                 // Payment method (e.g., 'card', 'cash', 'refund')
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;         // External transaction ID (Stripe payment intent, refund ID, etc.)
    refundAmount?: number;          // Refund amount in cents (if applicable)
    createdAt: string;              // timestamptz default now()
}

// ========================================
// 2. BUSINESS ENTITY TABLE
// ========================================

/**
 * Business entity table
 * Maps to Supabase 'businesses' table
 * Unifies multi-location and franchise logic
 */
export interface Business {
    id: string;                     // UUID primary key
    ownerId: string;                // UUID references auth.users(id) - business owner
    name: string;                   // Business name (e.g., "Downtown Barbershop")
    slug: string;                   // URL slug (e.g., "downtown-barbershop")
    description?: string;           // Business description
    category: string;               // Business category (e.g., "Barbershop", "Salon", "Spa")
    
    // Contact information
    phone: string;                  // Business phone number
    email: string;                  // Business email
    website?: string;               // Business website URL
    
    // Branding
    logo?: string;                  // Business logo URL
    coverImage?: string;            // Cover image URL
    primaryColor?: string;          // Primary brand color
    secondaryColor?: string;        // Secondary brand color
    
    // Business settings
    timezone: string;               // Default business timezone (e.g., 'America/Toronto')
    currency: Currency;             // Default business currency (e.g., 'USD', 'CAD')
    language: string;               // Default business language (e.g., 'en', 'fr')
    
    // Subscription and billing
    subscriptionPlan: 'basic' | 'premium' | 'enterprise';
    subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trial';
    subscriptionExpiresAt?: string; // Subscription expiration date
    
    // Status
    isActive: boolean;              // Is business active?
    isVerified: boolean;            // Is business verified?
    isPublic: boolean;              // Is business publicly visible?
    
    // Soft delete
    isDeleted: boolean;             // Is record soft deleted? (default false)
    deletedAt?: string;             // When record was soft deleted (ISO string)
    
    // Timestamps
    createdAt: string;              // timestamptz default now()
    updatedAt: string;              // timestamptz default now()
    verifiedAt?: string;            // When business was verified (ISO string)
}

// ========================================
// 3. CORE ENTITY TABLES
// ========================================

/**
 * Customers table
 * Maps to Supabase 'customers' table
 */
export interface Customer {
    id: string;                     // UUID primary key
    userId: string;                 // UUID references auth.users(id)
    businessId: string;             // UUID references businesses(id)
    displayName: string;            // Full name
    email: string;                  // Email address
    phone?: string;                 // Phone number
    profileImage?: string;          // Profile image URL
    isActive: boolean;              // Is customer active?
    loyaltyPoints: number;          // Loyalty points balance
    
    // Soft delete
    isDeleted: boolean;             // Is record soft deleted? (default false)
    deletedAt?: string;             // When record was soft deleted (ISO string)
    
    createdAt: string;              // timestamptz default now()
    updatedAt: string;              // timestamptz default now()
}

/**
 * Salons table
 * Maps to Supabase 'salons' table
 */
export interface Salon {
    id: string;                     // UUID primary key
    businessId: string;             // UUID references businesses(id)
    name: string;                   // Salon name
    description?: string;           // Salon description
    address: string;                // Street address
    city: string;                   // City
    state: string;                  // State/Province
    zipCode: string;                // ZIP/Postal code
    phone: string;                  // Phone number
    email: string;                  // Email address
    image?: string;                 // Salon image URL
    timezone: string;               // Business timezone (e.g., 'America/Toronto')
    rating: number;                 // Average rating (0-5) - raw database value
    totalReviews: number;           // Total number of reviews
    isActive: boolean;              // Is salon active?
    
    // Soft delete
    isDeleted: boolean;             // Is record soft deleted? (default false)
    deletedAt?: string;             // When record was soft deleted (ISO string)
    
    createdAt: string;              // timestamptz default now()
    updatedAt: string;              // timestamptz default now()
}

/**
 * Employees table
 * Maps to Supabase 'employees' table
 */
export interface Employee {
    id: string;                     // UUID primary key
    userId: string;                 // UUID references auth.users(id)
    businessId: string;             // UUID references businesses(id)
    displayName: string;            // Full name
    email: string;                  // Email address
    phone?: string;                 // Phone number
    profileImage?: string;          // Profile image URL
    role: string;                   // Job title
    chairNumber?: string;           // Assigned chair/station
    rating: number;                 // Average rating (0-5) - raw database value
    totalReviews: number;           // Total number of reviews
    isActive: boolean;              // Is employee active?
    isAvailable: boolean;           // Is available for bookings?
    
    // Soft delete
    isDeleted: boolean;             // Is record soft deleted? (default false)
    deletedAt?: string;             // When record was soft deleted (ISO string)
    
    createdAt: string;              // timestamptz default now()
    updatedAt: string;              // timestamptz default now()
}

/**
 * Employee specializations table
 * Maps to Supabase 'employee_specializations' table
 * Normalized for better querying and filtering
 */
export interface EmployeeSpecialization {
    id: string;                     // UUID primary key
    employeeId: string;             // UUID references employees(id)
    specialization: string;         // Specialization name (e.g., 'Haircut', 'Beard Trim')
    createdAt: string;              // timestamptz default now()
}

/**
 * Services table
 * Maps to Supabase 'services' table
 */
export interface Service {
    id: string;                     // UUID primary key
    businessId: string;             // UUID references businesses(id)
    name: string;                   // Service name
    description?: string;           // Service description
    category: string;               // Service category
    duration: number;               // Duration in minutes
    price: number;                  // Price in cents
    currency: Currency;             // Currency for this service (e.g., 'USD', 'CAD')
    isActive: boolean;              // Is service active?
    isPopular: boolean;             // Is popular service?
    
    // Soft delete
    isDeleted: boolean;             // Is record soft deleted? (default false)
    deletedAt?: string;             // When record was soft deleted (ISO string)
    
    createdAt: string;              // timestamptz default now()
    updatedAt: string;              // timestamptz default now()
}

// ========================================
// 3. EXPORT ALL TYPES
// ========================================

// All interfaces are already exported above, no need to re-export
