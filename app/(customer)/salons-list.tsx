import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { customerAPI } from '../../services/api/customerAPI';
import { ExtendedSalon } from '../../services/mock/AppMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SALON_CARD_WIDTH = 360;

export default function SalonsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // API state
  const [salons, setSalons] = useState<ExtendedSalon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  const source = params.source as string;

  // Load salon data from API
  useEffect(() => {
    const loadSalonData = async () => {
      try {
        setLoading(true);
        const data = await customerAPI.getExtendedSalons();
        setSalons(data);
      } catch (error) {
        console.error('Error loading salon data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSalonData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading salons...</Text>
      </SafeAreaView>
    );
  }

  // Sort salons by rating (highest to lowest)
  const sortedSalons = [...salons].sort((a, b) => {
    return b.rating - a.rating;
  });

  const handleSalonPress = (salon: ExtendedSalon) => {
    const salonParams = {
      ...salon,
      source: source || 'salons-list',
      selectedService: selectedService || '',
      selectedServiceLabel: selectedServiceLabel || '',
      selectedServicesJson: selectedService ? JSON.stringify([{ key: selectedService, label: selectedServiceLabel }]) : ''
    };
    router.push({ pathname: '/(customer)/SalonDetailsScreen' as any, params: salonParams });
  };

  const renderSalonCard = (salon: ExtendedSalon) => (
    <TouchableOpacity
      key={salon.id}
      style={styles.salonCard}
      onPress={() => handleSalonPress(salon)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: salon.image }} style={styles.salonImage} />
      <View style={styles.salonInfo}>
        <Text style={styles.salonName}>{salon.name}</Text>
        <View style={styles.salonStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color="#666" />
            <Text style={styles.statText}>{salon.barbers} Barbers</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statText}>{salon.rating}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.statText}>{salon.distance}</Text>
          </View>
        </View>
        <View style={styles.salonFooter}>
          <Text style={styles.priceRange}>{salon.priceRange}</Text>
          <Text style={styles.postsCount}>{salon.posts} Posts</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>All Salons</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {sortedSalons.map(renderSalonCard)}
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
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  salonCard: {
    width: SALON_CARD_WIDTH,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  salonImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  salonInfo: {
    padding: 16,
  },
  salonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  salonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  salonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  postsCount: {
    fontSize: 14,
    color: '#666',
  },
});