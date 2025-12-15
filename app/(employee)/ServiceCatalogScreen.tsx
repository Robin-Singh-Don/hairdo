import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import { EmployeeService } from '../../services/mock/AppMockData';

// Mock catalog data
const mockCatalog = [
  {
    id: '1',
    name: 'Classic Haircut',
    duration: 45,
    price: 35,
    category: 'Hair',
    description: 'Traditional haircut with basic styling',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300',
    isAdded: false,
  },
  {
    id: '2',
    name: 'Premium Haircut',
    duration: 60,
    price: 50,
    category: 'Hair',
    description: 'Premium haircut with advanced styling and consultation',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
    isAdded: true,
  },
  {
    id: '3',
    name: 'Beard Trim',
    duration: 30,
    price: 25,
    category: 'Beard',
    description: 'Professional beard trimming and shaping',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300',
    isAdded: false,
  },
  {
    id: '4',
    name: 'Hair Wash & Style',
    duration: 30,
    price: 20,
    category: 'Hair',
    description: 'Hair washing with professional styling',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
    isAdded: true,
  },
  {
    id: '5',
    name: 'Hair Coloring',
    duration: 120,
    price: 80,
    category: 'Hair',
    description: 'Professional hair coloring service',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
    isAdded: false,
  },
  {
    id: '6',
    name: 'Facial Treatment',
    duration: 45,
    price: 60,
    category: 'Facial',
    description: 'Relaxing facial treatment and skincare',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
    isAdded: false,
  },
];

const categories = ['All', 'Hair', 'Beard', 'Facial', 'Styling'];

export default function ServiceCatalogScreen() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<EmployeeService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await employeeAPI.getServices();
        setCatalog(data);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleService = (serviceId: string) => {
    setCatalog(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { ...service, isAdded: !service.isAdded }
          : service
      )
    );
  };

  const filteredServices = catalog.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderServiceCard = (service: any) => (
    <View key={service.id} style={styles.serviceCard}>
      <Image source={{ uri: service.image }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <TouchableOpacity 
            style={[
              styles.addButton,
              { backgroundColor: service.isAdded ? '#4CAF50' : '#E0E0E0' }
            ]}
            onPress={() => toggleService(service.id)}
          >
            <Ionicons 
              name={service.isAdded ? "checkmark" : "add"} 
              size={20} 
              color={service.isAdded ? "#fff" : "#666"} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        <View style={styles.serviceDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{service.duration} min</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>${service.price}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{service.category}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading services...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Catalog</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Services</Text>
          <Text style={styles.sectionDescription}>
            Add services from our catalog to your offerings
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.activeCategoryTab
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.activeCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services List */}
        {filteredServices.map(renderServiceCard)}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Browse our service catalog and add services to your offerings. You can customize pricing and details after adding.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  activeCategoryTab: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  serviceInfo: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

