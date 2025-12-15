import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { GeneralSettings as GeneralSettingsType } from '../../services/mock/AppMockData';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function BusinessInformationDetails() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GeneralSettingsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Edit modal state - for individual field editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editFieldLabel, setEditFieldLabel] = useState('');

  // Load settings from API
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ownerAPI.getGeneralSettings();
      setSettings(data);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load business information');
      console.error('Error loading business information:', err);
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

  const handleEditField = (field: string, label: string, currentValue: string) => {
    setEditingField(field);
    setEditFieldLabel(label);
    setEditValue(currentValue || '');
  };

  const handleSaveField = async () => {
    if (!settings || !editingField) return;
    
    try {
      setSaving(true);
      
      switch (editingField) {
        case 'businessName':
          await ownerAPI.updateBusinessInfo({
            ...settings.businessInfo,
            name: editValue,
          });
          break;
        case 'website':
          await ownerAPI.updateBusinessInfo({
            ...settings.businessInfo,
            website: editValue,
          });
          break;
        case 'phone':
          await ownerAPI.updateBusinessInfo({
            ...settings.businessInfo,
            phone: editValue,
          });
          break;
        case 'email':
          await ownerAPI.updateBusinessInfo({
            ...settings.businessInfo,
            email: editValue,
          });
          break;
        case 'address':
          await ownerAPI.updateLocationInfo({
            address: editValue,
          });
          break;
      }
      
      Alert.alert('Success', 'Information updated successfully!');
      setEditingField(null);
      await loadSettings();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save. Please try again.');
      console.error('Error saving business information:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
    setEditFieldLabel('');
  };

  const renderInfoItem = (icon: string, title: string, value: string, fieldKey?: string, onEdit?: () => void) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={20} color="#000" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value || 'Not set'}</Text>
      </View>
      {onEdit && (
        <TouchableOpacity 
          style={styles.inlineEditButton}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={18} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );

  const formatWorkingHours = (workingHours: any): string => {
    if (!workingHours) return 'Not set';
    return Object.entries(workingHours)
      .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1, 3)}: ${hours}`)
      .join(', ');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Business Information</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Business Information</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load business information'}</Text>
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
        <Text style={styles.title}>Business Information</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          {renderInfoItem(
            'business-outline', 
            'Business Name', 
            settings.businessInfo.name,
            'businessName',
            () => handleEditField('businessName', 'Business Name', settings.businessInfo.name)
          )}
          {renderInfoItem(
            'globe-outline', 
            'Website', 
            settings.businessInfo.website || 'Not set',
            'website',
            () => handleEditField('website', 'Website', settings.businessInfo.website || '')
          )}
          {renderInfoItem('briefcase-outline', 'Business Type', settings.businessInfo.type)}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {renderInfoItem(
            'call-outline', 
            'Phone', 
            settings.businessInfo.phone || 'Not set',
            'phone',
            () => handleEditField('phone', 'Phone', settings.businessInfo.phone || '')
          )}
          {renderInfoItem(
            'mail-outline', 
            'Email', 
            settings.businessInfo.email || 'Not set',
            'email',
            () => handleEditField('email', 'Email', settings.businessInfo.email || '')
          )}
          {renderInfoItem(
            'location-outline', 
            'Address', 
            settings.locationInfo.address || 'Not set',
            'address',
            () => handleEditField('address', 'Address', settings.locationInfo.address || '')
          )}
        </View>

        {/* Business Hours */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Business Hours</Text>
            <TouchableOpacity
              style={styles.editHoursButton}
              onPress={() => router.push('/(owner)/BusinessHours')}
            >
              <Text style={styles.editHoursButtonText}>Edit Hours</Text>
              <Ionicons name="chevron-forward" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          {Object.entries(settings.locationInfo.workingHours).map(([day, hours]) => (
            <View key={day} style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="time-outline" size={20} color="#000" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={styles.infoValue}>{hours || 'Closed'}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modern Edit Modal for Individual Fields */}
      <Modal
        visible={editingField !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCancelEdit}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {editFieldLabel}</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>{editFieldLabel}</Text>
              <TextInput 
                style={[styles.input, editingField === 'address' && styles.textArea]} 
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Enter ${editFieldLabel.toLowerCase()}`}
                keyboardType={
                  editingField === 'email' ? 'email-address' :
                  editingField === 'phone' ? 'phone-pad' :
                  'default'
                }
                multiline={editingField === 'address'}
                numberOfLines={editingField === 'address' ? 3 : 1}
                textAlignVertical={editingField === 'address' ? 'top' : 'center'}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancelEdit}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleSaveField}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
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
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editHoursButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editHoursButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  
  // Info Items
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  inlineEditButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
});
