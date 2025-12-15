import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import { getReminderMinutesBefore, setReminderMinutesBefore } from '../../services/preferences/bookingPreferences';

export default function AppointmentReminders() {
  const router = useRouter();
  const [reminderSettings, setReminderSettings] = useState({
    enableReminders: true,
    emailReminders: true,
    smsReminders: false,
    pushReminders: true,
  });
  const [loading, setLoading] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState<number>(24 * 60);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<'presets' | 'manual'>('presets');
  const [manualMinutes, setManualMinutes] = useState<string>('1440');
  const [error, setError] = useState<string>('');

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, we'll just simulate loading since this is a settings screen
        // In a real app, you might call employeeAPI.getReminderSettings()
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        const minBefore = await getReminderMinutesBefore();
        setReminderMinutes(minBefore);
        setManualMinutes(String(minBefore));
      } catch (error) {
        console.error('Error loading reminder settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateSetting = (key: string, value: boolean | string) => {
    setReminderSettings(prev => ({ ...prev, [key]: value }));
  };

  const reminderOptions = [
    {
      title: 'Enable Reminders',
      description: 'Send appointment reminders to clients',
      key: 'enableReminders',
      type: 'switch',
    },
  ];

  const PRESETS: { label: string; minutes: number }[] = [
    { label: '30 min', minutes: 30 },
    { label: '1 hour', minutes: 60 },
    { label: '2 hours', minutes: 120 },
    { label: '12 hours', minutes: 720 },
    { label: '24 hours', minutes: 1440 },
    { label: '48 hours', minutes: 2880 },
    { label: '1 week', minutes: 10080 },
  ];

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    if (mins % 1440 === 0) return `${mins / 1440} day${mins === 1440 ? '' : 's'}`;
    if (mins % 60 === 0) return `${mins / 60} hour${mins === 60 ? '' : 's'}`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hours}h ${rem}m`;
  };

  const openModal = () => {
    setTab('presets');
    setManualMinutes(String(reminderMinutes));
    setError('');
    setShowModal(true);
  };

  const validateMinutes = (m: number) => {
    if (!Number.isFinite(m) || m < 5 || m > 10080) {
      return 'Enter minutes between 5 and 10080 (7 days).';
    }
    return '';
  };

  const applyReminder = async () => {
    const next = parseInt(manualMinutes || '0', 10);
    const err = validateMinutes(next);
    setError(err);
    if (err) return;
    setReminderMinutes(next);
    try {
      await setReminderMinutesBefore(next);
    } catch {}
    setShowModal(false);
  };

  const deliveryOptions = [
    {
      title: 'Email Reminders',
      description: 'Send reminders via email',
      key: 'emailReminders',
      type: 'switch',
    },
    {
      title: 'SMS Reminders',
      description: 'Send reminders via text message',
      key: 'smsReminders',
      type: 'switch',
    },
    {
      title: 'Push Notifications',
      description: 'Send app push notifications',
      key: 'pushReminders',
      type: 'switch',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading reminder settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Reminders</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Settings</Text>
          <Text style={styles.sectionDescription}>
            Configure when and how clients receive appointment reminders
          </Text>
        </View>

        {reminderOptions.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Switch
              value={reminderSettings[option.key as keyof typeof reminderSettings] as boolean}
              onValueChange={(value) => updateSetting(option.key, value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={reminderSettings[option.key as keyof typeof reminderSettings] ? '#fff' : '#fff'}
              disabled={option.key !== 'enableReminders' && !reminderSettings.enableReminders}
            />
          </View>
        ))}

        {/* Compact Reminder Window */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Window</Text>
          <Text style={styles.sectionDescription}>
            Choose a single reminder sent this long before the appointment
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.optionRow, { borderWidth: 1, borderColor: '#E5E7EB' }]}
          activeOpacity={0.8}
          onPress={openModal}
          disabled={!reminderSettings.enableReminders}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Send reminder</Text>
            <Text style={styles.optionDescription}>
              {`Automatically ${formatMinutes(reminderMinutes)} before start`}
            </Text>
          </View>
          <Ionicons name="settings-outline" size={18} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>
          <Text style={styles.sectionDescription}>
            Choose how reminders are delivered to clients
          </Text>
        </View>

        {deliveryOptions.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Switch
              value={reminderSettings[option.key as keyof typeof reminderSettings] as boolean}
              onValueChange={(value) => updateSetting(option.key, value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={reminderSettings[option.key as keyof typeof reminderSettings] ? '#fff' : '#fff'}
              disabled={!reminderSettings.enableReminders}
            />
          </View>
        ))}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Reminders help reduce no-shows and keep your schedule organized. Choose the timing that works best for your clients.
          </Text>
        </View>
      </ScrollView>

      {/* Modal to set reminder window */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reminder Window</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => setTab('presets')} style={[styles.tabBtn, tab === 'presets' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, tab === 'presets' && styles.tabTextActive]}>Presets</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTab('manual')} style={[styles.tabBtn, tab === 'manual' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, tab === 'manual' && styles.tabTextActive]}>Manual</Text>
              </TouchableOpacity>
            </View>

            {tab === 'presets' ? (
              <View style={styles.presetsWrap}>
                {PRESETS.map(p => {
                  const selected = reminderMinutes === p.minutes;
                  return (
                    <TouchableOpacity
                      key={p.minutes}
                      style={[styles.pill, selected && styles.pillSelected]}
                      onPress={() => {
                        setReminderMinutes(p.minutes);
                        setManualMinutes(String(p.minutes));
                        setError('');
                      }}
                    >
                      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{p.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.inputLabel}>Enter minutes (5–10080)</Text>
                <View style={styles.manualRow}>
                  <TextInput
                    style={[styles.manualInput, !!error && styles.inputErrorBorder]}
                    value={manualMinutes}
                    onChangeText={(t) => {
                      setManualMinutes(t.replace(/[^0-9]/g, ''));
                      setError('');
                    }}
                    keyboardType="number-pad"
                    placeholder="1440"
                    maxLength={5}
                  />
                  <Text style={styles.manualSuffix}>min</Text>
                </View>
                {!!error && <Text style={styles.errorText}>{error}</Text>}
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={applyReminder}>
              <Text style={styles.primaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  // Modal styles (reuse from other screens)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginTop: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#111827',
  },
  presetsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  pillSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  pillText: {
    color: '#111827',
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#fff',
  },
  inputLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manualInput: {
    width: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  inputErrorBorder: {
    borderColor: '#D32F2F',
  },
  manualSuffix: {
    marginLeft: 8,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 6,
    color: '#D32F2F',
  },
  primaryBtn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

