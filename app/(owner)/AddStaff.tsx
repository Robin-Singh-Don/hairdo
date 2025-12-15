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
  Switch,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { employeeAPI } from '../../services/api/employeeAPI';
import { EmployeeService } from '../../services/mock/AppMockData';

export default function AddStaff() {
  const router = useRouter();
  const [availableServices, setAvailableServices] = useState<EmployeeService[]>([]);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [showLinkSection, setShowLinkSection] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
  const [customServices, setCustomServices] = useState<string[]>([]);

  const [staffData, setStaffData] = useState({
    // Section A: Basic Details
    name: '',
    role: '',
    phone: '',
    email: '',
    avatar: null as string | null,
    isActive: true,
    // Section B: Role Permissions
    permissions: {
      manageAppointments: false,
      accessPaymentScreen: false,
      manageCustomers: false,
      viewOwnEarnings: false,
      manageInventory: false,
    },
    // Section C: Schedule
    schedule: {
      monday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
      thursday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
      friday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
      saturday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
      sunday: { start: '09:00', end: '18:00', isWorking: false, breakStart: '13:00', breakEnd: '14:00' },
    },
    // Section D: Services
    selectedServices: [] as string[],
    // Section E: Commission
    commissionPercent: '0',
  });

  // Load services for multi-select
  useEffect(() => {
    const loadServices = async () => {
      try {
        const services = await employeeAPI.getServices();
        setAvailableServices(services);
      } catch (error) {
        console.error('Error loading services:', error);
      }
    };
    loadServices();
  }, []);

  // Generate shareable link
  const generateShareableLink = () => {
    // In a real app, this would generate a unique token and store it in the backend
    const token = `staff-invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const link = `https://hairdo.app/staff-signup/${token}`;
    setShareableLink(link);
    setShowLinkSection(true);
    return link;
  };

  const copyLinkToClipboard = async () => {
    if (shareableLink) {
      await Clipboard.setStringAsync(shareableLink);
      Alert.alert('Success', 'Link copied to clipboard!');
    }
  };

  const shareLink = async () => {
    if (shareableLink) {
      try {
        await Share.share({
          message: `Join our team! Complete your staff profile: ${shareableLink}`,
          title: 'Staff Invitation',
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const toggleServiceSelection = (serviceId: string) => {
    setStaffData({
      ...staffData,
      selectedServices: staffData.selectedServices.includes(serviceId)
        ? staffData.selectedServices.filter(id => id !== serviceId)
        : [...staffData.selectedServices, serviceId]
    });
    setShowServicesDropdown(false);
  };

  const addCustomService = () => {
    if (customServiceName.trim() && !customServices.includes(customServiceName.trim())) {
      const newCustomService = customServiceName.trim();
      setCustomServices([...customServices, newCustomService]);
      setStaffData({
        ...staffData,
        selectedServices: [...staffData.selectedServices, `custom-${newCustomService}`]
      });
      setCustomServiceName('');
      setShowCustomServiceInput(false);
      setShowServicesDropdown(false);
    }
  };

  const removeService = (serviceId: string) => {
    if (serviceId.startsWith('custom-')) {
      const serviceName = serviceId.replace('custom-', '');
      setCustomServices(customServices.filter(s => s !== serviceName));
    }
    setStaffData({
      ...staffData,
      selectedServices: staffData.selectedServices.filter(id => id !== serviceId)
    });
  };

  const getServiceName = (serviceId: string): string => {
    if (serviceId.startsWith('custom-')) {
      return serviceId.replace('custom-', '');
    }
    const service = availableServices.find(s => s.id.toString() === serviceId);
    return service?.name || serviceId;
  };

  const handleSave = async () => {
    if (!staffData.name.trim()) {
      Alert.alert('Error', 'Please enter staff member name');
      return;
    }

    try {
      const newStaffMember = await ownerAPI.addStaffMember({
        name: staffData.name,
        role: staffData.role,
        email: staffData.email || '',
        phone: staffData.phone || '',
        avatar: staffData.avatar,
        hourlyRate: 0,
        workingHours: `${staffData.schedule.monday.start} - ${staffData.schedule.monday.end}`,
        appointmentsHandled: 0,
        revenueGenerated: 0,
        rating: 5.0,
        isActive: staffData.isActive
      });

      Alert.alert('Success', 'Staff member added successfully!', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error adding staff member:', error);
      Alert.alert('Error', 'Failed to add staff member');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Staff Member</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section A: Basic Details */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Basic Details</Text>
          
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={staffData.name}
            onChangeText={(text) => setStaffData({ ...staffData, name: text })}
            placeholder="Enter full name"
          />

          <Text style={styles.inputLabel}>Role</Text>
          <TextInput
            style={styles.input}
            value={staffData.role}
            onChangeText={(text) => setStaffData({ ...staffData, role: text })}
            placeholder="Enter custom role"
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={staffData.phone}
            onChangeText={(text) => setStaffData({ ...staffData, phone: text })}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={staffData.email}
            onChangeText={(text) => setStaffData({ ...staffData, email: text })}
            placeholder="Enter email address"
            keyboardType="email-address"
          />

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Active Status</Text>
            <Switch
              value={staffData.isActive}
              onValueChange={(value) => setStaffData({ ...staffData, isActive: value })}
              trackColor={{ false: '#E0E0E0', true: '#000' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Section B: Role Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Role Permissions</Text>
          <View style={styles.permissionsList}>
            <View style={styles.permissionRow}>
              <Text style={styles.permissionLabel}>Manage Appointments</Text>
              <Switch
                value={staffData.permissions.manageAppointments}
                onValueChange={(value) => setStaffData({
                  ...staffData,
                  permissions: { ...staffData.permissions, manageAppointments: value }
                })}
                trackColor={{ false: '#E0E0E0', true: '#000' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.permissionRow}>
              <Text style={styles.permissionLabel}>Access Payment Screen</Text>
              <Switch
                value={staffData.permissions.accessPaymentScreen}
                onValueChange={(value) => setStaffData({
                  ...staffData,
                  permissions: { ...staffData.permissions, accessPaymentScreen: value }
                })}
                trackColor={{ false: '#E0E0E0', true: '#000' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.permissionRow}>
              <Text style={styles.permissionLabel}>Manage Customers</Text>
              <Switch
                value={staffData.permissions.manageCustomers}
                onValueChange={(value) => setStaffData({
                  ...staffData,
                  permissions: { ...staffData.permissions, manageCustomers: value }
                })}
                trackColor={{ false: '#E0E0E0', true: '#000' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.permissionRow}>
              <Text style={styles.permissionLabel}>View Own Earnings</Text>
              <Switch
                value={staffData.permissions.viewOwnEarnings}
                onValueChange={(value) => setStaffData({
                  ...staffData,
                  permissions: { ...staffData.permissions, viewOwnEarnings: value }
                })}
                trackColor={{ false: '#E0E0E0', true: '#000' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.permissionRow}>
              <Text style={styles.permissionLabel}>Manage Inventory</Text>
              <Switch
                value={staffData.permissions.manageInventory}
                onValueChange={(value) => setStaffData({
                  ...staffData,
                  permissions: { ...staffData.permissions, manageInventory: value }
                })}
                trackColor={{ false: '#E0E0E0', true: '#000' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Section D: Services */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Services</Text>
          <Text style={styles.sectionSubtitle}>Select services this staff member can perform</Text>
          
          {/* Selected Services List */}
          {staffData.selectedServices.length > 0 && (
            <View style={styles.selectedServicesContainer}>
              {staffData.selectedServices.map((serviceId) => (
                <View key={serviceId} style={styles.selectedServiceChip}>
                  <Text style={styles.selectedServiceText}>{getServiceName(serviceId)}</Text>
                  <TouchableOpacity
                    onPress={() => removeService(serviceId)}
                    style={styles.removeServiceButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Dropdown Button */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowServicesDropdown(!showServicesDropdown)}
          >
            <Text style={styles.dropdownButtonText}>
              {showServicesDropdown ? 'Close' : 'Add Service'}
            </Text>
            <Ionicons
              name={showServicesDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333"
            />
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {showServicesDropdown && (
            <View style={styles.dropdownContainer}>
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {/* Existing Services */}
                {availableServices
                  .filter(service => !staffData.selectedServices.includes(service.id.toString()))
                  .map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={styles.dropdownItem}
                      onPress={() => toggleServiceSelection(service.id.toString())}
                    >
                      <Text style={styles.dropdownItemText}>{service.name}</Text>
                      <Ionicons name="add-circle-outline" size={20} color="#000" />
                    </TouchableOpacity>
                  ))}
                
                {/* Custom Service Option */}
                {!showCustomServiceInput ? (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => setShowCustomServiceInput(true)}
                  >
                    <Ionicons name="add" size={20} color="#000" />
                    <Text style={[styles.dropdownItemText, styles.customServiceText]}>
                      Add Custom Service
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.customServiceInputContainer}>
                    <TextInput
                      style={styles.customServiceInput}
                      value={customServiceName}
                      onChangeText={setCustomServiceName}
                      placeholder="Enter custom service name"
                      autoFocus
                    />
                    <View style={styles.customServiceActions}>
                      <TouchableOpacity
                        style={styles.customServiceCancelButton}
                        onPress={() => {
                          setShowCustomServiceInput(false);
                          setCustomServiceName('');
                        }}
                      >
                        <Text style={styles.customServiceCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.customServiceAddButton}
                        onPress={addCustomService}
                      >
                        <Text style={styles.customServiceAddText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Section E: Commission */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Commission (Optional)</Text>
          <TextInput
            style={styles.input}
            value={staffData.commissionPercent}
            onChangeText={(text) => setStaffData({ ...staffData, commissionPercent: text })}
            placeholder="Enter commission percentage"
            keyboardType="numeric"
          />
        </View>

        {/* Shareable Link Section */}
        <View style={styles.linkCard}>
          <View style={styles.linkHeader}>
            <Ionicons name="link-outline" size={24} color="#000" />
            <Text style={styles.linkTitle}>Share Invitation Link</Text>
          </View>
          <Text style={styles.linkDescription}>
            Generate a link to send to the employee. They can fill out their profile information themselves.
          </Text>
          
          {!showLinkSection ? (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateShareableLink}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.generateButtonText}>Generate Link</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.linkContainer}>
              <View style={styles.linkBox}>
                <Text style={styles.linkText} numberOfLines={1}>
                  {shareableLink}
                </Text>
              </View>
              <View style={styles.linkActions}>
                <TouchableOpacity
                  style={styles.linkActionButton}
                  onPress={copyLinkToClipboard}
                >
                  <Ionicons name="copy-outline" size={20} color="#000" />
                  <Text style={styles.linkActionText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkActionButton}
                  onPress={shareLink}
                >
                  <Ionicons name="share-outline" size={20} color="#000" />
                  <Text style={styles.linkActionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Add Staff Member</Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  linkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  linkDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 8,
  },
  linkBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  linkText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 12,
  },
  linkActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  linkActionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dividerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginVertical: 20,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
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
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  roleSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  roleText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  roleTextSelected: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  permissionsList: {
    marginTop: 8,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  permissionLabel: {
    fontSize: 16,
    color: '#333',
  },
  scheduleDay: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  scheduleDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleDayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scheduleDayContent: {
    marginTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    width: 100,
  },
  breakTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakInput: {
    width: 80,
  },
  breakSeparator: {
    fontSize: 16,
    color: '#666',
  },
  selectedServicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  selectedServiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedServiceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 6,
  },
  removeServiceButton: {
    marginLeft: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dropdownContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  customServiceText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  customServiceInputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#F9F9F9',
  },
  customServiceInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  customServiceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  customServiceCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  customServiceCancelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  customServiceAddButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  customServiceAddText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  saveButtonContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

