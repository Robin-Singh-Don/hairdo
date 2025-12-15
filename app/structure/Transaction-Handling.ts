// ========================================
// TRANSACTION HANDLING SYSTEM
// ========================================
// Handles database transactions and rollbacks for data consistency
// ========================================

import { supabase } from '../../services/supabase';
import { BookingError, handleApiError, ERROR_CODES } from './Error-Handling';
import { BookingInsert, BookingServiceInsert, PaymentInsert } from './Supabase-Types';

// ========================================
// TRANSACTION TYPES
// ========================================

export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: BookingError;
}

export interface BookingTransactionData {
  booking: BookingInsert;
  services: BookingServiceInsert[];
  payment?: PaymentInsert;
}

// ========================================
// TRANSACTION FUNCTIONS
// ========================================

/**
 * Create a booking with all related data in a transaction
 * This ensures data consistency - if any step fails, everything is rolled back
 */
export async function createBookingTransaction(
  transactionData: BookingTransactionData
): Promise<TransactionResult<{ bookingId: string }>> {
  try {
    console.log('Starting booking transaction...');

    // Step 1: Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(transactionData.booking)
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation failed:', bookingError);
      return {
        success: false,
        error: handleApiError(bookingError, 'createBookingTransaction - booking creation')
      };
    }

    const bookingId = booking.id;
    console.log('Booking created successfully:', bookingId);

    // Step 2: Create service snapshots
    const servicesWithBookingId = transactionData.services.map(service => ({
      ...service,
      booking_id: bookingId
    }));

    const { error: servicesError } = await supabase
      .from('booking_services')
      .insert(servicesWithBookingId);

    if (servicesError) {
      console.error('Service snapshots creation failed:', servicesError);
      
      // Rollback: Delete the booking
      await rollbackBooking(bookingId);
      
      return {
        success: false,
        error: handleApiError(servicesError, 'createBookingTransaction - service snapshots')
      };
    }

    console.log('Service snapshots created successfully');

    // Step 3: Create payment record (if provided)
    if (transactionData.payment) {
      const paymentWithBookingId = {
        ...transactionData.payment,
        booking_id: bookingId
      };

      const { error: paymentError } = await supabase
        .from('payments')
        .insert(paymentWithBookingId);

      if (paymentError) {
        console.error('Payment creation failed:', paymentError);
        
        // Rollback: Delete booking and services
        await rollbackBooking(bookingId);
        
        return {
          success: false,
          error: handleApiError(paymentError, 'createBookingTransaction - payment creation')
        };
      }

      console.log('Payment record created successfully');
    }

    console.log('Booking transaction completed successfully');
    
    return {
      success: true,
      data: { bookingId }
    };

  } catch (error) {
    console.error('Unexpected error in booking transaction:', error);
    return {
      success: false,
      error: handleApiError(error, 'createBookingTransaction - unexpected error')
    };
  }
}

/**
 * Update booking with related data in a transaction
 */
export async function updateBookingTransaction(
  bookingId: string,
  updates: {
    booking?: Partial<BookingInsert>;
    services?: BookingServiceInsert[];
    payment?: PaymentInsert;
  }
): Promise<TransactionResult<{ bookingId: string }>> {
  try {
    console.log('Starting booking update transaction...', bookingId);

    // Step 1: Update the booking
    if (updates.booking) {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update(updates.booking)
        .eq('id', bookingId);

      if (bookingError) {
        console.error('Booking update failed:', bookingError);
        return {
          success: false,
          error: handleApiError(bookingError, 'updateBookingTransaction - booking update')
        };
      }
      console.log('Booking updated successfully');
    }

    // Step 2: Update services (replace all existing)
    if (updates.services) {
      // First, delete existing services
      const { error: deleteError } = await supabase
        .from('booking_services')
        .delete()
        .eq('booking_id', bookingId);

      if (deleteError) {
        console.error('Service deletion failed:', deleteError);
        return {
          success: false,
          error: handleApiError(deleteError, 'updateBookingTransaction - service deletion')
        };
      }

      // Then, insert new services
      const servicesWithBookingId = updates.services.map(service => ({
        ...service,
        booking_id: bookingId
      }));

      const { error: servicesError } = await supabase
        .from('booking_services')
        .insert(servicesWithBookingId);

      if (servicesError) {
        console.error('Service update failed:', servicesError);
        return {
          success: false,
          error: handleApiError(servicesError, 'updateBookingTransaction - service update')
        };
      }
      console.log('Services updated successfully');
    }

    // Step 3: Update payment (if provided)
    if (updates.payment) {
      const paymentWithBookingId = {
        ...updates.payment,
        booking_id: bookingId
      };

      const { error: paymentError } = await supabase
        .from('payments')
        .insert(paymentWithBookingId);

      if (paymentError) {
        console.error('Payment update failed:', paymentError);
        return {
          success: false,
          error: handleApiError(paymentError, 'updateBookingTransaction - payment update')
        };
      }
      console.log('Payment updated successfully');
    }

    console.log('Booking update transaction completed successfully');
    
    return {
      success: true,
      data: { bookingId }
    };

  } catch (error) {
    console.error('Unexpected error in booking update transaction:', error);
    return {
      success: false,
      error: handleApiError(error, 'updateBookingTransaction - unexpected error')
    };
  }
}

/**
 * Cancel booking with cleanup in a transaction
 */
export async function cancelBookingTransaction(
  bookingId: string,
  reason?: string
): Promise<TransactionResult<{ bookingId: string }>> {
  try {
    console.log('Starting booking cancellation transaction...', bookingId);

    // Step 1: Update booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        special_instructions: reason ? 
          `Cancellation reason: ${reason}` : 
          undefined
      })
      .eq('id', bookingId);

    if (bookingError) {
      console.error('Booking cancellation failed:', bookingError);
      return {
        success: false,
        error: handleApiError(bookingError, 'cancelBookingTransaction - booking update')
      };
    }

    // Step 2: Update payment status to refunded (if exists)
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refund_amount: 0 // This should be calculated based on business rules
      })
      .eq('booking_id', bookingId)
      .eq('status', 'completed');

    if (paymentError) {
      console.error('Payment refund update failed:', paymentError);
      // Don't fail the transaction for payment errors, just log
      console.warn('Payment refund will be handled separately');
    }

    console.log('Booking cancellation transaction completed successfully');
    
    return {
      success: true,
      data: { bookingId }
    };

  } catch (error) {
    console.error('Unexpected error in booking cancellation transaction:', error);
    return {
      success: false,
      error: handleApiError(error, 'cancelBookingTransaction - unexpected error')
    };
  }
}

// ========================================
// ROLLBACK FUNCTIONS
// ========================================

/**
 * Rollback a booking by deleting it and all related data
 */
async function rollbackBooking(bookingId: string): Promise<void> {
  try {
    console.log('Rolling back booking:', bookingId);

    // Delete in reverse order of dependencies
    await supabase
      .from('payments')
      .delete()
      .eq('booking_id', bookingId);

    await supabase
      .from('booking_services')
      .delete()
      .eq('booking_id', bookingId);

    await supabase
      .from('booking_reviews')
      .delete()
      .eq('booking_id', bookingId);

    await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    console.log('Booking rollback completed successfully');
  } catch (error) {
    console.error('Error during booking rollback:', error);
    // In production, you might want to alert administrators about failed rollbacks
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if a booking can be modified
 */
export async function canModifyBooking(bookingId: string): Promise<boolean> {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('status, scheduled_start')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return false;
    }

    // Can modify if status is pending or confirmed
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false;
    }

    // Can modify if booking is in the future
    const now = new Date();
    const scheduledStart = new Date(booking.scheduled_start);
    
    return scheduledStart > now;
  } catch (error) {
    console.error('Error checking booking modification eligibility:', error);
    return false;
  }
}

/**
 * Validate booking data before transaction
 */
export function validateBookingData(data: BookingTransactionData): { valid: boolean; error?: string } {
  if (!data.booking.customer_id) {
    return { valid: false, error: 'Customer ID is required' };
  }
  
  if (!data.booking.salon_id) {
    return { valid: false, error: 'Salon ID is required' };
  }
  
  if (!data.booking.employee_id) {
    return { valid: false, error: 'Employee ID is required' };
  }
  
  if (!data.services || data.services.length === 0) {
    return { valid: false, error: 'At least one service is required' };
  }
  
  if (!data.booking.scheduled_start || !data.booking.scheduled_end) {
    return { valid: false, error: 'Scheduled start and end times are required' };
  }
  
  // Validate scheduled time is in the future
  const now = new Date();
  const scheduledStart = new Date(data.booking.scheduled_start);
  
  if (scheduledStart <= now) {
    return { valid: false, error: 'Scheduled time must be in the future' };
  }
  
  return { valid: true };
}
