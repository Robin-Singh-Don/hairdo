import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, ListRenderItem, Modal, ScrollView, Dimensions, Alert } from 'react-native';
import BottomBar from '../../components/BottomBar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock data for available services and time slots
const availableServices = [
  { id: '1', name: 'Haircut & Styling', duration: '45 min' },
  { id: '2', name: 'Beard Trim', duration: '20 min' },
  { id: '3', name: 'Hair Color', duration: '90 min' },
  { id: '4', name: 'Hair Treatment', duration: '60 min' },
  { id: '5', name: 'Shampoo & Blow Dry', duration: '30 min' },
  { id: '6', name: 'Kids Haircut', duration: '30 min' },
  { id: '7', name: 'Senior Haircut', duration: '40 min' },
  { id: '8', name: 'Emergency Haircut', duration: '25 min' }
];

const availableTimeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM'
];

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
  
  // Multi-step rebook functionality
  const [rebookModalVisible, setRebookModalVisible] = useState(false);
  const [selectedRebookBooking, setSelectedRebookBooking] = useState<Booking | null>(null);
  const [rebookStep, setRebookStep] = useState<'service' | 'time'>('service');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  const router = useRouter();

  const handleTabPress = useCallback((tabKey: 'upcoming' | 'history') => {
    setActiveTab(tabKey);
  }, []);

  const handleUpcomingBookingPress = useCallback((booking: UpcomingBooking) => {
    setSelectedUpcomingBooking(booking);
    setUpcomingDetailsModalVisible(true);
  }, []);

  const handleBookingPress = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setReceiptModalVisible(true);
  }, []);

  const handleReceiptClose = useCallback(() => {
    setReceiptModalVisible(false);
    setSelectedBooking(null);
  }, []);

  const handleCancel = useCallback((booking: Booking) => {
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
    setSelectedRebookBooking(booking);
    setRebookModalVisible(true);
    setRebookStep('service');
    setSelectedServices([]);
    setSelectedTimeSlot('');
  }, []);

  const handleServiceSelection = useCallback((serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  }, []);

  const handleServiceDone = useCallback(() => {
    if (selectedServices.length > 0) {
      setRebookStep('time');
    }
  }, [selectedServices]);

  const handleTimeSlotSelection = useCallback((timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  }, []);

  const handleBookAppointment = useCallback(() => {
    if (selectedTimeSlot && selectedServices.length > 0) {
      const params = {
        services: JSON.stringify(selectedServices),
        timeSlot: selectedTimeSlot,
        fromRebook: 'true',
        previousBooking: JSON.stringify(selectedRebookBooking)
      };
      router.push({
        pathname: '/booking-confirmation',
        params
      });
      setRebookModalVisible(false);
      setSelectedRebookBooking(null);
      setRebookStep('service');
      setSelectedServices([]);
      setSelectedTimeSlot('');
    }
  }, [selectedTimeSlot, selectedServices, selectedRebookBooking, router]);

  const handleRebookClose = useCallback(() => {
    setRebookModalVisible(false);
    setSelectedRebookBooking(null);
    setRebookStep('service');
    setSelectedServices([]);
    setSelectedTimeSlot('');
  }, []);

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
          onPress={() => {
            handleMessage(item);
          }}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#007AFF" />
          <Text style={[styles.actionButtonText, styles.messageButtonText]}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => {
            handleCancel(item);
          }}
        >
          <Ionicons name="close-outline" size={16} color="#FF3B30" />
          <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [handleMessage, handleCancel, handleUpcomingBookingPress]);

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
            <Ionicons name="star" size={16} color="#FFD700" />
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
        <View style={styles.receiptOverlay}>
          <View style={styles.receiptModal}>
            {/* Receipt Header */}
            <View style={styles.receiptHeader}>
              <View style={styles.receiptHeaderTop}>
                <View style={styles.receiptLogo}>
                  <Ionicons name="cut" size={20} color="#FF6B00" />
                  <Text style={styles.receiptLogoText}>HairDo</Text>
                </View>
                <TouchableOpacity
                  style={styles.receiptCloseButton}
                  onPress={handleReceiptClose}
                >
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.receiptTitle}>Booking Receipt</Text>
              <Text style={styles.receiptHeaderSubtitle}>Thank you for choosing HairDo</Text>
            </View>

            {/* Receipt Content */}
            <ScrollView style={styles.receiptContent} showsVerticalScrollIndicator={false}>
              {/* Booking Details */}
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Booking Details</Text>
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Booking ID:</Text>
                  <Text style={styles.receiptDetailValue}>#{selectedBooking?.id || '12345'}</Text>
                </View>
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Status:</Text>
                  <Text style={styles.receiptDetailValue}>{selectedBooking?.status || 'Completed'}</Text>
                </View>
              </View>

              {/* Appointment Info */}
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Appointment</Text>
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Barber:</Text>
                  <Text style={styles.receiptDetailValue}>{selectedBooking?.barber || 'Your Barber'}</Text>
                </View>
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Salon:</Text>
                  <Text style={styles.receiptDetailValue}>{selectedBooking?.salon || 'Salon'}</Text>
                </View>
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Date:</Text>
                  <Text style={styles.receiptDetailValue}>{selectedBooking?.date || 'March 1'}</Text>
                </View>
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Time:</Text>
                  <Text style={styles.receiptDetailValue}>{selectedBooking?.time || '2:00 PM'}</Text>
                </View>
              </View>

              {/* Services */}
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Services</Text>
                <View style={styles.receiptServiceRow}>
                  <View style={styles.receiptServiceInfo}>
                    <Text style={styles.receiptServiceName}>{selectedBooking?.service || 'Haircut'}</Text>
                    <Text style={styles.receiptServiceDuration}>Professional styling service</Text>
                  </View>
                  <Text style={styles.receiptServicePrice}>{selectedBooking?.price || '$35'}</Text>
                </View>
              </View>

              {/* Price Breakdown */}
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Price Breakdown</Text>
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Service Cost:</Text>
                  <Text style={styles.receiptDetailValue}>{selectedBooking?.price || '$35'}</Text>
                </View>
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Tax (8%):</Text>
                  <Text style={styles.receiptDetailValue}>$2.80</Text>
                </View>
                <View style={styles.receiptDivider} />
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptTotalLabel}>Total:</Text>
                  <Text style={styles.receiptTotalValue}>$37.80</Text>
                </View>
              </View>

              {/* Important Info */}
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Important Information</Text>
                <Text style={styles.receiptTerms}>
                  Please arrive 10 minutes before your appointment. Cancellations must be made 24 hours in advance. 
                  Contact the salon directly for any changes or questions.
                </Text>
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Contact:</Text>
                  <Text style={styles.receiptDetailValue}>+1 (555) 123-4567</Text>
                </View>
              </View>
            </ScrollView>

            {/* Receipt Actions */}
            <View style={styles.receiptActions}>
              <TouchableOpacity
                style={styles.receiptActionButton}
                onPress={() => {
                  Alert.alert('Share Receipt', 'Receipt sharing feature will be implemented here.');
                }}
              >
                <Ionicons name="share-outline" size={16} color="#666" />
                <Text style={styles.receiptActionText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.receiptActionButton}
                onPress={() => {
                  Alert.alert('Save Receipt', 'Receipt will be saved to your device.');
                }}
              >
                <Ionicons name="download-outline" size={16} color="#666" />
                <Text style={styles.receiptActionText}>Save</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.receiptActionButton}
                onPress={() => {
                  Alert.alert('Print Receipt', 'Receipt printing feature will be implemented here.');
                }}
              >
                <Ionicons name="print-outline" size={16} color="#666" />
                <Text style={styles.receiptActionText}>Print</Text>
              </TouchableOpacity>
            </View>

            {/* Main Action Button */}
            <View style={styles.receiptMainAction}>
              <TouchableOpacity
                style={styles.receiptDoneButton}
                onPress={handleReceiptClose}
              >
                <Text style={styles.receiptDoneButtonText}>View My Bookings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Multi-Step Rebook Modal */}
      <Modal
        visible={rebookModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleRebookClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rebookModalCard}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeIconButton}
              onPress={handleRebookClose}
            >
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>

            {/* Step 1: Service Selection */}
            {rebookStep === 'service' && (
              <View style={styles.rebookStepContainer}>
                <Text style={styles.rebookStepTitle}>Select Services</Text>
                <Text style={styles.rebookStepSubtitle}>Choose which services you'd like to book this time</Text>
                
                <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
                  {availableServices.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceOption,
                        selectedServices.includes(service.id) && styles.serviceOptionSelected
                      ]}
                      onPress={() => handleServiceSelection(service.id)}
                    >
                      <View style={styles.serviceOptionContent}>
                        <View style={styles.serviceOptionInfo}>
                          <Text style={[
                            styles.serviceOptionText,
                            selectedServices.includes(service.id) && styles.serviceOptionTextSelected
                          ]}>
                            {service.name}
                          </Text>
                          <Text style={styles.serviceOptionDuration}>{service.duration}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.serviceOptionCheckbox,
                        selectedServices.includes(service.id) && styles.serviceOptionCheckboxSelected
                      ]}>
                        {selectedServices.includes(service.id) && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={[
                    styles.rebookActionButton,
                    selectedServices.length === 0 && styles.rebookActionButtonDisabled
                  ]}
                  onPress={handleServiceDone}
                  disabled={selectedServices.length === 0}
                >
                  <Text style={styles.rebookActionButtonText}>
                    Done ({selectedServices.length} selected)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Time Slot Selection */}
            {rebookStep === 'time' && (
              <View style={styles.rebookStepContainer}>
                <Text style={styles.rebookStepTitle}>Select Time Slot</Text>
                <Text style={styles.rebookStepSubtitle}>Choose your preferred appointment time</Text>
                
                <ScrollView style={styles.timeSlotsList} showsVerticalScrollIndicator={false}>
                  {availableTimeSlots.map((timeSlot) => (
                    <TouchableOpacity
                      key={timeSlot}
                      style={[
                        styles.timeSlotOption,
                        selectedTimeSlot === timeSlot && styles.timeSlotOptionSelected
                      ]}
                      onPress={() => handleTimeSlotSelection(timeSlot)}
                    >
                      <View style={styles.timeSlotContent}>
                        <Ionicons 
                          name="time-outline" 
                          size={20} 
                          color={selectedTimeSlot === timeSlot ? "#fff" : "#007AFF"} 
                        />
                        <Text style={[
                          styles.timeSlotText,
                          selectedTimeSlot === timeSlot && styles.timeSlotTextSelected
                        ]}>
                          {timeSlot}
                        </Text>
                      </View>
                      {selectedTimeSlot === timeSlot && (
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.rebookActionRow}>
                  <TouchableOpacity
                    style={styles.rebookBackButton}
                    onPress={() => setRebookStep('service')}
                  >
                    <Text style={styles.rebookBackButtonText}>Back</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.rebookActionButton,
                      !selectedTimeSlot && styles.rebookActionButtonDisabled
                    ]}
                    onPress={handleBookAppointment}
                    disabled={!selectedTimeSlot}
                  >
                    <Text style={styles.rebookActionButtonText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
            <TouchableOpacity 
              style={styles.photoCloseButton}
              onPress={handleClosePhotoModal}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            {selectedMediaItems.length > 1 && (
              <>
                <TouchableOpacity 
                  style={[styles.navButton, styles.prevButton]}
                  onPress={() => setCurrentMediaIndex(prev => 
                    prev > 0 ? prev - 1 : selectedMediaItems.length - 1
                  )}
                >
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.navButton, styles.nextButton]}
                  onPress={() => setCurrentMediaIndex(prev => 
                    prev < selectedMediaItems.length - 1 ? prev + 1 : 0
                  )}
                >
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            )}
            
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
            <TouchableOpacity 
              style={styles.closeIconButton}
              onPress={() => setUpcomingDetailsModalVisible(false)}
            >
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
            
            {selectedUpcomingBooking && (
              <ScrollView style={styles.bookingDetailsScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.receiptHeaderSection}>
                  <View style={styles.logoContainer}>
                    <Ionicons name="cut" size={32} color="#007AFF" />
                  </View>
                  <Text style={styles.companyName}>HairDo</Text>
                  <Text style={styles.receiptHeaderSubtitle}>Upcoming Appointment</Text>
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

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Your Barber & Salon</Text>
                  <View style={styles.barberInfoCard}>
                    <Image source={{ uri: selectedUpcomingBooking.profileImage }} style={styles.detailBarberImage} />
                    <View style={styles.barberInfo}>
                      <Text style={styles.detailBarberName}>{selectedUpcomingBooking.barber}</Text>
                      <Text style={styles.detailSalonName}>{selectedUpcomingBooking.salon}</Text>
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
                        <Text style={styles.serviceDetailName}>{selectedUpcomingBooking.service}</Text>
                        <Text style={styles.serviceDescription}>Professional styling service</Text>
                      </View>
                    </View>
                    <Text style={styles.serviceDetailPrice}>{selectedUpcomingBooking.price}</Text>
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
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyBookingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  tabBarContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabRow: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
  },
  tabLabelWrapper: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabUnderlineContainer: {
    marginTop: 8,
    height: 2,
  },
  tabUnderline: {
    height: 2,
    backgroundColor: '#007AFF',
    borderRadius: 1,
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  barberImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  salonName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  barberName: {
    fontSize: 14,
    color: '#666',
  },
  bookingStatus: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
    marginLeft: 4,
  },
  messageButton: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  messageButtonText: {
    color: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FF3B30',
  },
  photoButton: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  photoButtonText: {
    color: '#007AFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  bookNowButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  cancelDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  dangerButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  closeIconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  photoModalContent: {
    flex: 1,
    position: 'relative',
  },
  photoCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 1,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  mediaScrollView: {
    flex: 1,
  },
  mediaScrollContent: {
    alignItems: 'center',
  },
  mediaItemContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullSizePhoto: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  mediaDescription: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  bookingDetailsScroll: {
    flex: 1,
  },
  receiptHeaderSection: {
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
  receiptSubtitleDeprecated: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  barberInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  detailBarberImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  barberInfo: {
    flex: 1,
  },
  detailBarberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  detailSalonName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  barberSpecialty: {
    fontSize: 12,
    color: '#999',
  },
  serviceDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceText: {
    marginLeft: 12,
  },
  serviceDetailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
  serviceDetailPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  appointmentDetailCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  appointmentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appointmentText: {
    flex: 1,
  },
  appointmentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  appointmentDetailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  
  // Receipt Modal Styles
  receiptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  receiptModal: {
    backgroundColor: '#fffdfa',
    borderRadius: 12,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  receiptHeader: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,76,72,0.15)',
  },
  receiptHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  receiptLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptLogoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d72638',
    marginLeft: 6,
  },
  receiptCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(60,76,72,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 2,
  },
  receiptHeaderSubtitle: {
    fontSize: 12,
    color: '#3c4c48',
    textAlign: 'center',
  },
  receiptContent: {
    padding: 12,
    maxHeight: 350,
  },
  receiptSection: {
    marginBottom: 14,
  },
  receiptSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,76,72,0.15)',
    paddingBottom: 4,
  },
  receiptDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  receiptDetailLabel: {
    fontSize: 12,
    color: '#3c4c48',
    flex: 1,
  },
  receiptDetailValue: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    textAlign: 'right',
  },
  receiptServiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 3,
  },
  receiptServiceInfo: {
    flex: 1,
  },
  receiptServiceName: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    marginBottom: 1,
  },
  receiptServiceDuration: {
    fontSize: 10,
    color: '#3c4c48',
  },
  receiptServicePrice: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: 'rgba(60,76,72,0.15)',
    marginVertical: 6,
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  receiptTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d72638',
  },
  receiptTerms: {
    fontSize: 10,
    color: '#3c4c48',
    lineHeight: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  receiptActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(60,76,72,0.15)',
    backgroundColor: '#fff',
  },
  receiptActionButton: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#fffdfa',
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.15)',
  },
  receiptActionText: {
    fontSize: 10,
    color: '#3c4c48',
    marginTop: 2,
    fontWeight: '500',
  },
  receiptMainAction: {
    padding: 12,
    backgroundColor: '#fffdfa',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  receiptDoneButton: {
    backgroundColor: '#d72638',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  receiptDoneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Rebook Modal Styles
  rebookModalCard: {
    marginTop: 50,
    width: '100%',
    height: Dimensions.get('window').height * 0.7,
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
  rebookStepContainer: {
    flex: 1,
    paddingTop: 20,
  },
  rebookStepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  rebookStepSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  servicesList: {
    flex: 1,
    marginBottom: 24,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  serviceOptionSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  serviceOptionContent: {
    flex: 1,
  },
  serviceOptionInfo: {
    flex: 1,
  },
  serviceOptionText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceOptionTextSelected: {
    color: '#fff',
  },
  serviceOptionDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  serviceOptionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  serviceOptionCheckboxSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  timeSlotsList: {
    flex: 1,
    marginBottom: 24,
  },
  timeSlotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  timeSlotOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeSlotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeSlotText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginLeft: 12,
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  rebookActionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  rebookBackButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rebookBackButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  rebookActionButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 20,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rebookActionButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
  rebookActionButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
