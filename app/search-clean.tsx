import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelectedServices } from './(customer)/appointment';
import { customerAPI } from '../services/api/customerAPI';
import { SearchSalon, SearchBarber, SearchService } from '../services/mock/AppMockData';

export default function SearchScreen() {
  const router = useRouter();
  const { updateSelectedServices } = useSelectedServices();
  
  // API state
  const [searchSalons, setSearchSalons] = useState<SearchSalon[]>([]);
  const [searchBarbers, setSearchBarbers] = useState<SearchBarber[]>([]);
  const [searchServices, setSearchServices] = useState<SearchService[]>([]);
  const [loading, setLoading] = useState(true);

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [salonsData, barbersData, servicesData] = await Promise.all([
          customerAPI.getSearchSalons(),
          customerAPI.getSearchBarbers(),
          customerAPI.getSearchServices()
        ]);
        setSearchSalons(salonsData);
        setSearchBarbers(barbersData);
        setSearchServices(servicesData);
      } catch (error) {
        console.error('Error loading search data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results: any[] = [];

    // Search salons
    const salonResults = searchSalons.filter(salon =>
      salon.name.toLowerCase().includes(lowerQuery) ||
      salon.city.toLowerCase().includes(lowerQuery)
    ).map(salon => ({ ...salon, category: 'Salons' }));

    // Search barbers
    const barberResults = searchBarbers.filter(barber =>
      barber.name.toLowerCase().includes(lowerQuery) ||
      barber.location.toLowerCase().includes(lowerQuery) ||
      barber.rating.includes(lowerQuery)
    ).map(barber => ({ ...barber, category: 'Barbers' }));

    // Search services
    const serviceResults = searchServices.filter(service =>
      service.name.toLowerCase().includes(lowerQuery)
    ).map(service => ({ ...service, category: 'Services' }));

    results.push(...salonResults, ...barberResults, ...serviceResults);
    setSearchResults(results);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    performSearch(text);
  };

  const popularSearches = [
    'Haircut',
    'Beard Trim',
    'Facial',
    'Elite Barbershop',
    "Man's Cave Salon",
    'Shark.11'
  ];

  const renderSearchResult = (item: any, index: number) => {
    const isSalon = item.category === 'Salons';
    const isBarber = item.category === 'Barbers';
    const isService = item.category === 'Services';

    return (
      <TouchableOpacity
        key={index}
        style={styles.searchResultItem}
        onPress={() => {
          if (isSalon) {
            router.push({
              pathname: '/SalonDetailsScreen',
              params: { 
                salonId: item.id,
                salonName: item.name,
                salonLocation: item.city,
                salonRating: item.rating,
                salonImage: item.image
              }
            });
          } else if (isBarber) {
            router.push({
              pathname: '/BarberProfileScreen',
              params: { 
                barberId: item.id,
                barberName: item.name,
                barberSalon: item.location,
                barberRating: item.rating,
                barberImage: item.image
              }
            });
          } else if (isService) {
            updateSelectedServices([item]);
            router.push('/(customer)/appointment');
          }
        }}
      >
        <View style={styles.searchResultContent}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.searchResultImage}
          />
          <View style={styles.searchResultInfo}>
            <Text style={styles.searchResultName}>{item.name}</Text>
            <Text style={styles.searchResultCategory}>{item.category}</Text>
            {isSalon && (
              <Text style={styles.searchResultLocation}>{item.city}</Text>
            )}
            {isBarber && (
              <Text style={styles.searchResultLocation}>{item.location}</Text>
            )}
            {item.rating && (
              <Text style={styles.searchResultRating}>⭐ {item.rating}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading search data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for salons, barbers, or services..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoFocus={true}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.popularContainer}>
              {popularSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularItem}
                  onPress={() => {
                    if (['Haircut', 'Beard Trim', 'Facial'].includes(item)) {
                      // These are services, find the matching service object
                      const serviceObj = searchServices.find(s => s.name === item);
                      if (serviceObj) {
                        updateSelectedServices([serviceObj]);
                        router.push('/(customer)/appointment');
                      }
                    } else {
                      handleSearchChange(item);
                    }
                  }}
                >
                  <Text style={styles.popularItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.resultsTitle}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </Text>
            {searchResults.map((item, index) => renderSearchResult(item, index))}
            
            {searchResults.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#ccc" />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try searching for salons, barbers, or services
                </Text>
              </View>
            )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  popularContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  popularItemText: {
    fontSize: 14,
    color: '#666',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  searchResultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  searchResultCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  searchResultLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  searchResultRating: {
    fontSize: 14,
    color: '#ffa500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
});
