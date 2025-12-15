import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerStaffMember, ApprovedStaffSchedule, StaffScheduleRequest } from '../../services/mock/AppMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StaffSchedule() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [staffSchedules, setStaffSchedules] = useState<ApprovedStaffSchedule[]>([]);
  const [staffMembers, setStaffMembers] = useState<OwnerStaffMember[]>([]);
  const [scheduleRequests, setScheduleRequests] = useState<StaffScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [pendingRequestIdForEdit, setPendingRequestIdForEdit] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ApprovedStaffSchedule | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => {
    // Get start of current week (Sunday)
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });
  
  // Time picker modal state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerConfig, setTimePickerConfig] = useState<{
    dayKey: string;
    type: 'start' | 'end';
    currentTime: string;
    buttonPosition?: { x: number; y: number; width: number; height: number };
    mode?: 'weekly' | 'edit'; // 'weekly' for weekly schedule, 'edit' for edit schedule modal
  } | null>(null);
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');
  
  // Track scroll positions for real-time updates
  const [hourScrollY, setHourScrollY] = useState(0);
  const [minuteScrollY, setMinuteScrollY] = useState(0);
  const [periodScrollY, setPeriodScrollY] = useState(0);
  
  // Refs for time picker scroll views
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);
  
  // Refs for time buttons to measure their positions
  const timeButtonRefs = useRef<{ [key: string]: View | null }>({});
  
  // Selected day for detail view
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  
  // Notes for weekly schedule
  const [weeklyScheduleNotes, setWeeklyScheduleNotes] = useState<string>('');
  
  // Recurring schedules state
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  
  // Weekly schedule form state
  const [weeklySchedule, setWeeklySchedule] = useState<{
    [key: string]: {
      isWorking: boolean;
      startTime: string;
      endTime: string;
    };
  }>({
    monday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
    tuesday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
    wednesday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
    thursday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
    friday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
    saturday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
    sunday: { isWorking: false, startTime: '12:00', endTime: '12:00' },
  });
  
  // Form state for edit schedule
  const [scheduleForm, setScheduleForm] = useState({
    staffId: 0,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '18:00',
    notes: '',
  });

  // Generate time slots from 6 AM to 11 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Load data - refresh when screen comes into focus or date changes
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [staff, schedules, requests] = await Promise.all([
        ownerAPI.getStaffMembers(),
        ownerAPI.getApprovedSchedules(selectedDate.toISOString().split('T')[0]),
        ownerAPI.getScheduleRequests(),
      ]);
      setStaffMembers(staff);
      setStaffSchedules(schedules);
      setScheduleRequests(requests.filter(r => r.status === 'pending'));
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh when screen comes into focus (e.g., after adding new staff)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get staff member by ID
  const getStaffById = (staffId: number) => {
    return staffMembers.find(s => s.id === staffId);
  };

  // Get current status
  const getCurrentStatus = (schedule: ApprovedStaffSchedule) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (schedule.date !== today) {
      if (schedule.date < today) return 'completed';
      return schedule.status;
    }

    if (currentTime >= schedule.startTime && currentTime < schedule.endTime) {
      return 'active';
    }

    if (currentTime < schedule.startTime) return 'scheduled';
    return 'completed';
  };

  // Check if time is in range
  const isTimeInRange = (time: string, startTime: string, endTime: string) => {
    const [timeHour, timeMin] = time.split(':').map(Number);
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const timeMinutes = timeHour * 60 + timeMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  };

  // Get staff for a specific time slot
  const getStaffForTimeSlot = (time: string) => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return staffSchedules.filter(schedule => {
      // Filter by selected date
      if (schedule.date !== selectedDateStr) return false;
      const status = getCurrentStatus(schedule);
      if (status === 'absent' || status === 'cancelled') return false;
      return isTimeInRange(time, schedule.startTime, schedule.endTime);
    });
  };

  // Get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase();
  };

  // Check for schedule conflicts
  const checkScheduleConflict = (newSchedule: { staffId: number; date: string; startTime: string; endTime: string }, existingSchedules: ApprovedStaffSchedule[]): boolean => {
    const [newStartHour, newStartMin] = newSchedule.startTime.split(':').map(Number);
    const [newEndHour, newEndMin] = newSchedule.endTime.split(':').map(Number);
    const newStartMinutes = newStartHour * 60 + newStartMin;
    const newEndMinutes = newEndHour * 60 + newEndMin;

    return existingSchedules.some(existing => {
      if (existing.staffId !== newSchedule.staffId || existing.date !== newSchedule.date) {
        return false;
      }

      const [existingStartHour, existingStartMin] = existing.startTime.split(':').map(Number);
      const [existingEndHour, existingEndMin] = existing.endTime.split(':').map(Number);
      const existingStartMinutes = existingStartHour * 60 + existingStartMin;
      const existingEndMinutes = existingEndHour * 60 + existingEndMin;

      // Check if times overlap
      return (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes);
    });
  };

  // Handle save weekly schedule
  const handleSaveWeeklySchedule = async () => {
    if (!selectedStaffId) {
      Alert.alert('Error', 'Please select a staff member');
      return;
    }

    // Check if the selected week is in the past
    if (isWeekInPast(selectedWeekStart)) {
      Alert.alert('Error', 'Cannot create schedules for past weeks. Please select a current or future week.');
      return;
    }

    try {
      // Use selected week start date
      const startOfWeek = new Date(selectedWeekStart);
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const schedulesToCreate: any[] = [];

      // Create schedules for each working day
      dayNames.forEach((dayName, index) => {
        const daySchedule = weeklySchedule[dayName];
        if (daySchedule.isWorking) {
          const scheduleDate = new Date(startOfWeek);
          scheduleDate.setDate(startOfWeek.getDate() + index);
          const dateStr = scheduleDate.toISOString().split('T')[0];

          schedulesToCreate.push({
            staffId: selectedStaffId,
            date: dateStr,
            startTime: daySchedule.startTime,
            endTime: daySchedule.endTime,
            notes: weeklyScheduleNotes.trim() || undefined,
          });
        }
      });

      // Check for conflicts before creating
      const weekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDates.push(date.toISOString().split('T')[0]);
      }

      // Fetch existing schedules for the week
      const allWeekSchedules: ApprovedStaffSchedule[] = [];
      for (const dateStr of weekDates) {
        const daySchedules = await ownerAPI.getApprovedSchedules(dateStr);
        allWeekSchedules.push(...daySchedules);
      }

      // Check for conflicts
      const conflicts: string[] = [];
      for (const schedule of schedulesToCreate) {
        if (checkScheduleConflict(schedule, allWeekSchedules)) {
          const date = new Date(schedule.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          conflicts.push(`${dayName} (${schedule.startTime} - ${schedule.endTime})`);
        }
      }

      if (conflicts.length > 0) {
        Alert.alert(
          'Schedule Conflict',
          `This employee already has a schedule for:\n${conflicts.join('\n')}\n\nPlease choose different times or remove the existing schedule first.`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Create schedules for current week and recurring weeks if enabled
      const totalWeeks = repeatWeekly ? repeatWeeks : 1;
      let totalCreated = 0;

      for (let weekOffset = 0; weekOffset < totalWeeks; weekOffset++) {
        const currentWeekStart = new Date(startOfWeek);
        currentWeekStart.setDate(startOfWeek.getDate() + (weekOffset * 7));

        // Check conflicts for this week
        const currentWeekDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(currentWeekStart);
          date.setDate(currentWeekStart.getDate() + i);
          currentWeekDates.push(date.toISOString().split('T')[0]);
        }

        const currentWeekSchedules: ApprovedStaffSchedule[] = [];
        for (const dateStr of currentWeekDates) {
          const daySchedules = await ownerAPI.getApprovedSchedules(dateStr);
          currentWeekSchedules.push(...daySchedules);
        }

        // Create schedules for this week
        for (const baseSchedule of schedulesToCreate) {
          const scheduleDate = new Date(baseSchedule.date);
          scheduleDate.setDate(scheduleDate.getDate() + (weekOffset * 7));
          const dateStr = scheduleDate.toISOString().split('T')[0];

          const schedule = {
            ...baseSchedule,
            date: dateStr,
          };

          // Check conflict for this specific schedule
          if (!checkScheduleConflict(schedule, currentWeekSchedules)) {
            await ownerAPI.createSchedule(schedule);
            totalCreated++;
          }
        }
      }

      // Reload schedules for the entire week to ensure all new schedules appear
      const reloadWeekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        reloadWeekDates.push(date.toISOString().split('T')[0]);
      }

      // Fetch schedules for all days in the week and merge them
      const reloadWeekSchedules: ApprovedStaffSchedule[] = [];
      for (const dateStr of reloadWeekDates) {
        const daySchedules = await ownerAPI.getApprovedSchedules(dateStr);
        reloadWeekSchedules.push(...daySchedules);
      }

      // Filter to show only schedules for the selected date in the current view
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const filteredSchedules = reloadWeekSchedules.filter(s => s.date === selectedDateStr);
      setStaffSchedules(filteredSchedules);

      setShowWeeklySchedule(false);
      setSelectedStaffId(null);
      setWeeklyScheduleNotes('');
      setRepeatWeekly(false);
      setRepeatWeeks(1);
      Alert.alert('Success', `Schedule created for ${totalCreated} day(s)${totalWeeks > 1 ? ` across ${totalWeeks} week(s)` : ''}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create schedule');
    }
  };

  // Check if a week is in the past
  const isWeekInPast = (weekStart: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStartCopy = new Date(weekStart);
    weekStartCopy.setHours(0, 0, 0, 0);
    
    // Get start of current week (Sunday)
    const currentDay = today.getDay();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - currentDay);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    return weekStartCopy < currentWeekStart;
  };

  // Navigate to next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      // Check if we're trying to go to a past week
      const newWeekStart = new Date(selectedWeekStart);
      newWeekStart.setDate(selectedWeekStart.getDate() - 7);
      
      if (isWeekInPast(newWeekStart)) {
        // Don't allow navigating to past weeks
        return;
      }
      setSelectedWeekStart(newWeekStart);
    } else {
      const newWeekStart = new Date(selectedWeekStart);
      newWeekStart.setDate(selectedWeekStart.getDate() + 7);
      setSelectedWeekStart(newWeekStart);
    }
  };

  // Get week range text
  const getWeekRangeText = () => {
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(selectedWeekStart.getDate() + 6);
    
    const startMonth = selectedWeekStart.toLocaleDateString('en-US', { month: 'short' });
    const startDay = selectedWeekStart.getDate();
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const endDay = weekEnd.getDate();
    const year = selectedWeekStart.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  // Handle edit schedule
  const handleEditSchedule = async () => {
    if (!editingSchedule) return;
    
    try {
      // If this is a modification of a pending request, approve it with modifications
      if (pendingRequestIdForEdit) {
        // Create the schedule with modifications
        await ownerAPI.createSchedule({
          staffId: scheduleForm.staffId,
          date: scheduleForm.date,
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
          notes: scheduleForm.notes || undefined,
        });
        
        // Approve the request (which will mark it as approved)
        await ownerAPI.approveScheduleRequest(pendingRequestIdForEdit, {
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
          notes: scheduleForm.notes || undefined,
        });
        
        // Refresh both schedules and requests
        const [schedules, requests] = await Promise.all([
          ownerAPI.getApprovedSchedules(selectedDate.toISOString().split('T')[0]),
          ownerAPI.getScheduleRequests(),
        ]);
        setStaffSchedules(schedules);
        setScheduleRequests(requests.filter(r => r.status === 'pending'));
        setPendingRequestIdForEdit(null);
      } else {
        // Regular edit of existing schedule
        await ownerAPI.updateSchedule(editingSchedule.id, {
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
          notes: scheduleForm.notes || undefined,
        });
        
        // Reload schedules
        const schedules = await ownerAPI.getApprovedSchedules(selectedDate.toISOString().split('T')[0]);
        setStaffSchedules(schedules);
      }
      
      setShowEditSchedule(false);
      setEditingSchedule(null);
      resetForm();
      Alert.alert('Success', pendingRequestIdForEdit ? 'Schedule request approved with modifications' : 'Schedule updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update schedule');
    }
  };

  // Handle delete schedule
  const handleDeleteSchedule = (scheduleId: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ownerAPI.deleteSchedule(scheduleId);
              const schedules = await ownerAPI.getApprovedSchedules(selectedDate.toISOString().split('T')[0]);
              setStaffSchedules(schedules);
              Alert.alert('Success', 'Schedule deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete schedule');
            }
          },
        },
      ]
    );
  };

  // Handle approve request
  const handleApproveRequest = async (requestId: string, withModifications: boolean = false) => {
    try {
      if (withModifications) {
        // Open edit modal with request data
        const request = scheduleRequests.find(r => r.id === requestId);
        if (request) {
          setPendingRequestIdForEdit(requestId);
          setEditingSchedule(null);
          setScheduleForm({
            staffId: request.staffId,
            date: request.date,
            startTime: request.startTime,
            endTime: request.endTime,
            notes: request.notes || '',
          });
          setShowPendingRequests(false);
          setShowEditSchedule(true);
          // Store request ID for approval after edit
          setEditingSchedule({
            id: request.id,
            staffId: request.staffId,
            date: request.date,
            startTime: request.startTime,
            endTime: request.endTime,
            status: 'scheduled',
            notes: request.notes,
            createdAt: request.requestedAt,
            updatedAt: request.requestedAt,
          } as ApprovedStaffSchedule);
        }
      } else {
        await ownerAPI.approveScheduleRequest(requestId);
        const [schedules, requests] = await Promise.all([
          ownerAPI.getApprovedSchedules(selectedDate.toISOString().split('T')[0]),
          ownerAPI.getScheduleRequests(),
        ]);
        setStaffSchedules(schedules);
        setScheduleRequests(requests.filter(r => r.status === 'pending'));
        Alert.alert('Success', 'Schedule request approved');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve request');
    }
  };

  // Handle reject request - open modal
  const handleRejectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Confirm reject request
  const confirmRejectRequest = async () => {
    if (!selectedRequestId) return;

    try {
      await ownerAPI.rejectScheduleRequest(selectedRequestId, rejectReason || undefined);
      // Refresh requests to get updated list
      const requests = await ownerAPI.getScheduleRequests();
      setScheduleRequests(requests.filter(r => r.status === 'pending'));
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequestId(null);
      Alert.alert('Success', 'Schedule request rejected');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  // Reset form
  const resetForm = () => {
    setScheduleForm({
      staffId: 0,
      date: selectedDate.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '18:00',
      notes: '',
    });
    setPendingRequestIdForEdit(null);
  };

  // Open edit modal
  const openEditModal = (schedule: ApprovedStaffSchedule) => {
    const staff = getStaffById(schedule.staffId);
    setEditingSchedule(schedule);
    setScheduleForm({
      staffId: schedule.staffId,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      notes: schedule.notes || '',
    });
    setShowEditSchedule(true);
  };

  // Copy current week schedule to next week
  const copyWeekToNext = async () => {
    if (!selectedStaffId) {
      Alert.alert('Error', 'Please select a staff member first');
      return;
    }

    try {
      // Get current week schedules
      const weekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(selectedWeekStart);
        date.setDate(selectedWeekStart.getDate() + i);
        weekDates.push(date.toISOString().split('T')[0]);
      }

      const currentWeekSchedules: ApprovedStaffSchedule[] = [];
      for (const dateStr of weekDates) {
        const daySchedules = await ownerAPI.getApprovedSchedules(dateStr);
        const staffSchedules = daySchedules.filter(s => s.staffId === selectedStaffId);
        currentWeekSchedules.push(...staffSchedules);
      }

      if (currentWeekSchedules.length === 0) {
        Alert.alert('Info', 'No schedules found for this week to copy');
        return;
      }

      // Copy to next week
      const nextWeekStart = new Date(selectedWeekStart);
      nextWeekStart.setDate(selectedWeekStart.getDate() + 7);

      // Check if next week is in the past
      if (isWeekInPast(nextWeekStart)) {
        Alert.alert('Error', 'Cannot copy to past weeks');
        return;
      }

      // Get next week schedules for conflict checking
      const nextWeekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(nextWeekStart);
        date.setDate(nextWeekStart.getDate() + i);
        nextWeekDates.push(date.toISOString().split('T')[0]);
      }

      const nextWeekSchedules: ApprovedStaffSchedule[] = [];
      for (const dateStr of nextWeekDates) {
        const daySchedules = await ownerAPI.getApprovedSchedules(dateStr);
        nextWeekSchedules.push(...daySchedules);
      }

      // Create schedules for next week
      let copied = 0;
      for (const schedule of currentWeekSchedules) {
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setDate(scheduleDate.getDate() + 7);
        const dateStr = scheduleDate.toISOString().split('T')[0];

        const newSchedule = {
          staffId: schedule.staffId,
          date: dateStr,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          notes: schedule.notes || undefined,
        };

        // Check for conflicts
        if (!checkScheduleConflict(newSchedule, nextWeekSchedules)) {
          await ownerAPI.createSchedule(newSchedule);
          copied++;
        }
      }

      Alert.alert('Success', `Copied ${copied} schedule(s) to next week`);
      
      // Navigate to next week
      setSelectedWeekStart(nextWeekStart);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy week schedule');
    }
  };

  // Open add modal
  const openAddModal = () => {
    setSelectedStaffId(null);
    setSelectedDay('monday');
    setIsEmployeeDropdownOpen(false);
    setWeeklyScheduleNotes('');
    setRepeatWeekly(false);
    setRepeatWeeks(1);
    
    // Reset to current week if selected week is in the past
    if (isWeekInPast(selectedWeekStart)) {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - day);
      weekStart.setHours(0, 0, 0, 0);
      setSelectedWeekStart(weekStart);
    }
    
    // Reset weekly schedule to defaults
    setWeeklySchedule({
      monday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
      tuesday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
      wednesday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
      thursday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
      friday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
      saturday: { isWorking: true, startTime: '12:00', endTime: '12:00' },
      sunday: { isWorking: false, startTime: '12:00', endTime: '12:00' },
    });
    setShowWeeklySchedule(true);
  };

  // Render timeline view
  const renderTimelineView = () => {
    return (
      <ScrollView style={styles.timelineContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.timeColumn}>
          {timeSlots.map((time, index) => {
            const staffAtTime = getStaffForTimeSlot(time);
            const isCurrentHour = new Date().getHours().toString().padStart(2, '0') === time.split(':')[0];
            const isPast = new Date().getHours() > parseInt(time.split(':')[0]);

            return (
              <View key={index} style={styles.timeSlotRow}>
                <View style={styles.timeLabelContainer}>
                  <Text style={[styles.timeLabel, isCurrentHour && styles.currentTimeLabel]}>
                    {time}
                  </Text>
                  {isCurrentHour && <View style={styles.currentTimeIndicator} />}
                </View>
                <View style={styles.staffSlotsContainer}>
                  {staffAtTime.length > 0 ? (
                    <View style={styles.staffSlotsRow}>
                      {staffAtTime.map((schedule) => {
                        const status = getCurrentStatus(schedule);
                        const staff = getStaffById(schedule.staffId);
                        return (
                          <TouchableOpacity
                            key={schedule.id}
                            onPress={() => openEditModal(schedule)}
                            style={[
                              styles.staffSlot,
                              status === 'active' && styles.activeSlot,
                              status === 'scheduled' && styles.scheduledSlot,
                            ]}
                          >
                            <View style={styles.staffSlotContent}>
                              <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                  {getInitials(staff?.name || '')}
                                </Text>
                              </View>
                              <View style={styles.staffSlotInfo}>
                                <Text style={styles.staffSlotName} numberOfLines={1}>
                                  {staff?.name || 'Unknown'}
                                </Text>
                                <Text style={styles.staffSlotRole} numberOfLines={1}>
                                  {staff?.role || ''}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.emptySlot}>
                      <Text style={styles.emptySlotText}>No staff scheduled</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };


  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return {
      hour: hours12,
      minute: minutes,
      period,
      display: `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`,
    };
  };

  // Convert 12-hour time to 24-hour format
  const convertTo24Hour = (hour: number, minute: number, period: 'AM' | 'PM') => {
    let hours24 = hour;
    if (period === 'PM' && hour !== 12) {
      hours24 = hour + 12;
    } else if (period === 'AM' && hour === 12) {
      hours24 = 0;
    }
    return `${hours24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Open time picker modal
  const openTimePicker = (dayKey: string, type: 'start' | 'end', currentTime: string, mode: 'weekly' | 'edit' = 'weekly') => {
    const time12 = convertTo12Hour(currentTime);
    setSelectedHour(time12.hour);
    setSelectedMinute(time12.minute);
    setSelectedPeriod(time12.period as 'AM' | 'PM');
    
    // Measure button position using ref (only for weekly mode)
    if (mode === 'weekly') {
      const key = `${dayKey}-${type}`;
      const buttonRef = timeButtonRefs.current[key];
      
      if (buttonRef) {
        (buttonRef as any).measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          const buttonPosition = { x: pageX, y: pageY, width, height };
          setTimePickerConfig({ dayKey, type, currentTime, buttonPosition, mode });
          setShowTimePicker(true);
          
          // Scroll to initial values after modal is shown
          setTimeout(() => {
            const hours = Array.from({ length: 12 }, (_, i) => i + 1);
            const minutes = Array.from({ length: 60 }, (_, i) => i);
            const periods: ('AM' | 'PM')[] = ['AM', 'PM'];
            
            const hourIndex = hours.indexOf(time12.hour);
            const minuteIndex = minutes.indexOf(time12.minute);
            const periodIndex = periods.indexOf(time12.period as 'AM' | 'PM');
            
            if (hourIndex >= 0 && hourScrollRef.current) {
              const scrollY = hourIndex * 44;
              hourScrollRef.current.scrollTo({ y: scrollY, animated: false });
              setHourScrollY(scrollY);
            }
            if (minuteIndex >= 0 && minuteScrollRef.current) {
              const scrollY = minuteIndex * 44;
              minuteScrollRef.current.scrollTo({ y: scrollY, animated: false });
              setMinuteScrollY(scrollY);
            }
            if (periodIndex >= 0 && periodScrollRef.current) {
              const scrollY = periodIndex * 44;
              periodScrollRef.current.scrollTo({ y: scrollY, animated: false });
              setPeriodScrollY(scrollY);
            }
          }, 300);
        });
        return;
      }
    }
    
    // Fallback: open without position measurement (for edit mode or if ref not available)
    setTimePickerConfig({ dayKey, type, currentTime, mode });
    setShowTimePicker(true);
    
    setTimeout(() => {
      const hours = Array.from({ length: 12 }, (_, i) => i + 1);
      const minutes = Array.from({ length: 60 }, (_, i) => i);
      const periods: ('AM' | 'PM')[] = ['AM', 'PM'];
      
      const hourIndex = hours.indexOf(time12.hour);
      const minuteIndex = minutes.indexOf(time12.minute);
      const periodIndex = periods.indexOf(time12.period as 'AM' | 'PM');
      
      if (hourIndex >= 0 && hourScrollRef.current) {
        const scrollY = hourIndex * 44;
        hourScrollRef.current.scrollTo({ y: scrollY, animated: false });
        setHourScrollY(scrollY);
      }
      if (minuteIndex >= 0 && minuteScrollRef.current) {
        const scrollY = minuteIndex * 44;
        minuteScrollRef.current.scrollTo({ y: scrollY, animated: false });
        setMinuteScrollY(scrollY);
      }
      if (periodIndex >= 0 && periodScrollRef.current) {
        const scrollY = periodIndex * 44;
        periodScrollRef.current.scrollTo({ y: scrollY, animated: false });
        setPeriodScrollY(scrollY);
      }
    }, 150);
  };

  // Handle time picker selection
  const handleTimePickerConfirm = (hour: number, minute: number, period: 'AM' | 'PM') => {
    if (!timePickerConfig) return;
    
    const time24 = convertTo24Hour(hour, minute, period);
    const mode = timePickerConfig.mode || 'weekly';
    
    if (mode === 'edit') {
      // Update scheduleForm for edit schedule modal
      const field = timePickerConfig.type === 'start' ? 'startTime' : 'endTime';
      setScheduleForm(prev => ({
        ...prev,
        [field]: time24,
      }));
    } else {
      // Apply time to weekly schedule
      setWeeklySchedule(prev => ({
        ...prev,
        [timePickerConfig.dayKey]: {
          ...prev[timePickerConfig.dayKey],
          [timePickerConfig.type === 'start' ? 'startTime' : 'endTime']: time24,
        },
      }));
    }
    
    setShowTimePicker(false);
    setTimePickerConfig(null);
  };

  // Render weekly schedule modal
  const renderWeeklyScheduleModal = () => {
    const daysOfWeek = [
      { key: 'monday', label: 'Mon', short: 'M' },
      { key: 'tuesday', label: 'Tue', short: 'T' },
      { key: 'wednesday', label: 'Wed', short: 'W' },
      { key: 'thursday', label: 'Thu', short: 'T' },
      { key: 'friday', label: 'Fri', short: 'F' },
      { key: 'saturday', label: 'Sat', short: 'S' },
      { key: 'sunday', label: 'Sun', short: 'S' },
    ];

    // Get current week range for display
    const getWeekRangeForDisplay = () => {
      const startDate = new Date(selectedWeekStart);
      const endDate = new Date(selectedWeekStart);
      endDate.setDate(startDate.getDate() + 6);
      
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      };
      
      const year = startDate.getFullYear();
      return `${formatDate(startDate)} - ${formatDate(endDate)}, ${year}`;
    };

    // Check if any day is selected as available
    const hasAvailableDays = Object.values(weeklySchedule).some(day => day.isWorking);
    
    // Get selected days for the current schedule
    const getSelectedDays = () => {
      return Object.keys(weeklySchedule).filter(dayKey => weeklySchedule[dayKey].isWorking);
    };

    return (
      <Modal
        visible={showWeeklySchedule}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowWeeklySchedule(false);
          setSelectedStaffId(null);
          setIsEmployeeDropdownOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.newModalContent}>
            {/* Week Schedule Header */}
            <View style={styles.newModalHeader}>
              {(() => {
                // Check if previous week would be in the past
                const prevWeekStart = new Date(selectedWeekStart);
                prevWeekStart.setDate(selectedWeekStart.getDate() - 7);
                const isPrevWeekPast = isWeekInPast(prevWeekStart);
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.newHeaderNavButton,
                      isPrevWeekPast && styles.newHeaderNavButtonDisabled
                    ]}
                    onPress={() => navigateWeek('prev')}
                    disabled={isPrevWeekPast}
                  >
                    <Ionicons 
                      name="chevron-back" 
                      size={20} 
                      color={isPrevWeekPast ? "#666" : "#fff"} 
                    />
                  </TouchableOpacity>
                );
              })()}
              
              <View style={styles.newHeaderContent}>
                <View style={styles.newHeaderIcon}>
                  <Ionicons name="calendar-outline" size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.newHeaderTitle}>Week Schedule</Text>
                  <Text style={styles.newHeaderDate}>{getWeekRangeForDisplay()}</Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.newHeaderNavButton}
                onPress={() => navigateWeek('next')}
              >
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.newModalBody} showsVerticalScrollIndicator={false}>
              {/* Employee Selection */}
              <View style={styles.employeeSection}>
                <Text style={styles.sectionTitle}>Select Employee</Text>
                <View style={styles.employeeDropdownContainer}>
                  {/* Closed State - Shows Selected Employee or Placeholder */}
                  <TouchableOpacity
                    style={styles.employeeDropdownTrigger}
                    onPress={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                  >
                    <Text style={[
                      styles.employeeDropdownTriggerText,
                      !selectedStaffId && styles.employeeDropdownPlaceholder,
                    ]}>
                      {selectedStaffId 
                        ? staffMembers.find(m => m.id === selectedStaffId)?.name || 'Select Employee'
                        : 'Select Employee'}
                    </Text>
                    <Ionicons 
                      name={isEmployeeDropdownOpen ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>

                  {/* Open State - Dropdown List */}
                  {isEmployeeDropdownOpen && (
                    <View style={styles.employeeDropdownListWrapper}>
                      <View style={styles.employeeDropdownList}>
                        {staffMembers.length === 0 ? (
                          <View style={styles.employeeOption}>
                            <Text style={styles.employeeOptionText}>No employees available</Text>
                          </View>
                        ) : (
                          <ScrollView 
                            style={styles.employeeDropdownScroll}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                            bounces={false}
                          >
                            {staffMembers.map((member, index) => (
                              <TouchableOpacity
                                key={member.id}
                                style={[
                                  styles.employeeOption,
                                  selectedStaffId === member.id && styles.employeeOptionSelected,
                                  index === staffMembers.length - 1 && styles.employeeOptionLast,
                                ]}
                                onPress={() => {
                                  setSelectedStaffId(member.id);
                                  setIsEmployeeDropdownOpen(false);
                                }}
                              >
                                <Text style={[
                                  styles.employeeOptionText,
                                  selectedStaffId === member.id && styles.employeeOptionTextSelected,
                                ]}>
                                  {member.name}
                                </Text>
                                {selectedStaffId === member.id && (
                                  <Ionicons name="checkmark" size={20} color="#333" />
                                )}
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Employee Selection Reminder */}
              {!selectedStaffId && (
                <View style={styles.employeeReminder}>
                  <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
                  <Text style={styles.employeeReminderText}>
                    Please select an employee to continue scheduling
                  </Text>
                </View>
              )}

              {/* Select Days Section */}
              <View style={[
                styles.selectDaysSection,
                !selectedStaffId && styles.sectionDisabled,
              ]}>
                <Text style={styles.sectionTitle}>Select Days</Text>
                <View style={styles.daysRow}>
                  {daysOfWeek.map((day) => {
                    const daySchedule = weeklySchedule[day.key];
                    const isAvailable = daySchedule.isWorking;
                    const isDaySelected = selectedDay === day.key;
                    
                    return (
                      <TouchableOpacity
                        key={day.key}
                        style={[
                          styles.dayButtonSmall,
                          isAvailable && styles.dayButtonSmallSelected,
                          !isAvailable && styles.dayButtonSmallUnavailable,
                          isDaySelected && styles.dayButtonSmallActive,
                          !selectedStaffId && styles.dayButtonDisabled,
                        ]}
                        onPress={() => {
                          if (!selectedStaffId) return;
                          setSelectedDay(day.key);
                        }}
                        disabled={!selectedStaffId}
                      >
                        <Text style={[
                          styles.dayButtonSmallText,
                          isAvailable && styles.dayButtonSmallTextSelected,
                          !isAvailable && styles.dayButtonSmallTextUnavailable,
                          !selectedStaffId && styles.dayButtonTextDisabled,
                        ]}>
                          {day.short}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Availability Section */}
              <View style={[
                styles.availabilitySection,
                !selectedStaffId && styles.sectionDisabled,
              ]}>
                <View style={styles.availabilityHeader}>
                  <View style={styles.availabilityIconContainer}>
                    <Ionicons name="calendar" size={20} color={!selectedStaffId ? "#999" : "#333"} />
                  </View>
                  <View style={styles.availabilityTextContainer}>
                    <Text style={[
                      styles.availabilityTitle,
                      !selectedStaffId && styles.textDisabled,
                    ]}>
                      Availability
                    </Text>
                    <Text style={[
                      styles.availabilitySubtitle,
                      !selectedStaffId && styles.textDisabled,
                    ]}>
                      Available
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.availabilityToggle,
                      weeklySchedule[selectedDay]?.isWorking && styles.availabilityToggleActive,
                      !selectedStaffId && styles.availabilityToggleDisabled,
                    ]}
                    onPress={() => {
                      if (!selectedStaffId) return;
                      setWeeklySchedule(prev => ({
                        ...prev,
                        [selectedDay]: {
                          ...prev[selectedDay],
                          isWorking: !prev[selectedDay].isWorking,
                        },
                      }));
                    }}
                    disabled={!selectedStaffId}
                  >
                    <View style={[
                      styles.availabilityToggleCircle,
                      weeklySchedule[selectedDay]?.isWorking && styles.availabilityToggleCircleActive,
                    ]} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Time Section */}
              {weeklySchedule[selectedDay]?.isWorking && (
                <>
                  <View style={[
                    styles.timeSection,
                    !selectedStaffId && styles.sectionDisabled,
                  ]}>
                    <View style={styles.timeRow}>
                      <View style={styles.timeField}>
                        <View style={styles.timeFieldHeader}>
                          <Ionicons name="time-outline" size={16} color={!selectedStaffId ? "#999" : "#666"} />
                          <Text style={[
                            styles.timeFieldLabel,
                            !selectedStaffId && styles.textDisabled,
                          ]}>
                            Start Time
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.timeInput,
                            !selectedStaffId && styles.timeInputDisabled,
                          ]}
                          onPress={() => {
                            if (!selectedStaffId) return;
                            openTimePicker(selectedDay, 'start', weeklySchedule[selectedDay].startTime);
                          }}
                          disabled={!selectedStaffId || !weeklySchedule[selectedDay]?.isWorking}
                        >
                          <Text style={[
                            styles.timeInputText,
                            !selectedStaffId && styles.textDisabled,
                          ]}>
                            {convertTo12Hour(weeklySchedule[selectedDay].startTime).display}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.timeField}>
                        <View style={styles.timeFieldHeader}>
                          <Ionicons name="time-outline" size={16} color={!selectedStaffId ? "#999" : "#666"} />
                          <Text style={[
                            styles.timeFieldLabel,
                            !selectedStaffId && styles.textDisabled,
                          ]}>
                            End Time
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.timeInput,
                            !selectedStaffId && styles.timeInputDisabled,
                          ]}
                          onPress={() => {
                            if (!selectedStaffId) return;
                            openTimePicker(selectedDay, 'end', weeklySchedule[selectedDay].endTime);
                          }}
                          disabled={!selectedStaffId || !weeklySchedule[selectedDay]?.isWorking}
                        >
                          <Text style={[
                            styles.timeInputText,
                            !selectedStaffId && styles.textDisabled,
                          ]}>
                            {convertTo12Hour(weeklySchedule[selectedDay].endTime).display}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Additional Notes Section */}
                  <View style={[
                    styles.notesSection,
                    !selectedStaffId && styles.sectionDisabled,
                  ]}>
                    <View style={styles.notesSectionHeader}>
                      <Ionicons name="document-text-outline" size={16} color={!selectedStaffId ? "#999" : "#666"} />
                      <Text style={[
                        styles.notesSectionTitle,
                        !selectedStaffId && styles.textDisabled,
                      ]}>
                        Additional Notes
                      </Text>
                      <Text style={[
                        styles.notesSectionOptional,
                        !selectedStaffId && styles.textDisabled,
                      ]}>
                        (Optional)
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.notesInput,
                        !selectedStaffId && styles.notesInputDisabled,
                      ]}
                      placeholder="Add any special instructions..."
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      editable={!!selectedStaffId}
                      value={weeklyScheduleNotes}
                      onChangeText={setWeeklyScheduleNotes}
                    />
                  </View>

                  {/* Recurring Schedules Section */}
                  <View style={[
                    styles.recurringSection,
                    !selectedStaffId && styles.sectionDisabled,
                  ]}>
                    <View style={styles.recurringSectionHeader}>
                      <Ionicons name="repeat-outline" size={16} color={!selectedStaffId ? "#999" : "#666"} />
                      <Text style={[
                        styles.recurringSectionTitle,
                        !selectedStaffId && styles.textDisabled,
                      ]}>
                        Repeat Weekly
                      </Text>
                    </View>
                    <View style={styles.recurringContent}>
                      <TouchableOpacity
                        style={[
                          styles.recurringToggle,
                          repeatWeekly && styles.recurringToggleActive,
                          !selectedStaffId && styles.recurringToggleDisabled,
                        ]}
                        onPress={() => {
                          if (selectedStaffId) {
                            setRepeatWeekly(!repeatWeekly);
                          }
                        }}
                        disabled={!selectedStaffId}
                      >
                        <View style={[
                          styles.recurringToggleCircle,
                          repeatWeekly && styles.recurringToggleCircleActive,
                        ]} />
                      </TouchableOpacity>
                      {repeatWeekly && (
                        <View style={styles.recurringWeeksContainer}>
                          <Text style={[
                            styles.recurringWeeksLabel,
                            !selectedStaffId && styles.textDisabled,
                          ]}>
                            For
                          </Text>
                          <TextInput
                            style={[
                              styles.recurringWeeksInput,
                              !selectedStaffId && styles.recurringWeeksInputDisabled,
                            ]}
                            value={repeatWeeks.toString()}
                            onChangeText={(text) => {
                              const num = parseInt(text) || 1;
                              if (num >= 1 && num <= 52) {
                                setRepeatWeeks(num);
                              }
                            }}
                            keyboardType="numeric"
                            editable={!!selectedStaffId && repeatWeekly}
                            placeholder="1"
                          />
                          <Text style={[
                            styles.recurringWeeksLabel,
                            !selectedStaffId && styles.textDisabled,
                          ]}>
                            week(s)
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Copy Week Section */}
                  {selectedStaffId && (
                    <View style={styles.copyWeekSection}>
                      <TouchableOpacity
                        style={styles.copyWeekButton}
                        onPress={copyWeekToNext}
                      >
                        <Ionicons name="copy-outline" size={18} color="#333" />
                        <Text style={styles.copyWeekButtonText}>
                          Copy This Week to Next Week
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.newModalFooter}>
              <TouchableOpacity
                style={styles.newCancelButton}
                onPress={() => {
                  setShowWeeklySchedule(false);
                  setSelectedStaffId(null);
                  setIsEmployeeDropdownOpen(false);
                }}
              >
                <Text style={styles.newCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.newSaveButton,
                  !selectedStaffId && styles.newSaveButtonDisabled,
                ]}
                onPress={handleSaveWeeklySchedule}
                disabled={!selectedStaffId}
              >
                <Text style={[
                  styles.newSaveButtonText,
                  !selectedStaffId && styles.newSaveButtonTextDisabled,
                ]}>
                  Save Schedule
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render edit schedule modal
  const renderScheduleModal = (isEdit: boolean) => {
    const staff = isEdit && editingSchedule 
      ? getStaffById(editingSchedule.staffId)
      : null;

    if (!isEdit) return null;

    return (
      <Modal
        visible={showEditSchedule}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowEditSchedule(false);
          setEditingSchedule(null);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEdit ? 'Edit Schedule' : 'Add Schedule'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEditSchedule(false);
                  setEditingSchedule(null);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {staff && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Staff Member</Text>
                  <Text style={styles.staffDisplayName}>{staff.name}</Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={scheduleForm.date}
                  onChangeText={(text) => setScheduleForm({ ...scheduleForm, date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <View style={styles.timeFieldHeader}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.timeFieldLabel}>Start Time</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => {
                      openTimePicker('edit', 'start', scheduleForm.startTime, 'edit');
                    }}
                  >
                    <Text style={styles.timeInputText}>
                      {convertTo12Hour(scheduleForm.startTime).display}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.timeFieldHeader}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.timeFieldLabel}>End Time</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => {
                      openTimePicker('edit', 'end', scheduleForm.endTime, 'edit');
                    }}
                  >
                    <Text style={styles.timeInputText}>
                      {convertTo12Hour(scheduleForm.endTime).display}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={scheduleForm.notes}
                  onChangeText={(text) => setScheduleForm({ ...scheduleForm, notes: text })}
                  placeholder="Add any notes..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditSchedule(false);
                  setEditingSchedule(null);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditSchedule}
              >
                <Text style={styles.saveButtonText}>Update Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render iOS-style time picker modal
  const renderTimePickerModal = () => {
    if (!timePickerConfig) return null;

    // Generate hours (1-12)
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    // Generate minutes (0-59)
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const periods: ('AM' | 'PM')[] = ['AM', 'PM'];

    return (
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          // Auto-save when dismissed
          handleTimePickerConfirm(selectedHour, selectedMinute, selectedPeriod);
        }}
      >
        <TouchableOpacity
          style={styles.timePickerModalOverlay}
          activeOpacity={1}
          onPress={() => {
            // Auto-save when tapping outside
            handleTimePickerConfirm(selectedHour, selectedMinute, selectedPeriod);
          }}
        >
          <View
            style={styles.timePickerModalContent}
            onStartShouldSetResponder={() => true}
          >
            {/* Optional: Minimal header with just title, no buttons */}
            <View style={styles.timePickerModalHeader}>
              <Text style={styles.timePickerModalTitle}>
                {timePickerConfig.type === 'start' ? 'Turn On' : 'Turn Off'}
              </Text>
            </View>

            <View style={styles.timePickerWheelContainer}>
              {/* Selection Indicator - Positioned at center */}
              <View style={styles.timePickerSelectionIndicator} />
              
              {/* Hours Column */}
              <View style={styles.timePickerColumn}>
                <ScrollView
                  ref={hourScrollRef}
                  style={styles.timePickerWheel}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.timePickerWheelContent}
                  snapToInterval={44}
                  decelerationRate="fast"
                  scrollEventThrottle={16}
                  onScroll={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    setHourScrollY(offsetY);
                    // Calculate which item is at center
                    // Container center is at 100px (200px height / 2)
                    // Item center = padding (88) + itemY + 22 - scrollY
                    // For centered item: 88 + itemY + 22 - scrollY = 100
                    // So: itemY = scrollY + 100 - 88 - 22 = scrollY - 10
                    // Index = itemY / 44 = (scrollY - 10) / 44
                    // Actually simpler: when scrollY = i*44, item i is centered
                    const index = Math.round(offsetY / 44);
                    if (index >= 0 && index < hours.length) {
                      setSelectedHour(hours[index]);
                    }
                  }}
                  onScrollEndDrag={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 44);
                    if (index >= 0 && index < hours.length) {
                      setSelectedHour(hours[index]);
                      hourScrollRef.current?.scrollTo({ y: index * 44, animated: true });
                    }
                  }}
                  onMomentumScrollEnd={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 44);
                    if (index >= 0 && index < hours.length) {
                      setSelectedHour(hours[index]);
                      hourScrollRef.current?.scrollTo({ y: index * 44, animated: true });
                    }
                  }}
                >
                  {hours.map((hour, index) => {
                    const itemY = index * 44;
                    const padding = 78;
                    const containerCenter = 100; // 200px container / 2
                    const itemCenterY = padding + itemY + 22; // Item center position
                    const scrollCenterY = containerCenter; // Always 100px (center of container)
                    const actualItemCenter = itemCenterY - hourScrollY; // Actual position after scroll
                    const distanceFromCenter = Math.abs(actualItemCenter - scrollCenterY);
                    const isSelected = distanceFromCenter < 22;
                    
                    return (
                      <View key={hour} style={styles.timePickerWheelItem}>
                        <Text
                          style={[
                            styles.timePickerWheelText,
                            isSelected && styles.timePickerWheelTextSelected,
                          ]}
                        >
                          {hour}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Minutes Column */}
              <View style={styles.timePickerColumn}>
                <ScrollView
                  ref={minuteScrollRef}
                  style={styles.timePickerWheel}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.timePickerWheelContent}
                  snapToInterval={44}
                  decelerationRate="fast"
                  scrollEventThrottle={16}
                  onScroll={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    setMinuteScrollY(offsetY);
                    const index = Math.round(offsetY / 44);
                    if (index >= 0 && index < minutes.length) {
                      setSelectedMinute(minutes[index]);
                    }
                  }}
                  onScrollEndDrag={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 44);
                    if (index >= 0 && index < minutes.length) {
                      setSelectedMinute(minutes[index]);
                      minuteScrollRef.current?.scrollTo({ y: index * 44, animated: true });
                    }
                  }}
                  onMomentumScrollEnd={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 44);
                    if (index >= 0 && index < minutes.length) {
                      setSelectedMinute(minutes[index]);
                      minuteScrollRef.current?.scrollTo({ y: index * 44, animated: true });
                    }
                  }}
                >
                  {minutes.map((minute, index) => {
                    const itemY = index * 44;
                    const padding = 78;
                    const containerCenter = 100;
                    const itemCenterY = padding + itemY + 22;
                    const scrollCenterY = containerCenter;
                    const actualItemCenter = itemCenterY - minuteScrollY;
                    const distanceFromCenter = Math.abs(actualItemCenter - scrollCenterY);
                    const isSelected = distanceFromCenter < 22;
                    
                    return (
                      <View key={minute} style={styles.timePickerWheelItem}>
                        <Text
                          style={[
                            styles.timePickerWheelText,
                            isSelected && styles.timePickerWheelTextSelected,
                          ]}
                        >
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>

              {/* AM/PM Column */}
              <View style={styles.timePickerColumn}>
                <ScrollView
                  ref={periodScrollRef}
                  style={styles.timePickerWheel}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.timePickerWheelContent}
                  snapToInterval={44}
                  decelerationRate="fast"
                  scrollEventThrottle={16}
                  onScroll={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    setPeriodScrollY(offsetY);
                    const index = Math.round(offsetY / 44);
                    if (index >= 0 && index < periods.length) {
                      setSelectedPeriod(periods[index]);
                    }
                  }}
                  onScrollEndDrag={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 44);
                    if (index >= 0 && index < periods.length) {
                      setSelectedPeriod(periods[index]);
                      periodScrollRef.current?.scrollTo({ y: index * 44, animated: true });
                    }
                  }}
                  onMomentumScrollEnd={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 44);
                    if (index >= 0 && index < periods.length) {
                      setSelectedPeriod(periods[index]);
                      periodScrollRef.current?.scrollTo({ y: index * 44, animated: true });
                    }
                  }}
                >
                  {periods.map((period, index) => {
                    const itemY = index * 44;
                    const padding = 78;
                    const containerCenter = 100;
                    const itemCenterY = padding + itemY + 22;
                    const scrollCenterY = containerCenter;
                    const actualItemCenter = itemCenterY - periodScrollY;
                    const distanceFromCenter = Math.abs(actualItemCenter - scrollCenterY);
                    const isSelected = distanceFromCenter < 22;
                    
                    return (
                      <View key={period} style={styles.timePickerWheelItem}>
                        <Text
                          style={[
                            styles.timePickerWheelText,
                            isSelected && styles.timePickerWheelTextSelected,
                          ]}
                        >
                          {period}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Render pending requests modal
  const renderPendingRequestsModal = () => {
    return (
      <Modal
        visible={showPendingRequests}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPendingRequests(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pendingRequestsModalContent}>
            <View style={styles.pendingRequestsHeader}>
              <View style={styles.pendingRequestsHeaderLeft}>
                <Text style={styles.pendingRequestsTitle}>Pending Requests</Text>
                <Text style={styles.pendingRequestsSubtitle}>
                  {scheduleRequests.length} {scheduleRequests.length === 1 ? 'request' : 'requests'} awaiting review
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowPendingRequests(false)}
                style={styles.pendingRequestsCloseButton}
              >
                <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pendingRequestsBody}>
              {scheduleRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
                  <Text style={styles.emptyStateText}>No pending requests</Text>
                </View>
              ) : (
                scheduleRequests.map((request) => (
                  <View key={request.id} style={styles.pendingRequestCard}>
                    <View style={styles.pendingRequestHeader}>
                      <Text style={styles.pendingRequestName}>{request.staffName}</Text>
                      <View style={styles.pendingRequestBadge}>
                        <Text style={styles.pendingRequestBadgeText}>Pending</Text>
                      </View>
                    </View>
                    <Text style={styles.pendingRequestDate}>{formatDate(new Date(request.date))}</Text>
                    <View style={styles.pendingRequestDetails}>
                      <View style={styles.pendingRequestDetailRow}>
                        <Ionicons name="time-outline" size={18} color="#666" />
                        <Text style={styles.pendingRequestDetailText}>
                          {request.startTime} - {request.endTime}
                        </Text>
                      </View>
                      {request.notes && (
                        <View style={styles.pendingRequestDetailRow}>
                          <Ionicons name="document-text-outline" size={18} color="#666" />
                          <Text style={styles.pendingRequestDetailText}>{request.notes}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.pendingRequestActions}>
                      <TouchableOpacity
                        style={styles.pendingModifyButton}
                        onPress={() => handleApproveRequest(request.id, true)}
                      >
                        <Ionicons name="create-outline" size={18} color="#333" />
                        <Text style={styles.pendingModifyButtonText}>Modify</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.pendingApproveButton}
                        onPress={() => handleApproveRequest(request.id, false)}
                      >
                        <Ionicons name="checkmark" size={18} color="#fff" />
                        <Text style={styles.pendingApproveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.pendingRejectButton}
                        onPress={() => handleRejectRequest(request.id)}
                      >
                        <Ionicons name="close" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render reject request modal
  const renderRejectModal = () => {
    return (
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedRequestId(null);
        }}
      >
        <View style={styles.rejectModalOverlay}>
          <View style={styles.rejectModalContent}>
            <View style={styles.rejectModalHeader}>
              <Text style={styles.rejectModalTitle}>Reject Schedule Request</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequestId(null);
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.rejectModalBody}>
              <Text style={styles.rejectModalLabel}>
                Enter reason for rejection (optional):
              </Text>
              <TextInput
                style={styles.rejectModalInput}
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.rejectModalActions}>
              <TouchableOpacity
                style={styles.rejectModalCancelButton}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequestId(null);
                }}
              >
                <Text style={styles.rejectModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectModalConfirmButton}
                onPress={confirmRejectRequest}
              >
                <Text style={styles.rejectModalConfirmText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render hamburger menu modal
  const renderHamburgerMenu = () => {
    const menuOptions = [
      { 
        label: 'Add Staff', 
        icon: 'person-add-outline',
        onPress: () => {
          setShowHamburgerMenu(false);
          router.push('/(owner)/AddStaff');
        }
      },
      { 
        label: 'Staff Management', 
        icon: 'people-outline',
        onPress: () => {
          setShowHamburgerMenu(false);
          router.push('/(owner)/StaffManagement');
        }
      },
      { 
        label: 'Time Off Request', 
        icon: 'time-outline',
        onPress: () => {
          setShowHamburgerMenu(false);
          router.push('/(owner)/TimeOffRequest');
        }
      },
      { 
        label: 'Daily Schedule', 
        icon: 'today-outline',
        onPress: () => {
          setShowHamburgerMenu(false);
          router.push('/(owner)/DailySchedule');
        }
      },
    ];

    return (
      <Modal
        visible={showHamburgerMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHamburgerMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowHamburgerMenu(false)}
        >
          <View style={styles.menuCard} onStartShouldSetResponder={() => true}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuOption,
                  index === menuOptions.length - 1 && styles.menuOptionLast
                ]}
                onPress={option.onPress}
              >
                <Ionicons name={option.icon as any} size={20} color="#333" />
                <Text style={styles.menuOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const pendingCount = scheduleRequests.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.title}>Staff Schedule</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowPendingRequests(true)}
            style={styles.notificationBadge}
          >
            <Ionicons name="notifications" size={24} color="#333" />
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowHamburgerMenu(true)} 
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday} style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          {isToday && <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>Today</Text></View>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderTimelineView()}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      {renderWeeklyScheduleModal()}
      {renderScheduleModal(true)}
      {renderPendingRequestsModal()}
      {renderTimePickerModal()}
      {renderHamburgerMenu()}
      {renderRejectModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 8,
  },
  notificationBadge: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  navButton: {
    padding: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  todayBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  viewToggleActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  viewToggleTextActive: {
    color: '#fff',
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  // Timeline View Styles
  timelineContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  timeSlotRow: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 8,
  },
  timeLabelContainer: {
    width: 60,
    position: 'relative',
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  currentTimeLabel: {
    color: '#000',
    fontWeight: '700',
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: -8,
    width: 3,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  staffSlotsContainer: {
    flex: 1,
    marginLeft: 12,
  },
  staffSlotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  staffSlot: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
    borderLeftWidth: 3,
    borderLeftColor: '#999',
  },
  activeSlot: {
    backgroundColor: '#E8F5E9',
    borderLeftColor: '#4CAF50',
  },
  scheduledSlot: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
  },
  staffSlotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  staffSlotInfo: {
    flex: 1,
  },
  staffSlotName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  staffSlotRole: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  emptySlot: {
    justifyContent: 'center',
    paddingVertical: 8,
  },
  emptySlotText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  timeColumn: {
    flex: 1,
  },
  // Staff Cards View Styles
  staffCardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  staffCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  staffCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  staffCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffCardAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  staffCardInfo: {
    flex: 1,
  },
  staffCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  staffCardRole: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    gap: 6,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  staffCardSchedule: {
    marginBottom: 16,
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleText: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  deleteButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    backgroundColor: '#FFF5F5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  staffSelector: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  staffOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  staffOptionSelected: {
    backgroundColor: '#F5F5F5',
  },
  staffOptionText: {
    fontSize: 16,
    color: '#333',
  },
  staffDisplayName: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#000',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Request Modal Styles
  requestCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestStaffName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  requestBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  requestBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
  },
  requestDetails: {
    marginBottom: 12,
    gap: 8,
  },
  requestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestDetailText: {
    fontSize: 14,
    color: '#666',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modifyButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modifyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  rejectButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
  },
  // Pending Requests Modal Styles (matching screenshot)
  pendingRequestsModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    marginTop: 50,
  },
  pendingRequestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pendingRequestsHeaderLeft: {
    flex: 1,
  },
  pendingRequestsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  pendingRequestsSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  pendingRequestsCloseButton: {
    padding: 4,
    marginTop: 4,
  },
  pendingRequestsBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  pendingRequestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pendingRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingRequestName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  pendingRequestBadge: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingRequestBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B8860B',
  },
  pendingRequestDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  pendingRequestDetails: {
    marginBottom: 16,
    gap: 10,
  },
  pendingRequestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingRequestDetailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  pendingRequestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingModifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    gap: 6,
    flex: 1,
  },
  pendingModifyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  pendingApproveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    gap: 6,
    flex: 1,
  },
  pendingApproveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  pendingRejectButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  // New Modal Styles (matching screenshot)
  newModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flex: 1,
    marginTop: 50,
  },
  newModalHeader: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  newHeaderNavButton: {
    padding: 8,
  },
  newHeaderNavButtonDisabled: {
    opacity: 0.4,
  },
  newHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  newHeaderIcon: {
    marginRight: 8,
  },
  newHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  newHeaderDate: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  newModalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  employeeSection: {
    marginBottom: 24,
    marginTop: 8,
    zIndex: 99999,
    elevation: 30,
  },
  employeeDropdownContainer: {
    position: 'relative',
    zIndex: 99999,
    elevation: 30,
  },
  employeeDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  employeeDropdownTriggerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  employeeDropdownPlaceholder: {
    color: '#999',
  },
  employeeDropdownListWrapper: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    zIndex: 99999,
    elevation: 25, // Very high elevation for Android
    backgroundColor: 'transparent',
  },
  employeeDropdownList: {
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    maxHeight: 240, // Shows approximately 4-5 employees at once (48px per item)
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 25, // Very high elevation for Android
    marginTop: 4,
    zIndex: 99999,
  },
  employeeDropdownScroll: {
    maxHeight: 240,
    backgroundColor: '#FFFFFF',
  },
  employeeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FFFFFF',
  },
  employeeOptionSelected: {
    backgroundColor: '#F5F5F5',
  },
  employeeOptionLast: {
    borderBottomWidth: 0,
  },
  employeeOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  employeeOptionTextSelected: {
    fontWeight: '600',
  },
  employeeReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  employeeReminderText: {
    fontSize: 14,
    color: '#E65100',
    flex: 1,
  },
  sectionDisabled: {
    opacity: 0.6,
  },
  dayButtonDisabled: {
    opacity: 0.5,
  },
  dayButtonTextDisabled: {
    color: '#999',
  },
  textDisabled: {
    color: '#999',
  },
  availabilityToggleDisabled: {
    opacity: 0.5,
  },
  timeInputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  notesInputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    color: '#999',
  },
  selectDaysSection: {
    marginBottom: 24,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    zIndex: 1,
  },
  dayButtonSmall: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 40,
  },
  dayButtonSmallSelected: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  dayButtonSmallUnavailable: {
    backgroundColor: '#e0e0e0',
    borderColor: '#d0d0d0',
  },
  dayButtonSmallActive: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  dayButtonSmallText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  dayButtonSmallTextSelected: {
    color: '#fff',
  },
  dayButtonSmallTextUnavailable: {
    color: '#999',
  },
  availabilitySection: {
    marginBottom: 24,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  availabilityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  availabilityTextContainer: {
    flex: 1,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  availabilitySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  availabilityToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  availabilityToggleActive: {
    backgroundColor: '#4CAF50',
  },
  availabilityToggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  availabilityToggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  timeSection: {
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeField: {
    flex: 1,
  },
  timeFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 6,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  timeInputText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 6,
  },
  notesSectionOptional: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
  },
  recurringSection: {
    marginBottom: 24,
  },
  recurringSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recurringSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 6,
  },
  recurringContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recurringToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  recurringToggleActive: {
    backgroundColor: '#333',
  },
  recurringToggleDisabled: {
    opacity: 0.5,
  },
  recurringToggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  recurringToggleCircleActive: {
    alignSelf: 'flex-end',
  },
  recurringWeeksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recurringWeeksLabel: {
    fontSize: 14,
    color: '#666',
  },
  recurringWeeksInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#fff',
    width: 60,
    textAlign: 'center',
  },
  recurringWeeksInputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    color: '#999',
  },
  // Copy Week Styles
  copyWeekSection: {
    marginBottom: 24,
  },
  copyWeekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  copyWeekButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  newModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  newCancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  newCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  newSaveButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#333',
  },
  newSaveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  newSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  newSaveButtonTextDisabled: {
    color: '#999',
  },
  // Weekly Schedule Modal Styles (kept for backward compatibility)
  weeklyModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  availabilityInfoText: {
    fontSize: 14,
    color: '#1976D2',
    flex: 1,
  },
  weekCalendarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  weekCalendarContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  weekCalendarLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  weekCalendarDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  weekDaysContainer: {
    marginBottom: 20,
  },
  weekDaysScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  weekBar: {
    flexDirection: 'row',
    backgroundColor: '#333',
    marginHorizontal: 20,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  weekBarDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  weekBarDaySelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  weekBarDayAvailable: {
    backgroundColor: '#4CAF50',
  },
  weekBarDaySelectedAvailable: {
    backgroundColor: '#45a049', // Slightly darker green when selected and available
  },
  weekBarDayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  weekBarDayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  weekBarDayTextAvailable: {
    color: '#fff',
    fontWeight: '700',
  },
  dayDetailsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayDetailLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dayDetailToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  dayDetailToggleActive: {
    backgroundColor: '#4CAF50',
  },
  dayDetailToggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  dayDetailToggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  dayDetailTimeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  dayDetailTimeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dayDetailTimeTextDisabled: {
    color: '#999',
  },
  dayNotesContainer: {
    marginTop: 16,
  },
  dayNotesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    marginTop: 8,
  },
  dayCard: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
  },
  dayCardInactive: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayCardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dayToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  dayToggleActive: {
    backgroundColor: '#4CAF50',
  },
  dayToggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  dayToggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  dayCardContent: {
    gap: 8,
  },
  dayCardInactiveContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  dayCardInactiveText: {
    fontSize: 14,
    color: '#999',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  availabilityBadgeText: {
    fontSize: 11,
    color: '#2E7D32',
    flex: 1,
  },
  timePickerSection: {
    gap: 6,
  },
  timePickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  timeButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  // iOS-style Time Picker Modal Styles
  timePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  timePickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Extra padding for safe area on iOS
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  timePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  timePickerModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  timePickerWheelContainer: {
    flexDirection: 'row',
    height: 200,
    position: 'relative',
    backgroundColor: '#F9F9F9',
  },
  timePickerColumn: {
    flex: 1,
    position: 'relative',
  },
  timePickerWheel: {
    flex: 1,
  },
  timePickerWheelContent: {
    paddingVertical: 78,
  },
  timePickerWheelItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerWheelText: {
    fontSize: 20,
    color: '#999',
  },
  timePickerWheelTextSelected: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
  },
  timePickerSelectionIndicator: {
    position: 'absolute',
    top: 78, // 100px (container center) - 22px (half item height) = 78px
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    pointerEvents: 'none',
    zIndex: 1,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuCard: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuOptionLast: {
    borderBottomWidth: 0,
  },
  menuOptionText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  // Reject Modal Styles
  rejectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  rejectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rejectModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  rejectModalBody: {
    padding: 20,
  },
  rejectModalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  rejectModalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rejectModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  rejectModalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  rejectModalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  rejectModalConfirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  rejectModalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
