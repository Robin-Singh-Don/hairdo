// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================
// Lightweight queries and caching strategies for better performance
// ========================================

import { supabase } from '../../services/supabase';
import { BookingSummary, UpcomingBooking } from './CustomerBooking-DataStructure';
import { BookingError, handleApiError } from './Error-Handling';

// ========================================
// 1. LIGHTWEIGHT QUERIES
// ========================================

/**
 * Fetch booking summaries with minimal data
 * Optimized for list views and dashboards
 */
export async function fetchBookingSummariesLightweight(
  customerId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{
  success: boolean;
  data?: BookingSummary[];
  error?: BookingError;
  hasMore?: boolean;
}> {
  try {
    const { data: bookings, error, count } = await supabase
      .from('bookings')
      .select(`
        id,
        scheduled_start,
        scheduled_end,
        status,
        total_price,
        booking_services(name, duration),
        salons(name, image),
        employees(display_name, profile_image)
      `, { count: 'exact' })
      .eq('customer_id', customerId)
      .order('scheduled_start', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching booking summaries:', error);
      return {
        success: false,
        error: handleApiError(error, 'fetchBookingSummariesLightweight')
      };
    }

    const transformedBookings = bookings.map(transformToBookingSummary);
    const hasMore = count ? offset + limit < count : false;

    return {
      success: true,
      data: transformedBookings,
      hasMore
    };

  } catch (error) {
    console.error('Unexpected error in fetchBookingSummariesLightweight:', error);
    return {
      success: false,
      error: handleApiError(error, 'fetchBookingSummariesLightweight - unexpected error')
    };
  }
}

/**
 * Fetch upcoming bookings with minimal data
 * Optimized for dashboard widgets
 */
export async function fetchUpcomingBookingsLightweight(
  customerId: string,
  limit: number = 5
): Promise<{
  success: boolean;
  data?: UpcomingBooking[];
  error?: BookingError;
}> {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        scheduled_start,
        scheduled_end,
        status,
        total_price,
        booking_services(name, duration, price),
        salons(name, image),
        employees(display_name, profile_image)
      `)
      .eq('customer_id', customerId)
      .eq('status', 'confirmed')
      .gte('scheduled_start', new Date().toISOString())
      .order('scheduled_start', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming bookings:', error);
      return {
        success: false,
        error: handleApiError(error, 'fetchUpcomingBookingsLightweight')
      };
    }

    const transformedBookings = bookings.map(transformToUpcomingBooking);

    return {
      success: true,
      data: transformedBookings
    };

  } catch (error) {
    console.error('Unexpected error in fetchUpcomingBookingsLightweight:', error);
    return {
      success: false,
      error: handleApiError(error, 'fetchUpcomingBookingsLightweight - unexpected error')
    };
  }
}

/**
 * Fetch booking count for dashboard
 * Ultra-lightweight query for counters
 */
export async function fetchBookingCounts(
  customerId: string
): Promise<{
  success: boolean;
  data?: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  error?: BookingError;
}> {
  try {
    const [totalResult, upcomingResult, completedResult, cancelledResult] = await Promise.all([
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customerId),
      
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .eq('status', 'confirmed')
        .gte('scheduled_start', new Date().toISOString()),
      
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .eq('status', 'completed'),
      
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .eq('status', 'cancelled')
    ]);

    // Check for errors
    const errors = [totalResult.error, upcomingResult.error, completedResult.error, cancelledResult.error];
    const hasError = errors.some(error => error !== null);
    
    if (hasError) {
      console.error('Error fetching booking counts:', errors);
      return {
        success: false,
        error: handleApiError(errors.find(e => e)!, 'fetchBookingCounts')
      };
    }

    return {
      success: true,
      data: {
        total: totalResult.count || 0,
        upcoming: upcomingResult.count || 0,
        completed: completedResult.count || 0,
        cancelled: cancelledResult.count || 0
      }
    };

  } catch (error) {
    console.error('Unexpected error in fetchBookingCounts:', error);
    return {
      success: false,
      error: handleApiError(error, 'fetchBookingCounts - unexpected error')
    };
  }
}

// ========================================
// 2. CACHING STRATEGIES
// ========================================

/**
 * Simple in-memory cache for frequently accessed data
 * In production, consider using Redis or a proper caching solution
 */
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const cache = new SimpleCache();

/**
 * Cached version of fetchBookingCounts
 * Reduces database load for frequently accessed data
 */
export async function fetchBookingCountsCached(
  customerId: string,
  ttl: number = 2 * 60 * 1000 // 2 minutes
): Promise<{
  success: boolean;
  data?: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  error?: BookingError;
}> {
  const cacheKey = `booking_counts_${customerId}`;
  
  // Try to get from cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      success: true,
      data: cached
    };
  }

  // If not in cache, fetch from database
  const result = await fetchBookingCounts(customerId);
  
  // Cache successful results
  if (result.success && result.data) {
    cache.set(cacheKey, result.data, ttl);
  }

  return result;
}

/**
 * Cached version of fetchUpcomingBookingsLightweight
 */
export async function fetchUpcomingBookingsCached(
  customerId: string,
  limit: number = 5,
  ttl: number = 1 * 60 * 1000 // 1 minute
): Promise<{
  success: boolean;
  data?: UpcomingBooking[];
  error?: BookingError;
}> {
  const cacheKey = `upcoming_bookings_${customerId}_${limit}`;
  
  // Try to get from cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      success: true,
      data: cached
    };
  }

  // If not in cache, fetch from database
  const result = await fetchUpcomingBookingsLightweight(customerId, limit);
  
  // Cache successful results
  if (result.success && result.data) {
    cache.set(cacheKey, result.data, ttl);
  }

  return result;
}

// ========================================
// 3. PAGINATION UTILITIES
// ========================================

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Generic pagination helper
 */
export function calculatePagination(page: number, limit: number, total: number): {
  offset: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    offset,
    totalPages,
    hasNext,
    hasPrev
  };
}

/**
 * Fetch bookings with pagination
 */
export async function fetchBookingsPaginated(
  customerId: string,
  params: PaginationParams
): Promise<{
  success: boolean;
  data?: PaginatedResult<BookingSummary>;
  error?: BookingError;
}> {
  try {
    const { page, limit } = params;
    const offset = params.offset ?? (page - 1) * limit;

    const { data: bookings, error, count } = await supabase
      .from('bookings')
      .select(`
        id,
        scheduled_start,
        scheduled_end,
        status,
        total_price,
        booking_services(name, duration),
        salons(name, image),
        employees(display_name, profile_image)
      `, { count: 'exact' })
      .eq('customer_id', customerId)
      .order('scheduled_start', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching paginated bookings:', error);
      return {
        success: false,
        error: handleApiError(error, 'fetchBookingsPaginated')
      };
    }

    const transformedBookings = bookings.map(transformToBookingSummary);
    const total = count || 0;
    const pagination = calculatePagination(page, limit, total);

    return {
      success: true,
      data: {
        data: transformedBookings,
        pagination: {
          page,
          limit,
          total,
          totalPages: pagination.totalPages,
          hasNext: pagination.hasNext,
          hasPrev: pagination.hasPrev
        }
      }
    };

  } catch (error) {
    console.error('Unexpected error in fetchBookingsPaginated:', error);
    return {
      success: false,
      error: handleApiError(error, 'fetchBookingsPaginated - unexpected error')
    };
  }
}

// ========================================
// 4. TRANSFORMATION FUNCTIONS
// ========================================

function transformToBookingSummary(supabaseData: any): BookingSummary {
  return {
    id: supabaseData.id,
    salonName: supabaseData.salons?.name || '',
    salonImage: supabaseData.salons?.image || '',
    employeeName: supabaseData.employees?.display_name || '',
    employeeImage: supabaseData.employees?.profile_image || '',
    serviceNames: supabaseData.booking_services?.map((s: any) => s.name) || [],
    scheduledDate: supabaseData.scheduled_start.split('T')[0],
    scheduledTime: supabaseData.scheduled_start.split('T')[1].slice(0, 5),
    duration: supabaseData.booking_services?.reduce((sum: number, s: any) => sum + s.duration, 0) || 0,
    status: supabaseData.status,
    totalPrice: supabaseData.total_price,
    canCancel: supabaseData.status === 'confirmed',
    canReschedule: supabaseData.status === 'confirmed',
    canReview: supabaseData.status === 'completed'
  };
}

function transformToUpcomingBooking(supabaseData: any): UpcomingBooking {
  const scheduledDate = new Date(supabaseData.scheduled_start);
  const now = new Date();
  const isToday = scheduledDate.toDateString() === now.toDateString();
  const isTomorrow = scheduledDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  
  return {
    id: supabaseData.id,
    salonName: supabaseData.salons?.name || '',
    salonImage: supabaseData.salons?.image || '',
    employeeName: supabaseData.employees?.display_name || '',
    employeeImage: supabaseData.employees?.profile_image || '',
    serviceName: supabaseData.booking_services?.[0]?.name || '',
    scheduledDate: supabaseData.scheduled_start.split('T')[0],
    scheduledTime: supabaseData.scheduled_start.split('T')[1].slice(0, 5),
    duration: supabaseData.booking_services?.reduce((sum: number, s: any) => sum + s.duration, 0) || 0,
    status: supabaseData.status,
    totalPrice: supabaseData.total_price,
    isToday,
    isTomorrow,
    timeUntilAppointment: calculateTimeUntil(supabaseData.scheduled_start)
  };
}

function calculateTimeUntil(scheduledStart: string): string {
  const now = new Date();
  const scheduled = new Date(scheduledStart);
  const diffMs = scheduled.getTime() - now.getTime();
  
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
}

// ========================================
// 5. CACHE MANAGEMENT
// ========================================

/**
 * Clear cache for a specific customer
 */
export function clearCustomerCache(customerId: string): void {
  const patterns = [
    `booking_counts_${customerId}`,
    `upcoming_bookings_${customerId}`,
    `booking_summaries_${customerId}`
  ];
  
  patterns.forEach(pattern => {
    cache.delete(pattern);
  });
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear();
}
