// ========================================
// ERROR HANDLING SYSTEM
// ========================================
// Centralized error handling for better user experience
// ========================================

export interface AppError {
  code: string;
  message: string;
  details?: string;
  userMessage: string;
  statusCode?: number;
}

export class BookingError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly statusCode?: number;
  public readonly details?: string;

  constructor(error: AppError) {
    super(error.message);
    this.name = 'BookingError';
    this.code = error.code;
    this.userMessage = error.userMessage;
    this.statusCode = error.statusCode;
    this.details = error.details;
  }
}

// ========================================
// ERROR CODES AND MESSAGES
// ========================================

export const ERROR_CODES = {
  // Database errors
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  BOOKING_CREATION_FAILED: 'BOOKING_CREATION_FAILED',
  BOOKING_UPDATE_FAILED: 'BOOKING_UPDATE_FAILED',
  BOOKING_DELETE_FAILED: 'BOOKING_DELETE_FAILED',
  
  // Service errors
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Validation errors
  INVALID_BOOKING_DATA: 'INVALID_BOOKING_DATA',
  INVALID_DATE_TIME: 'INVALID_DATE_TIME',
  INVALID_SERVICE_SELECTION: 'INVALID_SERVICE_SELECTION',
  
  // Business logic errors
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  BOOKING_CANNOT_BE_CANCELLED: 'BOOKING_CANNOT_BE_CANCELLED',
  BOOKING_CANNOT_BE_RESCHEDULED: 'BOOKING_CANNOT_BE_RESCHEDULED',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_METHOD_INVALID: 'PAYMENT_METHOD_INVALID',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const ERROR_MESSAGES: Record<string, AppError> = {
  [ERROR_CODES.BOOKING_NOT_FOUND]: {
    code: ERROR_CODES.BOOKING_NOT_FOUND,
    message: 'Booking not found',
    userMessage: 'Sorry, we couldn\'t find your booking. Please try again.',
    statusCode: 404,
  },
  [ERROR_CODES.BOOKING_CREATION_FAILED]: {
    code: ERROR_CODES.BOOKING_CREATION_FAILED,
    message: 'Failed to create booking',
    userMessage: 'Sorry, we couldn\'t create your booking. Please try again.',
    statusCode: 500,
  },
  [ERROR_CODES.BOOKING_UPDATE_FAILED]: {
    code: ERROR_CODES.BOOKING_UPDATE_FAILED,
    message: 'Failed to update booking',
    userMessage: 'Sorry, we couldn\'t update your booking. Please try again.',
    statusCode: 500,
  },
  [ERROR_CODES.BOOKING_DELETE_FAILED]: {
    code: ERROR_CODES.BOOKING_DELETE_FAILED,
    message: 'Failed to delete booking',
    userMessage: 'Sorry, we couldn\'t cancel your booking. Please try again.',
    statusCode: 500,
  },
  [ERROR_CODES.SERVICE_NOT_FOUND]: {
    code: ERROR_CODES.SERVICE_NOT_FOUND,
    message: 'Service not found',
    userMessage: 'Sorry, the selected service is no longer available.',
    statusCode: 404,
  },
  [ERROR_CODES.SERVICE_UNAVAILABLE]: {
    code: ERROR_CODES.SERVICE_UNAVAILABLE,
    message: 'Service unavailable',
    userMessage: 'Sorry, this service is currently unavailable. Please try another time.',
    statusCode: 503,
  },
  [ERROR_CODES.INVALID_BOOKING_DATA]: {
    code: ERROR_CODES.INVALID_BOOKING_DATA,
    message: 'Invalid booking data',
    userMessage: 'Please check your booking details and try again.',
    statusCode: 400,
  },
  [ERROR_CODES.INVALID_DATE_TIME]: {
    code: ERROR_CODES.INVALID_DATE_TIME,
    message: 'Invalid date or time',
    userMessage: 'Please select a valid date and time for your booking.',
    statusCode: 400,
  },
  [ERROR_CODES.INVALID_SERVICE_SELECTION]: {
    code: ERROR_CODES.INVALID_SERVICE_SELECTION,
    message: 'Invalid service selection',
    userMessage: 'Please select at least one service for your booking.',
    statusCode: 400,
  },
  [ERROR_CODES.BOOKING_CONFLICT]: {
    code: ERROR_CODES.BOOKING_CONFLICT,
    message: 'Booking time conflict',
    userMessage: 'Sorry, this time slot is no longer available. Please choose another time.',
    statusCode: 409,
  },
  [ERROR_CODES.BOOKING_CANNOT_BE_CANCELLED]: {
    code: ERROR_CODES.BOOKING_CANNOT_BE_CANCELLED,
    message: 'Booking cannot be cancelled',
    userMessage: 'Sorry, this booking cannot be cancelled. Please contact us for assistance.',
    statusCode: 400,
  },
  [ERROR_CODES.BOOKING_CANNOT_BE_RESCHEDULED]: {
    code: ERROR_CODES.BOOKING_CANNOT_BE_RESCHEDULED,
    message: 'Booking cannot be rescheduled',
    userMessage: 'Sorry, this booking cannot be rescheduled. Please contact us for assistance.',
    statusCode: 400,
  },
  [ERROR_CODES.PAYMENT_FAILED]: {
    code: ERROR_CODES.PAYMENT_FAILED,
    message: 'Payment failed',
    userMessage: 'Sorry, your payment could not be processed. Please try again or use a different payment method.',
    statusCode: 402,
  },
  [ERROR_CODES.PAYMENT_METHOD_INVALID]: {
    code: ERROR_CODES.PAYMENT_METHOD_INVALID,
    message: 'Invalid payment method',
    userMessage: 'Please select a valid payment method.',
    statusCode: 400,
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    code: ERROR_CODES.NETWORK_ERROR,
    message: 'Network error',
    userMessage: 'Please check your internet connection and try again.',
    statusCode: 0,
  },
  [ERROR_CODES.TIMEOUT_ERROR]: {
    code: ERROR_CODES.TIMEOUT_ERROR,
    message: 'Request timeout',
    userMessage: 'The request is taking longer than expected. Please try again.',
    statusCode: 408,
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    code: ERROR_CODES.UNAUTHORIZED,
    message: 'Unauthorized',
    userMessage: 'Please log in to continue.',
    statusCode: 401,
  },
  [ERROR_CODES.FORBIDDEN]: {
    code: ERROR_CODES.FORBIDDEN,
    message: 'Forbidden',
    userMessage: 'You don\'t have permission to perform this action.',
    statusCode: 403,
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'Unknown error occurred',
    userMessage: 'Something went wrong. Please try again later.',
    statusCode: 500,
  },
};

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

/**
 * Convert Supabase error to user-friendly error
 */
export function handleSupabaseError(error: any): BookingError {
  console.error('Supabase error:', error);

  // Handle specific Supabase error codes
  if (error?.code === 'PGRST116') {
    return new BookingError(ERROR_MESSAGES[ERROR_CODES.BOOKING_NOT_FOUND]);
  }
  
  if (error?.code === '23505') { // Unique constraint violation
    return new BookingError(ERROR_MESSAGES[ERROR_CODES.BOOKING_CONFLICT]);
  }
  
  if (error?.code === '23503') { // Foreign key constraint violation
    return new BookingError(ERROR_MESSAGES[ERROR_CODES.INVALID_BOOKING_DATA]);
  }
  
  if (error?.message?.includes('timeout')) {
    return new BookingError(ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR]);
  }
  
  if (error?.message?.includes('network')) {
    return new BookingError(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
  }

  // Default to unknown error
  return new BookingError(ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]);
}

/**
 * Handle API errors with proper logging and user feedback
 */
export function handleApiError(error: any, context: string): BookingError {
  console.error(`API error in ${context}:`, error);
  
  if (error instanceof BookingError) {
    return error;
  }
  
  return handleSupabaseError(error);
}

/**
 * Create a user-friendly error message
 */
export function createUserFriendlyError(error: any): string {
  if (error instanceof BookingError) {
    return error.userMessage;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR].userMessage;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (error instanceof BookingError) {
    return error.code === ERROR_CODES.NETWORK_ERROR || 
           error.code === ERROR_CODES.TIMEOUT_ERROR;
  }
  
  return false;
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: any): 'low' | 'medium' | 'high' {
  if (error instanceof BookingError) {
    if (error.statusCode && error.statusCode >= 500) return 'high';
    if (error.statusCode && error.statusCode >= 400) return 'medium';
    return 'low';
  }
  
  return 'medium';
}
