import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Search data structures
const searchSalons = [
  {
    id: '1',
    name: "Man's Cave Salon",
    city: 'Vancouver',
    barbers: 8,
    rating: '90%',
    posts: 78,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
    type: 'salon'
  },
  {
    id: '2',
    name: 'Elite Barbershop',
    city: 'Vancouver',
    barbers: 12,
    rating: '95%',
    posts: 120,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
    type: 'salon'
  },
  {
    id: '3',
    name: 'Classic Cuts',
    city: 'Vancouver',
    barbers: 6,
    rating: '88%',
    posts: 45,
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center',
    type: 'salon'
  },
  {
    id: '4',
    name: 'Downtown Barbers',
    city: 'Vancouver',
    barbers: 10,
    rating: '92%',
    posts: 89,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop&crop=center',
    type: 'salon'
  },
  {
    id: '5',
    name: 'Hair Masters',
    city: 'Vancouver',
    barbers: 15,
    rating: '97%',
    posts: 156,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
    type: 'salon'
  },
  {
    id: '6',
    name: 'Beard & Blade',
    city: 'Vancouver',
    barbers: 7,
    rating: '91%',
    posts: 67,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
    type: 'salon'
  },
];

const searchBarbers = [
  {
    id: 'b1',
    name: 'Shark.11',
    salon: "Man's Cave Salon",
    rating: '4.8',
    experience: '5 years',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    type: 'barber'
  },
  {
    id: 'b2',
    name: 'Alex B.',
    salon: 'Elite Barbershop',
    rating: '4.9',
    experience: '8 years',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    type: 'barber'
  },
  {
    id: 'b3',
    name: 'Jamie S.',
    salon: 'Classic Cuts',
    rating: '4.7',
    experience: '3 years',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    type: 'barber'
  },
  {
    id: 'b4',
    name: 'Mike R.',
    salon: 'Downtown Barbers',
    rating: '4.6',
    experience: '6 years',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    type: 'barber'
  },
];

const searchServices = [
  { key: 'haircut', label: 'Haircut', type: 'service' },
  { key: 'haircut_beard', label: 'Haircut & Beard', type: 'service' },
  { key: 'beard', label: 'Beard', type: 'service' },
  { key: 'long_hair', label: 'Long hair', type: 'service' },
  { key: 'styling', label: 'Styling', type: 'service' },
  { key: 'facial', label: 'Facial', type: 'service' },
  { key: 'coloring', label: 'Coloring', type: 'service' },
  { key: 'kids_haircut', label: 'Kids Haircut', type: 'service' },
  { key: 'head_massage', label: 'Head Massage', type: 'service' },
  { key: 'cuts_fades', label: 'Cuts and Fades', type: 'service' },
  { key: 'perm', label: 'Perm', type: 'service' },
  { key: 'straightening', label: 'Straightening', type: 'service' },
  { key: 'shave', label: 'Shave', type: 'service' },
  { key: 'eyebrow', label: 'Eyebrow Shaping', type: 'service' },
  { key: 'threading', label: 'Threading', type: 'service' },
  { key: 'waxing', label: 'Waxing', type: 'service' },
  { key: 'spa', label: 'Spa Treatment', type: 'service' },
  { key: 'bridal', label: 'Bridal Styling', type: 'service' },
  { key: 'makeup', label: 'Makeup', type: 'service' },
  { key: 'hair_treatment', label: 'Hair Treatment', type: 'service' },
  { key: 'scalp', label: 'Scalp Care', type: 'service' },
  { key: 'nails', label: 'Nails', type: 'service' },
  { key: 'tattoo', label: 'Tattoo', type: 'service' },
  { key: 'piercing', label: 'Piercing', type: 'service' },
];

export default function SearchScreen() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const router = useRouter();

  // Search functionality
  const performSearch = (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search salons
    const salonResults = searchSalons.filter(salon =>
      salon.name.toLowerCase().includes(lowerQuery) ||
      salon.city.toLowerCase().includes(lowerQuery)
    ).map(salon => ({ ...salon, category: 'Salons' }));

    // Search barbers
    const barberResults = searchBarbers.filter(barber =>
      barber.name.toLowerCase().includes(lowerQuery) ||
      barber.salon.toLowerCase().includes(lowerQuery)
    ).map(barber => ({ ...barber, category: 'Barbers' }));

    // Search services
    const serviceResults = searchServices.filter(service =>
      service.label.toLowerCase().includes(lowerQuery)
    ).map(service => ({ ...service, category: 'Services' }));

    results.push(...salonResults, ...barberResults, ...serviceResults);
    setSearchResults(results);
  };

  const handleSearchChange = (text: string) => {
    setSearch(text);
    performSearch(text);
  };

  const handleSearchResultSelect = (item: any) => {
    setSearch('');
    setSearchResults([]);

    if (item.type === 'salon') {
      // Navigate to salon details
      const params = Object.fromEntries(Object.entries({ ...item, image: item.image, source: 'search' }).map(([k, v]) => [k, String(v)]));
      router.push({ pathname: 'SalonDetailsScreen' as any, params });
    } else if (item.type === 'barber') {
      // Navigate to barber profile
      router.push({ pathname: 'BarberProfileScreen' as any, params: { barberId: item.id, barberName: item.name } });
    } else if (item.type === 'service') {
      // Navigate to appointment with service selected
      router.push({ pathname: '/appointment', params: { service: item.key, label: item.label } });
    }
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
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 16 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for barbers, salons, or services..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          autoFocus={true}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearch('');
            setSearchResults([]);
          }} style={styles.clearIconWrapper}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {search.length === 0 ? (
          // Show popular searches when no search query
          <View style={styles.popularSearches}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.popularItems}>
              {['Haircut', 'Beard Trim', 'Elite Barbershop', 'Shark.11', 'Facial'].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularItem}
                  onPress={() => handleSearchChange(item)}
                >
                  <Text style={styles.popularItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : searchResults.length === 0 ? (
          // No results found
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>Try searching for something else</Text>
          </View>
        ) : (
          // Search results
          <View style={styles.searchResults}>
            {searchResults.map((item, index) => (
              <TouchableOpacity
                key={`${item.type}-${item.id || item.key}-${index}`}
                style={styles.searchResultItem}
                activeOpacity={0.7}
                onPress={() => handleSearchResultSelect(item)}
              >
                <View style={styles.searchResultContent}>
                  <Image 
                    source={{ uri: item.image || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + (item.key || item.id) }} 
                    style={styles.searchResultImage} 
                  />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultTitle}>
                      {item.name || item.label}
                    </Text>
                    {item.type === 'salon' && (
                      <Text style={styles.searchResultSubtitle}>
                        {item.barbers} Barbers • {item.rating} Rating
                      </Text>
                    )}
                    {item.type === 'barber' && (
                      <Text style={styles.searchResultSubtitle}>
                        {item.salon} • {item.experience} experience
                      </Text>
                    )}
                    {item.type === 'service' && (
                      <Text style={styles.searchResultSubtitle}>
                        Service
                      </Text>
                    )}
                  </View>
                  <View style={styles.searchResultCategory}>
                    <Text style={styles.searchResultCategoryText}>{item.category}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    height: 50,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 12,
  },
  clearIconWrapper: {
    padding: 8,
    marginRight: 8,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  popularSearches: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  popularItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  popularItem: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  popularItemText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  searchResults: {
    paddingTop: 8,
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchResultCategory: {
    backgroundColor: '#AEB4F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchResultCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
}); 