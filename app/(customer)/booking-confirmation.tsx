import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelectedServices } from './appointment';
import { useRewards } from '../../sharedComponent/RewardsContext';
import { customerAPI } from '../../services/api/customerAPI';
import { PaymentMethod, AvailableReward, ServiceMapping, DefaultBooking, LoyaltyData } from '../../services/mock/AppMockData';
import { DEFAULT_POINTS_CONFIG } from '../../constants/PointsConfig';
import { TAX_RATE, calculateTotal, formatPrice, parsePrice } from '../../constants/BookingConstants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Payment methods are now loaded from API

// Helper function to get service details from API mappings
const getServiceDetails = (serviceKey: string, serviceMappings: { [key: string]: ServiceMapping }, fallbackLabel?: string) => {
  return serviceMappings[serviceKey] || {
    id: serviceKey,
    name: fallbackLabel || 'Service',
    duration: '45 min',
    price: 35,
    description: `Professional ${fallbackLabel?.toLowerCase() || 'service'} service`,
  };
};

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedServices: contextSelectedServices } = useSelectedServices();
  const { claimedRewards } = useRewards();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  
  // API state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [availableRewards, setAvailableRewards] = useState<AvailableReward[]>([]);
  const [serviceMappings, setServiceMappings] = useState<{ [key: string]: ServiceMapping }>({});
  const [defaultBooking, setDefaultBooking] = useState<DefaultBooking | null>(null);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Additional state hooks (moved before conditional return)
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [selectedRewardForRedemption, setSelectedRewardForRedemption] = useState<string | null>(null);
  const [isRewardApplied, setIsRewardApplied] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newBookingData, setNewBookingData] = useState<any>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [paymentData, rewardsData, serviceData, bookingData, loyaltyResponse] = await Promise.all([
          customerAPI.getPaymentMethods(),
          customerAPI.getAvailableRewards(),
          customerAPI.getServiceMappings(),
          customerAPI.getDefaultBooking(),
          customerAPI.getLoyaltyData()
        ]);
        setPaymentMethods(paymentData);
        setAvailableRewards(rewardsData);
        setServiceMappings(serviceData);
        setDefaultBooking(bookingData);
        setLoyaltyData(loyaltyResponse);
      } catch (error) {
        console.error('Error loading booking confirmation data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading booking confirmation...</Text>
      </View>
    );
  }
  
  // Get booking details from params with API fallbacks
  const barberName = params.barberName as string || defaultBooking?.barberName || 'Loading...';
  const barberPhoto = params.barberPhoto as string || defaultBooking?.barberPhoto || '';
  const salonName = params.salonName as string || defaultBooking?.salonName || 'Loading...';
  const selectedDate = params.selectedDate as string || defaultBooking?.selectedDate || 'Loading...';
  const selectedTime = params.selectedTime as string || defaultBooking?.selectedTime || 'Loading...';
  const source = params.source as string || defaultBooking?.source || 'all-slots';
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  const selectedServicesJson = params.selectedServicesJson as string;
  
  // Promotion parameters
  const promotionCode = params.promotionCode as string;
  const promotionTitle = params.promotionTitle as string;
  const promotionDiscount = params.promotionDiscount as string;
  const discountAmount = params.discountAmount as string;
  const discountType = params.discountType as string;

  // Debug: Log the context services
  console.log('Context selected services:', contextSelectedServices);
  console.log('Params selected service:', selectedService);
  console.log('Params selected service label:', selectedServiceLabel);
  console.log('Params selected services JSON:', selectedServicesJson);
  console.log('Source:', source);
  
  // Use selected services from context if available, otherwise fall back to params
  let selectedServices;
  
  if (contextSelectedServices.length > 0) {
    console.log('Using context services:', contextSelectedServices);
    // Use context services
    selectedServices = contextSelectedServices.map(service => {
      // Use API service mappings
      return getServiceDetails(service.key, serviceMappings, service.label);
    });
  } else if (selectedServicesJson) {
    // Use JSON parameter if context is empty but we have JSON data
    console.log('Using JSON services:', selectedServicesJson);
    try {
      const parsedServices = JSON.parse(selectedServicesJson);
      console.log('Parsed services:', parsedServices);
      selectedServices = parsedServices.map((service: any) => {
        // Use API service mappings
        return getServiceDetails(service.key, serviceMappings, service.label);
      });
    } catch (error) {
      console.log('Error parsing JSON services:', error);
      selectedServices = selectedServiceLabel ? [getServiceDetails(selectedServiceLabel, serviceMappings, selectedServiceLabel)] : [];
    }
  } else if (selectedServiceLabel) {
    // Use params if context is empty but we have a service label
    selectedServices = selectedServiceLabel ? [getServiceDetails(selectedServiceLabel, serviceMappings, selectedServiceLabel)] : [];
  } else {
    // Default services if nothing is selected
    selectedServices = [
      {
        id: '1',
        name: 'Haircut & Styling',
        duration: '45 min',
        price: 35,
        description: 'Professional haircut with styling',
      },
      {
        id: '2',
        name: 'Beard Trim',
        duration: '20 min',
        price: 15,
        description: 'Beard shaping and trimming',
      },
    ];
  }
  
  console.log('Final selected services to display:', selectedServices);
  console.log('Service names to show:', selectedServices.map((s: any) => s.name || s.label));
  
  // Calculate totals
  const subtotal = selectedServices.reduce((sum: number, service: any) => sum + service.price, 0);
  
  // Calculate rewards discount
  const rewardsDiscount = claimedRewards.reduce((total: number, reward: any) => {
    if (reward.title === 'Free Haircut') return total + 35; // Free haircut value
    if (reward.title === '20% Off Beard Trim') return total + (15 * 0.2); // 20% off beard trim
    if (reward.title === 'Free Styling') return total + 25; // Free styling value
    if (reward.title === 'VIP Treatment') return total + 10; // VIP treatment value
    return total;
  }, 0);
  
  // Loyalty Rewards State and Data (moved to top)
  
  // Loyalty rewards data from API
  const basePoints = loyaltyData?.currentPoints || DEFAULT_POINTS_CONFIG.CURRENT_POINTS;
  const pointsToEarn = Math.floor(subtotal * DEFAULT_POINTS_CONFIG.EARNING_RATES.PER_BOOKING); // Points based on booking total
  const pointsMultiplier = selectedTime.includes('PM') && parseInt(selectedTime.split(':')[0]) >= 6 ? DEFAULT_POINTS_CONFIG.EARNING_RATES.EVENING_MULTIPLIER : 1; // Evening multiplier points
  
  // Calculate current points after any selected reward deduction
  const selectedReward = selectedRewardForRedemption ? 
    availableRewards.find((reward: any) => reward.id === selectedRewardForRedemption) : null;
  const currentPoints = (selectedReward && isRewardApplied) ? basePoints - selectedReward.points : basePoints;
  
  // Available rewards are now loaded from API
  
  // Loyalty rewards functions
  const handleRewardSelection = (rewardId: string) => {
    // If clicking the same reward, deselect it
    if (selectedRewardForRedemption === rewardId) {
      setSelectedRewardForRedemption(null);
      setIsRewardApplied(false); // Reset applied state when deselecting
      return;
    }
    
    // Check if user has enough points for the new reward
    const reward = availableRewards.find((r: any) => r.id === rewardId);
    if (reward && basePoints >= reward.points) {
      setSelectedRewardForRedemption(rewardId);
      setIsRewardApplied(false); // Reset applied state when selecting new reward
    } else if (reward) {
      // Show insufficient points alert
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.points} points to redeem this reward, but you only have ${basePoints} points.`,
        [{ text: 'OK' }]
      );
    }
  };
  
  const getSelectedRewardDetails = () => {
    return availableRewards.find((reward: any) => reward.id === selectedRewardForRedemption);
  };
  
  const handleApplyReward = () => {
    if (isRewardApplied) {
      // Undo the reward application
      setIsRewardApplied(false);
      console.log('Reward application undone - user will earn points instead');
    } else {
      // Apply the reward
      const selectedReward = getSelectedRewardDetails();
      if (!selectedReward) {
        Alert.alert(
          'No Reward Selected',
          'Please select a reward to apply, or proceed without one.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      if (basePoints >= selectedReward.points) {
        setIsRewardApplied(true);
        console.log(`Applied reward: ${selectedReward.title}`);
      } else {
        Alert.alert(
          'Insufficient Points',
          'You don\'t have enough points to redeem this reward.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleViewHistory = () => {
    setShowHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
  };

  // Calculate loyalty reward discount and final totals
  const loyaltyRewardDiscount = (selectedRewardForRedemption && isRewardApplied) ? 
    (parseFloat(getSelectedRewardDetails()?.discount.replace('$', '') || '0') || 0) : 0;

  // Calculate promotion discount
  const promotionDiscountAmount = discountAmount ? parseFloat(discountAmount) : 0;

  // Calculate total discounts
  const totalDiscounts = rewardsDiscount + loyaltyRewardDiscount + promotionDiscountAmount;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscounts);
  
  // Use configurable tax rate instead of hardcoded 8%
  const tax = discountedSubtotal * TAX_RATE;
  const total = discountedSubtotal + tax;

  const handleConfirmBooking = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Generate receipt data
      const receipt = {
        bookingId: `BK${Date.now().toString().slice(-6)}`,
        barberName,
        salonName,
        selectedDate,
        selectedTime,
        services: selectedServices,
        subtotal,
        rewardsDiscount,
        loyaltyRewardDiscount,
        promotionDiscount: promotionDiscountAmount,
        promotionCode,
        promotionTitle,
        tax,
        total,
        confirmedAt: new Date().toLocaleString(),
        location: defaultBooking?.location || '9785, 132St, Vancouver',
        contact: defaultBooking?.contact || '(555) 123-4567',
        terms: 'Please arrive 10 minutes before your appointment. Late arrivals may result in reduced service time.',
      };
      
      setReceiptData(receipt);
      setShowReceipt(true);
      
      // Create booking data for My Bookings page
      const servicesString = selectedServices.map((s: any) => (s.label || s.name || '')).join(', ');
      console.log('Selected services array:', selectedServices);
      console.log('Services string:', servicesString);
      
      const bookingData = {
        id: receipt.bookingId,
        service: servicesString, // Convert services array to string
        salon: salonName,
        barber: barberName,
        date: selectedDate,
        time: selectedTime,
        price: formatPrice(total), // Use centralized formatPrice function
        status: 'confirmed',
        confirmedAt: receipt.confirmedAt,
        location: receipt.location,
        contact: receipt.contact,
        salonImage: defaultBooking?.salonImage || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop', // Ensure salonImage is included
        services: selectedServices, // Keep original services array for reference
        total: total, // Keep original total for reference
      };
      
      console.log('Sending booking data to My Bookings:', bookingData);
      setNewBookingData(bookingData);
    }, 2000);
  };

  const handleBack = () => {
    // Navigate back based on the source path
    switch (source) {
      case 'all-slots':
      case 'barber-profile-direct':
      case 'book-directly-asap':
        router.back();
        break;
      case 'book-again':
        // Go back to booking history screen and reopen the modal
        router.replace({
          pathname: '/(customer)/BookingHistoryScreen',
          params: { reopenModal: 'true', selectedBookingId: params.selectedBookingId }
        });
        break;
      case 'promotion':
        // Go back to promotions screen and reopen the modal
        router.replace({
          pathname: '/(customer)/PromotionsScreen',
          params: { reopenModal: 'true', selectedPromotionId: params.selectedPromotionId }
        });
        break;
      case 'appointment':
      case 'explore':
      case 'salon-details':
        // Go back to appointment screen
        router.replace('/(customer)/appointment');
        break;
      case 'book-directly':
        // Go back to book directly screen
        router.replace('/(customer)/book-directly');
        break;
      default:
        // Default fallback to appointment screen
        router.replace('/(customer)/appointment');
        break;
    }
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
                      <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appointment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Summary</Text>
          <View style={styles.appointmentCard}>
            <View style={styles.barberInfo}>
              <Image source={{ uri: barberPhoto }} style={styles.barberPhoto} />
              <View style={styles.barberDetails}>
                <Text style={styles.barberName}>{barberName}</Text>
                <Text style={styles.salonName}>{salonName}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>4.8 Rating</Text>
                </View>
              </View>
            </View>
            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.detailText}>{selectedDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.detailText}>{selectedTime}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.detailText}>{defaultBooking?.location || '9785, 132St, Vancouver'}</Text>
              </View>
            </View>
          </View>
          
          {/* ASAP Appointment Indicator */}
          {source === 'book-directly-asap' && (
            <View style={styles.asapIndicator}>
              <Ionicons name="flash" size={16} color="#FF6B00" />
              <Text style={styles.asapText}>ASAP Appointment - Next Available Slot</Text>
            </View>
          )}
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Services</Text>
          {selectedServices.length > 0 ? (
            selectedServices.map((service: any, index: number) => (
              <View key={service.id || service.key || index} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name || service.label}</Text>
                  <Text style={styles.serviceDescription}>{service.description || `Professional ${(service.label || service.name).toLowerCase()} service`}</Text>
                  <View style={styles.serviceMeta}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.serviceDuration}>{service.duration}</Text>
                  </View>
                </View>
                <Text style={styles.servicePrice}>${service.price}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noServicesCard}>
              <Ionicons name="information-circle-outline" size={24} color="#999" />
              <Text style={styles.noServicesText}>No services selected</Text>
              <Text style={styles.noServicesSubtext}>Please go back and select services</Text>
            </View>
          )}
        </View>

        {/* Promotion Info */}
        {promotionCode && (
          <View style={styles.section}>
            <View style={styles.promotionHeader}>
              <Ionicons name="gift" size={20} color="#FF4757" />
              <Text style={styles.sectionTitle}>Applied Promotion</Text>
            </View>
            <View style={styles.promotionCard}>
              <Text style={styles.promotionCode}>{promotionCode}</Text>
              <Text style={styles.promotionDescription}>{promotionTitle}</Text>
              <Text style={styles.promotionDiscount}>{promotionDiscount}</Text>
            </View>
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodInfo}>
                <Ionicons name={method.icon as any} size={20} color="#666" />
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  {method.last4 && (
                    <Text style={styles.paymentMethodText}>•••• {method.last4} • {method.type}</Text>
                  )}
                  {method.email && (
                    <Text style={styles.paymentMethodText}>{method.email}</Text>
                  )}
                </View>
              </View>
              <View style={styles.paymentMethodRadio}>
                <View style={[
                  styles.radioButton,
                  selectedPaymentMethod === method.id && styles.radioButtonSelected
                ]}>
                  {selectedPaymentMethod === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>${subtotal}</Text>
            </View>
                         {rewardsDiscount > 0 && (
               <View style={styles.priceRow}>
                 <Text style={styles.priceLabel}>Rewards Discount</Text>
                 <Text style={[styles.priceValue, styles.discountValue]}>-${rewardsDiscount.toFixed(2)}</Text>
               </View>
             )}
            {loyaltyRewardDiscount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Loyalty Reward</Text>
                <Text style={[styles.priceValue, styles.discountValue]}>-${loyaltyRewardDiscount.toFixed(2)}</Text>
              </View>
            )}
            {promotionDiscountAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Promotion ({promotionCode})</Text>
                <Text style={[styles.priceValue, styles.discountValue]}>-${promotionDiscountAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (8%)</Text>
              <Text style={styles.priceValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Loyalty Rewards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loyalty Rewards</Text>
          <View style={styles.loyaltyCard}>
            {/* Current Points Display */}
            <View style={styles.currentPointsRow}>
              <View style={styles.pointsInfo}>
                <Ionicons name="star" size={20} color="#D4AF37" />
                <View style={styles.pointsDisplay}>
                  <Text style={styles.currentPointsValue}>{currentPoints} points</Text>
                  {selectedReward && (
                    <View style={styles.pointsDeductionInfo}>
                      <Text style={styles.pointsDeductionText}>
                        -{selectedReward.points} points
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity 
                style={styles.viewHistoryButton}
                onPress={handleViewHistory}
              >
                <Text style={styles.viewHistoryText}>View History</Text>
                <Ionicons name="chevron-forward" size={14} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Points Earned from This Booking */}
            <View style={styles.pointsEarnedRow}>
              <View style={styles.pointsEarnedInfo}>
                <Ionicons name="trending-up" size={16} color="#28A745" />
                <Text style={styles.pointsEarnedLabel}>Points You'll Earn</Text>
              </View>
              <Text style={styles.pointsEarnedValue}>+{pointsToEarn} points</Text>
            </View>

            {/* Points Multiplier Info */}
            {pointsMultiplier > 1 && (
              <View style={styles.multiplierInfo}>
                <Ionicons name="flash" size={14} color="#FF6B00" />
                <Text style={styles.multiplierText}>
                  {pointsMultiplier}x points this week! Book during peak hours
                </Text>
              </View>
            )}

            {/* Available Rewards for Redemption */}
            {availableRewards.length > 0 && (
              <View style={styles.availableRewardsSection}>
                <Text style={styles.availableRewardsTitle}>Available for Redemption</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rewardsScrollContainer}
                >
                   {availableRewards.map((reward) => {
                     const isSelected = selectedRewardForRedemption === reward.id;
                     const canAfford = basePoints >= reward.points;
                     const isDisabled = !canAfford && !isSelected;
                     
                     return (
                       <TouchableOpacity
                         key={reward.id}
                         style={[
                           styles.rewardOptionCard,
                           isSelected && styles.selectedRewardOption,
                           isDisabled && styles.disabledRewardOption
                         ]}
                         onPress={() => handleRewardSelection(reward.id)}
                         disabled={isDisabled}
                       >
                         <View style={styles.rewardOptionHeader}>
                           <Ionicons 
                             name="gift" 
                             size={16} 
                             color={isDisabled ? "#ccc" : "#28A745"} 
                           />
                           <Text style={[
                             styles.rewardOptionTitle,
                             isDisabled && styles.disabledText
                           ]}>
                             {reward.title}
                           </Text>
                         </View>
                         <View style={styles.rewardOptionFooter}>
                           <Text style={[
                             styles.rewardOptionPoints,
                             isDisabled && styles.disabledText
                           ]}>
                             {reward.points}p
                           </Text>
                           <Text style={[
                             styles.rewardOptionValue,
                             isDisabled && styles.disabledText
                           ]}>
                             {reward.discount}
                           </Text>
                         </View>
                         {isDisabled && (
                           <View style={styles.disabledOverlay}>
                             <Ionicons name="lock-closed" size={14} color="#999" />
                           </View>
                         )}
                       </TouchableOpacity>
                     );
                   })}
                 </ScrollView>
                
                {/* Redemption Summary */}
                {selectedRewardForRedemption ? (
                  <View style={styles.redemptionSummary}>
                    <View style={styles.redemptionInfo}>
                      <Ionicons name="gift" size={16} color="#28A745" />
                      <Text style={styles.redemptionText}>
                        {isRewardApplied 
                          ? `Applied ${getSelectedRewardDetails()?.title} - Saved ${getSelectedRewardDetails()?.discount}`
                          : `Applying ${getSelectedRewardDetails()?.title} will save you ${getSelectedRewardDetails()?.discount}`
                        }
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.applyRewardButton,
                        isRewardApplied && styles.undoRewardButton
                      ]}
                      onPress={handleApplyReward}
                    >
                      <Text style={[
                        styles.applyRewardButtonText,
                        isRewardApplied && styles.undoRewardButtonText
                      ]}>
                        {isRewardApplied ? 'Undo' : 'Apply Reward'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}

          </View>
        </View>

        {/* Claimed Rewards */}
        {claimedRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Applied Rewards</Text>
            {claimedRewards.map((reward: any) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardInfo}>
                  <Ionicons name={reward.icon} size={24} color="#28A745" />
                  <View style={styles.rewardText}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                  </View>
                </View>
                <View style={styles.rewardStatus}>
                  <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                  <Text style={styles.rewardStatusText}>Applied</Text>
                </View>
              </View>
            ))}
            <View style={styles.rewardsNote}>
              <Ionicons name="information-circle" size={16} color="#666" />
              <Text style={styles.rewardsNoteText}>
                Your claimed rewards will be applied to this booking
              </Text>
            </View>
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={16} color="#666" />
              <Text style={styles.infoText}>Please arrive 10 minutes before your appointment</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.infoText}>Late arrivals may result in reduced service time</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="card" size={16} color="#666" />
              <Text style={styles.infoText}>Payment will be processed after service completion</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.infoText}>Call {defaultBooking?.contact || '(555) 123-4567'} for any changes</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleConfirmBooking}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="refresh" size={20} color="#000" style={styles.loadingIcon} />
              <Text style={styles.confirmButtonText}>Confirming...</Text>
            </View>
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>

       {/* Receipt Popup Modal */}
       {showReceipt && receiptData && (
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
                   style={styles.closeReceiptButton}
                   onPress={() => setShowReceipt(false)}
                 >
                   <Ionicons name="close" size={20} color="#666" />
                 </TouchableOpacity>
               </View>
               <Text style={styles.receiptTitle}>Booking Confirmed!</Text>
               <Text style={styles.receiptSubtitle}>Thank you for choosing HairDo</Text>
             </View>

             {/* Receipt Content */}
             <ScrollView style={styles.receiptContent} showsVerticalScrollIndicator={false}>
               {/* Booking Details */}
               <View style={styles.receiptSection}>
                 <Text style={styles.receiptSectionTitle}>Booking Details</Text>
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Booking ID:</Text>
                   <Text style={styles.receiptDetailValue}>{receiptData.bookingId}</Text>
                 </View>
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Confirmed:</Text>
                   <Text style={styles.receiptDetailValue}>{receiptData.confirmedAt}</Text>
                 </View>
               </View>

               {/* Appointment Info */}
               <View style={styles.receiptSection}>
                 <Text style={styles.receiptSectionTitle}>Appointment</Text>
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Barber:</Text>
                   <Text style={styles.receiptDetailValue}>{receiptData.barberName}</Text>
                 </View>
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Salon:</Text>
                   <Text style={styles.receiptDetailValue}>{receiptData.salonName}</Text>
                 </View>
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Date:</Text>
                   <Text style={styles.receiptDetailValue}>{receiptData.selectedDate}</Text>
                 </View>
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Time:</Text>
                   <Text style={styles.receiptDetailValue}>{receiptData.selectedTime}</Text>
                 </View>
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Location:</Text>
                   <Text style={styles.receiptDetailValue}>{receiptData.location}</Text>
                 </View>
               </View>

               {/* Services */}
               <View style={styles.receiptSection}>
                 <Text style={styles.receiptSectionTitle}>Services</Text>
                 {receiptData.services.map((service: any, index: number) => (
                   <View key={index} style={styles.receiptServiceRow}>
                     <View style={styles.receiptServiceInfo}>
                       <Text style={styles.receiptServiceName}>{service.name}</Text>
                       <Text style={styles.receiptServiceDuration}>{service.duration}</Text>
                     </View>
                     <Text style={styles.receiptServicePrice}>${service.price}</Text>
                   </View>
                 ))}
               </View>

               {/* Price Breakdown */}
               <View style={styles.receiptSection}>
                 <Text style={styles.receiptSectionTitle}>Price Breakdown</Text>
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Subtotal:</Text>
                   <Text style={styles.receiptDetailValue}>${receiptData.subtotal}</Text>
                 </View>
                 {receiptData.rewardsDiscount > 0 && (
                   <View style={styles.receiptDetailRow}>
                     <Text style={styles.receiptDetailLabel}>Rewards Discount:</Text>
                     <Text style={[styles.receiptDetailValue, styles.receiptDiscountValue]}>
                       -${receiptData.rewardsDiscount.toFixed(2)}
                     </Text>
                   </View>
                 )}
                 {receiptData.loyaltyRewardDiscount > 0 && (
                   <View style={styles.receiptDetailRow}>
                     <Text style={styles.receiptDetailLabel}>Loyalty Reward:</Text>
                     <Text style={[styles.receiptDetailValue, styles.receiptDiscountValue]}>
                       -${receiptData.loyaltyRewardDiscount.toFixed(2)}
                     </Text>
                   </View>
                 )}
                 {receiptData.promotionDiscount > 0 && (
                   <View style={styles.receiptDetailRow}>
                     <Text style={styles.receiptDetailLabel}>Promotion ({receiptData.promotionCode}):</Text>
                     <Text style={[styles.receiptDetailValue, styles.receiptDiscountValue]}>
                       -${receiptData.promotionDiscount.toFixed(2)}
                     </Text>
                   </View>
                 )}
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Tax (8%):</Text>
                   <Text style={styles.receiptDetailValue}>${receiptData.tax.toFixed(2)}</Text>
                 </View>
                 <View style={styles.receiptDivider} />
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptTotalLabel}>Total:</Text>
                   <Text style={styles.receiptTotalValue}>${receiptData.total.toFixed(2)}</Text>
                 </View>
               </View>

               {/* Important Info */}
               <View style={styles.receiptSection}>
                 <Text style={styles.receiptSectionTitle}>Important Information</Text>
                 <Text style={styles.receiptTerms}>{receiptData.terms}</Text>
                 <View style={styles.receiptDetailRow}>
                   <Text style={styles.receiptDetailLabel}>Contact:</Text>
                   <Text style={styles.receiptDetailValue}>{receiptData.contact}</Text>
                 </View>
               </View>
             </ScrollView>

             {/* Receipt Actions */}
             <View style={styles.receiptActions}>
               <TouchableOpacity
                 style={styles.receiptActionButton}
                 onPress={() => {
                   // Here you would implement sharing functionality
                   Alert.alert('Share Receipt', 'Receipt sharing feature will be implemented here.');
                 }}
               >
                 <Ionicons name="share-outline" size={16} color="#666" />
                 <Text style={styles.receiptActionText}>Share</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                 style={styles.receiptActionButton}
                 onPress={() => {
                   // Here you would implement saving functionality
                   Alert.alert('Save Receipt', 'Receipt will be saved to your device.');
                 }}
               >
                 <Ionicons name="download-outline" size={16} color="#666" />
                 <Text style={styles.receiptActionText}>Save</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                 style={styles.receiptActionButton}
                 onPress={() => {
                   // Here you would implement printing functionality
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
                 onPress={() => {
                   setShowReceipt(false);
                   router.push({
                     pathname: '/(customer)/my-bookings',
                     params: {
                       newBooking: JSON.stringify(newBookingData)
                     }
                   });
                 }}
               >
                 <Text style={styles.receiptDoneButtonText}>View My Bookings</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       )}

      {/* Loyalty History Modal */}
      <Modal
        visible={showHistoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseHistoryModal}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalContainer}>
            {/* Header */}
            <View style={styles.historyModalHeader}>
              <Text style={styles.historyModalTitle}>Loyalty Points History</Text>
              <TouchableOpacity
                style={styles.historyModalCloseButton}
                onPress={handleCloseHistoryModal}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Current Balance */}
            <View style={styles.historyBalanceSection}>
              <View style={styles.historyBalanceCard}>
                <Ionicons name="star" size={24} color="#D4AF37" />
                <View style={styles.historyBalanceInfo}>
                  <Text style={styles.historyBalanceLabel}>Current Balance</Text>
                  <Text style={styles.historyBalanceValue}>{basePoints} points</Text>
                </View>
              </View>
            </View>

            {/* Monthly Stats */}
            <View style={styles.historyStatsSection}>
              <Text style={styles.historySectionTitle}>This Month</Text>
              <View style={styles.historyStatsRow}>
                <View style={styles.historyStatItem}>
                  <Ionicons name="trending-up" size={20} color="#28A745" />
                  <Text style={styles.historyStatLabel}>Earned</Text>
                  <Text style={styles.historyStatValue}>{loyaltyData?.monthlyStats.totalEarned || 0} pts</Text>
                </View>
                <View style={styles.historyStatItem}>
                  <Ionicons name="trending-down" size={20} color="#FF6B6B" />
                  <Text style={styles.historyStatLabel}>Redeemed</Text>
                  <Text style={styles.historyStatValue}>{loyaltyData?.monthlyStats.totalRedeemed || 0} pts</Text>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.historyActivitySection}>
              <Text style={styles.historySectionTitle}>Recent Activity</Text>
              <ScrollView style={styles.historyActivityList} showsVerticalScrollIndicator={false}>
                {loyaltyData?.recentActivity?.map((activity, index) => (
                  <View key={index} style={styles.historyActivityItem}>
                    <View style={styles.historyActivityIcon}>
                      <Ionicons 
                        name={activity.type === 'earned' ? 'add-circle' : 'remove-circle'} 
                        size={20} 
                        color={activity.type === 'earned' ? '#28A745' : '#FF6B6B'} 
                      />
                    </View>
                    <View style={styles.historyActivityInfo}>
                      <Text style={styles.historyActivityText}>{activity.activity}</Text>
                      <Text style={styles.historyActivityDate}>{activity.date}</Text>
                    </View>
                    <Text style={[
                      styles.historyActivityPoints,
                      { color: activity.type === 'earned' ? '#28A745' : '#FF6B6B' }
                    ]}>
                      {activity.type === 'earned' ? '+' : '-'}{activity.points}
                    </Text>
                  </View>
                )) || (
                  <View style={styles.historyNoActivity}>
                    <Ionicons name="time-outline" size={40} color="#ccc" />
                    <Text style={styles.historyNoActivityText}>No recent activity</Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.historyModalCloseBtn}
              onPress={handleCloseHistoryModal}
            >
              <Text style={styles.historyModalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdfa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3c4c48',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.15)',
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  barberPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  barberDetails: {
    flex: 1,
  },
  barberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  salonName: {
    fontSize: 14,
    color: '#3c4c48',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#3c4c48',
    marginLeft: 4,
    fontWeight: '500',
  },
  appointmentDetails: {
    borderTopWidth: 1,
    borderTopColor: '#3c4c48',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#3c4c48',
    marginLeft: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.15)',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#3c4c48',
    marginBottom: 4,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#3c4c48',
    marginLeft: 4,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(60,76,72,0.15)',
  },
  selectedPaymentMethod: {
    borderColor: '#d72638',
    backgroundColor: '#fffdfa',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#3c4c48',
  },
  paymentMethodRadio: {
    marginLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3c4c48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#d72638',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d72638',
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.15)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#3c4c48',
  },
  priceValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  discountValue: {
    color: '#28A745',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d72638',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.15)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3c4c48',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  confirmButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#3c4c48',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d72638',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  noServicesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.15)',
  },
  noServicesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3c4c48',
    marginTop: 8,
    textAlign: 'center',
  },
  noServicesSubtext: {
    fontSize: 14,
    color: '#3c4c48',
    marginTop: 4,
    textAlign: 'center',
  },
  asapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffdfa',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#d72638',
  },
  asapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d72638',
    marginLeft: 8,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FFF8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D4EDDA',
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rewardText: {
    marginLeft: 12,
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
  },
  rewardStatus: {
    alignItems: 'center',
  },
  rewardStatusText: {
    fontSize: 12,
    color: '#28A745',
    marginTop: 4,
    fontWeight: '500',
  },
  rewardsNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  rewardsNoteText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  
  // Loyalty Rewards Styles
  loyaltyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.15)',
  },
  currentPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  
     currentPointsValue: {
     fontSize: 16,
     fontWeight: 'bold',
     color: '#000000',
     marginLeft: 8,
   },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(60,76,72,0.08)',
  },
  viewHistoryText: {
    fontSize: 11,
    color: '#3c4c48',
    marginRight: 2,
  },
  pointsEarnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FFF0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  pointsEarnedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsEarnedLabel: {
    fontSize: 12,
    color: '#28A745',
    marginLeft: 6,
    fontWeight: '500',
  },
  pointsEarnedValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28A745',
  },
  multiplierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 6,
    padding: 6,
    marginBottom: 10,
  },
  multiplierText: {
    fontSize: 11,
    color: '#FF6B00',
    marginLeft: 4,
    fontWeight: '500',
  },
  availableRewardsSection: {
    marginBottom: 12,
  },
  availableRewardsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  rewardsScrollContainer: {
    paddingRight: 12,
  },
  rewardOptionCard: {
    width: 80,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.15)',
    position: 'relative',
  },
  selectedRewardOption: {
    borderColor: '#28A745',
    backgroundColor: '#F0FFF0',
    borderWidth: 2,
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardOptionHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  rewardOptionFooter: {
    alignItems: 'center',
  },
  rewardOptionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginTop: 2,
  },
  rewardOptionPoints: {
    fontSize: 8,
    color: '#3c4c48',
    marginBottom: 2,
  },
  rewardOptionValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#28A745',
  },
  redemptionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FFF0',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },

  redemptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  redemptionText: {
    fontSize: 12,
    color: '#28A745',
    marginLeft: 6,
    fontWeight: '500',
  },
  applyRewardButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  applyRewardButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  undoRewardButton: {
    backgroundColor: '#FF6B6B',
  },
  undoRewardButtonText: {
    color: '#fff',
  },

   // Receipt Popup Styles - Compact Mobile Version
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
     closeReceiptButton: {
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
     receiptSubtitle: {
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
   receiptDiscountValue: {
     color: '#28A745',
     fontWeight: '600',
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
  promotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promotionCard: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 12,
    padding: 16,
  },
  promotionCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4757',
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  promotionDiscount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4757',
  },
  
  // New styles for enhanced loyalty rewards
  pointsDisplay: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  pointsDeductionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  pointsDeductionText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  disabledRewardOption: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    opacity: 0.6,
  },
  disabledText: {
    color: '#999',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 2,
  },
  
  // History Modal Styles
  historyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  historyModalCloseButton: {
    padding: 4,
  },
  historyBalanceSection: {
    padding: 20,
  },
  historyBalanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  historyBalanceInfo: {
    marginLeft: 12,
  },
  historyBalanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  historyBalanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  historyStatsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  historyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyStatItem: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
  },
  historyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  historyStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  historyActivitySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flex: 1,
  },
  historyActivityList: {
    maxHeight: 200,
  },
  historyActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyActivityIcon: {
    marginRight: 12,
  },
  historyActivityInfo: {
    flex: 1,
  },
  historyActivityText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  historyActivityDate: {
    fontSize: 12,
    color: '#666',
  },
  historyActivityPoints: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyNoActivity: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  historyNoActivityText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  historyModalCloseBtn: {
    backgroundColor: '#000',
    margin: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  historyModalCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 