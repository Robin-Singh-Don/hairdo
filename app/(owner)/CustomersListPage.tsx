import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerCustomer } from '../../services/mock/AppMockData';
import { useAppointments } from '../../contexts/AppointmentContext';

interface CustomerWithAppointment extends OwnerCustomer {
  appointment?: {
    id: string;
    service: string;
    staff: string;
    status: string;
    progress: number;
    estimatedTime: string;
    startTime: string;
    endTime?: string;
    appointmentType: string;
    date: string;
    duration: number;
  };
  profileImage?: string; // Add profile image support
}

export default function CustomersListPage() {
  const router = useRouter();
  const { appointments: allAppointments, getAppointmentsByDate } = useAppointments();
  
  const [customers, setCustomers] = useState<OwnerCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'all'>('today');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load customer data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const customersData = await ownerAPI.getCustomers();
      setCustomers(customersData);
    } catch (error: any) {
      console.error('Error loading customer data:', error);
      setError(error?.message || 'Failed to load customers data. Please try again.');
      Alert.alert('Error', error?.message || 'Failed to load customers data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Get date range helpers
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().split('T')[0];
  };

  const getWeekEnd = () => {
    const weekStart = new Date(getWeekStart());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd.toISOString().split('T')[0];
  };

  // Get appointments by tab
  const getAppointmentsByTab = useCallback((tab: 'today' | 'week' | 'all') => {
    const today = getTodayDate();
    
    switch (tab) {
      case 'today':
        return allAppointments.filter(apt => apt.date === today);
      
      case 'week':
        const weekStart = getWeekStart();
        const weekEnd = getWeekEnd();
        return allAppointments.filter(apt => 
          apt.date >= weekStart && apt.date <= weekEnd
        );
      
      case 'all':
        return allAppointments;
      
      default:
        return [];
    }
  }, [allAppointments]);

  // Map customers to their appointments - Show ALL customers, not just those with appointments
  const customersWithAppointments = useMemo((): CustomerWithAppointment[] => {
    const tabAppointments = getAppointmentsByTab(activeTab);
    
    // Always return ALL customers, but add appointment info if they have one
    return customers.map(customer => {
      // Find customer's appointment(s) for the selected tab period
      const customerAppointments = tabAppointments.filter(apt => 
        apt.customerId === customer.id || apt.customerName === customer.name
      );
      
      // Get the most recent/relevant appointment for the selected period
      const currentAppointment = customerAppointments
        .sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.startTime).getTime();
          const dateB = new Date(b.date + 'T' + b.startTime).getTime();
          return dateB - dateA; // Most recent first
        })[0];
      
      // If no appointment in this period, return customer without appointment info
      if (!currentAppointment) {
        return customer as CustomerWithAppointment;
      }
      
      // Map appointment status to customer card status
      let mappedStatus = 'waiting';
      let progress = 0;
      let estimatedTime = '';
      
      switch (currentAppointment.status) {
        case 'checked-in':
          mappedStatus = 'checked-in';
          progress = 25;
          estimatedTime = 'Checked in';
          break;
        case 'in-service':
          mappedStatus = 'in-service';
          progress = 75;
          estimatedTime = 'In service';
          break;
        case 'completed':
          mappedStatus = 'completed';
          progress = 100;
          estimatedTime = 'Completed';
          break;
        case 'no-show':
          mappedStatus = 'no-show';
          progress = 0;
          estimatedTime = 'No Show';
          break;
        case 'pending':
        case 'confirmed':
          mappedStatus = 'waiting';
          progress = 0;
          const aptDateTime = new Date(currentAppointment.date + 'T' + currentAppointment.startTime);
          const now = new Date();
          if (aptDateTime > now) {
            const minsDiff = Math.round((aptDateTime.getTime() - now.getTime()) / (1000 * 60));
            estimatedTime = minsDiff > 0 ? `Next in ${minsDiff} min` : 'Starting soon';
          } else {
            estimatedTime = 'Waiting';
          }
          break;
        default:
          mappedStatus = 'waiting';
          progress = 0;
          estimatedTime = 'Scheduled';
      }
      
      // Calculate progress based on time elapsed for in-service appointments
      if (currentAppointment.status === 'in-service' && currentAppointment.duration) {
        const startDateTime = new Date(currentAppointment.date + 'T' + currentAppointment.startTime);
        const now = new Date();
        const elapsedMinutes = (now.getTime() - startDateTime.getTime()) / (1000 * 60);
        progress = Math.min(95, Math.max(25, Math.round((elapsedMinutes / currentAppointment.duration) * 100)));
      }
      
      return {
        ...customer,
        appointment: {
          id: currentAppointment.id,
          service: currentAppointment.serviceName,
          staff: currentAppointment.employeeName,
          status: mappedStatus,
          progress,
          estimatedTime,
          startTime: currentAppointment.startTime,
          appointmentType: currentAppointment.price > 100 ? 'Premium' : 'Regular',
          date: currentAppointment.date,
          duration: currentAppointment.duration,
          endTime: currentAppointment.endTime,
        }
      } as CustomerWithAppointment;
    });
  }, [customers, getAppointmentsByTab, activeTab]);
  
  // Filter customers based on status and search
  const filteredCustomers = useMemo(() => {
    let filtered = customersWithAppointments;
    
    // Filter by status - only applies if customer has an appointment with that status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(customer => {
        // If filtering by status, only show customers with appointments of that status
        if (!customer.appointment) return false; // Don't show customers without appointments when filtering by status
        return customer.appointment.status === selectedStatus;
      });
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.appointment?.service.toLowerCase().includes(query)
      );
    }
    
    // Sort: customers with appointments first (by time), then customers without appointments (by name)
    return filtered.sort((a, b) => {
      // Both have appointments - sort by appointment time
      if (a.appointment && b.appointment) {
        const dateA = new Date(a.appointment.date + 'T' + a.appointment.startTime).getTime();
        const dateB = new Date(b.appointment.date + 'T' + b.appointment.startTime).getTime();
        return dateA - dateB;
      }
      // A has appointment, B doesn't - A comes first
      if (a.appointment && !b.appointment) return -1;
      // B has appointment, A doesn't - B comes first
      if (!a.appointment && b.appointment) return 1;
      // Neither has appointment - sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [customersWithAppointments, selectedStatus, searchQuery]);
  
  // Calculate metrics
  const tabAppointments = useMemo(() => getAppointmentsByTab(activeTab), [activeTab, getAppointmentsByTab]);
  const customersWithApps = customersWithAppointments.filter(c => c.appointment);
  
  const totalCustomers = customersWithApps.length;
  const inServiceCount = customersWithApps.filter(c => c.appointment?.status === 'in-service').length;
  const waitingCount = customersWithApps.filter(c => c.appointment?.status === 'waiting').length;
  const completedCount = customersWithApps.filter(c => c.appointment?.status === 'completed').length;
  const checkedInCount = customersWithApps.filter(c => c.appointment?.status === 'checked-in').length;
  const noShowCount = customersWithApps.filter(c => c.appointment?.status === 'no-show').length;

  // Calculate tab counts (MUST be before conditional returns to follow Rules of Hooks)
  const todayCount = useMemo(() => {
    const today = getTodayDate();
    return customers.filter(c => {
      const apts = allAppointments.filter(apt => 
        (apt.customerId === c.id || apt.customerName === c.name) && apt.date === today
      );
      return apts.length > 0;
    }).length;
  }, [customers, allAppointments]);

  const weekCount = useMemo(() => {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();
    return customers.filter(c => {
      const apts = allAppointments.filter(apt => 
        (apt.customerId === c.id || apt.customerName === c.name) && 
        apt.date >= weekStart && apt.date <= weekEnd
      );
      return apts.length > 0;
    }).length;
  }, [customers, allAppointments]);

  const allCount = customers.length;

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-service': return '#4CAF50';
      case 'waiting': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'checked-in': return '#9C27B0';
      case 'no-show': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-service': return 'In Service';
      case 'waiting': return 'Waiting';
      case 'completed': return 'Completed';
      case 'checked-in': return 'Checked In';
      case 'no-show': return 'No Show';
      default: return 'Unknown';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderMetricCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.metricCard}>
      <View style={styles.metricLeft}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text style={styles.metricLabel}>{title}</Text>
      </View>
      <View style={styles.metricRight}>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );

  const renderCustomerCard = (customer: CustomerWithAppointment) => {
    const hasAppointment = !!customer.appointment;
    
    // Format appointment time range if available
    let appointmentTimeText = '';
    if (hasAppointment && customer.appointment) {
      const startTime = formatTime(customer.appointment.startTime);
      if (customer.appointment.endTime) {
        const endTime = formatTime(customer.appointment.endTime);
        appointmentTimeText = `${startTime} - ${endTime}`;
      } else if (customer.appointment.duration) {
        // Calculate end time from start time and duration
        const [startHours, startMinutes] = customer.appointment.startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(startHours, startMinutes, 0, 0);
        const endDate = new Date(startDate.getTime() + customer.appointment.duration * 60000);
        const endHours = endDate.getHours();
        const endMinutes = endDate.getMinutes();
        const endTime = formatTime(`${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`);
        appointmentTimeText = `${startTime} - ${endTime}`;
      } else {
        appointmentTimeText = startTime;
      }
    }
    
    return (
      <TouchableOpacity 
        key={customer.id} 
        style={styles.customerCard}
        activeOpacity={0.7}
        onPress={() => {
          // Future: Navigate to customer details
          // router.push(`/(owner)/CustomerDetails?id=${customer.id}`);
        }}
      >
        <View style={styles.customerInfoRow}>
          {/* Avatar with initials */}
          <View style={styles.customerAvatarContainer}>
            <Text style={styles.customerAvatar}>{getInitials(customer.name)}</Text>
          </View>
          
          {/* Customer Details */}
          <View style={styles.customerDetailsColumn}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerPhone}>{customer.phone || 'No phone'}</Text>
            {hasAppointment && appointmentTimeText ? (
              <Text style={styles.customerTime}>{appointmentTimeText}</Text>
            ) : (
              <Text style={styles.customerTimePlaceholder}>No appointment scheduled</Text>
            )}
          </View>
          
          {/* Chevron Arrow */}
          <Ionicons name="chevron-forward" size={20} color="#999" style={styles.chevronIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabButton = (tabId: 'today' | 'week' | 'all', label: string, count: number) => (
    <TouchableOpacity
      key={tabId}
      style={[styles.tabButton, activeTab === tabId && styles.activeTab]}
      onPress={() => setActiveTab(tabId)}
    >
      <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>
        {label}
      </Text>
      <View style={[styles.tabBadge, activeTab === tabId && styles.activeTabBadge]}>
        <Text style={[styles.tabBadgeText, activeTab === tabId && styles.activeTabBadgeText]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderStatusFilter = (statusId: string, label: string, count: number) => (
    <TouchableOpacity
      key={statusId}
      style={[styles.statusFilterButton, selectedStatus === statusId && styles.selectedStatusFilter]}
      onPress={() => setSelectedStatus(statusId)}
    >
      <Text style={[styles.statusFilterText, selectedStatus === statusId && styles.selectedStatusFilterText]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={[styles.statusFilterBadge, selectedStatus === statusId && styles.selectedStatusFilterBadge]}>
          <Text style={[styles.statusFilterBadgeText, selectedStatus === statusId && styles.selectedStatusFilterBadgeText]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Calculate dynamic insights
  const calculateInsights = useMemo(() => {
    const customersWithApps = customersWithAppointments.filter(c => c.appointment);
    
    if (customersWithApps.length === 0) {
      return {
        busiestStaff: 'N/A',
        peakHour: 'N/A',
        topService: 'N/A',
        averageWaitTime: 'N/A'
      };
    }

    // Busiest Staff
    const staffCounts: Record<string, number> = {};
    customersWithApps.forEach(customer => {
      if (customer.appointment) {
        const staff = customer.appointment.staff;
        staffCounts[staff] = (staffCounts[staff] || 0) + 1;
      }
    });
    const busiestStaff = Object.keys(staffCounts).reduce((a, b) => 
      staffCounts[a] > staffCounts[b] ? a : b, Object.keys(staffCounts)[0] || 'N/A'
    );

    // Peak Hour
    const hourCounts: Record<string, number> = {};
    customersWithApps.forEach(customer => {
      if (customer.appointment) {
        const hour = customer.appointment.startTime.split(':')[0];
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    const peakHourKey = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b, Object.keys(hourCounts)[0] || ''
    );
    const peakHour = peakHourKey ? formatTime(peakHourKey + ':00') : 'N/A';

    // Top Service
    const serviceCounts: Record<string, number> = {};
    customersWithApps.forEach(customer => {
      if (customer.appointment) {
        const service = customer.appointment.service;
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
      }
    });
    const topService = Object.keys(serviceCounts).reduce((a, b) => 
      serviceCounts[a] > serviceCounts[b] ? a : b, Object.keys(serviceCounts)[0] || 'N/A'
    );

    // Average wait time (for waiting customers)
    const waitingCustomers = customersWithApps.filter(c => c.appointment?.status === 'waiting');
    const averageWaitTime = waitingCustomers.length > 0 
      ? `${Math.round(waitingCustomers.length / 2)} min`
      : 'N/A';

    return {
      busiestStaff,
      peakHour,
      topService,
      averageWaitTime
    };
  }, [customersWithAppointments]);

  const renderSummaryInsights = () => {
    const insightsTitle = activeTab === 'today' 
      ? "Today's Insights" 
      : activeTab === 'week'
      ? "This Week's Insights"
      : "Customer Insights";
    
    return (
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>{insightsTitle}</Text>
        <View style={styles.insightsGrid}>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Busiest Staff</Text>
            <Text style={styles.insightValue}>{calculateInsights.busiestStaff}</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Peak Hour</Text>
            <Text style={styles.insightValue}>{calculateInsights.peakHour}</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Top Service</Text>
            <Text style={styles.insightValue}>{calculateInsights.topService}</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Avg Wait Time</Text>
            <Text style={styles.insightValue}>{calculateInsights.averageWaitTime}</Text>
          </View>
        </View>
      </View>
    );
  };


  // Error state
  if (error && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Customers</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Customers</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading customers...</Text>
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
        <Text style={styles.title}>Customers</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsSection}>
          <View style={styles.tabsContainer}>
            {renderTabButton('today', 'Today', todayCount)}
            {renderTabButton('week', 'This Week', weekCount)}
            {renderTabButton('all', 'All', allCount)}
          </View>
        </View>

        {/* Status Filters */}
        <View style={styles.statusFilterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilterContainer}>
            {renderStatusFilter('all', 'All', filteredCustomers.length)}
            {renderStatusFilter('in-service', 'In Service', inServiceCount)}
            {renderStatusFilter('waiting', 'Waiting', waitingCount)}
            {renderStatusFilter('checked-in', 'Checked In', checkedInCount)}
            {renderStatusFilter('completed', 'Completed', completedCount)}
            {renderStatusFilter('no-show', 'No Show', noShowCount)}
          </ScrollView>
        </View>

        {/* Customer List */}
        <View style={styles.customersSection}>
          <Text style={styles.sectionTitle}>
            {selectedStatus === 'all' 
              ? (activeTab === 'today' ? "Today's Customers" : 
                 activeTab === 'week' ? "This Week's Customers" : 
                 "All Customers")
              : `${getStatusText(selectedStatus)} Customers`}
          </Text>
          {filteredCustomers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No customers found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try a different search term' : 
                 selectedStatus !== 'all' ? 'Try selecting a different status' :
                 'No customers match the selected filters'}
              </Text>
            </View>
          ) : (
            filteredCustomers.map(renderCustomerCard)
          )}
        </View>

        {/* Insights Section */}
        {filteredCustomers.length > 0 && renderSummaryInsights()}
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  customersSection: {
    marginBottom: 20,
  },
  customerCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  customerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerAvatar: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  customerAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  customerDetailsColumn: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  customerTime: {
    fontSize: 13,
    color: '#2196F3',
    marginTop: 2,
    fontWeight: '500',
  },
  customerTimePlaceholder: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  chevronIcon: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  customerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  // New styles
  metricsSection: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    width: '48%',
    marginBottom: 6,
    minHeight: 60,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricRight: {
    alignItems: 'flex-end',
  },
  metricIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  searchSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  tabsSection: {
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginRight: 6,
  },
  activeTabText: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#fff',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  activeTabBadgeText: {
    color: '#000',
  },
  statusFilterSection: {
    marginBottom: 16,
  },
  statusFilterContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  statusFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  selectedStatusFilter: {
    backgroundColor: '#333',
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginRight: 4,
  },
  selectedStatusFilterText: {
    color: '#fff',
  },
  statusFilterBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
  },
  selectedStatusFilterBadge: {
    backgroundColor: '#fff',
  },
  statusFilterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  selectedStatusFilterBadgeText: {
    color: '#000',
  },
  customerAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noAppointmentSection: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  noAppointmentText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  customerStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  customerStats: {
    fontSize: 11,
    color: '#666',
  },
  insightsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightItem: {
    width: '48%',
    marginBottom: 8,
  },
  insightLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
