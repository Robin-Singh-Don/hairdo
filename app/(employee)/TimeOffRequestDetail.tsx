import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import type { EmployeeTimeOffRequest } from '../../services/mock/AppMockData';

export default function TimeOffRequestDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const getParam = (key: string): string | undefined => {
    const v = params[key];
    if (Array.isArray(v)) return v[0];
    if (typeof v === 'string') return v;
    return undefined;
  };
  const id = getParam('id');
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<EmployeeTimeOffRequest | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [newStart, setNewStart] = useState<string>('');
  const [newEnd, setNewEnd] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const todayMidnight = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        if (!id) {
          Alert.alert('Error', 'Missing request id', [{ text: 'OK', onPress: () => router.back() }]);
          return;
        }
        const data = await employeeAPI.getTimeOffRequestById(id);
        if (!mounted) return;
        if (!data) {
          Alert.alert('Not found', 'This time off request no longer exists.', [{ text: 'OK', onPress: () => router.back() }]);
          return;
        }
        setRequest(data);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const isEditable = useMemo(() => request?.status === 'pending', [request?.status]);

  useEffect(() => {
    if (request) {
      setNewStart(request.startDate);
      setNewEnd(request.endDate);
      const month = parseLocalYMD(request.startDate);
      if (month) setCalendarMonth(month);
    }
  }, [request?.id]);

  const formatYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const parseLocalYMD = (dateStr?: string) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(v => parseInt(v, 10));
    if ([y, m, d].some(isNaN)) return null;
    return new Date(y, (m || 1) - 1, d || 1);
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
    const startWeekday = firstOfMonth.getDay();
    const startDate = new Date(year, month, 1 - startWeekday);
    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push({ date: d, inMonth: d.getMonth() === month });
    }
    return days;
  };
  const handleDayPress = (date: Date) => {
    const ds = formatYMD(date);
    if (!newStart || (newStart && newEnd)) {
      setNewStart(ds);
      setNewEnd('');
      return;
    }
    const s = parseLocalYMD(newStart) || new Date();
    if (date < s) {
      setNewEnd(newStart);
      setNewStart(ds);
    } else {
      setNewEnd(ds);
    }
  };

  const handleEditToggle = () => {
    if (!isEditable) return;
    setEditMode(true);
  };

  const handleCancel = () => {
    if (!request || saving) return;
    setShowCancelModal(true);
  };

  const performCancel = async () => {
    if (!request) return;
    try {
      setSaving(true);
      const ok = await employeeAPI.deleteTimeOffRequest(request.id);
      if (!ok) throw new Error('Delete failed');
      await employeeAPI.removeNotificationsForRequest(request.id);
      await employeeAPI.addNotification({
        title: 'Time Off Request Cancelled',
        message: `Your time off request for ${formatRange(request.startDate, request.endDate)} was cancelled.`,
        type: 'schedule',
        time: 'Just now',
        isRead: false,
      });
      setShowCancelModal(false);
      router.replace({ pathname: '/notification2', params: { tab: 'notifications' } as any });
    } catch {
      setShowCancelModal(false);
      Alert.alert('Error', 'Failed to cancel request.');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (status?: EmployeeTimeOffRequest['status']) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return '#FFA500'; // pending
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return '-';
    const parts = d.split('-').map(v => parseInt(v, 10));
    if (parts.length !== 3 || parts.some(isNaN)) return d;
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRange = (start?: string, end?: string) => {
    if (!start) return '-';
    if (!end || end === start) return formatDate(start);
    return `${formatDate(start)} → ${formatDate(end)}`;
  };

  if (loading || !request) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#666' }}>Loading time off request…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Time Off Request</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={[styles.statusPill, { backgroundColor: statusColor(request.status) + '22', borderColor: statusColor(request.status) }]}>
              <Text style={[styles.statusText, { color: statusColor(request.status) }]}>{request.status?.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{request.type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dates</Text>
            <Text style={styles.value}>{formatRange(request.startDate, request.endDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>
              {request.duration === 'multiple_days'
                ? 'Multiple Days'
                : request.duration === 'half_day'
                  ? `Half Day${request.halfDayPeriod ? ` – ${request.halfDayPeriod === 'AM' ? 'Morning' : 'Afternoon'}` : ''}`
                  : 'Full Day'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Reason</Text>
            <Text style={styles.value}>{request.reason || '-'}</Text>
          </View>
          {!!request.notes && (
            <View style={styles.row}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{request.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {isEditable && !editMode ? (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleEditToggle} disabled={saving}>
                <Text style={styles.primaryBtnText}>Edit Request</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerBtn} onPress={handleCancel} disabled={saving}>
                <Text style={styles.dangerBtnText}>Cancel Request</Text>
              </TouchableOpacity>
            </>
          ) : !isEditable ? (
            <Text style={styles.infoText}>This request is {request.status}. Editing is disabled.</Text>
          ) : (
            <>
              {/* Inline date editor */}
              <View style={styles.editCard}>
                <Text style={styles.editTitle}>Edit Dates</Text>
                <Text style={styles.editHint}>Tap a day to start, then tap another to set the end.</Text>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity style={styles.calendarNavBtn} onPress={() => setCalendarMonth(addMonths(calendarMonth, -1))}>
                    <Ionicons name="chevron-back" size={18} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.calendarMonthText}>
                    {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
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
                  {getMonthDays(calendarMonth).map(({ date, inMonth }, idx) => {
                    const ds = formatYMD(date);
                    const selectedStart = newStart === ds;
                    const selectedEnd = newEnd === ds;
                    const inRange = (() => {
                      if (!newStart || !newEnd) return false;
                      const t = date.getTime();
                      const s = parseLocalYMD(newStart)?.getTime() || 0;
                      const e = parseLocalYMD(newEnd)?.getTime() || 0;
                      return t > s && t < e;
                    })();
                    const isPast = date.getTime() < todayMidnight;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.dayCell, (!inMonth || isPast) && { opacity: 0.3 }]}
                        onPress={() => handleDayPress(date)}
                        disabled={!inMonth || isPast}
                      >
                        <View style={[
                          styles.dayInner,
                          inRange && styles.dayInRange,
                          selectedStart && styles.daySelectedStart,
                          selectedEnd && styles.daySelectedEnd,
                        ]}>
                          <Text style={[
                            styles.dayText,
                            (selectedStart || selectedEnd) && styles.dayTextSelected
                          ]}>
                            {date.getDate()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.currentSel}>Selected: {formatRange(newStart, newEnd || newStart)}</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={async () => {
                  if (!request) return;
                  if (!newStart) {
                    Alert.alert('Missing date', 'Please pick at least a start date.');
                    return;
                  }
                  try {
                    setSaving(true);
                    const multi = newEnd && newEnd !== newStart;
                    const updated = await employeeAPI.updateTimeOffRequest(request.id, {
                      startDate: newStart,
                      endDate: newEnd || newStart,
                      duration: multi ? 'multiple_days' : request.duration,
                    });
                    setRequest(updated);
                    setEditMode(false);
                    // Update existing notification instead of adding duplicate
                    const updatedMsg = `Dates updated to ${formatRange(updated.startDate, updated.endDate)}.`;
                    const ok = await employeeAPI.updateNotificationForRequest(updated.id, {
                      title: 'Time Off Request Updated',
                      message: updatedMsg,
                      time: 'Just now',
                    });
                    if (!ok) {
                      await employeeAPI.addNotification({
                        title: 'Time Off Request Updated',
                        message: updatedMsg,
                        type: 'schedule',
                        time: 'Just now',
                        isRead: false,
                        route: '/(employee)/TimeOffRequestDetail',
                        params: { id: updated.id },
                      });
                    }
                  } catch {
                    Alert.alert('Error', 'Failed to update request.');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setEditMode(false)} disabled={saving}>
                <Text style={styles.secondaryBtnText}>Discard Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerBtn} onPress={handleCancel} disabled={saving}>
                <Text style={styles.dangerBtnText}>Cancel Request</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      
      {/* Confirm Cancel Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cancel Request?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to cancel and delete this time off request?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => setShowCancelModal(false)} disabled={saving}>
                <Text style={styles.modalSecondaryText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDanger} onPress={performCancel} disabled={saving}>
                <Text style={styles.modalDangerText}>{saving ? 'Cancelling…' : 'Yes, cancel'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  label: { fontSize: 14, color: '#666', fontWeight: '500' },
  value: { fontSize: 14, color: '#000', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },
  actions: { marginTop: 16, gap: 12 },
  primaryBtn: { backgroundColor: '#000', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { backgroundColor: '#F0F0F0', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  secondaryBtnText: { color: '#333', fontSize: 16, fontWeight: '600' },
  dangerBtn: { backgroundColor: '#E7222E', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  dangerBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoText: { fontSize: 13, color: '#666', textAlign: 'center' },
  editCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editTitle: { fontSize: 16, fontWeight: '700', color: '#03191E', marginBottom: 6 },
  editHint: { fontSize: 12, color: '#666', marginBottom: 8 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  calendarNavBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  calendarMonthText: { fontSize: 14, fontWeight: '600', color: '#333' },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weekdayLabel: { width: '14.28%', textAlign: 'center', color: '#666', fontSize: 12, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, padding: 2 },
  dayInner: { flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dayInRange: { backgroundColor: '#E8F5E8' },
  daySelectedStart: { backgroundColor: '#4CAF50' },
  daySelectedEnd: { backgroundColor: '#4CAF50' },
  dayText: { color: '#333', fontSize: 14, fontWeight: '500' },
  dayTextSelected: { color: '#fff' },
  currentSel: { marginTop: 8, fontSize: 13, color: '#333', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '100%', maxWidth: 420 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 8 },
  modalText: { fontSize: 14, color: '#333', marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalSecondary: { backgroundColor: '#F0F0F0', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  modalSecondaryText: { color: '#333', fontSize: 14, fontWeight: '600' },
  modalDanger: { backgroundColor: '#E7222E', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  modalDangerText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});


