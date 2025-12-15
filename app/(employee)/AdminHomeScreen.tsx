import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { employeeAPI } from '../../services/api/employeeAPI';
import { Barber, Day, EmployeeAppointment, AdminAppointment } from '../../services/mock/AppMockData';
import { useAppointments } from '../../contexts/AppointmentContext';
import { getStoreHoursForDay, getTimelineRange, timeStringToDecimalHour } from '../../services/storeHours';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AdminHomeScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenuPopup, setShowMenuPopup] = useState(false);

  // Get appointments from context
  const { appointments } = useAppointments();

  // API state
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [appointments_api, setAppointments] = useState<EmployeeAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // API state for admin appointments
  const [adminAppointments, setAdminAppointments] = useState<AdminAppointment[]>([]);

  // Generate current week dates
  const generateCurrentWeek = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const weekDays = [];
    
    // Helper function to format date in local time (avoid timezone issues)
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - currentDayOfWeek + i);
      
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      
      weekDays.push({
        day: dayNames[i],
        date: date.getDate().toString(),
        fullDate: formatLocalDate(date), // YYYY-MM-DD format in local time
        isToday: i === currentDayOfWeek
      });
    }
    
    return weekDays;
  };

  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // Current day selected by default
  const [weekDays, setWeekDays] = useState(generateCurrentWeek());

  // Refresh function for loading appointments
  const loadAdminAppointments = useCallback(async () => {
    try {
      // Refresh weekDays and selectedDay first
      const today = new Date();
      const todayDayIndex = today.getDay();
      const newWeekDays = generateCurrentWeek();
      setWeekDays(newWeekDays);
      setSelectedDay(todayDayIndex);
      
      const appointmentsData = await employeeAPI.getAdminAppointments();
      
      // Convert context appointments to admin format and merge with mock data
      const contextAppointments = (appointments || []).map((apt: any) => {
        // Parse start and end times from 24-hour format strings like "13:00" or "09:15"
        // IMPORTANT: These are stored as plain strings in "HH:MM" format from AddClientScreen
        const startTimeStr = String(apt.startTime || '0:00').trim();
        const endTimeStr = String(apt.endTime || '0:00').trim();
        
        // Debug: Log what we're receiving
        console.log('🔍 Parsing appointment time:', {
          customerName: apt.customerName,
          rawStartTime: apt.startTime,
          rawEndTime: apt.endTime,
          startTimeStr: startTimeStr,
          endTimeStr: endTimeStr
        });
        
        const startTimeParts = startTimeStr.split(':');
        const endTimeParts = endTimeStr.split(':');
        
        // Extract hour and minute, ensure we have valid numbers
        const startHourNum = parseInt(startTimeParts[0] || '0', 10);
        const startMinuteNum = parseInt(startTimeParts[1] || '0', 10);
        const endHourNum = parseInt(endTimeParts[0] || '0', 10);
        const endMinuteNum = parseInt(endTimeParts[1]?.split(/[\s-]/)[0] || '0', 10); // Handle cases where endTime might have extra characters
        
        // Validate hours are in valid 24-hour range (0-23)
        let finalStartHour = startHourNum;
        let finalEndHour = endHourNum;
        
        if (startHourNum > 23 || startHourNum < 0) {
          console.warn('⚠️ Invalid hour detected:', startHourNum, 'for appointment:', apt.customerName);
          finalStartHour = Math.max(0, Math.min(23, startHourNum % 24));
        }
        if (endHourNum > 23 || endHourNum < 0) {
          finalEndHour = Math.max(0, Math.min(23, endHourNum % 24));
        }
        
        // Convert everything to minutes from midnight (e.g., 11:30 = 690 minutes, 13:00 = 780 minutes)
        const startTimeMinutes = finalStartHour * 60 + startMinuteNum;
        const endTimeMinutes = finalEndHour * 60 + endMinuteNum;
        
        // Debug: Log the parsed values
        console.log('📊 Parsed time values:', {
          customerName: apt.customerName,
          parsedStartHour: finalStartHour,
          parsedStartMinute: startMinuteNum,
          startTimeMinutes: startTimeMinutes,
          expectedTime: `${finalStartHour}:${String(startMinuteNum).padStart(2, '0')}`
        });
        
        // Calculate duration in minutes
        const durationMinutes = apt.duration || Math.max(0, endTimeMinutes - startTimeMinutes);
        
        // Parse ID - handle both numeric and string IDs
        let appointmentId: number;
        if (typeof apt.id === 'number') {
          appointmentId = apt.id;
        } else if (typeof apt.id === 'string') {
          // Try to extract number from string ID like "customer_1234567890"
          const numericId = parseInt(apt.id.replace(/[^0-9]/g, '')) || apt.id.charCodeAt(0) * 1000 + apt.id.length;
          appointmentId = numericId;
        } else {
          appointmentId = Math.random() * 1000000;
        }
        
        // Format time for display (convert 24-hour to 12-hour format)
        // This must match exactly what the user entered in AddClientScreen
        const formatTimeForDisplay = (hour24: number, minute: number) => {
          // Ensure hour24 is in valid range (0-23)
          const validHour = Math.max(0, Math.min(23, hour24 % 24));
          const validMinute = Math.max(0, Math.min(59, minute));
          
          // Convert 24-hour to 12-hour format
          let hour12: number;
          let ampm: string;
          
          if (validHour === 0) {
            // Midnight (00:xx) -> 12:xx AM
            hour12 = 12;
            ampm = 'AM';
          } else if (validHour === 12) {
            // Noon (12:xx) -> 12:xx PM
            hour12 = 12;
            ampm = 'PM';
          } else if (validHour > 12) {
            // Afternoon (13:xx - 23:xx) -> 1:xx PM - 11:xx PM
            hour12 = validHour - 12;
            ampm = 'PM';
          } else {
            // Morning (1:xx - 11:xx) -> 1:xx AM - 11:xx AM
            hour12 = validHour;
            ampm = 'AM';
          }
          
          return `${hour12}:${String(validMinute).padStart(2, '0')} ${ampm}`;
        };
        
        const displayStartTime = formatTimeForDisplay(finalStartHour, startMinuteNum);
        const displayEndTime = formatTimeForDisplay(finalEndHour, endMinuteNum);
        const displayTimeString = `${displayStartTime}-${displayEndTime}`;
        
        // Debug: Log the time conversion to verify it matches what user entered
        console.log('🕐 AdminHomeScreen Time Conversion:', {
          customerName: apt.customerName,
          receivedFromContext: {
            rawStartTime: apt.startTime,
            rawEndTime: apt.endTime,
            typeOfStartTime: typeof apt.startTime
          },
          parsedValues: {
            startHourNum: startHourNum,
            startMinuteNum: startMinuteNum,
            finalStartHour: finalStartHour
          },
          parsed24Hour: {
            start: `${finalStartHour}:${String(startMinuteNum).padStart(2, '0')}`,
            end: `${finalEndHour}:${String(endMinuteNum).padStart(2, '0')}`
          },
          converted12Hour: {
            start: displayStartTime,
            end: displayEndTime
          },
          finalDisplay: displayTimeString
        });
        
        // Build validated appointment object with required fields
        const validatedAppointment = {
          id: appointmentId,
          clientName: apt.customerName || '',
          customerName: apt.customerName || '',
          phone: apt.customerPhone || '',
          customerEmail: apt.customerEmail || '', // Include email for client information screen
          originalId: apt.id, // Preserve original Appointment ID for updates
          service: apt.serviceName || '',
          customerPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
          date: apt.date, // YYYY-MM-DD format
          time: displayTimeString, // Display string in 12-hour format (e.g., "3:45 PM-4:45 PM")
          barber: apt.employeeName || '',
          // CRITICAL: startTime and endTime are stored as MINUTES from midnight (e.g., 945 for 3:45 PM, 555 for 9:15 AM)
          startTime: startTimeMinutes, // Minutes from midnight (e.g., 945 for 15:45 = 3:45 PM)
          endTime: endTimeMinutes, // Minutes from midnight
          durationMinutes: durationMinutes, // Duration in minutes for height calculation
          status: apt.status as any || 'pending',
          statusIcon: apt.status === 'confirmed' ? '✅' : apt.status === 'pending' ? '⏳' : apt.status === 'cancelled' ? '❌' : '💳',
          statusText: apt.status === 'confirmed' ? 'Confirmed' : apt.status === 'pending' ? 'Pending' : apt.status === 'cancelled' ? 'Cancelled' : 'Unpaid'
        };
        
        return validatedAppointment;
      });
      
      // Merge mock data with context appointments, avoiding duplicates
      // Create a map to track appointments by a unique key
      const appointmentMap = new Map<string, any>();
      
      // Add mock appointments first (key by id when available to avoid duplicates)
      appointmentsData.forEach((apt: any) => {
        const key = String(apt.id ?? `${apt.date}_${apt.customerName}_${apt.time}`);
        appointmentMap.set(key, apt);
      });
      
      // Add context appointments, overriding duplicates (prefer context data)
      contextAppointments.forEach((apt: any) => {
        const key = String(apt.id ?? `${apt.date}_${apt.customerName}_${apt.time}`);
        appointmentMap.set(key, apt);
      });
      
      const merged = Array.from(appointmentMap.values());
      setAdminAppointments(merged);
    } catch (error) {
      console.error('Error loading admin appointments:', error);
    }
  }, [appointments]);

  // Load appointments on mount and when appointments change
  useEffect(() => {
    loadAdminAppointments();
  }, [loadAdminAppointments]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAdminAppointments();
    }, [loadAdminAppointments])
  );

  // Data is now loaded from API

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [barbersData, daysData, timeSlotsData, appointmentsData] = await Promise.all([
          employeeAPI.getBarbers(),
          employeeAPI.getDays(),
          employeeAPI.getTimeSlots(),
          employeeAPI.getAppointments()
        ]);
        
        setBarbers(barbersData);
        setDays(daysData);
        setTimeSlots(timeSlotsData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error loading admin home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    router.replace('/Login');
  };

  const handleAddAppointment = () => {
    // Navigate to add appointment screen
    console.log('Add new appointment');
  };

  const handleClientInfo = (appointment: AdminAppointment) => {
    // Navigate to ClientInformationScreen with client data
    router.push({
      pathname: '/ClientInformationScreen',
      params: {
        id: String((appointment as any).originalId || appointment.id || ''),
        name: appointment.customerName || appointment.clientName || '',
        phone: appointment.phone || '',
        email: (appointment as any).customerEmail || '',
        avatar: appointment.customerPhoto || 'https://randomuser.me/api/portraits/men/32.jpg',
        service: appointment.service || '',
        staff: appointment.barber || '',
        startTime: appointment.time ? appointment.time.split('-')[0].trim() : '',
        endTime: appointment.time ? appointment.time.split('-')[1]?.trim() : '',
        date: appointment.date || '',
        status: appointment.status || 'pending',
        clientNotes: (appointment as any).notes || '',
      }
    });
  };

  // Update current time every minute and refresh week if needed
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      setCurrentTime(newTime);
      
      // Check if the date has changed
      const currentDay = newTime.getDay();
      if (currentDay !== selectedDay) {
        setSelectedDay(currentDay);
        setWeekDays(generateCurrentWeek());
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [selectedDay]);

  // Generate timeline based on business hours for the selected day
  const generateTimelineSlots = () => {
    // Get store hours for the selected day
    const dayHours = getStoreHoursForDay(selectedDay);
    
    // If day is closed or no hours, use overall timeline range
    const timelineRange = getTimelineRange();
    const openHour = dayHours ? Math.floor(dayHours.open) : Math.floor(timelineRange.earliestOpen);
    const closeHour = dayHours ? Math.ceil(dayHours.close) : Math.ceil(timelineRange.latestClose);
    
    const slots = [];
    
    // Include the closing hour in the timeline (use <= instead of <)
    for (let hour = openHour; hour <= closeHour; hour++) {
      // Convert 24-hour format to 12-hour format with AM/PM
      // Ensure the label matches the actual hour value
      let hourLabel: string;
      if (hour === 0) {
        hourLabel = '12 AM'; // Midnight
      } else if (hour === 12) {
        hourLabel = '12 PM'; // Noon
      } else if (hour > 12) {
        hourLabel = `${hour - 12} PM`; // Afternoon (1 PM - 11 PM)
      } else {
        hourLabel = `${hour} AM`; // Morning (1 AM - 11 AM)
      }
      
      slots.push({
        hour,
        hourLabel,
        fullHour: hour
      });
    }
    
    return slots;
  };

  // Calculate top position for appointment card based on exact time (minute-based pixel calculation)
  const calculateCardPosition = (appointment: AdminAppointment) => {
    // IMPORTANT: Positioning must use the SAME day basis as the rendered timeline.
    // We filter appointments to the selected day above, so always use selectedDay here.
    // This avoids UTC parsing drift (e.g., YYYY-MM-DD → previous day) shifting store hours by 1 hour.
    const dayHours = getStoreHoursForDay(selectedDay);
    const timelineRange = getTimelineRange();
    
    // CRITICAL: Use the SAME integer hour calculation as generateTimelineSlots()
    // Timeline slots use Math.floor(openHour), so we must match that exactly
    const openHourDecimal = dayHours ? dayHours.open : timelineRange.earliestOpen;
    const closeHourDecimal = dayHours ? dayHours.close : timelineRange.latestClose;
    
    // Use integer hours to match timeline slot generation
    const openHourInteger = Math.floor(openHourDecimal); // e.g., 9.0 -> 9
    const closeHourInteger = Math.ceil(closeHourDecimal); // e.g., 20.0 -> 20
    
    // Convert integer hours to minutes for precise calculation (matching timeline slots)
    const openMinutes = openHourInteger * 60; // e.g., 9 * 60 = 540 minutes
    const closeMinutes = closeHourInteger * 60; // e.g., 20 * 60 = 1200 minutes
    const totalMinutes = closeMinutes - openMinutes; // Total range in minutes
    
    // Parse appointment start time to minutes
    // CRITICAL: Prioritize the display time string (appointment.time) since it matches what user sees
    let startTimeMinutes = 0;
    
    // Priority 1: Parse from time display string (MOST RELIABLE - matches what user sees on card)
    if (appointment.time) {
      const timeStr = appointment.time;
      const startTimePart = timeStr.split('-')[0].trim();
      
      // Try 12-hour format first (e.g., "3:45 PM")
      const timeMatch12 = startTimePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch12) {
        let hour = parseInt(timeMatch12[1], 10);
        const minute = parseInt(timeMatch12[2], 10);
        const ampm = timeMatch12[3]?.toUpperCase();
        
        // Convert 12-hour to 24-hour format
        if (ampm === 'PM' && hour !== 12) {
          hour += 12;
        } else if (ampm === 'AM' && hour === 12) {
          hour = 0;
        }
        
        startTimeMinutes = hour * 60 + minute;
        console.log('✅ Parsed from display time (12-hour):', timeStr, '→', startTimeMinutes, 'minutes (', hour, ':', minute, ')');
      } else {
        // Try 24-hour format (e.g., "14:00")
        const timeMatch24 = startTimePart.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch24) {
          const hour = parseInt(timeMatch24[1], 10);
          const minute = parseInt(timeMatch24[2], 10);
          startTimeMinutes = hour * 60 + minute;
          console.log('✅ Parsed from display time (24-hour):', timeStr, '→', startTimeMinutes, 'minutes (', hour, ':', minute, ')');
        } else {
          console.warn('⚠️ Could not parse display time string:', startTimePart);
        }
      }
    }
    // Priority 2: Use startTime if it's already a number (fallback if no display time)
    else if (typeof appointment.startTime === 'number' && !isNaN(appointment.startTime) && appointment.startTime >= 0) {
      console.log('⚠️ Using numeric startTime (no display time available):', appointment.startTime);
      // If startTime is less than 1440 (24 hours in minutes), it's already in minutes
      if (appointment.startTime < 1440) {
        startTimeMinutes = appointment.startTime; // Already in minutes
        console.log('✅ Using as minutes:', startTimeMinutes, `= ${Math.floor(startTimeMinutes / 60)}:${startTimeMinutes % 60}`);
      } else if (appointment.startTime < 24) {
        // If it's less than 24, it's likely decimal hours (e.g., 10.5 for 10:30 AM)
        startTimeMinutes = Math.round(appointment.startTime * 60);
        console.log('✅ Converting decimal hours to minutes:', appointment.startTime, 'hours =', startTimeMinutes, 'minutes');
      } else {
        // If it's already >= 1440, it might be incorrectly stored - try to handle it
        startTimeMinutes = appointment.startTime;
        console.log('⚠️ Using large number as-is:', startTimeMinutes);
      }
    }
    // Priority 3: Parse from startTime string
    else {
      const startTimeStr = String(appointment.startTime || '');
      const timeMatch = startTimeStr.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1], 10);
        const minute = parseInt(timeMatch[2], 10);
        startTimeMinutes = hour * 60 + minute;
      }
    }
    
    // Calculate minutes from store open time
    // Use integer hour to match timeline slot generation exactly
    const minutesFromOpen = startTimeMinutes - openMinutes;
    
    // Convert minutes to pixels: 2 pixels per minute (120px per hour / 60 minutes)
    // Each hour slot is 120px tall, with the hour marker at the TOP of each slot
    // So for 2:00 PM (14:00 = 840 minutes) when store opens at 9:00 AM (540 minutes):
    // minutesFromOpen = 840 - 540 = 300 minutes
    // topPosition = 300 * 2 = 600 pixels
    // This should place it at the 2 PM marker (slot index 5: 9,10,11,12,1,2 = 5 * 120 = 600px)
    const pixelPerMinute = 2;
    const topPosition = minutesFromOpen * pixelPerMinute;
    
    // Debug logging to help diagnose positioning issues
    const displayHour = Math.floor(startTimeMinutes / 60);
    const displayMinute = startTimeMinutes % 60;
    const hourSlotIndex = Math.floor(minutesFromOpen / 60);
    const expectedSlotIndex = displayHour - openHourInteger;
    
    console.log('📍 Position Calculation:', {
      customer: appointment.customerName || appointment.clientName,
      rawStartTime: appointment.startTime,
      displayTimeString: appointment.time,
      parsedMinutes: startTimeMinutes,
      displayTime24Hour: `${displayHour}:${String(displayMinute).padStart(2, '0')}`,
      storeOpenInteger: openHourInteger,
      storeOpenMinutes: openMinutes,
      storeOpenFormatted: `${openHourInteger}:00`,
      minutesFromOpen: minutesFromOpen,
      calculatedTopPosition: topPosition,
      hourSlotIndex: hourSlotIndex,
      expectedSlotIndex: expectedSlotIndex,
      expectedPixelPosition: expectedSlotIndex * 120,
      verification: `${displayHour}:00 should be at slot ${expectedSlotIndex} = ${expectedSlotIndex * 120}px, calculated: ${topPosition}px`
    });
    
    return Math.max(0, topPosition); // Ensure non-negative
  };

  // Calculate card height based on duration (all in minutes)
  // Formula: Card Height (px) = Duration Minutes × 2px
  const calculateCardHeight = (appointment: AdminAppointment) => {
    const pixelPerMinute = 2; // 2 pixels per minute (120px per hour)
    let durationMinutes = 0;
    
    // Priority 1: Use durationMinutes if available (most reliable)
    if ((appointment as any).durationMinutes && typeof (appointment as any).durationMinutes === 'number') {
      durationMinutes = (appointment as any).durationMinutes;
    }
    // Priority 2: Calculate from start and end time (both in minutes)
    else if (typeof appointment.startTime === 'number' && typeof appointment.endTime === 'number') {
      // Both are in minutes from midnight
      let startMinutes = appointment.startTime < 1440 ? appointment.startTime : appointment.startTime * 60;
      let endMinutes = appointment.endTime < 1440 ? appointment.endTime : appointment.endTime * 60;
      durationMinutes = Math.max(endMinutes - startMinutes, 30); // Minimum 30 minutes
    }
    // Priority 3: Parse from time string
    else if (appointment.time) {
      const parts = appointment.time.split('-');
      const startPart = parts[0]?.trim() || '';
      const endPart = parts[1]?.trim() || '';
      
      // Parse start time
      const startMatch12 = startPart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      let startMinutes = 0;
      if (startMatch12) {
        let hour = parseInt(startMatch12[1], 10);
        const minute = parseInt(startMatch12[2], 10);
        const ampm = startMatch12[3]?.toUpperCase();
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        startMinutes = hour * 60 + minute;
      } else {
        const startMatch24 = startPart.match(/(\d{1,2}):(\d{2})/);
        if (startMatch24) {
          startMinutes = parseInt(startMatch24[1], 10) * 60 + parseInt(startMatch24[2], 10);
        }
      }
      
      // Parse end time
      const endMatch12 = endPart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      let endMinutes = 0;
      if (endMatch12) {
        let hour = parseInt(endMatch12[1], 10);
        const minute = parseInt(endMatch12[2], 10);
        const ampm = endMatch12[3]?.toUpperCase();
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        endMinutes = hour * 60 + minute;
      } else {
        const endMatch24 = endPart.match(/(\d{1,2}):(\d{2})/);
        if (endMatch24) {
          endMinutes = parseInt(endMatch24[1], 10) * 60 + parseInt(endMatch24[2], 10);
        }
      }
      
      durationMinutes = Math.max(endMinutes - startMinutes, 30);
    }
    
    const cardHeight = durationMinutes * pixelPerMinute;
    return Math.max(cardHeight, 80); // Minimum height of 80px
  };

  // Get current hour for highlighting
  const getCurrentHour = () => {
    return currentTime.getHours();
  };

  // Calculate current time position in pixels (for the red timeline indicator)
  const getCurrentTimePosition = () => {
    const today = new Date();
    const todayDayIndex = today.getDay();
    
    // Check if today is selected (selectedDay is 0-6, where 0 = Sunday)
    const isTodaySelected = selectedDay === todayDayIndex;
    
    if (!isTodaySelected) {
      console.log('Current time indicator: Not showing - not viewing today. selectedDay:', selectedDay, 'todayDayIndex:', todayDayIndex);
      return null; // Don't show current time indicator if not viewing today
    }

    // Get current time in minutes from midnight
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentMinutesFromMidnight = currentHour * 60 + currentMinute;

    // Get store hours for today
    const storeHours = getStoreHoursForDay(todayDayIndex);
    if (!storeHours) {
      console.log('Current time indicator: Not showing - store hours not available');
      return null; // Store hours not available for today
    }
    const openHourDecimal = storeHours.open;
    const openHourInteger = Math.floor(openHourDecimal);
    const openMinutesFromIntegerHour = (openHourDecimal - openHourInteger) * 60;
    const openMinutes = openHourInteger * 60 + openMinutesFromIntegerHour;

    // Calculate position
    const minutesFromOpen = currentMinutesFromMidnight - openMinutes;
    const pixelPerMinute = 2;
    const topPosition = minutesFromOpen * pixelPerMinute;

    // Only show if current time is within store hours
    const closeHourDecimal = storeHours.close;
    const closeHourInteger = Math.floor(closeHourDecimal);
    const closeMinutesFromIntegerHour = (closeHourDecimal - closeHourInteger) * 60;
    const closeMinutes = closeHourInteger * 60 + closeMinutesFromIntegerHour;

    if (currentMinutesFromMidnight < openMinutes || currentMinutesFromMidnight > closeMinutes) {
      console.log('Current time indicator: Not showing - outside store hours', {
        currentMinutesFromMidnight,
        openMinutes,
        closeMinutes
      });
      return null; // Current time is outside store hours
    }

    console.log('Current time indicator: Position calculated', {
      currentTime: `${currentHour}:${currentMinute}`,
      topPosition,
      minutesFromOpen,
      openMinutes,
      closeMinutes
    });

    return topPosition;
  };

  // Filter barbers based on search
  const filteredBarbers = barbers?.filter(barber => 
    barber.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#28A745'; // Green
      case 'pending': return '#E0E0E0'; // Light gray
      case 'cancelled': return '#DC3545'; // Red
      case 'unpaid': return '#FFA500'; // Orange
      default: return '#E0E0E0';
    }
  };

  // Get text color based on status
  const getTextColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#FFFFFF'; // White text on green
      case 'pending': return '#6C6C6C'; // Dark gray text on light gray
      case 'cancelled': return '#FFFFFF'; // White text on red
      case 'unpaid': return '#FFFFFF'; // White text on orange
      default: return '#6C6C6C';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search barbers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => router.push('/AppointmentsScreen')}
          >
            <Ionicons 
              name="calendar-outline" 
              size={24} 
              color="#000000" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => router.push('/AddClientScreen')}
          >
            <Ionicons name="notifications-outline" size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => setShowMenuPopup(true)}
          >
            <Ionicons name="menu-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>


      {/* Upcoming Customer Queue */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerQueue}>
        <View style={styles.profilesContainer}>
          {adminAppointments
            .filter(apt => {
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              const normalize = (dateStr: string) => {
                if (!dateStr) return '';
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
                try {
                  const d = new Date(dateStr);
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                } catch { return dateStr; }
              };
              return normalize(apt.date) === todayStr;
            })
            .sort((a, b) => {
              const timeA = parseInt(a.time.replace(':', '').replace('AM', '').replace('PM', ''));
              const timeB = parseInt(b.time.replace(':', '').replace('AM', '').replace('PM', ''));
              return timeA - timeB;
            })
            .slice(0, 10)
            .map((appointment) => (
              <TouchableOpacity key={appointment.id} style={styles.customerCard}>
                <Image source={{ uri: appointment.customerPhoto }} style={styles.customerAvatar} />
                <Text style={styles.customerName}>{appointment.customerName}</Text>
              </TouchableOpacity>
            ))}
          {adminAppointments.filter(apt => {
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const normalize = (dateStr: string) => {
              if (!dateStr) return '';
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
              try {
                const d = new Date(dateStr);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              } catch { return dateStr; }
            };
            return normalize(apt.date) === todayStr;
          }).length === 0 && (
            <View style={styles.noAppointmentsContainer}>
              <Text style={styles.noAppointmentsText}>No upcoming appointments</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        <View style={styles.dayContainer}>
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayItem,
                selectedDay === index && styles.selectedDay,
                day.isToday && !(selectedDay === index) && styles.todayIndicator
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[
                styles.dayText,
                selectedDay === index && styles.selectedDayText
              ]}>
                {day.day}
              </Text>
              <Text style={[
                styles.dateText,
                selectedDay === index && styles.selectedDateText
              ]}>
                {day.date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Appointment Cards Section */}
      <View style={styles.timelineContainer}>
        <ScrollView 
          style={styles.timelineScroll}
          showsVerticalScrollIndicator={true}
        >
          <View style={[styles.timelineInner, {
            minHeight: (() => {
              const dayHours = getStoreHoursForDay(selectedDay);
              const timelineRange = getTimelineRange();
              const openHour = dayHours ? Math.floor(dayHours.open) : Math.floor(timelineRange.earliestOpen);
              const closeHour = dayHours ? Math.ceil(dayHours.close) : Math.ceil(timelineRange.latestClose);
              // Number of hour slots including both start and end (e.g., 9 AM to 8 PM = 12 slots: 9,10,11,12,1,2,3,4,5,6,7,8)
              const numberOfSlots = (closeHour - openHour) + 1;
              return numberOfSlots * 120; // Each slot is 120px
            })()
          }]}>
            {/* Time slots based on store hours for selected day */}
            {generateTimelineSlots().map((slot) => {
              return (
                <View 
                  key={`hour-${slot.hour}`} 
                  style={styles.timeSlot}
                >
                  {/* Time Label */}
                  <Text style={styles.timeLabel}>
                    {slot.hourLabel}
                  </Text>

                  {/* Time Divider */}
                  <View style={styles.timeDivider} />

                  {/* Appointments Container - Empty space for positioning */}
                  <View style={styles.appointmentsContainer} />
                </View>
              );
            })}

            {/* Current Time Indicator - Thin red line with dot at exact current time */}
            {(() => {
              const currentTimePosition = getCurrentTimePosition();
              console.log('Rendering current time indicator. Position:', currentTimePosition);
              if (currentTimePosition === null || currentTimePosition < 0) {
                console.log('Not rendering current time indicator - position is null or negative');
                return null;
              }
              console.log('Rendering current time indicator at top:', currentTimePosition);
              return (
                <View style={[styles.currentTimeLineContainer, { top: currentTimePosition }]}>
                  {/* Small dot at the top */}
                  <View style={styles.currentTimeDot} />
                  {/* Thin horizontal line spanning the appointments area */}
                  <View style={styles.currentTimeLine} />
                </View>
              );
            })()}
            <View style={[styles.absoluteAppointmentsContainer, {
              minHeight: (() => {
                const dayHours = getStoreHoursForDay(selectedDay);
                const timelineRange = getTimelineRange();
                const openHour = dayHours ? Math.floor(dayHours.open) : Math.floor(timelineRange.earliestOpen);
                const closeHour = dayHours ? Math.ceil(dayHours.close) : Math.ceil(timelineRange.latestClose);
                // Number of hour slots including both start and end
                const numberOfSlots = (closeHour - openHour) + 1;
                return numberOfSlots * 120; // Match timelineInner height
              })()
            }]}>
              {(adminAppointments || [])
                .filter(apt => {
                  // Check if appointment has all required fields
                  if (!apt.date || !apt.startTime || !apt.endTime || !apt.customerName || !apt.time || !apt.barber) {
                    return false;
                  }
                  
                  // Filter by selected day
                  const selectedDate = weekDays[selectedDay]?.fullDate;
                  const aptDateStr = apt.date;
                  
                  // Normalize dates for comparison (handle YYYY-MM-DD format)
                  const normalizeDate = (dateStr: string) => {
                    if (!dateStr) return '';
                    // If date is already in YYYY-MM-DD format, return as-is
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                      return dateStr;
                    }
                    // Otherwise try to parse and format using local time (avoid timezone issues)
                    try {
                      const date = new Date(dateStr);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    } catch {
                      return dateStr;
                    }
                  };
                  
                  const normalizedAptDate = normalizeDate(aptDateStr);
                  const normalizedSelectedDate = normalizeDate(selectedDate || '');
                  const matches = normalizedAptDate === normalizedSelectedDate;
                  
                  // Debug log for date matching
                  if (apt.customerName) {
                    console.log('📅 AdminHomeScreen Date Filter:', {
                      customerName: apt.customerName,
                      appointmentDate: aptDateStr,
                      normalizedAppointmentDate: normalizedAptDate,
                      selectedDateFromWeek: selectedDate,
                      normalizedSelectedDate: normalizedSelectedDate,
                      matches: matches,
                      selectedDayIndex: selectedDay
                    });
                  }
                  
                  return matches;
                })
                .sort((a, b) => {
                  // Sort by start time to handle overlapping appointments
                  const timeA = typeof a.startTime === 'number' ? a.startTime : 0;
                  const timeB = typeof b.startTime === 'number' ? b.startTime : 0;
                  return timeA - timeB;
                })
                .map((apt, index, filteredArray) => {
                  const topPosition = calculateCardPosition(apt);
                  const cardHeight = calculateCardHeight(apt);
                  
                  // Smart overlap detection: Check if appointments overlap in time (not just position)
                  const sameTimeAppointments = filteredArray.filter((otherApt, otherIndex) => {
                    if (otherIndex >= index) return false;
                    
                    // Check if appointments actually overlap in time (both in minutes)
                    const otherStart = typeof otherApt.startTime === 'number' 
                      ? (otherApt.startTime < 1440 ? otherApt.startTime : otherApt.startTime * 60)
                      : 0;
                    const otherEnd = typeof otherApt.endTime === 'number'
                      ? (otherApt.endTime < 1440 ? otherApt.endTime : otherApt.endTime * 60)
                      : 0;
                    const currentStart = typeof apt.startTime === 'number'
                      ? (apt.startTime < 1440 ? apt.startTime : apt.startTime * 60)
                      : 0;
                    const currentEnd = typeof apt.endTime === 'number'
                      ? (apt.endTime < 1440 ? apt.endTime : apt.endTime * 60)
                      : 0;
                    
                    // Overlap if: otherStart < currentEnd && otherEnd > currentStart
                    if (otherStart > 0 && otherEnd > 0 && currentStart > 0 && currentEnd > 0) {
                      return otherStart < currentEnd && otherEnd > currentStart;
                    }
                    
                    // Fallback to position-based overlap detection (within 5px = ~2.5 minutes)
                    const otherTop = calculateCardPosition(otherApt);
                    const timeDiff = Math.abs(otherTop - topPosition);
                    return timeDiff < 5; // Within 5px
                  });
                  
                  // Calculate width properly for absolute positioning - make cards more compact
                  const containerLeft = 80; // From absoluteAppointmentsContainer left
                  const containerRight = 16; // From absoluteAppointmentsContainer right
                  const screenWidth = SCREEN_WIDTH;
                  const maxCardWidth = screenWidth - containerLeft - containerRight;
                  
                  // Distribute horizontal space equally for overlapping appointments
                  const overlapCount = sameTimeAppointments.length + 1; // +1 includes current appointment
                  const baseCardWidth = maxCardWidth * 0.7;
                  const cardWidth = overlapCount > 1
                    ? (baseCardWidth / overlapCount) * 0.9 // Divide space equally, with small gap
                    : baseCardWidth; // Full width when no overlap
                  const leftOffset = sameTimeAppointments.length > 0 
                    ? (sameTimeAppointments.length * (baseCardWidth / overlapCount))
                    : 0;
                  const sameTimeIndex = sameTimeAppointments.length;
                  
                  // Ensure valid position values
                  const validTop = isNaN(topPosition) ? 0 : Math.max(0, topPosition);
                  const validHeight = isNaN(cardHeight) || cardHeight < 80 ? 80 : cardHeight;
                  const validWidth = isNaN(cardWidth) || cardWidth <= 0 ? baseCardWidth : cardWidth;
                  
                  // ACTION E: Final debugging output for rendered cards
                  if (index === 0 || (apt.customerName && apt.customerName.length > 0)) {
                    console.log('🎨 RENDERING APPOINTMENT CARD:', {
                      customerName: apt.customerName || apt.clientName,
                      id: apt.id,
                      calculatedTop: validTop,
                      calculatedHeight: validHeight,
                      calculatedWidth: validWidth,
                      leftOffset,
                      startTime: apt.startTime,
                      durationMinutes: (apt as any).durationMinutes,
                      sameTimeCount: sameTimeAppointments.length
                    });
                  }
                  
                  return (
                    <TouchableOpacity
                      key={`apt-${apt.id}-${index}`}
                      style={[
                        styles.positionedAppointmentCard,
                        {
                          top: validTop,
                          height: validHeight,
                          backgroundColor: getStatusColor(apt.status),
                          left: leftOffset,
                          width: validWidth,
                          zIndex: 20 + sameTimeIndex, // Higher z-index for later cards in overlap
                          opacity: 1, // Explicitly set opacity
                        }
                      ]}
                      onPress={() => handleClientInfo(apt)}
                    >
                      {/* Customer Name */}
                      <Text style={[
                        styles.appointmentCardCustomer,
                        { color: getTextColor(apt.status) }
                      ]} numberOfLines={1}>
                        {apt.customerName || apt.clientName}
                      </Text>

                      {/* Barber Name */}
                      <Text style={[
                        styles.appointmentCardBarber,
                        { color: getTextColor(apt.status) }
                      ]} numberOfLines={1}>
                        {apt.barber}
                      </Text>

                      {/* Time */}
                      <Text style={[
                        styles.appointmentCardTime,
                        { color: getTextColor(apt.status) }
                      ]} numberOfLines={1}>
                        {apt.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/explore2')}>
          <Ionicons name="search-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleAddAppointment}>
          <Ionicons name="add-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/notification2')}>
          <Ionicons name="chatbubble-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/EmployeeProfileScreen')}>
          <Ionicons name="person-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Menu Popup */}
      <Modal
        visible={showMenuPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuPopup(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuPopup(false)}
        >
          <View style={styles.menuPopup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenuPopup(false);
                router.push('/ClientHistoryScreen');
              }}
            >
              <Ionicons name="time-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenuPopup(false);
                router.push('/ScheduleScreen');
              }}
            >
              <Ionicons name="calendar-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    padding: 8,
    borderRadius: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  dateSelector: {
    maxHeight: SCREEN_HEIGHT * 0.12,
    backgroundColor: '#F8F9FA',
    width: '100%',
  },
  dateContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'flex-start',
  },
  barberItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60,
  },
  daySelector: {
    maxHeight: SCREEN_HEIGHT * 0.1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginTop: 1,
  },
  dayContainer: {
    flexDirection: 'row',
    paddingHorizontal: SCREEN_WIDTH * 0.01,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 12.5,
    width: 25,
    height: 50,
    justifyContent: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.035,
  },
  selectedDay: {
    backgroundColor: '#000000',
    borderRadius: 12.5,
    width: 25,
    height: 50,
  },
  dayText: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: 'bold',
    color: '#6C6C6C',
    marginBottom: SCREEN_HEIGHT * 0.002,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: 'medium',
    color: '#6C6C6C',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  todayIndicator: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  timeGrid: {
    flex: 1,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  timeline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    paddingVertical: 0, // Remove vertical padding to ensure hour markers align exactly at slot boundaries
    alignItems: 'flex-start',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
    minHeight: 120,
  },
  currentTimeLineContainer: {
    position: 'absolute',
    left: 51, // Start just after the time divider line (time label 50px + divider 1px)
    right: 16, // Extend to the right edge (same as appointments container)
    zIndex: 9999, // Very high z-index to ensure it's on top of everything
    pointerEvents: 'none',
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'rgba(255, 0, 0, 0.1)', // Temporary debug background
  },
  currentTimeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    marginRight: 8, // Small gap between dot and line
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  currentTimeLine: {
    flex: 1, // Span the remaining width
    height: 3, // Thin line (3px thick for better visibility)
    backgroundColor: '#FF0000',
    opacity: 0.9,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6C6C6C',
    width: 50,
    textAlign: 'left',
    fontWeight: '500',
    paddingTop: 4,
  },
  timeDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginRight: 16,
    height: '100%',
  },
  appointmentsContainer: {
    flex: 1,
    position: 'relative',
    paddingTop: 0, // Remove padding to ensure alignment with hour markers
  },
  bookingCard: {
    padding: 12,
    borderRadius: 10,
    minHeight: 90,
    minWidth: 180,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    display: 'flex',
  },
  positionedCard: {
    position: 'absolute',
    top: 0,
    width: 160,
    height: 'auto',
    padding: 10,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  statusIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  bookingName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    flex: 0,
    lineHeight: 18,
  },
  bookingPhone: {
    fontSize: 10,
    marginBottom: 3,
    opacity: 0.85,
    lineHeight: 14,
  },
  bookingTime: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 0,
    flex: 0,
    flexShrink: 0,
  },
  bookingMenu: {
    position: 'relative',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  barberBadge: {
    position: 'relative',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 'auto',
  },
  barberBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    gap: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuPopup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  noAppointmentsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAppointmentsText: {
    fontSize: 14,
    color: '#6C6C6C',
    fontStyle: 'italic',
  },
  customerQueue: {
    maxHeight: SCREEN_HEIGHT * 0.15,
    backgroundColor: '#F8F9FA',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 5,
  },
  profilesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerCard: {
    alignItems: 'center',
    marginRight: 10,
  },
  customerAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  customerName: {
    fontSize: 12,
    color: '#6C6C6C',
    textAlign: 'center',
    fontWeight: '500',
  },
  appointmentCardsSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
  },
  appointmentCardRow: {
    justifyContent: 'space-between',
  },
  appointmentCard: {
    width: (SCREEN_WIDTH - 32 - 8) / 2, // Adjust for padding and gap
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  appointmentCardName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  appointmentCardStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentCardPhone: {
    fontSize: 12,
    marginBottom: 5,
  },
  appointmentCardInfo: {
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  appointmentCardLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  appointmentCardTime: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timelineScroll: {
    flex: 1,
  },
  timelineInner: {
    position: 'relative',
    // minHeight will be set dynamically based on store hours
  },
  absoluteAppointmentsContainer: {
    position: 'absolute',
    left: 80, // Start after time label (50px) + divider (1px) + margin (16px) + some padding
    right: 16,
    top: 0,
    // minHeight will be set dynamically based on store hours
    zIndex: 10, // Ensure it's above timeline slots but below modals
  },
  positionedAppointmentCard: {
    position: 'absolute',
    padding: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 80,
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#FFFFFF',
  },
  appointmentCardCustomer: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentCardBarber: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  appointmentsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 4,
    paddingRight: 8,
    gap: 8,
  },
  appointmentsRowScroll: {
    // This style is needed to make the ScrollView scroll horizontally
    // It's not directly applied to the View, but to the ScrollView
  },
  bookingCardContent: {
    padding: 10,
    borderRadius: 10,
    width: '100%',
    height: '100%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: 'flex-start',
  },
  timelineCard: {
    width: SCREEN_WIDTH * 0.25, // Adjust width for small cards
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCardCustomer: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  timelineCardBarber: {
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  timelineCardTime: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
