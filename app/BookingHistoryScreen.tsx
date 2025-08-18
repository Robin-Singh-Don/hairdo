import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import BottomBar from '../components/BottomBar';

// Mock booking history data
// To test the "no bookings" state, change this to an empty array: []
const mockBookings = [
  {
    id: '1',
    salonName: "Man's Cave Salon",
    barberName: 'Shark.11',
    service: 'Haircut & Beard Trim',
    date: 'July 15, 2024',
    time: '9:30 AM',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center',
  },
  {
    id: '2',
    salonName: 'Elite Barbershop',
    barberName: 'Alex B.',
    service: 'Fade & Design',
    date: 'June 22, 2024',
    time: '2:00 PM',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&h=100&fit=crop&crop=center',
  },
  {
    id: '3',
    salonName: 'Classic Cuts',
    barberName: 'Jamie S.',
    service: 'Beard Trim',
    date: 'May 10, 2024',
    time: '11:00 AM',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=100&h=100&fit=crop&crop=center',
  },
];

export default function BookingHistoryScreen() {
  const router = useRouter();
  // You can toggle this to false to see the "no bookings" state
  const hasBookings = mockBookings.length > 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking History</Text>
          <View style={{ width: 40 }} />
        </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {hasBookings ? (
            // Show booking history
            <View>
              <Text style={styles.sectionTitle}>Your Previous Bookings</Text>
              {mockBookings.map((booking) => (
                                 <TouchableOpacity key={booking.id} style={styles.bookingCard}>
                   <View style={styles.bookingHeader}>
                     <Image source={{ uri: booking.image }} style={styles.salonImage} />
                     <View style={styles.bookingInfo}>
                       <Text style={styles.salonName}>{booking.salonName}</Text>
                       <Text style={styles.barberName}>Barber: {booking.barberName}</Text>
                       <Text style={styles.serviceName}>{booking.service}</Text>
                     </View>
                     <View style={styles.statusContainer}>
                       <View style={[styles.statusBadge, styles.completedBadge]}>
                         <Text style={styles.statusText}>Completed</Text>
                       </View>
                     </View>
                   </View>
                                       <View style={styles.bookingDetails}>
                      <View style={styles.detailsRow}>
                        <View style={styles.dateTimeContainer}>
                          <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={16} color="#666" />
                            <Text style={styles.detailText}>{booking.date}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.detailText}>{booking.time}</Text>
                          </View>
                        </View>
                        <TouchableOpacity style={styles.rebookBtn}>
                          <Text style={styles.rebookBtnText}>Book Again</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                 </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Show no bookings message
            <View style={styles.noBookingsContainer}>
              <Ionicons name="calendar-outline" size={64} color="#CCC" style={{ marginBottom: 16 }} />
              <Text style={styles.noBookingsTitle}>No Booking History</Text>
              <Text style={styles.noBookingsText}>
                You haven't made any bookings yet. Start exploring salons and book your first appointment!
              </Text>
              <TouchableOpacity 
                style={styles.exploreBtn}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={styles.exploreBtnText}>Explore Salons</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomBar />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  contentWrapper: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  salonImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 10,
  },
  bookingInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  barberName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 13,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  completedBadge: {
    backgroundColor: '#E8F5E8',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#03A100',
  },
  bookingDetails: {
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  dateTimeContainer: {
    alignItems: 'flex-start',
  },
  rebookBtn: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 100,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rebookBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  noBookingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  noBookingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  noBookingsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreBtn: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 