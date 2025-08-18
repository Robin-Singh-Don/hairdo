import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SALON_CARD_WIDTH = 360;

// Extended salon data with more salons and ratings
const allSalons = [
  {
    id: '1',
    name: "Man's Cave Salon",
    city: 'Vancouver',
    barbers: 8,
    rating: 4.8,
    posts: 78,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
    distance: '0.2 km',
    priceRange: '$$'
  },
  {
    id: '2',
    name: 'Elite Barbershop',
    city: 'Vancouver',
    barbers: 12,
    rating: 4.9,
    posts: 120,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
    distance: '0.5 km',
    priceRange: '$$$'
  },
  {
    id: '3',
    name: 'Classic Cuts',
    city: 'Vancouver',
    barbers: 6,
    rating: 4.4,
    posts: 45,
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center',
    distance: '0.8 km',
    priceRange: '$'
  },
  {
    id: '4',
    name: 'Downtown Barbers',
    city: 'Vancouver',
    barbers: 10,
    rating: 4.6,
    posts: 89,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop&crop=center',
    distance: '1.2 km',
    priceRange: '$$'
  },
  {
    id: '5',
    name: 'Hair Masters',
    city: 'Vancouver',
    barbers: 15,
    rating: 5.0,
    posts: 156,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
    distance: '0.3 km',
    priceRange: '$$$'
  },
  {
    id: '6',
    name: 'Beard & Blade',
    city: 'Vancouver',
    barbers: 7,
    rating: 4.6,
    posts: 67,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
    distance: '1.5 km',
    priceRange: '$$'
  },
  {
    id: '7',
    name: 'Premium Cuts',
    city: 'Vancouver',
    barbers: 9,
    rating: 4.7,
    posts: 98,
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center',
    distance: '0.7 km',
    priceRange: '$$$'
  },
  {
    id: '8',
    name: 'Urban Style',
    city: 'Vancouver',
    barbers: 11,
    rating: 4.5,
    posts: 73,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop&crop=center',
    distance: '1.8 km',
    priceRange: '$$'
  },
  {
    id: '9',
    name: 'Gentleman\'s Choice',
    city: 'Vancouver',
    barbers: 13,
    rating: 4.8,
    posts: 134,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
    distance: '0.4 km',
    priceRange: '$$$'
  },
  {
    id: '10',
    name: 'Modern Barbers',
    city: 'Vancouver',
    barbers: 8,
    rating: 4.4,
    posts: 52,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
    distance: '2.1 km',
    priceRange: '$$'
  }
];

// Sort salons by rating (highest to lowest)
const sortedSalons = allSalons.sort((a, b) => {
  return b.rating - a.rating;
});

export default function SalonsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  const source = params.source as string;

  const handleSalonPress = (salon: any) => {
    const params = Object.fromEntries(Object.entries({ 
      ...salon, 
      image: salon.image, 
      selectedService: selectedService,
      selectedServiceLabel: selectedServiceLabel,
      source: 'salons-list' 
    }).map(([k, v]) => [k, String(v)]));
    router.push({ pathname: 'SalonDetailsScreen' as any, params });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={12} color="#FFD700" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="star-half" name="star-half" size={12} color="#FFD700" />
      );
    }
    
    // Add empty stars to complete 5 stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`star-empty-${i}`} name="star-outline" size={12} color="#FFD700" />
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
        <Text style={styles.headerTitle}>
          {selectedServiceLabel ? `${selectedServiceLabel} Salons` : 'Salons Near You'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.subtitle}>
          {selectedServiceLabel 
            ? `Found ${sortedSalons.length} salons offering ${selectedServiceLabel} in Vancouver`
            : `Found ${sortedSalons.length} salons in Vancouver`
          }
        </Text>
        
        {sortedSalons.map((salon, index) => (
          <TouchableOpacity
            key={salon.id}
            style={styles.salonCard}
            activeOpacity={0.8}
            onPress={() => handleSalonPress(salon)}
          >
            <View style={styles.salonContent}>
              <Image source={{ uri: salon.image }} style={styles.salonImage} />
              <View style={styles.salonInfo}>
                <Text style={styles.salonName}>{salon.name}</Text>
                <Text style={styles.salonDetails}>
                  {salon.barbers} Barbers • {salon.distance} • {salon.priceRange}
                </Text>
                <View style={styles.salonStatsRow}>
                  <View style={styles.salonStat}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.salonStatText}> {salon.rating}</Text>
                  </View>
                  <View style={styles.salonStat}>
                    <Ionicons name="document-text" size={16} color="#222" />
                    <Text style={styles.salonStatText}> {salon.posts} Posts</Text>
                  </View>
                  <View style={styles.salonStat}>
                    <Ionicons name="location" size={16} color="#222" />
                    <Text style={styles.salonStatText}> {salon.distance}</Text>
                  </View>
                </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  salonCard: {
    width: '100%',
    minHeight: 120,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  salonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  salonImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  salonDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  salonStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  salonStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 4,
  },
  salonStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
}); 