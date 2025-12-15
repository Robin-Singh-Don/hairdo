import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import BottomBar from '../../components/BottomBar';
import { customerAPI } from '../../services/api/customerAPI';
import { UpcomingBooking } from '../../services/mock/AppMockData';
import { BOOKING_STATUS_COLORS, DEFAULT_SALON_IMAGE } from '../../constants/BookingConstants';

export default function MyBookingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const savedBookingsRef = useRef<UpcomingBooking[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load bookings from repository via getCustomerBookings
        const bookingSummaries = await customerAPI.getCustomerBookings({ status: 'upcoming' });
        
        // Transform BookingSummary to UpcomingBooking format for UI compatibility
        const transformedBookings: UpcomingBooking[] = bookingSummaries.map(booking => ({
          id: booking.id,
          service: booking.serviceNames.join(', ') || 'Service', // Combine service names
          salon: booking.salonName,
          barber: booking.employeeName,
          date: booking.scheduledDate,
          time: booking.scheduledTime,
          duration: `${booking.duration} min`,
          price: `$${booking.totalPrice.toFixed(2)}`,
          status: booking.status as 'confirmed' | 'pending' | 'cancelled',
          profileImage: booking.employeeImage,
          salonImage: booking.salonImage || DEFAULT_SALON_IMAGE,
          rating: 0, // Not used in display but required by type
          haircutPhoto: '',
          haircutDescription: '',
          mediaItems: [],
        }));
        
        let updatedBookings = transformedBookings;
        console.log('Initial bookings loaded:', updatedBookings.length);
        
        // Handle new booking from booking confirmation
        if (params.newBooking) {
          try {
            const newBooking = JSON.parse(params.newBooking as string);
            console.log('New booking data received:', newBooking);
            console.log('New booking ID:', newBooking.id);
            // Add the new booking to the beginning of the list
            updatedBookings = [newBooking, ...updatedBookings];
            console.log('Updated bookings after new booking:', updatedBookings.length);
          } catch (error) {
            console.error('Error parsing new booking:', error);
          }
        }
        
        // Handle cancelled booking
        if (params.cancelledBooking) {
          try {
            const cancelledData = JSON.parse(params.cancelledBooking as string);
            console.log('Cancelled booking data received:', cancelledData);
            console.log('Looking for booking ID:', cancelledData.id);
            
            // Update the booking status to cancelled
            updatedBookings = updatedBookings.map(booking => {
              if (booking.id === cancelledData.id) {
                console.log('Found and updating cancelled booking');
                return { ...booking, status: 'cancelled' };
              }
              return booking;
            });
          } catch (error) {
            console.error('Error parsing cancelled booking:', error);
          }
        }
        
        // Handle rescheduled booking
        if (params.rescheduledBooking) {
          try {
            const rescheduledData = JSON.parse(params.rescheduledBooking as string);
            console.log('Rescheduled booking data received:', rescheduledData);
            console.log('Looking for booking ID to reschedule:', rescheduledData.id);
            console.log('Existing booking IDs:', updatedBookings.map(b => b.id));
            
            // Update the booking with new reschedule information
            let bookingFound = false;
            updatedBookings = updatedBookings.map(booking => {
              if (booking.id === rescheduledData.id) {
                bookingFound = true;
                console.log('Found and updating rescheduled booking');
                console.log('Old booking:', booking);
                console.log('New data:', rescheduledData);
                return { 
                    ...booking, // Keep existing fields
                    ...rescheduledData, // Override with new data
                    // Ensure we use the new date/time/barber from the rescheduled data
                    date: rescheduledData.date || booking.date,
                    time: rescheduledData.time || booking.time,
                    barber: rescheduledData.barber || booking.barber,
                    status: rescheduledData.status || booking.status,
                  };
              }
              return booking;
            });
            
            if (!bookingFound) {
              console.warn('Booking not found for reschedule. Adding as new booking.');
              updatedBookings = [rescheduledData, ...updatedBookings];
            }
            
            console.log('Updated bookings after reschedule:', updatedBookings.length);
          } catch (error) {
            console.error('Error parsing rescheduled booking:', error);
          }
        }
        
        setUpcomingBookings(updatedBookings);
        savedBookingsRef.current = updatedBookings; // Save current state for when we navigate back
      } catch (error) {
        console.error('Error loading bookings data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Check if we're navigating back without params and have saved state
    if (!params.newBooking && !params.cancelledBooking && !params.rescheduledBooking && savedBookingsRef.current.length > 0) {
      // Restore saved bookings state
      setUpcomingBookings(savedBookingsRef.current);
      setLoading(false);
    } else {
      loadData();
    }
  }, [params.newBooking, params.cancelledBooking, params.rescheduledBooking]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading bookings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>

        <View style={styles.content}>
          {upcomingBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={Colors.light.textMuted} />
              <Text style={styles.emptyStateText}>No bookings found</Text>
              <Text style={styles.emptyStateSubtext}>Your upcoming appointments will appear here</Text>
            </View>
          ) : (
            <View style={styles.bookingsList}>
              {upcomingBookings.map((booking) => {
                console.log('Rendering booking:', booking.id, 'Service:', booking.service);
                return (
                <TouchableOpacity 
                  key={booking.id} 
                  style={styles.bookingCard}
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/(customer)/ActiveBookingDetails',
                    params: {
                      id: booking.id,
                      service: booking.service,
                      salon: booking.salon,
                      barber: booking.barber,
                      date: booking.date,
                      time: booking.time,
                      price: booking.price,
                      status: booking.status,
                      salonImage: booking.salonImage || DEFAULT_SALON_IMAGE, // Use centralized default
                      location: '9785, 132St, Vancouver',
                      phone: '(555) 123-4567',
                      duration: '45 min',
                    }
                  })}
                >
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.serviceName}>{booking.service}</Text>
                      <Text style={styles.salonName}>{booking.salon}</Text>
                      <Text style={styles.barberName}>with {booking.barber}</Text>
                    </View>
                    <View style={styles.bookingStatus}>
                      <Text style={styles.price}>{booking.price}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                        <Text style={styles.statusText}>
                          {booking.status === 'pending_reschedule' ? 'Pending Reschedule' : booking.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.bookingDetails}>
                    <View style={styles.timeInfo}>
                      <Ionicons name="time-outline" size={16} color={Colors.light.textMuted} />
                      <Text style={styles.timeText}>{booking.date} at {booking.time}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
      <BottomBar />
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  // Use centralized status colors
  return BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS] || Colors.light.textMuted;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  bookingsList: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  salonName: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginBottom: 2,
  },
  barberName: {
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  bookingStatus: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginLeft: 8,
  },
});
