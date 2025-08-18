import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Generate sample staff data (same as in SalonDetailsScreen)
const sampleStaffNames = [
  'Shark.11', 'Alex B.', 'Jamie S.', 'Taylor R.', 'Jordan P.', 'Morgan K.', 'Chris D.', 'Sam T.'
];
const sampleStaffPhotos = [
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=center',
];

export default function AllBarbersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const salonName = params.salonName as string || "Man's Cave Salon";
  const salonImage = params.salonImage as string;
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  
  // Generate all staff data
  const allStaff = Array.from({ length: 8 }).map((_, i) => ({
    id: (i + 1).toString(),
    name: sampleStaffNames[i % sampleStaffNames.length],
    role: "+ Men's hair Salon",
    status: 'Available',
    rating: `${90 + (i % 10)}%`,
    photo: { uri: sampleStaffPhotos[i % sampleStaffPhotos.length] },
    tag: `${3 + i} Pendings, ${1 + i}h ${35 - i * 2} min`,
    locked: i % 2 === 1,
  }));

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
        <Text style={styles.headerTitle}>All Barbers</Text>
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
          <Text style={styles.salonStatus}>{allStaff.length} Barbers Available</Text>
        </View>
      </View>

      {/* Barbers List */}
      <ScrollView style={styles.barbersList} showsVerticalScrollIndicator={false}>
        {allStaff.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.barberCard}
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: '/BarberProfileScreen',
              params: {
                name: member.name,
                photo: member.photo.uri,
                rating: member.rating,
                selectedService: selectedService,
                selectedServiceLabel: selectedServiceLabel,
                salonName: salonName,
                // add more as needed
              }
            })}
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
          </TouchableOpacity>
        ))}
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