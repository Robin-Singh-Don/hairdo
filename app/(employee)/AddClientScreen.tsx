import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCancellationHours, getDepositPercentage } from '../../services/preferences/bookingPreferences';
import { toStartISO, computeCancelBy, nowISO } from '../../services/utils/booking';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppointments } from '../../contexts/AppointmentContext';
import { employeeAPI } from '../../services/api/employeeAPI';
import { getStoreHoursForDay } from '../../services/storeHours';
import { getMaxAdvanceDays } from '../../services/preferences/bookingPreferences';
import { EmployeeService } from '../../services/mock/AppMockData';

// Mock data for services and employees
const SERVICES = [
  { id: '1', name: 'Haircut', price: '$35', duration: '30 min', category: 'Hair' },
  { id: '2', name: 'Beard Trim', price: '$20', duration: '20 min', category: 'Beard' },
  { id: '3', name: 'Haircut & Beard', price: '$50', duration: '45 min', category: 'Combo' },
  { id: '4', name: 'Hair Styling', price: '$40', duration: '35 min', category: 'Hair' },
  { id: '5', name: 'Hair Color', price: '$80', duration: '90 min', category: 'Hair' },
  { id: '6', name: 'Facial', price: '$45', duration: '40 min', category: 'Skin' },
  { id: '7', name: 'Eyebrow Shaping', price: '$25', duration: '15 min', category: 'Beauty' },
  { id: '8', name: 'Head Massage', price: '$30', duration: '20 min', category: 'Wellness' },
];

const EMPLOYEES = [
  {
    id: '1',
    name: 'Shark.11',
    username: '@shark11',
    specialization: 'Men\'s Hair Specialist',
    status: 'online',
    pendingAppointments: 3,
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    availability: 'Available',
  },
  {
    id: '2',
    name: 'Puneet.10',
    username: '@puneet10',
    specialization: 'Beard & Styling Expert',
    status: 'online',
    pendingAppointments: 1,
    profileImage: 'https://randomuser.me/api/portraits/men/44.jpg',
    availability: 'Available',
  },
  {
    id: '3',
    name: 'Jeet.12',
    username: '@jeet12',
    specialization: 'Hair Color Specialist',
    status: 'busy',
    pendingAppointments: 5,
    profileImage: 'https://randomuser.me/api/portraits/men/65.jpg',
    availability: 'Busy',
  },
  {
    id: '4',
    name: 'Abhay.0',
    username: '@abhay0',
    specialization: 'Facial & Beauty Expert',
    status: 'offline',
    pendingAppointments: 0,
    profileImage: 'https://randomuser.me/api/portraits/men/12.jpg',
    availability: 'Offline',
  },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '15', '30', '45'];

export default function AddClientScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const { addAppointment, getAppointmentsByEmployee } = useAppointments();
  
  const getParamValue = (key: string): string | undefined => {
    const value = params[key];
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === 'string') {
      return value;
    }
    return undefined;
  };
  
  // Form state - Initialize from params if available
  const [clientName, setClientName] = useState(getParamValue('name') || '');
  const [phone, setPhone] = useState(getParamValue('phone') || '');
  const [email, setEmail] = useState(getParamValue('email') || '');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const paramClientTag = getParamValue('clientTag');
  const initialIsNewClient = !paramClientTag || paramClientTag === 'New';
  const [isNewClient, setIsNewClient] = useState(initialIsNewClient);
  const [sendNotification, setSendNotification] = useState(true);
  const [notes, setNotes] = useState('');
  const [clientTag, setClientTag] = useState(paramClientTag || (initialIsNewClient ? 'New' : 'Regular'));

  // Date/Time state - Initialize with current time rounded up
  const getInitialTime = () => {
    const now = new Date();
    const currentHour24 = now.getHours();
    const currentMinute = now.getMinutes();
    const dayOfWeek = now.getDay();
    const isSaturday = dayOfWeek === 6;
    const startHour = isSaturday ? 10 : 9;
    const endHour = isSaturday ? 17 : 18;
    
    if (currentHour24 >= startHour && currentHour24 < endHour) {
      // Round up to next 15-minute interval
      let roundedMinute = Math.ceil(currentMinute / 15) * 15;
      let adjustedHour24 = roundedMinute >= 60 ? currentHour24 + 1 : currentHour24;
      
      if (adjustedHour24 >= endHour) {
        adjustedHour24 = startHour;
        roundedMinute = 0;
      }
      
      const hour12 = adjustedHour24 === 0 ? 12 : adjustedHour24 > 12 ? adjustedHour24 - 12 : adjustedHour24;
      const minuteIndex = Math.floor(roundedMinute / 15);
      const isAM = adjustedHour24 < 12;
      
      return { 
        hour: hour12 === 0 ? 12 : hour12, 
        minute: minuteIndex >= MINUTES.length ? 0 : minuteIndex, 
        isAM 
      };
    } else {
      // Outside business hours, use opening time
      return { hour: startHour > 12 ? startHour - 12 : startHour, minute: 0, isAM: startHour < 12 };
    }
  };

  const initialTime = getInitialTime();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedHour, setSelectedHour] = useState(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);
  const [isAM, setIsAM] = useState(initialTime.isAM);
  
  // Track if user has manually changed the time (to prevent auto-reset)
  const [isTimeManuallyChanged, setIsTimeManuallyChanged] = useState(false);

  // Service and Employee state
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [tempSelectedServices, setTempSelectedServices] = useState<any[]>([]); // Temporary selection while modal is open
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  
  // Time picker modals
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showHourModal, setShowHourModal] = useState(false);
  const [showMinuteModal, setShowMinuteModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [maxAdvanceDays, setMaxAdvanceDaysState] = useState<number>(30);

  // API state
  const [services, setServices] = useState<EmployeeService[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Appointment creation state
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesData, employeesData] = await Promise.all([
          employeeAPI.getServices(),
          employeeAPI.getBarbers()
        ]);
        
        // Ensure at least one service is available (use mock if API returns empty)
        let finalServices: EmployeeService[] = [];
        if (servicesData && servicesData.length > 0) {
          finalServices = servicesData;
        } else {
          // Fallback to mock services if API returns empty
          // Convert mock SERVICES to EmployeeService format
          finalServices = SERVICES.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            duration: s.duration,
            category: s.category as any,
            description: `${s.name} service - ${s.category}`,
            isActive: true,
          }));
          console.log('Using mock services:', finalServices.length, 'services available');
        }
        setServices(finalServices);
        setEmployeeList(employeesData);
        
        // Pre-select service and employee from params
        const serviceId = getParamValue('serviceId');
        const employeeId = getParamValue('employeeId');
        
        if (serviceId && finalServices.length > 0) {
          const service = finalServices.find(s => String(s.id) === String(serviceId));
          if (service) {
            setSelectedServices([service]);
          }
        }
        
        if (employeeId && employeesData.length > 0) {
          const employee = employeesData.find((e: any) => String(e.id) === String(employeeId));
          if (employee) {
            setSelectedEmployee(employee);
          }
        } else if (!selectedEmployee && employeesData.length > 0) {
          // Default to the first employee (acts as "current" employee for this device/session)
          setSelectedEmployee(employeesData[0]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load Max Advance Booking Days preference
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const days = await getMaxAdvanceDays();
        if (mounted) setMaxAdvanceDaysState(days);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Client tags
  const clientTags = ['New', 'Regular', 'VIP', 'Returning'];

  // Calculate total price and duration
  const totalPrice = selectedServices.reduce((sum, service: any) => {
    const price = parseInt(service.price.replace('$', ''));
    return sum + price;
  }, 0);

  const totalDuration = selectedServices.reduce((sum, service: any) => {
    const duration = parseInt(service.duration.replace(' min', ''));
    return sum + duration;
  }, 0);

  // Helpers to determine employee availability at the selected time
  const getSelectedDateString = (): string => {
    const year = new Date().getFullYear();
    return `${year}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  };

  const getSelectedTimeWindowMinutes = () => {
    const hourNum = typeof selectedHour === 'number' ? selectedHour : parseInt(String(selectedHour || 0));
    const minuteNum = parseInt(MINUTES[selectedMinute] || '0', 10);
    // Convert 12h to 24h
    let startHour24 = isAM ? (hourNum === 12 ? 0 : hourNum) : (hourNum === 12 ? 12 : hourNum + 12);
    const startMinutes = startHour24 * 60 + minuteNum;
    const endMinutes = startMinutes + (Number.isFinite(totalDuration) ? totalDuration : 60);
    return { startMinutes, endMinutes };
  };

  const isWithinStoreHours = (): boolean => {
    try {
      const date = new Date(getSelectedDateString());
      const dayIndex = date.getDay();
      const hours = getStoreHoursForDay(dayIndex);
      if (!hours) return false;
      const openHourInt = Math.floor(hours.open);
      const closeHourInt = Math.ceil(hours.close);
      const open = openHourInt * 60;
      const close = closeHourInt * 60;
      const { startMinutes } = getSelectedTimeWindowMinutes();
      return startMinutes >= open && startMinutes < close;
    } catch {
      return true;
    }
  };

  const isEmployeeBusyAtSelectedTime = (employeeId: string): boolean => {
    const selectedDate = getSelectedDateString();
    const { startMinutes, endMinutes } = getSelectedTimeWindowMinutes();
    const appts = getAppointmentsByEmployee(employeeId).filter(a => a.date === selectedDate);
    const toMinutes = (hhmm: string): number => {
      const [h, m] = (hhmm || '0:0').split(':');
      return (parseInt(h || '0', 10) * 60) + parseInt(m || '0', 10);
    };
    return appts.some(a => {
      const aStart = toMinutes(a.startTime);
      const aEnd = toMinutes(a.endTime);
      return aStart < endMinutes && aEnd > startMinutes; // overlap
    });
  };

  const getEmployeeStatusAtSelectedTime = (employeeId: string): 'on' | 'busy' | 'off' => {
    const within = isWithinStoreHours();
    const busy = isEmployeeBusyAtSelectedTime(employeeId);
    if (busy) return 'busy';
    if (within) return 'on';
    return 'off';
  };

  // Check if client exists (mock function)
  const checkExistingClient = () => {
    if (phone.length >= 10) {
      // Mock: Check if client exists
      const existingClient = phone === '5551234567'; // Mock existing client
      if (existingClient) {
        setIsNewClient(false);
        Alert.alert('Existing Client', 'Client found in database. Previous appointments will be loaded.');
      }
    }
  };

  useEffect(() => {
    checkExistingClient();
  }, [phone]);

  // Function to find next available time slot
  const findNextAvailableTime = useCallback(() => {
    const now = new Date();
    const currentHour24 = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Get selected date
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    const selectedDate = new Date(currentYear, selectedMonth, selectedDay);
    const selectedDateString = `${currentYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    // Check if selected date is today - use both string comparison and direct comparison
    const isToday = (selectedDateString === todayString) || (selectedMonth === currentMonth && selectedDay === currentDay);
    
    
    // Define business hours (9 AM - 6 PM on weekdays, 10 AM - 5 PM on Saturday)
    const dayOfWeek = selectedDate.getDay();
    const isSaturday = dayOfWeek === 6;
    const startHour = isSaturday ? 10 : 9; // 10 AM Saturday, 9 AM weekdays
    const endHour = isSaturday ? 17 : 18; // 5 PM Saturday, 6 PM weekdays
    
    if (!selectedEmployee) {
      // If no employee selected, use current time rounded up (if today) or business opening time
      console.log('No employee - checking isToday:', isToday, 'selectedDateString:', selectedDateString, 'todayString:', todayString, 'currentHour24:', currentHour24);
      if (isToday && currentHour24 >= startHour && currentHour24 < endHour) {
        // Round up current time to next 15-minute interval
        let roundedMinute = Math.ceil(currentMinute / 15) * 15;
        let adjustedHour24 = roundedMinute >= 60 ? currentHour24 + 1 : currentHour24;
        
        // If rounded time exceeds business hours, use next day opening
        if (adjustedHour24 >= endHour) {
          adjustedHour24 = startHour;
          roundedMinute = 0;
        }
        
        const hour12 = adjustedHour24 === 0 ? 12 : adjustedHour24 > 12 ? adjustedHour24 - 12 : adjustedHour24;
        const minuteIndex = Math.floor(roundedMinute / 15);
        const isAM = adjustedHour24 < 12;
        
        console.log('Returning current time:', { hour: hour12 === 0 ? 12 : hour12, minute: minuteIndex, isAM });
        return { 
          hour: hour12 === 0 ? 12 : hour12, 
          minute: minuteIndex, 
          isAM 
        };
      } else {
        // Use business opening time for future dates or times outside business hours
        console.log('Returning opening time because isToday:', isToday, 'or outside hours');
        return { hour: startHour > 12 ? startHour - 12 : startHour, minute: 0, isAM: startHour < 12 };
      }
    }

    // Get existing appointments for this employee on this date
    if (!selectedEmployee?.id) {
      // Fallback to opening time if employee not properly selected
      return { hour: startHour > 12 ? startHour - 12 : startHour, minute: 0, isAM: startHour < 12 };
    }
    
    const existingAppointments = getAppointmentsByEmployee(selectedEmployee.id).filter(
      apt => apt.date === selectedDateString && apt.status !== 'cancelled' && apt.status !== 'no-show'
    );

    // Sort appointments by start time
    const sortedAppointments = [...existingAppointments].sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

    // Start checking from business opening or current time if today
    let checkHour24: number;
    let checkMinute: number;
    
    if (isToday && currentHour24 >= startHour && currentHour24 < endHour) {
      // It's today and within business hours - start from current time
      checkHour24 = currentHour24;
      checkMinute = currentMinute;
      
      // Round up to next 15-minute interval
      if (checkMinute % 15 !== 0) {
        checkMinute = Math.ceil(checkMinute / 15) * 15;
        if (checkMinute >= 60) {
          checkMinute = 0;
          checkHour24 += 1;
        }
      } else {
        // If already on 15-minute mark, move to next slot
        checkMinute += 15;
        if (checkMinute >= 60) {
          checkMinute = 0;
          checkHour24 += 1;
        }
      }
      
      // If rounded time exceeds business hours, default to opening
      if (checkHour24 >= endHour) {
        checkHour24 = startHour;
        checkMinute = 0;
      }
    } else {
      // Future date or current time outside business hours - start from opening
      checkHour24 = startHour;
      checkMinute = 0;
    }


    // Check each 15-minute slot from start to end (before closing time)
    while (checkHour24 < endHour) {
      // Convert to 12-hour format
      const hour12 = checkHour24 === 0 ? 12 : checkHour24 > 12 ? checkHour24 - 12 : checkHour24;
      const minuteIndex = Math.floor(checkMinute / 15);
      const isAM = checkHour24 < 12;

      // Check if this time slot conflicts with existing appointments
      const timeString = `${String(checkHour24).padStart(2, '0')}:${String(checkMinute).padStart(2, '0')}`;
      const hasConflict = sortedAppointments.some(apt => {
        const aptStart = apt.startTime.split(':').map(Number);
        const aptEnd = apt.endTime.split(':').map(Number);
        const aptStartMinutes = aptStart[0] * 60 + aptStart[1];
        const aptEndMinutes = aptEnd[0] * 60 + aptEnd[1];
        const checkMinutes = checkHour24 * 60 + checkMinute;
        
        // Check if the new time slot would overlap with existing appointment
        // Using 15 minutes as minimum duration
        return checkMinutes < aptEndMinutes && (checkMinutes + 15) > aptStartMinutes;
      });

      if (!hasConflict && minuteIndex < MINUTES.length) {
        return { hour: hour12, minute: minuteIndex, isAM };
      }

      // Move to next 15-minute slot
      checkMinute += 15;
      if (checkMinute >= 60) {
        checkMinute = 0;
        checkHour24 += 1;
      }
    }

    // If no slot found in current day, default to opening time
    return { hour: startHour > 12 ? startHour - 12 : startHour, minute: 0, isAM: startHour < 12 };
  }, [selectedMonth, selectedDay, selectedEmployee, getAppointmentsByEmployee]);

  // Track previous date and employee to detect changes
  const prevDate = useRef<string>('');
  const prevEmployeeId = useRef<string | undefined>(undefined);
  
  // Update time when employee or date changes, but ONLY on initial load or when context truly changes
  useEffect(() => {
    const currentDate = `${selectedMonth}-${selectedDay}`;
    const currentEmployeeId = selectedEmployee?.id;
    
    // Only auto-update time if:
    // 1. It's the initial load (no previous date/employee), OR
    // 2. The date or employee actually changed (not just a re-render), AND
    // 3. User hasn't manually changed the time yet
    const isInitialLoad = prevDate.current === '';
    const dateChanged = prevDate.current !== currentDate;
    const employeeChanged = prevEmployeeId.current !== currentEmployeeId;
    
    if (isInitialLoad || (dateChanged || employeeChanged)) {
      // Only reset time if user hasn't manually changed it
      if (!isTimeManuallyChanged || isInitialLoad) {
        const nextTime = findNextAvailableTime();
        console.log('useEffect updating time (initial or date/employee changed):', {
          calculated: nextTime,
          currentHour: new Date().getHours(),
          currentMinute: new Date().getMinutes(),
          selectedMonth,
          selectedDay,
          selectedEmployee: selectedEmployee ? 'has employee' : 'no employee',
          isInitialLoad,
          dateChanged,
          employeeChanged,
          isTimeManuallyChanged
        });
        setSelectedHour(nextTime.hour);
        setSelectedMinute(nextTime.minute);
        setIsAM(nextTime.isAM);
        
        // Reset the flag only on date/employee change (not initial load)
        if (!isInitialLoad && (dateChanged || employeeChanged)) {
          setIsTimeManuallyChanged(false);
        }
      } else {
        console.log('⏸️ Skipping time auto-update - user has manually changed time');
      }
    }
    
    // Update refs
    prevDate.current = currentDate;
    prevEmployeeId.current = currentEmployeeId;
  }, [selectedMonth, selectedDay, selectedEmployee?.id, isTimeManuallyChanged, findNextAvailableTime]);

  const handleServiceToggle = (service: any) => {
    // Use temporary state if modal is open, otherwise update directly
    if (showServiceModal) {
      setTempSelectedServices(prev => {
        const isSelected = prev.find(s => s.id === service.id);
        if (isSelected) {
          return prev.filter(s => s.id !== service.id);
        } else {
          return [...prev, service];
        }
      });
    } else {
      setSelectedServices(prev => {
        const isSelected = prev.find(s => s.id === service.id);
        if (isSelected) {
          return prev.filter(s => s.id !== service.id);
        } else {
          return [...prev, service];
        }
      });
    }
  };

  // Handle opening service modal - initialize temp selection
  const handleOpenServiceModal = () => {
    setTempSelectedServices([...selectedServices]);
    setShowServiceModal(true);
  };

  // Handle closing service modal with Done button - save selections
  const handleServiceModalDone = () => {
    setSelectedServices([...tempSelectedServices]);
    setShowServiceModal(false);
  };

  // Handle closing service modal with X button - discard changes
  const handleServiceModalCancel = () => {
    setTempSelectedServices([]); // Reset temp selection
    setShowServiceModal(false);
  };

    const handleSaveAppointment = async () => {
      // Ensure we use the currently selected time (not reset it)
      console.log('💾 Saving appointment with time:', {
        selectedHour,
        selectedMinute: MINUTES[selectedMinute],
        isAM,
        isTimeManuallyChanged
      });
    setCreationStatus('Validating form...');
    setIsCreating(true);
    
    if (!clientName.trim()) {
      setCreationStatus('❌ Please enter client name');
      setIsCreating(false);
      setTimeout(() => setCreationStatus(''), 3000);
      return;
    }
    if (!phone.trim()) {
      setCreationStatus('❌ Please enter phone number');
      setIsCreating(false);
      setTimeout(() => setCreationStatus(''), 3000);
      return;
    }
    if (selectedServices.length === 0) {
      setCreationStatus('❌ Please select at least one service');
      setIsCreating(false);
      setTimeout(() => setCreationStatus(''), 3000);
      return;
    }
    if (!selectedEmployee) {
      setCreationStatus('❌ Please select an employee');
      setIsCreating(false);
      setTimeout(() => setCreationStatus(''), 3000);
      return;
    }

    // Validate appointment time
    const hourValue = typeof selectedHour === 'number' ? selectedHour : parseInt(String(selectedHour));
    if (isNaN(hourValue) || hourValue < 1 || hourValue > 12) {
      setCreationStatus('❌ Please select appointment time');
      setIsCreating(false);
      setTimeout(() => setCreationStatus(''), 3000);
      return;
    }
    if (typeof selectedMinute !== 'number' || selectedMinute < 0 || selectedMinute >= MINUTES.length) {
      setCreationStatus('❌ Please select appointment time');
      setIsCreating(false);
      setTimeout(() => setCreationStatus(''), 3000);
      return;
    }

    setCreationStatus('✅ Form validated! Creating appointment...');

    // Format date for storage (YYYY-MM-DD) - Use the selected date from the date picker
    const currentYear = new Date().getFullYear();
    const formattedDate = `${currentYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    
    console.log('📅 Date Selection:', {
      selectedMonth: selectedMonth,
      selectedDay: selectedDay,
      currentYear: currentYear,
      formattedDate: formattedDate
    });

    // Enforce date validity at submission (covers dropdown/date manual changes)
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const selectedDateObj = new Date(currentYear, selectedMonth, selectedDay);
      selectedDateObj.setHours(0, 0, 0, 0);
      // Disallow past dates
      if (selectedDateObj < startOfToday) {
        setCreationStatus('❌ Date not allowed. You cannot book a past date.');
        setIsCreating(false);
        setTimeout(() => setCreationStatus(''), 4000);
        return;
      }
      const latest = new Date(startOfToday);
      latest.setDate(startOfToday.getDate() + maxAdvanceDays);
      if (selectedDateObj > latest) {
        setCreationStatus(`❌ Date not allowed. You can book up to ${maxAdvanceDays} day(s) in advance.`);
        setIsCreating(false);
        setTimeout(() => setCreationStatus(''), 4000);
        return;
      }
    } catch {}
    
    // Format time - convert to 24-hour format for startTime and endTime
    const hourNum = typeof selectedHour === 'number' ? selectedHour : parseInt(selectedHour);
    const minuteNum = parseInt(MINUTES[selectedMinute]);
    
    // Convert 12-hour format to 24-hour format correctly
    let adjustedHour: number;
    if (isAM) {
      // AM: 12 AM becomes 0, everything else stays the same
      adjustedHour = hourNum === 12 ? 0 : hourNum;
    } else {
      // PM: 12 PM stays 12, everything else adds 12
      adjustedHour = hourNum === 12 ? 12 : hourNum + 12;
    }
    
    const startTime = `${String(adjustedHour).padStart(2, '0')}:${String(minuteNum).padStart(2, '0')}`;
    const formattedTime = `${hourNum}:${MINUTES[selectedMinute]} ${isAM ? 'AM' : 'PM'}`;
    
    // Debug: Log the time conversion - CRITICAL for debugging
    console.log('⏰ AddClientScreen Time Conversion:', {
      userInput: {
        selectedHour: hourNum,
        selectedMinute: MINUTES[selectedMinute],
        isAM: isAM,
        display: formattedTime
      },
      conversion: {
        adjustedHour24: adjustedHour,
        minuteNum: minuteNum,
        startTimeString: startTime
      },
      expectedDisplay: `${hourNum}:${MINUTES[selectedMinute]} ${isAM ? 'AM' : 'PM'}`
    });
    
    // Calculate end time based on duration (avoid timezone issues by calculating directly)
    const durationMinutes = totalDuration; // totalDuration is already a number
    // Calculate end time in minutes, then convert to hours:minutes
    const startTotalMinutes = adjustedHour * 60 + minuteNum;
    const endTotalMinutes = startTotalMinutes + durationMinutes;
    const endHour24 = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    // Handle hour overflow (if end time goes past midnight)
    const finalEndHour = endHour24 >= 24 ? endHour24 % 24 : endHour24;
    const endTime = `${String(finalEndHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    
    // Get selected employee details
    const employee = employeeList.find(emp => emp.id === selectedEmployee.id);
    
    // Decide status based on employee availability
    const empStatus = getEmployeeStatusAtSelectedTime(selectedEmployee.id);
    if (empStatus === 'off') {
      setCreationStatus('Employee is off shift at the selected time');
      setIsCreating(false);
      setTimeout(() => setCreationStatus(''), 3000);
      return;
    }
    const computedStatus = empStatus === 'busy' ? 'pending' as const : 'confirmed' as const;

    // Compute booking policy snapshot (non-breaking, extra fields only)
    let dpPercent = 0;
    let cnwHours = 0;
    try {
      const [cnw, dp] = await Promise.all([getCancellationHours(), getDepositPercentage()]);
      cnwHours = cnw;
      dpPercent = dp;
    } catch {}
    const startISO = toStartISO(formattedDate, startTime);
    const cancelByISO = computeCancelBy(startISO, cnwHours || 0);
    const bookedAt = nowISO();
    const depositAmount = Math.max(0, Math.round((totalPrice * (dpPercent / 100)) * 100) / 100);

    const appointmentData = {
      customerId: `customer_${Date.now()}`, // Generate temporary ID
      customerName: clientName,
      customerPhone: phone || '',
      customerEmail: email || undefined,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      businessId: 'business_1', // Default business ID
      serviceId: selectedServices[0]?.id || '1',
      serviceName: selectedServices.map(s => s.name).join(', '),
      date: formattedDate,
      startTime: startTime,
      endTime: endTime,
      duration: durationMinutes,
      status: computedStatus,
      price: totalPrice,
      notes: notes || '',
      // Snapshot for future backend compatibility
      dpUsedPercent: dpPercent,
      cnwUsedHours: cnwHours,
      depositAmount,
      cancelByTimestamp: cancelByISO,
      bookedAtTimestamp: bookedAt,
    };

    console.log('=== CREATING APPOINTMENT ===');
    console.log('📅 Date & Time Summary:', {
      selectedMonth: selectedMonth,
      selectedDay: selectedDay,
      selectedHour: hourNum,
      selectedMinute: MINUTES[selectedMinute],
      isAM: isAM,
      formattedDate: formattedDate,
      startTime24Hour: startTime,
      endTime24Hour: endTime,
      displayTime: formattedTime
    });
    console.log('Appointment data:', appointmentData);
    console.log('Client Name:', clientName);
    console.log('Selected Services:', selectedServices);
    console.log('Selected Employee:', selectedEmployee);

    setCreationStatus('🔄 Saving to database...');

    try {
      const result = await addAppointment(appointmentData);
      
      if (result.success) {
        setCreationStatus('🎉 Appointment created successfully!');
        setCountdown(3);
        
        // Countdown timer
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              router.replace('/(employee)/AdminHomeScreen');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setCreationStatus(`❌ Error: ${result.message}`);
        setTimeout(() => setCreationStatus(''), 5000);
      }
    } catch (error) {
      setCreationStatus(`❌ Failed to create appointment: ${(error as any)?.message || "Unknown error"}`);
      setTimeout(() => setCreationStatus(''), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  const renderServiceItem = ({ item }: { item: any }) => {
    // Use temp selection if modal is open, otherwise use regular selection
    const servicesToCheck = showServiceModal ? tempSelectedServices : selectedServices;
    const isSelected = servicesToCheck.find(s => s.id === item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.serviceItem,
          isSelected && styles.selectedServiceItem,
        ]}
        onPress={() => handleServiceToggle(item)}
      >
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceCategory}>{item.category}</Text>
        </View>
        <View style={styles.serviceDetails}>
          <Text style={styles.servicePrice}>{item.price}</Text>
          <Text style={styles.serviceDuration}>{item.duration}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#000" />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmployeeItem = ({ item }: { item: any }) => {
    const status = getEmployeeStatusAtSelectedTime(item.id);
    const statusColor = status === 'busy' ? '#FFA500' : status === 'on' ? '#28A745' : '#DC3545';
    return (
      <TouchableOpacity
        style={[
          styles.employeeItem,
          selectedEmployee?.id === item.id && styles.selectedEmployeeItem,
        ]}
        onPress={() => {
          setSelectedEmployee(item);
          setShowEmployeeModal(false);
        }}
      >
        <Image source={{ uri: item.profileImage }} style={styles.employeeImage} />
        <View style={styles.employeeInfo}>
          <View style={styles.employeeHeader}>
            <Text style={styles.employeeName}>{item.name}</Text>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          </View>
          <Text style={styles.employeeUsername}>{item.username}</Text>
          <Text style={styles.employeeSpecialization}>{item.specialization}</Text>
          <View style={styles.employeeStats}>
            <Text style={styles.employeeAvailability}>{item.availability}</Text>
            {/* Removed pending text as requested */}
          </View>
        </View>
      </TouchableOpacity>
    );
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Client Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter client name"
                value={clientName}
                onChangeText={setClientName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.optionalLabel}>Email</Text>
              <View style={styles.emailContainer}>
                <TextInput
                  style={[styles.input, styles.emailInput]}
                  placeholder="Enter email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {isEmailVerified && (
                  <View style={styles.verifiedIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color="#000" />
                  </View>
                )}
              </View>
            </View>

            {/* New Client Checkbox */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                    onPress={() => {
                      const newValue = !isNewClient;
                      setIsNewClient(newValue);
                      // If new client is selected, set tag to 'New', otherwise set to 'Regular'
                      if (newValue) {
                        setClientTag('New');
                      } else {
                        // If tag was 'New' and unchecking, set to 'Regular'
                        // Otherwise keep the current tag (which might have been set from params)
                        if (clientTag === 'New') {
                          setClientTag('Regular');
                        }
                      }
                    }}
              >
                <View style={[styles.checkbox, isNewClient && styles.checkboxChecked]}>
                  {isNewClient && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
                <Text style={styles.checkboxLabel}>New Client</Text>
              </TouchableOpacity>
            </View>

            {/* Client Tag */}
            <View style={[styles.inputGroup, styles.clientTagGroup]}>
              <Text style={styles.label}>Client Tag</Text>
              <View style={styles.tagContainer}>
                {clientTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagButton,
                      clientTag === tag && styles.selectedTag,
                    ]}
                    onPress={() => {
                      setClientTag(tag);
                      // If user selects a tag other than 'New', uncheck 'New Client' checkbox
                      if (tag !== 'New') {
                        setIsNewClient(false);
                      } else {
                        // If user selects 'New' tag, check 'New Client' checkbox
                        setIsNewClient(true);
                      }
                    }}
                  >
                    <Text style={[
                      styles.tagText,
                      clientTag === tag && styles.selectedTagText,
                    ]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Appointment Time */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Appointment Time *</Text>
              <TouchableOpacity
                onPress={() => {
                  // Reset calendar to currently selected date when opening
                  const currentYear = new Date().getFullYear();
                  setCalendarMonth(selectedMonth);
                  setCalendarYear(currentYear);
                  setShowCalendarModal(true);
                }}
                style={styles.calendarIconButton}
              >
                <Ionicons name="calendar-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeContainer}>
              <View style={styles.timeGroup}>
                <Text style={styles.label}>Month</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowMonthModal(true)}
                >
                  <Text style={styles.dropdownText}>{MONTHS[selectedMonth]}</Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.timeGroup}>
                <Text style={styles.label}>Day</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowDayModal(true)}
                >
                  <Text style={styles.dropdownText}>{selectedDay}</Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeContainer}>
              <View style={styles.timeGroup}>
                <Text style={styles.label}>Hour</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowHourModal(true)}
                >
                  <Text style={styles.dropdownText}>{selectedHour}</Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.timeGroup}>
                <Text style={styles.label}>Minutes</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowMinuteModal(true)}
                >
                  <Text style={styles.dropdownText}>{MINUTES[selectedMinute]}</Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.timeGroup}>
                <Text style={styles.label}>Period</Text>
                  <TouchableOpacity
                    style={styles.periodButton}
                    onPress={() => {
                      setIsAM(!isAM);
                      setIsTimeManuallyChanged(true); // Mark as manually changed
                    }}
                  >
                    <Text style={styles.periodText}>{isAM ? 'AM' : 'PM'}</Text>
                  </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Service Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services *</Text>

            {selectedServices.length > 0 ? (
              <View style={styles.selectedServicesContainer}>
                {selectedServices.map((service) => (
                  <View key={service.id} style={styles.selectedServiceChip}>
                    <Text style={styles.selectedServiceText}>{service.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleServiceToggle(service)}
                      style={styles.removeServiceButton}
                    >
                      <Ionicons name="close" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.serviceSummary}>
                  <Text style={styles.summaryText}>
                    Total: {totalPrice} • {totalDuration}
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.emptyServiceButton}
                onPress={handleOpenServiceModal}
              >
                <Ionicons name="add-circle-outline" size={24} color="#000" />
                <Text style={styles.emptyServiceText}>Tap to add services</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Employee Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Employee *</Text>
            
            {selectedEmployee ? (
              <TouchableOpacity
                style={styles.selectedEmployeeCard}
                onPress={() => setShowEmployeeModal(true)}
              >
                <Image source={{ uri: selectedEmployee.profileImage }} style={styles.selectedEmployeeImage} />
                <View style={styles.selectedEmployeeInfo}>
                  <Text style={styles.selectedEmployeeName}>{selectedEmployee.name}</Text>
                  <Text style={styles.selectedEmployeeSpecialization}>{selectedEmployee.specialization}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.selectEmployeeButton}
                onPress={() => setShowEmployeeModal(true)}
              >
                <Ionicons name="person-add" size={24} color="#000" />
                <Text style={styles.selectEmployeeText}>Select Employee</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any special notes or preferences..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <View style={styles.notificationContainer}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Send Notification</Text>
                <Text style={styles.notificationSubtitle}>Notify client via SMS/Email</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.customSwitch,
                  sendNotification ? styles.switchActive : styles.switchInactive
                ]}
                onPress={() => setSendNotification(!sendNotification)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.switchKnob,
                  sendNotification ? styles.knobActive : styles.knobInactive
                ]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Button */}
          <View style={styles.addButtonContainer}>
            {creationStatus ? (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  {creationStatus}
                  {countdown > 0 && (
                    <Text style={styles.countdownText}>
                      {'\n'}Redirecting in {countdown} seconds...
                    </Text>
                  )}
                </Text>
                {isCreating && (
                  <View style={styles.loadingSpinner}>
                    <Ionicons name="refresh" size={20} color="#000" />
                  </View>
                )}
              </View>
            ) : null}
            
            <TouchableOpacity
              style={[styles.addButton, isCreating && styles.addButtonDisabled]}
              onPress={handleSaveAppointment}
              disabled={isCreating}
            >
              <Text style={styles.addButtonText}>
                {isCreating ? 'Creating...' : 'Add Appointment'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Service Selection Modal */}
        <Modal
          visible={showServiceModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Services</Text>
              <TouchableOpacity onPress={handleServiceModalCancel}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
                contentContainerStyle={styles.modalContentContainer}
                ListFooterComponent={
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.doneButton}
                      onPress={handleServiceModalDone}
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </View>
          </SafeAreaView>
        </Modal>

        {/* Employee Selection Modal */}
        <Modal
          visible={showEmployeeModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Employee</Text>
              <TouchableOpacity onPress={() => setShowEmployeeModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={employeeList}
              renderItem={renderEmployeeItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </SafeAreaView>
        </Modal>

        {/* Month Picker Modal */}
        <Modal visible={showMonthModal} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Month</Text>
              <FlatList
                data={MONTHS}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, (index < new Date().getMonth()) && { opacity: 0.35 }]}
                    onPress={() => {
                      const now = new Date();
                      const isPastMonth = index < now.getMonth();
                      if (isPastMonth) {
                        Alert.alert('Not allowed', 'You cannot select a past month.');
                        return;
                      }
                      setSelectedMonth(index);
                      setShowMonthModal(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              <TouchableOpacity
                style={styles.pickerCancel}
                onPress={() => setShowMonthModal(false)}
              >
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Day Picker Modal */}
        <Modal visible={showDayModal} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Day</Text>
              <FlatList
                data={Array.from({ length: 31 }, (_, i) => i + 1)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, (selectedMonth === new Date().getMonth() && item < new Date().getDate()) && { opacity: 0.35 }]}
                    onPress={() => {
                      const now = new Date();
                      const isPastDayInCurrentMonth = selectedMonth === now.getMonth() && item < now.getDate();
                      const isPastMonth = selectedMonth < now.getMonth();
                      if (isPastMonth || isPastDayInCurrentMonth) {
                        Alert.alert('Not allowed', 'You cannot select a past date.');
                        return;
                      }
                      setSelectedDay(item);
                      setShowDayModal(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.toString()}
              />
              <TouchableOpacity
                style={styles.pickerCancel}
                onPress={() => setShowDayModal(false)}
              >
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Hour Picker Modal */}
        <Modal visible={showHourModal} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Hour</Text>
              <FlatList
                data={HOURS}
                renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.pickerItem}
                      onPress={() => {
                        setSelectedHour(item);
                        setIsTimeManuallyChanged(true); // Mark as manually changed
                        setShowHourModal(false);
                      }}
                    >
                    <Text style={styles.pickerItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.toString()}
              />
              <TouchableOpacity
                style={styles.pickerCancel}
                onPress={() => setShowHourModal(false)}
              >
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Minute Picker Modal */}
        <Modal visible={showMinuteModal} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Minutes</Text>
              <FlatList
                data={MINUTES}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={styles.pickerItem}
                      onPress={() => {
                        setSelectedMinute(index);
                        setIsTimeManuallyChanged(true); // Mark as manually changed
                        setShowMinuteModal(false);
                      }}
                    >
                    <Text style={styles.pickerItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              <TouchableOpacity
                style={styles.pickerCancel}
                onPress={() => setShowMinuteModal(false)}
              >
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Calendar Modal */}
        <Modal visible={showCalendarModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowCalendarModal(false)}
          >
            <View style={styles.calendarModalContainer} onStartShouldSetResponder={() => true}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={() => {
                    if (calendarMonth === 0) {
                      setCalendarMonth(11);
                      setCalendarYear(calendarYear - 1);
                    } else {
                      setCalendarMonth(calendarMonth - 1);
                    }
                  }}
                  style={styles.calendarNavButton}
                >
                  <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                
                <View style={styles.calendarHeaderCenter}>
                  <Text style={styles.calendarMonthText}>{MONTHS[calendarMonth]}</Text>
                  <Text style={styles.calendarYearText}>{calendarYear}</Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => {
                    if (calendarMonth === 11) {
                      setCalendarMonth(0);
                      setCalendarYear(calendarYear + 1);
                    } else {
                      setCalendarMonth(calendarMonth + 1);
                    }
                  }}
                  style={styles.calendarNavButton}
                >
                  <Ionicons name="chevron-forward" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Days of week header */}
              <View style={styles.calendarWeekdays}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <View key={index} style={styles.calendarWeekday}>
                    <Text style={styles.calendarWeekdayText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar grid */}
              <View style={styles.calendarGrid}>
                {(() => {
                  // Get first day of month and number of days
                  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                  const today = new Date();
                  const isCurrentMonth = today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;
                  const todayDate = today.getDate();
                  
                  // Create calendar cells
                  const cells: JSX.Element[] = [];
                  
                  // Empty cells for days before month starts
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(
                      <View key={`empty-${i}`} style={styles.calendarCell} />
                    );
                  }
                  
                  // Cells for each day of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const isToday = isCurrentMonth && day === todayDate;
                    const isSelected = selectedMonth === calendarMonth && selectedDay === day && 
                                      new Date().getFullYear() === calendarYear;
                    const date = new Date(calendarYear, calendarMonth, day);
                    const startOfToday = new Date();
                    startOfToday.setHours(0, 0, 0, 0);
                    const isPast = date < startOfToday;
                    const latest = new Date(startOfToday);
                    latest.setDate(startOfToday.getDate() + maxAdvanceDays);
                    const isBeyondMABD = date > latest;
                    
                    cells.push(
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.calendarCell,
                          isToday && styles.calendarCellToday,
                          isSelected && styles.calendarCellSelected,
                          (isPast || isBeyondMABD) && styles.calendarCellPast
                        ]}
                        onPress={() => {
                          if (isPast) return;
                          if (isBeyondMABD) {
                            Alert.alert('Date not allowed', `You can book up to ${maxAdvanceDays} day(s) in advance.`);
                            return;
                          }
                            setSelectedMonth(calendarMonth);
                            setSelectedDay(day);
                            setShowCalendarModal(false);
                        }}
                        disabled={isPast}
                      >
                        <Text style={[
                          styles.calendarCellText,
                          isToday && styles.calendarCellTextToday,
                          isSelected && styles.calendarCellTextSelected,
                          (isPast || isBeyondMABD) && styles.calendarCellTextPast
                        ]}>
                          {day}
                        </Text>
                        {isToday && (
                          <View style={styles.calendarCellTodayDot} />
                        )}
                      </TouchableOpacity>
                    );
                  }
                  
                  return cells;
                })()}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 60, // Same width as back button to center the title
  },
  addButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  statusContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    fontStyle: 'italic',
  },
  loadingSpinner: {
    marginLeft: 10,
  },
  addButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  optionalLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    marginRight: 10,
  },
  verifiedIndicator: {
    padding: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  selectedTag: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTagText: {
    color: '#fff',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  timeGroup: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  periodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  periodText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addServiceText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  selectedServicesContainer: {
    marginTop: 10,
  },
  selectedServiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  selectedServiceText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  removeServiceButton: {
    padding: 2,
  },
  serviceSummary: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
  },
  emptyServiceText: {
    color: '#000',
    fontSize: 14,
    marginLeft: 8,
  },
  selectedEmployeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedEmployeeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  selectedEmployeeInfo: {
    flex: 1,
  },
  selectedEmployeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedEmployeeSpecialization: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectEmployeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
  },
  selectEmployeeText: {
    color: '#000',
    fontSize: 14,
    marginLeft: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  notificationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalContentContainer: {
    paddingBottom: 40,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  doneButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedServiceItem: {
    backgroundColor: '#F5F5F5',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  serviceCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  serviceDetails: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedEmployeeItem: {
    backgroundColor: '#F5F5F5',
  },
  employeeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  employeeUsername: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  employeeSpecialization: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  employeeStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  employeeAvailability: {
    fontSize: 12,
    color: '#000',
    marginRight: 15,
  },
  employeePending: {
    fontSize: 12,
    color: '#666',
  },
  // New checkbox styles
  checkboxContainer: {
    marginTop: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  clientTagGroup: {
    marginTop: 30,
  },
  customSwitch: {
    width: 40,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#000',
  },
  switchInactive: {
    backgroundColor: '#E0E0E0',
  },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  knobActive: {
    alignSelf: 'flex-end',
  },
  knobInactive: {
    alignSelf: 'flex-start',
  },
  // Picker modal styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  pickerCancel: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  calendarIconButton: {
    padding: 4,
  },
  calendarModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 150,
    width: '85%',
    maxWidth: 350,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calendarNavButton: {
    padding: 4,
  },
  calendarHeaderCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  calendarYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  calendarCloseButton: {
    padding: 8,
    marginLeft: 10,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calendarWeekday: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarWeekdayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 3,
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    minHeight: 32,
  },
  calendarCellToday: {
    backgroundColor: '#F5F5F5',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#000',
  },
  calendarCellSelected: {
    backgroundColor: '#000',
    borderRadius: 999,
  },
  calendarCellPast: {
    opacity: 0.3,
  },
  calendarCellText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '400',
  },
  calendarCellTextToday: {
    color: '#000',
    fontWeight: '600',
  },
  calendarCellTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  calendarCellTextPast: {
    color: '#999',
  },
  calendarCellTodayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
  },
});


