import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import BottomBar from '../../components/BottomBar';
import PromotionBookingModal from '../../components/PromotionBookingModal';
import { ownerAPI } from '../../services/api/ownerAPI';
import { MarketingCampaign } from '../../services/mock/AppMockData';
import { customerAPI } from '../../services/api/customerAPI';

// Transform MarketingCampaign to promotion card format
const transformCampaignToPromotion = (campaign: MarketingCampaign): any => {
  // Get salon info (default for now - could be improved with actual salon lookup)
  const salonName = "Man's Cave Salon"; // TODO: Get from campaign or business data
  const salonImage = campaign.posterImage || campaign.photos[0] || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop&crop=center';
  const rating = '4.8';
  const distance = '0.5 km away';
  const deliveryTime = '15-20 min';
  
  // Format discount
  let discount = '';
  if (campaign.discount) {
    discount = `${campaign.discount}% OFF`;
  } else if (campaign.offerType === 'loyalty') {
    discount = 'DOUBLE POINTS';
  } else if (campaign.offerType === 'referral') {
    discount = 'REFERRAL BONUS';
  }
  
  // Generate code from campaign name
  const code = campaign.name.toUpperCase().replace(/\s+/g, '').substring(0, 10);
  
  // Determine if new (created within last 7 days)
  const createdAt = new Date(campaign.createdAt);
  const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const isNew = daysSinceCreation <= 7;
  
  // Determine if popular (high views/clicks)
  const isPopular = campaign.views > 1000 || campaign.clicks > 200;
  
  // Get category from offer type
  const categoryMap: Record<string, string> = {
    'discount': 'Special Offer',
    'loyalty': 'Loyalty',
    'referral': 'Referral'
  };
  const category = categoryMap[campaign.offerType] || 'Promotion';
  
  // Format end date
  const endDate = new Date(campaign.endDate);
  const validUntil = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return {
    id: campaign.id,
    salonName,
    salonImage,
    offerTitle: campaign.offerName || campaign.name,
    offerDescription: campaign.message,
    discount,
    validUntil,
    code,
    distance,
    rating,
    deliveryTime,
    isNew,
    isPopular,
    category,
    campaign // Keep original campaign data for modal
  };
};

// Mock promotions data (fallback)
const mockPromotions = [
  {
    id: '1',
    salonName: "Man's Cave Salon",
    salonImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop&crop=center',
    offerTitle: 'Summer Haircut Special',
    offerDescription: 'Get 20% off on all haircuts and beard trims',
    discount: '20% OFF',
    validUntil: 'Aug 31, 2024',
    code: 'SUMMER20',
    distance: '0.5 km away',
    rating: '4.8',
    deliveryTime: '15-20 min',
    isNew: true,
    isPopular: false,
    category: 'Haircut',
  },
  {
    id: '2',
    salonName: 'Elite Barbershop',
    salonImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop&crop=center',
    offerTitle: 'New Customer Discount',
    offerDescription: 'First visit free beard trim with any haircut',
    discount: 'FREE BEARD TRIM',
    validUntil: 'Sep 15, 2024',
    code: 'NEWCUSTOMER',
    distance: '1.2 km away',
    rating: '4.9',
    deliveryTime: '20-25 min',
    isNew: false,
    isPopular: true,
    category: 'Beard',
  },
  {
    id: '3',
    salonName: 'Classic Cuts',
    salonImage: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400&h=300&fit=crop&crop=center',
    offerTitle: 'Weekend Special',
    offerDescription: '30% off on all services every Saturday',
    discount: '30% OFF',
    validUntil: 'Dec 31, 2024',
    code: 'WEEKEND30',
    distance: '0.8 km away',
    rating: '4.7',
    deliveryTime: '10-15 min',
    isNew: false,
    isPopular: true,
    category: 'All Services',
  },
  {
    id: '4',
    salonName: 'Downtown Barbers',
    salonImage: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop&crop=center',
    offerTitle: 'Student Discount',
    offerDescription: '15% off for students with valid ID',
    discount: '15% OFF',
    validUntil: 'Oct 31, 2024',
    code: 'STUDENT15',
    distance: '1.5 km away',
    rating: '4.6',
    deliveryTime: '25-30 min',
    isNew: true,
    isPopular: false,
    category: 'Student',
  },
  {
    id: '5',
    salonName: 'Hair Masters',
    salonImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop&crop=center',
    offerTitle: 'Loyalty Program',
    offerDescription: 'Buy 5 haircuts, get 1 free',
    discount: 'BUY 5 GET 1 FREE',
    validUntil: 'Dec 31, 2024',
    code: 'LOYALTY',
    distance: '2.1 km away',
    rating: '4.9',
    deliveryTime: '30-35 min',
    isNew: false,
    isPopular: true,
    category: 'Loyalty',
  },
  {
    id: '6',
    salonName: 'Beard & Blade',
    salonImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop&crop=center',
    offerTitle: 'Beard Special',
    offerDescription: '50% off on all beard grooming services',
    discount: '50% OFF',
    validUntil: 'Sep 30, 2024',
    code: 'BEARD50',
    distance: '1.8 km away',
    rating: '4.8',
    deliveryTime: '15-20 min',
    isNew: true,
    isPopular: false,
    category: 'Beard',
  },
];

export default function PromotionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load promotions from API
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        setLoading(true);
        // Fetch active marketing campaigns from ownerAPI
        const campaigns = await ownerAPI.getActiveMarketingCampaigns();
        
        // Transform campaigns to promotion format
        const transformedPromotions = campaigns.map(transformCampaignToPromotion);
        
        setPromotions(transformedPromotions);
      } catch (error) {
        console.error('Error loading promotions:', error);
        // Fallback to mock data on error
        setPromotions(mockPromotions);
      } finally {
        setLoading(false);
      }
    };
    
    loadPromotions();
  }, []);

  // Handle reopening modal from booking confirmation
  useEffect(() => {
    if (params.reopenModal === 'true' && params.selectedPromotionId) {
      const promotion = promotions.find(p => p.id === params.selectedPromotionId);
      if (promotion) {
        setSelectedPromotion(promotion);
        setShowBookingModal(true);
      }
    }
  }, [params.reopenModal, params.selectedPromotionId, promotions]);

  const handleBookNow = (promotion: any) => {
    setSelectedPromotion(promotion);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedPromotion(null);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Promotions & Offers</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
          <View style={styles.contentWrapper}>
            <Text style={styles.sectionTitle}>Nearby Salon Offers</Text>
            <Text style={styles.sectionSubtitle}>Exclusive deals from salons in your area</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading promotions...</Text>
              </View>
            ) : promotions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="gift-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No active promotions</Text>
                <Text style={styles.emptySubtext}>Check back soon for new offers!</Text>
              </View>
            ) : (
              promotions.map((promotion) => (
              <TouchableOpacity key={promotion.id} style={styles.promotionCard}>
                {/* Main Image with Overlay */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: promotion.salonImage }} style={styles.salonImage} />
                  <View style={styles.imageOverlay}>
                    {/* Top Badges */}
                    <View style={styles.topBadges}>
                      {promotion.isNew && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                      )}
                      {promotion.isPopular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularBadgeText}>POPULAR</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Discount Badge */}
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{promotion.discount}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Content Section */}
                <View style={styles.promotionContent}>
                  <View style={styles.salonInfo}>
                    <Text style={styles.salonName}>{promotion.salonName}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{promotion.rating}</Text>
                      <Text style={styles.distanceText}>• {promotion.distance}</Text>
                      <Text style={styles.deliveryTime}>• {promotion.deliveryTime}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.offerSection}>
                    <Text style={styles.offerTitle}>{promotion.offerTitle}</Text>
                    <Text style={styles.offerDescription}>{promotion.offerDescription}</Text>
                    
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{promotion.category}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.promotionDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.detailText}>Valid until {promotion.validUntil}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="pricetag-outline" size={16} color="#666" />
                      <Text style={styles.detailText}>Code: {promotion.code}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.bookNowBtn}
                    onPress={() => handleBookNow(promotion)}
                  >
                    <Text style={styles.bookNowBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
        <BottomBar />
        
        {/* Promotion Booking Modal */}
        {selectedPromotion && (
        <PromotionBookingModal
          visible={showBookingModal}
          onClose={handleCloseModal}
          promotionData={selectedPromotion}
          initialStep={params.reopenModal === 'true' ? 'datetime' : 'barber'}
        />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  contentWrapper: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  promotionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  salonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  topBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  newBadge: {
    backgroundColor: '#00C851',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  popularBadge: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  discountBadge: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  promotionContent: {
    padding: 16,
  },
  salonInfo: {
    marginBottom: 12,
  },
  salonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  offerSection: {
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryTag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  promotionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  bookNowBtn: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 100,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  bookNowBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
}); 