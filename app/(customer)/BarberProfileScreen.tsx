import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, useWindowDimensions, StatusBar, TouchableWithoutFeedback, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomBar from '../../components/BottomBar';
import { customerAPI } from '../../services/api/customerAPI';
import { TimeSlot, ProfileReview } from '../../services/mock/AppMockData';
// For Expo Router, use the options export to hide the header
export const options = { headerShown: false };

// Mock specialties and gallery data with tags
const specialties = [
  { key: 'all', label: 'All' },
  { key: 'fade', label: 'Fade' },
  { key: 'beard', label: 'Beard Trim' },
  { key: 'color', label: 'Color' },
  { key: 'design', label: 'Design' },
];

const galleryData = [
  { id: '1', label: 'Clean Fade', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', tags: ['fade'] },
  { id: '2', label: 'Sharp Beard', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', tags: ['beard'] },
  { id: '3', label: 'Color Pop', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', tags: ['color'] },
  { id: '4', label: 'Creative Design', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80', tags: ['design'] },
  { id: '5', label: 'Fade & Beard', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', tags: ['fade', 'beard'] },
];

// Generate dynamic date tabs based on current date
const generateDateTabs = () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(today.getTime() + 48 * 60 * 60 * 1000);
  
  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };
  
  return [
    { key: 'today', label: 'Today', date: today, slots: 0, color: '#999', slotData: null as TimeSlot[] | null },
    { key: 'tomorrow', label: 'Tomorrow', date: tomorrow, slots: 0, color: '#03A100', slotData: null as TimeSlot[] | null },
    { key: 'dayAfter', label: formatDate(dayAfterTomorrow), date: dayAfterTomorrow, slots: 0, color: '#FF8A00', slotData: null as TimeSlot[] | null },
  ];
};

type TabKey = 'today' | 'tomorrow' | 'dayAfter';

export default function BarberProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>('tomorrow');
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateTabs, setDateTabs] = useState(generateDateTabs());
  const { width: windowWidth } = useWindowDimensions();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showMenu, setShowMenu] = useState(false);
  // Get barber details from params or use fallback
  const name = (params.name as string) || 'Shark.l1';
  const photo = (params.photo as string) || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center';
  const rating = (params.rating as string) || '90%';
  const employeeId = params.employeeId as string || 'employee-1'; // In real app, get from params
  
  // Review state (just for count display)
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  const selectedServicesJson = params.selectedServicesJson as string;
  const salonName = params.salonName as string || "Man's Cave Hair Salon";
  // You can add more params as needed (e.g., posts, role, etc.)
  const horizontalMargin = 16;
  const galleryGap = 12;
  const galleryCardWidth = (windowWidth - horizontalMargin * 2 - galleryGap) / 2;

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  // Load available slots for all dates on component mount
  useEffect(() => {
    const loadAllSlots = async () => {
      setLoading(true);
      try {
        const updatedTabs = [...dateTabs];
        
        // Load slots for each date and store the actual slot data
        for (let i = 0; i < updatedTabs.length; i++) {
          const tab = updatedTabs[i];
          const timeSlots = await customerAPI.getTimeSlotsForDate(tab.date);
          updatedTabs[i].slots = timeSlots.length;
          updatedTabs[i].slotData = timeSlots; // Store the actual slot data
        }
        
        setDateTabs(updatedTabs);
        
        // Load slots for the active tab using the stored data
        const activeTabData = updatedTabs.find(tab => tab.key === activeTab);
        if (activeTabData && activeTabData.slotData) {
          const slotTimes = activeTabData.slotData.map(slot => slot.time);
          setSlots(slotTimes);
          console.log(`Date: ${activeTabData.label}, Slot Count: ${activeTabData.slots}, Displayed Slots: ${slotTimes.length}`);
        }
      } catch (error) {
        console.error('Error loading slots:', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllSlots();
  }, []);

  // Load slots when active tab changes
  useEffect(() => {
    const loadSlotsForActiveTab = async () => {
      setLoading(true);
      try {
        const activeTabData = dateTabs.find(tab => tab.key === activeTab);
        if (activeTabData) {
          // Use stored slot data if available, otherwise fetch new data
          if (activeTabData.slotData) {
            const slotTimes = activeTabData.slotData.map(slot => slot.time);
            setSlots(slotTimes);
            console.log(`Tab Change - Date: ${activeTabData.label}, Slot Count: ${activeTabData.slots}, Displayed Slots: ${slotTimes.length}`);
          } else {
            const timeSlots = await customerAPI.getTimeSlotsForDate(activeTabData.date);
            const slotTimes = timeSlots.map(slot => slot.time);
            setSlots(slotTimes);
            console.log(`Tab Change - Date: ${activeTabData.label}, Fetched Slots: ${slotTimes.length}`);
          }
        }
      } catch (error) {
        console.error('Error loading slots:', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (dateTabs.length > 0) {
      loadSlotsForActiveTab();
    }
  }, [activeTab, dateTabs]);

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    // Handle different menu actions
    switch (action) {
      case 'share':
        // Share barber profile
        console.log('Share barber profile');
        break;
      case 'report':
        // Report barber
        console.log('Report barber');
        break;
      case 'block':
        // Block barber
        console.log('Block barber');
        break;
      case 'save':
        // Save to favorites
        console.log('Save to favorites');
        break;
      case 'contact':
        // Contact barber
        console.log('Contact barber');
        break;
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" hidden />
      {/* Header */}
      <View style={styles.headerRowWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{name}</Text>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={handleMenuToggle}
            activeOpacity={0.8}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
          </TouchableOpacity>
          
          {/* Menu Modal with Blur Background */}
          <Modal
            visible={showMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.menuDropdown}>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => handleMenuAction('share')}
                  >
                    <Ionicons name="share-outline" size={18} color="#666" />
                    <Text style={styles.menuItemText}>Share Profile</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => handleMenuAction('save')}
                  >
                    <Ionicons name="bookmark-outline" size={18} color="#666" />
                    <Text style={styles.menuItemText}>Save to Favorites</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => handleMenuAction('report')}
                  >
                    <Ionicons name="flag-outline" size={18} color="#666" />
                    <Text style={styles.menuItemText}>Report</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.menuItem, styles.menuItemDanger]}
                    onPress={() => handleMenuAction('block')}
                  >
                    <Ionicons name="ban-outline" size={18} color="#FF3B30" />
                    <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Block</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Profile Info */}
          <View style={styles.profileInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileRole}>Men’s hair Salon</Text>
            </View>
            <Image
              source={{ uri: photo }}
              style={styles.profilePic}
            />
          </View>
          {/* Booking Card */}
          <View style={styles.bookingCard}>
            <Text style={styles.visitLabel}>Book Store visit</Text>
            <View style={styles.salonInfoRow}>
              <Text style={styles.salonName}>Man’s Cave Hair Salon</Text>
              <Text style={styles.avgFee}>Avg. $30 fee</Text>
            </View>
            {/* Date Tabs */}
            <View style={styles.dateTabsRow}>
              {dateTabs.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.dateTab, activeTab === tab.key && styles.dateTabActive]}
                  onPress={() => setActiveTab(tab.key as TabKey)}
                >
                  <View style={styles.dateTabContent}>
                    <Text style={[styles.dateTabLabel, activeTab === tab.key && styles.dateTabLabelActive]}>{tab.label}</Text>
                    <Text style={[styles.slotCount, { color: tab.slots === 0 ? '#999' : tab.color }]}> {tab.slots === 0 ? 'No Slots' : `${tab.slots} Slots`}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {/* Slot Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotButtonsRow}>
              {loading ? (
                <Text style={styles.loadingText}>Loading available slots...</Text>
              ) : slots.length === 0 ? (
                <Text style={styles.noSlotsText}>No slots available for this date</Text>
              ) : (
                slots.map((slot: string, idx: number) => (
                  <TouchableOpacity 
                    key={slot + idx} 
                    style={styles.slotBtn}
                    onPress={() => {
                      // Navigate directly to booking confirmation with selected time slot
                      const activeTabData = dateTabs.find(tab => tab.key === activeTab);
                      const selectedDate = activeTabData ? activeTabData.label : 'Today';
                      
                      const params = {
                        barberName: name,
                        barberPhoto: photo,
                        salonName: salonName,
                        selectedDate: selectedDate,
                        selectedTime: slot,
                        selectedService: selectedService,
                        selectedServiceLabel: selectedServiceLabel,
                        selectedServicesJson: selectedServicesJson || (selectedService ? JSON.stringify([{ key: selectedService, label: selectedServiceLabel }]) : ''),
                        source: 'barber-profile-direct',
                      };
                      router.push({ pathname: '/booking-confirmation', params });
                    }}
                  >
                    <Text style={styles.slotBtnText}>{slot}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const activeTabData = dateTabs.find(tab => tab.key === activeTab);
                router.push({
                  pathname: '/all-slots',
                  params: {
                    name: name,
                    photo: photo,
                    salonName: salonName,
                    selectedService: selectedService,
                    selectedServiceLabel: selectedServiceLabel,
                    selectedServicesJson: selectedServicesJson,
                    selectedDate: activeTabData ? activeTabData.date.toISOString() : new Date().toISOString(),
                    source: 'barber-profile'
                  }
                });
              }}
            >
              <Text style={styles.viewAllSlotsUnderline}>View all slots</Text>
            </TouchableOpacity>
          </View>
          {/* Specialties Section */}
          <View style={styles.specialtiesSection}>
            <Text style={styles.specialtiesLabel}>Specialties:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specialtiesChipsRow}>
              {specialties.map(spec => (
                <TouchableOpacity
                  key={spec.key}
                  style={[styles.specialtyChip, selectedSpecialty === spec.key && styles.specialtyChipActive]}
                  onPress={() => setSelectedSpecialty(selectedSpecialty === spec.key ? 'all' : spec.key)}
                >
                  <Text style={[styles.specialtyChipText, selectedSpecialty === spec.key && styles.specialtyChipTextActive]}>{spec.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Gallery Cards Header */}
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>Posts</Text>
            <TouchableOpacity 
              style={styles.reviewHeaderButton}
              onPress={() => router.push({
                pathname: '/(customer)/BarberReviewsPage',
                params: {
                  employeeId: employeeId,
                  barberName: name,
                  barberPhoto: photo
                }
              })}
            >
              <Ionicons name="star-outline" size={18} color="#2196F3" />
              <Text style={styles.reviewHeaderButtonText}>
                Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Gallery Cards */}
          <View style={styles.galleryGrid}>
            {(selectedSpecialty && selectedSpecialty !== 'all'
              ? galleryData.filter(card => card.tags.includes(selectedSpecialty))
              : galleryData
            ).map(card => (
              <TouchableOpacity 
                key={card.id} 
                style={styles.galleryCard}
                onPress={() => router.push({ pathname: '/PostViewerScreen' as any, params: { postId: card.id } })}
              >
                <Image source={{ uri: card.image }} style={styles.galleryImage} />
                <View style={styles.galleryOverlay} />
                <Text style={styles.galleryLabel}>{card.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </ScrollView>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerRowWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    height: 56,
    marginBottom: 0,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerIconRight: {
    position: 'absolute',
    right: 16,
    zIndex: 2,
    height: 56,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    flex: 1,
    fontWeight: '600',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  profilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  profileRole: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  ratingPostsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
    width: 180,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  postsText: {
    fontSize: 13,
    color: '#000',
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    marginHorizontal: '4%',
    marginTop: 16,
  },
  visitLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
  },
  salonInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  salonName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  avgFee: {
    fontSize: 13,
    color: '#666',
  },
  dateTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
    width: '100%',
  },
  dateTab: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 0,
  },
  dateTabActive: {
    backgroundColor: '#FFF',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  dateTabLabel: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  dateTabLabelActive: {
    fontWeight: '600',
  },
  slotCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  slotButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingVertical: 2,
  },
  slotBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  slotBtnText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  noSlotsText: {
    fontSize: 13,
    color: '#999',
  },
  loadingText: {
    fontSize: 13,
    color: '#666',
  },
  viewAllSlots: {
    fontSize: 13,
    color: '#03A100',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  viewAllSlotsUnderline: {
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
    marginTop: 4,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  galleryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  reviewHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    gap: 4,
  },
  reviewHeaderButtonText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  galleryCard: {
    width: '48%',
    aspectRatio: 0.97,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  galleryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  galleryLabel: {
    fontSize: 13,
    color: '#FFF',
    zIndex: 2,
    fontWeight: '600',
  },
  contentWrapper: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  dateTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtiesSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  specialtiesLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginBottom: 8,
  },
  specialtiesChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  specialtyChipActive: {
    backgroundColor: '#03A100',
    borderColor: '#03A100',
  },
  specialtyChipText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  specialtyChipTextActive: {
    color: '#FFF',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 16,
  },
  menuDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: '#FF3B30',
  },
  reviewsSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
  },
  writeReviewText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
    marginLeft: 4,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  reviewRatingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 12,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpfulText: {
    fontSize: 12,
    color: '#666',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  noReviewsSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  viewAllReviewsButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllReviewsText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  reviewModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  reviewModalBody: {
    padding: 20,
  },
  reviewModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  starButton: {
    padding: 4,
  },
  reviewTextInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  reviewModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  reviewModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelReviewButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelReviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitReviewButton: {
    backgroundColor: '#2196F3',
  },
  submitReviewButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  submitReviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 