import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import { EmployeeService } from '../../services/mock/AppMockData';
import { Modal, TextInput, Switch } from 'react-native';
import { setServiceMeta, deleteServiceMeta } from '../../services/preferences/serviceStore';
import { uploadServiceMedia, detectMediaType } from '../../services/media';

export default function MyServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<EmployeeService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [svcName, setSvcName] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcDuration, setSvcDuration] = useState('');
  const [overrideMabd, setOverrideMabd] = useState(false);
  const [overrideDays, setOverrideDays] = useState('30');
  const [mediaUri, setMediaUri] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await employeeAPI.getServices();
        setServices(data);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleServiceStatus = async (serviceId: string) => {
    setServices(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: !service.isActive }
          : service
      )
    );
    try {
      const svc = services.find(s => s.id === serviceId) as any;
      const next = !svc?.isActive;
      await employeeAPI.updateService(serviceId, { isActive: next } as any);
    } catch {}
  };

  const deleteService = (serviceId: string) => {
    const svc = services.find(s => s.id === serviceId);
    setPendingDeleteId(serviceId);
    setPendingDeleteName(svc?.name || 'this service');
    setShowConfirmDelete(true);
  };

  const renderServiceCard = (service: any) => (
    <View key={service.id} style={styles.serviceCard}>
      <Image source={{ uri: service.image || service.mediaUri || 'https://via.placeholder.com/120x90.png?text=Service' }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <View style={styles.serviceActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => toggleServiceStatus(service.id)}
            >
              <Ionicons 
                name={service.isActive ? "pause-circle" : "play-circle"} 
                size={20} 
                color={service.isActive ? "#FF9800" : "#4CAF50"} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => deleteService(service.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        <View style={styles.serviceDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{service.duration} min</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>${service.price}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{service.category}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: service.isActive ? '#E8F5E8' : '#FFF3E0' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: service.isActive ? '#4CAF50' : '#FF9800' }
          ]}>
            {service.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading services...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Services</Text>
        <View style={styles.addButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Services</Text>
          <Text style={styles.sectionDescription}>
            Manage your service offerings and availability
          </Text>
        </View>

        {services.map(renderServiceCard)}

        <TouchableOpacity style={styles.addServiceCard} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle-outline" size={32} color="#4CAF50" />
          <Text style={styles.addServiceText}>Add New Service</Text>
          <Text style={styles.addServiceSubtext}>Tap to create a new service offering</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Manage your services here. You can activate/deactivate services, edit details, and add new offerings.
          </Text>
        </View>
      </ScrollView>

      {/* Add Service Modal */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Service</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>Service name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={svcName}
                onChangeText={(t) => { setErrors(prev => ({ ...prev, name: '' })); setSvcName(t); }}
                placeholder="e.g., Men's Haircut"
              />
              {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  value={svcPrice}
                  onChangeText={(t) => { setErrors(prev => ({ ...prev, price: '' })); setSvcPrice(t.replace(/[^0-9.]/g, '')); }}
                  keyboardType="decimal-pad"
                  placeholder="e.g., 35"
                />
                {!!errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Duration (min)</Text>
                <TextInput
                  style={[styles.input, errors.duration && styles.inputError]}
                  value={svcDuration}
                  onChangeText={(t) => { setErrors(prev => ({ ...prev, duration: '' })); setSvcDuration(t.replace(/[^0-9]/g, '')); }}
                  keyboardType="number-pad"
                  placeholder="e.g., 45"
                  maxLength={3}
                />
                {!!errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
              </View>
            </View>

            <View style={[styles.row, { alignItems: 'center', marginTop: 8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Advance booking override</Text>
                <Text style={styles.subtle}>If off, inherits global limit</Text>
              </View>
              <Switch value={overrideMabd} onValueChange={setOverrideMabd} />
            </View>

            {overrideMabd && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.inputLabel}>Limit (days, 1–180)</Text>
                <TextInput
                  style={[styles.input, errors.override && styles.inputError]}
                  value={overrideDays}
                  onChangeText={(t) => { setErrors(prev => ({ ...prev, override: '' })); setOverrideDays(t.replace(/[^0-9]/g, '')); }}
                  keyboardType="number-pad"
                  placeholder="30"
                  maxLength={3}
                />
                {!!errors.override && <Text style={styles.errorText}>{errors.override}</Text>}
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>Media (photo/video URL)</Text>
              <TextInput
                style={styles.input}
                value={mediaUri}
                onChangeText={setMediaUri}
                placeholder="https://example.com/image.jpg or .mp4"
              />
              <View style={[styles.row, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[styles.pillBtn, mediaType === 'photo' && styles.pillBtnActive]}
                  onPress={() => setMediaType('photo')}
                >
                  <Text style={[styles.pillBtnText, mediaType === 'photo' && styles.pillBtnTextActive]}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pillBtn, mediaType === 'video' && styles.pillBtnActive]}
                  onPress={() => setMediaType('video')}
                >
                  <Text style={[styles.pillBtnText, mediaType === 'video' && styles.pillBtnTextActive]}>Video</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 16 }]}
              onPress={async () => {
                const nextErrors: { [k: string]: string } = {};
                const price = parseFloat(svcPrice || '0');
                const duration = parseInt(svcDuration || '0', 10);
                if (!svcName.trim()) nextErrors.name = 'Enter a service name.';
                if (!Number.isFinite(price) || price < 0) nextErrors.price = 'Enter a valid price (>= 0).';
                if (!Number.isFinite(duration) || duration < 5 || duration > 480) nextErrors.duration = 'Enter 5–480 minutes.';
                if (overrideMabd) {
                  const lim = parseInt(overrideDays || '0', 10);
                  if (!Number.isInteger(lim) || lim < 1 || lim > 180) nextErrors.override = 'Enter 1–180 days.';
                }
                setErrors(nextErrors);
                if (Object.keys(nextErrors).length > 0) return;

                try {
                  const created = await employeeAPI.addService({
                    name: svcName.trim(),
                    price: `$${price}`,
                    duration: `${duration} min`,
                  });

                  let finalMediaUri = mediaUri || '';
                  let finalMediaType = mediaType;
                  if (finalMediaUri) {
                    const uploaded = await uploadServiceMedia(finalMediaUri);
                    finalMediaUri = uploaded.url;
                    finalMediaType = uploaded.type;
                  } else {
                    finalMediaType = detectMediaType(finalMediaUri || '');
                  }

                  await setServiceMeta(created.id, {
                    mediaUri: finalMediaUri || undefined,
                    mediaType: finalMediaType,
                    advanceBookingOverrideEnabled: overrideMabd,
                    advanceBookingDaysOverride: overrideMabd ? parseInt(overrideDays, 10) : null,
                  });

                  setServices(prev => [
                    ...prev,
                    { ...created, image: mediaType === 'photo' ? mediaUri : undefined } as any,
                  ]);

                  // reset
                  setSvcName('');
                  setSvcPrice('');
                  setSvcDuration('');
                  setOverrideMabd(false);
                  setOverrideDays('30');
                  setMediaUri('');
                  setMediaType('photo');
                  setErrors({});
                  setShowAddModal(false);
                } catch (e) {
                  Alert.alert('Error', 'Failed to add service. Please try again.');
                }
              }}
            >
              <Text style={styles.primaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal visible={showConfirmDelete} transparent animationType="fade" onRequestClose={() => setShowConfirmDelete(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Service</Text>
              <TouchableOpacity onPress={() => setShowConfirmDelete(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#374151', marginTop: 8 }}>
              Are you sure you want to delete "{pendingDeleteName}"? This action cannot be undone.
            </Text>
            <View style={[styles.row, { justifyContent: 'flex-end', marginTop: 16 }]}>
              <TouchableOpacity
                onPress={() => setShowConfirmDelete(false)}
                style={[styles.pillBtn, { marginRight: 8 }]}
              >
                <Text style={styles.pillBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!pendingDeleteId) return;
                  try {
                    await employeeAPI.deleteService(pendingDeleteId);
                    await deleteServiceMeta(pendingDeleteId);
                    setServices(prev => prev.filter(s => s.id !== pendingDeleteId));
                  } catch {
                    Alert.alert('Error', 'Failed to delete service. Please try again.');
                  } finally {
                    setShowConfirmDelete(false);
                    setPendingDeleteId(null);
                    setPendingDeleteName('');
                  }
                }}
                style={[styles.pillBtn, styles.pillBtnActive]}
              >
                <Text style={[styles.pillBtnText, styles.pillBtnTextActive]}>Delete</Text>
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
  addButton: {
    padding: 4,
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
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  serviceInfo: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  serviceActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addServiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addServiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 8,
    marginBottom: 4,
  },
  addServiceSubtext: {
    fontSize: 14,
    color: '#666',
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
    maxWidth: 460,
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
  inputLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  errorText: {
    marginTop: 6,
    color: '#D32F2F',
  },
  row: {
    flexDirection: 'row',
  },
  pillBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  pillBtnActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  pillBtnText: {
    color: '#111827',
    fontWeight: '600',
  },
  pillBtnTextActive: {
    color: '#fff',
  },
  primaryBtn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

