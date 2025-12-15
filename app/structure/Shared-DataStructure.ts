// ========================================
// SHARED DATA STRUCTURES
// ========================================
// These interfaces are used across multiple pages/features
// Designed for easy backend integration with Supabase
// ========================================

// ========================================
// 1. USER MANAGEMENT
// ========================================

/**
 * Core user interface used across all user types
 * Maps directly to Supabase auth.users + profiles table
 */
export interface User {
    // Primary identifiers
    id: string;                     // UUID from Supabase auth.users
    email: string;                  // User email (unique)
    userType: 'customer' | 'employee' | 'owner';  // User role/type
    
    // Profile information
    displayName: string;            // Full name (e.g., "John Smith")
    username: string;               // Username (e.g., "johnsmith")
    profileImage?: string;          // Profile image URL (stored in Supabase Storage)
    phone?: string;                 // Phone number (optional)
    
    // Account status
    isVerified: boolean;            // Email/phone verification status
    isActive: boolean;              // Account active status
    
    // Timestamps
    createdAt: string;              // Account creation date (ISO string)
    updatedAt: string;              // Last profile update (ISO string)
    lastLogin?: string;             // Last login date (ISO string)
    
    // Business relationship (for employees/owners)
    businessId?: string;            // Which business they belong to (UUID)
    employeeId?: string;            // Employee ID within business (for employees)
}

/**
 * Base profile interface for all user types
 * Extended by specific profile types
 */
export interface BaseProfile {
    id: string;
    userId: string;
    displayName: string;
    username: string;
    email: string;
    phone?: string;
    profileImage?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * User profile data for display purposes
 * Lightweight version of User for UI components
 */
export interface UserProfile extends BaseProfile {
    userType: 'customer' | 'employee' | 'owner';
    isVerified: boolean;
}

// ========================================
// 2. NOTIFICATION SYSTEM
// ========================================

/**
 * Notification types for different app features
 */
export type NotificationType = 
    | 'booking_confirmed'           // Booking was confirmed
    | 'booking_reminder'            // Booking reminder (1 hour before)
    | 'booking_cancelled'           // Booking was cancelled
    | 'booking_completed'           // Service completed
    | 'promotion'                   // New promotion available
    | 'message'                     // New message received
    | 'system'                      // System notification
    | 'review_request'              // Request to review service
    | 'appointment_updated';        // Appointment details changed

/**
 * Core notification interface
 * Maps to Supabase notifications table
 */
export interface Notification {
    // Primary identifiers
    id: string;                     // UUID
    userId: string;                 // Who this notification is for (UUID)
    
    // Content
    title: string;                  // Notification title
    message: string;                // Notification message
    type: NotificationType;         // Type of notification
    
    // Status
    isRead: boolean;                // Has user read this notification?
    isArchived: boolean;            // Has user archived this notification?
    
    // Action data
    actionUrl?: string;             // Where to navigate when tapped
    actionData?: {                  // Additional data for the action
        bookingId?: string;
        salonId?: string;
        employeeId?: string;
        [key: string]: any;
    };
    
    // Timestamps
    createdAt: string;              // When notification was created (ISO string)
    readAt?: string;                // When user read it (ISO string)
}

/**
 * Notification summary for header/UI components
 */
export interface NotificationData {
    unreadCount: number;            // Number of unread notifications
    latestNotification?: Notification;  // Most recent notification
}

// ========================================
// 3. LOCATION & GEOGRAPHY
// ========================================

/**
 * City/location data
 * Maps to Supabase cities table
 */
export interface City {
    // Primary identifiers
    id: string;                     // UUID
    name: string;                   // City name (e.g., "Vancouver")
    
    // Geographic data
    region?: string;                // Province/State (e.g., "BC")
    country: string;                // Country (e.g., "Canada")
    coordinates?: {                 // GPS coordinates
        lat: number;                // Latitude
        lng: number;                // Longitude
    };
    
    // Display data
    displayName: string;            // Full display name (e.g., "Vancouver, BC")
    timezone?: string;              // Timezone (e.g., "America/Vancouver")
    
    // Status
    isActive: boolean;              // Is this city available for bookings?
}

/**
 * Location data for UI components
 * Used in explore, search, and booking pages
 */
export interface LocationData {
    currentLocation: string;        // Currently selected location
    availableLocations: string[];   // List of available locations
    coordinates?: {                 // User's current GPS coordinates
        lat: number;
        lng: number;
    };
}

// ========================================
// 4. COMMON UI DATA
// ========================================

/**
 * Generic select option for dropdowns
 * Used across multiple components
 */
export interface SelectOption {
    value: string;                  // Option value
    label: string;                  // Display label
    disabled?: boolean;             // Is option disabled?
    icon?: string;                  // Optional icon name
}

/**
 * API response wrapper
 * Standard format for all API responses
 */
export interface ApiResponse<T = any> {
    success: boolean;               // Request success status
    data?: T;                       // Response data
    error?: string;                 // Error message if failed
    message?: string;               // Additional message
    timestamp: string;              // Response timestamp (ISO string)
}

/**
 * Pagination data
 * Used for paginated API responses
 */
export interface PaginationData {
    page: number;                   // Current page number
    limit: number;                  // Items per page
    total: number;                  // Total number of items
    totalPages: number;             // Total number of pages
    hasNext: boolean;               // Has next page?
    hasPrev: boolean;               // Has previous page?
}

/**
 * Paginated API response
 * Combines data with pagination info
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: PaginationData;
}

// ========================================
// 5. COMMON ENUMS & TYPES
// ========================================

/**
 * User roles in the system
 */
export type UserRole = 'customer' | 'employee' | 'owner';

/**
 * Common status values
 */
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Common booking status values
 */
export type BookingStatus = 
    | 'pending'                     // Waiting for confirmation
    | 'confirmed'                   // Confirmed by salon
    | 'in_progress'                 // Service in progress
    | 'completed'                   // Service completed
    | 'cancelled'                   // Cancelled by user or salon
    | 'no_show';                    // Customer didn't show up

/**
 * Common payment status values
 */
export type PaymentStatus = 
    | 'pending'                     // Payment pending
    | 'paid'                        // Payment completed
    | 'failed'                      // Payment failed
    | 'refunded'                    // Payment refunded
    | 'cancelled';                  // Payment cancelled

// ========================================
// 6. CURRENCY & GLOBALIZATION
// ========================================

/**
 * Supported currencies - currently launching in Canada with CAD
 */
export type Currency = 'CAD';

/**
 * Currency information
 */
export interface CurrencyInfo {
    code: Currency;                 // Currency code (e.g., 'CAD')
    symbol: string;                 // Currency symbol (e.g., '$')
    name: string;                   // Currency name (e.g., 'US Dollar', 'Canadian Dollar')
    decimalPlaces: number;          // Number of decimal places (usually 2)
}

/**
 * Get currency information
 */
export function getCurrencyInfo(currency: Currency): CurrencyInfo {
    const currencyMap: Record<Currency, CurrencyInfo> = {
        'CAD': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 }
    };
    
    return currencyMap[currency];
}

/**
 * Format amount with currency
 */
export function formatCurrency(amount: number, currency: Currency): string {
    const info = getCurrencyInfo(currency);
    const formattedAmount = (amount / 100).toFixed(info.decimalPlaces);
    return `${info.symbol}${formattedAmount}`;
}

// ========================================
// 7. RATING & REVIEW SYSTEM
// ========================================

/**
 * Standardized rating system across the app
 * All ratings use 0-5 scale with 0.1 increments
 */
export interface Rating {
    value: number;                    // Rating value (0-5, e.g., 4.8)
    count: number;                    // Number of ratings
    percentage: number;               // Percentage (0-100, e.g., 96%)
}

/**
 * Convert rating to display format
 */
export function formatRating(rating: number): {
    display: string;                  // "4.8" or "4.8/5"
    percentage: string;               // "96%"
    stars: string;                    // "★★★★☆"
} {
    const percentage = Math.round((rating / 5) * 100);
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    
    return {
        display: rating.toFixed(1),
        percentage: `${percentage}%`,
        stars: stars
    };
}

/**
 * Validate rating value
 */
export function isValidRating(rating: number): boolean {
    return rating >= 0 && rating <= 5 && Number.isFinite(rating);
}

// ========================================
// 7. EXPORT ALL TYPES
// ========================================

// All types are already exported above, no need to re-export
