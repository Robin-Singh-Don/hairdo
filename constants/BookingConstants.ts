// ========================================
// BOOKING CONSTANTS
// ========================================
// Centralized constants for booking-related data
// This ensures consistency across the entire application
// ========================================

// Booking Status Colors
export const BOOKING_STATUS_COLORS = {
  confirmed: '#03A100',
  pending: '#FFA500',
  cancelled: '#FF3B30',
  pending_reschedule: '#FFA500',
  completed: '#666',
} as const;

export type BookingStatusColor = typeof BOOKING_STATUS_COLORS[keyof typeof BOOKING_STATUS_COLORS];

// Booking Status Icons
export const BOOKING_STATUS_ICONS = {
  confirmed: 'checkmark-circle',
  pending: 'time',
  pending_reschedule: 'time',
  cancelled: 'close-circle',
  completed: 'checkmark-done-circle',
} as const;

export type BookingStatusIcon = typeof BOOKING_STATUS_ICONS[keyof typeof BOOKING_STATUS_ICONS];

// Tax and Pricing
export const TAX_RATE = 0.08; // 8% default tax rate
export const DEFAULT_CURRENCY = 'CAD';
export const DEFAULT_CURRENCY_SYMBOL = '$';

// Default Images (Fallback Images)
export const DEFAULT_SALON_IMAGE = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop';
export const DEFAULT_BARBER_IMAGE = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop';
export const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/100';

// Booking Duration Defaults
export const DEFAULT_APPOINTMENT_DURATION = '45 min';
export const DEFAULT_DURATION_MINUTES = 45;

// Default Contact Information
export const DEFAULT_SALON_LOCATION = '9785, 132St, Vancouver';
export const DEFAULT_SALON_PHONE = '(555) 123-4567';

// Booking Timing
export const BOOKING_REMINDER_HOURS = {
  TWENTY_FOUR: 24,
  ONE: 1,
} as const;

// Reschedule Deadline (hours before appointment)
export const RESCHEDULE_DEADLINE_HOURS = 24;

// Cancellation Deadline (hours before appointment)
export const CANCELLATION_DEADLINE_HOURS = 24;

// Helper Functions
export const calculateTax = (subtotal: number, taxRate: number = TAX_RATE): number => {
  return subtotal * taxRate;
};

export const calculateTotal = (subtotal: number, discounts: number = 0, taxRate: number = TAX_RATE): number => {
  const taxableAmount = Math.max(0, subtotal - discounts);
  const tax = taxableAmount * taxRate;
  return taxableAmount + tax;
};

export const formatPrice = (amount: number, currency: string = DEFAULT_CURRENCY_SYMBOL): string => {
  return `${currency}${amount.toFixed(2)}`;
};

export const parsePrice = (priceString: string): number => {
  const cleanPrice = priceString.replace(/[^0-9.-]/g, '');
  return parseFloat(cleanPrice) || 0;
};

// Status Display Labels
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    pending_reschedule: 'Pending Reschedule',
    completed: 'Completed',
  };
  return labels[status] || status;
};

// Booking Validation Rules
export const BOOKING_VALIDATION = {
  MIN_ADVANCE_BOOKING_HOURS: 2, // Can book at least 2 hours in advance
  MAX_ADVANCE_BOOKING_DAYS: 90, // Can book up to 90 days in advance
  MAX_SERVICES_PER_BOOKING: 10,
};

// Common Booking Messages
export const BOOKING_MESSAGES = {
  CONFIRMATION: 'Your appointment has been confirmed!',
  PENDING_RESCHEDULE: 'Your reschedule request is pending salon approval.',
  CANCELLATION_SUCCESS: 'Your appointment has been cancelled.',
  RESCHEDULE_SUCCESS: 'Your appointment has been rescheduled successfully.',
} as const;

