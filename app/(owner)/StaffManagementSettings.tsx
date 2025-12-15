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
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { StaffManagementSettings as StaffManagementSettingsType, StaffRolePermissions, SchedulingDefaults, StaffNotificationSettings } from '../../services/mock/AppMockData';

export default function StaffManagementSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<StaffManagementSettingsType | null>(null);
  
  // Modals for editing scheduling values
  const [showShiftDurationModal, setShowShiftDurationModal] = useState(false);
  const [showMaxAppointmentsModal, setShowMaxAppointmentsModal] = useState(false);
  const [showBufferTimeModal, setShowBufferTimeModal] = useState(false);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await ownerAPI.getStaffManagementSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading staff management settings:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (roleKey: string, permission: string) => {
    if (!settings) return;
    
    try {
      const role = settings.roles.find(r => r.roleKey === roleKey);
      if (!role) return;

      const newPermissionValue = !role.permissions[permission as keyof typeof role.permissions];
      
      // Update local state immediately for responsive UI
      setSettings(prev => {
        if (!prev) return null;
        return {
          ...prev,
          roles: prev.roles.map(r => 
            r.roleKey === roleKey 
              ? {
                  ...r,
                  permissions: {
                    ...r.permissions,
                    [permission]: newPermissionValue
                  }
                }
              : r
          )
        };
      });

      // Save to backend
      await ownerAPI.updateStaffRolePermissions(roleKey, {
        [permission]: newPermissionValue
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      Alert.alert('Error', 'Failed to update permission. Please try again.');
      // Reload settings to revert UI
      loadSettings();
    }
  };

  const handleToggleSchedulingSetting = async (setting: 'allowOvertime' | 'allowSelfScheduling') => {
    if (!settings) return;
    
    try {
      const newValue = !settings.schedulingDefaults[setting];
      
      // Update local state
      setSettings(prev => {
        if (!prev) return null;
        return {
          ...prev,
          schedulingDefaults: {
            ...prev.schedulingDefaults,
            [setting]: newValue
          }
        };
      });

      // Save to backend
      await ownerAPI.updateSchedulingDefaults({
        [setting]: newValue
      });
    } catch (error) {
      console.error('Error updating scheduling setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
      loadSettings();
    }
  };

  const handleUpdateSchedulingValue = async (
    setting: 'defaultShiftDuration' | 'maxAppointmentsPerDay' | 'bufferTimeBetweenAppointments',
    value: number
  ) => {
    if (!settings) return;
    
    try {
      // Update local state
      setSettings(prev => {
        if (!prev) return null;
        return {
          ...prev,
          schedulingDefaults: {
            ...prev.schedulingDefaults,
            [setting]: value
          }
        };
      });

      // Save to backend
      await ownerAPI.updateSchedulingDefaults({
        [setting]: value
      });

      // Close modal
      if (setting === 'defaultShiftDuration') setShowShiftDurationModal(false);
      if (setting === 'maxAppointmentsPerDay') setShowMaxAppointmentsModal(false);
      if (setting === 'bufferTimeBetweenAppointments') setShowBufferTimeModal(false);
    } catch (error) {
      console.error('Error updating scheduling value:', error);
      Alert.alert('Error', 'Failed to update value. Please try again.');
      loadSettings();
    }
  };

  const handleToggleNotificationSetting = async (setting: keyof StaffNotificationSettings) => {
    if (!settings) return;
    
    try {
      const newValue = !settings.notificationSettings[setting];
      
      // Update local state
      setSettings(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notificationSettings: {
            ...prev.notificationSettings,
            [setting]: newValue
          }
        };
      });

      // Save to backend
      await ownerAPI.updateStaffNotificationSettings({
        [setting]: newValue
      });
    } catch (error) {
      console.error('Error updating notification setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
      loadSettings();
    }
  };

  const openValueModal = (setting: string, currentValue: number) => {
    setTempValue(currentValue.toString());
    if (setting === 'defaultShiftDuration') setShowShiftDurationModal(true);
    if (setting === 'maxAppointmentsPerDay') setShowMaxAppointmentsModal(true);
    if (setting === 'bufferTimeBetweenAppointments') setShowBufferTimeModal(true);
  };

  const saveValueFromModal = (setting: 'defaultShiftDuration' | 'maxAppointmentsPerDay' | 'bufferTimeBetweenAppointments') => {
    const numValue = parseInt(tempValue, 10);
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Invalid Value', 'Please enter a valid number');
      return;
    }
    handleUpdateSchedulingValue(setting, numValue);
  };

  const renderToggleRow = (
    label: string, 
    value: boolean, 
    onToggle: () => void
  ) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const renderPermissionToggle = (roleKey: string, permission: string, label: string) => {
    if (!settings) return null;
    
    const role = settings.roles.find(r => r.roleKey === roleKey);
    if (!role) return null;
    
    return (
      <View style={styles.permissionItem}>
        <Text style={styles.permissionLabel}>{label}</Text>
        <Switch
          value={role.permissions[permission as keyof typeof role.permissions]}
          onValueChange={() => handleTogglePermission(roleKey, permission)}
          trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
          thumbColor={role.permissions[permission as keyof typeof role.permissions] ? '#fff' : '#f4f3f4'}
        />
      </View>
    );
  };

  const renderRoleSection = (role: StaffRolePermissions) => {
    return (
      <View key={role.roleKey} style={styles.roleCard}>
        <View style={styles.roleCardHeader}>
          <View style={styles.roleCardHeaderLeft}>
            <View style={[styles.roleIcon, { backgroundColor: '#2196F3' + '20' }]}>
              <Ionicons name="person-outline" size={20} color="#2196F3" />
            </View>
            <Text style={styles.roleCardTitle}>{role.name}</Text>
          </View>
        </View>
        
        <View style={styles.permissionsContainer}>
          {renderPermissionToggle(role.roleKey, 'manageAppointments', 'Manage Appointments')}
          {renderPermissionToggle(role.roleKey, 'manageStaff', 'Manage Staff')}
          {renderPermissionToggle(role.roleKey, 'viewReports', 'View Reports')}
          {renderPermissionToggle(role.roleKey, 'manageSettings', 'Manage Settings')}
        </View>
      </View>
    );
  };

  const renderValueModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    label: string,
    unit: string,
    setting: 'defaultShiftDuration' | 'maxAppointmentsPerDay' | 'bufferTimeBetweenAppointments'
  ) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>{label}</Text>
            <TextInput
              style={styles.modalInput}
              value={tempValue}
              onChangeText={setTempValue}
              keyboardType="numeric"
              placeholder={`Enter ${label.toLowerCase()}`}
              autoFocus
            />
            <Text style={styles.modalUnit}>{unit}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={onClose}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={() => saveValueFromModal(setting)}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSchedulingSection = () => {
    if (!settings) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: '#4CAF50' + '20' }]}>
            <Ionicons name="time-outline" size={24} color="#4CAF50" />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Scheduling Defaults</Text>
            <Text style={styles.sectionSubtitle}>Basic scheduling settings</Text>
          </View>
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => openValueModal('defaultShiftDuration', settings.schedulingDefaults.defaultShiftDuration)}
          >
            <Text style={styles.settingLabel}>Default Shift Duration</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{settings.schedulingDefaults.defaultShiftDuration} hours</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => openValueModal('maxAppointmentsPerDay', settings.schedulingDefaults.maxAppointmentsPerDay)}
          >
            <Text style={styles.settingLabel}>Max Appointments/Day</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{settings.schedulingDefaults.maxAppointmentsPerDay}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => openValueModal('bufferTimeBetweenAppointments', settings.schedulingDefaults.bufferTimeBetweenAppointments)}
          >
            <Text style={styles.settingLabel}>Buffer Time Between</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{settings.schedulingDefaults.bufferTimeBetweenAppointments} min</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          {renderToggleRow(
            'Allow Overtime',
            settings.schedulingDefaults.allowOvertime,
            () => handleToggleSchedulingSetting('allowOvertime')
          )}
          {renderToggleRow(
            'Allow Self Scheduling',
            settings.schedulingDefaults.allowSelfScheduling,
            () => handleToggleSchedulingSetting('allowSelfScheduling')
          )}
        </View>
      </View>
    );
  };

  const renderNotificationSection = () => {
    if (!settings) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: '#9C27B0' + '20' }]}>
            <Ionicons name="notifications-outline" size={24} color="#9C27B0" />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Staff Notifications</Text>
            <Text style={styles.sectionSubtitle}>What staff are notified about</Text>
          </View>
        </View>

        <View style={styles.notificationContainer}>
          {renderToggleRow(
            'New Appointments',
            settings.notificationSettings.notifyNewAppointments,
            () => handleToggleNotificationSetting('notifyNewAppointments')
          )}
          {renderToggleRow(
            'Cancellations',
            settings.notificationSettings.notifyCancellations,
            () => handleToggleNotificationSetting('notifyCancellations')
          )}
          {renderToggleRow(
            'Schedule Changes',
            settings.notificationSettings.notifyScheduleChanges,
            () => handleToggleNotificationSetting('notifyScheduleChanges')
          )}
        </View>
      </View>
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
            <Text style={styles.title}>Staff Management Settings</Text>
            <Text style={styles.subtitle}>Configure roles and scheduling</Text>
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
            <Text style={styles.title}>Staff Management Settings</Text>
            <Text style={styles.subtitle}>Configure roles and scheduling</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>Failed to load settings</Text>
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
          <Text style={styles.title}>Staff Management Settings</Text>
          <Text style={styles.subtitle}>Configure roles and scheduling</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Staff Roles & Permissions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#2196F3' + '20' }]}>
              <Ionicons name="people-outline" size={24} color="#2196F3" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Staff Roles & Permissions</Text>
              <Text style={styles.sectionSubtitle}>Define access levels for each role</Text>
            </View>
          </View>
          {settings.roles.map(renderRoleSection)}
        </View>

        {/* Scheduling Defaults */}
        {renderSchedulingSection()}

        {/* Notification Settings */}
        {renderNotificationSection()}
      </ScrollView>

      {/* Modals for editing values */}
      {renderValueModal(
        showShiftDurationModal,
        () => setShowShiftDurationModal(false),
        'Edit Shift Duration',
        'Default Shift Duration',
        'hours',
        'defaultShiftDuration'
      )}
      {renderValueModal(
        showMaxAppointmentsModal,
        () => setShowMaxAppointmentsModal(false),
        'Edit Max Appointments',
        'Max Appointments Per Day',
        '',
        'maxAppointmentsPerDay'
      )}
      {renderValueModal(
        showBufferTimeModal,
        () => setShowBufferTimeModal(false),
        'Edit Buffer Time',
        'Buffer Time Between Appointments',
        'minutes',
        'bufferTimeBetweenAppointments'
      )}
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  roleCard: {
    margin: 16,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  roleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  roleCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  permissionsContainer: {
    padding: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  settingsContainer: {
    padding: 20,
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
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  toggleContainer: {
    padding: 20,
    paddingTop: 0,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  notificationContainer: {
    padding: 20,
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
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  modalUnit: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F0F0F0',
  },
  modalButtonSave: {
    backgroundColor: '#4CAF50',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
