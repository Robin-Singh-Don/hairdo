import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerStaffMember, EmployeeTimeOffRequest } from '../../services/mock/AppMockData';

// Extended interface to include employee info for owner view
interface TimeOffRequestWithEmployee extends EmployeeTimeOffRequest {
  employeeId?: number;
  employeeName?: string;
}

export default function TimeOffRequest() {
  const router = useRouter();
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequestWithEmployee[]>([]);
  const [staffMembers, setStaffMembers] = useState<OwnerStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [requests, staff] = await Promise.all([
          ownerAPI.getTimeOffRequests(),
          ownerAPI.getStaffMembers(),
        ]);
        setStaffMembers(staff);
        
        // Enrich requests with employee info
        const enrichedRequests = requests.map((request) => {
          // Find employee by employeeId (which we added to the mock data)
          const employeeId = (request as any).employeeId;
          const employee = employeeId ? staff.find((s) => s.id === employeeId) : null;
          
          return {
            ...request,
            employeeName: employee?.name || 'Unknown Employee',
            employeeId: employeeId || employee?.id,
          } as TimeOffRequestWithEmployee;
        });
        
        setTimeOffRequests(enrichedRequests.filter(r => r.status === 'pending'));
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load time off requests');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return formatDate(startDate);
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Calculate days off
  const calculateDaysOff = (startDate: string, endDate: string, duration: string, halfDayPeriod?: string) => {
    if (startDate === endDate) {
      if (duration === 'half_day') {
        return `Half Day (${halfDayPeriod || 'AM'})`;
      }
      return '1 day';
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return `${diffDays} days`;
  };

  // Get type display name
  const getTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      vacation: 'Vacation',
      sick: 'Sick Leave',
      personal: 'Personal',
      emergency: 'Emergency',
      other: 'Other',
    };
    return typeMap[type] || type;
  };

  // Handle approve request
  const handleApproveRequest = async (requestId: string) => {
    try {
      await ownerAPI.approveTimeOffRequest(requestId);
      const requests = await ownerAPI.getTimeOffRequests();
      const enrichedRequests = requests.map((request) => {
        const employeeId = (request as any).employeeId;
        const employee = employeeId ? staffMembers.find((s) => s.id === employeeId) : null;
        return {
          ...request,
          employeeName: employee?.name || 'Unknown Employee',
          employeeId: employeeId || employee?.id,
        } as TimeOffRequestWithEmployee;
      });
      setTimeOffRequests(enrichedRequests.filter(r => r.status === 'pending'));
      Alert.alert('Success', 'Time off request approved');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve request');
    }
  };

  // Handle reject request - open modal
  const handleRejectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Confirm reject request
  const confirmRejectRequest = async () => {
    if (!selectedRequestId) return;

    try {
      await ownerAPI.rejectTimeOffRequest(selectedRequestId, rejectReason || undefined);
      const requests = await ownerAPI.getTimeOffRequests();
      const enrichedRequests = requests.map((request) => {
        const employeeId = (request as any).employeeId;
        const employee = employeeId ? staffMembers.find((s) => s.id === employeeId) : null;
        return {
          ...request,
          employeeName: employee?.name || 'Unknown Employee',
          employeeId: employeeId || employee?.id,
        } as TimeOffRequestWithEmployee;
      });
      setTimeOffRequests(enrichedRequests.filter(r => r.status === 'pending'));
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequestId(null);
      Alert.alert('Success', 'Time off request rejected');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  // Render reject modal
  const renderRejectModal = () => {
    return (
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedRequestId(null);
        }}
      >
        <View style={styles.rejectModalOverlay}>
          <View style={styles.rejectModalContent}>
            <View style={styles.rejectModalHeader}>
              <Text style={styles.rejectModalTitle}>Reject Time Off Request</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequestId(null);
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.rejectModalBody}>
              <Text style={styles.rejectModalLabel}>
                Enter reason for rejection (optional):
              </Text>
              <TextInput
                style={styles.rejectModalInput}
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.rejectModalActions}>
              <TouchableOpacity
                style={styles.rejectModalCancelButton}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequestId(null);
                }}
              >
                <Text style={styles.rejectModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectModalConfirmButton}
                onPress={confirmRejectRequest}
              >
                <Text style={styles.rejectModalConfirmText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading time off requests...</Text>
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
        <Text style={styles.title}>Time Off Requests</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>Pending Requests</Text>
          <Text style={styles.contentSubtitle}>
            {timeOffRequests.length} {timeOffRequests.length === 1 ? 'request' : 'requests'} awaiting review
          </Text>
        </View>

        {timeOffRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
            <Text style={styles.emptyStateText}>No pending requests</Text>
          </View>
        ) : (
          timeOffRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestName}>{request.employeeName}</Text>
                <View style={styles.requestBadge}>
                  <Text style={styles.requestBadgeText}>Pending</Text>
                </View>
              </View>
              <Text style={styles.requestDate}>{formatDateRange(request.startDate, request.endDate)}</Text>
              <View style={styles.requestDetails}>
                <View style={styles.requestDetailRow}>
                  <Ionicons name="calendar-outline" size={18} color="#666" />
                  <Text style={styles.requestDetailText}>
                    {calculateDaysOff(request.startDate, request.endDate, request.duration, request.halfDayPeriod)}
                  </Text>
                </View>
                <View style={styles.requestDetailRow}>
                  <Ionicons name="briefcase-outline" size={18} color="#666" />
                  <Text style={styles.requestDetailText}>
                    {getTypeDisplayName(request.type)}
                  </Text>
                </View>
                <View style={styles.requestDetailRow}>
                  <Ionicons name="document-text-outline" size={18} color="#666" />
                  <Text style={styles.requestDetailText}>{request.reason}</Text>
                </View>
                {request.notes && (
                  <View style={styles.requestDetailRow}>
                    <Ionicons name="chatbubble-outline" size={18} color="#666" />
                    <Text style={styles.requestDetailText}>{request.notes}</Text>
                  </View>
                )}
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApproveRequest(request.id)}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleRejectRequest(request.id)}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modals */}
      {renderRejectModal()}
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  contentHeader: {
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
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
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  requestBadge: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  requestBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B8860B',
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  requestDetails: {
    marginBottom: 16,
    gap: 10,
  },
  requestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestDetailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    gap: 6,
    flex: 1,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  rejectButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  // Reject Modal Styles
  rejectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  rejectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rejectModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  rejectModalBody: {
    padding: 20,
  },
  rejectModalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  rejectModalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rejectModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  rejectModalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  rejectModalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  rejectModalConfirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  rejectModalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

