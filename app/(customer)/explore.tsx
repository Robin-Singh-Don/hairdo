import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Modal, ScrollView, Dimensions, ViewStyle, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelectedServices } from './appointment';
import BottomBar from '../../components/BottomBar';
import { useProfile } from '../../contexts/ProfileContext';
import { customerAPI } from '../../services/api/customerAPI';
import { Service } from '../../services/mock/AppMockData';
// import { SalonCard } from '../../app/structure/CustomerExplore-DataStructure';

const LOCATION = 'Vancouver';
const PROFILE_IMAGE = 'https://randomuser.me/api/portraits/men/32.jpg';



// Data now imported from centralized data file

// sampleSalons data now imported from centralized data file

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SALON_CARD_WIDTH = 360;

type SalonCardType = {
  id: string;
  name?: string;
  barbers?: number;
  rating?: string;
  posts?: number;
  image?: string;
  seeMore?: boolean;
};

export default function ExploreServiceFilter() {
  const { profileData } = useProfile(); // Get profile data from context
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [location, setLocation] = useState(LOCATION);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [moreSearch, setMoreSearch] = useState('');
  const [selectedMore, setSelectedMore] = useState<string | null>(null);
  
  // New state for salon services modal
  const [showSalonServicesModal, setShowSalonServicesModal] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [selectedSalonServices, setSelectedSalonServices] = useState<string[]>([]);
  
  // API state
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [standardServices, setStandardServices] = useState<any[]>([]);
  const [extraServices, setExtraServices] = useState<{ key: string; label: string; }[]>([]);
  const [sampleSalons, setSampleSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedServices: globalSelectedServices, setSelectedServices: setGlobalSelectedServices } = useSelectedServices();
  React.useEffect(() => {
    if (params && params.location) {
      setLocation(params.location as string);
    }
  }, [params?.location]);

  // Load data from API
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [featured, standard, extra, salons] = await Promise.all([
          customerAPI.getFeaturedServices(),
          customerAPI.getStandardServices(),
          customerAPI.getExtraServices(),
          customerAPI.getSalonCards()
        ]);
        
        setFeaturedServices(featured);
        setStandardServices(standard);
        setExtraServices(extra);
        setSampleSalons(salons);
      } catch (error) {
        console.error('Error loading explore data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelect = (key: string, label: string) => {
    // Replace the services instead of adding to them
    setGlobalSelectedServices([{ key, label }]);
    // Navigate to appointment page with selected service
    router.push({ 
      pathname: '/(customer)/appointment', 
      params: { 
        selectedService: key, 
        selectedServiceLabel: label,
        source: 'explore-service'
      } 
    });
  };

  const handleMoreSelect = (key: string, label: string) => {
    setShowMoreModal(false);
    setSelected(key);
    // Navigate to appointment page with selected service
    router.push({ 
      pathname: '/(customer)/appointment', 
      params: { 
        selectedService: key, 
        selectedServiceLabel: label,
        source: 'explore-service'
      } 
    });
  };

  const filteredExtra = extraServices.filter(s =>
    s.label.toLowerCase().includes(moreSearch.toLowerCase())
  );

  // New handler for salon services
  const handleBookNow = (salon: any) => {
    setSelectedSalon(salon);
    setSelectedSalonServices([]);
    setShowSalonServicesModal(true);
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedSalonServices((prev: string[]) => 
      prev.includes(serviceId) 
        ? prev.filter((id: string) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleServicesDone = () => {
    if (selectedSalonServices.length === 0) {
      Alert.alert('No Services Selected', 'Please select at least one service to continue.');
      return;
    }

    // Get the selected service details
    const selectedServiceDetails = selectedSalon.services.filter((service: any) => 
      selectedSalonServices.includes(service.id)
    );

    // Close the modal
    setShowSalonServicesModal(false);
    setSelectedSalon(null);
    setSelectedSalonServices([]);

    // Navigate to SalonDetailsScreen with selected services
    const params = Object.fromEntries(Object.entries({ 
      ...selectedSalon, 
      image: selectedSalon.image!, 
      source: 'explore',
      selectedServices: JSON.stringify(selectedServiceDetails)
    }).map(([k, v]) => [k, String(v)]));
    
    router.push({ pathname: '/(customer)/SalonDetailsScreen' as any, params });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.centeredContent, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => router.push('/(customer)/location-search')}
          >
            <Text style={styles.locationText}>{location}</Text>
            <Ionicons name="chevron-down" size={18} color="#000" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationsButton}
            onPress={() => router.push('/(customer)/inbox')}
            accessibilityLabel="Inbox"
            accessibilityHint="Tap to view your inbox and messages"
            activeOpacity={0.7}
          >
            <Ionicons name="notifications" size={24} color="#000" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchBarWrapper}
          onPress={() => router.push('/(customer)/search')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
          <Text style={styles.searchPlaceholder}>Search for barbers, salons, or services...</Text>
        </TouchableOpacity>
                 {/* Welcome Text */}
         <Text style={styles.welcomeText}>Hi {profileData.name.split(' ')[0]}</Text>
        {/* Service Grid */}
        <View style={styles.gridWrapper}>
          {/* Featured Row */}
          <View style={styles.featuredRow}>
            {featuredServices.map((item) => (
              <View key={item.key} style={{ alignItems: 'flex-start', marginRight: 12 }}>
                <TouchableOpacity
                  style={[styles.featuredCard, { overflow: 'hidden', padding: 0 }]}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item.key, item.label)}
                >
                  <Image source={{ uri: item.image }} style={styles.featuredImageFull} />
                  {/* Gradient Overlay */}
                  <View style={[styles.featuredGradientOverlay, { backgroundColor: item.gradient[0] }]} />
                  
                                                        {/* Badge */}
                   {item.popular && item.key !== 'haircut' && (
                     <View style={styles.featuredBadge}>
                       <Ionicons name="flame" size={12} color="#FF6B00" />
                       <Text style={styles.featuredBadgeText}>Popular</Text>
                     </View>
                   )}
                                     {item.trending && (
                     <View style={styles.featuredBadge}>
                       <Ionicons name="flame" size={12} color="#FF6B00" />
                       <Text style={styles.featuredBadgeText}>Popular</Text>
                     </View>
                   )}
                  
                  
                </TouchableOpacity>
                <Text style={styles.featuredLabelOutside}>{item.label}</Text>
              </View>
            ))}
          </View>
          {/* Standard Grid */}
          <View style={{ width: '100%' }}>
            <View style={styles.standardGrid}>
              {standardServices.map((item) => {
                if (item.key === 'more') {
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.standardCard}
                      activeOpacity={0.85}
                      onPress={() => setShowMoreModal(true)}
                    >
                      <View style={styles.standardIconWrapper}>
                        <Image source={{ uri: item.image }} style={styles.standardIconImage} />
                      </View>
                      <Text style={styles.standardLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.standardCard, { backgroundColor: item.gradient[0] }]}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item.key, item.label)}
                  >
                    <View style={[styles.standardIconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Ionicons name={item.icon as any} size={24} color="#fff" />
                    </View>
                    <Text style={[styles.standardLabel, { color: '#fff' }]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {/* Top Salons Row */}
            <View style={styles.topSalonsRow}>
              <Text style={styles.topSalonsText}>Top salons near you</Text>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </View>
            {/* Horizontal FlatList of Salon Cards */}
            <FlatList
              style={{ width: '100%' }}
              data={[...sampleSalons, { id: 'see-more', seeMore: true }] as SalonCardType[]}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, paddingLeft: 8, paddingRight: 8 }}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              snapToInterval={SALON_CARD_WIDTH + 16}
              decelerationRate="fast"
              renderItem={({ item }) => {
                                 if ('seeMore' in item && item.seeMore) {
                   return (
                     <TouchableOpacity 
                       style={styles.seeMoreCard}
                       activeOpacity={0.8}
                       onPress={() => router.push('/(customer)/salons-list')}
                     >
                       <Ionicons name="ellipsis-horizontal" size={32} color="#AEB4F7" style={{ marginBottom: 8 }} />
                       <Text style={styles.seeMoreText}>See more</Text>
                     </TouchableOpacity>
                   );
                 }
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.salonCard}
                    onPress={() => {
                      const params = Object.fromEntries(Object.entries({ ...item, image: item.image!, source: 'explore' }).map(([k, v]) => [k, String(v)]));
                      router.push({ pathname: '/(customer)/SalonDetailsScreen' as any, params });
                    }}
                  >
                    <View style={styles.salonContent}>
                      <Image source={{ uri: item.image! }} style={styles.salonImage} />
                      <View style={styles.salonInfo}>
                        <Text style={styles.salonName}>{item.name}</Text>
                        <Text style={styles.salonBarbers}>{item.barbers} Barbers</Text>
                        <View style={styles.salonStatsRow}>
                          <View style={styles.salonStat}><Ionicons name="thumbs-up" size={16} color="#222" /><Text style={styles.salonStatText}> {item.rating}</Text></View>
                          <View style={styles.salonStat}><Ionicons name="document-text" size={16} color="#222" /><Text style={styles.salonStatText}> {item.posts} Posts</Text></View>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.bookNowBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleBookNow(item);
                      }}
                    >
                      <Text style={styles.bookNowBtnText}>Book Now</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />
            {/* User Activity Card */}
            <TouchableOpacity 
              style={styles.activityCard}
              activeOpacity={0.8}
              onPress={() => router.push('/(customer)/BookingHistoryScreen' as any)}
            >
              <Ionicons name="star" size={28} color="#FFD700" style={{ marginBottom: 10 }} />
              <Text style={styles.activityCardTitle}>Your previous bookings</Text>
              <Text style={styles.activityCardText}>See your booking history and rebook your favorite services.</Text>
            </TouchableOpacity>
            {/* Promotions Card (moved to end) */}
            <TouchableOpacity 
              style={styles.promoCard}
              activeOpacity={0.8}
              onPress={() => router.push('/(customer)/PromotionsScreen' as any)}
            >
              <Ionicons name="gift" size={26} color="#AEB4F7" style={{ marginBottom: 10 }} />
              <Text style={styles.promoCardTitle}>Promotions & Offers</Text>
              <Text style={styles.promoCardText}>Check out the latest deals and exclusive offers for you!</Text>
            </TouchableOpacity>
          </View>
        </View>
             </ScrollView>
       {/* More Services Modal */}
      <Modal
        visible={showMoreModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowMoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Top Row: X and Search Bar */}
            <View style={styles.modalTopRow}>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowMoreModal(false)}>
                <Ionicons name="close" size={24} color="#444" />
              </TouchableOpacity>
              <View style={styles.modalSearchBarWrapper}>
                <Ionicons name="search" size={16} color="#444" style={{ marginLeft: 8, marginRight: 4 }} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search for services…"
                  placeholderTextColor="#999"
                  value={moreSearch}
                  onChangeText={setMoreSearch}
                  returnKeyType="search"
                />
              </View>
            </View>
            {/* Service List */}
            <ScrollView style={styles.modalServiceList} contentContainerStyle={{ paddingBottom: 16 }}>
              {filteredExtra.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.modalServiceRow,
                    selectedMore === item.key && styles.selectedCard,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleMoreSelect(item.key, item.label)}
                >
                  <View style={styles.modalServiceIcon} />
                  <Text style={styles.modalServiceLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Salon Services Modal */}
      <Modal
        visible={showSalonServicesModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSalonServicesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.salonServicesModalCard}>
            {/* Header */}
            <View style={styles.salonServicesHeader}>
              <TouchableOpacity 
                style={styles.salonServicesCloseBtn} 
                onPress={() => setShowSalonServicesModal(false)}
              >
                <Ionicons name="close" size={24} color="#444" />
              </TouchableOpacity>
              <Text style={styles.salonServicesTitle}>Select Services</Text>
              <View style={{ width: 36 }} />
            </View>

            {/* Salon Info */}
            {selectedSalon && (
              <View style={styles.salonServicesSalonInfo}>
                <Image source={{ uri: selectedSalon.image }} style={styles.salonServicesSalonImage} />
                <View style={styles.salonServicesSalonDetails}>
                  <Text style={styles.salonServicesSalonName}>{selectedSalon.name}</Text>
                  <Text style={styles.salonServicesSalonSubtitle}>{selectedSalon.barbers} Barbers • {selectedSalon.rating} Rating</Text>
                </View>
              </View>
            )}

                         {/* Services List */}
             <ScrollView style={styles.salonServicesList} showsVerticalScrollIndicator={false}>
               {selectedSalon?.services.map((service: any) => (
                 <TouchableOpacity
                   key={service.id}
                   style={[
                     styles.salonServiceRow,
                     selectedSalonServices.includes(service.id) && styles.salonServiceRowSelected
                   ]}
                   onPress={() => handleServiceToggle(service.id)}
                   activeOpacity={0.7}
                 >
                   <View style={styles.salonServiceInfo}>
                     <Text style={styles.salonServiceName}>{service.name}</Text>
                     <View style={styles.salonServiceDetails}>
                       <Text style={styles.salonServicePrice}>{service.price}</Text>
                       <Text style={styles.salonServiceDuration}>• {service.duration}</Text>
                     </View>
                   </View>
                   <View style={[
                     styles.salonServiceCheckbox,
                     selectedSalonServices.includes(service.id) && styles.salonServiceCheckboxSelected
                   ]}>
                     {selectedSalonServices.includes(service.id) && (
                       <Ionicons name="checkmark" size={16} color="#fff" />
                     )}
                   </View>
                 </TouchableOpacity>
               ))}
             </ScrollView>

             {/* Done Button */}
             <View style={styles.salonServicesFooter}>
               <TouchableOpacity
                 style={[
                   styles.salonServicesDoneBtn,
                   selectedSalonServices.length === 0 && styles.salonServicesDoneBtnDisabled
                 ]}
                 onPress={handleServicesDone}
                 disabled={selectedSalonServices.length === 0}
               >
                 <Text style={styles.salonServicesDoneBtnText}>
                   Done ({selectedSalonServices.length} selected)
                 </Text>
               </TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredContent: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: 4,
    marginBottom: 8,
    gap: 8,
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
  notificationsButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    paddingHorizontal: 10,
    marginBottom: 8,
    alignSelf: 'center',
  },
  searchInput: {
    flex: 1,
    height: 33,
    fontSize: 16,
    color: '#000',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  clearIconWrapper: {
    padding: 5,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'left',
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  gridWrapper: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 2 * 140 + 40, // 2 cards + larger gap
    maxWidth: 320,
    marginBottom: 28,
    paddingHorizontal: 0,
    alignSelf: 'center',
  },
  featuredCard: {
    width: 140,
    height: 85,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 0,
  },
  featuredGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  featuredIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginLeft: 2,
  },
  featuredImage: {
    width: '100%',
    height: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  featuredImageFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredLabelOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredLabelOnImage: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#AEB4F7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 2,
  },
  badgeText: {
    color: '#222',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredLabel: {
    // deprecated, now using featuredLabelOutside
  },
  featuredLabelOutside: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
    maxWidth: '100%',
  },
  selectedCard: {
    // No border or highlight
  },
  standardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  standardCard: {
    width: 90,
    height: 85,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginHorizontal: 12.5,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    paddingVertical: 12,
  },
  standardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  standardIconImage: {
    width: 28,
    height: 28,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  standardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#222',
    textAlign: 'center',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  modalCard: {
    marginTop: 50,
    width: '100%',
    height: Dimensions.get('window').height - 50,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: 'stretch',
    paddingBottom: 8,
    flex: 1,
  },
  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    marginHorizontal: 0,
    gap: 4,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginLeft: 8,
    marginRight: 4,
  },
  modalSearchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    height: 40,
    marginRight: 12,
    paddingHorizontal: 8,
  },
  modalSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#000',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  modalServiceList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  modalServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
    backgroundColor: 'transparent',
  },
  modalServiceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    marginRight: 12,
  },
  modalServiceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  popularSticker: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E6',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    zIndex: 2,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  popularStickerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6B00',
    letterSpacing: 0.2,
  },
  popularStickerAbove: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E6',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 2,
    marginLeft: 8,
    marginTop: -8,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    alignSelf: 'flex-start',
  },
  popularStickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E6',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 10,
    marginTop: 0,
    marginLeft: 8,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    alignSelf: 'flex-start',
  },
  activityCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFF9E5',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 18,
    marginHorizontal: 0,
    shadowColor: '#FFD700',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    width: '95%',
    maxWidth: 410,
    alignSelf: 'center',
  },
  activityCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  activityCardText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  promoCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F3F6FF',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 24,
    marginHorizontal: 0,
    shadowColor: '#AEB4F7',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    width: '95%',
    maxWidth: 410,
    alignSelf: 'center',
  },
  promoCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  promoCardText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  topSalonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 370,
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 0,
    paddingHorizontal: 4,
  },
  topSalonsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  salonCard: {
    width: SALON_CARD_WIDTH,
    minHeight: 120,
    maxHeight: 164,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 10,
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
    padding: 12,
  },
  salonImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  salonBarbers: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  salonStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salonStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  salonStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  bookNowBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 20,
    width: 100,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  bookNowBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  seeMoreCard: {
    width: SALON_CARD_WIDTH,
    minHeight: 120,
    maxHeight: 164,
    padding: 16,
    backgroundColor: '#F3F6FF',
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#AEB4F7',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#AEB4F7',
  },
  // Search Modal Styles
  searchModalCard: {
    marginTop: 50,
    width: '100%',
    height: Dimensions.get('window').height - 50,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: 'stretch',
    paddingBottom: 8,
    flex: 1,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    paddingTop: 8,
  },
  searchModalCloseBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  searchResultsList: {
    flex: 1,
    paddingHorizontal: 16,
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
  searchPlaceholder: {
    flex: 1,
    height: 33,
    fontSize: 16,
    color: '#999',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlignVertical: 'center',
    lineHeight: 33,
  },
  // New styles for Salon Services Modal
  salonServicesModalCard: {
    marginTop: 50,
    width: '100%',
    height: Dimensions.get('window').height - 50,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: 'stretch',
    paddingBottom: 8,
    flex: 1,
  },
  salonServicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    paddingTop: 8,
  },
  salonServicesCloseBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  salonServicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  salonServicesSalonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  salonServicesSalonImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  salonServicesSalonDetails: {
    flex: 1,
  },
  salonServicesSalonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  salonServicesSalonSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  salonServicesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  salonServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  salonServiceRowSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
    borderWidth: 1,
  },
  salonServiceInfo: {
    flex: 1,
  },
  salonServiceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  salonServiceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salonServicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  salonServiceDuration: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  salonServiceCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  salonServiceCheckboxSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  salonServicesFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  salonServicesDoneBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 20,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  salonServicesDoneBtnDisabled: {
    backgroundColor: '#ccc',
  },
  salonServicesDoneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
