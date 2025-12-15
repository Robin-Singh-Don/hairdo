import React, { useState, useEffect, useCallback } from 'react';
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
  Image,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ownerAPI } from '../../services/api/ownerAPI';
import { employeeAPI } from '../../services/api/employeeAPI';
import { OwnerStaffMember } from '../../services/mock/AppMockData';
import { EmployeeService } from '../../services/mock/AppMockData';
import * as ImagePicker from 'expo-image-picker';

export default function StaffManagement() {
  const router = useRouter();
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<OwnerStaffMember | null>(null);
  const [availableServices, setAvailableServices] = useState<EmployeeService[]>([]);
  
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Stylist',
    workingHours: '9:00 AM - 6:00 PM'
  });

  // Comprehensive edit staff state
  const [editStaff, setEditStaff] = useState({
    // Section A: Basic Details
    name: '',
    role: 'Stylist',
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

  const [staffMembers, setStaffMembers] = useState<OwnerStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const roles = ['Admin', 'Manager', 'Stylist', 'Trainee'];

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

  // Filter staff based on search query
  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (staff.email && staff.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (staff.phone && staff.phone.includes(searchQuery))
  );

  // Helper function to get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase();
  };

  // Load staff data from API - refresh when screen comes into focus
  const loadStaffData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ownerAPI.getStaffMembers();
      setStaffMembers(data);
    } catch (error) {
      console.error('Error loading staff data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaffData();
  }, []);

  // Refresh when screen comes into focus (e.g., after adding new staff)
  useFocusEffect(
    useCallback(() => {
      loadStaffData();
    }, [loadStaffData])
  );

  const handleAddStaff = async () => {
    if (!newStaff.name.trim()) {
      Alert.alert('Error', 'Please enter staff member name');
      return;
    }

    try {
      const newStaffMember = await ownerAPI.addStaffMember({
        name: newStaff.name,
        role: newStaff.role,
        email: newStaff.email || '',
        phone: newStaff.phone || '',
        avatar: null,
        hourlyRate: 0,
        workingHours: newStaff.workingHours,
        appointmentsHandled: 0,
        revenueGenerated: 0,
        rating: 5.0,
        isActive: true
      });

      setStaffMembers([...staffMembers, newStaffMember]);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        role: 'Stylist',
        workingHours: '9:00 AM - 6:00 PM'
      });
      setShowAddStaffModal(false);
      Alert.alert('Success', 'Staff member added successfully!');
    } catch (error) {
      console.error('Error adding staff member:', error);
      Alert.alert('Error', 'Failed to add staff member');
    }
  };

  const handleEditStaff = (staff: OwnerStaffMember) => {
    setSelectedStaff(staff);
    setEditStaff({
      name: staff.name,
      role: staff.role,
      phone: staff.phone || '',
      email: staff.email || '',
      avatar: staff.avatar,
      isActive: staff.isActive,
      permissions: {
        manageAppointments: false,
        accessPaymentScreen: false,
        manageCustomers: false,
        viewOwnEarnings: false,
        manageInventory: false,
      },
      schedule: {
        monday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
        tuesday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
        wednesday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
        thursday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
        friday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
        saturday: { start: '09:00', end: '18:00', isWorking: true, breakStart: '13:00', breakEnd: '14:00' },
        sunday: { start: '09:00', end: '18:00', isWorking: false, breakStart: '13:00', breakEnd: '14:00' },
      },
      selectedServices: [],
      commissionPercent: '0',
    });
    setShowMenu(null);
    setShowEditStaffModal(true);
  };

  const handleSaveEditStaff = async () => {
    if (!selectedStaff || !editStaff.name.trim()) {
      Alert.alert('Error', 'Please enter staff member name');
      return;
    }

    try {
      const updatedStaff = await ownerAPI.updateStaffMember(selectedStaff.id, {
        name: editStaff.name,
        email: editStaff.email,
        phone: editStaff.phone,
        role: editStaff.role,
        avatar: editStaff.avatar,
        isActive: editStaff.isActive,
        // Note: Additional fields like permissions, schedule, services, commission
        // would need to be stored in a separate data structure or extended OwnerStaffMember interface
      });

      setStaffMembers(staffMembers.map(s => s.id === selectedStaff.id ? updatedStaff : s));
      setShowEditStaffModal(false);
      setSelectedStaff(null);
      Alert.alert('Success', 'Staff member updated successfully!');
    } catch (error) {
      console.error('Error updating staff member:', error);
      Alert.alert('Error', 'Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    Alert.alert(
      'Delete Staff Member',
      'Are you sure you want to delete this staff member? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ownerAPI.deleteStaffMember(staffId);
            setStaffMembers(staffMembers.filter(staff => staff.id !== staffId));
            Alert.alert('Success', 'Staff member deleted successfully!');
            } catch (error) {
              console.error('Error deleting staff member:', error);
              Alert.alert('Error', 'Failed to delete staff member');
            }
          }
        }
      ]
    );
    setShowMenu(null);
  };

  const handleToggleActive = async (staff: OwnerStaffMember) => {
    try {
      const updatedStaff = await ownerAPI.updateStaffMember(staff.id, {
        isActive: !staff.isActive
      });
      setStaffMembers(staffMembers.map(s => s.id === staff.id ? updatedStaff : s));
    } catch (error) {
      console.error('Error updating staff status:', error);
      Alert.alert('Error', 'Failed to update staff status');
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEditStaff({ ...editStaff, avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const toggleServiceSelection = (serviceId: string) => {
    setEditStaff({
      ...editStaff,
      selectedServices: editStaff.selectedServices.includes(serviceId)
        ? editStaff.selectedServices.filter(id => id !== serviceId)
        : [...editStaff.selectedServices, serviceId]
    });
  };

  const toggleDayOff = (day: keyof typeof editStaff.schedule) => {
    setEditStaff({
      ...editStaff,
      schedule: {
        ...editStaff.schedule,
        [day]: {
          ...editStaff.schedule[day],
          isWorking: !editStaff.schedule[day].isWorking
        }
      }
    });
  };

  const renderStaffCard = (staff: OwnerStaffMember) => (
    <View key={staff.id} style={styles.staffCard}>
      <View style={styles.staffCardTop}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {staff.avatar ? (
            <Image source={{ uri: staff.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarInitials}>{getInitials(staff.name)}</Text>
            </View>
          )}
        </View>

        {/* Staff Info */}
        <View style={styles.staffInfo}>
          <Text style={styles.staffName}>{staff.name}</Text>
          <Text style={styles.staffRole}>{staff.role}</Text>
      </View>
      
        {/* Status Badge and Menu */}
        <View style={styles.rightSection}>
          <View style={[styles.statusBadge, staff.isActive ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.statusBadgeText, staff.isActive ? styles.activeBadgeText : styles.inactiveBadgeText]}>
              {staff.isActive ? 'Active' : 'Inactive'}
            </Text>
        </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(staff.id)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Toggle Section */}
      <View style={styles.toggleSection}>
        <Switch
          value={staff.isActive}
          onValueChange={() => handleToggleActive(staff)}
          trackColor={{ false: '#E0E0E0', true: '#000' }}
          thumbColor={staff.isActive ? '#fff' : '#f4f3f4'}
        />
        <Text style={styles.toggleLabel}>
          {staff.isActive ? 'Deactivate staff member' : 'Activate staff member'}
        </Text>
      </View>

      {/* Menu Modal */}
      {showMenu === staff.id && (
    <Modal
          visible={true}
      transparent={true}
      animationType="fade"
          onRequestClose={() => setShowMenu(null)}
    >
      <TouchableOpacity 
            style={styles.menuOverlay}
        activeOpacity={1}
            onPress={() => setShowMenu(null)}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
                  handleEditStaff(staff);
                  setShowMenu(null);
                }}
              >
                <Ionicons name="create-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleDeleteStaff(staff.id)}
          >
                <Ionicons name="trash-outline" size={20} color="#FF6B35" />
                <Text style={[styles.menuItemText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
      )}
    </View>
  );

  const renderAddStaffModal = () => (
    <Modal
      visible={showAddStaffModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddStaffModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Staff Member</Text>
            <TouchableOpacity onPress={() => setShowAddStaffModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={newStaff.name}
              onChangeText={(text) => setNewStaff({...newStaff, name: text})}
              placeholder="Enter full name"
            />
            
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={newStaff.email}
              onChangeText={(text) => setNewStaff({...newStaff, email: text})}
              placeholder="Enter email address (optional)"
              keyboardType="email-address"
            />
            
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={newStaff.phone}
              onChangeText={(text) => setNewStaff({...newStaff, phone: text})}
              placeholder="Enter phone number (optional)"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleSelector}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    newStaff.role === role && styles.roleSelected
                  ]}
                  onPress={() => setNewStaff({...newStaff, role})}
                >
                  <Text style={[
                    styles.roleText,
                    newStaff.role === role && styles.roleTextSelected
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowAddStaffModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddStaff}>
              <Text style={styles.saveButtonText}>Add Staff</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEditStaffModal = () => {
    if (!selectedStaff) return null;

    const performanceData = {
      completedAppointments: selectedStaff.appointmentsHandled || 0,
      averageRating: selectedStaff.rating || 0,
    };

    const dayLabels: { [key: string]: string } = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    };

    return (
      <Modal
        visible={showEditStaffModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditStaffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Staff Member</Text>
              <TouchableOpacity onPress={() => setShowEditStaffModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Section A: Basic Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Details</Text>
                
                <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
                  value={editStaff.name}
                  onChangeText={(text) => setEditStaff({...editStaff, name: text})}
                  placeholder="Enter full name"
                />
                
                <Text style={styles.inputLabel}>Role</Text>
                <View style={styles.roleSelector}>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        editStaff.role === role && styles.roleSelected
                      ]}
                      onPress={() => setEditStaff({...editStaff, role})}
                    >
                      <Text style={[
                        styles.roleText,
                        editStaff.role === role && styles.roleTextSelected
                      ]}>
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
            
                <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
                  value={editStaff.phone}
                  onChangeText={(text) => setEditStaff({...editStaff, phone: text})}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editStaff.email}
                  onChangeText={(text) => setEditStaff({...editStaff, email: text})}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />
                
                <View style={styles.toggleRow}>
                  <Text style={styles.inputLabel}>Active / Inactive</Text>
                  <Switch
                    value={editStaff.isActive}
                    onValueChange={(value) => setEditStaff({...editStaff, isActive: value})}
                    trackColor={{ false: '#E0E0E0', true: '#000' }}
                    thumbColor={editStaff.isActive ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>

              {/* Section B: Role Permissions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Role Permissions</Text>
                
                <View style={styles.permissionsList}>
                  <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>Manage appointments</Text>
                    <Switch
                      value={editStaff.permissions.manageAppointments}
                      onValueChange={(value) => setEditStaff({
                        ...editStaff,
                        permissions: { ...editStaff.permissions, manageAppointments: value }
                      })}
                    />
                  </View>
                  <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>Access payment screen</Text>
                    <Switch
                      value={editStaff.permissions.accessPaymentScreen}
                      onValueChange={(value) => setEditStaff({
                        ...editStaff,
                        permissions: { ...editStaff.permissions, accessPaymentScreen: value }
                      })}
                    />
                  </View>
                  <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>Manage customers</Text>
                    <Switch
                      value={editStaff.permissions.manageCustomers}
                      onValueChange={(value) => setEditStaff({
                        ...editStaff,
                        permissions: { ...editStaff.permissions, manageCustomers: value }
                      })}
                    />
                  </View>
                  <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>View own earnings</Text>
                    <Switch
                      value={editStaff.permissions.viewOwnEarnings}
                      onValueChange={(value) => setEditStaff({
                        ...editStaff,
                        permissions: { ...editStaff.permissions, viewOwnEarnings: value }
                      })}
                    />
                  </View>
                  <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>Manage inventory</Text>
                    <Switch
                      value={editStaff.permissions.manageInventory}
                      onValueChange={(value) => setEditStaff({
                        ...editStaff,
                        permissions: { ...editStaff.permissions, manageInventory: value }
                      })}
                    />
                  </View>
                </View>
              </View>

              {/* Section C: Schedule */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Schedule</Text>
                
                {Object.keys(editStaff.schedule).map((day) => {
                  const dayKey = day as keyof typeof editStaff.schedule;
                  const daySchedule = editStaff.schedule[dayKey];
                  
                  return (
                    <View key={day} style={styles.scheduleDay}>
                      <View style={styles.scheduleDayHeader}>
                        <Text style={styles.scheduleDayLabel}>{dayLabels[day]}</Text>
                        <Switch
                          value={daySchedule.isWorking}
                          onValueChange={() => toggleDayOff(dayKey)}
                          trackColor={{ false: '#E0E0E0', true: '#000' }}
                          thumbColor={daySchedule.isWorking ? '#fff' : '#f4f3f4'}
                        />
                      </View>
                      
                      {daySchedule.isWorking && (
                        <View style={styles.scheduleDayContent}>
                          <View style={styles.timeRow}>
                            <Text style={styles.timeLabel}>Start Time</Text>
                            <TextInput
                              style={styles.timeInput}
                              value={daySchedule.start}
                              onChangeText={(text) => setEditStaff({
                                ...editStaff,
                                schedule: {
                                  ...editStaff.schedule,
                                  [dayKey]: { ...daySchedule, start: text }
                                }
                              })}
                              placeholder="09:00"
                            />
                          </View>
                          <View style={styles.timeRow}>
                            <Text style={styles.timeLabel}>End Time</Text>
                            <TextInput
                              style={styles.timeInput}
                              value={daySchedule.end}
                              onChangeText={(text) => setEditStaff({
                                ...editStaff,
                                schedule: {
                                  ...editStaff.schedule,
                                  [dayKey]: { ...daySchedule, end: text }
                                }
                              })}
                              placeholder="18:00"
                            />
                          </View>
                          <View style={styles.timeRow}>
                            <Text style={styles.timeLabel}>Break Time</Text>
                            <View style={styles.breakTimeRow}>
                              <TextInput
                                style={[styles.timeInput, styles.breakInput]}
                                value={daySchedule.breakStart}
                                onChangeText={(text) => setEditStaff({
                                  ...editStaff,
                                  schedule: {
                                    ...editStaff.schedule,
                                    [dayKey]: { ...daySchedule, breakStart: text }
                                  }
                                })}
                                placeholder="13:00"
                              />
                              <Text style={styles.breakSeparator}>-</Text>
                              <TextInput
                                style={[styles.timeInput, styles.breakInput]}
                                value={daySchedule.breakEnd}
                                onChangeText={(text) => setEditStaff({
                                  ...editStaff,
                                  schedule: {
                                    ...editStaff.schedule,
                                    [dayKey]: { ...daySchedule, breakEnd: text }
                                  }
                                })}
                                placeholder="14:00"
                              />
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Section D: Services */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services</Text>
                <Text style={styles.sectionSubtitle}>Select services this staff can perform</Text>
                
                <View style={styles.servicesList}>
                  {availableServices.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceChip,
                        editStaff.selectedServices.includes(service.id) && styles.serviceChipSelected
                      ]}
                      onPress={() => toggleServiceSelection(service.id)}
                    >
                      <Text style={[
                        styles.serviceChipText,
                        editStaff.selectedServices.includes(service.id) && styles.serviceChipTextSelected
                      ]}>
                        {service.name}
                      </Text>
                      {editStaff.selectedServices.includes(service.id) && (
                        <Ionicons name="checkmark" size={16} color="#fff" style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Section E: Commission */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Commission (Optional)</Text>
                <Text style={styles.inputLabel}>Commission %</Text>
                <TextInput
                  style={styles.input}
                  value={editStaff.commissionPercent}
                  onChangeText={(text) => setEditStaff({...editStaff, commissionPercent: text.replace(/[^0-9.]/g, '')})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              {/* Section F: Performance Summary */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Summary</Text>
                <Text style={styles.sectionSubtitle}>Auto-calculated metrics</Text>
                
                <View style={styles.performanceCard}>
                  <View style={styles.performanceItem}>
                    <Text style={styles.performanceLabel}>Completed Appointments</Text>
                    <Text style={styles.performanceValue}>{performanceData.completedAppointments}</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Text style={styles.performanceLabel}>Average Rating</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.performanceValue}>{performanceData.averageRating.toFixed(1)}</Text>
                      <Ionicons name="star" size={20} color="#FFD700" />
                    </View>
                  </View>
                </View>
              </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
                onPress={() => setShowEditStaffModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEditStaff}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading staff...</Text>
      </SafeAreaView>
    );
  }

  // Render hamburger menu modal
  const renderHamburgerMenu = () => {
    const menuOptions = [
      { 
        label: 'Add Staff', 
        icon: 'person-add-outline',
        onPress: () => {
          setShowHamburgerMenu(false);
          router.push('/(owner)/AddStaff');
        }
      },
      { 
        label: 'Staff Schedule', 
        icon: 'calendar-outline',
        onPress: () => {
          setShowHamburgerMenu(false);
          router.push('/(owner)/StaffSchedule');
        }
      },
      { 
        label: 'Time-off Request', 
        icon: 'time-outline',
        onPress: () => {
          setShowHamburgerMenu(false);
          router.push('/(owner)/TimeOffRequest');
        }
      },
      { 
        label: 'Daily Schedule', 
        icon: 'today-outline',
        onPress: () => {
          setShowHamburgerMenu(false);
          router.push('/(owner)/DailySchedule');
        }
      },
    ];

    return (
      <Modal
        visible={showHamburgerMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHamburgerMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowHamburgerMenu(false)}
        >
          <View style={styles.menuCard} onStartShouldSetResponder={() => true}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuOption,
                  index === menuOptions.length - 1 && styles.menuOptionLast
                ]}
                onPress={option.onPress}
              >
                <Ionicons name={option.icon as any} size={20} color="#333" />
                <Text style={styles.menuOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const activeCount = staffMembers.filter(s => s.isActive).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Staff Management</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Team Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Staff</Text>
            <Text style={styles.summaryValue}>{staffMembers.length}</Text>
            </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active</Text>
            <Text style={styles.summaryValue}>{activeCount}</Text>
            </View>
            </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Staff List */}
        <View style={styles.staffList}>
          {filteredStaff.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No staff found' : 'No staff members yet'}
              </Text>
              {!searchQuery && (
                <Text style={styles.emptyStateSubtext}>Use the menu to add your first team member</Text>
              )}
        </View>
          ) : (
            filteredStaff.map(renderStaffCard)
          )}
        </View>
      </ScrollView>

      {renderAddStaffModal()}
      {renderEditStaffModal()}
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  staffList: {
    marginBottom: 20,
  },
  staffCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  staffCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  defaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  staffRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  inactiveBadge: {
    backgroundColor: '#F5F5F5',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeBadgeText: {
    color: '#4CAF50',
  },
  inactiveBadgeText: {
    color: '#999',
  },
  menuButton: {
    padding: 8,
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteText: {
    color: '#FF6B35',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
  modalContentLarge: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  section: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  uploadButton: {
    marginTop: 8,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  uploadPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  uploadText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
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
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  serviceChipSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  serviceChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  serviceChipTextSelected: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 6,
  },
  performanceCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceLabel: {
    fontSize: 16,
    color: '#666',
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuCard: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuOptionLast: {
    borderBottomWidth: 0,
  },
  menuOptionText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
});
