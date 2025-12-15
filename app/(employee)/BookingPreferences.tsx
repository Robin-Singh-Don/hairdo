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
import { ownerAPI } from '../../services/api/ownerAPI';
import { getWaitlistMax, setWaitlistMax } from '../../services/preferences/bookingPreferences';

export default function BookingPreferences() {
  const router = useRouter();
  const [bookingSettings, setBookingSettings] = useState({
    allowOnlineBooking: true,
    autoConfirmBooking: false,
    allowSameDayBooking: false,
    allowWaitlist: false,
    allowAdvanceBooking: true,
    maxAdvanceDays: 30,
    allowCancellation: true,
    cancellationHours: 24,
    allowRescheduling: true,
    requireDeposit: false,
    depositPercentage: 20,
  });
  const [loading, setLoading] = useState(true);
  const [showMabdModal, setShowMabdModal] = useState(false);
  const [mabdTab, setMabdTab] = useState<'presets' | 'manual'>('presets');
  const [selectedPresetDays, setSelectedPresetDays] = useState<number | null>(null);
  const [manualMabd, setManualMabd] = useState<string>('30');
  const [mabdError, setMabdError] = useState<string>('');
  const [showCnwModal, setShowCnwModal] = useState(false);
  const [cnwTab, setCnwTab] = useState<'presets' | 'manual'>('presets');
  const [selectedCnwPreset, setSelectedCnwPreset] = useState<number | null>(null);
  const [manualCnw, setManualCnw] = useState<string>('24');
  const [cnwError, setCnwError] = useState<string>('');
  const [showDpModal, setShowDpModal] = useState(false);
  const [dpTab, setDpTab] = useState<'presets' | 'manual'>('presets');
  const [selectedDpPreset, setSelectedDpPreset] = useState<number | null>(null);
  const [manualDp, setManualDp] = useState<string>('20');
  const [dpError, setDpError] = useState<string>('');
  const [showWlModal, setShowWlModal] = useState(false);
  const [waitlistMax, setWaitlistMaxLocal] = useState<string>('10');
  const [wlError, setWlError] = useState<string>('');

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load booking preferences from API
        const preferences = await ownerAPI.getBookingPreferences();
        setBookingSettings(preferences);
        setManualMabd(String(preferences.maxAdvanceDays));
        setManualCnw(String(preferences.cancellationHours));
        setManualDp(String(preferences.depositPercentage));
        setWaitlistMaxLocal(String(preferences.waitlistMax));
      } catch (error) {
        console.error('Error loading booking preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateSetting = async (key: string, value: boolean | number) => {
    const updated = { ...bookingSettings, [key]: value };
    setBookingSettings(updated);
    // Save to backend
    try {
      await ownerAPI.updateBookingPreferences({ [key]: value });
    } catch (error) {
      console.error('Error updating booking preference:', error);
      // Revert on error
      setBookingSettings(bookingSettings);
    }
  };

  const openMabdModal = () => {
    setSelectedPresetDays(null);
    setManualMabd(String(bookingSettings.maxAdvanceDays));
    setMabdError('');
    setMabdTab('presets');
    setShowMabdModal(true);
  };

  const validateMabd = (value: number) => {
    if (!Number.isInteger(value) || value < 1 || value > 180) {
      return 'Enter a whole number between 1 and 180 days.';
    }
    return '';
  };

  const applyMabd = async () => {
    const next = selectedPresetDays ?? parseInt(manualMabd || '0', 10);
    const err = validateMabd(next);
    setMabdError(err);
    if (err) return;

    const updated = { ...bookingSettings, maxAdvanceDays: next };
    setBookingSettings(updated);
    try {
      await ownerAPI.updateBookingPreferences({ maxAdvanceDays: next });
      setShowMabdModal(false);
    } catch (error) {
      console.error('Error updating max advance booking days:', error);
      setBookingSettings(bookingSettings); // Revert on error
    }
  };

  const PRESET_OPTIONS: { label: string; days: number }[] = [
    { label: '1 week', days: 7 },
    { label: '2 weeks', days: 14 },
    { label: '3 weeks', days: 21 },
    { label: '1 month', days: 30 },
    { label: '2 months', days: 60 },
    { label: '3 months', days: 90 },
    { label: '6 months', days: 180 },
  ];

  // CNW (Cancellation Notice Window) helpers
  const openCnwModal = () => {
    setSelectedCnwPreset(null);
    setManualCnw(String(bookingSettings.cancellationHours));
    setCnwError('');
    setCnwTab('presets');
    setShowCnwModal(true);
  };

  const validateCnw = (value: number) => {
    if (!Number.isInteger(value) || value < 1 || value > 72) {
      return 'Enter a whole number between 1 and 72 hours.';
    }
    return '';
  };

  const applyCnw = async () => {
    const next = selectedCnwPreset ?? parseInt(manualCnw || '0', 10);
    const err = validateCnw(next);
    setCnwError(err);
    if (err) return;

    const updated = { ...bookingSettings, cancellationHours: next };
    setBookingSettings(updated);
    try {
      await ownerAPI.updateBookingPreferences({ cancellationHours: next });
      setShowCnwModal(false);
    } catch (error) {
      console.error('Error updating cancellation hours:', error);
      setBookingSettings(bookingSettings); // Revert on error
    }
  };

  const CNW_PRESETS: { label: string; hours: number }[] = [
    { label: '12 hours', hours: 12 },
    { label: '24 hours', hours: 24 },
    { label: '36 hours', hours: 36 },
    { label: '48 hours', hours: 48 },
    { label: '72 hours', hours: 72 },
  ];

  // Deposit helpers
  const openDpModal = () => {
    setSelectedDpPreset(null);
    setManualDp(String(bookingSettings.depositPercentage));
    setDpError('');
    setDpTab('presets');
    setShowDpModal(true);
  };

  const validateDp = (value: number) => {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      return 'Enter a whole number between 0% and 100%.';
    }
    return '';
  };

  const applyDp = async () => {
    const next = selectedDpPreset ?? parseInt(manualDp || '0', 10);
    const err = validateDp(next);
    setDpError(err);
    if (err) return;

    const updated = { ...bookingSettings, depositPercentage: next };
    setBookingSettings(updated);
    try {
      await ownerAPI.updateBookingPreferences({ depositPercentage: next });
      setShowDpModal(false);
    } catch (error) {
      console.error('Error updating deposit percentage:', error);
      setBookingSettings(bookingSettings); // Revert on error
    }
  };

  const DP_PRESETS: { label: string; percent: number }[] = [
    { label: '0%', percent: 0 },
    { label: '10%', percent: 10 },
    { label: '15%', percent: 15 },
    { label: '20%', percent: 20 },
    { label: '25%', percent: 25 },
    { label: '30%', percent: 30 },
    { label: '40%', percent: 40 },
    { label: '50%', percent: 50 },
    { label: '100%', percent: 100 },
  ];

  const bookingOptions = [
    {
      title: 'Allow Online Booking',
      description: 'Let clients book appointments online',
      key: 'allowOnlineBooking',
      type: 'switch',
    },
    {
      title: 'Auto‑confirm bookings',
      description: 'Approve new bookings automatically',
      key: 'autoConfirmBooking',
      type: 'switch',
    },
    {
      title: 'Allow Waitlist',
      description: 'Enable waitlist for fully booked slots',
      key: 'allowWaitlist',
      type: 'switch',
    },
    {
      title: 'Allow Same Day Booking',
      description: 'Permit bookings on the same day',
      key: 'allowSameDayBooking',
      type: 'switch',
    },
    {
      title: 'Allow Advance Booking',
      description: 'Enable future date bookings',
      key: 'allowAdvanceBooking',
      type: 'switch',
    },
    {
      title: 'Allow Cancellation',
      description: 'Let clients cancel appointments',
      key: 'allowCancellation',
      type: 'switch',
    },
    {
      title: 'Allow Rescheduling',
      description: 'Permit appointment time changes',
      key: 'allowRescheduling',
      type: 'switch',
    },
    {
      title: 'Require Deposit',
      description: 'Collect deposit for bookings',
      key: 'requireDeposit',
      type: 'switch',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading booking preferences...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Settings</Text>
          <Text style={styles.sectionDescription}>
            Configure how clients can book appointments with you
          </Text>
        </View>

        {bookingOptions.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Switch
              value={bookingSettings[option.key as keyof typeof bookingSettings] as boolean}
              onValueChange={(value) => updateSetting(option.key, value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={bookingSettings[option.key as keyof typeof bookingSettings] ? '#fff' : '#fff'}
            />
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
        </View>

        {/* Max Advance Booking Card (matches screenshot style) */}
        <TouchableOpacity onPress={openMabdModal} activeOpacity={0.8} style={styles.cardRow}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="calendar-outline" size={20} color="#4B5563" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Max Advance Booking</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
              <Text style={styles.cardValue}>{bookingSettings.maxAdvanceDays}</Text>
              <Text style={styles.cardValueUnit}> days</Text>
            </View>
          </View>
          <Ionicons name="settings-outline" size={18} color="#6B7280" />
        </TouchableOpacity>

        {/* Cancellation Notice Card */}
        <TouchableOpacity onPress={openCnwModal} activeOpacity={0.8} style={styles.cardRow}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="time-outline" size={20} color="#4B5563" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Cancellation Notice</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
              <Text style={styles.cardValue}>{bookingSettings.cancellationHours}</Text>
              <Text style={styles.cardValueUnit}> hours</Text>
            </View>
          </View>
          <Ionicons name="settings-outline" size={18} color="#6B7280" />
        </TouchableOpacity>

        {bookingSettings.requireDeposit && (
          <TouchableOpacity onPress={openDpModal} activeOpacity={0.8} style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="cash-outline" size={20} color="#4B5563" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Deposit Percentage</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
                <Text style={styles.cardValue}>{bookingSettings.depositPercentage}</Text>
                <Text style={styles.cardValueUnit}> %</Text>
              </View>
            </View>
            <Ionicons name="settings-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        )}

        {bookingSettings.allowWaitlist && (
          <TouchableOpacity onPress={() => setShowWlModal(true)} activeOpacity={0.8} style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="people-outline" size={20} color="#4B5563" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Waitlist Limit</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
                <Text style={styles.cardValue}>{waitlistMax}</Text>
                <Text style={styles.cardValueUnit}> people</Text>
              </View>
            </View>
            <Ionicons name="settings-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            These settings help you manage your booking workflow and maintain control over your schedule.
          </Text>
        </View>
      </ScrollView>

      {/* MABD Modal */}
      <Modal visible={showMabdModal} transparent animationType="fade" onRequestClose={() => setShowMabdModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Max Advance Booking</Text>
              <TouchableOpacity onPress={() => setShowMabdModal(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => setMabdTab('presets')} style={[styles.tabBtn, mabdTab === 'presets' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, mabdTab === 'presets' && styles.tabTextActive]}>Presets</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMabdTab('manual')} style={[styles.tabBtn, mabdTab === 'manual' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, mabdTab === 'manual' && styles.tabTextActive]}>Manual</Text>
              </TouchableOpacity>
            </View>

            {mabdTab === 'presets' ? (
              <View style={styles.presetsWrap}>
                {PRESET_OPTIONS.map((p) => {
                  const isSelected = selectedPresetDays === p.days || (!selectedPresetDays && bookingSettings.maxAdvanceDays === p.days);
                  return (
                    <TouchableOpacity
                      key={p.days}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => {
                        setSelectedPresetDays(p.days);
                        setMabdError('');
                      }}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{p.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.inputLabel}>Enter days (1–180)</Text>
                <View style={styles.manualRow}>
                  <TextInput
                    style={[styles.manualInput, !!mabdError && styles.inputErrorBorder]}
                    value={manualMabd}
                    onChangeText={(t) => {
                      setSelectedPresetDays(null);
                      setManualMabd(t.replace(/[^0-9]/g, ''));
                      setMabdError('');
                    }}
                    keyboardType="number-pad"
                    placeholder="30"
                    maxLength={3}
                  />
                  <Text style={styles.manualSuffix}>days</Text>
                </View>
                {!!mabdError && <Text style={styles.errorText}>{mabdError}</Text>}
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={applyMabd}>
              <Text style={styles.primaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CNW Modal */}
      <Modal visible={showCnwModal} transparent animationType="fade" onRequestClose={() => setShowCnwModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancellation Notice</Text>
              <TouchableOpacity onPress={() => setShowCnwModal(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => setCnwTab('presets')} style={[styles.tabBtn, cnwTab === 'presets' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, cnwTab === 'presets' && styles.tabTextActive]}>Presets</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCnwTab('manual')} style={[styles.tabBtn, cnwTab === 'manual' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, cnwTab === 'manual' && styles.tabTextActive]}>Manual</Text>
              </TouchableOpacity>
            </View>

            {cnwTab === 'presets' ? (
              <View style={styles.presetsWrap}>
                {CNW_PRESETS.map((p) => {
                  const isSelected = selectedCnwPreset === p.hours || (!selectedCnwPreset && bookingSettings.cancellationHours === p.hours);
                  return (
                    <TouchableOpacity
                      key={p.hours}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => {
                        setSelectedCnwPreset(p.hours);
                        setCnwError('');
                      }}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{p.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.inputLabel}>Enter hours (1–72)</Text>
                <View style={styles.manualRow}>
                  <TextInput
                    style={[styles.manualInput, !!cnwError && styles.inputErrorBorder]}
                    value={manualCnw}
                    onChangeText={(t) => {
                      setSelectedCnwPreset(null);
                      setManualCnw(t.replace(/[^0-9]/g, ''));
                      setCnwError('');
                    }}
                    keyboardType="number-pad"
                    placeholder="24"
                    maxLength={3}
                  />
                  <Text style={styles.manualSuffix}>hours</Text>
                </View>
                {!!cnwError && <Text style={styles.errorText}>{cnwError}</Text>}
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={applyCnw}>
              <Text style={styles.primaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal visible={showDpModal} transparent animationType="fade" onRequestClose={() => setShowDpModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Deposit Percentage</Text>
              <TouchableOpacity onPress={() => setShowDpModal(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => setDpTab('presets')} style={[styles.tabBtn, dpTab === 'presets' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, dpTab === 'presets' && styles.tabTextActive]}>Presets</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDpTab('manual')} style={[styles.tabBtn, dpTab === 'manual' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, dpTab === 'manual' && styles.tabTextActive]}>Manual</Text>
              </TouchableOpacity>
            </View>

            {dpTab === 'presets' ? (
              <View style={styles.presetsWrap}>
                {DP_PRESETS.map((p) => {
                  const isSelected = selectedDpPreset === p.percent || (!selectedDpPreset && bookingSettings.depositPercentage === p.percent);
                  return (
                    <TouchableOpacity
                      key={p.percent}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => {
                        setSelectedDpPreset(p.percent);
                        setDpError('');
                      }}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{p.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.inputLabel}>Enter percentage (0–100)</Text>
                <View style={styles.manualRow}>
                  <TextInput
                    style={[styles.manualInput, !!dpError && styles.inputErrorBorder]}
                    value={manualDp}
                    onChangeText={(t) => {
                      setSelectedDpPreset(null);
                      setManualDp(t.replace(/[^0-9]/g, ''));
                      setDpError('');
                    }}
                    keyboardType="number-pad"
                    placeholder="20"
                    maxLength={3}
                  />
                  <Text style={styles.manualSuffix}>%</Text>
                </View>
                {!!dpError && <Text style={styles.errorText}>{dpError}</Text>}
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={applyDp}>
              <Text style={styles.primaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Waitlist Limit Modal */}
      <Modal visible={showWlModal} transparent animationType="fade" onRequestClose={() => setShowWlModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Waitlist Limit</Text>
              <TouchableOpacity onPress={() => setShowWlModal(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>Max people in waitlist (1–50)</Text>
              <View style={styles.manualRow}>
                <TextInput
                  style={[styles.manualInput, !!wlError && styles.inputErrorBorder]}
                  value={waitlistMax}
                  onChangeText={(t) => { setWlError(''); setWaitlistMaxLocal(t.replace(/[^0-9]/g, '')); }}
                  keyboardType="number-pad"
                  placeholder="10"
                  maxLength={2}
                />
                <Text style={styles.manualSuffix}>people</Text>
              </View>
              {!!wlError && <Text style={styles.errorText}>{wlError}</Text>}
            </View>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={async () => {
                const n = parseInt(waitlistMax || '0', 10);
                if (!Number.isFinite(n) || n < 1 || n > 50) {
                  setWlError('Enter a whole number between 1 and 50.');
                  return;
                }
                try {
                  const updated = { ...bookingSettings, waitlistMax: n };
                  setBookingSettings(updated);
                  await ownerAPI.updateBookingPreferences({ waitlistMax: n });
                  setShowWlModal(false);
                } catch (error) {
                  console.error('Error updating waitlist max:', error);
                  setBookingSettings(bookingSettings); // Revert on error
                }
              }}
            >
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  cardValueUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
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
  // Modal styles
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
    flex: 0,
    width: 100,
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

