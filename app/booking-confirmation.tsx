import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelectedServices } from './(tabs)/appointment';
import { useRewards } from '../sharedComponent/RewardsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock payment methods
const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: 'card',
    last4: '4242',
    type: 'Visa',
    isDefault: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: 'logo-paypal',
    email: 'user@example.com',
    isDefault: false,
  },
  {
    id: 'cash',
    name: 'Pay at Salon',
    icon: 'cash',
    description: 'Pay when you arrive',
    isDefault: false,
  },
];

// Mock services - will be replaced with actual selected service
const getSelectedServices = (selectedServiceLabel: string) => {
  const serviceMap: { [key: string]: any } = {
    'Haircut': {
      id: '1',
      name: 'Haircut & Styling',
      duration: '45 min',
      price: 35,
      description: 'Professional haircut with styling',
    },
    'Beard': {
      id: '2',
      name: 'Beard Trim',
      duration: '20 min',
      price: 15,
      description: 'Beard shaping and trimming',
    },
    'Haircut & Beard': {
      id: '3',
      name: 'Haircut & Beard Combo',
      duration: '60 min',
      price: 45,
      description: 'Complete haircut and beard styling',
    },
    'Long hair': {
      id: '4',
      name: 'Long Hair Styling',
      duration: '50 min',
      price: 40,
      description: 'Professional long hair styling',
    },
    'Styling': {
      id: '5',
      name: 'Hair Styling',
      duration: '30 min',
      price: 25,
      description: 'Professional hair styling',
    },
    'Facial': {
      id: '6',
      name: 'Facial Treatment',
      duration: '40 min',
      price: 30,
      description: 'Complete facial treatment',
    },
    'Coloring': {
      id: '7',
      name: 'Hair Coloring',
      duration: '90 min',
      price: 60,
      description: 'Professional hair coloring',
    },
    // Add mappings for service keys from explore page
    'haircut': {
      id: '1',
      name: 'Haircut & Styling',
      duration: '45 min',
      price: 35,
      description: 'Professional haircut with styling',
    },
    'beard': {
      id: '2',
      name: 'Beard Trim',
      duration: '20 min',
      price: 15,
      description: 'Beard shaping and trimming',
    },
    'haircut_beard': {
      id: '3',
      name: 'Haircut & Beard Combo',
      duration: '60 min',
      price: 45,
      description: 'Complete haircut and beard styling',
    },
    'long_hair': {
      id: '4',
      name: 'Long Hair Styling',
      duration: '50 min',
      price: 40,
      description: 'Professional long hair styling',
    },
    'styling': {
      id: '5',
      name: 'Hair Styling',
      duration: '30 min',
      price: 25,
      description: 'Professional hair styling',
    },
    'facial': {
      id: '6',
      name: 'Facial Treatment',
      duration: '40 min',
      price: 30,
      description: 'Complete facial treatment',
    },
    'coloring': {
      id: '7',
      name: 'Hair Coloring',
      duration: '90 min',
      price: 60,
      description: 'Professional hair coloring',
    },
  };
  
  // Try to find service by label first, then by key
  const service = serviceMap[selectedServiceLabel] || serviceMap[selectedServiceLabel?.toLowerCase()] || {
    id: 'default',
    name: selectedServiceLabel || 'Haircut & Styling',
    duration: '45 min',
    price: 35,
    description: `Professional ${selectedServiceLabel?.toLowerCase() || 'haircut'} service`,
  };
  
  return selectedServiceLabel ? [service] : [
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
};

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedServices: contextSelectedServices } = useSelectedServices();
  const { claimedRewards } = useRewards();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  
  // Get booking details from params
  const barberName = params.barberName as string || 'Shark.11';
  const barberPhoto = params.barberPhoto as string || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center';
  const salonName = params.salonName as string || "Man's Cave Salon";
  const selectedDate = params.selectedDate as string || 'Tomorrow';
  const selectedTime = params.selectedTime as string || '11:30 AM';
  const source = params.source as string || 'all-slots';
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  const selectedServicesJson = params.selectedServicesJson as string;

  // Debug: Log the context services
  console.log('Context selected services:', contextSelectedServices);
  console.log('Params selected service:', selectedService);
  console.log('Params selected service label:', selectedServiceLabel);
  console.log('Params selected services JSON:', selectedServicesJson);
  
  // Use selected services from context if available, otherwise fall back to params
  let selectedServices;
  
  if (contextSelectedServices.length > 0) {
    console.log('Using context services:', contextSelectedServices);
    // Use context services
    selectedServices = contextSelectedServices.map(service => {
      // Map service keys to proper service details - using the exact keys from appointment page
      const serviceMap: { [key: string]: any } = {
        'hair': {
          id: service.key,
          name: 'Haircut & Styling',
          duration: '45 min',
          price: 35,
          description: 'Professional haircut with styling',
        },
        'beard': {
          id: service.key,
          name: 'Beard Trim',
          duration: '20 min',
          price: 15,
          description: 'Beard shaping and trimming',
        },
        'facial': {
          id: service.key,
          name: 'Facial Treatment',
          duration: '40 min',
          price: 30,
          description: 'Complete facial treatment',
        },
        'nails': {
          id: service.key,
          name: 'Nail Care',
          duration: '30 min',
          price: 25,
          description: 'Professional nail care service',
        },
        'coloring': {
          id: service.key,
          name: 'Hair Coloring',
          duration: '90 min',
          price: 60,
          description: 'Professional hair coloring',
        },
        'kids_haircut': {
          id: service.key,
          name: 'Kids Haircut',
          duration: '30 min',
          price: 20,
          description: 'Professional kids haircut',
        },
        'head_massage': {
          id: service.key,
          name: 'Head Massage',
          duration: '25 min',
          price: 25,
          description: 'Relaxing head massage',
        },
        'cuts_fades': {
          id: service.key,
          name: 'Cuts and Fades',
          duration: '50 min',
          price: 40,
          description: 'Professional cuts and fades',
        },
        'perm': {
          id: service.key,
          name: 'Perm',
          duration: '120 min',
          price: 80,
          description: 'Professional perm treatment',
        },
        'straightening': {
          id: service.key,
          name: 'Hair Straightening',
          duration: '90 min',
          price: 70,
          description: 'Professional hair straightening',
        },
        'shave': {
          id: service.key,
          name: 'Shave',
          duration: '15 min',
          price: 12,
          description: 'Professional shave service',
        },
        'eyebrow': {
          id: service.key,
          name: 'Eyebrow Shaping',
          duration: '15 min',
          price: 10,
          description: 'Professional eyebrow shaping',
        },
        'threading': {
          id: service.key,
          name: 'Threading',
          duration: '20 min',
          price: 15,
          description: 'Professional threading service',
        },
        'waxing': {
          id: service.key,
          name: 'Waxing',
          duration: '30 min',
          price: 25,
          description: 'Professional waxing service',
        },
        'spa': {
          id: service.key,
          name: 'Spa Treatment',
          duration: '60 min',
          price: 50,
          description: 'Relaxing spa treatment',
        },
        'bridal': {
          id: service.key,
          name: 'Bridal Styling',
          duration: '120 min',
          price: 100,
          description: 'Special bridal styling service',
        },
        'makeup': {
          id: service.key,
          name: 'Makeup',
          duration: '45 min',
          price: 35,
          description: 'Professional makeup service',
        },
        'hair_treatment': {
          id: service.key,
          name: 'Hair Treatment',
          duration: '60 min',
          price: 45,
          description: 'Professional hair treatment',
        },
        'scalp': {
          id: service.key,
          name: 'Scalp Care',
          duration: '30 min',
          price: 25,
          description: 'Professional scalp care',
        },
        'tattoo': {
          id: service.key,
          name: 'Tattoo',
          duration: '120 min',
          price: 150,
          description: 'Professional tattoo service',
        },
        'piercing': {
          id: service.key,
          name: 'Piercing',
          duration: '30 min',
          price: 40,
          description: 'Professional piercing service',
        },
      };
      
      // Return mapped service or default
      return serviceMap[service.key] || {
        id: service.key,
        name: service.label,
        duration: '45 min',
        price: 35,
        description: `Professional ${service.label.toLowerCase()} service`,
      };
    });
  } else if (selectedServicesJson) {
    // Use JSON parameter if context is empty but we have JSON data
    console.log('Using JSON services:', selectedServicesJson);
    try {
      const parsedServices = JSON.parse(selectedServicesJson);
      console.log('Parsed services:', parsedServices);
      selectedServices = parsedServices.map((service: any) => {
        // Map service keys to proper service details - using the exact keys from appointment page
        const serviceMap: { [key: string]: any } = {
          'hair': {
            id: service.key,
            name: 'Haircut & Styling',
            duration: '45 min',
            price: 35,
            description: 'Professional haircut with styling',
          },
          'beard': {
            id: service.key,
            name: 'Beard Trim',
            duration: '20 min',
            price: 15,
            description: 'Beard shaping and trimming',
          },
          'facial': {
            id: service.key,
            name: 'Facial Treatment',
            duration: '40 min',
            price: 30,
            description: 'Complete facial treatment',
          },
          'nails': {
            id: service.key,
            name: 'Nail Care',
            duration: '30 min',
            price: 25,
            description: 'Professional nail care service',
          },
          'coloring': {
            id: service.key,
            name: 'Hair Coloring',
            duration: '90 min',
            price: 60,
            description: 'Professional hair coloring',
          },
          'kids_haircut': {
            id: service.key,
            name: 'Kids Haircut',
            duration: '30 min',
            price: 20,
            description: 'Professional kids haircut',
          },
          'head_massage': {
            id: service.key,
            name: 'Head Massage',
            duration: '25 min',
            price: 25,
            description: 'Relaxing head massage',
          },
          'cuts_fades': {
            id: service.key,
            name: 'Cuts and Fades',
            duration: '50 min',
            price: 40,
            description: 'Professional cuts and fades',
          },
          'perm': {
            id: service.key,
            name: 'Perm',
            duration: '120 min',
            price: 80,
            description: 'Professional perm treatment',
          },
          'straightening': {
            id: service.key,
            name: 'Hair Straightening',
            duration: '90 min',
            price: 70,
            description: 'Professional hair straightening',
          },
          'shave': {
            id: service.key,
            name: 'Shave',
            duration: '15 min',
            price: 12,
            description: 'Professional shave service',
          },
          'eyebrow': {
            id: service.key,
            name: 'Eyebrow Shaping',
            duration: '15 min',
            price: 10,
            description: 'Professional eyebrow shaping',
          },
          'threading': {
            id: service.key,
            name: 'Threading',
            duration: '20 min',
            price: 15,
            description: 'Professional threading service',
          },
          'waxing': {
            id: service.key,
            name: 'Waxing',
            duration: '30 min',
            price: 25,
            description: 'Professional waxing service',
          },
          'spa': {
            id: service.key,
            name: 'Spa Treatment',
            duration: '60 min',
            price: 50,
            description: 'Relaxing spa treatment',
          },
          'bridal': {
            id: service.key,
            name: 'Bridal Styling',
            duration: '120 min',
            price: 100,
            description: 'Special bridal styling service',
          },
          'makeup': {
            id: service.key,
            name: 'Makeup',
            duration: '45 min',
            price: 35,
            description: 'Professional makeup service',
          },
          'hair_treatment': {
            id: service.key,
            name: 'Hair Treatment',
            duration: '60 min',
            price: 45,
            description: 'Professional hair treatment',
          },
          'scalp': {
            id: service.key,
            name: 'Scalp Care',
            duration: '30 min',
            price: 25,
            description: 'Professional scalp care',
          },
          'tattoo': {
            id: service.key,
            name: 'Tattoo',
            duration: '120 min',
            price: 150,
            description: 'Professional tattoo service',
          },
          'piercing': {
            id: service.key,
            name: 'Piercing',
            duration: '30 min',
            price: 40,
            description: 'Professional piercing service',
          },
        };
        
        // Return mapped service or default
        return serviceMap[service.key] || {
          id: service.key,
          name: service.label,
          duration: '45 min',
          price: 35,
          description: `Professional ${service.label.toLowerCase()} service`,
        };
      });
    } catch (error) {
      console.log('Error parsing JSON services:', error);
      selectedServices = getSelectedServices(selectedServiceLabel);
    }
  } else if (selectedServiceLabel) {
    // Use params if context is empty but we have a service label
    selectedServices = getSelectedServices(selectedServiceLabel);
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
  
  // Loyalty Rewards State and Data
  const [selectedRewardForRedemption, setSelectedRewardForRedemption] = useState<string | null>(null);
  
  // Mock loyalty rewards data
  const currentPoints = 1250;
  const pointsToEarn = Math.floor(subtotal * 0.1); // 10% of subtotal as points
  const pointsMultiplier = selectedTime.includes('PM') && parseInt(selectedTime.split(':')[0]) >= 6 ? 2 : 1; // 2x points for evening appointments
  
  const availableRewards = [
    {
      id: 'discount_5',
      title: '$5 Off',
      pointsCost: 500,
      discountValue: 5,
      icon: 'pricetag-outline' as any,
    },
    {
      id: 'discount_10',
      title: '$10 Off',
      pointsCost: 1000,
      discountValue: 10,
      icon: 'pricetag-outline' as any,
    },
    {
      id: 'free_styling',
      title: 'Free Styling',
      pointsCost: 800,
      discountValue: 25,
      icon: 'cut-outline' as any,
    },
    {
      id: 'vip_treatment',
      title: 'VIP Treatment',
      pointsCost: 1200,
      discountValue: 15,
      icon: 'star-outline' as any,
    },
  ];
  
  // Loyalty rewards functions
  const handleRewardSelection = (rewardId: string) => {
    // Toggle selection: if already selected, deselect it; otherwise select it
    if (selectedRewardForRedemption === rewardId) {
      setSelectedRewardForRedemption(null);
    } else {
      setSelectedRewardForRedemption(rewardId);
    }
  };
  
  const getSelectedRewardDetails = () => {
    return availableRewards.find((reward: any) => reward.id === selectedRewardForRedemption);
  };
  
  const handleApplyReward = () => {
    const selectedReward = getSelectedRewardDetails();
    if (!selectedReward) {
      Alert.alert(
        'No Reward Selected',
        'Please select a reward to apply, or proceed without one.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (currentPoints >= selectedReward.pointsCost) {
      // Calculate the new total with the applied reward
      const newLoyaltyRewardDiscount = selectedReward.discountValue;
      const newDiscountedSubtotal = Math.max(0, subtotal - rewardsDiscount - newLoyaltyRewardDiscount);
      const newTax = newDiscountedSubtotal * 0.08;
      const newTotal = newDiscountedSubtotal + newTax;
      
      Alert.alert(
        'Reward Applied!',
        `You've successfully applied ${selectedReward.title} to your booking.\n\nNew Total: $${newTotal.toFixed(2)} (Saved: $${newLoyaltyRewardDiscount.toFixed(2)})`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Update the rewards context and recalculate totals
              // For now, we'll just show a success message
              console.log(`Applied reward: ${selectedReward.title}`);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Insufficient Points',
        'You don\'t have enough points to redeem this reward.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleViewHistory = () => {
    Alert.alert(
      'Loyalty History',
      'View your complete loyalty points history, earned rewards, and redemption history.',
      [
        {
          text: 'View Full History',
          onPress: () => {
            // Navigate to a dedicated loyalty history page
            // For now, we'll show a detailed alert
            Alert.alert(
              'Loyalty Points History',
              `Current Balance: ${currentPoints} points\n\nRecent Activity:\n• +50 points - Haircut (Dec 15)\n• +25 points - Beard Trim (Dec 10)\n• -500 points - $5 Off Reward (Dec 8)\n• +35 points - Haircut (Dec 1)\n\nTotal Earned This Month: 110 points\nTotal Redeemed This Month: 500 points`,
              [
                { text: 'Close' },
                {
                  text: 'View Details',
                  onPress: () => {
                    // Here you would navigate to a detailed loyalty history page
                    console.log('Navigate to detailed loyalty history');
                  }
                }
              ]
            );
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Calculate loyalty reward discount and final totals
  const loyaltyRewardDiscount = selectedRewardForRedemption ? 
    (getSelectedRewardDetails()?.discountValue || 0) : 0;
  
  const discountedSubtotal = Math.max(0, subtotal - rewardsDiscount - loyaltyRewardDiscount);
  const tax = discountedSubtotal * 0.08; // 8% tax
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
        tax,
        total,
        confirmedAt: new Date().toLocaleString(),
        location: '9785, 132St, Vancouver',
        contact: '(555) 123-4567',
        terms: 'Please arrive 10 minutes before your appointment. Late arrivals may result in reduced service time.',
      };
      
      setReceiptData(receipt);
      setShowReceipt(true);
    }, 2000);
  };

  const handleBack = () => {
    if (source === 'all-slots' || source === 'barber-profile-direct' || source === 'book-directly-asap') {
      router.back();
    } else {
      router.replace('/(tabs)/appointment');
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
          <Ionicons name="chevron-back" size={24} color="#000" />
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
                <Text style={styles.detailText}>9785, 132St, Vancouver</Text>
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
            selectedServices.map((service: any) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
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
                  {method.description && (
                    <Text style={styles.paymentMethodText}>{method.description}</Text>
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
                    <Text style={styles.currentPointsValue}>{currentPoints} points</Text>
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
                   {availableRewards.map((reward) => (
                     <TouchableOpacity
                       key={reward.id}
                       style={[
                         styles.rewardOptionCard,
                         selectedRewardForRedemption === reward.id && styles.selectedRewardOption
                       ]}
                       onPress={() => handleRewardSelection(reward.id)}
                     >
                       <View style={styles.rewardOptionHeader}>
                         <Ionicons name={reward.icon} size={16} color="#28A745" />
                         <Text style={styles.rewardOptionTitle}>{reward.title}</Text>
                       </View>
                       <View style={styles.rewardOptionFooter}>
                         <Text style={styles.rewardOptionPoints}>{reward.pointsCost}p</Text>
                         <Text style={styles.rewardOptionValue}>${reward.discountValue}</Text>
                       </View>
                       {selectedRewardForRedemption === reward.id && (
                         <View style={styles.selectedRewardCheckmark}>
                           <Ionicons name="checkmark-circle" size={16} color="#28A745" />
                         </View>
                       )}
                     </TouchableOpacity>
                   ))}
                 </ScrollView>
                
                {/* Redemption Summary */}
                {selectedRewardForRedemption ? (
                  <View style={styles.redemptionSummary}>
                    <View style={styles.redemptionInfo}>
                      <Ionicons name="gift" size={16} color="#28A745" />
                      <Text style={styles.redemptionText}>
                        Applying {getSelectedRewardDetails()?.title} will save you ${getSelectedRewardDetails()?.discountValue}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.applyRewardButton}
                      onPress={handleApplyReward}
                    >
                      <Text style={styles.applyRewardButtonText}>Apply Reward</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="gift-outline" size={16} color="#666" />
                <Text style={styles.quickActionText}>Earn More</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="trophy-outline" size={16} color="#666" />
                <Text style={styles.quickActionText}>Tier Status</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="help-circle-outline" size={16} color="#666" />
                <Text style={styles.quickActionText}>How It Works</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.infoText}>Call (555) 123-4567 for any changes</Text>
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
                   router.replace('/(tabs)/my-bookings');
                 }}
               >
                 <Text style={styles.receiptDoneButtonText}>View My Bookings</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       )}
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(60,76,72,0.08)',
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
  selectedRewardCheckmark: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
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
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
       quickActionText: {
    fontSize: 11,
    color: '#3c4c48',
    marginTop: 2,
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
}); 