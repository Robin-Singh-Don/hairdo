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
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerSecuritySettings as OwnerSecuritySettingsType, Device } from '../../services/mock/AppMockData';
import { useFocusEffect } from '@react-navigation/native';

export default function SecuritySettings() {
  const router = useRouter();
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [securitySettings, setSecuritySettings] = useState<OwnerSecuritySettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load security settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await ownerAPI.getSecuritySettings();
      setSecuritySettings(settings);
    } catch (err: any) {
      setError(err.message || 'Failed to load security settings');
      console.error('Error loading security settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  const handleToggleSetting = async (setting: 'twoFactorAuth' | 'biometricLogin' | 'sessionTimeout' | 'loginNotifications' | 'deviceManagement') => {
    if (!securitySettings) return;
    
    try {
      setSaving(true);
      
      const updates: Partial<OwnerSecuritySettingsType> = {
        [setting]: !(securitySettings[setting] as boolean)
      };
      
      // If disabling 2FA, show confirmation
      if (setting === 'twoFactorAuth' && securitySettings.twoFactorAuth) {
        Alert.alert(
          'Disable Two-Factor Authentication',
          'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setSaving(false) },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                const updated = await ownerAPI.updateSecuritySettings(updates);
                setSecuritySettings(updated);
                setSaving(false);
                Alert.alert('Success', 'Two-factor authentication disabled');
              }
            }
          ]
        );
        return;
      }
      
      // If enabling 2FA, show modal for verification code
      if (setting === 'twoFactorAuth' && !securitySettings.twoFactorAuth) {
        setShowTwoFactorModal(true);
        setSaving(false);
        return;
      }
      
      const updated = await ownerAPI.updateSecuritySettings(updates);
      setSecuritySettings(updated);
    } catch (err: any) {
      setSaving(false);
      Alert.alert('Error', err.message || 'Failed to update setting');
      console.error('Error updating security setting:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEnableTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setSaving(true);
      
      // TODO: In real implementation, verify the code with the backend
      const updated = await ownerAPI.updateSecuritySettings({
        twoFactorAuth: true,
        twoFactorAuthMethod: 'sms'
      });
      
      setSecuritySettings(updated);
      setShowTwoFactorModal(false);
      setVerificationCode('');
      setSaving(false);
      Alert.alert('Success', 'Two-factor authentication enabled successfully!');
    } catch (err: any) {
      setSaving(false);
      Alert.alert('Error', err.message || 'Failed to enable two-factor authentication');
      console.error('Error enabling 2FA:', err);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    Alert.alert(
      'Revoke Device Access',
      'Are you sure you want to revoke access for this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await ownerAPI.revokeDevice(deviceId);
              await loadSettings(); // Reload to get updated device list
              Alert.alert('Success', 'Device access revoked successfully');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to revoke device access');
              console.error('Error revoking device:', err);
            }
          }
        }
      ]
    );
  };

  const formatLastActive = (lastActive: string): string => {
    const now = new Date();
    const activeDate = new Date(lastActive);
    const diffMs = now.getTime() - activeDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  const renderSecuritySetting = (
    icon: string, 
    title: string, 
    description: string, 
    setting: 'twoFactorAuth' | 'biometricLogin' | 'sessionTimeout' | 'loginNotifications' | 'deviceManagement', 
    value: boolean
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#000" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={() => handleToggleSetting(setting)}
        trackColor={{ false: '#E0E0E0', true: '#000' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
        disabled={saving}
      />
    </View>
  );

  const getDeviceIcon = (type: Device['type']): string => {
    switch (type) {
      case 'phone':
        return 'phone-portrait';
      case 'tablet':
        return 'tablet-portrait';
      case 'laptop':
      case 'desktop':
        return 'laptop';
      default:
        return 'phone-portrait';
    }
  };

  const renderDeviceItem = (device: Device) => (
    <View key={device.id} style={styles.deviceItem}>
      <View style={styles.deviceInfo}>
        <View style={styles.deviceIcon}>
          <Ionicons 
            name={getDeviceIcon(device.type) as any}
            size={20} 
            color="#000" 
          />
        </View>
        <View style={styles.deviceDetails}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceLocation}>{device.location}</Text>
          <Text style={styles.deviceLastActive}>Last active: {formatLastActive(device.lastActive)}</Text>
        </View>
      </View>
      <View style={styles.deviceActions}>
        {device.isCurrent && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentText}>Current</Text>
          </View>
        )}
        {!device.isCurrent && (
          <TouchableOpacity 
            style={styles.revokeButton}
            onPress={() => handleRevokeDevice(device.id)}
          >
            <Ionicons name="close" size={16} color="#FF6B35" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Security Settings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !securitySettings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Security Settings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load security settings'}</Text>
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
        <Text style={styles.title}>Security Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Account Secured</Text>
              <Text style={styles.statusDescription}>
                Your account is protected with multiple security layers
              </Text>
            </View>
          </View>
        </View>

        {/* Authentication Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          {renderSecuritySetting(
            'key-outline',
            'Two-Factor Authentication',
            'Add an extra layer of security to your account',
            'twoFactorAuth',
            securitySettings.twoFactorAuth
          )}
          {renderSecuritySetting(
            'finger-print-outline',
            'Biometric Login',
            'Use fingerprint or face ID to sign in',
            'biometricLogin',
            securitySettings.biometricLogin
          )}
          {saving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.savingText}>Saving...</Text>
            </View>
          )}
        </View>

        {/* Session Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Management</Text>
          {renderSecuritySetting(
            'time-outline',
            'Auto Sign-Out',
            `Automatically sign out after ${securitySettings.sessionTimeoutMinutes} minutes of inactivity`,
            'sessionTimeout',
            securitySettings.sessionTimeout
          )}
          {renderSecuritySetting(
            'notifications-outline',
            'Login Notifications',
            'Get notified when someone signs into your account',
            'loginNotifications',
            securitySettings.loginNotifications
          )}
        </View>

        {/* Device Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Management</Text>
          {renderSecuritySetting(
            'phone-portrait-outline',
            'Device Management',
            'Manage and monitor devices with account access',
            'deviceManagement',
            securitySettings.deviceManagement
          )}
          
          {securitySettings.deviceManagement && securitySettings.devices.length > 0 && (
            <View style={styles.devicesList}>
              {securitySettings.devices.map(renderDeviceItem)}
            </View>
          )}
        </View>

        {/* Recovery Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recovery Options</Text>
          <View style={styles.recoveryItem}>
            <View style={styles.recoveryIcon}>
              <Ionicons name="mail" size={20} color="#4CAF50" />
            </View>
            <View style={styles.recoveryContent}>
              <Text style={styles.recoveryTitle}>Backup Email</Text>
              <Text style={styles.recoveryDescription}>
                {securitySettings.recoveryOptions.backupEmail}
                {securitySettings.recoveryOptions.isEmailVerified && (
                  <Text style={styles.verifiedText}> • Verified</Text>
                )}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                Alert.alert('Edit Backup Email', 'This feature will be available in the next update.');
              }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recoveryItem}>
            <View style={styles.recoveryIcon}>
              <Ionicons name="call" size={20} color="#4CAF50" />
            </View>
            <View style={styles.recoveryContent}>
              <Text style={styles.recoveryTitle}>Recovery Phone</Text>
              <Text style={styles.recoveryDescription}>
                {securitySettings.recoveryOptions.recoveryPhone}
                {securitySettings.recoveryOptions.isPhoneVerified && (
                  <Text style={styles.verifiedText}> • Verified</Text>
                )}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                Alert.alert('Edit Recovery Phone', 'This feature will be available in the next update.');
              }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Staff Access Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff Access Management</Text>
          <View style={styles.staffInfo}>
            <View style={styles.staffIcon}>
              <Ionicons name="people-outline" size={20} color="#666" />
            </View>
            <View style={styles.staffContent}>
              <Text style={styles.staffTitle}>Team Access</Text>
              <Text style={styles.staffDescription}>Manage staff members and their access</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(owner)/StaffManagement')}
          >
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="person-add-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Manage Staff Access</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(owner)/StaffManagementSettings')}
          >
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Role Permissions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Security Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(owner)/PasswordSettings')}
          >
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="lock-closed-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Security Audit',
                'This will show you a detailed security report of your account. This feature will be available in the next update.'
              );
            }}
          >
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="shield-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Security Audit</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Download Account Data',
                'This will generate a download of all your account data. This feature will be available in the next update.'
              );
            }}
          >
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="download-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Download Account Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Two-Factor Authentication Modal */}
      <Modal
        visible={showTwoFactorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTwoFactorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enable Two-Factor Authentication</Text>
              <TouchableOpacity onPress={() => setShowTwoFactorModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.twoFactorIcon}>
                <Ionicons name="shield-checkmark" size={48} color="#4CAF50" />
              </View>
              <Text style={styles.modalDescription}>
                Enter the 6-digit code sent to your registered phone number to enable two-factor authentication.
              </Text>
              
              <TextInput
                style={styles.codeInput}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowTwoFactorModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleEnableTwoFactor}>
                <Text style={styles.saveButtonText}>Enable 2FA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  // Status Card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Setting Items
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Devices List
  devicesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  deviceLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  deviceLastActive: {
    fontSize: 12,
    color: '#999',
  },
  deviceActions: {
    alignItems: 'center',
  },
  currentBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  revokeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Action Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 20,
  },
  twoFactorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    width: '100%',
    letterSpacing: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Recovery Options
  recoveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recoveryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recoveryContent: {
    flex: 1,
  },
  recoveryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  recoveryDescription: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  editButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  
  // Staff Management
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  staffIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffContent: {
    flex: 1,
  },
  staffTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  staffDescription: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B35',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  savingText: {
    fontSize: 14,
    color: '#666',
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
});
