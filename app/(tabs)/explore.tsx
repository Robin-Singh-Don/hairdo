import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Modal, ScrollView, Dimensions, ViewStyle, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomBar from '../../components/BottomBar';
import { useSelectedServices } from './appointment';

const LOCATION = 'Vancouver';
const PROFILE_IMAGE = 'https://randomuser.me/api/portraits/men/32.jpg';

const featuredServices = [
  { key: 'haircut', label: 'Haircut', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { key: 'haircut_beard', label: 'Haircut & Beard', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80' },
];
const standardServices = [
  { key: 'beard', label: 'Beard', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=beard' },
  { key: 'long_hair', label: 'Long hair', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=longhair' },
  { key: 'styling', label: 'Styling', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=styling' },
  { key: 'facial', label: 'Facial', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=facial' },
  { key: 'coloring', label: 'Coloring', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=coloring' },
  { key: 'more', label: 'More', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=more' },
];

const extraServices = [
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
  { key: 'nails', label: 'Nails' },
  { key: 'tattoo', label: 'Tattoo' },
  { key: 'piercing', label: 'Piercing' },
];

const sampleSalons = [
  {
    id: '1',
    name: "Man's Cave Salon",
    barbers: 8,
    rating: '90%',
    posts: 78,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center',
  },
  {
    id: '2',
    name: 'Elite Barbershop',
    barbers: 12,
    rating: '95%',
    posts: 120,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
  },
  {
    id: '3',
    name: 'Classic Cuts',
    barbers: 6,
    rating: '88%',
    posts: 45,
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center',
  },
  {
    id: '4',
    name: 'Downtown Barbers',
    barbers: 10,
    rating: '92%',
    posts: 89,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop&crop=center',
  },
];

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
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [location, setLocation] = useState(LOCATION);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [moreSearch, setMoreSearch] = useState('');
  const [selectedMore, setSelectedMore] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedServices, setSelectedServices } = useSelectedServices();
  React.useEffect(() => {
    if (params && params.location) {
      setLocation(params.location as string);
    }
  }, [params?.location]);

  const handleSelect = (key: string, label: string) => {
    setSelectedServices(services => {
      if (services.some(s => s.key === key)) return services;
      return [...services, { key, label }];
    });
    router.push({ pathname: '/appointment', params: { service: key, label } });
  };

  const handleMoreSelect = (key: string, label: string) => {
    setShowMoreModal(false);
    setSelected(key);
    router.push({ pathname: '/appointment', params: { service: key, label } });
  };

  const filteredExtra = extraServices.filter(s =>
    s.label.toLowerCase().includes(moreSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.centeredContent, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => router.push('/location-search')}
          >
            <Text style={styles.locationText}>{location}</Text>
            <Ionicons name="chevron-down" size={18} color="#000" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profilePicWrapper}>
            <Image source={{ uri: PROFILE_IMAGE }} style={styles.profilePic} />
          </TouchableOpacity>
        </View>
        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for barbers, salons, or services..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearIconWrapper}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Hi Robin</Text>
        {/* Popular Sticker on left side */}
        <View style={styles.popularStickerLeft}>
          <Ionicons name="flame" size={12} color="#FF6B00" style={{ marginRight: 3 }} />
          <Text style={styles.popularStickerText}>Popular</Text>
        </View>
        {/* Service Grid */}
        <View style={styles.gridWrapper}>
          {/* Featured Row */}
          <View style={styles.featuredRow}>
            {featuredServices.map((item) => (
              <View key={item.key} style={{ alignItems: 'flex-start', marginRight: 12 }}>
                <TouchableOpacity
                  style={[styles.featuredCard, { overflow: 'hidden', padding: 0 }]}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(item.key, item.label)}
                >
                  <Image source={{ uri: item.image }} style={styles.featuredImageFull} />
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
                    style={styles.standardCard}
                    activeOpacity={0.85}
                    onPress={() => handleSelect(item.key, item.label)}
                  >
                    <View style={styles.standardIconWrapper}>
                      <Image source={{ uri: item.image }} style={styles.standardIconImage} />
                    </View>
                    <Text style={styles.standardLabel}>{item.label}</Text>
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
                    <TouchableOpacity style={styles.seeMoreCard}>
                      <Ionicons name="ellipsis-horizontal" size={32} color="#AEB4F7" style={{ marginBottom: 8 }} />
                      <Text style={styles.seeMoreText}>See more</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <View style={styles.salonCard}>
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
                    <TouchableOpacity style={styles.bookNowBtn}>
                      <Text style={styles.bookNowBtnText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
            {/* User Activity Card */}
            <View style={styles.activityCard}>
              <Ionicons name="star" size={28} color="#FFD700" style={{ marginBottom: 10 }} />
              <Text style={styles.activityCardTitle}>Your previous bookings</Text>
              <Text style={styles.activityCardText}>See your booking history and rebook your favorite services.</Text>
            </View>
            {/* Promotions Card (moved to end) */}
            <View style={styles.promoCard}>
              <Ionicons name="gift" size={26} color="#AEB4F7" style={{ marginBottom: 10 }} />
              <Text style={styles.promoCardTitle}>Promotions & Offers</Text>
              <Text style={styles.promoCardText}>Check out the latest deals and exclusive offers for you!</Text>
            </View>
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
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 0,
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
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
});
