import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { customerAPI } from '../../services/api/customerAPI';
import { StaffMember } from '../../services/mock/AppMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AllBarbersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // API state
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const salonName = params.salonName as string || "Man's Cave Salon";
  const salonImage = params.salonImage as string;
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  const selectedServicesJson = params.selectedServicesJson as string;
  const rescheduleBookingId = params.rescheduleBookingId as string;
  const source = params.source as string;
  const currentBarber = params.currentBarber as string;
  
  // Original booking details for reschedule flow
  const originalDate = params.originalDate as string;
  const originalTime = params.originalTime as string;
  const originalBarber = params.originalBarber as string;
  
  // Booking details to preserve
  const bookingPrice = params.bookingPrice as string;
  const bookingLocation = params.bookingLocation as string;
  const bookingPhone = params.bookingPhone as string;
  const bookingDuration = params.bookingDuration as string;

  // Load staff data from API
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        setLoading(true);
        const data = await customerAPI.getStaffMembers();
        setStaffMembers(data);
      } catch (error) {
        console.error('Error loading staff data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStaffData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading barbers...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {source === 'reschedule' ? 'Reschedule Booking' : 'All Barbers'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Salon Info */}
      <View style={styles.salonInfoContainer}>
        <Image
          source={{ uri: salonImage || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center' }}
          style={styles.salonImage}
        />
        <View style={styles.salonDetails}>
          <Text style={styles.salonName}>{salonName}</Text>
          <Text style={styles.salonStatus}>{staffMembers.length} Barbers Available</Text>
        </View>
      </View>

      {/* Barbers List */}
      <ScrollView style={styles.barbersList} showsVerticalScrollIndicator={false}>
        {staffMembers.map((member) => {
          const isCurrentBarber = member.name === currentBarber;
          const handleBarberPress = () => {
            if (source === 'reschedule') {
              // Navigate to time slots for rescheduling
              router.push({
                pathname: '/(customer)/all-slots',
                params: {
                  barberName: member.name,
                  barberPhoto: member.photo.uri,
                  salonName: salonName,
                  salonImage: salonImage || '',
                  selectedService: selectedService,
                  rescheduleBookingId: rescheduleBookingId,
                  source: 'reschedule',
                  // Pass original booking details
                  originalDate: originalDate || '',
                  originalTime: originalTime || '',
                  originalBarber: originalBarber || '',
                  // Pass booking details to preserve them
                  bookingPrice: bookingPrice || '',
                  bookingLocation: bookingLocation || '',
                  bookingPhone: bookingPhone || '',
                  bookingDuration: bookingDuration || '',
                }
              });
            } else {
              // Navigate to barber profile for regular booking
              router.push({
                pathname: '/(customer)/BarberProfileScreen',
                params: {
                  name: member.name,
                  photo: member.photo.uri,
                  rating: member.rating,
                  selectedService: selectedService,
                  selectedServiceLabel: selectedServiceLabel,
                  selectedServicesJson: selectedServicesJson,
                  salonName: salonName,
                }
              });
            }
          };

          return (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.barberCard,
                isCurrentBarber && styles.currentBarberCard
              ]}
              activeOpacity={0.8}
              onPress={handleBarberPress}
            >
            <Image source={member.photo} style={styles.barberPhoto} />
            <View style={styles.barberInfo}>
              <View style={styles.barberHeader}>
                <Text style={styles.barberName}>{member.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="thumbs-up-outline" size={18} color="#000" />
                  <Text style={styles.ratingText}> {member.rating}</Text>
                </View>
              </View>
              <Text style={styles.barberRole}>{member.role}</Text>
              <Text style={styles.barberStatus}>{member.status}</Text>
              <View style={styles.barberStats}>
                <Text style={styles.barberTag}>{member.tag}</Text>
              </View>
            </View>
            {isCurrentBarber && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  salonInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  salonImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  salonDetails: {
    flex: 1,
  },
  salonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  salonStatus: {
    fontSize: 13,
    color: '#03A100',
    fontWeight: '500',
  },
  barbersList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  barberCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  currentBarberCard: {
    borderColor: '#03A100',
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
  },
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#03A100',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  barberPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  barberInfo: {
    flex: 1,
  },
  barberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  barberRole: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  barberStatus: {
    fontSize: 13,
    color: '#03A100',
    marginBottom: 4,
    fontWeight: '500',
  },
  barberStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberTag: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
}); 