import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerBusinessData, OwnerScheduleData } from '../../services/mock/AppMockData';
import { useAppointments } from '../../contexts/AppointmentContext';

const { width } = Dimensions.get('window');

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { appointments: allAppointments } = useAppointments();
  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | 'Week' | 'Month'>('Today');

  // API state
  const [businessData, setBusinessData] = useState<OwnerBusinessData | null>(null);
  const [scheduleData, setScheduleData] = useState<OwnerScheduleData[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get business name from user or default
  const businessName = useMemo(() => {
    return user?.displayName || "Your Business";
  }, [user]);

  // Get dynamic greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Persist selected period
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('owner_dashboard_period');
        if (stored && ['Today', 'Week', 'Month'].includes(stored)) {
          setSelectedPeriod(stored as 'Today' | 'Week' | 'Month');
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await SecureStore.setItemAsync('owner_dashboard_period', selectedPeriod);
      } catch {}
    })();
  }, [selectedPeriod]);

  // Load data from API
  const loadData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      const [businessDataResponse, scheduleDataResponse] = await Promise.all([
        ownerAPI.getBusinessData(selectedPeriod),
        ownerAPI.getScheduleData(today)
      ]);
      
      setBusinessData(businessDataResponse);
      setScheduleData(scheduleDataResponse);
      
      // Load recent activity from appointments
      await loadRecentActivity();
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  // Load recent activity from appointments
  const loadRecentActivity = useCallback(async () => {
    try {
      const recentAppointments = allAppointments
        .filter(apt => apt.status === 'completed')
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3);

      const activity = recentAppointments.map(apt => {
        const completedDate = new Date(`${apt.date}T${apt.startTime}`);
        const now = new Date();
        const diffMs = now.getTime() - completedDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        let timeAgo = '';
        if (diffMins < 1) timeAgo = 'Just now';
        else if (diffMins < 60) timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        else timeAgo = `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`;

        return {
          type: 'completed',
          text: `Appointment completed - ${apt.customerName}`,
          time: timeAgo,
          icon: 'checkmark-circle',
          color: '#4CAF50'
        };
      });

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  }, [allAppointments]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedPeriod])
  );

  // Use API data or fallback to default values
  const currentData = businessData?.today || {
    revenue: 0,
    appointments: 0,
    customers: 0,
    satisfaction: 0,
    staffUtilization: 0
  };
  const previousData = businessData?.yesterday || {
    revenue: 0,
    appointments: 0,
    customers: 0,
    satisfaction: 0,
    staffUtilization: 0
  };

  // Calculate percentage changes with division by zero protection
  const calculateChange = (current: number, previous: number): string => {
    if (previous === 0) {
      return current > 0 ? '100.0' : '0.0';
    }
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const revenueChange = calculateChange(currentData.revenue, previousData.revenue);
  const appointmentChange = calculateChange(currentData.appointments, previousData.appointments);
  const customerChange = calculateChange(currentData.customers, previousData.customers);
  const satisfactionChange = calculateChange(currentData.satisfaction, previousData.satisfaction);

  // Calculate average appointment value with division by zero protection
  const avgAppointmentValue = currentData.appointments > 0
    ? Math.round(currentData.revenue / currentData.appointments)
    : 0;

  // Period label for KPI cards
  const periodLabel = useMemo(() => {
    switch (selectedPeriod) {
      case 'Week': return "This Week's";
      case 'Month': return "This Month's";
      default: return "Today's";
    }
  }, [selectedPeriod]);

  const renderKPICard = (title: string, value: string, change: string, icon: string, color: string, onPress: () => void) => (
    <TouchableOpacity 
      style={[styles.kpiCard, { borderColor: '#E0E0E0' }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.kpiHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.kpiTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color="#999" style={styles.kpiChevron} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <View style={styles.kpiChange}>
        <Ionicons 
          name={parseFloat(change) >= 0 ? "trending-up" : "trending-down"} 
          size={16} 
          color={parseFloat(change) >= 0 ? "#4CAF50" : "#F44336"} 
        />
        <Text style={[
          styles.changeText, 
          { color: parseFloat(change) >= 0 ? "#4CAF50" : "#F44336" }
        ]}>
          {change}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderQuickAction = (title: string, icon: string, onPress: () => void) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon as any} size={24} color="#000000" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  // KPI Card Navigation Functions
  const handleRevenuePress = () => {
    router.push('/(owner)/RevenueOverview');
  };

  const handleAppointmentsPress = () => {
    router.push('/(owner)/OwnerAppointments');
  };

  const handleCustomersPress = () => {
    router.push('/(owner)/CustomersListPage');
  };

  const handleSatisfactionPress = () => {
    router.push('/(owner)/CustomerReviewsPage');
  };

  const handleRetry = () => {
    loadData();
  };

  // Show loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={{ fontSize: 18, color: '#666', marginTop: 16 }}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !businessData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.businessName}>{businessName}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Failed to Load Dashboard</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.businessName}>{businessName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor="#FF6B35"
          />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={styles.periodButton}
            onPress={() => setSelectedPeriod('Today')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'Today' && styles.periodTextActive]}>Today</Text>
            {selectedPeriod === 'Today' && <View style={styles.periodIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.periodButton}
            onPress={() => setSelectedPeriod('Week')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'Week' && styles.periodTextActive]}>Week</Text>
            {selectedPeriod === 'Week' && <View style={styles.periodIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.periodButton}
            onPress={() => setSelectedPeriod('Month')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'Month' && styles.periodTextActive]}>Month</Text>
            {selectedPeriod === 'Month' && <View style={styles.periodIndicator} />}
          </TouchableOpacity>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          {renderKPICard(
            `${periodLabel} Revenue`, 
            `$${currentData.revenue.toLocaleString()}`, 
            revenueChange, 
            "cash-outline", 
            "#4CAF50",
            handleRevenuePress
          )}
          {renderKPICard(
            "Appointments", 
            currentData.appointments.toString(), 
            appointmentChange, 
            "calendar-outline", 
            "#2196F3",
            handleAppointmentsPress
          )}
          {renderKPICard(
            "Customers", 
            currentData.customers.toString(), 
            customerChange, 
            "people-outline", 
            "#FF9800",
            handleCustomersPress
          )}
          {renderKPICard(
            "Satisfaction", 
            currentData.satisfaction.toFixed(1), 
            `${parseFloat(satisfactionChange) >= 0 ? '+' : ''}${satisfactionChange}`, 
            "star-outline", 
            "#9C27B0",
            handleSatisfactionPress
          )}
        </View>

        {/* Business Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Business Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Staff Utilization</Text>
              <Text style={styles.overviewValue}>{currentData.staffUtilization}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, currentData.staffUtilization)}%` }]} />
              </View>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Avg. Appointment Value</Text>
              <Text style={styles.overviewValue}>${avgAppointmentValue}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {renderQuickAction("Add Staff", "person-add-outline", () => router.push('/(owner)/AddStaff'))}
            {renderQuickAction("View Schedule", "calendar-outline", () => router.push('/(owner)/StaffSchedule'))}
            {renderQuickAction("Create Promotion", "gift-outline", () => router.push('/(owner)/MarketingAnalysis'))}
            {renderQuickAction("Analytics", "analytics-outline", () => router.push('/(owner)/BusinessAnalytics'))}
            {renderQuickAction("Customers", "people-outline", () => router.push('/(owner)/CustomersListPage'))}
            {renderQuickAction("Settings", "settings-outline", () => router.push('/(owner)/OwnerSettings'))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
                  <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.text}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={32} color="#ccc" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
            </View>
          )}
        </View>

        {/* Today's Schedule */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => router.push('/(owner)/OwnerAppointments')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {scheduleData.length > 0 ? (
            scheduleData.slice(0, 5).map((item, index) => (
              <TouchableOpacity 
                key={`${item.time}-${index}`} 
                style={styles.scheduleItem}
                onPress={() => router.push('/(owner)/OwnerAppointments')}
                activeOpacity={0.7}
              >
                <View style={styles.scheduleTimeContainer}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.scheduleTime}>{item.time}</Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleCustomer}>{item.customer}</Text>
                  <Text style={styles.scheduleMeta}>{item.service} • {item.staff}</Text>
                </View>
                <View style={styles.scheduleAction}>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={32} color="#ccc" />
              <Text style={styles.emptyStateText}>No appointments scheduled for today</Text>
            </View>
          )}
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
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  businessName: {
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
  
  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    position: 'relative',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  periodTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  periodIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  
  // KPI Cards
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%', // 2 cards per row with 4% gap
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },
  kpiChevron: {
    marginLeft: 'auto',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  kpiChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Business Overview
  overviewCard: {
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
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    flex: 1,
    marginRight: 16,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  
  // Quick Actions
  quickActionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: width < 600 ? '48%' : '31%', // 2 per row on mobile (48% each with 4% gap), 3 on larger screens (31% each with 7% gap)
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickActionText: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Recent Activity
  activityCard: {
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },

  // Schedule
  scheduleCard: {
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
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scheduleTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  scheduleTime: {
    marginLeft: 6,
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleCustomer: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  scheduleMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  scheduleAction: {
    padding: 6,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});