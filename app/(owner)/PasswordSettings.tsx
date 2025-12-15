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
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';

export default function PasswordSettings() {
  const router = useRouter();
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordInfo, setPasswordInfo] = useState<{
    passwordLastChanged?: string;
    passwordExpiresInDays?: number;
  } | null>(null);

  useEffect(() => {
    loadPasswordInfo();
  }, []);

  const loadPasswordInfo = async () => {
    try {
      setLoading(true);
      const settings = await ownerAPI.getSecuritySettings();
      setPasswordInfo({
        passwordLastChanged: settings.passwordLastChanged,
        passwordExpiresInDays: settings.passwordExpiresInDays,
      });
    } catch (err: any) {
      console.error('Error loading password info:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateAgo = (dateString?: string): string => {
    if (!dateString) return 'Never';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      Alert.alert(
        'Weak Password',
        'For better security, your password should include uppercase letters, lowercase letters, and numbers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue Anyway', onPress: () => performPasswordChange() }
        ]
      );
      return;
    }

    await performPasswordChange();
  };

  const performPasswordChange = async () => {
    try {
      setSaving(true);
      await ownerAPI.changePassword(currentPassword, newPassword);
      
      Alert.alert('Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setShowChangeModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            loadPasswordInfo(); // Reload to get updated password info
          }
        }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change password. Please check your current password and try again.');
      console.error('Error changing password:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutAllDevices = () => {
    Alert.alert(
      'Sign Out of All Devices',
      'Are you sure you want to sign out of all devices? You will need to sign in again on all devices.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await ownerAPI.signOutAllDevices();
              Alert.alert('Success', 'You have been signed out of all devices.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to sign out of all devices.');
              console.error('Error signing out all devices:', err);
            }
          }
        }
      ]
    );
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderSecurityTip = (icon: string, title: string, description: string) => (
    <View style={styles.securityTip}>
      <View style={styles.tipIcon}>
        <Ionicons name={icon as any} size={20} color="#4CAF50" />
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Password Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Password Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Password Protected</Text>
              <Text style={styles.statusDescription}>
                {loading ? 'Loading...' : `Your account is secured with a strong password. Last changed ${formatDateAgo(passwordInfo?.passwordLastChanged)}.`}
              </Text>
            </View>
          </View>
        </View>

        {/* Password Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password Management</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowChangeModal(true)}
          >
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="key-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="mail-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Reset Password via Email</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Session Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Management</Text>
          <View style={styles.sessionInfo}>
            <View style={styles.sessionIcon}>
              <Ionicons name="time-outline" size={20} color="#666" />
            </View>
            <View style={styles.sessionContent}>
              <Text style={styles.sessionTitle}>Active Sessions</Text>
              <Text style={styles.sessionDescription}>You're signed in on 3 devices</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSignOutAllDevices}
          >
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="log-out-outline" size={20} color="#FF6B35" />
              </View>
              <Text style={[styles.actionButtonText, styles.dangerText]}>Sign Out of All Devices</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password Security Tips</Text>
          {renderSecurityTip(
            'checkmark-circle',
            'Use Strong Passwords',
            'Include uppercase, lowercase, numbers, and special characters'
          )}
          {renderSecurityTip(
            'time-outline',
            'Change Regularly',
            'Update your password every 3-6 months for better security'
          )}
          {renderSecurityTip(
            'lock-closed',
            'Unique Passwords',
            'Use different passwords for different accounts and services'
          )}
          {renderSecurityTip(
            'eye-off-outline',
            'Keep Private',
            'Never share your password with anyone or write it down'
          )}
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowChangeModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry={!showPasswords.current}
                />
                <TouchableOpacity 
                  onPress={() => togglePasswordVisibility('current')}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPasswords.current ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!showPasswords.new}
                />
                <TouchableOpacity 
                  onPress={() => togglePasswordVisibility('new')}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPasswords.new ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!showPasswords.confirm}
                />
                <TouchableOpacity 
                  onPress={() => togglePasswordVisibility('confirm')}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPasswords.confirm ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordStrength}>
                <Text style={styles.strengthLabel}>Password Strength:</Text>
                <View style={styles.strengthBar}>
                  <View style={[
                    styles.strengthFill, 
                    { 
                      width: newPassword.length >= 8 ? '100%' : `${(newPassword.length / 8) * 100}%`,
                      backgroundColor: newPassword.length >= 8 ? '#4CAF50' : '#FF9800'
                    }
                  ]} />
                </View>
                <Text style={styles.strengthText}>
                  {newPassword.length >= 8 ? 'Strong' : 'Weak'}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowChangeModal(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleChangePassword}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Change Password</Text>
                )}
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
  
  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  
  // Security Tips
  securityTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  passwordStrength: {
    marginTop: 16,
  },
  strengthLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
  
  // Session Management
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sessionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  sessionDescription: {
    fontSize: 12,
    color: '#666',
  },
  dangerText: {
    color: '#FF6B35',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});
