import React, { useState, useContext, createContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Modal,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomBar from '../../components/BottomBar';
import { customerAPI } from '../../services/api/customerAPI';
import { City, Category, PreviousAppointment, AppointmentSalon, AppointmentService } from '../../services/mock/AppMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Cities loaded from API

// Categories loaded from API

// Previous appointments loaded from API
// Only previous bookings retained; upcoming section removed



// --- Selected Services Context ---
const SelectedServicesContext = createContext<{
  selectedServices: Array<{ key: string; label: string }>;
  setSelectedServices: React.Dispatch<React.SetStateAction<Array<{ key: string; label: string }>>>;
  updateSelectedServices: (services: Array<{ key: string; label: string }>) => void;
} | undefined>(undefined);

export function useSelectedServices() {
  const ctx = useContext(SelectedServicesContext);
  if (!ctx) throw new Error('useSelectedServices must be used within SelectedServicesProvider');
  return ctx;
}

export function SelectedServicesProvider({ children }: { children: React.ReactNode }) {
  const [selectedServices, setSelectedServices] = useState<Array<{ key: string; label: string }>>([]);
  
  const updateSelectedServices = (services: Array<{ key: string; label: string }>) => {
    setSelectedServices(services);
  };
  
  return (
    <SelectedServicesContext.Provider value={{ selectedServices, setSelectedServices, updateSelectedServices }}>
      {children}
    </SelectedServicesContext.Provider>
  );
}

export default function AppointmentTab() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('Vancouver');
  const [locationModal, setLocationModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [profileModal, setProfileModal] = useState(false);
  
  // API state
  const [salons, setSalons] = useState<AppointmentSalon[]>([]);
  const [allServices, setAllServices] = useState<AppointmentService[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState(false);

  // Get selected services context (must be called before early returns)
  const { selectedServices, setSelectedServices } = useSelectedServices();
  
  // Get router and params (must be called before early returns)
  const navigationRouter = useRouter();
  const params = useLocalSearchParams();

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [salonsData, servicesData, citiesData] = await Promise.all([
          customerAPI.getAppointmentSalons(),
          customerAPI.getAppointmentServices(),
          customerAPI.getCities()
        ]);
        setSalons(salonsData);
        setAllServices(servicesData);
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading appointment data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading appointments...</Text>
      </SafeAreaView>
    );
  }
  
  // Get selected service label from params
  const selectedServiceLabel = params.label as string | undefined;
  




  // Divider and sticky header logic
  // Removed animated divider and headers related to upcoming bookings

  const filteredCities = cities.filter(city => city.name.toLowerCase().includes(citySearch.toLowerCase()));
  const filteredSalons = salons.filter(salon => salon.city === location);

  // Capsule remove handler
  const handleRemoveService = (key: string) => {
    setSelectedServices(services => services.filter(s => s.key !== key));
  };
  // Capsule add handler (toggle)
  const handleToggleService = (service: { key: string; label: string }) => {
    setSelectedServices(services => {
      if (services.some(s => s.key === service.key)) {
        return services.filter(s => s.key !== service.key);
      } else {
        return [...services, service];
      }
    });
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.centeredContent}>
        {/* Top Bar (Sticky) */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigationRouter.back()} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity 
            style={styles.asapBookingCard}
            onPress={() => navigationRouter.push('/(customer)/book-directly')}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={16} color="#AEB4F7" />
            <Text style={styles.asapBookingText}>ASAP</Text>
          </TouchableOpacity>
        </View>
        {/* Search Bar (Sticky) */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for barbers, salons, or services…"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearIconWrapper}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        {/* Scrollable Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
          {/* Selected Service Capsules (multi-select) */}
          {selectedServices.length > 0 && (
            <View style={styles.selectedServiceCapsuleRow}>
              {selectedServices.map(service => (
                <TouchableOpacity
                  key={service.key}
                  style={styles.selectedServiceCapsule}
                  onLongPress={() => handleRemoveService(service.key)}
                  delayLongPress={300}
                  accessibilityLabel={`Remove ${service.label}`}
                >
                  <Text style={styles.selectedServiceCapsuleText}>{service.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.plusCircle}
                onPress={() => setServiceModal(true)}
                accessibilityLabel="Add more service filter"
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {selectedServices.length === 0 && (
            <View style={styles.selectedServiceCapsuleRow}>
              <TouchableOpacity
                style={styles.plusCircle}
                onPress={() => setServiceModal(true)}
                accessibilityLabel="Add more service filter"
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          

          
          {/* Filter Options */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Filter by</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContainer}
            >
              <TouchableOpacity style={styles.filterChip}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.filterChipText}>Distance</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterChip}>
                <Ionicons name="star" size={16} color="#666" />
                <Text style={styles.filterChipText}>Rating</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterChip}>
                <Ionicons name="cash" size={16} color="#666" />
                <Text style={styles.filterChipText}>Price</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterChip}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.filterChipText}>Availability</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          {/* Service Select Modal */}
          <Modal visible={serviceModal} animationType="slide" transparent onRequestClose={() => setServiceModal(false)}>
            <TouchableWithoutFeedback onPress={() => setServiceModal(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Services</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {allServices.map(service => (
            <TouchableOpacity
                    key={service.key}
                    style={[
                      styles.cityItem,
                      selectedServices.some(s => s.key === service.key) && { backgroundColor: '#AEB4F7' },
                    ]}
                    onPress={() => handleToggleService(service)}
                  >
                    <Text style={[styles.cityText, selectedServices.some(s => s.key === service.key) && { color: '#fff' }]}>{service.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
              <TouchableOpacity style={styles.doneBtn} onPress={() => setServiceModal(false)}>
                <Text style={styles.bookNowBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          {/* Featured Salons Section */}
          <View style={styles.featuredSalonsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Salons</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigationRouter.push('/(customer)/salons-list')}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#AEB4F7" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredSalons.slice(0, 3)}
              keyExtractor={item => item.id}
              style={{ width: '100%' }}
              contentContainerStyle={{ paddingHorizontal: 16, width: '100%' }}
              renderItem={({ item }) => (
              <View style={styles.salonCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ flex: 1 }}
                  onPress={() => {
                    const { isOpen: _, ...itemWithoutIsOpen } = item;
                    const params = {
                      ...itemWithoutIsOpen,
                      image: item.image.uri,
                      source: 'appointment',
                      selectedService: selectedServices.length > 0 ? selectedServices[0].key : '',
                      selectedServiceLabel: selectedServices.length > 0 ? selectedServices[0].label : '',
                      selectedServicesJson: JSON.stringify(selectedServices)
                    };
                    navigationRouter.push({ pathname: '/(customer)/SalonDetailsScreen', params });
                  }}
                >
                  <View style={styles.salonContent}>
                    <Image source={item.image} style={styles.salonImage} />
                    <View style={styles.salonInfo}>
                      <Text style={styles.salonName}>{item.name}</Text>
                      <Text style={styles.salonBarbers}>{item.barbers} Barbers</Text>
                      <View style={styles.salonStatsRow}>
                        <View style={styles.salonStat}><Ionicons name="thumbs-up" size={16} color="#222" /><Text style={styles.salonStatText}> {item.rating}</Text></View>
                        <View style={styles.salonStat}><Ionicons name="document-text" size={16} color="#222" /><Text style={styles.salonStatText}> {item.posts} Posts</Text></View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.bookNowBtn}
                  onPress={() => {
                    // Navigate to salon details screen when Book Now is pressed
                    const { isOpen: _, ...itemWithoutIsOpen } = item;
                    const params = {
                      ...itemWithoutIsOpen,
                      image: item.image.uri,
                      source: 'appointment',
                      selectedService: selectedServices.length > 0 ? selectedServices[0].key : '',
                      selectedServiceLabel: selectedServices.length > 0 ? selectedServices[0].label : '',
                      selectedServicesJson: JSON.stringify(selectedServices)
                    };
                    navigationRouter.push({ pathname: '/(customer)/SalonDetailsScreen', params });
                  }}
                >
                  <Text style={styles.bookNowBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
          </View>
          {/* Upcoming Bookings section removed as requested */}
          {/* Salon List - More Salons */}
        <FlatList
            data={filteredSalons.slice(3)}
          keyExtractor={item => item.id}
            style={{ marginTop: 0, width: '100%' }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90, width: '100%' }}
          renderItem={({ item }) => (
            <View style={styles.salonCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{ flex: 1 }}
                  onPress={() => {
                    const { isOpen: _, ...itemWithoutIsOpen } = item;
                    const salonParams = {
                      ...itemWithoutIsOpen,
                      image: item.image.uri,
                      source: 'appointment',
                      selectedService: selectedServices.length > 0 ? selectedServices[0].key : '',
                      selectedServiceLabel: selectedServices.length > 0 ? selectedServices[0].label : '',
                      selectedServicesJson: JSON.stringify(selectedServices)
                    };
                    navigationRouter.push({ pathname: '/(customer)/SalonDetailsScreen', params: salonParams });
                  }}
              >
                <View style={styles.salonContent}>
                  <Image source={item.image} style={styles.salonImage} />
                  <View style={styles.salonInfo}>
                      <Text style={styles.salonName}>{item.name}</Text>
                      <Text style={styles.salonBarbers}>{item.barbers} Barbers</Text>
                      <View style={styles.salonStatsRow}>
                        <View style={styles.salonStat}><Ionicons name="thumbs-up" size={16} color="#222" /><Text style={styles.salonStatText}> {item.rating}</Text></View>
                        <View style={styles.salonStat}><Ionicons name="document-text" size={16} color="#222" /><Text style={styles.salonStatText}> {item.posts} Posts</Text></View>
                      </View>
                    </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.bookNowBtn}
                onPress={() => {
                  // Navigate to salon details screen when Book Now is pressed
                  const { isOpen: _, ...itemWithoutIsOpen } = item;
                  const salonParams = {
                    ...itemWithoutIsOpen,
                    image: item.image.uri,
                    source: 'appointment',
                    selectedService: selectedServices.length > 0 ? selectedServices[0].key : '',
                    selectedServiceLabel: selectedServices.length > 0 ? selectedServices[0].label : '',
                    selectedServicesJson: JSON.stringify(selectedServices)
                  };
                  navigationRouter.push({ pathname: '/SalonDetailsScreen', params: salonParams });
                }}
              >
                <Text style={styles.bookNowBtnText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          )}
            showsVerticalScrollIndicator={false}
        />
        </ScrollView>
      </View>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centeredContent: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  profilePicWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 0,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  modalContent: {
    position: 'absolute',
    top: '20%',
    left: '5%',
    right: '5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  modalSearchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    height: 44,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  cityItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityText: {
    fontSize: 16,
    color: '#222',
  },
  noCityText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 16,
  },
  profileModalContent: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    right: '15%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  profileModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
    textAlign: 'center',
  },
  profileModalItem: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    height: 33,
    width: 370,
    maxWidth: '100%',
    marginHorizontal: 'auto',
    marginBottom: 4,
    marginTop: 4,
    alignSelf: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 33,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  clearIconWrapper: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  chipScroll: {
    marginTop: 8,
    marginBottom: 0,
    minHeight: 36,
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chipSelected: {
    backgroundColor: '#F5F5F5',
    borderColor: '#000',
  },
  chipText: {
    fontSize: 13,
    color: '#000',
  },
  chipTextSelected: {
    color: '#000',
  },
  salonCard: {
    width: 360,
    minHeight: 90,
    maxHeight: 120,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 6,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },
  salonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  salonImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  salonInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  salonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  salonBarbers: {
    fontSize: 14,
    color: '#197A3B',
    textDecorationLine: 'underline',
    marginBottom: 2,
  },
  salonStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  salonStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  salonStatText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 2,
  },
  bookNowBtn: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 100,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  doneBtn: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: '100%',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 16,
    alignSelf: 'center',
  },
  bookNowBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  dividerLine: {
    width: 1,
    height: 60,
    backgroundColor: '#E0E0E0',
  },
  arrowIndicator: {
    position: 'absolute',
    right: 16,
    top: 0,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  selectedServiceCapsuleWrapper: {
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  selectedServiceCapsule: {
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#AEB4F7',
  },
  selectedServiceCapsuleText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  selectedServiceCapsuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  plusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#AEB4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  // New styles for enhanced sections
  quickActionsSection: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterScrollContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  featuredSalonsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#AEB4F7',
    fontWeight: '500',
    marginRight: 4,
  },
  upcomingBookingsSection: {
    marginBottom: 24,
  },
  asapBookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  asapBookingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginLeft: 4,
  },
}); 