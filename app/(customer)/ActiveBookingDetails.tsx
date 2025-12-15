import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_ICONS, DEFAULT_SALON_IMAGE } from '../../constants/BookingConstants';
import { getCancellationHours, getDepositPercentage } from '../../services/preferences/bookingPreferences';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OriginalBookingData {
  date: string;
  time: string;
  barber: string;
}

export default function ActiveBookingDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'reschedule' | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showRescheduleWarning, setShowRescheduleWarning] = useState(false);
  const [requestSentTime, setRequestSentTime] = useState<Date | null>(null);
  const [cnwHours, setCnwHours] = useState<number>(24);
  const [dpPercent, setDpPercent] = useState<number>(20);
  const [isLateCancel, setIsLateCancel] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [cancelByText, setCancelByText] = useState<string>('');
  
  // Hair preference state
  const [hairPreferences, setHairPreferences] = useState<any[]>([]);
  const [showAddPreferenceModal, setShowAddPreferenceModal] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Helper function to format date consistently
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', ' nonetheless', 'Dec'];
      const day = days[date.getDay()];
      const month = months[date.getMonth()];
      const dayNum = date.getDate();
      return `${day}, ${month} ${dayNum}`;
    } catch {
      return dateString;
    }
  };

  // Helper function to ensure time has AM/PM
  const formatTime = (timeString: string): string => {
    if (!timeString) return timeString;
    const upperCase = timeString.toUpperCase();
    if (upperCase.includes('AM') || upperCase.includes('PM')) {
      return timeString;
    }
    // If no AM/PM, assume 24-hour format and convert
    const match = timeString.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  // Check if this is a reschedule review
  const isRescheduleReview = params.rescheduleReview === 'true';
  const source = params.source as string;

  // Get booking data from params
  const bookingData = {
    id: params.id as string || '1',
    service: params.service as string || 'Haircut & Beard Trim',
    salon: params.salon as string || "Man's Cave Salon",
    barber: params.barber as string || 'Shark.11',
    date: params.date as string || 'January 25, 2025',
    time: params.time as string || '9:30 AM',
    price: params.price as string || '$45.00',
    // In reschedule review mode, status should be pending_reschedule since it's awaiting salon confirmation
    status: isRescheduleReview ? 'pending_reschedule' : (params.status as string || 'confirmed'),
    salonImage: params.salonImage as string || DEFAULT_SALON_IMAGE, // Use centralized default
    location: params.location as string || '9785, 132St, Vancouver',
    phone: params.phone as string || '(555) 123-4567',
    duration: params.duration as string || '45 min',
  };

  // Store original booking details when in review mode
  // Use originalDate/Time/Barber if provided, otherwise use the current booking as baseline
  const originalBooking = isRescheduleReview ? {
    date: params.originalDate as string || bookingData.date,
    time: params.originalTime as string || bookingData.time,
    barber: params.originalBarber as string || bookingData.barber,
  } : null;

  const handleCancelBooking = () => {
    // Compute dynamic cancellation policy details before showing modal
    try {
      const start = parseAppointmentStart(bookingData.date, bookingData.time);
      const cancelBy = new Date(start.getTime() - cnwHours * 60 * 60 * 1000);
      setCancelByText(formatFullDateTime(cancelBy));

      const now = new Date();
      const late = now > cancelBy;
      setIsLateCancel(late);

      const priceNumber = parsePrice(bookingData.price);
      const deposit = round2(priceNumber * (dpPercent / 100));
      setDepositAmount(deposit);
    } catch {
      // Fallback: keep defaults
    }

    setShowCancelModal(true);
    setActionType('cancel');
  };

  const handleRescheduleBooking = () => {
    // Check if booking already has a pending reschedule request
    if (bookingData.status === 'pending_reschedule') {
      setShowRescheduleWarning(true);
      return;
    }
    
    // Navigate to barber selection for rescheduling
    // Pass ALL booking data to preserve it through the reschedule flow
    router.push({
      pathname: '/(customer)/all-barbers',
      params: {
        salonName: bookingData.salon,
        salonImage: bookingData.salonImage,
        selectedService: bookingData.service,
        rescheduleBookingId: bookingData.id,
        source: 'reschedule',
        currentBarber: bookingData.barber,
        originalDate: bookingData.date,
        originalTime: bookingData.time,
        originalBarber: bookingData.barber,
        // Pass booking details to preserve them
        bookingPrice: bookingData.price,
        bookingLocation: bookingData.location,
        bookingPhone: bookingData.phone,
        bookingDuration: bookingData.duration,
      }
    });
  };

  const confirmCancel = () => {
    // TODO: Call API to cancel booking
    console.log('Cancelling booking:', bookingData.id);
    if (isLateCancel && depositAmount > 0) {
      console.log(`Late cancellation: retaining deposit $${depositAmount.toFixed(2)}`);
    } else {
      console.log('On-time cancellation: no fee; deposit refundable if previously collected');
    }
    
    setShowCancelModal(false);
    setShowSuccessModal(true);
    
    // Navigate back with cancelled status after showing success
    setTimeout(() => {
      setShowSuccessModal(false);
      // Pass the cancelled booking data back to my-bookings
      // Use replace instead of push to clear any old params
      router.replace({
        pathname: '/(customer)/my-bookings',
        params: {
          cancelledBooking: JSON.stringify({
            id: bookingData.id,
            status: 'cancelled',
          })
        }
      });
    }, 2000);
  };

  const handleTextSalon = () => {
    // Navigate to in-app chat with booking context
    router.push({
      pathname: '/(customer)/chat',
      params: {
        name: `${bookingData.barber} - ${bookingData.salon}`,
        profileImage: bookingData.salonImage,
        bookingId: bookingData.id,
        bookingDate: bookingData.date,
        bookingTime: bookingData.time,
        bookingService: bookingData.service,
        bookingStatus: bookingData.status,
        salonName: bookingData.salon,
        barberName: bookingData.barber,
        phone: bookingData.phone,
      }
    });
  };

  const handleGetDirections = () => {
    // TODO: Open maps with salon location
    Alert.alert('Get Directions', `Opening directions to ${bookingData.location}`);
  };

  const canCancel = bookingData.status === 'confirmed' || bookingData.status === 'pending';

  // Load CNW and DP preferences
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cnw, dp] = await Promise.all([getCancellationHours(), getDepositPercentage()]);
        if (mounted) {
          setCnwHours(cnw);
          setDpPercent(dp);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Helpers for datetime and price
  function parseAppointmentStart(dateStr: string, timeStr: string): Date {
    // Attempt robust parsing by combining strings
    // Example inputs: "January 25, 2025" + "9:30 AM"
    const dt = new Date(`${dateStr} ${timeStr}`);
    if (!isNaN(dt.getTime())) return dt;
    // Fallback: try localized parsing
    return new Date(dateStr);
  }

  function parsePrice(priceStr: string): number {
    const cleaned = (priceStr || '').replace(/[^0-9.]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  function round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  function formatFullDateTime(d: Date): string {
    try {
      return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {
      return d.toISOString();
    }
  }

  const handleConfirmReschedule = () => {
    // TODO: Call API to confirm reschedule
    console.log('Confirming reschedule for booking:', bookingData.id);
    
    setActionType('reschedule');
    setRequestSentTime(new Date());
    setShowRescheduleModal(false);
    setShowSuccessModal(true);
    
    // Navigate back to my-bookings with updated status after showing success
    setTimeout(() => {
      setShowSuccessModal(false);
      // Pass ALL booking data with updated fields
      // Use replace instead of push to clear any old params
      router.replace({
        pathname: '/(customer)/my-bookings',
        params: {
          rescheduledBooking: JSON.stringify({
            id: bookingData.id,
            service: bookingData.service,
            salon: bookingData.salon,
            barber: bookingData.barber, // Updated barber
            date: bookingData.date, // Updated date
            time: bookingData.time, // Updated time
            price: bookingData.price, // Keep original price
            status: 'pending_reschedule',
            salonImage: bookingData.salonImage, // Keep original image
            location: bookingData.location, // Keep original location
            phone: bookingData.phone, // Keep original phone
            duration: bookingData.duration, // Keep original duration
            originalDate: originalBooking?.date,
            originalTime: originalBooking?.time,
            originalBarber: originalBooking?.barber,
          })
        }
      });
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
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(bookingData.status) }]}>
          <View style={styles.statusContent}>
            <Ionicons 
              name={getStatusIcon(bookingData.status) as any} 
              size={24} 
              color="#FFF" 
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>{capitalizeFirst(bookingData.status)}</Text>
              <Text style={styles.statusSubtitle}>
                {bookingData.status === 'confirmed' && 'Your appointment is confirmed'}
                {bookingData.status === 'pending' && 'Waiting for confirmation'}
                {bookingData.status === 'pending_reschedule' && (
                  'Waiting for salon confirmation of your reschedule request'
                )}
                {bookingData.status === 'cancelled' && 'This booking was cancelled'}
              </Text>
            </View>
          </View>
        </View>

        {/* Salon Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image source={{ uri: bookingData.salonImage }} style={styles.salonImage} />
            <View style={styles.salonInfo}>
              <Text style={styles.salonName}>{bookingData.salon}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.locationText}>{bookingData.location}</Text>
              </View>
            </View>
          </View>
          
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTextSalon}>
              <Ionicons name="chatbubble-outline" size={20} color="#000" />
              <Text style={styles.actionText}>Text</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
              <Ionicons name="navigate-outline" size={20} color="#000" />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="person-outline" size={20} color="#666" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Barber / Stylist</Text>
              <Text style={styles.detailValue}>{bookingData.barber}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="cut-outline" size={20} color="#666" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{bookingData.service}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{bookingData.date}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color="#666" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{bookingData.time}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="timer-outline" size={20} color="#666" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{bookingData.duration}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="cash-outline" size={20} color="#666" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={[styles.detailValue, styles.priceText]}>{bookingData.price}</Text>
            </View>
          </View>
        </View>

        {/* Hair Preferences Card */}
        <View style={styles.card}>
          <View style={styles.preferenceTitleRow}>
            <Ionicons name="images-outline" size={20} color="#000" />
            <Text style={styles.cardTitle}>Preferences</Text>
          </View>
          
          {hairPreferences.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.preferencesContainer}
            >
              {hairPreferences.map((pref, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.preferenceItem}
                  onPress={() => {
                    setSelectedImage(pref.uri);
                    setShowFullImageModal(true);
                  }}
                >
                  <Image source={{ uri: pref.uri }} style={styles.preferenceImage} />
                  {pref.isVideo && (
                    <View style={styles.playButtonOverlay}>
                      <Ionicons name="play" size={16} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noPreferencesContainer}>
              <Ionicons name="images-outline" size={28} color="#ccc" />
              <Text style={styles.noPreferencesText}>No preferences added yet</Text>
              <Text style={styles.noPreferencesSubtext}>Add photos to show your barber what you want</Text>
              <TouchableOpacity
                style={styles.addFirstPreferenceButton}
                onPress={() => setShowAddPreferenceModal(true)}
              >
                <Ionicons name="add" size={16} color="#000" />
                <Text style={styles.addFirstPreferenceText}>Add Preference</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Booking ID */}
        <View style={styles.bookingIdCard}>
          <Text style={styles.bookingIdLabel}>Booking ID</Text>
          <Text style={styles.bookingIdValue}>{bookingData.id}</Text>
        </View>

        {/* Reschedule Comparison View */}
        {isRescheduleReview && originalBooking && (
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Reschedule Summary</Text>
            
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonColumn}>
                <Text style={styles.comparisonLabel}>Current</Text>
                <Text style={styles.comparisonDate}>{formatDate(originalBooking.date)}</Text>
                <Text style={styles.comparisonTime}>{formatTime(originalBooking.time)}</Text>
                <Text style={styles.comparisonBarber}>{originalBooking.barber}</Text>
              </View>
              
              <View style={styles.comparisonArrow}>
                <Ionicons name="arrow-forward" size={24} color="#03A100" />
              </View>
              
              <View style={styles.comparisonColumn}>
                <Text style={styles.comparisonLabel}>Requested</Text>
                <Text style={[styles.comparisonDate, styles.comparisonNew]}>{formatDate(bookingData.date)}</Text>
                <Text style={[styles.comparisonTime, styles.comparisonNew]}>{formatTime(bookingData.time)}</Text>
                <Text style={[styles.comparisonBarber, styles.comparisonNew]}>{bookingData.barber}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Important Information */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.infoTitle}>Important Information</Text>
          </View>
          <Text style={styles.infoText}>
            {isRescheduleReview 
              ? `• Your reschedule request will be sent to the salon for confirmation\n• You will be notified once the salon confirms or rejects your request\n• Your original appointment remains confirmed until this change is approved`
              : `• Please arrive 10 minutes before your appointment\n• Late arrivals may result in reduced service time\n• Cancellation must be made at least 24 hours in advance\n• Contact the salon directly for any changes`}
          </Text>
        </View>

        {/* Action Buttons */}
        {isRescheduleReview ? (
          <>
            <TouchableOpacity 
              style={[styles.actionButtonFull, styles.confirmButton]} 
              onPress={() => setShowRescheduleModal(true)}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.confirmButtonText}>Confirm Reschedule</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButtonFull, styles.cancelButton]} 
              onPress={() => {
                // Navigate back through the reschedule flow to return to my-bookings
                // We need to go back: ActiveBookingDetails -> all-slots -> all-barbers -> my-bookings
                router.back(); // Back to all-slots
              }}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FFF" />
              <Text style={styles.cancelButtonText}>Cancel Changes</Text>
            </TouchableOpacity>
          </>
        ) : canCancel && (
          <>
            <TouchableOpacity 
              style={[styles.actionButtonFull, styles.rescheduleButton]} 
              onPress={handleRescheduleBooking}
            >
              <Ionicons name="calendar-outline" size={20} color="#FFF" />
              <Text style={styles.rescheduleButtonText}>Reschedule Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButtonFull, styles.cancelButton]} 
              onPress={handleCancelBooking}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FFF" />
              <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Appointment?</Text>
            <Text style={styles.modalMessage}>
              {`Free cancellation window: ${cnwHours} hour(s) before start.\n`}
              {`Cancel by: ${cancelByText || '—'}`}
            </Text>
            <View style={{ backgroundColor: '#F8F8F8', padding: 10, borderRadius: 8, marginBottom: 16 }}>
              {isLateCancel ? (
                <Text style={[styles.modalMessage, { marginBottom: 0 }]}>
                  {dpPercent > 0
                    ? `This is a late cancellation. A ${dpPercent}% deposit ($${depositAmount.toFixed(2)}) will be retained.`
                    : 'This is a late cancellation. A fee may apply.'}
                </Text>
              ) : (
                <Text style={[styles.modalMessage, { marginBottom: 0 }]}>
                  {dpPercent > 0
                    ? `This is within the free window. Your ${dpPercent}% deposit will be refunded.`
                    : 'This is within the free window. No fee will be charged.'}
                </Text>
              )}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Keep Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]} 
                onPress={confirmCancel}
              >
                <Text style={styles.modalButtonConfirmText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Confirmation Modal */}
      <Modal visible={showRescheduleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Reschedule Request?</Text>
            <Text style={styles.modalMessage}>
              You're requesting to reschedule from:{'\n'}{'\n'}
              • {originalBooking?.date} at {originalBooking?.time} with {originalBooking?.barber}{'\n'}{'\n'}
              To:{'\n'}{'\n'}
              • {bookingData.date} at {bookingData.time} with {bookingData.barber}{'\n'}{'\n'}
              This request will be sent to the salon for confirmation. You'll be notified once they respond.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowRescheduleModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]} 
                onPress={handleConfirmReschedule}
              >
                <Text style={styles.modalButtonConfirmText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Warning Modal */}
      <Modal visible={showRescheduleWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule Already Pending</Text>
            <Text style={styles.modalMessage}>
              You already have a reschedule request pending for this appointment. Please wait for the salon to respond before making another request.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]} 
                onPress={() => setShowRescheduleWarning(false)}
              >
                <Text style={styles.modalButtonConfirmText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Ionicons name="checkmark-circle" size={64} color="#03A100" />
            <Text style={styles.successTitle}>
              {actionType === 'cancel' ? 'Booking Cancelled' : 'Reschedule Requested'}
            </Text>
            <Text style={styles.successMessage}>
              {actionType === 'cancel' 
                ? (isLateCancel
                    ? (dpPercent > 0
                      ? `Cancelled. Deposit $${depositAmount.toFixed(2)} retained per policy.`
                      : 'Cancelled. Late cancellation fee may apply.')
                    : (dpPercent > 0
                      ? 'Cancelled. Your deposit will be refunded.'
                      : 'Cancelled successfully.'))
                : 'Your reschedule request has been sent. Waiting for salon confirmation.'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Add Preference Modal */}
      <Modal visible={showAddPreferenceModal} transparent animationType="slide">
        <TouchableOpacity 
          activeOpacity={1}
          style={styles.addPreferenceModalOverlay}
          onPress={() => setShowAddPreferenceModal(false)}
        >
          <View style={styles.addPreferenceModal}>
            <View style={styles.addPreferenceModalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Preference</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowAddPreferenceModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Choose how you want to show your barber the style you want</Text>
            
            <View style={styles.preferenceOptionsContainer}>
              <TouchableOpacity
                style={styles.preferenceOptionButton}
                onPress={() => {
                  // TODO: Implement image picker
                  Alert.alert('Coming Soon', 'Image picker will be implemented here');
                  setShowAddPreferenceModal(false);
                }}
                >
                <View style={styles.preferenceIconContainer}>
                  <Ionicons name="image" size={40} color="#000" />
                </View>
                <Text style={styles.preferenceOptionText}>Photo</Text>
                <Text style={styles.preferenceOptionDescription}>From gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.preferenceOptionButton}
                onPress={() => {
                  // TODO: Implement video picker
                  Alert.alert('Coming Soon', 'Video picker will be implemented here');
                  setShowAddPreferenceModal(false);
                }}
                >
                <View style={styles.preferenceIconContainer}>
                  <Ionicons name="videocam" size={40} color="#000" />
                </View>
                <Text style={styles.preferenceOptionText}>Video</Text>
                <Text style={styles.preferenceOptionDescription}>Record or select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full Image Viewer Modal */}
      <Modal visible={showFullImageModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.fullImageCloseButton}
            onPress={() => setShowFullImageModal(false)}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

// Helper Functions
const getStatusColor = (status: string): string => {
  // Use centralized status colors
  return BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS] || '#666';
};

const getStatusIcon = (status: string): string => {
  // Use centralized status icons
  return BOOKING_STATUS_ICONS[status as keyof typeof BOOKING_STATUS_ICONS] || 'help-circle';
};

const capitalizeFirst = (str: string): string => {
  if (str === 'pending_reschedule') {
    return 'Pending Reschedule';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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
  statusBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.9,
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
    marginBottom: 16,
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
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginLeft: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#03A100',
  },
  bookingIdCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  bookingIdLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  bookingIdValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
  },
  actionButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  rescheduleButton: {
    backgroundColor: '#000',
  },
  rescheduleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: '#03A100',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonCancelText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    backgroundColor: '#FF3B30',
  },
  modalButtonConfirmText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
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
  comparisonCard: {
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
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comparisonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  comparisonDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  comparisonTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  comparisonBarber: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  comparisonNew: {
    color: '#03A100',
    fontWeight: 'bold',
  },
  comparisonArrow: {
    marginHorizontal: 16,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addPreferenceButton: {
    padding: 4,
  },
  preferencesContainer: {
    paddingVertical: 4,
  },
  preferenceItem: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  preferenceImage: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPreferencesContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noPreferencesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  noPreferencesSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  addFirstPreferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addFirstPreferenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  addPreferenceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addPreferenceModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  addPreferenceModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  preferenceOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  preferenceOptionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    gap: 6,
    marginHorizontal: 4,
  },
  preferenceIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  preferenceOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  preferenceOptionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalCancelButton: {
    marginTop: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  fullImageCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
});
