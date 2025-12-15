import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerNotificationSettings as OwnerNotificationSettingsType } from '../../services/mock/AppMockData';

type NotificationSettingKey = Exclude<keyof OwnerNotificationSettingsType, 'businessId' | 'updatedAt'>;

interface NotificationSetting {
  key: NotificationSettingKey;
  label: string;
  icon: string;
  description: string;
  category: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  // Notification Channels
  {
    key: 'emailNotifications',
    label: 'Email Notifications',
    icon: 'mail-outline',
    description: 'Receive notifications via email',
    category: 'Channels',
  },
  {
    key: 'pushNotifications',
    label: 'Push Notifications',
    icon: 'notifications-outline',
    description: 'Receive push notifications on your device',
    category: 'Channels',
  },
  // Appointment Notifications
  {
    key: 'appointmentBooked',
    label: 'Appointment Booked',
    icon: 'calendar-outline',
    description: 'Get notified when a new appointment is booked',
    category: 'Appointments',
  },
  {
    key: 'appointmentCancelled',
    label: 'Appointment Cancelled',
    icon: 'close-circle-outline',
    description: 'Get notified when an appointment is cancelled',
    category: 'Appointments',
  },
  {
    key: 'appointmentReminder',
    label: 'Appointment Reminder',
    icon: 'time-outline',
    description: 'Receive reminders before appointments',
    category: 'Appointments',
  },
  // Payment Notifications
  {
    key: 'paymentReceived',
    label: 'Payment Received',
    icon: 'card-outline',
    description: 'Get notified when a payment is received',
    category: 'Payments',
  },
  // Staff Notifications
  {
    key: 'staffScheduleChange',
    label: 'Staff Schedule Change',
    icon: 'people-outline',
    description: 'Get notified when staff schedules change',
    category: 'Staff',
  },
  // Customer Engagement
  {
    key: 'customerReview',
    label: 'New Customer Review',
    icon: 'star-outline',
    description: 'Get notified when customers leave reviews',
    category: 'Customers',
  },
];

const CATEGORIES = [
  { name: 'Channels', icon: 'notifications-outline', color: '#4CAF50' },
  { name: 'Appointments', icon: 'calendar-outline', color: '#2196F3' },
  { name: 'Payments', icon: 'card-outline', color: '#FF9800' },
  { name: 'Staff', icon: 'people-outline', color: '#9C27B0' },
  { name: 'Customers', icon: 'star-outline', color: '#E91E63' },
  { name: 'Frequency', icon: 'time-outline', color: '#607D8B' },
  { name: 'Alerts', icon: 'alert-circle-outline', color: '#795548' },
];

export default function NotificationSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<OwnerNotificationSettingsType | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await ownerAPI.getNotificationSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (settingKey: NotificationSettingKey) => {
    if (!settings) return;

    try {
      const newValue = !settings[settingKey] as boolean;

      // Update local state immediately for responsive UI
      setSettings(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [settingKey]: newValue,
        };
      });

      // Save to backend
      await ownerAPI.updateNotificationSettings({
        [settingKey]: newValue,
      });
    } catch (error) {
      console.error('Error updating notification setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
      // Reload settings to revert UI
      loadSettings();
    }
  };

  const handleEnableEssentials = async () => {
    if (!settings) return;

    try {
      const essentialUpdates = {
        emailNotifications: true,
        pushNotifications: true,
        appointmentBooked: true,
        paymentReceived: true,
        customerReview: true,
      };

      // Update local state
      setSettings(prev => {
        if (!prev) return null;
        return { ...prev, ...essentialUpdates };
      });

      // Save to backend
      await ownerAPI.updateNotificationSettings(essentialUpdates);
      Alert.alert('Success', 'Essential notifications enabled');
    } catch (error) {
      console.error('Error enabling essentials:', error);
      Alert.alert('Error', 'Failed to enable essentials. Please try again.');
      loadSettings();
    }
  };


  const renderSettingItem = (setting: NotificationSetting, index: number) => {
    if (!settings) return null;

    const value = settings[setting.key] as boolean;
    const category = CATEGORIES.find(cat => cat.name === setting.category);
    const isLast = index === NOTIFICATION_SETTINGS.length - 1;

    return (
      <TouchableOpacity
        key={setting.key}
        style={[styles.settingItem, isLast && styles.settingItemLast]}
        onPress={() => handleToggleSetting(setting.key)}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIconContainer, { backgroundColor: category?.color + '20' }]}>
            <Ionicons name={setting.icon as any} size={22} color={category?.color || '#666'} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>{setting.label}</Text>
            <Text style={styles.settingDescription}>{setting.description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={() => handleToggleSetting(setting.key)}
          trackColor={{ false: '#E0E0E0', true: category?.color || '#4CAF50' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      </TouchableOpacity>
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Notification Settings</Text>
            <Text style={styles.subtitle}>Manage your notification preferences</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Notification Settings</Text>
            <Text style={styles.subtitle}>Manage your notification preferences</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>Failed to load notification settings</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSettings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Notification Settings</Text>
          <Text style={styles.subtitle}>Manage your notification preferences</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Notification Settings */}
        <View style={styles.allSettingsSection}>
          {NOTIFICATION_SETTINGS.map((setting, index) => renderSettingItem(setting, index))}
        </View>

        {/* Quick Actions */}
        <TouchableOpacity
          style={styles.enableEssentialsButton}
          onPress={handleEnableEssentials}
          disabled={saving}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
          <Text style={styles.enableEssentialsButtonText}>Enable Essential Notifications</Text>
          {saving && <ActivityIndicator size="small" color="#4CAF50" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  allSettingsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    padding: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  enableEssentialsButton: {
    marginTop: 4,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  enableEssentialsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
});
