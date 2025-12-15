import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  Modal,
  Pressable,
  Alert
} from 'react-native';
import { PanResponder, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAppointments } from '../contexts/AppointmentContext';
import { getCancellationHours, getDepositPercentage } from '../services/preferences/bookingPreferences';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ClientInformationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const { updateAppointment, appointments } = useAppointments();

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

  const clientName = getParamValue('name');
  const clientPhone = getParamValue('phone');
  const appointmentId = getParamValue('id');
  const clientAvatar = getParamValue('avatar');
  const clientService = getParamValue('service');
  const clientStaff = getParamValue('staff');
  const clientStartTime = getParamValue('startTime');
  const clientEndTime = getParamValue('endTime');
  const clientDate = getParamValue('date');
  const clientStatus = getParamValue('status');
  const ratingParam = getParamValue('rating');
  const clientEmail = getParamValue('email');
  const clientBirthday = getParamValue('birthday');
  const clientRewards = getParamValue('rewards');
  const clientAllergies = getParamValue('allergies');

  const [activeTab, setActiveTab] = useState('information');
  const [staffNotes, setStaffNotes] = useState(getParamValue('staffNotes') || '');
  const [clientNotes, setClientNotes] = useState(getParamValue('clientNotes') || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 based on start->end
  const [timeLeftText, setTimeLeftText] = useState('');
  const [sliderOffset, setSliderOffset] = useState(0); // px along the track
  const [trackWidth, setTrackWidth] = useState(0);
  const [isHoldingNext, setIsHoldingNext] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const previousStatusRef = useRef<string | undefined>(undefined);
  // Cancellation policy state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cnwHours, setCnwHours] = useState<number>(24);
  const [dpPercent, setDpPercent] = useState<number>(20);
  const [isLateCancel, setIsLateCancel] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [cancelByText, setCancelByText] = useState<string>('');

  const apptFromContext = useMemo(() => {
    if (!appointmentId) return undefined;
    return appointments?.find(a => String(a.id) === String(appointmentId));
  }, [appointmentId, appointments]);

  useEffect(() => {
    if (apptFromContext?.status === 'completed') {
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }
  }, [apptFromContext?.status]);

  const parseLocalDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) return null;
    try {
      const [y, m, d] = dateStr.split('-').map(v => parseInt(v, 10));
      const [hh, mm] = timeStr.split(':').map(v => parseInt(v, 10));
      return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
    } catch {
      return null;
    }
  };

  const apptStart = useMemo(() => {
    const dateStr = apptFromContext?.date || clientDate || undefined;
    const startStr = apptFromContext?.startTime || clientStartTime || undefined;
    return parseLocalDateTime(dateStr, startStr);
  }, [apptFromContext?.date, apptFromContext?.startTime, clientDate, clientStartTime]);

  const apptEnd = useMemo(() => {
    const dateStr = apptFromContext?.date || clientDate || undefined;
    const endStr = apptFromContext?.endTime || clientEndTime || undefined;
    return parseLocalDateTime(dateStr, endStr);
  }, [apptFromContext?.date, apptFromContext?.endTime, clientDate, clientEndTime]);

  // Progress ticker
  useEffect(() => {
    const update = () => {
      if (!apptStart || !apptEnd) {
        setProgress(0);
        setTimeLeftText('');
        return;
      }
      const now = new Date();
      const totalMs = apptEnd.getTime() - apptStart.getTime();
      const elapsedMs = now.getTime() - apptStart.getTime();
      const pct = Math.max(0, Math.min(1, totalMs > 0 ? elapsedMs / totalMs : 0));
      setProgress(pct);

      const remainingMs = apptEnd.getTime() - now.getTime();
      const absMin = Math.max(0, Math.ceil(Math.abs(remainingMs) / 60000));
      if (remainingMs >= 0) {
        setTimeLeftText(`${absMin} min left`);
      } else {
        setTimeLeftText(`Overdue ${absMin} min`);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [apptStart, apptEnd]);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const KNOB_WIDTH = 44;

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !isCompleted,
    onMoveShouldSetPanResponder: () => !isCompleted,
    onPanResponderGrant: () => {
      if (isCompleted) return;
      setIsCompleting(true);
    },
    onPanResponderMove: (_evt, gestureState) => {
      if (isCompleted) return;
      const maxX = Math.max(0, trackWidth - KNOB_WIDTH);
      const dx = Math.max(0, Math.min(gestureState.dx, maxX));
      setSliderOffset(dx);
    },
    onPanResponderRelease: async () => {
      if (isCompleted) return;
      const threshold = Math.max(0, trackWidth - KNOB_WIDTH - 8);
      if (sliderOffset >= threshold) {
        // Complete
        try {
          if (appointmentId) {
            await updateAppointment(String(appointmentId), { status: 'completed' });
          }
          setIsCompleted(true);
          Alert.alert('Completed', 'Appointment marked as done');
        } catch {
          Alert.alert('Error', 'Failed to mark as completed');
        }
      }
      // reset slider
      setSliderOffset(0);
      setIsCompleting(false);
    }
  }), [isCompleted, trackWidth, appointmentId, updateAppointment]);

  // Collapse the floating section on screen focus
  useFocusEffect(
    useCallback(() => {
      setIsExpanded(false);
    }, [])
  );

  const handleMarkDone = async () => {
    if (isCompleted) return;
    try {
      previousStatusRef.current = apptFromContext?.status || 'pending';
      if (appointmentId) {
        await updateAppointment(String(appointmentId), { status: 'completed' });
      }
      setIsCompleted(true);
    } catch {
      Alert.alert('Error', 'Failed to mark as completed');
    }
  };

  const handleUndoDone = async () => {
    if (!isCompleted) return;
    try {
      const restoreStatus = previousStatusRef.current || 'pending';
      if (appointmentId) {
        await updateAppointment(String(appointmentId), { status: restoreStatus });
      }
      setIsCompleted(false);
    } catch {
      Alert.alert('Error', 'Failed to undo completion');
    }
  };

  // Load CNW/DP preferences
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

  const formatTime12h = (timeStr?: string) => {
    if (!timeStr) return '';
    const [hh, mm] = timeStr.split(':').map(v => parseInt(v, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return timeStr;
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const hour12 = ((hh + 11) % 12) + 1;
    const mmStr = String(mm).padStart(2, '0');
    return `${hour12}:${mmStr} ${ampm}`;
    };

  const nextAppointment = useMemo(() => {
    if (!apptEnd) return undefined;
    const staff = apptFromContext?.barber || clientStaff;
    const date = apptFromContext?.date || clientDate;
    if (!staff || !date) return undefined;
    const candidates = (appointments || []).filter(a => {
      if (String(a.id) === String(appointmentId)) return false;
      if (a.barber !== staff) return false;
      if (a.date !== date) return false;
      const start = parseLocalDateTime(a.date, a.startTime || undefined);
      return !!start && start.getTime() >= apptEnd.getTime();
    });
    candidates.sort((a, b) => {
      const sa = parseLocalDateTime(a.date, a.startTime || undefined)?.getTime() || 0;
      const sb = parseLocalDateTime(b.date, b.startTime || undefined)?.getTime() || 0;
      return sa - sb;
    });
    return candidates[0];
  }, [appointments, apptEnd, apptFromContext?.barber, apptFromContext?.date, clientStaff, clientDate, appointmentId]);

  const nextTimeText = useMemo(() => {
    return nextAppointment?.startTime ? formatTime12h(nextAppointment.startTime) : '—';
  }, [nextAppointment?.startTime]);

  
  // Editable client data state
  const [editedClientData, setEditedClientData] = useState({
    name: clientName || '',
    phone: clientPhone || '',
    email: clientEmail || '',
    birthday: clientBirthday || '',
    allergies: clientAllergies || '',
    staffNotes: getParamValue('staffNotes') || '',
    clientNotes: getParamValue('clientNotes') || '',
  });

  // Initialize edited data when component mounts
  useEffect(() => {
    setEditedClientData({
      name: clientName || '',
      phone: clientPhone || '',
      email: clientEmail || '',
      birthday: clientBirthday || '',
      allergies: clientAllergies || '',
      staffNotes: getParamValue('staffNotes') || '',
      clientNotes: getParamValue('clientNotes') || '',
    });
  }, [clientName, clientPhone, clientEmail, clientBirthday, clientAllergies]);

  // Load notes and other persisted fields from context by appointment id
  useEffect(() => {
    if (!appointmentId) return;
    const appt = appointments?.find(a => String(a.id) === String(appointmentId));
    if (!appt) return;

    // Prefer existing state if already set via params; otherwise fill from appointment
    if (!clientNotes) setClientNotes(appt.notes || '');

    setEditedClientData(prev => ({
      ...prev,
      name: prev.name || appt.customerName || '',
      phone: prev.phone || appt.customerPhone || '',
      email: prev.email || appt.customerEmail || '',
    }));
  }, [appointmentId, appointments]);

  const ratingValue = ratingParam ? parseFloat(ratingParam) : NaN;
  const hasRating = Number.isFinite(ratingValue);
  const displayRating = hasRating ? Number(ratingValue.toFixed(1)) : undefined;
  const starRating = hasRating ? Math.max(0, Math.min(5, Math.round(ratingValue))) : 0;
  const appointmentTime = clientStartTime && clientEndTime
    ? `${clientStartTime} - ${clientEndTime}`
    : clientStartTime || clientEndTime || '';
  const avatarUri = clientAvatar && clientAvatar.trim().length > 0
    ? clientAvatar
    : 'https://via.placeholder.com/150x150/DFE4EA/8C9AAE?text=Client';

  // Sample media data for previous cuts
  const previousCutsMedia = [
    {
      id: 1,
      type: 'video',
      thumbnail: 'https://via.placeholder.com/150x100/4A90E2/FFFFFF?text=Video',
      title: 'Haircut - Dec 2024',
      date: 'Dec 1, 2024',
      duration: '0:45',
      barber: 'Michel James'
    },
    {
      id: 2,
      type: 'photo',
      thumbnail: 'https://via.placeholder.com/150x100/7ED321/FFFFFF?text=Photo',
      title: 'Styling - Nov 2024',
      date: 'Nov 15, 2024',
      barber: 'Puneet.10'
    },
    {
      id: 3,
      type: 'video',
      thumbnail: 'https://via.placeholder.com/150x100/9013FE/FFFFFF?text=Video',
      title: 'Beard Trim - Nov 2024',
      date: 'Nov 8, 2024',
      duration: '1:20',
      barber: 'Jeet.12'
    },
    {
      id: 4,
      type: 'photo',
      thumbnail: 'https://via.placeholder.com/150x100/F5A623/FFFFFF?text=Photo',
      title: 'Haircut - Oct 2024',
      date: 'Oct 25, 2024',
      barber: 'Abhay.0'
    },
    {
      id: 5,
      type: 'video',
      thumbnail: 'https://via.placeholder.com/150x100/50E3C2/FFFFFF?text=Video',
      title: 'Full Service - Oct 2024',
      date: 'Oct 10, 2024',
      duration: '2:15',
      barber: 'Michel James'
    },
    {
      id: 6,
      type: 'photo',
      thumbnail: 'https://via.placeholder.com/150x100/BD10E0/FFFFFF?text=Photo',
      title: 'Styling - Sep 2024',
      date: 'Sep 28, 2024',
      barber: 'Puneet.10'
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleMenuPress = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMenuOption = (option: string) => {
    setShowDropdown(false);
    switch (option) {
      case 'Edit Information':
        setIsEditMode(true);
        break;
      case 'Appointment History':
        // Navigate to appointment history
        router.push('/BusinessAppointmentHistory');
        break;
      case 'Export':
        // Export functionality
        Alert.alert('Export', 'Exporting client data...');
        break;
      case 'Block Client':
        handleBlockClient();
        break;
    }
  };

  const handleBlockClient = () => {
    Alert.alert(
      'Block Client',
      'Are you sure you want to block this client?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Client has been blocked');
          }
        }
      ]
    );
  };



  const handleSaveEdit = async () => {
    try {
      if (appointmentId) {
        // Persist updates to the appointment so changes reflect across the app
        await updateAppointment(String(appointmentId), {
          customerName: editedClientData.name,
          customerPhone: editedClientData.phone,
          customerEmail: editedClientData.email,
          notes: clientNotes,
        });
      }
      Alert.alert('Success', 'Client information updated successfully');
      setIsEditMode(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleCancelEdit = () => {
    // Reset to original data
    setEditedClientData({
      name: clientName || '',
      phone: clientPhone || '',
      email: clientEmail || '',
      birthday: clientBirthday || '',
      allergies: clientAllergies || '',
      staffNotes: getParamValue('staffNotes') || '',
      clientNotes: getParamValue('clientNotes') || '',
    });
    setIsEditMode(false);
  };

  const renderStars = (rating: number) => {
    const clamped = Math.max(0, Math.min(5, Math.round(rating)));
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < clamped ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
        style={styles.star}
      />
    ));
  };

  const renderProgressBar = (percentage: number, color: string) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { backgroundColor: color, width: `${percentage}%` }]} />
    </View>
  );

  const renderInfoValue = (value: string | undefined) => {
    if (value && value.trim().length > 0) {
      return <Text style={styles.customerInfoValue}>{value}</Text>;
    }
    return <Text style={[styles.customerInfoValue, styles.unavailableText]}>Unavailable</Text>;
  };

  // Cancellation helpers (staff side)
  const canStaffCancel = useMemo(() => {
    const status = apptFromContext?.status || clientStatus;
    return status === 'confirmed' || status === 'pending';
  }, [apptFromContext?.status, clientStatus]);

  const formatFullDateTime = (d: Date) => d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const round2 = (n: number) => Math.round(n * 100) / 100;

  const openCancelModal = () => {
    const start = apptStart;
    if (!start) {
      Alert.alert('Unavailable', 'Appointment start time is not available.');
      return;
    }
    const cancelBy = new Date(start.getTime() - cnwHours * 60 * 60 * 1000);
    setCancelByText(formatFullDateTime(cancelBy));
    setIsLateCancel(new Date() > cancelBy);
    const priceNum = Number(apptFromContext?.price || 0);
    setDepositAmount(round2(priceNum * (dpPercent / 100)));
    setShowCancelModal(true);
  };

  const confirmStaffCancel = async () => {
    try {
      if (appointmentId) {
        await updateAppointment(String(appointmentId), { status: 'cancelled' });
      }
      setShowCancelModal(false);
      Alert.alert('Cancelled', isLateCancel && dpPercent > 0
        ? `Deposit $${depositAmount.toFixed(2)} retained per policy.`
        : 'Appointment cancelled successfully.');
    } catch {
      Alert.alert('Error', 'Failed to cancel appointment.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Information</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'information' && styles.activeTab]}
          onPress={() => setActiveTab('information')}
        >
          <Text style={[styles.tabText, activeTab === 'information' && styles.activeTabText]}>
            Information
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            Videos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Mode Action Buttons */}
      {isEditMode && (
        <View style={styles.editModeActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dropdown Menu Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setShowDropdown(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Edit Information')}>
              <Ionicons name="create-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Appointment History')}>
              <Ionicons name="time-outline" size={20} color="#000" />
              <Text style={styles.menuText}>History</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Export')}>
              <Ionicons name="download-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Export</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Block Client')}>
              <Ionicons name="ban-outline" size={20} color="red" />
              <Text style={styles.menuTextBlock}>Block</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>



      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'information' && (
          <>
            {/* Appointment Information Card */}
            <View style={styles.appointmentCard}>
              <View style={styles.appointmentLeft}>
                <Image 
                  source={{ uri: avatarUri }} 
                  style={styles.clientAvatar} 
                />
                <View style={styles.clientInfo}>
                  <Text style={[styles.clientName, !(editedClientData.name || clientName) && styles.unavailableText]}>
                    {editedClientData.name || clientName || 'Unavailable'}
                  </Text>
                  <Text style={[styles.clientPhone, !(editedClientData.phone || clientPhone) && styles.unavailableText]}>
                    {editedClientData.phone || clientPhone || 'Unavailable'}
                  </Text>
                  {hasRating ? (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>{displayRating}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.ratingText, styles.unavailableText]}>Rating Unavailable</Text>
                  )}
                  <Text style={[styles.statusText, !clientStatus && styles.unavailableText]}>
                    Status: {clientStatus || 'Unavailable'}
                  </Text>
                </View>
              </View>
              <View style={styles.appointmentRight}>
                <Text style={[styles.serviceText, !clientService && styles.unavailableText]}>
                  {clientService || 'Service Unavailable'}
                </Text>
                <Text style={[styles.barberText, !clientStaff && styles.unavailableText]}>
                  {clientStaff || 'Staff Unavailable'}
                </Text>
                <Text style={[styles.timeText, !appointmentTime && styles.unavailableText]}>
                  Time {appointmentTime || 'Unavailable'}
                </Text>
                <Text style={[styles.dateText, !clientDate && styles.unavailableText]}>
                  Date {clientDate || 'Unavailable'}
                </Text>
                {canStaffCancel && (
                  <TouchableOpacity style={[styles.cancelButton, { marginTop: 8 }]} onPress={openCancelModal}>
                    <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

        {/* Customer Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerInfoContainer}>
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Name:</Text>
              {isEditMode ? (
                <TextInput
                  style={styles.editInput}
                  value={editedClientData.name}
                  onChangeText={(text) => setEditedClientData({ ...editedClientData, name: text })}
                  placeholder="Client name"
                />
              ) : (
                renderInfoValue(editedClientData.name || clientName)
              )}
            </View>
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Phone:</Text>
              {isEditMode ? (
                <TextInput
                  style={styles.editInput}
                  value={editedClientData.phone}
                  onChangeText={(text) => setEditedClientData({ ...editedClientData, phone: text })}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                renderInfoValue(editedClientData.phone || clientPhone)
              )}
            </View>
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Email:</Text>
              {isEditMode ? (
                <TextInput
                  style={styles.editInput}
                  value={editedClientData.email}
                  onChangeText={(text) => setEditedClientData({ ...editedClientData, email: text })}
                  placeholder="Email address"
                  keyboardType="email-address"
                />
              ) : (
                renderInfoValue(editedClientData.email || clientEmail)
              )}
            </View>
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Birthday:</Text>
              {isEditMode ? (
                <TextInput
                  style={styles.editInput}
                  value={editedClientData.birthday}
                  onChangeText={(text) => setEditedClientData({ ...editedClientData, birthday: text })}
                  placeholder="Birthday (e.g., 1990-01-15)"
                />
              ) : (
                renderInfoValue(editedClientData.birthday || clientBirthday)
              )}
            </View>
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Rewards:</Text>
              {clientRewards && clientRewards.trim().length > 0 ? (
                <View style={styles.rewardsContainer}>
                  <Text style={styles.rewardsNumber}>{clientRewards}</Text>
                  <Text style={styles.rewardsLabel}>Upcoming rewards</Text>
                </View>
              ) : (
                <Text style={[styles.customerInfoValue, styles.unavailableText]}>Unavailable</Text>
              )}
            </View>
          </View>
        </View>

        {/* Allergies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          {isEditMode ? (
            <TextInput
              style={styles.editTextArea}
              value={editedClientData.allergies}
              onChangeText={(text) => setEditedClientData({ ...editedClientData, allergies: text })}
              placeholder="Enter allergies or 'None'"
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.allergiesText}>{editedClientData.allergies || clientAllergies || 'No allergies recorded'}</Text>
          )}
        </View>

        {/* Old Allergies Section - Remove if not needed */}
        {false && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            <Text style={[styles.staticFieldText, !clientAllergies && styles.unavailableText]}>
              {clientAllergies || 'Unavailable'}
            </Text>
          </View>
        )}

        {/* Satisfaction Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Satisfaction</Text>
          {hasRating ? (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(starRating)}
              </View>
              <Text style={styles.ratingText}>{displayRating}</Text>
            </View>
          ) : (
            <Text style={[styles.ratingText, styles.unavailableText]}>Unavailable</Text>
          )}
        </View>

        {/* Visit Frequency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Frequency</Text>
          {renderProgressBar(70, '#00C853')}
        </View>

        {/* Satisfaction Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Satisfaction Progress</Text>
          {renderProgressBar(40, '#FF9800')}
        </View>

        {/* Staff Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff Notes</Text>
          <View style={styles.editableField}>
            <TextInput 
              style={styles.notesInput}
              placeholder="Add staff notes…"
              placeholderTextColor="#3c4c48"
              multiline
              numberOfLines={3}
              value={staffNotes}
              onChangeText={setStaffNotes}
            />
            <Ionicons name="pencil" size={16} color="#3c4c48" style={styles.notesEditIcon} />
          </View>
        </View>

        {/* Client Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Notes</Text>
          <TextInput 
            style={styles.notesInput}
            placeholder="Add client notes…"
            placeholderTextColor="#3c4c48"
            multiline
            numberOfLines={3}
            value={clientNotes}
            onChangeText={setClientNotes}
            editable={false}
          />
        </View>
          </>
        )}

        {activeTab === 'videos' && (
          <View style={styles.videosContainer}>
            <Text style={styles.videosTitle}>Previous Cuts & Styling</Text>
            <View style={styles.mediaGrid}>
              {previousCutsMedia.map((media) => (
                <TouchableOpacity key={media.id} style={styles.mediaCard}>
                  <Image source={{ uri: media.thumbnail }} style={styles.mediaThumbnail} />
                  <View style={styles.mediaOverlay}>
                    {media.type === 'video' && (
                      <View style={styles.playButton}>
                        <Ionicons name="play" size={24} color="#fff" />
                      </View>
                    )}
                    {media.type === 'video' && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{media.duration}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.mediaInfo}>
                    <Text style={styles.mediaTitle}>{media.title}</Text>
                    <Text style={styles.mediaDate}>{media.date}</Text>
                    <Text style={styles.mediaBarber}>By {media.barber}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Staff Cancel Confirmation Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <Pressable style={styles.cancelModalOverlay} onPress={() => setShowCancelModal(false)}>
          <Pressable style={styles.cancelModalContent} onPress={(e) => e.stopPropagation()}>
            {/* Header with Icon */}
            <View style={styles.cancelModalHeader}>
              <View style={[styles.cancelModalIconContainer, isLateCancel && styles.cancelModalIconContainerWarning]}>
                <Ionicons 
                  name={isLateCancel ? "warning" : "information-circle"} 
                  size={32} 
                  color={isLateCancel ? "#FF6B35" : "#2196F3"} 
                />
              </View>
              <Text style={styles.cancelModalTitle}>Cancel Appointment?</Text>
              <Text style={styles.cancelModalSubtitle}>
                Are you sure you want to cancel this appointment?
              </Text>
            </View>

            {/* Cancellation Policy Info */}
            <View style={styles.cancelModalInfoSection}>
              <View style={styles.cancelModalInfoRow}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <View style={styles.cancelModalInfoText}>
                  <Text style={styles.cancelModalInfoLabel}>Free cancellation window</Text>
                  <Text style={styles.cancelModalInfoValue}>{cnwHours} hour(s) before start</Text>
                </View>
              </View>
              
              <View style={styles.cancelModalInfoRow}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <View style={styles.cancelModalInfoText}>
                  <Text style={styles.cancelModalInfoLabel}>Cancel by</Text>
                  <Text style={styles.cancelModalInfoValue}>{cancelByText || '—'}</Text>
                </View>
              </View>
            </View>

            {/* Status Card */}
            <View style={[
              styles.cancelModalStatusCard,
              isLateCancel ? styles.cancelModalStatusCardWarning : styles.cancelModalStatusCardSuccess
            ]}>
              <Ionicons 
                name={isLateCancel ? "alert-circle" : "checkmark-circle"} 
                size={20} 
                color={isLateCancel ? "#FF6B35" : "#4CAF50"} 
              />
              <View style={styles.cancelModalStatusText}>
                <Text style={[
                  styles.cancelModalStatusTitle,
                  isLateCancel && styles.cancelModalStatusTitleWarning
                ]}>
                  {isLateCancel ? 'Late Cancellation' : 'Within Free Window'}
                </Text>
                <Text style={styles.cancelModalStatusMessage}>
                  {isLateCancel
                    ? (dpPercent > 0 
                        ? `Deposit $${depositAmount.toFixed(2)} will be retained.` 
                        : 'A cancellation fee may apply.')
                    : (dpPercent > 0 
                        ? `Your deposit will be fully refunded.` 
                        : 'No cancellation fee will be charged.')}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.cancelModalActions}>
              <TouchableOpacity 
                style={styles.cancelModalButtonKeep} 
                onPress={() => setShowCancelModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalButtonKeepText}>Keep Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.cancelModalButtonConfirm,
                  isLateCancel && styles.cancelModalButtonConfirmWarning
                ]} 
                onPress={confirmStaffCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalButtonConfirmText}>Confirm Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Floating control - redesigned */}
      {!!apptStart && !!apptEnd && (
        <View style={styles.floatingCompleteContainer}>
          <View style={styles.progressMetaRow}>
            <Text style={styles.progressMetaLabel}>Progress</Text>
            <Text style={styles.progressMetaPercent}>
              {Math.round(Math.max(0, Math.min(100, (isCompleted ? 1 : progress) * 100)))}%
            </Text>
          </View>
          <View style={styles.progressThinTrack}>
            <View style={[styles.progressThinFill, { width: `${Math.round(Math.max(0, Math.min(100, (isCompleted ? 1 : progress) * 100)))}%` }]} />
          </View>

          <View style={styles.statusHeader}>
            <TouchableOpacity
              onPress={handleMarkDone}
              activeOpacity={0.8}
              style={[styles.statusPill, isCompleted && styles.statusPillActive]}
            >
              <Ionicons name="checkmark" size={16} color={isCompleted ? '#fff' : '#fff'} />
              <Text style={[styles.statusPillText, isCompleted && styles.statusPillTextActive]}>
                Done
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsExpanded(v => !v)}
              style={styles.expandBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#3d3d3d" />
            </TouchableOpacity>
            {isCompleted && (
              <TouchableOpacity onPress={handleUndoDone} style={styles.undoBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.undoText}>Undo</Text>
              </TouchableOpacity>
            )}
          </View>

          {isExpanded && (
            <>
              <View style={styles.nextRow}>
                <View style={styles.nextLeft}>
                  <Ionicons name="time-outline" size={16} color="#3c4c48" />
                  <Text style={styles.nextText}>Next: {nextTimeText}</Text>
                </View>
                <View style={styles.readyPill}>
                  <Text style={styles.readyPillText}>{isHoldingNext ? 'On Hold' : 'Ready'}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsHoldingNext(v => !v)}
                activeOpacity={0.9}
                style={[styles.holdNextBtn, isHoldingNext && styles.holdNextBtnActive]}
              >
                <Ionicons name="pause" size={16} color={isHoldingNext ? '#fff' : '#000'} />
                <Text style={[styles.holdNextText, isHoldingNext && styles.holdNextTextActive]}>Hold Next</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

    </SafeAreaView>
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
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,76,72,0.15)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 16,
    color: '#3c4c48',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,76,72,0.15)',
  },
  appointmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#3c4c48',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 4,
    fontWeight: '500',
  },
  appointmentRight: {
    alignItems: 'flex-end',
  },
  serviceText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginBottom: 2,
  },
  barberText: {
    fontSize: 14,
    color: '#3c4c48',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#3c4c48',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#3c4c48',
  },
  statusText: {
    fontSize: 12,
    color: '#3c4c48',
    marginTop: 4,
  },
  unavailableText: {
    color: '#9E9E9E',
  },
  customerInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.08)',
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  customerInfoLabel: {
    fontSize: 14,
    color: '#3c4c48',
    fontWeight: '500',
    flex: 1,
  },
  customerInfoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  rewardsContainer: {
    alignItems: 'flex-end',
    flex: 2,
  },
  rewardsNumber: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  rewardsLabel: {
    fontSize: 12,
    color: '#3c4c48',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    marginRight: 2,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(60,76,72,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
    minHeight: 80,
    backgroundColor: '#fff',
  },
  editableField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notesEditIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  // Menu Modal styles (replacing dropdown)
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
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
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  menuTextBlock: {
    fontSize: 16,
    color: 'red',
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  // Edit mode styles
  editModeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Cancel Modal Styles
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cancelModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelModalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelModalIconContainerWarning: {
    backgroundColor: '#FFF5F0',
  },
  cancelModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  cancelModalSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  cancelModalInfoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cancelModalInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cancelModalInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  cancelModalInfoLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  cancelModalInfoValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  cancelModalStatusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  cancelModalStatusCardSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  cancelModalStatusCardWarning: {
    backgroundColor: '#FFF5F0',
    borderColor: '#FFE5D9',
  },
  cancelModalStatusText: {
    flex: 1,
    marginLeft: 12,
  },
  cancelModalStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cancelModalStatusTitleWarning: {
    color: '#DC2626',
  },
  cancelModalStatusMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  cancelModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalButtonKeep: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButtonKeepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  cancelModalButtonConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButtonConfirmWarning: {
    backgroundColor: '#DC2626',
  },
  cancelModalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  editInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    textAlign: 'right',
  },
  editTextArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    textAlignVertical: 'top',
    minHeight: 80,
    backgroundColor: '#fff',
  },
  allergiesText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  // Old dropdown styles (keeping for backward compatibility)
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 200,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '400',
  },
  dropdownItemTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 0,
  },
  videosContainer: {
    padding: 16,
  },
  videosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mediaCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mediaThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  mediaInfo: {
    padding: 12,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  mediaDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  mediaBarber: {
    fontSize: 12,
    color: '#666',
  },
  staticFieldText: {
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,76,72,0.15)',
    paddingVertical: 6,
  },
  floatingCompleteContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
  },
  statusPillActive: {
    backgroundColor: '#6E6E6E',
  },
  statusPillText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusPillTextActive: {
    color: '#fff',
  },
  expandBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  undoBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 4,
  },
  undoText: {
    color: '#2E71FF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressMetaLabel: {
    fontSize: 14,
    color: '#2E71FF',
  },
  progressMetaPercent: {
    fontSize: 14,
    color: '#2E71FF',
    fontWeight: '600',
  },
  progressThinTrack: {
    height: 10,
    borderRadius: 4,
    backgroundColor: '#D7D7DC',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressThinFill: {
    height: '100%',
    backgroundColor: '#0B0B25',
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextText: {
    marginLeft: 6,
    color: '#3c4c48',
    fontSize: 14,
  },
  readyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EFEFF4',
    borderRadius: 14,
  },
  readyPillText: {
    fontSize: 12,
    color: '#3c4c48',
    fontWeight: '600',
  },
  holdNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  holdNextBtnActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  holdNextText: {
    marginLeft: 8,
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  holdNextTextActive: {
    color: '#fff',
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  progressTime: {
    fontSize: 12,
    color: '#3c4c48',
  },
  progressTrack: {
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(60,76,72,0.08)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FF3B30',
  },
  sliderKnob: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});