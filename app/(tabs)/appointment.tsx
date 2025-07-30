import React, { useState, useRef, useContext, createContext } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import BottomBar from '../../components/BottomBar';

const CARD_WIDTH = 177;
const CARD_HEIGHT = 95;
const CARD_GAP = 16;
const IMAGE_HEIGHT = 67;
const LABEL_HEIGHT = 28;
const DIVIDER_COLOR = '#DADADA';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const cityList = [
  'Vancouver',
  'Toronto',
  'Calgary',
  'Montreal',
  'Ottawa',
  'Edmonton',
  'Winnipeg',
  'Quebec City',
  'Victoria',
  'Halifax',
];

const categories = [
  { key: 'hair', label: 'Hair', icon: '💇' },
  { key: 'beard', label: 'Beard', icon: '✂️' },
  { key: 'facial', label: 'Facial', icon: '💆' },
  { key: 'nails', label: 'Nails', icon: '💅' },
];

const upcoming = [
  { 
    type: 'upcoming', 
    label: 'July 15 at 9:30 AM', 
    image: { uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=177&h=95&fit=crop&crop=center' } 
  },
  { 
    type: 'upcoming', 
    label: 'July 22 at 2:00 PM', 
    image: { uri: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=177&h=95&fit=crop&crop=center' } 
  },
];
const previous = [
  { 
    type: 'previous', 
    label: 'June 11 at 10:30 AM', 
    image: { uri: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=177&h=95&fit=crop&crop=center' } 
  },
  { 
    type: 'previous', 
    label: 'May 5 at 1:00 PM', 
    image: { uri: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=177&h=95&fit=crop&crop=center' } 
  },
  { 
    type: 'previous', 
    label: 'April 22 at 3:30 PM', 
    image: { uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=177&h=95&fit=crop&crop=center' } 
  },
  { 
    type: 'previous', 
    label: 'March 18 at 11:00 AM', 
    image: { uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=177&h=95&fit=crop&crop=center' } 
  },
  { 
    type: 'previous', 
    label: 'February 10 at 4:00 PM', 
    image: { uri: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=177&h=95&fit=crop&crop=center' } 
  },
];
// Create array with spacing between upcoming and previous
const allBookings = [
  ...upcoming,
  { type: 'spacer', width: 61 }, // 61px spacer
  ...previous
];
const firstPreviousIdx = upcoming.length;

const salons = [
  {
    id: '1',
    name: "Man's Cave Salon",
    city: 'Vancouver',
    barbers: 8,
    rating: '90%',
    posts: 78,
    image: { uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center' },
  },
  {
    id: '2',
    name: "Elite Barbershop",
    city: 'Vancouver',
    barbers: 12,
    rating: '95%',
    posts: 120,
    image: { uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center' },
  },
  {
    id: '3',
    name: "Classic Cuts",
    city: 'Vancouver',
    barbers: 6,
    rating: '88%',
    posts: 45,
    image: { uri: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center' },
  },
  {
    id: '4',
    name: "Downtown Barbers",
    city: 'Toronto',
    barbers: 10,
    rating: '92%',
    posts: 89,
    image: { uri: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop&crop=center' },
  },
  {
    id: '5',
    name: "Hair Masters",
    city: 'Toronto',
    barbers: 15,
    rating: '97%',
    posts: 156,
    image: { uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center' },
  },
  {
    id: '6',
    name: "Beard & Blade",
    city: 'Calgary',
    barbers: 7,
    rating: '91%',
    posts: 67,
    image: { uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center' },
  },
  {
    id: '7',
    name: "Urban Clippers",
    city: 'Vancouver',
    barbers: 9,
    rating: '93%',
    posts: 102,
    image: { uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  },
  {
    id: '8',
    name: "Fade Factory",
    city: 'Toronto',
    barbers: 11,
    rating: '89%',
    posts: 88,
    image: { uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80' },
  },
  {
    id: '9',
    name: "The Groom Room",
    city: 'Calgary',
    barbers: 5,
    rating: '87%',
    posts: 54,
    image: { uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  },
  {
    id: '10',
    name: "Barber Bros",
    city: 'Montreal',
    barbers: 13,
    rating: '94%',
    posts: 110,
    image: { uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80' },
  },
];

const allServices = [
  { key: 'hair', label: 'Hair' },
  { key: 'beard', label: 'Beard' },
  { key: 'facial', label: 'Facial' },
  { key: 'nails', label: 'Nails' },
  { key: 'coloring', label: 'Coloring' },
  { key: 'kids_haircut', label: 'Kids Haircut' },
  { key: 'head_massage', label: 'Head Massage' },
  { key: 'cuts_fades', label: 'Cuts and Fades' },
  { key: 'perm', label: 'Perm' },
  { key: 'straightening', label: 'Straightening' },
  { key: 'shave', label: 'Shave' },
  { key: 'eyebrow', label: 'Eyebrow Shaping' },
  { key: 'threading', label: 'Threading' },
  { key: 'waxing', label: 'Waxing' },
  { key: 'spa', label: 'Spa Treatment' },
  { key: 'bridal', label: 'Bridal Styling' },
  { key: 'makeup', label: 'Makeup' },
  { key: 'hair_treatment', label: 'Hair Treatment' },
  { key: 'scalp', label: 'Scalp Care' },
  { key: 'tattoo', label: 'Tattoo' },
  { key: 'piercing', label: 'Piercing' },
];

// --- Selected Services Context ---
const SelectedServicesContext = createContext<{
  selectedServices: Array<{ key: string; label: string }>;
  setSelectedServices: React.Dispatch<React.SetStateAction<Array<{ key: string; label: string }>>>;
} | undefined>(undefined);

export function useSelectedServices() {
  const ctx = useContext(SelectedServicesContext);
  if (!ctx) throw new Error('useSelectedServices must be used within SelectedServicesProvider');
  return ctx;
}

export function SelectedServicesProvider({ children }: { children: React.ReactNode }) {
  const [selectedServices, setSelectedServices] = useState<Array<{ key: string; label: string }>>([]);
  return (
    <SelectedServicesContext.Provider value={{ selectedServices, setSelectedServices }}>
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
  const { selectedServices, setSelectedServices } = useSelectedServices();
  const [serviceModal, setServiceModal] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedServiceLabel = params.label as string | undefined;

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSelectedServices([]);
      };
    }, [setSelectedServices])
  );

  // Divider and sticky header logic
  const dividerLeft = scrollX.interpolate({
    inputRange: [0, (firstPreviousIdx) * (CARD_WIDTH + CARD_GAP)],
    outputRange: [firstPreviousIdx * (CARD_WIDTH + CARD_GAP) - CARD_GAP / 2, firstPreviousIdx * (CARD_WIDTH + CARD_GAP) - CARD_GAP / 2 + (firstPreviousIdx) * (CARD_WIDTH + CARD_GAP)],
    extrapolate: 'clamp',
  });
  const upcomingHeaderOpacity = scrollX.interpolate({
    inputRange: [0, (firstPreviousIdx - 0.5) * (CARD_WIDTH + CARD_GAP)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const previousHeaderOpacity = scrollX.interpolate({
    inputRange: [((firstPreviousIdx - 1) * (CARD_WIDTH + CARD_GAP)), (firstPreviousIdx * (CARD_WIDTH + CARD_GAP))],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const filteredCities = cityList.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()));
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
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.locationRow} onPress={() => setLocationModal(true)}>
            <Text style={styles.locationText}>{location}</Text>
            <Ionicons name="chevron-down" size={18} color="#000" style={{ marginLeft: 4 }} />
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
        {/* Booking Cards Horizontal Scroll */}
          {/* Salon List - First Three */}
          <FlatList
            data={filteredSalons.slice(0, 3)}
            keyExtractor={item => item.id}
            style={{ marginTop: 16, width: '100%' }}
            contentContainerStyle={{ paddingHorizontal: 16, width: '100%' }}
            renderItem={({ item }) => (
              <View style={styles.salonCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ flex: 1 }}
                  onPress={() => {
                    const params = Object.fromEntries(Object.entries({ ...item, image: item.image.uri }).map(([k, v]) => [k, String(v)]));
                    router.push({ pathname: 'SalonDetailsScreen' as any, params });
                  }}
                >
                  <View style={styles.salonContent}>
                    <Image source={item.image} style={styles.salonImage} />
                    <View style={styles.salonInfo}>
                      <TouchableOpacity onPress={() => {
                        const params = Object.fromEntries(Object.entries({ ...item, image: item.image.uri }).map(([k, v]) => [k, String(v)]));
                        router.push({ pathname: 'SalonDetailsScreen' as any, params });
                      }}>
                        <Text style={styles.salonName}>{item.name}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={styles.salonBarbers}>{item.barbers} Barbers</Text>
                      </TouchableOpacity>
                      <View style={styles.salonStatsRow}>
                        <View style={styles.salonStat}><Ionicons name="thumbs-up" size={16} color="#222" /><Text style={styles.salonStatText}> {item.rating}</Text></View>
                        <View style={styles.salonStat}><Ionicons name="document-text" size={16} color="#222" /><Text style={styles.salonStatText}> {item.posts} Posts</Text></View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bookNowBtn}>
                  <Text style={styles.bookNowBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
          {/* Upcoming Booking Section */}
          <Text style={[styles.stickyHeaderText, { marginLeft: 16, marginTop: 8, marginBottom: 8 }]}>Upcoming Booking</Text>
        <View style={styles.bookingCardsScrollContainer}>
          <View style={styles.bookingCardsWrapper}>
            <Animated.FlatList
              ref={flatListRef}
                data={allBookings.filter(item => item.type === 'upcoming' || item.type === 'spacer')}
              keyExtractor={(_, idx) => idx.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 61}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 16 }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              renderItem={({ item, index }) => {
                if (item.type === 'spacer') {
                  return (
                    <View style={{ width: (item as any).width, justifyContent: 'center', alignItems: 'center' }}>
                      <View style={styles.dividerLine} />
                    </View>
                  );
                }
                  if (item.type === 'upcoming') {
                const bookingItem = item as { type: string; label: string; image: any };
                return (
                  <TouchableOpacity style={styles.bookingCardAnimated}>
                    <Image source={bookingItem.image} style={styles.bookingCardImageAnimated} />
                    <View style={styles.bookingCardLabelBarAnimated}>
                      <Text style={styles.bookingCardLabelTextAnimated}>{bookingItem.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
                  }
                  return null;
              }}
              ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            />
          </View>
        </View>
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
                    const params = Object.fromEntries(Object.entries({ ...item, image: item.image.uri }).map(([k, v]) => [k, String(v)]));
                    router.push({ pathname: 'SalonDetailsScreen' as any, params });
                  }}
              >
                <View style={styles.salonContent}>
                  <Image source={item.image} style={styles.salonImage} />
                  <View style={styles.salonInfo}>
                      <TouchableOpacity onPress={() => {
                        const params = Object.fromEntries(Object.entries({ ...item, image: item.image.uri }).map(([k, v]) => [k, String(v)]));
                        router.push({ pathname: 'SalonDetailsScreen' as any, params });
                      }}>
                      <Text style={styles.salonName}>{item.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.salonBarbers}>{item.barbers} Barbers</Text>
                    </TouchableOpacity>
                    <View style={styles.salonStatsRow}>
                      <View style={styles.salonStat}><Ionicons name="thumbs-up" size={16} color="#222" /><Text style={styles.salonStatText}> {item.rating}</Text></View>
                      <View style={styles.salonStat}><Ionicons name="document-text" size={16} color="#222" /><Text style={styles.salonStatText}> {item.posts} Posts</Text></View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookNowBtn}>
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
  bookingCardsScrollContainer: {
    marginTop: 8,
    marginBottom: 16,
    minHeight: CARD_HEIGHT + 8,
    position: 'relative',
    paddingBottom: 24,
  },
  bookingCardsWrapper: {
    height: CARD_HEIGHT + 32,
    position: 'relative',
    justifyContent: 'center',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
    height: 20,
    justifyContent: 'center',
  },
  stickyHeaderText: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'normal',
    letterSpacing: 0,
    flexShrink: 1,
    overflow: 'hidden',
  },
  animatedDivider: {
    position: 'absolute',
    top: 20,
    width: 1,
    height: CARD_HEIGHT,
    backgroundColor: DIVIDER_COLOR,
    zIndex: 5,
  },
  bookingCardAnimated: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#444',
    overflow: 'hidden',
    flexDirection: 'column',
    marginTop: 24,
    marginBottom: 8,
  },
  bookingCardImageAnimated: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
    backgroundColor: '#444',
  },
  bookingCardLabelBarAnimated: {
    width: '100%',
    height: LABEL_HEIGHT,
    backgroundColor: '#E5E5E5',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingCardLabelTextAnimated: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
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
}); 