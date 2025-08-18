import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Generate calendar data for the next 30 days
const generateCalendarData = () => {
  const calendar = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const isToday = i === 0;
    const isTomorrow = i === 1;
    
    // Generate random slot availability
    const availableSlots = Math.floor(Math.random() * 8) + 2; // 2-9 slots
    const isAvailable = availableSlots > 0;
    
    calendar.push({
      id: i,
      date: date,
      dayName,
      dayNumber,
      monthName,
      isToday,
      isTomorrow,
      availableSlots,
      isAvailable,
    });
  }
  
  return calendar;
};

// Generate time slots for a selected date
const generateTimeSlots = (date: Date) => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 19; // 7 PM
  const interval = 30; // 30 minutes
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = new Date(date);
      time.setHours(hour, minute, 0, 0);
      
      // Randomly make some slots available
      const isAvailable = Math.random() > 0.3;
      
      slots.push({
        time: time.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        isAvailable,
        price: `$${Math.floor(Math.random() * 20) + 25}`, // $25-$45
      });
    }
  }
  
  return slots.filter(slot => slot.isAvailable);
};

export default function AllSlotsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<number>(1); // Tomorrow by default
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const barberName = params.name as string || 'Shark.11';
  const barberPhoto = params.photo as string || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center';
  const salonName = params.salonName as string || "Man's Cave Salon";
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  
  const calendarData = generateCalendarData();
  const selectedDateData = calendarData[selectedDate];
  const timeSlots = generateTimeSlots(selectedDateData.date);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(selectedTime === time ? null : time);
  };

  const handleBookAppointment = () => {
    if (selectedTime) {
      router.push({
        pathname: '/booking-confirmation',
        params: {
          barberName: barberName,
          barberPhoto: barberPhoto,
          salonName: salonName,
          selectedDate: selectedDateData.date.toDateString(),
          selectedTime: selectedTime,
          selectedService: selectedService,
          selectedServiceLabel: selectedServiceLabel,
          selectedServicesJson: selectedService ? JSON.stringify([{ key: selectedService, label: selectedServiceLabel }]) : '',
          source: 'all-slots'
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Slots</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Barber Info */}
      <View style={styles.barberInfoContainer}>
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

      {/* Calendar */}
      <View style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarContainer}
        >
          {calendarData.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.calendarDay,
                selectedDate === day.id && styles.selectedCalendarDay
              ]}
              onPress={() => setSelectedDate(day.id)}
            >
              <Text style={[
                styles.dayName,
                selectedDate === day.id && styles.selectedDayText
              ]}>
                {day.dayName}
              </Text>
              <Text style={[
                styles.dayNumber,
                selectedDate === day.id && styles.selectedDayText
              ]}>
                {day.dayNumber}
              </Text>
              <Text style={[
                styles.monthName,
                selectedDate === day.id && styles.selectedDayText
              ]}>
                {day.monthName}
              </Text>
              {day.isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>Today</Text>
                </View>
              )}
              {day.isTomorrow && (
                <View style={styles.tomorrowBadge}>
                  <Text style={styles.tomorrowText}>Tomorrow</Text>
                </View>
              )}
              <Text style={[
                styles.slotCount,
                !day.isAvailable && styles.noSlotsText
              ]}>
                {day.isAvailable ? `${day.availableSlots} slots` : 'No slots'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Slots */}
      <View style={styles.timeSection}>
        <Text style={styles.sectionTitle}>
          Available Times for {selectedDateData.dayName}, {selectedDateData.monthName} {selectedDateData.dayNumber}
        </Text>
        <ScrollView 
          style={styles.timeSlotsContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.timeGrid}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTime === slot.time && styles.selectedTimeSlot
                ]}
                onPress={() => handleTimeSelect(slot.time)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === slot.time && styles.selectedTimeText
                ]}>
                  {slot.time}
                </Text>
                <Text style={[
                  styles.priceText,
                  selectedTime === slot.time && styles.selectedPriceText
                ]}>
                  {slot.price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Book Button */}
      {selectedTime && (
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.8}
            onPress={handleBookAppointment}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.bookButtonText}>
              Book Appointment at {selectedTime}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  barberInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  barberPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  barberDetails: {
    flex: 1,
  },
  barberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  salonName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  calendarSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  calendarContainer: {
    paddingHorizontal: 8,
  },
  calendarDay: {
    width: 80,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 6,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCalendarDay: {
    borderColor: '#FF6B00',
    backgroundColor: '#fff8f0',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  monthName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  selectedDayText: {
    color: '#FF6B00',
  },
  todayBadge: {
    backgroundColor: '#03A100',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  todayText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  tomorrowBadge: {
    backgroundColor: '#FF8A00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  tomorrowText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  slotCount: {
    fontSize: 10,
    color: '#03A100',
    fontWeight: '500',
  },
  noSlotsText: {
    color: '#999',
  },
  timeSection: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTimeSlot: {
    borderColor: '#FF6B00',
    backgroundColor: '#fff8f0',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  selectedTimeText: {
    color: '#FF6B00',
  },
  priceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedPriceText: {
    color: '#FF6B00',
  },
  bookButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 