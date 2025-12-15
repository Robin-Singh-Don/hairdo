import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import { useAuth } from '../../contexts/AuthContext';
import { ownerAPI } from '../../services/api/ownerAPI';

const TIME_OFF_TYPES = [
  { key: 'vacation', label: 'Vacation', icon: 'beach-outline', color: '#4CAF50' },
  { key: 'sick', label: 'Sick Leave', icon: 'medical-outline', color: '#F44336' },
  { key: 'personal', label: 'Personal', icon: 'person-outline', color: '#FF9800' },
  { key: 'emergency', label: 'Emergency', icon: 'warning-outline', color: '#9C27B0' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', color: '#607D8B' },
];

const DURATION_OPTIONS = [
  { key: 'half_day', label: 'Half Day', value: 0.5 },
  { key: 'full_day', label: 'Full Day', value: 1 },
  { key: 'multiple_days', label: 'Multiple Days', value: 0 },
];

export default function TimeOffRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [halfDayPeriod, setHalfDayPeriod] = useState<'AM' | 'PM'>('AM');
  const [errors, setErrors] = useState<{ type?: string; date?: string; reason?: string }>({});
  const scrollRef = React.useRef<ScrollView>(null);
  const reasonInputRef = React.useRef<TextInput>(null);
  const [sectionOffsets, setSectionOffsets] = useState<{ typeY: number; dateY: number; reasonY: number }>({
    typeY: 0,
    dateY: 0,
    reasonY: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmittedKeyRef = React.useRef<string | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const isMultipleDays = React.useMemo(
    () => !!startDate && !!endDate && startDate !== endDate,
    [startDate, endDate]
  );

  // Keep duration consistent with the selected range
  useEffect(() => {
    if (isMultipleDays) {
      setDuration('multiple_days');
      // Half-day period not applicable on multi-day
      setHalfDayPeriod('AM');
    } else if (startDate && (!duration || duration === 'multiple_days')) {
      setDuration('full_day'); // default for single-day
    }
  }, [isMultipleDays, startDate]);

  // Prefill from route params (e.g., when opened from notification)
  useEffect(() => {
    const getParam = (key: string): string | undefined => {
      const v = params[key];
      if (Array.isArray(v)) return v[0];
      if (typeof v === 'string') return v;
      return undefined;
    };
    const pType = getParam('type');
    const pStart = getParam('startDate');
    const pEnd = getParam('endDate');
    const pDuration = getParam('duration');
    const pHalf = getParam('halfDayPeriod') as 'AM' | 'PM' | undefined;
    const pReason = getParam('reason');

    if (pType) setSelectedType(pType);
    if (pStart) setStartDate(pStart);
    if (pEnd) setEndDate(pEnd);
    if (pDuration) setDuration(pDuration);
    if (pHalf === 'AM' || pHalf === 'PM') setHalfDayPeriod(pHalf);
    if (pReason) setReason(pReason);
  }, [params]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, we'll just simulate loading since this is a form screen
        // In a real app, you might call employeeAPI.getTimeOffPolicies() or similar
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      } catch (error) {
        console.error('Error loading time off data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const formatYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseLocalYMD = (dateString?: string) => {
    if (!dateString) return null;
    const parts = dateString.split('-').map(v => parseInt(v, 10));
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [y, m, d] = parts;
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  };

  const handleDayPress = (date: Date) => {
    const dateStr = formatYMD(date);
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
      return;
    }
    const start = parseLocalYMD(startDate) || new Date();
    if (date < start) {
      setEndDate(startDate);
      setStartDate(dateStr);
    } else {
      setEndDate(dateStr);
    }
  };

  const isSameDay = (a?: string, b?: string) => {
    return !!a && !!b && a === b;
  };

  const isInRange = (date: Date, start?: string, end?: string) => {
    if (!start || !end) return false;
    const t = date.getTime();
    const s = (parseLocalYMD(start) || new Date(0)).getTime();
    const e = (parseLocalYMD(end) || new Date(0)).getTime();
    return t > s && t < e;
  };

  const addMonths = (date: Date, delta: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + delta);
    return d;
  };

  const getMonthDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0-6, Sun-Sat
    const startDate = new Date(year, month, 1 - startWeekday);
    // Build 6 weeks × 7 days = 42 cells
    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push({
        date: d,
        inMonth: d.getMonth() === month
      });
    }
    return days;
  };

  // Check for existing requests before submission
  const checkExistingRequest = async (): Promise<boolean> => {
    if (!employeeId) return false;
    
    try {
      const existingRequests = await ownerAPI.getTimeOffRequests();
      const finalEndDate = endDate || startDate;
      
      const duplicate = existingRequests.find((req: any) => {
        if (req.employeeId !== employeeId || req.status !== 'pending') return false;
        
        // Check if dates overlap
        const reqStart = new Date(req.startDate);
        const reqEnd = new Date(req.endDate);
        const newStart = new Date(startDate);
        const newEnd = new Date(finalEndDate);
        
        // Check for any overlap
        return (newStart <= reqEnd && newEnd >= reqStart);
      });
      
      return !!duplicate;
    } catch (error) {
      console.error('Error checking existing requests:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    const nextErrors: { type?: string; date?: string; reason?: string } = {};
    if (!selectedType) nextErrors.type = 'Please select a type.';
    if (!startDate) nextErrors.date = 'Please select a start date.';
    else if (isMultipleDays && !endDate) nextErrors.date = 'Please select an end date.';
    if (!reason || reason.trim().length === 0) nextErrors.reason = 'Reason is required.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // Scroll to first invalid
      const firstInvalid = nextErrors.type ? 'type' : (nextErrors.date ? 'date' : 'reason');
      const y =
        firstInvalid === 'type' ? sectionOffsets.typeY :
        firstInvalid === 'date' ? sectionOffsets.dateY :
        sectionOffsets.reasonY;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
      if (firstInvalid === 'reason') {
        setTimeout(() => reasonInputRef.current?.focus(), 250);
      }
      return;
    }

    // Check for existing duplicate request
    const hasExisting = await checkExistingRequest();
    if (hasExisting) {
      Alert.alert(
        'Duplicate Request',
        'You already have a pending time off request for these dates. Please wait for approval or cancel the existing request before submitting a new one.'
      );
      return;
    }

    // Prevent duplicate submissions of same request in-session
    const requestKey = [
      selectedType,
      startDate,
      endDate || startDate,
      duration,
      duration === 'half_day' ? halfDayPeriod : ''
    ].join('|');
    if (lastSubmittedKeyRef.current === requestKey) {
      Alert.alert('Already Submitted', 'This time off request is already pending approval.');
      return;
    }

    if (!employeeId) {
      Alert.alert('Error', 'Unable to identify employee. Please try again.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      type: selectedType,
      startDate,
      endDate: endDate || startDate,
      duration,
      halfDayPeriod: duration === 'half_day' ? halfDayPeriod : undefined,
      reason,
      notes,
    };
    console.log('Submitting time off request:', payload);

    // Create a time off request record, then create a notification to open its detail screen
    try {
      const created = await employeeAPI.createTimeOffRequest({
        type: selectedType,
        startDate,
        endDate: endDate || startDate,
        duration: duration as any,
        halfDayPeriod: duration === 'half_day' ? halfDayPeriod : undefined,
        reason,
        notes,
        employeeId: employeeId,
      });
      
      const title = 'Time Off Request Submitted';
      const dateText = isMultipleDays
        ? `${formatDate(startDate)} → ${formatDate(endDate || startDate)}`
        : `${formatDate(startDate)}${duration === 'half_day' ? ` (${halfDayPeriod === 'AM' ? 'Morning' : 'Afternoon'})` : ''}`;
      const message = `Your time off request for ${dateText} is pending approval.`;
      employeeAPI.addNotification({
        title,
        message,
        type: 'schedule',
        time: 'Just now',
        isRead: false,
        route: '/(employee)/TimeOffRequestDetail',
        params: { id: created.id },
      }).catch(() => {});

      Alert.alert(
        'Request Submitted',
        'Your time off request has been submitted and will be reviewed by your manager.',
        [
          { text: 'OK', onPress: () => {
            lastSubmittedKeyRef.current = requestKey;
            setIsSubmitting(false);
            // Navigate to Schedule screen
            router.replace('/ScheduleScreen');
          } }
        ]
      );
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert(
        'Error',
        error.message || 'Failed to submit time off request. Please try again.'
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select Date';
    const date = parseLocalYMD(dateString);
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysDifference = () => {
    if (!startDate || !endDate) return 0;
    const start = parseLocalYMD(startDate);
    const end = parseLocalYMD(endDate);
    if (!start || !end) return 0;
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const renderTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitleCompact}>Type of Time Off *</Text>
      {!!errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeScrollContent}
      >
        {TIME_OFF_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeCard,
              selectedType === type.key && styles.selectedTypeCard
            ]}
            onPress={() => handleTypeSelect(type.key)}
          >
            <Text style={[
              styles.typeLabel,
              selectedType === type.key && styles.selectedTypeLabel
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDateSelector = () => {
    const days = getMonthDays(calendarMonth);
    const monthText = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const todayStr = formatYMD(new Date());
    const todayMidnight = (() => { const t = new Date(); t.setHours(0,0,0,0); return t; })();
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date Range *</Text>

        <Text style={styles.calendarHint}>
          Tap a day to start, then tap another to set the end. Past dates are disabled.
        </Text>
        {!!errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

        {/* Removed explicit Start/End chips per request */}

        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity style={styles.calendarNavBtn} onPress={() => setCalendarMonth(addMonths(calendarMonth, -1))}>
              <Ionicons name="chevron-back" size={18} color="#333" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText}>{monthText}</Text>
            <TouchableOpacity style={styles.calendarNavBtn} onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
              <Ionicons name="chevron-forward" size={18} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <Text key={d} style={styles.weekdayLabel}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map(({ date, inMonth }, idx) => {
              const dStr = formatYMD(date);
              const selectedStart = isSameDay(startDate, dStr);
              const selectedEnd = isSameDay(endDate, dStr);
              const inRange = isInRange(date, startDate, endDate);
              const isToday = dStr === todayStr;
              const isPast = date.getTime() < todayMidnight.getTime();
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCell,
                    !inMonth && styles.dayCellOutside,
                    isPast && styles.dayCellDisabled,
                  ]}
                  onPress={() => handleDayPress(date)}
                  disabled={!inMonth || isPast}
                >
                  <View style={[
                    styles.dayInner,
                    inRange && styles.dayInRange,
                    selectedStart && styles.daySelectedStart,
                    selectedEnd && styles.daySelectedEnd,
                    isToday && styles.dayTodayBorder,
                  ]}>
                    <Text style={[
                      styles.dayText,
                      (selectedStart || selectedEnd) && styles.dayTextSelected,
                      !inMonth && styles.dayTextOutside,
                      isPast && styles.dayTextDisabled,
                    ]}>
                      {date.getDate()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {startDate && endDate && (
          <View style={styles.durationInfo}>
            <Text style={styles.durationText}>
              Total Days: {getDaysDifference()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderDurationSelector = () => {
    if (isMultipleDays) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={[styles.durationOption, styles.selectedDurationOption]}>
            <View style={styles.durationContent}>
              <Text style={[styles.durationLabel, styles.selectedDurationLabel]}>
                Multiple days selected
              </Text>
              <Text style={[styles.durationValue, styles.selectedDurationValue]}>
                {getDaysDifference()} day{getDaysDifference() > 1 ? 's' : ''}
              </Text>
            </View>
            <Ionicons name="calendar" size={20} color="#4CAF50" />
          </View>
        </View>
      );
    }
    // Single-day: let user choose Half or Full day
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duration *</Text>
        <TouchableOpacity
          style={[
            styles.durationOption,
            duration === 'half_day' && styles.selectedDurationOption
          ]}
          onPress={() => setDuration('half_day')}
          disabled={!startDate}
        >
          <View style={styles.durationContent}>
            <Text style={[
              styles.durationLabel,
              duration === 'half_day' && styles.selectedDurationLabel
            ]}>
              Half Day
            </Text>
          </View>
          {duration === 'half_day' && (
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          )}
        </TouchableOpacity>
        {startDate && duration === 'half_day' && (
          <View style={styles.halfDayRow}>
            <TouchableOpacity
              onPress={() => setHalfDayPeriod('AM')}
              style={[styles.halfDayPill, halfDayPeriod === 'AM' && styles.halfDayPillActive]}
            >
              <Text style={[styles.halfDayPillText, halfDayPeriod === 'AM' && styles.halfDayPillTextActive]}>Morning</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHalfDayPeriod('PM')}
              style={[styles.halfDayPill, halfDayPeriod === 'PM' && styles.halfDayPillActive]}
            >
              <Text style={[styles.halfDayPillText, halfDayPeriod === 'PM' && styles.halfDayPillTextActive]}>Afternoon</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.durationOption,
            duration === 'full_day' && styles.selectedDurationOption
          ]}
          onPress={() => setDuration('full_day')}
          disabled={!startDate}
        >
          <View style={styles.durationContent}>
            <Text style={[
              styles.durationLabel,
              duration === 'full_day' && styles.selectedDurationLabel
            ]}>
              Full Day
            </Text>
          </View>
          {duration === 'full_day' && (
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          )}
        </TouchableOpacity>
        {!startDate && (
          <Text style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
            Select a date to choose half or full day.
          </Text>
        )}
      </View>
    );
  };

  const renderReasonInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reason *</Text>
      <TextInput
        ref={reasonInputRef}
        style={styles.textInput}
        placeholder="Please provide a brief reason for your time off request..."
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        returnKeyType="done"
      />
      {!!errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
    </View>
  );

  const renderNotesInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Any additional information for your manager..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>
  );

  // Removed popup date picker in favor of inline calendar

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading time off request form...</Text>
      </SafeAreaView>
    );
  }

  // Determine if form is valid to enable submit
  const canSubmit = Boolean(
    selectedType &&
    startDate &&
    (isMultipleDays ? endDate : true) &&
    (duration && (isMultipleDays ? duration === 'multiple_days' : duration === 'half_day' || duration === 'full_day')) &&
    (reason && reason.trim().length > 0)
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Time Off Request</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={!canSubmit || isSubmitting}>
          <Text style={[
            styles.submitButton,
            (!canSubmit || isSubmitting) && styles.submitButtonDisabled
          ]}>
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <ScrollView
        ref={scrollRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <Text style={styles.instructionsText}>
            Submit your time off request. Your manager will review and approve it.
          </Text>
        </View>

        <View onLayout={(e) => setSectionOffsets(prev => ({ ...prev, typeY: e.nativeEvent.layout.y }))}>
          {renderTypeSelector()}
        </View>
        <View onLayout={(e) => setSectionOffsets(prev => ({ ...prev, dateY: e.nativeEvent.layout.y }))}>
          {renderDateSelector()}
        </View>
        {renderDurationSelector()}
        <View onLayout={(e) => setSectionOffsets(prev => ({ ...prev, reasonY: e.nativeEvent.layout.y }))}>
          {renderReasonInput()}
        </View>
        {renderNotesInput()}

        {/* Summary */}
        {selectedType && startDate && duration && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Request Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type:</Text>
              <Text style={styles.summaryValue}>
                {TIME_OFF_TYPES.find(t => t.key === selectedType)?.label}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Start Date:</Text>
              <Text style={styles.summaryValue}>{formatDate(startDate)}</Text>
            </View>
            {endDate && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>End Date:</Text>
                <Text style={styles.summaryValue}>{formatDate(endDate)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>
                {isMultipleDays
                  ? `${getDaysDifference()} day${getDaysDifference() > 1 ? 's' : ''}`
                  : duration === 'half_day'
                    ? `Half Day - ${halfDayPeriod === 'AM' ? 'Morning' : 'Afternoon'}`
                    : 'Full Day'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Inline calendar used; no modal picker */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  submitButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  submitButtonDisabled: {
    color: '#BDBDBD',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 10,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
  },
  typeScrollContent: {
    paddingVertical: 0,
    paddingRight: 4,
  },
  typeCard: {
    minWidth: 110,
    backgroundColor: '#F8F9FA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 0,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTypeCard: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  typeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionTitleCompact: {
    fontSize: 16,
    fontWeight: '600',
    color: '#03191E',
    marginBottom: 8,
  },
  errorText: {
    color: '#E7222E',
    fontSize: 12,
    marginTop: 6,
  },
  selectedTypeLabel: {
    color: '#03191E',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateButtonContent: {
    flex: 1,
    marginLeft: 10,
  },
  dateButtonLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dateButtonValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedChipText: {
    marginLeft: 6,
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  calendarMonthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekdayLabel: {
    width: '14.28%',
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayCellOutside: {
    opacity: 0.4,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayInner: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextOutside: {
    color: '#999',
  },
  dayTextDisabled: {
    color: '#999',
  },
  daySelectedStart: {
    backgroundColor: '#4CAF50',
  },
  daySelectedEnd: {
    backgroundColor: '#4CAF50',
  },
  dayTextSelected: {
    color: '#fff',
  },
  dayInRange: {
    backgroundColor: '#E8F5E8',
  },
  dayTodayBorder: {
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  durationInfo: {
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  durationText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDurationOption: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  durationContent: {
    flex: 1,
  },
  durationLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  durationValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedDurationLabel: {
    color: '#2E7D32',
  },
  selectedDurationValue: {
    color: '#2E7D32',
  },
  halfDayRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  halfDayPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  halfDayPillActive: {
    backgroundColor: '#03191E',
    borderColor: '#03191E',
  },
  halfDayPillText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  halfDayPillTextActive: {
    color: '#81C4FF',
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
  },
  summaryCard: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2E7D32',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  datePickerContent: {
    maxHeight: 400,
  },
  dateOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333',
  },
});
