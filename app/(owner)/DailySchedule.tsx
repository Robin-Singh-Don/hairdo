import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerStaffMember, ApprovedStaffSchedule } from '../../services/mock/AppMockData';

export default function DailySchedule() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [staffSchedules, setStaffSchedules] = useState<ApprovedStaffSchedule[]>([]);
  const [staffMembers, setStaffMembers] = useState<OwnerStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ApprovedStaffSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    staffId: 0,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '18:00',
    notes: '',
  });

  // Load data - refresh when screen comes into focus or date changes
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [staff, schedules] = await Promise.all([
        ownerAPI.getStaffMembers(),
        ownerAPI.getApprovedSchedules(selectedDate.toISOString().split('T')[0]),
      ]);
      setStaffMembers(staff);
      setStaffSchedules(schedules);
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

  // Get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase();
  };

  // Open edit modal
  const openEditModal = (schedule: ApprovedStaffSchedule) => {
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

  // Handle edit schedule
  const handleEditSchedule = async () => {
    if (!editingSchedule) return;
    
    try {
      await ownerAPI.updateSchedule(editingSchedule.id, {
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        notes: scheduleForm.notes || undefined,
      });
      
      // Reload schedules
      const schedules = await ownerAPI.getApprovedSchedules(selectedDate.toISOString().split('T')[0]);
      setStaffSchedules(schedules);
      setShowEditSchedule(false);
      setEditingSchedule(null);
      resetForm();
      Alert.alert('Success', 'Schedule updated successfully');
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

  // Reset form
  const resetForm = () => {
    setScheduleForm({
      staffId: 0,
      date: selectedDate.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '18:00',
      notes: '',
    });
  };

  // Render edit schedule modal
  const renderEditScheduleModal = () => {
    if (!editingSchedule) return null;

    const staff = getStaffById(editingSchedule.staffId);

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
              <Text style={styles.modalTitle}>Edit Schedule</Text>
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
                  <Text style={styles.label}>Start Time</Text>
                  <TextInput
                    style={styles.input}
                    value={scheduleForm.startTime}
                    onChangeText={(text) => setScheduleForm({ ...scheduleForm, startTime: text })}
                    placeholder="HH:MM"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>End Time</Text>
                  <TextInput
                    style={styles.input}
                    value={scheduleForm.endTime}
                    onChangeText={(text) => setScheduleForm({ ...scheduleForm, endTime: text })}
                    placeholder="HH:MM"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={scheduleForm.notes}
                  onChangeText={(text) => setScheduleForm({ ...scheduleForm, notes: text })}
                  placeholder="Add notes..."
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditSchedule(false);
                  setEditingSchedule(null);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleEditSchedule}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const filteredSchedules = staffSchedules.filter(schedule => schedule.date === selectedDateStr);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Daily Schedule</Text>
        <View style={styles.headerRight} />
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
      <ScrollView style={styles.staffCardsContainer} showsVerticalScrollIndicator={false}>
        {filteredSchedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#9E9E9E" />
            <Text style={styles.emptyStateText}>No schedules for this date</Text>
            <Text style={styles.emptyStateSubtext}>Add a schedule from the Staff Schedule page</Text>
          </View>
        ) : (
          filteredSchedules.map((schedule) => {
            const status = getCurrentStatus(schedule);
            const staff = getStaffById(schedule.staffId);
            const isTodayDate = schedule.date === new Date().toISOString().split('T')[0];

            return (
              <View key={schedule.id} style={styles.staffCard}>
                <View style={styles.staffCardHeader}>
                  <View style={styles.staffCardAvatar}>
                    <Text style={styles.staffCardAvatarText}>
                      {getInitials(staff?.name || '')}
                    </Text>
                  </View>
                  <View style={styles.staffCardInfo}>
                    <Text style={styles.staffCardName}>{staff?.name || 'Unknown'}</Text>
                    <Text style={styles.staffCardRole}>{staff?.role || ''}</Text>
                  </View>
                  <View style={[styles.statusBadge, status === 'active' && styles.activeBadge]}>
                    <View style={[styles.statusDot, status === 'active' && styles.activeDot]} />
                    <Text style={styles.statusText}>
                      {status === 'active' ? 'On Duty' : status === 'scheduled' ? 'Scheduled' : 'Completed'}
                    </Text>
                  </View>
                </View>

                <View style={styles.staffCardSchedule}>
                  <View style={styles.scheduleRow}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.scheduleText}>
                      {schedule.startTime} - {schedule.endTime}
                    </Text>
                  </View>
                  <View style={styles.scheduleRow}>
                    <Ionicons name="calendar-outline" size={18} color="#666" />
                    <Text style={styles.scheduleText}>
                      {isTodayDate ? 'Today' : formatDateShort(selectedDate)}
                    </Text>
                  </View>
                  {schedule.notes && (
                    <View style={styles.scheduleRow}>
                      <Ionicons name="document-text-outline" size={18} color="#666" />
                      <Text style={styles.scheduleText}>{schedule.notes}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(schedule)}
                  >
                    <Ionicons name="create-outline" size={18} color="#000" />
                    <Text style={styles.editButtonText}>Edit Schedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSchedule(schedule.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modals */}
      {renderEditScheduleModal()}
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
    width: 40,
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
    fontSize: 12,
    fontWeight: '600',
  },
  staffCardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
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
    backgroundColor: '#fff',
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  deleteButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    backgroundColor: '#FFF5F5',
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
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  staffDisplayName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    paddingVertical: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

