// ========================================
// TIMEZONE HANDLING UTILITIES
// ========================================
// Proper timezone handling for global users
// ========================================

// In production, you might want to use a library like date-fns-tz or dayjs
// For now, we'll implement basic timezone handling

export interface TimezoneInfo {
  timezone: string;
  offset: number; // in minutes
  name: string;
}

export interface DateTimeWithTimezone {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timezone: string;
  utc: string; // ISO string
}

// ========================================
// 1. TIMEZONE DETECTION
// ========================================

/**
 * Get user's timezone from browser
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Could not detect timezone, falling back to UTC:', error);
    return 'UTC';
  }
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    return (targetTime.getTime() - utc.getTime()) / (1000 * 60);
  } catch (error) {
    console.warn('Could not calculate timezone offset:', error);
    return 0;
  }
}

/**
 * Get timezone information
 */
export function getTimezoneInfo(timezone: string): TimezoneInfo {
  return {
    timezone,
    offset: getTimezoneOffset(timezone),
    name: timezone
  };
}

// ========================================
// 2. DATE/TIME CONVERSION
// ========================================

/**
 * Convert local date/time to UTC
 */
export function toUTC(date: string, time: string, timezone: string): string {
  try {
    const localDateTime = `${date}T${time}:00`;
    const utcDateTime = new Date(localDateTime).toISOString();
    return utcDateTime;
  } catch (error) {
    console.error('Error converting to UTC:', error);
    throw new Error('Invalid date/time format');
  }
}

/**
 * Convert UTC to local date/time
 */
export function fromUTC(utcString: string, timezone: string): DateTimeWithTimezone {
  try {
    const date = new Date(utcString);
    const localDate = date.toLocaleDateString('en-CA', { timeZone: timezone }); // YYYY-MM-DD
    const localTime = date.toLocaleTimeString('en-GB', { 
      timeZone: timezone, 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }); // HH:MM
    
    return {
      date: localDate,
      time: localTime,
      timezone,
      utc: utcString
    };
  } catch (error) {
    console.error('Error converting from UTC:', error);
    throw new Error('Invalid UTC string');
  }
}

/**
 * Format date/time for display
 */
export function formatDateTime(
  utcString: string, 
  timezone: string, 
  format: 'short' | 'long' | 'time' | 'date' = 'short'
): string {
  try {
    const date = new Date(utcString);
    
    switch (format) {
      case 'short':
        return date.toLocaleString('en-US', { 
          timeZone: timezone,
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      
      case 'long':
        return date.toLocaleString('en-US', { 
          timeZone: timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      
      case 'time':
        return date.toLocaleTimeString('en-US', { 
          timeZone: timezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      
      case 'date':
        return date.toLocaleDateString('en-US', { 
          timeZone: timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      
      default:
        return date.toLocaleString('en-US', { timeZone: timezone });
    }
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return utcString;
  }
}

// ========================================
// 3. BUSINESS HOURS HANDLING
// ========================================

/**
 * Check if a time is within business hours
 */
export function isWithinBusinessHours(
  utcString: string,
  businessHours: {
    [key: string]: {
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
    };
  },
  businessTimezone: string
): boolean {
  try {
    const date = new Date(utcString);
    const dayOfWeek = date.toLocaleDateString('en-US', { 
      timeZone: businessTimezone,
      weekday: 'long'
    }).toLowerCase();
    
    const dayHours = businessHours[dayOfWeek];
    if (!dayHours || !dayHours.isOpen) {
      return false;
    }
    
    if (!dayHours.openTime || !dayHours.closeTime) {
      return true; // Open all day
    }
    
    const localTime = date.toLocaleTimeString('en-GB', { 
      timeZone: businessTimezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return localTime >= dayHours.openTime && localTime <= dayHours.closeTime;
  } catch (error) {
    console.error('Error checking business hours:', error);
    return false;
  }
}

/**
 * Get next available business day
 */
export function getNextBusinessDay(
  startDate: string,
  businessHours: {
    [key: string]: {
      isOpen: boolean;
    };
  },
  businessTimezone: string
): string {
  try {
    let date = new Date(startDate);
    let attempts = 0;
    const maxAttempts = 7; // Prevent infinite loop
    
    while (attempts < maxAttempts) {
      const dayOfWeek = date.toLocaleDateString('en-US', { 
        timeZone: businessTimezone,
        weekday: 'long'
      }).toLowerCase();
      
      const dayHours = businessHours[dayOfWeek];
      if (dayHours && dayHours.isOpen) {
        return date.toISOString().split('T')[0];
      }
      
      date.setDate(date.getDate() + 1);
      attempts++;
    }
    
    // Fallback to original date if no business day found
    return startDate;
  } catch (error) {
    console.error('Error getting next business day:', error);
    return startDate;
  }
}

// ========================================
// 4. APPOINTMENT TIME VALIDATION
// ========================================

/**
 * Validate appointment time considering timezone
 */
export function validateAppointmentTime(
  date: string,
  time: string,
  timezone: string,
  businessHours: {
    [key: string]: {
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
    };
  },
  businessTimezone: string
): {
  valid: boolean;
  error?: string;
  utcTime?: string;
} {
  try {
    // Convert to UTC
    const utcTime = toUTC(date, time, timezone);
    
    // Check if time is in the future
    const now = new Date();
    const appointmentTime = new Date(utcTime);
    
    if (appointmentTime <= now) {
      return {
        valid: false,
        error: 'Appointment time must be in the future'
      };
    }
    
    // Check if time is within business hours
    if (!isWithinBusinessHours(utcTime, businessHours, businessTimezone)) {
      return {
        valid: false,
        error: 'Appointment time is outside business hours'
      };
    }
    
    return {
      valid: true,
      utcTime
    };
  } catch (error) {
    console.error('Error validating appointment time:', error);
    return {
      valid: false,
      error: 'Invalid date/time format'
    };
  }
}

// ========================================
// 5. TIMEZONE CONVERSION HELPERS
// ========================================

/**
 * Convert appointment time to user's timezone for display
 */
export function convertToUserTimezone(
  utcString: string,
  userTimezone: string
): {
  date: string;
  time: string;
  formatted: string;
} {
  try {
    const dateTime = fromUTC(utcString, userTimezone);
    const formatted = formatDateTime(utcString, userTimezone, 'short');
    
    return {
      date: dateTime.date,
      time: dateTime.time,
      formatted
    };
  } catch (error) {
    console.error('Error converting to user timezone:', error);
    return {
      date: utcString.split('T')[0],
      time: utcString.split('T')[1].slice(0, 5),
      formatted: utcString
    };
  }
}

/**
 * Get timezone-aware time until appointment
 */
export function getTimeUntilAppointment(
  utcString: string,
  userTimezone: string
): string {
  try {
    const now = new Date();
    const appointmentTime = new Date(utcString);
    const diffMs = appointmentTime.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Past';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.error('Error calculating time until appointment:', error);
    return 'Unknown';
  }
}

// ========================================
// 6. COMMON TIMEZONES
// ========================================

export const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC'
] as const;

export type CommonTimezone = typeof COMMON_TIMEZONES[number];

/**
 * Check if timezone is supported
 */
export function isSupportedTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}
