import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, ListRenderItem, Modal, ScrollView, Dimensions, Alert } from 'react-native';
import BottomBar from '../../components/BottomBar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock data for upcoming bookings
const upcomingBookings = [
  {
    id: '1',
    service: 'Haircut & Styling',
    salon: 'Elite Salon',
    barber: 'Mike Johnson',
    date: 'Tomorrow',
    time: '2:00 PM',
    price: '$45',
    status: 'confirmed',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 0,
    haircutPhoto: '',
    haircutDescription: '',
    mediaItems: [],
    inspirationPhotos: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=200&h=200&fit=crop&crop=center'
    ],
    specialInstructions: 'I want a modern fade with textured top, similar to the photos. Please keep it professional for work.',
  },
  {
    id: '2',
    service: 'Beard Trim',
    salon: 'Urban Cuts',
    barber: 'Alex Smith',
    date: 'Next Week',
    time: '10:00 AM',
    price: '$25',
    status: 'confirmed',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 0,
    haircutPhoto: '',
    haircutDescription: '',
    mediaItems: [],
    inspirationPhotos: [],
    specialInstructions: 'Clean, sharp beard trim. I prefer a natural look, not too sculpted.',
  },
  {
    id: '3',
    service: 'Hair Color',
    salon: 'Style Studio',
    barber: 'Sarah Wilson',
    date: 'March 15',
    time: '3:30 PM',
    price: '$80',
    status: 'pending',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    rating: 0,
    haircutPhoto: '',
    haircutDescription: '',
    mediaItems: [],
    inspirationPhotos: [],
    specialInstructions: '',
  },
];

// Mock data for booking history
const bookingHistory = [
  {
    id: '1',
    service: 'Haircut',
    salon: 'Elite Salon',
    barber: 'Mike Johnson',
    date: 'March 1',
    time: '2:00 PM',
    price: '$35',
    status: 'completed',
    rating: 5,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    haircutPhoto: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop&crop=center',
    haircutDescription: 'Classic fade with textured top',
    mediaItems: [
      {
        id: '1',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop&crop=center',
        description: 'Classic fade with textured top'
      },
      {
        id: '2',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400&h=400&fit=crop&crop=center',
        description: 'Side view of the haircut'
      },
      {
        id: '3',
        type: 'video' as const,
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center',
        description: '360° view of the haircut'
      }
    ],
  },
  {
    id: '2',
    service: 'Beard Trim',
    salon: 'Urban Cuts',
    barber: 'Alex Smith',
    date: 'February 25',
    time: '10:00 AM',
    price: '$20',
    status: 'completed',
    rating: 4,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    haircutPhoto: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=300&h=300&fit=crop&crop=center',
    haircutDescription: 'Clean beard trim and shaping',
    mediaItems: [
      {
        id: '1',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400&h=400&fit=crop&crop=center',
        description: 'Clean beard trim and shaping'
      },
      {
        id: '2',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=center',
        description: 'Before and after comparison'
      }
    ],
  },
  {
    id: '3',
    service: 'Hair Styling',
    salon: 'Style Studio',
    barber: 'Sarah Wilson',
    date: 'February 20',
    time: '1:00 PM',
    price: '$50',
    status: 'completed',
    rating: 5,
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    haircutPhoto: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=300&fit=crop&crop=center',
    haircutDescription: 'Modern pompadour with fade',
    mediaItems: [
      {
        id: '1',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop&crop=center',
        description: 'Modern pompadour with fade'
      }
    ],
  },
  {
    id: '4',
    service: 'Full Beard Grooming',
    salon: 'Beard Masters',
    barber: 'Tom Davis',
    date: 'February 15',
    time: '11:30 AM',
    price: '$30',
    status: 'completed',
    rating: 4,
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    haircutPhoto: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=300&fit=crop&crop=center',
    haircutDescription: 'Full beard grooming and oil treatment',
    mediaItems: [
      {
        id: '1',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=center',
        description: 'Full beard grooming and oil treatment'
      },
      {
        id: '2',
        type: 'video' as const,
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center',
        description: 'Grooming process timelapse'
      }
    ],
  },
];

type MediaItem = {
  id: string;
  type: 'photo' | 'video';
  url: string;
  description: string;
};

type UpcomingBooking = {
  id: string;
  service: string;
  salon: string;
  barber: string;
  date: string;
  time: string;
  price: string;
  status: string;
  profileImage: string;
  rating: number;
  haircutPhoto: string;
  haircutDescription: string;
  mediaItems: MediaItem[];
  inspirationPhotos?: string[];
  specialInstructions?: string;
};

type HistoryBooking = {
  id: string;
  service: string;
  salon: string;
  barber: string;
  date: string;
  time: string;
  price: string;
  status: string;
  rating: number;
  profileImage: string;
  haircutPhoto: string;
  haircutDescription: string;
  mediaItems: MediaItem[];
};

type Booking = UpcomingBooking | HistoryBooking;

const TAB_ITEMS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'history', label: 'History' },
];

const MyBookingsScreen = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedMediaItems, setSelectedMediaItems] = useState<MediaItem[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>(upcomingBookings as UpcomingBooking[]);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<UpcomingBooking | null>(null);
  const [upcomingDetailsModalVisible, setUpcomingDetailsModalVisible] = useState(false);
  const [selectedUpcomingBooking, setSelectedUpcomingBooking] = useState<UpcomingBooking | null>(null);
  const router = useRouter();

  const handleTabPress = useCallback((tabKey: 'upcoming' | 'history') => {
    setActiveTab(tabKey);
  }, []);

  const handleUpcomingBookingPress = useCallback((booking: UpcomingBooking) => {
    setSelectedUpcomingBooking(booking);
    setUpcomingDetailsModalVisible(true);
  }, []);

  const handleBookingPress = useCallback((booking: Booking) => {
    // Show receipt modal instead of navigating
    setSelectedBooking(booking);
    setReceiptModalVisible(true);
  }, []);

  const handleReceiptClose = useCallback(() => {
    setReceiptModalVisible(false);
    setSelectedBooking(null);
  }, []);

  const handleReschedule = useCallback((booking: Booking) => {
    // Navigate to reschedule page
    console.log('Reschedule:', booking);
  }, []);

  const handleCancel = useCallback((booking: Booking) => {
    // Open custom confirmation modal for consistent cross-platform behavior
    setBookingToCancel(booking as UpcomingBooking);
    setCancelModalVisible(true);
  }, []);

  const confirmCancel = useCallback(() => {
    if (bookingToCancel) {
      setUpcoming(prev => prev.filter(b => b.id !== bookingToCancel.id));
    }
    setCancelModalVisible(false);
    setBookingToCancel(null);
  }, [bookingToCancel]);

  const closeCancelModal = useCallback(() => {
    setCancelModalVisible(false);
    setBookingToCancel(null);
  }, []);

  const handleRebook = useCallback((booking: Booking) => {
    // Navigate to booking page with pre-filled service
    router.push('/(tabs)/appointment');
  }, [router]);

  const handleViewPhoto = useCallback((booking: Booking) => {
    if (booking.mediaItems && booking.mediaItems.length > 0) {
      setSelectedMediaItems(booking.mediaItems as MediaItem[]);
      setCurrentMediaIndex(0);
      setPhotoModalVisible(true);
    }
  }, []);

  const handleClosePhotoModal = useCallback(() => {
    setPhotoModalVisible(false);
    setSelectedMediaItems([]);
    setCurrentMediaIndex(0);
  }, []);
  const handleMessage = useCallback((booking: UpcomingBooking) => {
    // Navigate directly to the chat (DM) screen.
    router.push({
      pathname: '/(tabs)/chat',
      params: {
        name: booking.barber,
        profileImage: booking.profileImage,
        fromMessagesTab: 'true',
      },
    });
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#03A100';
      case 'pending':
        return '#FF6B00';
      case 'completed':
        return '#007AFF';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#999';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#F0F8F0';
      case 'pending':
        return '#FFF5F0';
      case 'completed':
        return '#F0F8FF';
      case 'cancelled':
        return '#FFF5F5';
      default:
        return '#F8F9FA';
    }
  };

  const renderUpcomingBooking: ListRenderItem<UpcomingBooking> = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => handleUpcomingBookingPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.bookingHeader}>
        <Image source={{ uri: item.profileImage }} style={styles.barberImage} />
        <View style={styles.bookingInfo}>
          <Text style={styles.serviceName}>{item.service}</Text>
          <Text style={styles.salonName}>{item.salon}</Text>
          <Text style={styles.barberName}>with {item.barber}</Text>
        </View>
        <View style={styles.bookingStatus}>
          <Text style={styles.price}>{item.price}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'confirmed' ? '#F0F8F0' : '#FFF5F0' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'confirmed' ? '#03A100' : '#FF6B00' }
            ]}>
              {item.status === 'confirmed' ? 'Confirmed' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={16} color="#999" />
          <Text style={styles.timeText}>{item.date} at {item.time}</Text>
        </View>
      </View>
      
      <View style={styles.bookingActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.messageButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleMessage(item);
          }}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#007AFF" />
          <Text style={[styles.actionButtonText, styles.messageButtonText]}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleCancel(item);
          }}
        >
          <Ionicons name="close-outline" size={16} color="#FF3B30" />
          <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [handleMessage, handleCancel]);

  const renderHistoryBooking: ListRenderItem<HistoryBooking> = useCallback(({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Image source={{ uri: item.profileImage }} style={styles.barberImage} />
        <View style={styles.bookingInfo}>
          <Text style={styles.serviceName}>{item.service}</Text>
          <Text style={styles.salonName}>{item.salon}</Text>
          <Text style={styles.barberName}>with {item.barber}</Text>
        </View>
        <View style={styles.bookingStatus}>
          <Text style={styles.price}>{item.price}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons
              name="star"
              size={16}
              color="#FFD700"
            />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.timeText}>{item.date} at {item.time}</Text>
        </View>
      </View>
      
      <View style={styles.bookingActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleRebook(item)}
        >
          <Ionicons name="refresh-outline" size={16} color="#495057" />
          <Text style={styles.actionButtonText}>Book Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleBookingPress(item)}
        >
          <Ionicons name="eye-outline" size={16} color="#495057" />
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        {item.mediaItems && item.mediaItems.length > 0 && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.photoButton]}
            onPress={() => handleViewPhoto(item)}
          >
            <Ionicons name="camera-outline" size={16} color="#007AFF" />
            <Text style={[styles.actionButtonText, styles.photoButtonText]}>
              View Media ({item.mediaItems.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [handleRebook, handleBookingPress, handleViewPhoto]);

  const renderTabBar = useCallback(() => (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabRow}>
        {TAB_ITEMS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.key as 'upcoming' | 'history')}
            activeOpacity={0.7}
          >
            <View style={styles.tabLabelWrapper}>
              <Text style={styles.tabLabel}>{tab.label}</Text>
              <View style={styles.tabUnderlineContainer}>
                {activeTab === tab.key && <View style={styles.tabUnderline} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), [activeTab, handleTabPress]);

  const currentData = useMemo(() => 
    activeTab === 'upcoming' ? upcoming : bookingHistory, 
    [activeTab, upcoming]
  );

  const renderItem = useMemo(() => 
    activeTab === 'upcoming' ? renderUpcomingBooking : renderHistoryBooking, 
    [activeTab, renderUpcomingBooking, renderHistoryBooking]
  );

  const emptyStateText = useMemo(() => 
    activeTab === 'upcoming' ? 'No upcoming bookings' : 'No booking history', 
    [activeTab]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        
        {renderTabBar()}
        
        <FlatList
          data={currentData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Ionicons name="calendar-outline" size={64} color="#DDD" />
              <Text style={styles.emptyStateText}>{emptyStateText}</Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity 
                  style={styles.bookNowButton}
                  onPress={() => router.push('/(tabs)/appointment')}
                >
                  <Text style={styles.bookNowButtonText}>Book Now</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
      <BottomBar />

      {/* Receipt Modal */}
      <Modal
        visible={receiptModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleReceiptClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button (X in corner) */}
            <TouchableOpacity 
              style={styles.closeIconButton}
              onPress={handleReceiptClose}
            >
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>

            {/* Booking Receipt Header - match confirmation style */}
            <View style={styles.receiptHeaderSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="cut" size={32} color="#007AFF" />
              </View>
              <Text style={styles.companyName}>HairDo</Text>
              <Text style={styles.receiptSubtitle}>Booking Receipt</Text>
              <View style={[styles.statusBadgeLarge, { backgroundColor: '#F0F8F0' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#03A100" />
                <Text style={[styles.statusTextLarge, { color: '#03A100' }]}>Completed</Text>
              </View>
            </View>

            {/* Details - similar to confirmation */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Your Barber & Salon</Text>
              <View style={styles.barberInfoCard}>
                <Image source={{ uri: (selectedBooking as any)?.profileImage }} style={styles.detailBarberImage} />
                <View style={styles.barberInfo}>
                  <Text style={styles.detailBarberName}>{selectedBooking?.barber || 'Your Barber'}</Text>
                  <Text style={styles.detailSalonName}>{selectedBooking?.salon || 'Salon'}</Text>
                  <Text style={styles.barberSpecialty}>Professional Barber</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Service Details</Text>
              <View style={styles.serviceDetailCard}>
                <View style={styles.serviceInfo}>
                  <Ionicons name="cut" size={24} color="#007AFF" />
                  <View style={styles.serviceText}>
                    <Text style={styles.serviceDetailName}>{selectedBooking?.service || 'Haircut'}</Text>
                    <Text style={styles.serviceDescription}>Thank you for your visit!</Text>
                  </View>
                </View>
                <Text style={styles.serviceDetailPrice}>{selectedBooking?.price || '$35'}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Appointment Details</Text>
              <View style={styles.appointmentDetailCard}>
                <View style={styles.appointmentDetailRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                  </View>
                  <View style={styles.appointmentText}>
                    <Text style={styles.appointmentLabel}>Date</Text>
                    <Text style={styles.appointmentDetailText}>{(selectedBooking as any)?.date || ''}</Text>
                  </View>
                </View>
                <View style={styles.appointmentDetailRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="time-outline" size={20} color="#007AFF" />
                  </View>
                  <View style={styles.appointmentText}>
                    <Text style={styles.appointmentLabel}>Time</Text>
                    <Text style={styles.appointmentDetailText}>{(selectedBooking as any)?.time || ''}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <Text style={styles.cancelDescription}>
              Are you sure you want to cancel your {bookingToCancel?.service} appointment?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={closeCancelModal}>
                <Text style={styles.secondaryButtonText}>No, Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerButton} onPress={confirmCancel}>
                <Text style={styles.dangerButtonText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Photo Modal */}
      <Modal
        visible={photoModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleClosePhotoModal}
      >
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalContent}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.photoCloseButton}
              onPress={handleClosePhotoModal}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            {/* Navigation Controls */}
            {selectedMediaItems.length > 1 && (
              <>
                <TouchableOpacity 
                  style={[styles.navButton, styles.prevButton]}
                  onPress={() => setCurrentMediaIndex(prev => 
                    prev > 0 ? prev - 1 : selectedMediaItems.length - 1
                  )}
                  disabled={selectedMediaItems.length <= 1}
                >
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.navButton, styles.nextButton]}
                  onPress={() => setCurrentMediaIndex(prev => 
                    prev < selectedMediaItems.length - 1 ? prev + 1 : 0
                  )}
                  disabled={selectedMediaItems.length <= 1}
                >
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            )}
            
            {/* Pagination Indicator */}
            {selectedMediaItems.length > 1 && (
              <View style={styles.paginationContainer}>
                {selectedMediaItems.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentMediaIndex && styles.paginationDotActive
                    ]}
                  />
                ))}
              </View>
            )}
            
            {/* Media Content */}
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                setCurrentMediaIndex(newIndex);
              }}
              style={styles.mediaScrollView}
              contentContainerStyle={styles.mediaScrollContent}
            >
              {selectedMediaItems.map((item, index) => (
                <View key={item.id} style={styles.mediaItemContainer}>
                  {item.type === 'photo' ? (
                    <Image 
                      source={{ uri: item.url }} 
                      style={styles.fullSizePhoto}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.videoPlaceholder}>
                      <Ionicons name="play-circle" size={64} color="#fff" />
                      <Text style={styles.videoPlaceholderText}>Video Content</Text>
                    </View>
                  )}
                  {item.description && (
                    <Text style={styles.mediaDescription}>
                      {item.description}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Upcoming Booking Details Modal */}
      <Modal
        visible={upcomingDetailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUpcomingDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Absolute close button pinned to card corner */}
            <TouchableOpacity 
              style={styles.closeIconButton}
              onPress={() => setUpcomingDetailsModalVisible(false)}
            >
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
            <View style={styles.modalHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.modalTitle}>Booking Receipt</Text>
              </View>
            </View>
            
            {selectedUpcomingBooking && (
              <ScrollView style={styles.bookingDetailsScroll} showsVerticalScrollIndicator={false}>
                {/* Receipt Header */}
                <View style={styles.receiptHeaderSection}>
                  <View style={styles.logoContainer}>
                    <Ionicons name="cut" size={32} color="#007AFF" />
                  </View>
                  <Text style={styles.companyName}>HairDo</Text>
                  <Text style={styles.receiptSubtitle}>Upcoming Appointment</Text>
                  <View style={[
                    styles.statusBadgeLarge,
                    { backgroundColor: selectedUpcomingBooking.status === 'confirmed' ? '#F0F8F0' : '#FFF5F0' }
                  ]}>
                    <Ionicons 
                      name={selectedUpcomingBooking.status === 'confirmed' ? 'checkmark-circle' : 'time'} 
                      size={16} 
                      color={selectedUpcomingBooking.status === 'confirmed' ? '#03A100' : '#FF6B00'} 
                    />
                    <Text style={[
                      styles.statusTextLarge,
                      { color: selectedUpcomingBooking.status === 'confirmed' ? '#03A100' : '#FF6B00' }
                    ]}>
                      {selectedUpcomingBooking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* Barber & Salon Info */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Your Barber & Salon</Text>
                  <View style={styles.barberInfoCard}>
                    <Image source={{ uri: selectedUpcomingBooking.profileImage }} style={styles.detailBarberImage} />
                    <View style={styles.barberInfo}>
                      <Text style={styles.detailBarberName}>{selectedUpcomingBooking.barber}</Text>
                      <Text style={styles.detailSalonName}>{selectedUpcomingBooking.salon}</Text>
                      <Text style={styles.barberSpecialty}>Professional Barber</Text>
                    </View>
                    <TouchableOpacity style={styles.contactButton}>
                      <Ionicons name="call" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Service Details */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Service Details</Text>
                  <View style={styles.serviceDetailCard}>
                    <View style={styles.serviceInfo}>
                      <Ionicons name="cut" size={24} color="#007AFF" />
                      <View style={styles.serviceText}>
                        <Text style={styles.serviceDetailName}>{selectedUpcomingBooking.service}</Text>
                        <Text style={styles.serviceDescription}>Professional styling service</Text>
                      </View>
                    </View>
                    <Text style={styles.serviceDetailPrice}>{selectedUpcomingBooking.price}</Text>
                  </View>
                </View>

                {/* Appointment Details */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Appointment Details</Text>
                  <View style={styles.appointmentDetailCard}>
                    <View style={styles.appointmentDetailRow}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                      </View>
                      <View style={styles.appointmentText}>
                        <Text style={styles.appointmentLabel}>Date</Text>
                        <Text style={styles.appointmentDetailText}>{selectedUpcomingBooking.date}</Text>
                      </View>
                    </View>
                    <View style={styles.appointmentDetailRow}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="time-outline" size={20} color="#007AFF" />
                      </View>
                      <View style={styles.appointmentText}>
                        <Text style={styles.appointmentLabel}>Time</Text>
                        <Text style={styles.appointmentDetailText}>{selectedUpcomingBooking.time}</Text>
                      </View>
                    </View>
                    <View style={styles.appointmentDetailRow}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="location" size={20} color="#007AFF" />
                      </View>
                      <View style={styles.appointmentText}>
                        <Text style={styles.appointmentLabel}>Duration</Text>
                        <Text style={styles.appointmentDetailText}>45-60 minutes</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Salon Location */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Salon Location</Text>
                  <View style={styles.locationCard}>
                    <View style={styles.locationInfo}>
                      <Ionicons name="location" size={24} color="#FF6B00" />
                      <View style={styles.locationText}>
                        <Text style={styles.locationAddress}>123 Main Street, Downtown</Text>
                        <Text style={styles.locationCity}>New York, NY 10001</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.navigateButton}>
                      <Ionicons name="navigate" size={20} color="#fff" />
                      <Text style={styles.navigateButtonText}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Haircut Inspiration */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Haircut Inspiration</Text>
                  <Text style={styles.inspirationSubtitle}>Add photos to help your barber understand your style</Text>
                  
                  <View style={styles.mediaUploadSection}>
                    {selectedUpcomingBooking.inspirationPhotos && selectedUpcomingBooking.inspirationPhotos.length > 0 ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.inspirationScroll}>
                        {selectedUpcomingBooking.inspirationPhotos.map((photo, index) => (
                          <View key={index} style={styles.inspirationPhotoContainer}>
                            <Image source={{ uri: photo }} style={styles.inspirationPhoto} />
                            <TouchableOpacity style={styles.removePhotoButton}>
                              <Ionicons name="close-circle" size={20} color="#FF3B30" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <Ionicons name="camera-outline" size={48} color="#DDD" />
                        <Text style={styles.uploadText}>No inspiration photos yet</Text>
                      </View>
                    )}
                    
                    <TouchableOpacity style={styles.addPhotoButton}>
                      <Ionicons name="add" size={24} color="#007AFF" />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Special Instructions */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Special Instructions</Text>
                  <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsText}>
                      {selectedUpcomingBooking.specialInstructions || "No special instructions added yet. Tap to add your preferences, style notes, or any specific requests for your barber."}
                    </Text>
                    <TouchableOpacity style={styles.editInstructionsButton}>
                      <Ionicons name="create-outline" size={20} color="#007AFF" />
                      <Text style={styles.editInstructionsText}>Edit Instructions</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Quick Actions</Text>
                  <View style={styles.detailActionsRow}>
                    <TouchableOpacity 
                      style={[styles.detailActionButton, styles.rescheduleButton]}
                      onPress={() => {
                        setUpcomingDetailsModalVisible(false);
                        handleReschedule(selectedUpcomingBooking);
                      }}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                      <Text style={[styles.actionButtonText, styles.rescheduleButtonText]}>Reschedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.detailActionButton, styles.cancelButton]}
                      onPress={() => {
                        setUpcomingDetailsModalVisible(false);
                        handleCancel(selectedUpcomingBooking);
                      }}
                    >
                      <Ionicons name="close-outline" size={20} color="#FF3B30" />
                      <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Contact & Support - removed as requested */}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  tabBarContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    paddingVertical: 8,
  },
  tabLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  tabLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabUnderlineContainer: {
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  tabUnderline: {
    width: 80,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 16,
    padding: 20, // Increased padding for better mobile spacing
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16, // Increased margin for better spacing
  },
  barberImage: {
    width: 56, // Slightly larger image for mobile
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E9ECEF',
    marginRight: 16, // Increased margin for better spacing
  },
  bookingInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16, // Larger font for mobile readability
    color: '#000',
    fontWeight: '600',
    marginBottom: 6, // Increased margin
  },
  salonName: {
    fontSize: 14, // Larger font for mobile
    color: '#666',
    marginBottom: 4, // Increased margin
  },
  barberName: {
    fontSize: 14, // Larger font for mobile
    color: '#666',
  },
  bookingStatus: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16, // Larger font for mobile
    color: '#000',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12, // Increased padding for mobile
    paddingVertical: 6, // Increased padding for mobile
    borderRadius: 16, // Increased border radius for mobile
    borderWidth: 0.5,
  },
  statusText: {
    fontSize: 12, // Slightly larger for mobile
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    marginLeft: 4,
    lineHeight: 14, // Match the star icon height for perfect alignment
  },
  bookingDetails: {
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Increased margin for better separation
  },
  timeText: {
    fontSize: 14, // Larger font for mobile
    color: '#666',
    marginLeft: 8,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8, // Reduced gap for mobile
    flexWrap: 'wrap', // Allow buttons to wrap on small screens
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Increased padding for better touch targets
    paddingHorizontal: 16, // Increased padding for better touch targets
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    minHeight: 48, // Minimum height for mobile touch targets
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flex: 1, // Allow buttons to grow equally
    minWidth: 120, // Minimum width for button readability
  },
  actionButtonText: {
    fontSize: 14, // Larger font for mobile
    color: '#495057',
    fontWeight: '600',
    marginLeft: 8, // Increased margin
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFE0E0',
    minWidth: 120, // Minimum width for button readability
  },
  cancelButtonText: {
    color: '#FF3B30',
  },
  rescheduleButton: {
    backgroundColor: '#E0F7FA',
    borderColor: '#B2EBF2',
    minWidth: 140, // Minimum width for button readability
  },
  rescheduleButtonText: {
    color: '#007AFF',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  bookNowButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  bookNowButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 60,
    width: '100%',
    maxWidth: 360,
    maxHeight: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 6,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptDetails: {
    width: '100%',
    marginBottom: 20,
  },
  receiptSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  receiptFooter: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    minHeight: 44,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 44,
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 44,
  },
  secondaryButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    minHeight: 44,
  },
  dangerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  closeIconButton: {
    position: 'absolute',
    top: 16,
    left: 10,
    zIndex: 1,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  photoButton: {
    backgroundColor: '#E0F7FA',
    borderColor: '#B2EBF2',
    minWidth: 160, // Minimum width for "View Media" text
  },
  photoButtonText: {
    color: '#007AFF',
    fontSize: 14, // Larger font for mobile
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1.3, // Adjust as needed for photo aspect
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  haircutPhoto: {
    width: '100%',
    height: '100%',
  },
  photoDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  photoModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.95)', // Darker overlay for photo modal
  },
  photoModalContent: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSizePhoto: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -22 }],
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 8,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
  },
  mediaScrollView: {
    flex: 1,
    width: '100%',
  },
  mediaScrollContent: {
    alignItems: 'center',
  },
  mediaItemContainer: {
    width: Dimensions.get('window').width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: Dimensions.get('window').width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  videoPlaceholderText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  mediaDescription: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontWeight: '500',
  },

  // Upcoming Booking Details Modal Styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalCloseButton: {
    padding: 8,
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 2,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingDetailsScroll: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  barberInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  detailBarberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  barberInfo: {
    flex: 1,
  },
  detailBarberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailSalonName: {
    fontSize: 16,
    color: '#666',
  },
  detailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceDetailCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceDetailName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  serviceDetailPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  appointmentDetailCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  appointmentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentDetailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },

  // New Receipt Modal Styles
  receiptHeaderSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  receiptSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
  },
  barberInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    gap: 16,
  },
  barberSpecialty: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  contactButton: {
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serviceText: {
    flex: 1,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentText: {
    flex: 1,
  },
  appointmentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  locationText: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  locationCity: {
    fontSize: 14,
    color: '#666',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inspirationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  mediaUploadSection: {
    alignItems: 'center',
  },
  inspirationScroll: {
    maxHeight: 120,
    marginBottom: 16,
  },
  inspirationPhotoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  inspirationPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    gap: 8,
  },
  addPhotoText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  editInstructionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  editInstructionsText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  supportCard: {
    flexDirection: 'row',
    gap: 12,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 8,
  },
  supportButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Message button styles for navigating to chat
  messageButton: {
    backgroundColor: '#E0F7FA',
    borderColor: '#B2EBF2',
    minWidth: 140,
  },
  messageButtonText: {
    color: '#007AFF',
  },
});

export default MyBookingsScreen;
