// ========================================
// SUPABASE INTEGRATION EXAMPLES
// ========================================
// Examples of how to use the optimized data structures with Supabase
// Now with improved type safety, error handling, and performance optimizations
// ========================================

import { supabase } from '../../services/supabase'; // Your Supabase client
import { Booking, BookingSummary, UpcomingBooking } from './CustomerBooking-DataStructure';
import { BookingCore, BookingServiceSnapshot } from './Database-Schema';
import { 
  BookingRow, 
  BookingServiceRow, 
  BookingReviewRow, 
  PaymentRow,
  SalonRow,
  EmployeeRow,
  CustomerRow,
  Database 
} from './Supabase-Types';
import { 
  BookingError, 
  handleApiError, 
  createUserFriendlyError,
  isRetryableError 
} from './Error-Handling';
import { 
  createBookingTransaction, 
  updateBookingTransaction, 
  cancelBookingTransaction,
  canModifyBooking,
  validateBookingData 
} from './Transaction-Handling';

// ========================================
// 1. FETCHING BOOKINGS WITH JOINS
// ========================================

/**
 * Example: Fetch customer bookings with all related data
 * This demonstrates the optimized approach with Supabase joins
 * Now with proper type safety and error handling
 */
export async function fetchCustomerBookings(customerId: string): Promise<{
  success: boolean;
  data?: Booking[];
  error?: BookingError;
}> {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                booking_services(
                    id,
                    service_id,
                    name,
                    category,
                    duration,
                    price
                ),
                booking_reviews(
                    id,
                    rating,
                    review_text,
                    photos,
                    is_anonymous,
                    created_at
                ),
                payments(
                    id,
                    amount,
                    method,
                    status,
                    transaction_id,
                    created_at
                ),
                salons(
                    name,
                    image
                ),
                employees(
                    display_name,
                    profile_image
                ),
                customers(
                    display_name,
                    profile_image
                )
            `)
            .eq('customer_id', customerId)
            .order('scheduled_start', { ascending: false });

        if (error) {
            console.error('Error fetching customer bookings:', error);
            return {
                success: false,
                error: handleApiError(error, 'fetchCustomerBookings')
            };
        }

        // Transform Supabase response to frontend DTOs
        const transformedBookings = bookings.map(transformToBooking);
        
        return {
            success: true,
            data: transformedBookings
        };

    } catch (error) {
        console.error('Unexpected error in fetchCustomerBookings:', error);
        return {
            success: false,
            error: handleApiError(error, 'fetchCustomerBookings - unexpected error')
        };
    }
}

/**
 * Example: Fetch booking summaries for list views
 * This is optimized for performance - only fetches what's needed
 */
export async function fetchBookingSummaries(customerId: string): Promise<BookingSummary[]> {
    const { data: bookings, error } = await supabase
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
        `)
        .eq('customer_id', customerId)
        .order('scheduled_start', { ascending: false });

    if (error) throw error;

    return bookings.map(transformToBookingSummary);
}

/**
 * Example: Fetch upcoming bookings for dashboard
 * Optimized for dashboard performance
 */
export async function fetchUpcomingBookings(customerId: string): Promise<UpcomingBooking[]> {
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
        .limit(5);

    if (error) throw error;

    return bookings.map(transformToUpcomingBooking);
}

// ========================================
// 2. CREATING BOOKINGS
// ========================================

/**
 * Example: Create a new booking using transactions
 * This demonstrates the normalized approach with proper error handling
 */
export async function createBooking(bookingData: {
    customerId: string;
    salonId: string;
    employeeId: string;
    serviceIds: string[];
    scheduledDate: string;
    scheduledTime: string;
    specialInstructions?: string;
    paymentMethodId: string;
}): Promise<{
    success: boolean;
    data?: Booking;
    error?: BookingError;
}> {
    try {
        // 1. First, get service details for snapshot
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('id, name, category, duration, price')
            .in('id', bookingData.serviceIds);

        if (servicesError) {
            console.error('Error fetching services:', servicesError);
            return {
                success: false,
                error: handleApiError(servicesError, 'createBooking - fetch services')
            };
        }

        if (!services || services.length === 0) {
            return {
                success: false,
                error: new BookingError({
                    code: 'SERVICE_NOT_FOUND',
                    message: 'No services found',
                    userMessage: 'The selected services are no longer available. Please try again.',
                    statusCode: 404
                })
            };
        }

        // 2. Calculate total duration and price
        const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
        const totalPrice = services.reduce((sum, service) => sum + service.price, 0);
        
        // 3. Prepare transaction data
        const transactionData = {
            booking: {
                customer_id: bookingData.customerId,
                salon_id: bookingData.salonId,
                employee_id: bookingData.employeeId,
                scheduled_start: `${bookingData.scheduledDate}T${bookingData.scheduledTime}:00.000Z`,
                scheduled_end: calculateEndTime(bookingData.scheduledDate, bookingData.scheduledTime, totalDuration),
                status: 'pending' as const,
                payment_status: 'unpaid' as const,
                base_price: totalPrice,
                discount_amount: 0,
                tax_amount: 0,
                total_price: totalPrice,
                special_instructions: bookingData.specialInstructions,
                payment_method_id: bookingData.paymentMethodId,
                points_earned: 0,
                points_redeemed: 0
            },
            services: services.map(service => ({
                service_id: service.id,
                name: service.name,
                category: service.category,
                duration: service.duration,
                price: service.price
            })),
            payment: {
                amount: totalPrice,
                method: 'card', // This should come from payment method details
                status: 'pending' as const
            }
        };

        // 4. Validate transaction data
        const validation = validateBookingData(transactionData);
        if (!validation.valid) {
            return {
                success: false,
                error: new BookingError({
                    code: 'INVALID_BOOKING_DATA',
                    message: validation.error || 'Invalid booking data',
                    userMessage: 'Please check your booking details and try again.',
                    statusCode: 400
                })
            };
        }

        // 5. Execute transaction
        const result = await createBookingTransaction(transactionData);
        
        if (!result.success) {
            return result;
        }

        // 6. Fetch complete booking with joins
        const fetchResult = await fetchCustomerBookings(bookingData.customerId);
        
        if (!fetchResult.success) {
            return fetchResult;
        }

        const booking = fetchResult.data?.find(b => b.core.id === result.data?.bookingId);
        
        if (!booking) {
            return {
                success: false,
                error: new BookingError({
                    code: 'BOOKING_NOT_FOUND',
                    message: 'Booking not found after creation',
                    userMessage: 'Your booking was created but we couldn\'t retrieve it. Please refresh and try again.',
                    statusCode: 404
                })
            };
        }

        return {
            success: true,
            data: booking
        };

    } catch (error) {
        console.error('Unexpected error in createBooking:', error);
        return {
            success: false,
            error: handleApiError(error, 'createBooking - unexpected error')
        };
    }
}

// ========================================
// 3. TRANSFORMATION FUNCTIONS
// ========================================

/**
 * Transform Supabase response to Booking DTO
 * Now with proper type safety using Supabase generated types
 */
function transformToBooking(supabaseData: BookingRow & {
    booking_services: BookingServiceRow[];
    booking_reviews: BookingReviewRow[];
    payments: PaymentRow[];
    salons: SalonRow;
    employees: EmployeeRow;
    customers: CustomerRow;
}): Booking {
    return {
        core: {
            id: supabaseData.id,
            customerId: supabaseData.customer_id,
            salonId: supabaseData.salon_id,
            employeeId: supabaseData.employee_id,
            scheduledStart: supabaseData.scheduled_start,
            scheduledEnd: supabaseData.scheduled_end,
            status: supabaseData.status,
            paymentStatus: supabaseData.payment_status,
            basePrice: supabaseData.base_price,
            discountAmount: supabaseData.discount_amount,
            taxAmount: supabaseData.tax_amount,
            totalPrice: supabaseData.total_price,
            specialInstructions: supabaseData.special_instructions,
            preferredEmployeeId: supabaseData.preferred_employee_id,
            paymentMethodId: supabaseData.payment_method_id,
            paymentIntentId: supabaseData.payment_intent_id,
            pointsEarned: supabaseData.points_earned,
            pointsRedeemed: supabaseData.points_redeemed,
            createdAt: supabaseData.created_at,
            updatedAt: supabaseData.updated_at,
            confirmedAt: supabaseData.confirmed_at,
            cancelledAt: supabaseData.cancelled_at,
            completedAt: supabaseData.completed_at
        },
        services: supabaseData.booking_services || [],
        review: supabaseData.booking_reviews?.[0],
        payments: supabaseData.payments || [],
        salonName: supabaseData.salons?.name || '',
        salonImage: supabaseData.salons?.image || '',
        employeeName: supabaseData.employees?.display_name || '',
        employeeImage: supabaseData.employees?.profile_image || '',
        customerName: supabaseData.customers?.display_name || '',
        customerImage: supabaseData.customers?.profile_image || '',
        duration: supabaseData.booking_services?.reduce((sum: number, s: any) => sum + s.duration, 0) || 0,
        serviceNames: supabaseData.booking_services?.map((s: any) => s.name) || [],
        canCancel: supabaseData.status === 'confirmed',
        canReschedule: supabaseData.status === 'confirmed',
        canReview: supabaseData.status === 'completed' && !supabaseData.booking_reviews?.length
    };
}

/**
 * Transform Supabase response to BookingSummary DTO
 */
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

/**
 * Transform Supabase response to UpcomingBooking DTO
 */
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

// ========================================
// 4. UTILITY FUNCTIONS
// ========================================

function calculateEndTime(date: string, time: string, duration: number): string {
    const startDateTime = new Date(`${date}T${time}:00.000Z`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
    return endDateTime.toISOString();
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
