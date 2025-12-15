import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { customerAPI } from '../../services/api/customerAPI';
import { getMaxAdvanceDays } from '../../services/preferences/bookingPreferences';
import { CalendarDay, TimeSlot } from '../../services/mock/AppMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


export default function AllSlotsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // API state
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<number>(1); // Tomorrow by default
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slotCounts, setSlotCounts] = useState<{ [dateId: number]: number }>({});
  const [cachedSlots, setCachedSlots] = useState<{ [dateId: number]: TimeSlot[] }>({});
  const [maxAdvanceDays, setMaxAdvanceDaysState] = useState<number>(30);

  // Event handlers - must be defined before any conditional logic
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(selectedTime === time ? null : time);
  }, [selectedTime]);

  const handleDateSelect = useCallback((dateId: number) => {
    setSelectedDate(dateId);
    setSelectedTime(null); // Clear selected time when changing dates
  }, []);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting to load calendar data...');
        setLoading(true);
        setHasError(false);
        
        // First, try to load calendar data
        let calendarDataResponse;
        try {
          calendarDataResponse = await customerAPI.getCalendarDays();
          console.log('Calendar data loaded:', calendarDataResponse.length, 'days');
        } catch (error) {
          console.error('Error loading calendar data:', error);
          setErrorMessage(`Failed to load calendar: ${error.message || error}`);
          setHasError(true);
          throw error;
        }
        
        setCalendarData(calendarDataResponse);
        
        // Load actual slot counts for all dates and cache the data
        const slotCountsMap: { [dateId: number]: number } = {};
        const cachedSlotsMap: { [dateId: number]: TimeSlot[] } = {};
        
        // Load slots for first 7 days only to avoid overwhelming the API
        const daysToLoad = calendarDataResponse.slice(0, 7);
        for (const day of daysToLoad) {
          try {
            console.log(`Loading slots for date ${day.id} (${day.dayName})...`);
            const timeSlots = await customerAPI.getTimeSlotsForDate(day.date);
            console.log(`Loaded ${timeSlots.length} slots for date ${day.id}`);
            slotCountsMap[day.id] = timeSlots.length;
            cachedSlotsMap[day.id] = timeSlots; // Cache the slot data
          } catch (error) {
            console.error(`Error loading slots for date ${day.id}:`, error);
            slotCountsMap[day.id] = 0;
            cachedSlotsMap[day.id] = [];
          }
        }
        
        // Set default values for remaining days
        for (let i = 7; i < calendarDataResponse.length; i++) {
          const day = calendarDataResponse[i];
          slotCountsMap[day.id] = 0;
          cachedSlotsMap[day.id] = [];
        }
        
        setSlotCounts(slotCountsMap);
        setCachedSlots(cachedSlotsMap);
        
        // Set initial selected date to tomorrow and load its slots from cache
        const tomorrow = calendarDataResponse.find(day => day.isTomorrow);
        if (tomorrow) {
          console.log('Setting initial date to tomorrow:', tomorrow.id);
          setSelectedDate(tomorrow.id);
          setTimeSlots(cachedSlotsMap[tomorrow.id] || []);
          console.log('Initial slots set:', cachedSlotsMap[tomorrow.id]?.length || 0);
        }
        console.log('Data loading completed successfully');
      } catch (error) {
        console.error('Error loading calendar data:', error);
        setErrorMessage(`Loading failed: ${error.message || error}`);
        setHasError(true);
        // Set empty data on error to prevent infinite loading
        setCalendarData([]);
        setSlotCounts({});
        setCachedSlots({});
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load Max Advance Booking preference
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const days = await getMaxAdvanceDays();
        if (mounted) setMaxAdvanceDaysState(days);
      } catch {
        // keep default
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load time slots when date changes (using cached data)
  useEffect(() => {
    if (calendarData.length > 0) {
      const selectedDay = calendarData.find(day => day.id === selectedDate);
      if (selectedDay) {
        // Use cached data if available, otherwise fetch it
        if (cachedSlots[selectedDay.id] && cachedSlots[selectedDay.id].length > 0) {
          setTimeSlots(cachedSlots[selectedDay.id]);
          console.log(`Date changed to ${selectedDay.dayName}: ${cachedSlots[selectedDay.id].length} slots`);
        } else {
          // Fallback: fetch data if not cached
          const fetchSlots = async () => {
            try {
              console.log(`Fetching slots for ${selectedDay.dayName}...`);
              const timeSlots = await customerAPI.getTimeSlotsForDate(selectedDay.date);
              setTimeSlots(timeSlots);
              // Update cache
              setCachedSlots(prev => ({
                ...prev,
                [selectedDay.id]: timeSlots
              }));
              console.log(`Fetched ${timeSlots.length} slots for ${selectedDay.dayName}`);
            } catch (error) {
              console.error('Error fetching slots:', error);
              setTimeSlots([]);
            }
          };
          fetchSlots();
        }
      }
    }
  }, [selectedDate, calendarData, cachedSlots]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading time slots...</Text>
        <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          Calendar: {calendarData.length} days, Cached: {Object.keys(cachedSlots).length} slots
        </Text>
      </SafeAreaView>
    );
  }

  // Show error state if no data loaded
  if (calendarData.length === 0 || hasError) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={{ fontSize: 18, color: '#666', marginTop: 16 }}>Failed to load calendar data</Text>
        {errorMessage && (
          <Text style={{ fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
            {errorMessage}
          </Text>
        )}
        <TouchableOpacity 
          style={{ marginTop: 16, padding: 12, backgroundColor: '#FF6B6B', borderRadius: 8 }}
          onPress={() => {
            setLoading(true);
            // Reload data
            const loadData = async () => {
              try {
                const calendarDataResponse = await customerAPI.getCalendarDays();
                setCalendarData(calendarDataResponse);
                
                const slotCountsMap: { [dateId: number]: number } = {};
                const cachedSlotsMap: { [dateId: number]: TimeSlot[] } = {};
                for (const day of calendarDataResponse) {
                  try {
                    const timeSlots = await customerAPI.getTimeSlotsForDate(day.date);
                    slotCountsMap[day.id] = timeSlots.length;
                    cachedSlotsMap[day.id] = timeSlots;
                  } catch (error) {
                    console.error(`Error loading slots for date ${day.id}:`, error);
                    slotCountsMap[day.id] = 0;
                    cachedSlotsMap[day.id] = [];
                  }
                }
                setSlotCounts(slotCountsMap);
                setCachedSlots(cachedSlotsMap);
                
                const tomorrow = calendarDataResponse.find(day => day.isTomorrow);
                if (tomorrow) {
                  setSelectedDate(tomorrow.id);
                  setTimeSlots(cachedSlotsMap[tomorrow.id] || []);
                }
              } catch (error) {
                console.error('Error reloading data:', error);
              } finally {
                setLoading(false);
              }
            };
            loadData();
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const barberName = params.barberName as string || params.name as string || 'Shark.11';
  const barberPhoto = params.barberPhoto as string || params.photo as string || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center';
  const salonName = params.salonName as string || "Man's Cave Salon";
  const selectedService = params.selectedService as string;
  const selectedServiceLabel = params.selectedServiceLabel as string;
  const selectedServicesJson = params.selectedServicesJson as string;
  const rescheduleBookingId = params.rescheduleBookingId as string;
  const source = params.source as string;
  
  const selectedDateData = calendarData.find(day => day.id === selectedDate);

  const handleBookAppointment = () => {
    if (selectedTime && selectedDateData) {
      if (source === 'reschedule') {
        // Navigate to reschedule review screen with original booking details
        router.push({
          pathname: '/(customer)/ActiveBookingDetails',
          params: {
            id: rescheduleBookingId,
            barber: barberName,
            barberImage: barberPhoto,
            date: selectedDateData.date.toDateString(),
            time: selectedTime,
            service: selectedService,
            salon: salonName,
            rescheduleReview: 'true',
            source: 'reschedule',
            // Include original booking details for comparison
            originalDate: params.originalDate as string || '',
            originalTime: params.originalTime as string || '',
            originalBarber: params.originalBarber as string || '',
            // Pass ALL booking data to preserve it
            price: params.bookingPrice as string || '$45.00',
            salonImage: params.salonImage as string || DEFAULT_SALON_IMAGE,
            location: params.bookingLocation as string || '9785, 132St, Vancouver',
            phone: params.bookingPhone as string || '(555) 123-4567',
            duration: params.bookingDuration as string || '45 min',
          }
        });
      } else {
        // Navigate to booking confirmation for new booking
        router.push({
          pathname: '/(customer)/booking-confirmation',
          params: {
            barberName: barberName,
            barberPhoto: barberPhoto,
            salonName: salonName,
            selectedDate: selectedDateData.date.toDateString(),
            selectedTime: selectedTime,
            selectedService: selectedService,
            selectedServiceLabel: selectedServiceLabel,
            selectedServicesJson: selectedServicesJson || (selectedService ? JSON.stringify([{ key: selectedService, label: selectedServiceLabel }]) : ''),
            source: 'all-slots'
          }
        });
      }
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
          <Ionicons name="chevron-back" size={28} color="#000" />
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
          {calendarData.slice(0, Math.min(maxAdvanceDays + 1, calendarData.length)).map((day) => {
            const today = new Date();
            today.setHours(0,0,0,0);
            const dayStart = new Date(day.date);
            dayStart.setHours(0,0,0,0);
            const diffDays = Math.round((dayStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isBeyond = diffDays > maxAdvanceDays;
            const disabledStyle = isBeyond ? { opacity: 0.35 } : null;
            return (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.calendarDay,
                selectedDate === day.id && styles.selectedCalendarDay,
                disabledStyle
              ]}
              onPress={() => {
                if (isBeyond) {
                  alert(`You can book up to ${maxAdvanceDays} day(s) in advance.`);
                  return;
                }
                handleDateSelect(day.id);
              }}
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
              <View style={styles.slotBadge}>
                <Text style={[
                  styles.slotCount,
                  !day.isAvailable && styles.noSlotsText
                ]}>
                  {day.isAvailable ? `${slotCounts[day.id] || 0}` : '0'}
                </Text>
              </View>
            </TouchableOpacity>
          )})}
        </ScrollView>
      </View>

      {/* Time Slots */}
      <View style={styles.timeSection}>
        <Text style={styles.sectionTitle}>
          Available Times for {selectedDateData.dayName}, {selectedDateData.monthName} {selectedDateData.dayNumber}
        </Text>
        <Text style={styles.slotsCount}>
          {timeSlots.length} slot{timeSlots.length !== 1 ? 's' : ''} available
        </Text>
        
        {timeSlots.length === 0 ? (
          <View style={styles.noSlotsContainer}>
            <Ionicons name="time-outline" size={48} color="#ccc" />
            <Text style={styles.noSlotsTitle}>No Available Slots</Text>
            <Text style={styles.noSlotsMessage}>
              Sorry, there are no available time slots for this date. Please try selecting a different date.
            </Text>
          </View>
        ) : (
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
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Book Button */}
      {selectedTime && (
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.8}
            onPress={handleBookAppointment}
          >
            <Text style={styles.bookButtonText}>
              Book Appointment
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
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  calendarContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  calendarDay: {
    width: 65,
    height: 75,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
    marginHorizontal: 4,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCalendarDay: {
    borderColor: '#FF6B00',
    borderWidth: 2,
    backgroundColor: '#fff8f0',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dayName: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 1,
  },
  monthName: {
    fontSize: 9,
    color: '#888',
    marginBottom: 3,
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FF6B00',
  },
  slotBadge: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  slotCount: {
    fontSize: 9,
    color: '#03A100',
    fontWeight: '600',
  },
  noSlotsText: {
    color: '#ccc',
  },
  timeSection: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  slotsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  noSlotsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noSlotsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noSlotsMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
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
    backgroundColor: '#000',
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
  },
}); 