import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppointments } from '../../contexts/AppointmentContext';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerStaffMember } from '../../services/mock/AppMockData';

export default function OwnerAppointments() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'upcoming'>('today');
  const { appointments: sharedAppointments, updateAppointment, deleteAppointment, getAppointmentsByDate } = useAppointments();
  const [selectedEmployee, setSelectedEmployee] = useState<string | number>('all');
  const [staffMembers, setStaffMembers] = useState<OwnerStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const staffData = await ownerAPI.getStaffMembers();
      setStaffMembers(staffData);
    } catch (error: any) {
      console.error('Error loading staff data:', error);
      setError(error?.message || 'Failed to load appointments data. Please try again.');
      Alert.alert('Error', error?.message || 'Failed to load appointments data. Please try again.');
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

  // Use shared appointments data
  const allAppointments = sharedAppointments;

  // Create employees array from staffMembers data
  const employees = useMemo(() => [
    { id: 'all', name: 'All Staff', avatar: null, icon: 'storefront' },
    ...staffMembers.map(staff => ({
      id: staff.id.toString(),
      name: staff.name,
      avatar: staff.avatar,
      icon: null
    }))
  ], [staffMembers]);

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

  // Filter appointments by tab (date range)
  const getAppointmentsByTab = useCallback((tab: 'today' | 'week' | 'upcoming') => {
    const today = getTodayDate();
    const now = new Date();
    
    switch (tab) {
      case 'today':
        return allAppointments.filter(apt => apt.date === today);
      
      case 'week':
        const weekStart = getWeekStart();
        const weekEnd = getWeekEnd();
        return allAppointments.filter(apt => 
          apt.date >= weekStart && apt.date <= weekEnd
        );
      
      case 'upcoming':
        return allAppointments.filter(apt => {
          const aptDate = new Date(apt.date + 'T' + apt.startTime);
          return aptDate >= now && 
                 ['pending', 'confirmed', 'checked-in'].includes(apt.status);
        }).sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.startTime).getTime();
          const dateB = new Date(b.date + 'T' + b.startTime).getTime();
          return dateA - dateB;
        });
      
      default:
        return [];
    }
  }, [allAppointments]);

  // Get filtered appointments based on tab and employee
  const filteredAppointments = useMemo(() => {
    let tabFiltered = getAppointmentsByTab(activeTab);
    
    // Apply employee filter
    if (selectedEmployee !== 'all') {
      const employeeIdStr = typeof selectedEmployee === 'number' 
        ? selectedEmployee.toString() 
        : selectedEmployee;
      tabFiltered = tabFiltered.filter(
        appointment => appointment.employeeId.toString() === employeeIdStr
      );
    }
    
    // Sort by date and time
    return tabFiltered.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.startTime).getTime();
      const dateB = new Date(b.date + 'T' + b.startTime).getTime();
      return dateA - dateB;
    });
  }, [activeTab, selectedEmployee, getAppointmentsByTab]);

  // Calculate metrics based on filtered appointments (for the active tab)
  const tabAppointments = useMemo(() => getAppointmentsByTab(activeTab), [activeTab, getAppointmentsByTab]);
  
  const totalAppointments = tabAppointments.filter(apt => apt.status !== 'cancelled').length;
  const completedAppointments = tabAppointments.filter(apt => apt.status === 'completed').length;
  const upcomingAppointments = tabAppointments.filter(apt => 
    ['confirmed', 'pending', 'checked-in'].includes(apt.status)
  ).length;
  const noShowAppointments = tabAppointments.filter(apt => apt.status === 'no-show').length;
  const expectedRevenue = tabAppointments
    .filter(apt => apt.status !== 'cancelled')
    .reduce((sum, apt) => sum + (apt.price || 0), 0);

  // Calculate tab counts
  const todayCount = useMemo(() => 
    getAppointmentsByTab('today').filter(apt => apt.status !== 'cancelled').length,
    [getAppointmentsByTab]
  );
  
  const weekCount = useMemo(() => 
    getAppointmentsByTab('week').filter(apt => apt.status !== 'cancelled').length,
    [getAppointmentsByTab]
  );
  
  const upcomingCount = useMemo(() => 
    getAppointmentsByTab('upcoming').length,
    [getAppointmentsByTab]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'checked-in': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'completed': return '#9C27B0';
      case 'no-show': return '#F44336';
      case 'cancelled': return '#757575';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'checked-in': return 'person-circle';
      case 'pending': return 'time';
      case 'completed': return 'checkmark-done-circle';
      case 'no-show': return 'close-circle';
      case 'cancelled': return 'remove-circle';
      default: return 'help-circle';
    }
  };

  const handleQuickAction = (appointmentId: number, action: string) => {
    const appointment = allAppointments.find((apt: any) => apt.id === appointmentId.toString());
    if (!appointment) return;

    switch (action) {
      case 'complete':
        updateAppointment(appointmentId.toString(), { status: 'completed' });
        Alert.alert('Success', `${appointment.customerName}'s appointment marked as completed`);
        break;
      case 'reminder':
        Alert.alert('Reminder Sent', `Reminder sent to ${appointment.customerName}`);
        break;
      case 'reassign':
        Alert.alert('Reassign Staff', `Staff reassignment for ${appointment.customerName}`);
        break;
    }
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

  // Format time for display
  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderAppointmentItem = (appointment: any) => (
    <TouchableOpacity 
      key={appointment.id} 
      style={styles.appointmentCard}
      activeOpacity={0.7}
      onPress={() => {
        // Future: Navigate to appointment details
        // router.push(`/(owner)/AppointmentDetails?id=${appointment.id}`);
      }}
    >
      <View style={styles.appointmentMainRow}>
        <View style={styles.appointmentLeft}>
          <View style={styles.timeStatusRow}>
            <View>
              {activeTab !== 'today' && (
                <Text style={styles.appointmentDate}>{formatDate(appointment.date)}</Text>
              )}
              <Text style={styles.appointmentTime}>{formatTime(appointment.startTime)}</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(appointment.status) }]}>
              <Ionicons name={getStatusIcon(appointment.status) as any} size={14} color="#fff" />
            </View>
          </View>
          <Text style={styles.customerName}>{appointment.customerName}</Text>
          <Text style={styles.serviceName}>{appointment.serviceName}</Text>
          {appointment.notes && (
            <Text style={styles.appointmentNotes} numberOfLines={1}>
              {appointment.notes}
            </Text>
          )}
        </View>
        
        <View style={styles.appointmentRight}>
          <Text style={styles.revenue}>${(appointment.price || 0).toLocaleString()}</Text>
          <Text style={styles.staffName}>{appointment.employeeName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTabButton = (tabId: 'today' | 'week' | 'upcoming', label: string, count: number) => (
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

  const renderEmployeeFilter = (employee: any) => {
    const isSelected = selectedEmployee === 'all' 
      ? employee.id === 'all'
      : selectedEmployee.toString() === employee.id.toString();
    
    return (
      <TouchableOpacity
        key={employee.id}
        style={[styles.employeeFilter, isSelected && styles.selectedEmployeeFilter]}
        onPress={() => setSelectedEmployee(employee.id === 'all' ? 'all' : employee.id)}
      >
        {employee.icon ? (
          <View style={styles.employeeIconContainer}>
            <Ionicons name={employee.icon as any} size={16} color={isSelected ? "#fff" : "#666"} />
          </View>
        ) : (
          <View style={styles.employeeAvatarContainer}>
            <Text style={[styles.employeeAvatar, isSelected && styles.selectedEmployeeAvatar]}>
              {employee.avatar}
            </Text>
          </View>
        )}
        <Text style={[styles.employeeName, isSelected && styles.selectedEmployeeName]}>
          {employee.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Calculate dynamic insights from actual data
  const calculateInsights = useMemo(() => {
    const insights = tabAppointments.filter(apt => apt.status !== 'cancelled');
    
    // Busiest Staff
    const staffCounts: Record<string, number> = {};
    insights.forEach(apt => {
      const key = apt.employeeId;
      staffCounts[key] = (staffCounts[key] || 0) + 1;
    });
    const busiestStaffId = Object.keys(staffCounts).reduce((a, b) => 
      staffCounts[a] > staffCounts[b] ? a : b, Object.keys(staffCounts)[0] || ''
    );
    const busiestStaffName = busiestStaffId 
      ? (staffMembers.find(s => s.id.toString() === busiestStaffId)?.name || 'N/A')
      : 'N/A';
    const busiestStaffCount = staffCounts[busiestStaffId] || 0;

    // Peak Hour
    const hourCounts: Record<string, number> = {};
    insights.forEach(apt => {
      const hour = apt.startTime.split(':')[0];
      const displayHour = formatTime(apt.startTime).split(' ')[0] + ' ' + formatTime(apt.startTime).split(' ')[1];
      hourCounts[displayHour] = (hourCounts[displayHour] || 0) + 1;
    });
    const peakHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b, Object.keys(hourCounts)[0] || 'N/A'
    );

    // Top Service
    const serviceCounts: Record<string, number> = {};
    insights.forEach(apt => {
      const service = apt.serviceName;
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
    const topService = Object.keys(serviceCounts).reduce((a, b) => 
      serviceCounts[a] > serviceCounts[b] ? a : b, Object.keys(serviceCounts)[0] || 'N/A'
    );

    // Completion Rate
    const totalAppts = insights.length;
    const completedCount = insights.filter(apt => apt.status === 'completed').length;
    const completionRate = totalAppts > 0 
      ? Math.round((completedCount / totalAppts) * 100)
      : 0;

    return {
      busiestStaff: busiestStaffCount > 0 ? `${busiestStaffName} (${busiestStaffCount} apps)` : 'N/A',
      peakHour: peakHour !== 'N/A' ? peakHour : 'N/A',
      topService: topService !== 'N/A' ? topService : 'N/A',
      completionRate: `${completionRate}%`
    };
  }, [tabAppointments, staffMembers]);

  const renderSummaryInsights = () => {
    const insightsTitle = activeTab === 'today' 
      ? "Today's Insights" 
      : activeTab === 'week'
      ? "This Week's Insights"
      : "Upcoming Insights";
    
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
            <Text style={styles.insightLabel}>Completion Rate</Text>
            <Text style={styles.insightValue}>{calculateInsights.completionRate}</Text>
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
          <Text style={styles.title}>Appointments</Text>
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

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Appointments</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
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
        <Text style={styles.title}>Appointments</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Metrics / Quick Stats */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'today' ? "Today's Overview" : 
             activeTab === 'week' ? "This Week's Overview" : 
             "Upcoming Overview"}
          </Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              activeTab === 'today' ? 'Total Today' : activeTab === 'week' ? 'Total Week' : 'Upcoming',
              totalAppointments, 
              'calendar', 
              '#2196F3'
            )}
            {renderMetricCard('Completed', completedAppointments, 'checkmark-circle', '#4CAF50')}
            {renderMetricCard('Upcoming', upcomingAppointments, 'time', '#FF9800')}
            {renderMetricCard('No Shows', noShowAppointments, 'close-circle', '#F44336')}
          </View>
          <View style={styles.revenueCard}>
            <View style={styles.revenueLeft}>
              <View style={styles.revenueIcon}>
                <Ionicons name="cash" size={20} color="#333" />
              </View>
              <Text style={styles.revenueLabel}>
                {activeTab === 'today' ? 'Expected Revenue Today' : 
                 activeTab === 'week' ? 'Expected Revenue This Week' : 
                 'Expected Revenue Upcoming'}
              </Text>
            </View>
            <View style={styles.revenueRight}>
              <Text style={styles.revenueValue}>${expectedRevenue.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Filters / Tabs */}
        <View style={styles.tabsSection}>
          <Text style={styles.sectionTitle}>View Options</Text>
          <View style={styles.tabsContainer}>
            {renderTabButton('today', 'Today', todayCount)}
            {renderTabButton('week', 'This Week', weekCount)}
            {renderTabButton('upcoming', 'Upcoming', upcomingCount)}
          </View>
        </View>

        {/* Employee Filter */}
        <View style={styles.employeeFilterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.employeeFilterContainer}>
            {employees.map(renderEmployeeFilter)}
          </ScrollView>
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>
            {selectedEmployee === 'all' 
              ? (activeTab === 'today' ? "Today's Appointments" : 
                 activeTab === 'week' ? "This Week's Appointments" : 
                 "Upcoming Appointments")
              : `${employees.find(e => e.id === selectedEmployee)?.name}'s Appointments`}
          </Text>
          {filteredAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No appointments found</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedEmployee !== 'all' 
                  ? `Try selecting a different staff member`
                  : `Try selecting a different time period`}
              </Text>
            </View>
          ) : (
            filteredAppointments.map(renderAppointmentItem)
          )}
        </View>

        {/* Optional Summary / Insights */}
        {renderSummaryInsights()}
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
  revenueCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 60,
  },
  revenueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  revenueRight: {
    alignItems: 'flex-end',
  },
  revenueIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  revenueLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  tabsSection: {
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
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
  employeeFilterSection: {
    marginBottom: 16,
  },
  employeeFilterContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  employeeFilter: {
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    minWidth: 70,
  },
  selectedEmployeeFilter: {
    backgroundColor: '#333',
  },
  employeeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  employeeAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  employeeAvatar: {
    fontSize: 16,
  },
  selectedEmployeeAvatar: {
    fontSize: 16,
  },
  employeeName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedEmployeeName: {
    color: '#fff',
  },
  appointmentsSection: {
    marginBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentLeft: {
    flex: 1,
    marginRight: 12,
  },
  appointmentRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  timeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  staffName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  revenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
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
  
  // Additional styles
  appointmentDate: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  appointmentNotes: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
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
