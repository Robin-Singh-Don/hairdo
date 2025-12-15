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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { employeeAPI } from '../../services/api/employeeAPI';
import { Availability } from '../../services/mock/AppMockData';
import { 
  getAvailabilityPreferences, 
  setAvailabilityPreferences,
  AvailabilityNotificationSettings 
} from '../../services/preferences/availabilityPreferences';

interface NotificationSettings {
  sms: boolean;
  email: boolean;
  push: boolean;
}

export default function AvailabilitySettingsScreen() {
  const router = useRouter();
  
  const [notificationSettings, setNotificationSettings] = useState<AvailabilityNotificationSettings>({
    shiftReminders: {
      sms: false,
      email: false,
      push: false,
      reminderHours: 24,
    },
    shiftSwaps: {
      sms: false,
      email: false,
      push: true,
    },
    shiftReleases: {
      sms: false,
      email: false,
      push: false,
    },
    scheduleChanges: {
      sms: false,
      email: false,
      push: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const reminderHoursOptions = [1, 2, 3, 4, 6, 12, 24, 48];

  // Load preferences from AsyncStorage
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const savedSettings = await getAvailabilityPreferences();
      setNotificationSettings(savedSettings);
    } catch (error) {
      console.error('Error loading availability preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [loadPreferences])
  );

  const handleSave = async () => {
    try {
      // Save notification settings
      // await employeeAPI.updateAvailabilityNotifications(notificationSettings);
      
      Alert.alert(
        'Settings Saved',
        'Your availability notification settings have been updated.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save settings. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const updateNotificationSetting = async (
    category: keyof AvailabilityNotificationSettings,
    type: 'sms' | 'email' | 'push',
    value: boolean
  ) => {
    const updatedSettings = {
      ...notificationSettings,
      [category]: {
        ...notificationSettings[category],
        [type]: value,
      },
    };
    setNotificationSettings(updatedSettings);
    
    // Save to AsyncStorage
    try {
      await setAvailabilityPreferences(updatedSettings);
    } catch (error) {
      console.error('Error saving availability preferences:', error);
    }
  };

  const updateReminderHours = async (hours: number) => {
    const updatedSettings = {
      ...notificationSettings,
      shiftReminders: {
        ...notificationSettings.shiftReminders,
        reminderHours: hours,
      },
    };
    setNotificationSettings(updatedSettings);
    
    // Save to AsyncStorage
    try {
      await setAvailabilityPreferences(updatedSettings);
    } catch (error) {
      console.error('Error saving availability preferences:', error);
    }
  };

  const renderNotificationSection = (
    title: string,
    category: keyof AvailabilityNotificationSettings,
    showReminderOption: boolean = false
  ) => {
    const settings = notificationSettings[category];
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        
        {/* SMS Toggle */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>SMS</Text>
          <Switch
            value={settings.sms}
            onValueChange={(value) => updateNotificationSetting(category, 'sms', value)}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor="#fff"
            ios_backgroundColor="#E0E0E0"
          />
        </View>
        
        {/* Email Toggle */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Email</Text>
          <Switch
            value={settings.email}
            onValueChange={(value) => updateNotificationSetting(category, 'email', value)}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor="#fff"
            ios_backgroundColor="#E0E0E0"
          />
        </View>
        
        {/* Push Notification Toggle */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notification</Text>
          <Switch
            value={settings.push}
            onValueChange={(value) => updateNotificationSetting(category, 'push', value)}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor="#fff"
            ios_backgroundColor="#E0E0E0"
          />
        </View>
        
        {/* Reminder Hours Option (only for Shift Reminders) */}
        {showReminderOption && (
          <View style={styles.reminderOptionRow}>
            <View style={styles.reminderOptionLeft}>
              <Ionicons name="notifications-outline" size={20} color="#666" />
              <Text style={styles.reminderOptionText}>
                {settings.reminderHours} Hour{settings.reminderHours !== 1 ? 's' : ''} Before Shift
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowReminderModal(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shift Reminders Section */}
        {renderNotificationSection('Shift Reminders', 'shiftReminders', true)}
        
        {/* Shift Swaps Section */}
        {renderNotificationSection('Shift Swaps', 'shiftSwaps')}
        
        {/* Shift Releases Section */}
        {renderNotificationSection('Shift Releases', 'shiftReleases')}
        
        {/* Schedule Changes Section */}
        {renderNotificationSection('Schedule Changes', 'scheduleChanges')}
      </ScrollView>

      {/* Reminder Time Modal */}
      <Modal
        visible={showReminderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReminderModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <Text style={styles.modalTitle}>
                {notificationSettings.shiftReminders.reminderHours} Hour{notificationSettings.shiftReminders.reminderHours !== 1 ? 's' : ''} Before Shift
              </Text>
            </View>
            
            <FlatList
              data={reminderHoursOptions}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => {
                const isSelected = notificationSettings.shiftReminders.reminderHours === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected
                    ]}
                    onPress={async () => {
                      await updateReminderHours(item);
                      setShowReminderModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        isSelected && styles.modalOptionTextSelected
                      ]}
                    >
                      {item} Hour{item !== 1 ? 's' : ''}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalOptionsList}
            />
          </View>
        </TouchableOpacity>
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
    backgroundColor: '#4CAF50',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '400',
  },
  reminderOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  reminderOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderOptionText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
    fontWeight: '400',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  modalOptionsList: {
    paddingVertical: 8,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#F5F5F5',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '400',
  },
  modalOptionTextSelected: {
    color: '#333',
    fontWeight: '500',
  },
});

