import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Image,
  TouchableWithoutFeedback,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { customerAPI } from '../../services/api/customerAPI';
import { ProfileReview } from '../../services/mock/AppMockData';

export default function SalonReviewsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const salonId = params.salonId as string || 'salon-1';
  const salonName = params.salonName as string || "Man's Cave Salon";
  const salonImage = params.salonImage as string | undefined;

  // State
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  
  // Menu popup state
  const [showMenuForReview, setShowMenuForReview] = useState<string | null>(null);
  const [menuReview, setMenuReview] = useState<ProfileReview | null>(null);
  
  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Load reviews
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reviewsData = await customerAPI.getProfileReviews(salonId, 'salon');
      setReviews(reviewsData);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      setError(error?.message || 'Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    // Get current customer ID first
    const loadUser = async () => {
      try {
        const user = await customerAPI.getCurrentUser();
        setCurrentCustomerId(user.id);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    loadUser();
    loadReviews();
  }, [loadReviews]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reload customer ID and reviews
      customerAPI.getCurrentUser().then(user => {
        setCurrentCustomerId(user.id);
      }).catch(error => {
        console.error('Error loading current user:', error);
      });
      loadReviews();
    }, [loadReviews])
  );

  // Handle submit review (for both new and edit)
  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Required', 'Please write your review');
      return;
    }

    try {
      setSubmittingReview(true);
      
      if (editingReviewId) {
        // Update existing review
        const updatedReview = await customerAPI.updateProfileReview(editingReviewId, reviewRating, reviewText.trim());
        setReviews(reviews.map(r => r.id === editingReviewId ? updatedReview : r));
        setEditingReviewId(null);
        Alert.alert('Success', 'Review updated successfully!');
      } else {
        // Create new review
        const newReview = await customerAPI.addProfileReview(salonId, 'salon', reviewRating, reviewText.trim());
        setReviews([newReview, ...reviews]);
        Alert.alert('Success', 'Review submitted successfully!');
      }
      
      setShowReviewModal(false);
      setReviewText('');
      setReviewRating(5);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle like review
  const handleLikeReview = async (reviewId: string) => {
    try {
      await customerAPI.likeProfileReview(reviewId);
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
      ));
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  // Handle menu button press
  const handleMenuPress = (reviewId: string, event: any) => {
    // Close any other open menu
    setShowMenuForReview(reviewId);
    
    // Get button position
    event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setMenuPosition({ x: pageX, y: pageY + height });
    });
  };

  // Handle edit review
  const handleEditReview = (review: ProfileReview) => {
    console.log('Edit review clicked for:', review.id);
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewText(review.comment);
    setShowMenuForReview(null);
    setShowReviewModal(true);
  };

  // Handle delete review
  const handleDeleteReview = (reviewId: string) => {
    console.log('Delete button pressed for reviewId:', reviewId);
    
    // Close menu first
    setShowMenuForReview(null);
    setMenuReview(null);
    
    // Show custom confirmation modal instead of Alert
    setReviewToDelete(reviewId);
    setShowDeleteConfirm(true);
  };
  
  // Confirm deletion
  const confirmDelete = () => {
    if (reviewToDelete) {
      console.log('Delete confirmed by user, proceeding with deletion...');
      setShowDeleteConfirm(false);
      performDelete(reviewToDelete);
      setReviewToDelete(null);
    }
  };
  
  // Cancel deletion
  const cancelDelete = () => {
    console.log('Delete cancelled by user');
    setShowDeleteConfirm(false);
    setReviewToDelete(null);
  };

  // Perform the actual deletion
  const performDelete = async (reviewId: string) => {
    console.log('performDelete called with reviewId:', reviewId);
    console.log('Current customerId:', currentCustomerId);
    console.log('SalonId:', salonId);
    
    try {
      // Get current reviews to verify ownership
      const currentReviews = [...reviews];
      const review = currentReviews.find(r => r.id === reviewId);
      
      if (!review) {
        console.log('Review not found in current reviews');
        Alert.alert('Error', 'Review not found');
        return;
      }
      
      console.log('Review found:', review);
      console.log('Review customerId:', review.customerId);
      
      if (!currentCustomerId || review.customerId !== currentCustomerId) {
        console.log('Review does not belong to current customer');
        Alert.alert('Error', 'You can only delete your own reviews.');
        return;
      }
      
      // Call API to delete
      console.log('Calling deleteProfileReview API...');
      const success = await customerAPI.deleteProfileReview(reviewId);
      console.log('API delete result:', success);
      
      if (!success) {
        console.log('API delete failed');
        Alert.alert('Error', 'Failed to delete review. Please try again.');
        return;
      }
      
      // Success - immediately update UI by filtering out the deleted review
      console.log('Delete successful, updating UI...');
      setReviews(currentReviews.filter(r => r.id !== reviewId));
      setRefreshKey(prev => prev + 1);
      
      // Reload from API to ensure consistency
      console.log('Reloading reviews from API for consistency...');
      const reloadedReviews = await customerAPI.getProfileReviews(salonId, 'salon');
      console.log('Reloaded reviews count:', reloadedReviews.length);
      console.log('Reloaded review IDs:', reloadedReviews.map(r => r.id));
      setReviews(reloadedReviews);
      setRefreshKey(prev => prev + 1);
      
      // Show success message
      Alert.alert('Success', 'Your review has been deleted successfully.');
      
    } catch (error: any) {
      console.error('Error during deletion:', error);
      Alert.alert('Error', error?.message || 'Failed to delete review. Please try again.');
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Calculate average rating
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  // Render review card
  const renderReviewCard = (review: ProfileReview) => {
    const isOwnReview = currentCustomerId && review.customerId === currentCustomerId;
    
    return (
      <View key={review.id} style={styles.reviewCard}>
        <View style={styles.reviewCardHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.reviewerAvatar}>
              <Text style={styles.reviewerInitials}>{getInitials(review.customerName)}</Text>
            </View>
            <View style={styles.reviewerDetails}>
              <Text style={styles.reviewerName}>{review.customerName}</Text>
              <View style={styles.reviewRatingContainer}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <Ionicons
                    key={rating}
                    name={rating <= review.rating ? "star" : "star-outline"}
                    size={14}
                    color={rating <= review.rating ? "#FFD700" : "#E0E0E0"}
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.reviewHeaderRight}>
            {review.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
            {isOwnReview && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  if (showMenuForReview === review.id) {
                    setShowMenuForReview(null);
                    setMenuReview(null);
                  } else {
                    setShowMenuForReview(review.id);
                    setMenuReview(review);
                  }
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
        <Text style={styles.reviewComment}>{review.comment}</Text>
        <TouchableOpacity 
          style={styles.helpfulButton}
          onPress={() => handleLikeReview(review.id)}
        >
          <Ionicons name="thumbs-up-outline" size={14} color="#666" />
          <Text style={styles.helpfulText}>Helpful ({review.helpful || 0})</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reviews</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reviews</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorTitle}>Error Loading Reviews</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReviews}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Salon Info */}
        <View style={styles.salonInfo}>
          {salonImage && (
            <Image source={{ uri: salonImage }} style={styles.salonImage} />
          )}
          <View style={styles.salonDetails}>
            <Text style={styles.salonName}>{salonName}</Text>
            <View style={styles.ratingSummary}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <Ionicons
                    key={rating}
                    name={rating <= parseFloat(getAverageRating()) ? "star" : "star-outline"}
                    size={20}
                    color={rating <= parseFloat(getAverageRating()) ? "#FFD700" : "#E0E0E0"}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{getAverageRating()}</Text>
              <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Write Review Button */}
        <TouchableOpacity 
          style={styles.writeReviewButton}
          onPress={() => {
            setEditingReviewId(null);
            setReviewRating(5);
            setReviewText('');
            setShowReviewModal(true);
          }}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.writeReviewButtonText}>Write a Review</Text>
        </TouchableOpacity>

        {/* Reviews List */}
        <View style={styles.reviewsList} key={`reviews-${reviews.length}-${refreshKey}`}>
          {reviews.length > 0 ? (
            reviews.map((review) => renderReviewCard(review))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Reviews Yet</Text>
              <Text style={styles.emptyStateText}>Be the first to review this salon!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Menu Modal - Close menu when tapping outside */}
      <Modal
        visible={!!showMenuForReview}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowMenuForReview(null);
          setMenuReview(null);
        }}
      >
        <Pressable 
          style={styles.menuOverlay}
          onPress={() => {
            setShowMenuForReview(null);
            setMenuReview(null);
          }}
        >
          {menuReview && (
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.menuBoxWrapper}>
              <View style={styles.menuBox}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    console.log('Edit menu item pressed for review:', menuReview.id);
                    handleEditReview(menuReview);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={20} color="#2196F3" />
                  <Text style={styles.menuItemText}>Edit</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    console.log('Delete menu item pressed for review:', menuReview.id);
                    handleDeleteReview(menuReview.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.menuItemText, styles.menuItemDelete]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          )}
        </Pressable>
      </Modal>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModalContent}>
            <View style={styles.reviewModalHeader}>
              <Text style={styles.reviewModalTitle}>
                {editingReviewId ? 'Edit Review' : 'Write a Review'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowReviewModal(false);
                setEditingReviewId(null);
                setReviewText('');
                setReviewRating(5);
              }}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.reviewModalBody}>
              <View style={styles.salonInfoModal}>
                {salonImage && (
                  <Image source={{ uri: salonImage }} style={styles.salonImageModal} />
                )}
                <Text style={styles.salonNameModal}>{salonName}</Text>
              </View>
              
              <Text style={styles.reviewModalLabel}>Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => setReviewRating(rating)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={rating <= reviewRating ? "star" : "star-outline"}
                      size={40}
                      color={rating <= reviewRating ? "#FFD700" : "#E0E0E0"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.reviewModalLabel}>Your Review</Text>
              <TextInput
                style={styles.reviewTextInput}
                placeholder="Share your experience..."
                placeholderTextColor="#999"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>{reviewText.length}/500</Text>
            </ScrollView>
            
            <View style={styles.reviewModalActions}>
              <TouchableOpacity
                style={[styles.reviewModalButton, styles.cancelReviewButton]}
                onPress={() => {
                  setShowReviewModal(false);
                  setEditingReviewId(null);
                  setReviewText('');
                  setReviewRating(5);
                }}
                disabled={submittingReview}
              >
                <Text style={styles.cancelReviewButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewModalButton, styles.submitReviewButton, submittingReview && styles.submitReviewButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={submittingReview || !reviewText.trim()}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitReviewButtonText}>
                    {editingReviewId ? 'Update' : 'Submit'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
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
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  salonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  salonImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  salonDetails: {
    flex: 1,
  },
  salonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  writeReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsList: {
    padding: 16,
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
  reviewHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 4,
  },
  menuPopup: {
    position: 'absolute',
    right: 0,
    top: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  menuItemDelete: {
    color: '#FF3B30',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelConfirmButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  deleteConfirmButton: {
    backgroundColor: '#FF3B30',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  menuBoxWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
  salonInfoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  salonImageModal: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  salonNameModal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
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

