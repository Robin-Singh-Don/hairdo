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
import { GeneralSettings as GeneralSettingsType } from '../../services/mock/AppMockData';

export default function GeneralSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GeneralSettingsType | null>(null);
  
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await ownerAPI.getGeneralSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading general settings:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await ownerAPI.updateBusinessInfo(settings.businessInfo);
      Alert.alert('Success', 'Business information updated successfully!');
      setShowBusinessModal(false);
      await loadSettings();
    } catch (error) {
      console.error('Error saving business info:', error);
      Alert.alert('Error', 'Failed to save business information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocationInfo = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await ownerAPI.updateLocationInfo(settings.locationInfo);
      Alert.alert('Success', 'Location and hours updated successfully!');
      setShowLocationModal(false);
      await loadSettings();
    } catch (error) {
      console.error('Error saving location info:', error);
      Alert.alert('Error', 'Failed to save location information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePolicies = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await ownerAPI.updatePoliciesInfo(settings.policiesInfo);
      Alert.alert('Success', 'Policies updated successfully!');
      setShowPoliciesModal(false);
      await loadSettings();
    } catch (error) {
      console.error('Error saving policies:', error);
      Alert.alert('Error', 'Failed to save policies. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderInfoCard = (title: string, icon: string, color: string, onPress: () => void) => (
    <TouchableOpacity style={styles.infoCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>General Settings</Text>
          <View style={styles.headerSpacer} />
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
          <Text style={styles.title}>General Settings</Text>
          <View style={styles.headerSpacer} />
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
        <Text style={styles.title}>General Settings</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Business Information</Text>
        <View style={styles.section}>
          {renderInfoCard('Business Details', 'business-outline', '#4CAF50', () => setShowBusinessModal(true))}
          {renderInfoCard('Location & Hours', 'location-outline', '#FF9800', () => setShowLocationModal(true))}
          {renderInfoCard('Policies & Defaults', 'document-text-outline', '#9C27B0', () => setShowPoliciesModal(true))}
        </View>

        <Text style={styles.sectionTitle}>Quick Overview</Text>
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Business Name:</Text>
            <Text style={styles.overviewValue}>{settings.businessInfo.name}</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Type:</Text>
            <Text style={styles.overviewValue}>{settings.businessInfo.type}</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Phone:</Text>
            <Text style={styles.overviewValue}>{settings.businessInfo.phone}</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Currency:</Text>
            <Text style={styles.overviewValue}>{settings.businessInfo.currency}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Business Details Modal */}
      <Modal
        visible={showBusinessModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBusinessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Business Details</Text>
              <TouchableOpacity onPress={() => setShowBusinessModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {settings && (
                <>
                  <Text style={styles.inputLabel}>Business Name</Text>
                  <TextInput
                    style={styles.input}
                    value={settings.businessInfo.name}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      businessInfo: { ...settings.businessInfo, name: text }
                    })}
                    placeholder="Enter business name"
                  />
                  
                  <Text style={styles.inputLabel}>Business Type</Text>
                  <TextInput
                    style={styles.input}
                    value={settings.businessInfo.type}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      businessInfo: { ...settings.businessInfo, type: text }
                    })}
                    placeholder="e.g., Hair Salon, Barber Shop"
                  />
                  
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={settings.businessInfo.phone}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      businessInfo: { ...settings.businessInfo, phone: text }
                    })}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                  
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={settings.businessInfo.email}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      businessInfo: { ...settings.businessInfo, email: text }
                    })}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                  />
                  
                  <Text style={styles.inputLabel}>Website</Text>
                  <TextInput
                    style={styles.input}
                    value={settings.businessInfo.website}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      businessInfo: { ...settings.businessInfo, website: text }
                    })}
                    placeholder="Enter website URL"
                  />
                  
                  <Text style={styles.inputLabel}>Tax/VAT/GST ID</Text>
                  <TextInput
                    style={styles.input}
                    value={settings.businessInfo.taxId}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      businessInfo: { ...settings.businessInfo, taxId: text }
                    })}
                    placeholder="Enter tax ID"
                  />
                </>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowBusinessModal(false);
                  loadSettings(); // Reload to discard changes
                }}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleSaveBusinessInfo}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location & Hours Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Location & Hours</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {settings && (
                <>
                  <Text style={styles.inputLabel}>Business Address</Text>
                  <TextInput
                    style={styles.input}
                    value={settings.locationInfo.address}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      locationInfo: { ...settings.locationInfo, address: text }
                    })}
                    placeholder="Enter full address"
                    multiline
                  />
                  
                  <Text style={styles.sectionTitle}>Working Hours</Text>
                  {Object.entries(settings.locationInfo.workingHours).map(([day, hours]) => (
                    <View key={day} style={styles.hoursRow}>
                      <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                      <TextInput
                        style={styles.hoursInput}
                        value={hours}
                        onChangeText={(text) => setSettings({
                          ...settings,
                          locationInfo: {
                            ...settings.locationInfo,
                            workingHours: { ...settings.locationInfo.workingHours, [day]: text }
                          }
                        })}
                        placeholder="e.g., 9:00 AM - 7:00 PM"
                      />
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowLocationModal(false);
                  loadSettings(); // Reload to discard changes
                }}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleSaveLocationInfo}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Policies Modal */}
      <Modal
        visible={showPoliciesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPoliciesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Policies & Defaults</Text>
              <TouchableOpacity onPress={() => setShowPoliciesModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {settings && (
                <>
                  <Text style={styles.inputLabel}>Cancellation Policy</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={settings.policiesInfo.cancellationPolicy}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      policiesInfo: { ...settings.policiesInfo, cancellationPolicy: text }
                    })}
                    placeholder="Describe your cancellation policy"
                    multiline
                  />
                  
                  <Text style={styles.inputLabel}>Refund Policy</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={settings.policiesInfo.refundPolicy}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      policiesInfo: { ...settings.policiesInfo, refundPolicy: text }
                    })}
                    placeholder="Describe your refund policy"
                    multiline
                  />
                  
                  <Text style={styles.inputLabel}>Service Defaults</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={settings.policiesInfo.serviceDefaults}
                    onChangeText={(text) => setSettings({
                      ...settings,
                      policiesInfo: { ...settings.policiesInfo, serviceDefaults: text }
                    })}
                    placeholder="Default service settings"
                    multiline
                  />
                </>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowPoliciesModal(false);
                  loadSettings(); // Reload to discard changes
                }}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleSavePolicies}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 20,
  },
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
  infoCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  overviewValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
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
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  hoursInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    marginLeft: 12,
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
  saveButtonDisabled: {
    opacity: 0.6,
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
});
