import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Available barbers data
const availableBarbers = [
  {
    id: '1',
    name: 'Shark.11',
    photo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center',
    rating: 4.8,
    experience: '5 years',
    specialties: ['Fade', 'Beard Trim', 'Classic Cut'],
    nextSlot: '15 min',
    estimatedTime: '45 min',
    price: '$35'
  },
  {
    id: '2',
    name: 'Alex B.',
    photo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&h=100&fit=crop&crop=center',
    rating: 4.9,
    experience: '3 years',
    specialties: ['Modern Fade', 'Design', 'Kids Cut'],
    nextSlot: '20 min',
    estimatedTime: '40 min',
    price: '$30'
  },
  {
    id: '3',
    name: 'Jamie S.',
    photo: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=100&h=100&fit=crop&crop=center',
    rating: 4.7,
    experience: '7 years',
    specialties: ['Premium Cut', 'Beard Styling', 'Color'],
    nextSlot: '10 min',
    estimatedTime: '50 min',
    price: '$40'
  },
  {
    id: '4',
    name: 'Taylor R.',
    photo: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=100&h=100&fit=crop&crop=center',
    rating: 4.6,
    experience: '4 years',
    specialties: ['Quick Cut', 'Fade', 'Beard Trim'],
    nextSlot: '5 min',
    estimatedTime: '35 min',
    price: '$25'
  }
];

export default function BookDirectlyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  
  const salonName = params.salonName as string || "Man's Cave Salon";
  const salonImage = params.salonImage as string;

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarber(barberId);
    
    // Find the selected barber
    const selectedBarberData = availableBarbers.find(barber => barber.id === barberId);
    
    if (selectedBarberData) {
      // Calculate next available time slot (current time + nextSlot)
      const now = new Date();
      const nextSlotMinutes = parseInt(selectedBarberData.nextSlot.replace(' min', ''));
      const nextSlotTime = new Date(now.getTime() + nextSlotMinutes * 60000);
      
      // Format the time for display
      const nextSlotTimeString = nextSlotTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      // Navigate directly to booking confirmation with ASAP appointment
      router.push({
        pathname: '/booking-confirmation',
        params: {
          barberName: selectedBarberData.name,
          barberPhoto: selectedBarberData.photo,
          salonName: salonName,
          selectedDate: 'Today',
          selectedTime: nextSlotTimeString,
          source: 'book-directly-asap',
          selectedService: '',
          selectedServiceLabel: 'ASAP Appointment',
          // Add default services for ASAP booking
          selectedServicesJson: JSON.stringify([
            {
              key: 'hair',
              label: 'Haircut & Styling',
              price: parseInt(selectedBarberData.price.replace('$', ''))
            }
          ])
        }
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={14} color="#FFD700" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="star-half" name="star-half" size={14} color="#FFD700" />
      );
    }
    
    // Add empty stars to complete 5 stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`star-empty-${i}`} name="star-outline" size={14} color="#FFD700" />
      );
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Directly</Text>
        <View style={{ width: 40 }} />
      </View>



      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.statText}>{availableBarbers.length} Barbers Available</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color="#03A100" />
          <Text style={styles.statText}>Next Slot: 5 min</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.statText}>Avg Rating: 4.8</Text>
        </View>
      </View>

      {/* Available Barbers */}
      <View style={styles.barbersSection}>
        <Text style={styles.sectionTitle}>Available Barbers</Text>
        <Text style={styles.sectionSubtitle}>Select any barber for immediate booking</Text>
        
        <ScrollView style={styles.barbersList} showsVerticalScrollIndicator={false}>
          {availableBarbers.map((barber) => (
            <TouchableOpacity
              key={barber.id}
              style={[
                styles.barberCard,
                selectedBarber === barber.id && styles.selectedBarberCard
              ]}
              activeOpacity={0.8}
              onPress={() => handleBarberSelect(barber.id)}
            >
              <Image source={{ uri: barber.photo }} style={styles.barberPhoto} />
              <View style={styles.barberInfo}>
                                 <View style={styles.barberHeader}>
                   <Text style={styles.barberName}>{barber.name}</Text>
                   <View style={styles.ratingContainer}>
                     <Ionicons name="star" size={14} color="#FFD700" />
                     <Text style={styles.ratingText}>{barber.rating}</Text>
                   </View>
                 </View>
                
                <Text style={styles.barberExperience}>{barber.experience} experience</Text>
                
                <View style={styles.specialtiesContainer}>
                  {barber.specialties.map((specialty, index) => (
                    <View key={index} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.barberStats}>
                  <View style={styles.statRow}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.statText}>Next: {barber.nextSlot}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Ionicons name="timer-outline" size={14} color="#666" />
                    <Text style={styles.statText}>Est: {barber.estimatedTime}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Ionicons name="cash-outline" size={14} color="#666" />
                    <Text style={styles.statText}>From {barber.price}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.bookButton}>
                <Ionicons name="flash" size={16} color="#fff" />
                <Text style={styles.bookButtonText}>Book Now</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Info */}
      <View style={styles.quickInfoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle" size={16} color="#666" />
          <Text style={styles.infoText}>No appointment needed</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle" size={16} color="#03A100" />
          <Text style={styles.infoText}>Instant confirmation</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="card" size={16} color="#666" />
          <Text style={styles.infoText}>Pay at salon</Text>
        </View>
      </View>
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  barbersSection: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  barbersList: {
    flex: 1,
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
  },
  selectedBarberCard: {
    borderColor: '#FF6B00',
    backgroundColor: '#fff8f0',
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  barberExperience: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  specialtyTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  barberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  quickInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
}); 