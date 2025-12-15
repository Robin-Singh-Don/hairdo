import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { CustomerReview } from '../../services/mock/AppMockData';

export default function CustomerReviewsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // API state
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reply modal state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Load reviews from API
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reviewsData = await ownerAPI.getCustomerReviews();
      setReviews(reviewsData);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      setError(error?.message || 'Failed to load reviews. Please try again.');
      Alert.alert('Error', error?.message || 'Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [loadReviews])
  );

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    // Handle relative dates like "2 hours ago", "1 day ago"
    if (dateString.includes('ago')) {
      return dateString; // Keep as is for now
    }
    // Handle ISO date strings
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Filter and search reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews;
    
    // Filter by rating/status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(review => {
        if (selectedFilter === '5-star') return review.rating === 5;
        if (selectedFilter === '4-star') return review.rating === 4;
        if (selectedFilter === '3-star') return review.rating === 3;
        if (selectedFilter === '2-star') return review.rating === 2;
        if (selectedFilter === '1-star') return review.rating === 1;
        if (selectedFilter === 'verified') return review.verified;
        return true;
      });
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.customerName.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query) ||
        review.service.toLowerCase().includes(query) ||
        review.staff.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      // Simple sort - newest reviews first (if we had proper dates)
      // For now, maintain order from API
      return 0;
    });
  }, [reviews, selectedFilter, searchQuery]);

  // Calculate metrics
  const getAverageRating = () => {
    if (reviews.length === 0) return '0.0';
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const distribution = useMemo(() => getRatingDistribution(), [reviews]);

  // Handle reply functionality
  const handleReply = (review: CustomerReview) => {
    setSelectedReview(review);
    setReplyText(review.ownerReply || '');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedReview) return;
    
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply message');
      return;
    }

    try {
      setIsSubmittingReply(true);
      const success = await ownerAPI.replyToReview(selectedReview.id, replyText.trim());
      
      if (success) {
        // Update local state
        setReviews(prevReviews => 
          prevReviews.map(r => 
            r.id === selectedReview.id 
              ? { ...r, ownerReply: replyText.trim(), ownerReplyDate: new Date().toISOString() }
              : r
          )
        );
        Alert.alert('Success', 'Reply posted successfully');
        setShowReplyModal(false);
        setReplyText('');
        setSelectedReview(null);
      } else {
        Alert.alert('Error', 'Failed to post reply. Please try again.');
      }
    } catch (error: any) {
      console.error('Error submitting reply:', error);
      Alert.alert('Error', error?.message || 'Failed to post reply. Please try again.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#FFD700" : "#E0E0E0"}
        />
      );
    }
    return stars;
  };

  const renderReviewCard = (review: CustomerReview) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.customerAvatarContainer}>
            <Text style={styles.customerAvatar}>{getInitials(review.customerName)}</Text>
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{review.customerName}</Text>
            <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
          </View>
        </View>
        {review.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.ratingSection}>
        <View style={styles.starsContainer}>
          {renderStars(review.rating)}
        </View>
        <Text style={styles.ratingText}>{review.rating}.0</Text>
      </View>

      <Text style={styles.reviewComment}>{review.comment}</Text>

      {/* Owner Reply Section */}
      {review.ownerReply && (
        <View style={styles.replySection}>
          <View style={styles.replyHeader}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#2196F3" />
            <Text style={styles.replyLabel}>Your Reply</Text>
            {review.ownerReplyDate && (
              <Text style={styles.replyDate}>{formatDate(review.ownerReplyDate)}</Text>
            )}
          </View>
          <Text style={styles.replyText}>{review.ownerReply}</Text>
        </View>
      )}

      <View style={styles.reviewFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="cut" size={16} color="#666" />
          <Text style={styles.footerText}>{review.service}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.footerText}>{review.staff}</Text>
        </View>
        <TouchableOpacity 
          style={styles.replyButton}
          onPress={() => handleReply(review)}
        >
          <Ionicons 
            name={review.ownerReply ? "create-outline" : "chatbubble-outline"} 
            size={16} 
            color="#2196F3" 
          />
          <Text style={styles.replyButtonText}>
            {review.ownerReply ? 'Edit Reply' : 'Reply'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButton = (filterId: string, label: string, count: number) => (
    <TouchableOpacity
      key={filterId}
      style={[styles.filterButton, selectedFilter === filterId && styles.activeFilter]}
      onPress={() => setSelectedFilter(filterId)}
    >
      <Text style={[styles.filterText, selectedFilter === filterId && styles.activeFilterText]}>
        {label}
      </Text>
      <View style={[styles.filterBadge, selectedFilter === filterId && styles.activeFilterBadge]}>
        <Text style={[styles.filterBadgeText, selectedFilter === filterId && styles.activeFilterBadgeText]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRatingBar = (rating: number, count: number, total: number) => (
    <View key={rating} style={styles.ratingBarContainer}>
      <Text style={styles.ratingLabel}>{rating}</Text>
      <Ionicons name="star" size={16} color="#FFD700" />
      <View style={styles.ratingBar}>
        <View style={[styles.ratingBarFill, { width: `${(count / total) * 100}%` }]} />
      </View>
      <Text style={styles.ratingCount}>{count}</Text>
    </View>
  );

  // Error state
  if (error && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Customer Reviews</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReviews}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Customer Reviews</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Customer Reviews</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Rating Overview */}
        {reviews.length > 0 && (
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Overall Rating</Text>
            <View style={styles.overviewCard}>
              <View style={styles.ratingSummary}>
                <Text style={styles.averageRating}>{getAverageRating()}</Text>
                <View style={styles.starsContainer}>
                  {renderStars(Math.round(parseFloat(getAverageRating())))}
                </View>
                <Text style={styles.totalReviews}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.ratingDistribution}>
                {Object.entries(distribution).reverse().map(([rating, count]) => 
                  renderRatingBar(parseInt(rating), count, reviews.length)
                )}
              </View>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reviews..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        {reviews.length > 0 && (
          <View style={styles.filtersSection}>
            <Text style={styles.sectionTitle}>Filter Reviews</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScrollContainer}>
              <View style={styles.filtersContainer}>
                {renderFilterButton('all', 'All', reviews.length)}
                {renderFilterButton('5-star', '5 Stars', distribution[5])}
                {renderFilterButton('4-star', '4 Stars', distribution[4])}
                {renderFilterButton('3-star', '3 Stars', distribution[3])}
                {renderFilterButton('2-star', '2 Stars', distribution[2])}
                {renderFilterButton('1-star', '1 Star', distribution[1])}
                {renderFilterButton('verified', 'Verified', reviews.filter(r => r.verified).length)}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'all' ? 'All Reviews' : 
             selectedFilter === 'verified' ? 'Verified Reviews' :
             `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Reviews`}
          </Text>
          {filteredReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No reviews found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try a different search term' : 
                 selectedFilter !== 'all' ? 'Try selecting a different filter' :
                 'No reviews available yet'}
              </Text>
            </View>
          ) : (
            filteredReviews.map(renderReviewCard)
          )}
        </View>
      </ScrollView>

      {/* Reply Modal */}
      <Modal
        visible={showReplyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedReview?.ownerReply ? 'Edit Reply' : 'Reply to Review'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedReview(null);
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedReview && (
              <>
                <View style={styles.reviewPreview}>
                  <Text style={styles.reviewPreviewName}>{selectedReview.customerName}</Text>
                  <Text style={styles.reviewPreviewComment} numberOfLines={2}>
                    {selectedReview.comment}
                  </Text>
                </View>

                <View style={styles.replyInputContainer}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write your reply..."
                    placeholderTextColor="#999"
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowReplyModal(false);
                      setReplyText('');
                      setSelectedReview(null);
                    }}
                    disabled={isSubmittingReply}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton, isSubmittingReply && styles.submitButtonDisabled]}
                    onPress={handleSubmitReply}
                    disabled={isSubmittingReply || !replyText.trim()}
                  >
                    {isSubmittingReply ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Post Reply</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  overviewSection: {
    marginBottom: 24,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingSummary: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },
  ratingDistribution: {
    gap: 8,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 20,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    width: 30,
    textAlign: 'right',
  },
  filtersSection: {
    marginBottom: 24,
  },
  filtersScrollContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilter: {
    backgroundColor: '#333',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginRight: 6,
  },
  activeFilterText: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: '#fff',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterBadgeText: {
    color: '#000',
  },
  reviewsSection: {
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerAvatar: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  replySection: {
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 6,
    flex: 1,
  },
  replyDate: {
    fontSize: 11,
    color: '#666',
  },
  replyText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
    marginLeft: 8,
  },
  replyButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  reviewPreview: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  reviewPreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reviewPreviewComment: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  replyInputContainer: {
    marginBottom: 20,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    backgroundColor: '#FAFAFA',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  submitButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
