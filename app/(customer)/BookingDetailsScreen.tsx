import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BookingDetails {
  id: string;
  salonName: string;
  salonImage: string;
  barberName: string;
  barberImage: string;
  service: string;
  date: string;
  time: string;
  location: string;
  price: string;
  duration: string;
  phone: string;
}

interface ServiceMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  duration?: string; // For videos
}

export default function BookingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [barberRating, setBarberRating] = useState(0);
  const [salonRating, setSalonRating] = useState(0);
  const [barberReview, setBarberReview] = useState('');
  const [salonReview, setSalonReview] = useState('');
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ServiceMedia | null>(null);

  // Mock media data - in real app, this would come from booking details
  const serviceMedia: ServiceMedia[] = [
    {
      id: '1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '2',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '3',
      type: 'video',
      url: 'https://example.com/video.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      duration: '0:45',
    },
  ];

  // Get booking details from params
  const bookingDetails: BookingDetails = {
    id: params.id as string || '1',
    salonName: params.salonName as string || "Man's Cave Salon",
    salonImage: params.salonImage as string || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop',
    barberName: params.barberName as string || 'Shark.11',
    barberImage: params.barberImage as string || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center',
    service: params.service as string || 'Haircut & Beard Trim',
    date: params.date as string || 'July 15, 2024',
    time: params.time as string || '9:30 AM',
    location: params.location as string || '9785, 132St, Vancouver',
    price: params.price as string || '$45.00',
    duration: params.duration as string || '45 min',
    phone: params.phone as string || '(555) 123-4567',
  };

  const renderStars = (rating: number, onPress: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onPress(star)}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? '#FFD700' : '#E0E0E0'}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmitReview = () => {
    if (barberRating === 0 && salonRating === 0) {
      Alert.alert('Please Rate', 'Please provide at least one rating before submitting.');
      return;
    }

    // TODO: Submit to backend
    console.log('Submitting reviews:', {
      barberRating,
      barberReview,
      salonRating,
      salonReview,
      bookingId: bookingDetails.id,
    });

    setShowSubmitSuccess(true);
    
    // Close success modal and navigate back after 2 seconds
    setTimeout(() => {
      setShowSubmitSuccess(false);
      router.back();
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Salon Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image source={{ uri: bookingDetails.salonImage }} style={styles.salonImage} />
            <View style={styles.salonInfo}>
              <Text style={styles.salonName}>{bookingDetails.salonName}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.locationText}>{bookingDetails.location}</Text>
              </View>
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.phoneText}>{bookingDetails.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Barber Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Barber / Stylist</Text>
          <View style={styles.barberInfo}>
            <Image source={{ uri: bookingDetails.barberImage }} style={styles.barberImage} />
            <Text style={styles.barberName}>{bookingDetails.barberName}</Text>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="cut-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{bookingDetails.service}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{bookingDetails.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{bookingDetails.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="timer-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{bookingDetails.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{bookingDetails.price}</Text>
          </View>
        </View>

        {/* Service Media Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Photos & Videos</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaContainer}
          >
            {serviceMedia.map((media) => (
              <TouchableOpacity
                key={media.id}
                style={styles.mediaItem}
                onPress={() => {
                  setSelectedMedia(media);
                  setShowMediaModal(true);
                }}
              >
                <Image 
                  source={{ uri: media.type === 'video' ? media.thumbnail : media.url }} 
                  style={styles.mediaImage} 
                />
                {media.type === 'video' && (
                  <View style={styles.playButtonOverlay}>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={24} color="#FFF" />
                    </View>
                    {media.duration && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{media.duration}</Text>
                      </View>
                    )}
                  </View>
                )}
                <View style={styles.mediaTypeBadge}>
                  <Text style={styles.mediaTypeText}>
                    {media.type === 'video' ? 'Video' : 'Photo'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Rating Section - Barber */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate Your Barber / Stylist</Text>
          {renderStars(barberRating, setBarberRating)}
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience with this barber..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={barberReview}
            onChangeText={setBarberReview}
          />
        </View>

        {/* Rating Section - Salon */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate The Salon</Text>
          {renderStars(salonRating, setSalonRating)}
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience with this salon..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={salonReview}
            onChangeText={setSalonReview}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSubmitSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Ionicons name="checkmark-circle" size={64} color="#03A100" />
            <Text style={styles.successTitle}>Review Submitted!</Text>
            <Text style={styles.successMessage}>Thank you for your feedback</Text>
          </View>
        </View>
      </Modal>

      {/* Media Viewer Modal */}
      <Modal visible={showMediaModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.mediaModal}>
            <TouchableOpacity 
              style={styles.closeMediaButton}
              onPress={() => setShowMediaModal(false)}
            >
              <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>
            {selectedMedia && (
              <>
                <Image 
                  source={{ uri: selectedMedia.type === 'video' ? selectedMedia.thumbnail : selectedMedia.url }} 
                  style={styles.fullMediaImage} 
                  resizeMode="contain"
                />
                {selectedMedia.type === 'video' && (
                  <View style={styles.videoPlayerInfo}>
                    <View style={styles.videoPlayButton}>
                      <Ionicons name="play-circle" size={64} color="#FFF" />
                    </View>
                    {selectedMedia.duration && (
                      <Text style={styles.videoDurationText}>{selectedMedia.duration}</Text>
                    )}
                  </View>
                )}
                <Text style={styles.mediaModalTypeText}>
                  {selectedMedia.type === 'video' ? 'Video' : 'Photo'}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  salonImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  star: {
    marginHorizontal: 4,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // Media section styles
  mediaContainer: {
    paddingRight: 8,
  },
  mediaItem: {
    marginRight: 12,
    position: 'relative',
  },
  mediaImage: {
    width: 200,
    height: 250,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  mediaTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mediaTypeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  // Media modal styles
  mediaModal: {
    width: '95%',
    height: '85%',
    backgroundColor: '#000',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  closeMediaButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  fullMediaImage: {
    width: '100%',
    height: '100%',
  },
  videoPlayerInfo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -32 }],
    alignItems: 'center',
  },
  videoPlayButton: {
    marginBottom: 8,
  },
  videoDurationText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mediaModalTypeText: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: [{ translateX: -30 }],
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
