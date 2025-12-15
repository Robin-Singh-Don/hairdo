import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import { ownerAPI } from '../../services/api/ownerAPI';
import { ApprovedStaffSchedule, OwnerStaffMember } from '../../services/mock/AppMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Enhanced mock data for shifts with more realistic information
const MOCK_SHIFTS = {
  '2024-01-07': [
    {
      id: '1',
      date: '2024-01-07',
      startTime: '09:00',
      endTime: '17:00',
      duration: '8 hours',
      status: 'upcoming',
      employee: {
        name: 'Shark.11',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        chair: 'Chair 03',
        role: 'Senior Barber',
      },
      location: 'Main Salon',
      notes: 'Regular shift - focus on haircuts',
    },
    {
      id: '2',
      date: '2024-01-07',
      startTime: '10:00',
      endTime: '18:00',
      duration: '8 hours',
      status: 'upcoming',
      employee: {
        name: 'Puneet.10',
        avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
        chair: 'Chair 05',
        role: 'Stylist',
      },
      location: 'Main Salon',
      notes: 'Hair styling specialist',
    },
  ],
  '2024-01-08': [
    {
      id: '3',
      date: '2024-01-08',
      startTime: '08:00',
      endTime: '16:00',
      duration: '8 hours',
      status: 'upcoming',
      employee: {
        name: 'Shark.11',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        chair: 'Chair 09',
        role: 'Senior Barber',
      },
      location: 'Main Salon',
      notes: 'Sunday shift - beard specialist',
    },
  ],
  '2024-01-09': [
    {
      id: '4',
      date: '2024-01-09',
      startTime: '09:00',
      endTime: '17:00',
      duration: '8 hours',
      status: 'upcoming',
      employee: {
        name: 'Jeet.12',
        avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
        chair: 'Chair 02',
        role: 'Color Specialist',
      },
      location: 'Main Salon',
      notes: 'Hair coloring specialist',
    },
  ],
  '2024-01-10': [
    {
      id: '5',
      date: '2024-01-10',
      startTime: '10:00',
      endTime: '18:00',
      duration: '8 hours',
      status: 'upcoming',
      employee: {
        name: 'Abhay.0',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        chair: 'Chair 07',
        role: 'Facial Specialist',
      },
      location: 'Spa Section',
      notes: 'Facial and beauty treatments',
    },
  ],
  '2024-01-11': [
    {
      id: '6',
      date: '2024-01-11',
      startTime: '09:00',
      endTime: '17:00',
      duration: '8 hours',
      status: 'upcoming',
      employee: {
        name: 'Shark.11',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        chair: 'Chair 03',
        role: 'Senior Barber',
      },
      location: 'Main Salon',
      notes: 'Regular shift',
    },
  ],
  '2024-01-12': [
    {
      id: '7',
      date: '2024-01-12',
      startTime: '08:00',
      endTime: '16:00',
      duration: '8 hours',
      status: 'upcoming',
      employee: {
        name: 'Puneet.10',
        avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
        chair: 'Chair 05',
        role: 'Stylist',
      },
      location: 'Main Salon',
      notes: 'Early shift - styling focus',
    },
  ],
  '2024-01-13': [
    {
      id: '8',
      date: '2024-01-13',
      startTime: '09:00',
      endTime: '17:00',
      duration: '8 hours',
      status: 'upcoming',
      employee: {
        name: 'Shark.11',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        chair: 'Chair 03',
        role: 'Senior Barber',
      },
      location: 'Main Salon',
      notes: 'Saturday shift - busy day expected',
    },
  ],
};

export default function ScheduleScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [shifts, setShifts] = useState<any[]>([]);
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  
  // API state
  const [loading, setLoading] = useState(true);

  // Generate week days for the current week
  const generateWeekDays = (weekStart: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push({
        date: date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        dayNumber: date.getDate().toString(),
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
      });
    }
    return days;
  };

  const weekDays = generateWeekDays(currentWeek);

  // Load shifts for selected date from API
  useEffect(() => {
    const loadShifts = async () => {
      try {
        setLoading(true);
        const dateString = selectedDate.toISOString().split('T')[0];
        
        // Load approved schedules from ownerAPI and staff members
        const [approvedSchedules, staffMembers] = await Promise.all([
          ownerAPI.getApprovedSchedules(dateString),
          ownerAPI.getStaffMembers(),
        ]);
        
        // For now, use staffId 1 as default (should come from auth context)
        const currentStaffId = 1; // TODO: Get from auth context
        
        // Filter schedules for current employee
        const employeeSchedules = approvedSchedules.filter(schedule => schedule.staffId === currentStaffId);
        
        // Find staff member info
        const currentStaff = staffMembers.find(s => s.id === currentStaffId);
        
        // Transform approved schedules to shift format
        const transformedShifts = employeeSchedules.map(schedule => {
          // Calculate duration in hours
          const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
          const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);
          const startTotalMinutes = startHours * 60 + startMinutes;
          const endTotalMinutes = endHours * 60 + endMinutes;
          const durationMinutes = endTotalMinutes - startTotalMinutes;
          const durationHours = Math.round((durationMinutes / 60) * 10) / 10;
          
          // Determine status
          const now = new Date();
          const today = now.toISOString().split('T')[0];
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          let shiftStatus = 'upcoming';
          if (schedule.date < today || (schedule.date === today && currentTime >= schedule.endTime)) {
            shiftStatus = 'completed';
          } else if (schedule.date === today && currentTime >= schedule.startTime && currentTime < schedule.endTime) {
            shiftStatus = 'active';
          } else if (schedule.status === 'cancelled' || schedule.status === 'absent') {
            shiftStatus = 'cancelled';
          }
          
          return {
            id: schedule.id,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            duration: `${durationHours} hours`,
            status: shiftStatus,
            employee: {
              name: currentStaff?.name || 'Employee',
              avatar: currentStaff?.avatar || 'https://via.placeholder.com/50',
              chair: `Chair ${currentStaff?.id || ''}`,
              role: currentStaff?.role || 'Staff',
            },
            location: 'Main Salon', // Could be enhanced with location data
            notes: schedule.notes || 'Regular shift',
          };
        });
        
        // If no schedules found, try fallback to mock data for that date
        if (transformedShifts.length === 0) {
          const dayShifts = MOCK_SHIFTS[dateString as keyof typeof MOCK_SHIFTS] || [];
          setShifts(dayShifts);
        } else {
          setShifts(transformedShifts);
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
        // Fallback to mock data
        const dateString = selectedDate.toISOString().split('T')[0];
        const dayShifts = MOCK_SHIFTS[dateString as keyof typeof MOCK_SHIFTS] || [];
        setShifts(dayShifts);
      } finally {
        setLoading(false);
      }
    };

    loadShifts();
  }, [selectedDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'upcoming': return '#2196F3';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Upcoming';
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTodayPress = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentWeek(today);
  };

  const handleWeekNavigation = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const handleShiftPress = (shift: any) => {
    Alert.alert(
      'Shift Details',
      `${shift.employee.name}\n${shift.employee.role}\n${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}\n${shift.location}\n\n${shift.notes}`,
      [
        { text: 'OK' },
        { text: 'Request Change', onPress: () => Alert.alert('Request Change', 'Shift change request sent!') },
      ]
    );
  };

  const handleMenuPress = () => {
    setShowMenuPopup(true);
  };

  const handleAvailabilityPress = () => {
    setShowMenuPopup(false);
    router.push('/AvailabilityScreen');
  };

  const handleTimeOffPress = () => {
    setShowMenuPopup(false);
    router.push('/TimeOffRequestScreen');
  };

  const renderShiftItem = (shift: any) => (
    <TouchableOpacity 
      key={shift.id} 
      style={styles.shiftContainer}
      onPress={() => handleShiftPress(shift)}
    >
      <View style={styles.shiftCard}>
        <Image source={{ uri: shift.employee.avatar }} style={styles.employeeAvatar} />
        <View style={styles.employeeInfo}>
          <View style={styles.employeeHeader}>
            <Text style={styles.employeeName}>{shift.employee.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shift.status) }]}>
              <Text style={styles.statusText}>{getStatusText(shift.status)}</Text>
            </View>
          </View>
          <Text style={styles.employeeRole}>{shift.employee.role}</Text>
          <Text style={styles.chairText}>{shift.employee.chair}</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#9E9E9E" />
            <Text style={styles.timeText}>
              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
            </Text>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#9E9E9E" />
            <Text style={styles.locationText}>{shift.location}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading schedule...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity onPress={handleMenuPress}>
          <Ionicons name="menu-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Date Display */}
      <View style={styles.dateSection}>
        <View style={styles.dateLeft}>
          <Text style={styles.dayNumber}>{selectedDate.getDate().toString().padStart(2, '0')}</Text>
          <View style={styles.dateInfo}>
            <Text style={styles.dayName}>{selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
            <Text style={styles.fullDate}>{selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.todayButton} onPress={handleTodayPress}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Week View with Navigation */}
      <View style={styles.weekContainer}>
        <TouchableOpacity 
          style={styles.weekNavButton}
          onPress={() => handleWeekNavigation('prev')}
        >
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScrollView}>
          <View style={styles.weekRow}>
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.weekDayItem,
                  day.isSelected && styles.selectedWeekDay,
                  day.isToday && !day.isSelected && styles.todayWeekDay
                ]}
                onPress={() => handleDateSelect(day.date)}
              >
                <Text style={[
                  styles.weekDayText,
                  day.isSelected && styles.selectedWeekDayText,
                  day.isToday && !day.isSelected && styles.todayWeekDayText
                ]}>
                  {day.day}
                </Text>
                <Text style={[
                  styles.weekDateText,
                  day.isSelected && styles.selectedWeekDateText,
                  day.isToday && !day.isSelected && styles.todayWeekDateText
                ]}>
                  {day.dayNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.weekNavButton}
          onPress={() => handleWeekNavigation('next')}
        >
          <Ionicons name="chevron-forward" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Upcoming Shifts Section */}
      <View style={styles.shiftsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your upcoming shifts</Text>
          <Text style={styles.shiftCount}>{shifts.length} shift{shifts.length !== 1 ? 's' : ''}</Text>
        </View>
        
        <ScrollView style={styles.shiftsList} showsVerticalScrollIndicator={false}>
          {shifts.length > 0 ? (
            shifts.map(renderShiftItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#9E9E9E" />
              <Text style={styles.emptyStateText}>No shifts today</Text>
              <Text style={styles.emptyStateSubtext}>Check other days or contact your manager</Text>
            </View>
          )}
        </ScrollView>
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
              onPress={handleAvailabilityPress}
            >
              <Ionicons name="time-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>Availability</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleTimeOffPress}
            >
              <Ionicons name="calendar-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>Time Off Request</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000000',
    marginRight: 15,
  },
  dateInfo: {
    justifyContent: 'center',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  fullDate: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  todayButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  weekContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekNavButton: {
    padding: 10,
    marginHorizontal: 5,
  },
  weekScrollView: {
    flex: 1,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  weekDayItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    minWidth: 40,
  },
  selectedWeekDay: {
    backgroundColor: '#000000',
  },
  todayWeekDay: {
    backgroundColor: '#F0F0F0',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9E9E9E',
    marginBottom: 2,
  },
  selectedWeekDayText: {
    color: '#FFFFFF',
  },
  todayWeekDayText: {
    color: '#000000',
    fontWeight: '600',
  },
  weekDateText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  selectedWeekDateText: {
    color: '#FFFFFF',
  },
  todayWeekDateText: {
    color: '#000000',
    fontWeight: '600',
  },
  shiftsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  shiftCount: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  shiftsList: {
    flex: 1,
  },
  shiftContainer: {
    marginBottom: 12,
  },
  shiftCard: {
    backgroundColor: '#FFF2D9',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  employeeRole: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  chairText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 4,
    textAlign: 'center',
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
    paddingHorizontal: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
});
