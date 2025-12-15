 import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomBar from '../../components/BottomBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { customerAPI } from '../../services/api/customerAPI';
import { SalonHours, SalonStaff, SalonPost } from '../../services/mock/AppMockData';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SalonDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [showHoursModal, setShowHoursModal] = useState(false);
  
  // API state
  const [weeklyHours, setWeeklyHours] = useState<SalonHours[]>([]);
  const [salonStaff, setSalonStaff] = useState<SalonStaff[]>([]);
  const [storePosts, setStorePosts] = useState<SalonPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Salon ID for reviews
  const salonId = params.salonId as string || 'salon-1'; // In real app, get from params

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [hoursData, staffData, postsData] = await Promise.all([
          customerAPI.getSalonHours(),
          customerAPI.getSalonStaff(),
          customerAPI.getSalonPosts()
        ]);
        setWeeklyHours(hoursData);
        setSalonStaff(staffData);
        setStorePosts(postsData);
      } catch (error) {
        console.error('Error loading salon data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading salon details...</Text>
      </View>
    );
  }
  
  const name = params.name as string || "Man's cave Salon";
  const image = params.image as string | undefined;
  const address = params.city ? `${params.city}` : '9785, 132St';
  const staffCount = params.staffCount ? parseInt(params.staffCount as string, 10) : 4;
  const source = params.source as string || 'appointment';
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  const selectedServicesJson = params.selectedServicesJson as string;
  const selectedServicesFromExplore = params.selectedServices as string;
  

  
  // Parse selected services if available - handle both sources
  const selectedServices: Array<{ key: string; label: string }> = (() => {
    // First try to parse services from appointment page (new format)
    if (selectedServicesJson) {
      try {
        const parsed = JSON.parse(selectedServicesJson);
        return parsed;
      } catch (error) {
        console.warn('Failed to parse selected services JSON:', error);
      }
    }
    
    // Fallback to explore page format
    if (selectedServicesFromExplore) {
      try {
        const parsed = JSON.parse(selectedServicesFromExplore);
        return parsed;
      } catch (error) {
        console.warn('Failed to parse selected services from explore:', error);
      }
    }
    
    return [];
  })();
  


  // Weekly hours data
  // Weekly hours data is now loaded from API
  
  // You can add more params as needed

  // Generate sample staff data
  const sampleStaffNames = [
    'Shark.11', 'Alex B.', 'Jamie S.', 'Taylor R.', 'Jordan P.', 'Morgan K.', 'Chris D.', 'Sam T.'
  ];
  const sampleStaffPhotos = [
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=center',
  ];
  const staff = Array.from({ length: staffCount }).map((_, i) => ({
    id: (i + 1).toString(),
    name: sampleStaffNames[i % sampleStaffNames.length],
    role: "+ Men's hair Salon",
    status: 'Available',
    rating: `${90 + (i % 10)}%`,
    photo: { uri: sampleStaffPhotos[i % sampleStaffPhotos.length] },
    tag: `${3 + i} Pendings, ${1 + i}h ${35 - i * 2} min`,
    locked: i % 2 === 1,
  }));

  // Store posts data is now loaded from API


  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navBarWrapper}>
        <View style={styles.navBarRow}>
          <TouchableOpacity onPress={() => {
            if (source === 'explore') {
              router.replace('/(customer)/explore');
            } else {
              router.replace('/(customer)/appointment');
            }
          }} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{name}</Text>
          <TouchableOpacity 
            style={styles.bookDirectlyBtn}
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: '/book-directly',
                params: {
                  salonName: name,
                  salonImage: image,
                  selectedService: selectedService,
                  selectedServiceLabel: selectedServiceLabel,
                  selectedServicesJson: selectedServicesJson,
                  source: 'salon-details'
                }
              });
            }}
          >
            <Ionicons name="flash" size={16} color="#fff" />
            <Text style={styles.bookDirectlyText}>Book Directly</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Scrollable Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Banner Image Placeholder or Real Image */}
          {image ? (
            <Image source={{ uri: image }} style={styles.banner} />
          ) : (
            <View style={styles.banner} />
          )}
          {/* Open Hours Section */}
          <TouchableOpacity 
            style={styles.openHoursRow}
            activeOpacity={0.7}
            onPress={() => setShowHoursModal(true)}
          >
            <Ionicons name="time-outline" size={18} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.openToday}>OPEN TODAY</Text>
            <Text style={styles.hours}>8:00AM – 7:00PM</Text>
          </TouchableOpacity>
          {/* Address Section */}
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.addressText}>{address}</Text>
          </View>
          <View style={styles.addressBox} />
          {/* Scissors Divider with Selected Services */}
          <View style={styles.dividerContainer}>
            <MaterialCommunityIcons name="content-cut" size={24} color="#000" />
            {(selectedServices.length > 0 || (selectedService && selectedServiceLabel)) && (
              <View style={styles.selectedServicesContainer}>
                <Text style={styles.selectedServicesLabel}>
                  {selectedServices.length > 1 ? 'Selected Services:' : 'Selected Service:'}
                </Text>
                {selectedServices.length > 0 ? (
                  // Show multiple services from appointment page
                  <View style={styles.servicesRow}>
                    {selectedServices.map((service, index) => (
                      <View key={service.key} style={styles.serviceChip}>
                        <Ionicons name="checkmark-circle" size={16} color="#03A100" />
                        <Text style={styles.serviceChipText}>{service.label}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  // Fallback to single service from params
                  <View style={styles.serviceChip}>
                    <Ionicons name="checkmark-circle" size={16} color="#03A100" />
                    <Text style={styles.serviceChipText}>{selectedServiceLabel}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          

          {/* Staff Cards */}
          <View style={styles.staffList}>
            {staff.slice(0, 3).map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.staffCard}
                onPress={() => router.push({
                  pathname: '/BarberProfileScreen',
                  params: {
                    name: member.name,
                    photo: member.photo.uri,
                    rating: member.rating,
                    selectedService: selectedService,
                    selectedServiceLabel: selectedServiceLabel,
                    selectedServicesJson: selectedServicesJson,
                    salonName: name,
                    // add more as needed
                  }
                })}
              >
                <Image source={member.photo} style={styles.staffPhoto} />
                <View style={styles.staffInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.staffName}>{member.name}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="thumbs-up-outline" size={18} color="#000" />
                      <Text style={styles.ratingText}> {member.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.staffRole}>{member.role}</Text>
                  <Text style={styles.staffStatus}>{member.status}</Text>
                  <View style={styles.bottomRow}>
                    <Text style={styles.bottomTag}>{member.tag}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {/* See All Barbers Button */}
            {staff.length > 3 && (
              <TouchableOpacity
                style={styles.seeAllBarbersBtn}
                activeOpacity={0.8}
                onPress={() => router.push({
                  pathname: '/all-barbers',
                  params: {
                    salonName: name,
                    salonImage: image,
                    selectedService: selectedService,
                    selectedServiceLabel: selectedServiceLabel,
                    selectedServicesJson: selectedServicesJson,
                    source: 'salon-details'
                  }
                })}
              >
                                 <View style={styles.seeAllContent}>
                   <Ionicons name="people" size={20} color="#AEB4F7" />
                   <Text style={styles.seeAllText}>See all barbers</Text>
                   <Ionicons name="chevron-forward" size={20} color="#AEB4F7" />
                 </View>
              </TouchableOpacity>
            )}
          </View>
          {/* Store Posts Grid */}
          <View style={styles.storePostsHeader}>
            <Text style={{ fontSize: 17, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>Store Posts</Text>
            <TouchableOpacity 
              style={styles.reviewHeaderButton}
              onPress={() => router.push({
                pathname: '/(customer)/SalonReviewsPage',
                params: {
                  salonId: salonId,
                  salonName: name,
                  salonImage: image
                }
              })}
            >
              <Ionicons name="star-outline" size={18} color="#2196F3" />
              <Text style={styles.reviewHeaderButtonText}>Reviews</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.galleryGrid}>
            {storePosts.map(post => (
              <TouchableOpacity 
                key={post.id} 
                style={styles.galleryCard}
                onPress={() => router.push({ pathname: '/PostViewerScreen' as any, params: { postId: post.id } })}
              >
                <Image source={{ uri: post.image }} style={styles.galleryImage} />
                <View style={styles.galleryOverlay} />
                <Text style={styles.galleryLabel}>{post.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </ScrollView>
      
      {/* Hours Modal */}
      <Modal
        visible={showHoursModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowHoursModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setShowHoursModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Business Hours</Text>
              <View style={{ width: 40 }} />
            </View>
            
            {/* Salon Info in Modal */}
            <View style={styles.modalSalonInfo}>
              <Image 
                source={{ uri: image || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop&crop=center' }} 
                style={styles.modalSalonImage} 
              />
              <View style={styles.modalSalonDetails}>
                <Text style={styles.modalSalonName}>{name}</Text>
                <Text style={styles.modalSalonStatus}>Currently Open</Text>
              </View>
            </View>
            
            {/* Weekly Hours */}
            <View style={styles.hoursContainer}>
              <Text style={styles.hoursTitle}>Weekly Schedule</Text>
              {weeklyHours.map((day, index) => (
                <View key={index} style={styles.hourRow}>
                  <View style={styles.dayContainer}>
                    <Text style={styles.dayText}>{day.day}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: day.status === 'Open' ? '#03A100' : '#FF6B00' }
                    ]}>
                      <Text style={styles.statusText}>{day.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.hourText}>{day.hours}</Text>
                </View>
              ))}
            </View>
            
            {/* Additional Info */}
            <View style={styles.additionalInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="information-circle" size={16} color="#666" />
                <Text style={styles.infoText}>Last appointment 30 minutes before closing</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.infoText}>Holiday hours may vary</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={16} color="#666" />
                <Text style={styles.infoText}>Call for special arrangements</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Bottom Bar */}
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  navBarWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  navBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    height: 56,
    marginBottom: 0,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    flex: 1,
    fontWeight: '600',
  },
  banner: {
    width: '100%',
    height: 160,
    backgroundColor: '#444',
  },
  openHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  openToday: {
    color: '#03A100',
    fontSize: 13,
    marginRight: 10,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  hours: {
    fontSize: 13,
    color: '#000',
    marginLeft: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#000',
  },
  addressBox: {
    width: 'auto',
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginLeft: 42,
    marginRight: 42,
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  selectedServicesContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  selectedServicesLabel: {
    fontSize: 13,
    color: '#3c4c48',
    marginBottom: 6,
    textAlign: 'right',
    fontWeight: '500',
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#03A100',
    maxWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceChipText: {
    fontSize: 12,
    color: '#03A100',
    fontWeight: '600',
    marginLeft: 6,
  },
  serviceChipPrice: {
    fontSize: 10,
    color: '#FF6B00',
    fontWeight: '600',
    marginLeft: 6,
  },
  scissorsIcon: {
    fontSize: 24,
    color: '#000',
  },
  staffList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  staffCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
    padding: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  staffPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  staffRole: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    flex: 1,
    flexWrap: 'wrap',
  },
  staffStatus: {
    fontSize: 13,
    color: '#03A100',
    marginTop: 2,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bottomTag: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    flexWrap: 'wrap',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  galleryCard: {
    width: '48%',
    aspectRatio: 0.97,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#eee',
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
    height: 40,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  galleryLabel: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    fontSize: 13,
    color: '#FFF',
    zIndex: 2,
    fontWeight: '600',
  },
  bottomBarWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'fixed',
    left: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    borderRadius: 0,
    height: 82,
    maxWidth: 400,
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 0,
  },
  bottomBarProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#222',
  },
  bottomBarPlusWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookDirectlyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookDirectlyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  modalSalonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  modalSalonImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  modalSalonDetails: {
    flex: 1,
  },
  modalSalonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  modalSalonStatus: {
    fontSize: 13,
    color: '#03A100',
    fontWeight: '500',
  },
  hoursContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  hourText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  additionalInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  storePostsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
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
  seeAllBarbersBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  seeAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllText: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 12,
  },

}); 