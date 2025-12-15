import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
}

interface Barber {
  id: string;
  name: string;
  image: string;
  rating: number;
  specialization: string;
}

interface PromotionBookingModalProps {
  visible: boolean;
  onClose: () => void;
  promotionData: {
    id: string;
    salonName: string;
    salonImage: string;
    offerTitle: string;
    offerDescription: string;
    discount: string;
    code: string;
    category: string;
    rating: string;
  };
  initialStep?: 'barber' | 'services' | 'datetime';
}

export default function PromotionBookingModal({ visible, onClose, promotionData, initialStep = 'barber' }: PromotionBookingModalProps) {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showBarberPicker, setShowBarberPicker] = useState(false);
  const [step, setStep] = useState<'barber' | 'services' | 'datetime'>(initialStep);

  // Mock services data - in real app, this would come from API
  const availableServices: Service[] = [
    { id: '1', name: 'Haircut', price: '$25', duration: '30 min' },
    { id: '2', name: 'Beard Trim', price: '$15', duration: '15 min' },
    { id: '3', name: 'Haircut & Beard Trim', price: '$35', duration: '45 min' },
    { id: '4', name: 'Fade & Design', price: '$30', duration: '40 min' },
    { id: '5', name: 'Hair Wash', price: '$10', duration: '10 min' },
    { id: '6', name: 'Styling', price: '$20', duration: '20 min' },
  ];

  // Mock barbers data - in real app, this would come from API
  const availableBarbers: Barber[] = [
    { id: '1', name: 'Alex Johnson', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rating: 4.9, specialization: 'Haircut & Styling' },
    { id: '2', name: 'Mike Chen', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', rating: 4.8, specialization: 'Beard & Mustache' },
    { id: '3', name: 'David Wilson', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', rating: 4.7, specialization: 'Fade & Design' },
    { id: '4', name: 'James Brown', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rating: 4.9, specialization: 'All Services' },
  ];

  // Mock time slots
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  ];

  // Initialize with services based on promotion category
  useEffect(() => {
    if (promotionData.category) {
      const relevantServices = availableServices.filter(service => {
        const category = promotionData.category.toLowerCase();
        if (category === 'all services') return true;
        if (category === 'haircut') return service.name.toLowerCase().includes('haircut');
        if (category === 'beard') return service.name.toLowerCase().includes('beard');
        return service.name.toLowerCase().includes(category);
      });
      
      if (relevantServices.length > 0) {
        setSelectedServices([relevantServices[0].id]);
      }
    }
  }, [promotionData.category]);

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarber(barberId);
    setShowBarberPicker(false);
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContinue = () => {
    if (step === 'barber' && !selectedBarber) {
      Alert.alert('No Barber Selected', 'Please select a barber to continue.');
      return;
    }
    if (step === 'services' && selectedServices.length === 0) {
      Alert.alert('No Services Selected', 'Please select at least one service to continue.');
      return;
    }
    if (step === 'barber') {
      setStep('services');
    } else if (step === 'services') {
      setStep('datetime');
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowTimePicker(false);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please select both date and time.');
      return;
    }

    // Get selected service details
    const services = selectedServices.map(id => 
      availableServices.find(s => s.id === id)
    ).filter(Boolean) as Service[];

    // Get selected barber details
    const barber = availableBarbers.find(b => b.id === selectedBarber);

    // Calculate discount
    const subtotal = services.reduce((total, service) => {
      return total + parseFloat(service.price.replace('$', ''));
    }, 0);

    // Apply promotion discount
    let discountAmount = 0;
    let discountType = '';
    
    if (promotionData.discount.includes('%')) {
      const percentage = parseFloat(promotionData.discount.replace('% OFF', ''));
      discountAmount = (subtotal * percentage) / 100;
      discountType = `${percentage}% OFF`;
    } else if (promotionData.discount.includes('FREE')) {
      // For free services, find the matching service and set its price to 0
      const freeService = services.find(s => 
        promotionData.discount.toLowerCase().includes(s.name.toLowerCase())
      );
      if (freeService) {
        discountAmount = parseFloat(freeService.price.replace('$', ''));
        discountType = 'FREE SERVICE';
      }
    }

    // Navigate to booking confirmation with promotion data
    const params = {
      barberName: barber?.name || '',
      barberPhoto: barber?.image || '',
      salonName: promotionData.salonName,
      selectedDate: selectedDate,
      selectedTime: selectedTime,
      selectedService: services[0]?.name || '',
      selectedServiceLabel: services[0]?.name || '',
      selectedServicesJson: JSON.stringify(services.map(s => ({ key: s.id, label: s.name }))),
      source: 'promotion',
      selectedPromotionId: promotionData.id,
      promotionCode: promotionData.code,
      promotionTitle: promotionData.offerTitle,
      promotionDiscount: promotionData.discount,
      discountAmount: discountAmount.toString(),
      discountType: discountType,
    };

    onClose();
    router.push({ pathname: '/(customer)/booking-confirmation', params });
  };

  const handleBack = () => {
    if (step === 'services') {
      setStep('barber');
    } else if (step === 'datetime') {
      setStep('services');
    } else {
      onClose();
    }
  };

  const getSelectedServicesTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      return total + (service ? parseFloat(service.price.replace('$', '')) : 0);
    }, 0);
  };

  const renderBarberStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Barber</Text>
      <Text style={styles.stepSubtitle}>Choose your preferred barber for this appointment</Text>
      
      <ScrollView style={styles.barbersList} showsVerticalScrollIndicator={false}>
        {availableBarbers.map((barber) => (
          <TouchableOpacity
            key={barber.id}
            style={[
              styles.barberRow,
              selectedBarber === barber.id && styles.barberRowSelected
            ]}
            onPress={() => handleBarberSelect(barber.id)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: barber.image }} style={styles.barberImage} />
            <View style={styles.barberInfo}>
              <Text style={styles.barberName}>{barber.name}</Text>
              <Text style={styles.barberSpecialization}>{barber.specialization}</Text>
              <View style={styles.barberRating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.barberRatingText}>{barber.rating}</Text>
              </View>
            </View>
            <View style={[
              styles.barberCheckbox,
              selectedBarber === barber.id && styles.barberCheckboxSelected
            ]}>
              {selectedBarber === barber.id && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueBtn,
          !selectedBarber && styles.continueBtnDisabled
        ]}
        onPress={handleContinue}
        disabled={!selectedBarber}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderServicesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Services</Text>
      <Text style={styles.stepSubtitle}>Choose the services you'd like to book</Text>
      
      {/* Promotion Info */}
      <View style={styles.promotionInfo}>
        <View style={styles.promotionBadge}>
          <Ionicons name="gift" size={16} color="#fff" />
          <Text style={styles.promotionBadgeText}>{promotionData.discount}</Text>
        </View>
        <Text style={styles.promotionTitle}>{promotionData.offerTitle}</Text>
        <Text style={styles.promotionDescription}>{promotionData.offerDescription}</Text>
      </View>
      
      <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
        {availableServices.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceRow,
              selectedServices.includes(service.id) && styles.serviceRowSelected
            ]}
            onPress={() => handleServiceToggle(service.id)}
            activeOpacity={0.7}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={styles.serviceDetails}>
                <Text style={styles.servicePrice}>{service.price}</Text>
                <Text style={styles.serviceDuration}>• {service.duration}</Text>
              </View>
            </View>
            <View style={[
              styles.serviceCheckbox,
              selectedServices.includes(service.id) && styles.serviceCheckboxSelected
            ]}>
              {selectedServices.includes(service.id) && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedServices.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Total: ${getSelectedServicesTotal().toFixed(2)}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.continueBtn,
          selectedServices.length === 0 && styles.continueBtnDisabled
        ]}
        onPress={handleContinue}
        disabled={selectedServices.length === 0}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDateTimeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      <Text style={styles.stepSubtitle}>Choose when you'd like your appointment</Text>
      
      {/* Date Selection */}
      <View style={styles.selectionContainer}>
        <Text style={styles.selectionLabel}>Date</Text>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.selectionButtonText}>
            {selectedDate || 'Select Date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Time Selection */}
      <View style={styles.selectionContainer}>
        <Text style={styles.selectionLabel}>Time</Text>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.selectionButtonText}>
            {selectedTime || 'Select Time'}
          </Text>
          <Ionicons name="time-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.confirmBtn,
          (!selectedDate || !selectedTime) && styles.confirmBtnDisabled
        ]}
        onPress={handleConfirmBooking}
        disabled={!selectedDate || !selectedTime}
      >
        <Text style={styles.confirmBtnText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'barber': return 'Select Barber';
      case 'services': return 'Select Services';
      case 'datetime': return 'Select Date & Time';
      default: return 'Book Appointment';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{getStepTitle()}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Salon & Promotion Info */}
          <View style={styles.bookingInfo}>
            <Image source={{ uri: promotionData.salonImage }} style={styles.salonImage} />
            <View style={styles.bookingDetails}>
              <Text style={styles.salonName}>{promotionData.salonName}</Text>
              <View style={styles.promotionBadge}>
                <Ionicons name="gift" size={14} color="#fff" />
                <Text style={styles.promotionBadgeText}>{promotionData.discount}</Text>
              </View>
            </View>
          </View>

          {/* Step Content */}
          {step === 'barber' && renderBarberStep()}
          {step === 'services' && renderServicesStep()}
          {step === 'datetime' && renderDateTimeStep()}

          {/* Date Picker Modal */}
          <Modal
            visible={showDatePicker}
            animationType="slide"
            transparent
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerContent}>
                  {Array.from({ length: 30 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const dateString = date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    return (
                      <TouchableOpacity
                        key={i}
                        style={styles.dateOption}
                        onPress={() => handleDateSelect(dateString)}
                      >
                        <Text style={styles.dateOptionText}>{dateString}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Time Picker Modal */}
          <Modal
            visible={showTimePicker}
            animationType="slide"
            transparent
            onRequestClose={() => setShowTimePicker(false)}
          >
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Time</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerContent}>
                  <View style={styles.timeGrid}>
                    {timeSlots.map((time, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeOption,
                          selectedTime === time && styles.timeOptionSelected
                        ]}
                        onPress={() => handleTimeSelect(time)}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          selectedTime === time && styles.timeOptionTextSelected
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  salonImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  bookingDetails: {
    flex: 1,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  promotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  promotionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  promotionInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  barbersList: {
    flex: 1,
    marginBottom: 16,
  },
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
  },
  barberRowSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  barberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  barberInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  barberSpecialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  barberRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  barberCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barberCheckboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  servicesList: {
    flex: 1,
    marginBottom: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceRowSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  serviceCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCheckboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  totalContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  continueBtn: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectionContainer: {
    marginBottom: 24,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
  },
  selectionButtonText: {
    fontSize: 16,
    color: '#000',
  },
  confirmBtn: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  confirmBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  pickerContent: {
    maxHeight: 300,
  },
  dateOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#000',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  timeOption: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    margin: '1.5%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#000',
  },
  timeOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
