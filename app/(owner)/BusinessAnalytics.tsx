import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Modal,
  Alert
} from 'react-native';
// Using local state for card configuration
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerAnalytics, ApprovedStaffSchedule, MarketingCampaign } from '../../services/mock/AppMockData';
import { useAppointments } from '../../contexts/AppointmentContext';

const { width } = Dimensions.get('window');

// Helpers
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = d.getDate() - day; // back to Sunday
  const res = new Date(d.setDate(diff));
  res.setHours(0, 0, 0, 0);
  return res;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayLetter(date: Date): string {
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
}

function monthLabel(date: Date): string {
  return date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
}

// Card configuration interface
interface CardConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  icon: string;
  description: string;
  category: 'financial' | 'operational' | 'marketing' | 'inventory';
}

export default function BusinessAnalytics() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [cardConfigs, setCardConfigs] = useState<CardConfig[]>([]);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [analyticsData, setAnalyticsData] = useState<OwnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staffSchedules, setStaffSchedules] = useState<ApprovedStaffSchedule[]>([]);
  const [campaignSummary, setCampaignSummary] = useState<{
    activeCampaigns: number;
    totalRevenue: number;
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    currentCampaign: MarketingCampaign | null;
  } | null>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<MarketingCampaign[]>([]);
  
  // Get appointments from context
  const { appointments: allAppointments, customers: contextCustomers } = useAppointments();
  
  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const [analyticsDataResponse, customersData, schedulesData, campaignSummaryData, activeCampaignsData] = await Promise.all([
          ownerAPI.getAnalytics(),
          ownerAPI.getCustomers(),
          ownerAPI.getApprovedSchedules(dateStr),
          ownerAPI.getActiveCampaignSummary(),
          ownerAPI.getActiveMarketingCampaigns()
        ]);
        setAnalyticsData(analyticsDataResponse);
        setCustomers(customersData);
        setStaffSchedules(schedulesData);
        setCampaignSummary(campaignSummaryData);
        setActiveCampaigns(activeCampaignsData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          const dateStr = selectedDate.toISOString().split('T')[0];
          const [analyticsDataResponse, customersData, schedulesData, campaignSummaryData, activeCampaignsData] = await Promise.all([
            ownerAPI.getAnalytics(),
            ownerAPI.getCustomers(),
            ownerAPI.getApprovedSchedules(dateStr),
            ownerAPI.getActiveCampaignSummary(),
            ownerAPI.getActiveMarketingCampaigns()
          ]);
          setAnalyticsData(analyticsDataResponse);
          setCustomers(customersData);
          setStaffSchedules(schedulesData);
          setCampaignSummary(campaignSummaryData);
          setActiveCampaigns(activeCampaignsData);
        } catch (error) {
          console.error('Error refreshing analytics data:', error);
        }
      };
      refreshData();
    }, [selectedDate])
  );

  // Initialize card configurations
  const defaultCardConfigs: CardConfig[] = [
    { id: 'revenue', title: 'Revenue Overview', enabled: true, order: 1, icon: 'cash-outline', description: 'Track revenue trends and financial performance', category: 'financial' },
    { id: 'client', title: 'Client & Appointment Analysis', enabled: true, order: 2, icon: 'calendar-outline', description: 'Analyze client behavior and appointments', category: 'operational' },
    { id: 'operational', title: 'Operational Insights', enabled: true, order: 3, icon: 'analytics-outline', description: 'Monitor business efficiency and operations', category: 'operational' },
    { id: 'marketing', title: 'Marketing Analysis', enabled: true, order: 4, icon: 'megaphone-outline', description: 'Track marketing performance and campaigns', category: 'marketing' }
  ];

  // Initialize card configurations on component mount
  useEffect(() => {
    if (cardConfigs.length === 0) {
      setCardConfigs(defaultCardConfigs);
    }
  }, []);

  // Get enabled cards sorted by order
  const getEnabledCards = () => {
    return cardConfigs
      .filter(config => config.enabled)
      .sort((a, b) => a.order - b.order);
  };

  // Render individual card based on configuration
  const renderCard = (card: CardConfig) => {
    switch (card.id) {
      case 'revenue':
        return (
          <TouchableOpacity 
            key={card.id}
            style={styles.card}
            onPress={() => router.push('/(owner)/RevenueOverview')}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Revenue Overview</Text>
              <Text style={styles.totalRevenue}>${totalRevenue}</Text>
            </View>
            <View style={styles.chartContainer}>
              {renderLineChart()}
            </View>
          </TouchableOpacity>
        );
      
      case 'client':
        return (
          <TouchableOpacity 
            key={card.id}
            style={styles.card}
            onPress={() => router.push('/(owner)/OwnerAppointments')}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Client and Appointment Analysis</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" style={styles.cardChevron} />
            </View>
            <View style={styles.analysisContainer}>
              {clientData.map((item, index) => (
                <View key={index} style={styles.analysisItem}>
                  <View style={styles.analysisItemHeader}>
                    <Text style={styles.analysisLabel}>{item.label}</Text>
                    <Text style={styles.analysisCount}>{item.count || 0}</Text>
                  </View>
                  {renderProgressBar(item.percentage, item.color, item.label === 'No-Show and Cancellations')}
                </View>
              ))}
            </View>
          </TouchableOpacity>
        );
      
      case 'operational':
        return (
          <View 
            key={card.id}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Operational Insights</Text>
            </View>
            <View style={styles.hoursContainer}>
              <View style={styles.hoursLabels}>
                <View style={styles.hoursLabelContainer}>
                  <Text style={styles.hoursLabelLeft}>Booked</Text>
                  <Text style={styles.hoursValue}>{operationalMetrics.bookedHours.toFixed(1)}h</Text>
                </View>
                <Text style={styles.hoursCenterText}>Hours</Text>
                <View style={styles.hoursLabelContainer}>
                  <Text style={styles.hoursLabelRight}>Unbooked</Text>
                  <Text style={styles.hoursValue}>{operationalMetrics.unbookedHours.toFixed(1)}h</Text>
                </View>
              </View>
              <View style={styles.hoursBar}>
                {operationalMetrics.availableHours > 0 ? (
                  <>
                    <View style={[
                      styles.hoursSegment, 
                      { 
                        backgroundColor: '#4CAF50', 
                        flex: operationalMetrics.bookedPercentage / 100
                      }
                    ]} />
                    <View style={[
                      styles.hoursSegment, 
                      { 
                        backgroundColor: '#F44336', 
                        flex: operationalMetrics.availablePercentage / 100
                      }
                    ]} />
                  </>
                ) : (
                  <View style={[
                    styles.hoursSegment, 
                    { 
                      backgroundColor: '#E0E0E0', 
                      flex: 1
                    }
                  ]} />
                )}
              </View>
              {operationalMetrics.availableHours > 0 && (
                <Text style={styles.utilizationText}>
                  {operationalMetrics.utilizationRate}% Utilization
                </Text>
              )}
            </View>
          </View>
        );
      
      case 'marketing':
        return (
          <TouchableOpacity 
            key={card.id}
            style={styles.card}
            onPress={() => router.push('/(owner)/MarketingAnalysis')}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Marketing Analysis</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" style={styles.cardChevron} />
            </View>
            {activeCampaigns.length > 0 ? (
              <>
                <View style={styles.revenueRow}>
                  <Text style={styles.currentRevenueLabel}>Total Revenue</Text>
                  <Text style={styles.currentRevenueValue}>
                    ${marketingMetrics.totalRevenue.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.activeCampaignsList}>
                  {activeCampaigns.slice(0, 3).map((campaign) => (
                    <View key={campaign.id} style={styles.activeCampaignItem}>
                      <View style={styles.activeCampaignInfo}>
                        <Text style={styles.activeCampaignName} numberOfLines={1}>
                          {campaign.offerName}
                        </Text>
                        <Text style={styles.activeCampaignRevenue}>
                          ${campaign.revenue.toLocaleString()} revenue
                        </Text>
                      </View>
                      <View style={[
                        styles.activeCampaignStatus,
                        { backgroundColor: campaign.status === 'active' ? '#10B981' : '#999' }
                      ]}>
                        <Ionicons name="megaphone" size={12} color="#fff" />
                      </View>
                    </View>
                  ))}
                  {activeCampaigns.length > 3 && (
                    <Text style={styles.moreCampaignsText}>
                      +{activeCampaigns.length - 3} more campaigns
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.noCampaignContainer}>
                <Ionicons name="megaphone-outline" size={32} color="#ccc" />
                <Text style={styles.noCampaignText}>No active campaigns</Text>
                <Text style={styles.noCampaignSubtext}>Create a campaign to track performance</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  };
  
  // Double tap functionality
  const lastTap = useRef(0);
  const doubleTapDelay = 300; // milliseconds

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && (now - lastTap.current) < doubleTapDelay) {
      // Double tap detected - go to today
      const today = new Date();
      setSelectedDate(today);
      setWeekStart(getStartOfWeek(today));
    } else {
      lastTap.current = now;
    }
  };

  const periods = ['Today', 'Week', 'Month', 'Year'];

  // Calculate revenue from appointments for selected date
  const revenueMetrics = useMemo(() => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    // Get appointments for the selected date
    const dayAppointments = allAppointments.filter(apt => {
      const aptDateStr = apt.date.split('T')[0];
      return aptDateStr === selectedDateStr;
    });
    
    // Calculate revenue from completed appointments
    const completedAppointments = dayAppointments.filter(apt => apt.status === 'completed');
    const totalRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
    
    // Calculate expected revenue from all non-cancelled appointments
    const expectedRevenue = dayAppointments
      .filter(apt => apt.status !== 'cancelled')
      .reduce((sum, apt) => sum + (apt.price || 0), 0);
    
    // Calculate outstanding payments (pending or checked-in appointments)
    const outstandingPayments = dayAppointments
      .filter(apt => ['pending', 'confirmed', 'checked-in'].includes(apt.status))
      .reduce((sum, apt) => sum + (apt.price || 0), 0);
    
    // Calculate hourly revenue for the selected date
    const hourlyRevenue: number[] = Array(24).fill(0); // 24 hours (0-23)
    
    completedAppointments.forEach(apt => {
      // Extract hour from startTime (format: "HH:MM" or "H:MM")
      let hour = 0;
      if (apt.startTime) {
        const timeParts = apt.startTime.split(':');
        if (timeParts.length >= 1) {
          hour = parseInt(timeParts[0], 10) || 0;
          if (hour >= 0 && hour < 24) {
            hourlyRevenue[hour] += apt.price || 0;
          }
        }
      }
    });
    
    // Business hours (8 AM - 8 PM)
    const businessStartHour = 8;
    const businessEndHour = 20;
    
    return {
      totalRevenue,
      expectedRevenue,
      outstandingPayments,
      completedCount: completedAppointments.length,
      totalCount: dayAppointments.length,
      hourlyRevenue,
      businessStartHour,
      businessEndHour
    };
  }, [selectedDate, allAppointments]);

  const totalRevenue = revenueMetrics.totalRevenue.toLocaleString();

  // Calculate client and appointment metrics based on selected date
  const clientMetrics = useMemo(() => {
    // Format selected date as YYYY-MM-DD for comparison
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    // Get appointments for the selected date (compare date strings)
    const dayAppointments = allAppointments.filter(apt => {
      const aptDateStr = apt.date.split('T')[0]; // Handle both YYYY-MM-DD and ISO strings
      return aptDateStr === selectedDateStr;
    });
    
    // Get unique customer IDs for the selected date
    const customerIdsInPeriod = new Set(dayAppointments.map(apt => apt.customerId));
    
    // Calculate new clients (first-time customers - no appointments before selected date)
    const newClients = Array.from(customerIdsInPeriod).filter(customerId => {
      // Check if this customer has any appointments before the selected date
      const hasPreviousAppointments = allAppointments.some(apt => {
        const aptDateStr = apt.date.split('T')[0];
        const aptDate = new Date(aptDateStr);
        const selectedDateObj = new Date(selectedDateStr);
        return apt.customerId === customerId && aptDate < selectedDateObj;
      });
      return !hasPreviousAppointments;
    }).length;
    
    // Calculate returning clients (customers with previous appointments)
    const returningClients = Array.from(customerIdsInPeriod).filter(customerId => {
      const hasPreviousAppointments = allAppointments.some(apt => {
        const aptDateStr = apt.date.split('T')[0];
        const aptDate = new Date(aptDateStr);
        const selectedDateObj = new Date(selectedDateStr);
        return apt.customerId === customerId && aptDate < selectedDateObj;
      });
      return hasPreviousAppointments;
    }).length;
    
    // Calculate no-shows and cancellations
    const noShows = dayAppointments.filter(apt => apt.status === 'no-show').length;
    const cancellations = dayAppointments.filter(apt => apt.status === 'cancelled').length;
    const totalAppointments = dayAppointments.length;
    const noShowCancellationRate = totalAppointments > 0 
      ? Math.round(((noShows + cancellations) / totalAppointments) * 100) 
      : 0;
    
    // Calculate percentages for new vs returning (of total active clients)
    const totalActiveClients = newClients + returningClients;
    const newClientsPercentage = totalActiveClients > 0 
      ? Math.round((newClients / totalActiveClients) * 100) 
      : 0;
    const returningClientsPercentage = totalActiveClients > 0 
      ? Math.round((returningClients / totalActiveClients) * 100) 
      : 0;
    
    return {
      newClients,
      returningClients,
      newClientsPercentage,
      returningClientsPercentage,
      noShowCancellationRate,
      totalActiveClients,
      totalAppointments,
      noShows,
      cancellations
    };
  }, [selectedDate, allAppointments]);
  
  const clientData = useMemo(() => [
    { 
      label: 'New Clients', 
      percentage: clientMetrics.newClientsPercentage, 
      count: clientMetrics.newClients,
      color: '#4CAF50' 
    },
    { 
      label: 'Returning Clients', 
      percentage: clientMetrics.returningClientsPercentage, 
      count: clientMetrics.returningClients,
      color: '#FF9800' 
    },
    { 
      label: 'No-Show and Cancellations', 
      percentage: clientMetrics.noShowCancellationRate, 
      count: clientMetrics.noShows + clientMetrics.cancellations,
      color: '#F44336' 
    }
  ], [clientMetrics]);

  // Calculate operational insights (booked vs available hours) based on selected date
  const operationalMetrics = useMemo(() => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    // 1. Calculate BOOKED HOURS from appointments
    const dayAppointments = allAppointments.filter(apt => {
      const aptDateStr = apt.date.split('T')[0]; // Handle both YYYY-MM-DD and ISO strings
      return aptDateStr === selectedDateStr && 
             apt.status !== 'cancelled' && 
             apt.status !== 'no-show';
    });
    
    // Sum up all appointment durations (in minutes, then convert to hours)
    const bookedMinutes = dayAppointments.reduce((total, apt) => {
      // Use duration field if available, otherwise calculate from start/end time
      if (apt.duration && apt.duration > 0) {
        return total + apt.duration;
      } else if (apt.startTime && apt.endTime) {
        // Calculate duration from start and end times
        const start = new Date(`${apt.date.split('T')[0]}T${apt.startTime}`);
        const end = new Date(`${apt.date.split('T')[0]}T${apt.endTime}`);
        const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        return total + Math.max(0, diffMinutes);
      }
      return total;
    }, 0);
    
    const bookedHours = bookedMinutes / 60;
    
    // 2. Calculate AVAILABLE HOURS from staff schedules
    // Filter schedules for the selected date that are not absent/cancelled
    const activeSchedules = staffSchedules.filter(schedule => {
      return schedule.date === selectedDateStr &&
             schedule.status !== 'absent' &&
             schedule.status !== 'cancelled';
    });
    
    // Calculate total available minutes from all schedules
    let availableMinutes = 0;
    activeSchedules.forEach(schedule => {
      if (schedule.startTime && schedule.endTime) {
        // Calculate hours between startTime and endTime
        const start = new Date(`${selectedDateStr}T${schedule.startTime}`);
        const end = new Date(`${selectedDateStr}T${schedule.endTime}`);
        const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        availableMinutes += Math.max(0, diffMinutes);
      }
    });
    
    const availableHours = availableMinutes / 60;
    
    // 3. Calculate utilization percentage
    // Utilization = (Booked Hours / Available Hours) * 100
    const utilizationRate = availableHours > 0 
      ? Math.round((bookedHours / availableHours) * 100)
      : 0;
    
    // Clamp utilization rate between 0 and 100
    const clampedUtilization = Math.min(100, Math.max(0, utilizationRate));
    
    // Calculate percentages for the visual bar
    // Booked percentage shows how much of available time is booked
    const bookedPercentage = availableHours > 0 ? clampedUtilization : 0;
    // Available (unbooked) percentage shows remaining time
    const unbookedPercentage = availableHours > 0 ? (100 - clampedUtilization) : 100;
    const unbookedHours = availableHours > 0 ? availableHours - bookedHours : 0;
    
    return {
      bookedHours: Math.round(bookedHours * 10) / 10, // Round to 1 decimal
      availableHours: Math.round(availableHours * 10) / 10,
      unbookedHours: Math.round(unbookedHours * 10) / 10,
      utilizationRate: clampedUtilization,
      bookedPercentage,
      availablePercentage: unbookedPercentage,
      totalAppointments: dayAppointments.length,
      totalSchedules: activeSchedules.length
    };
  }, [selectedDate, allAppointments, staffSchedules]);

  // Calculate marketing campaign metrics
  const marketingMetrics = useMemo(() => {
    if (!campaignSummary || !campaignSummary.currentCampaign) {
    return {
      hasActiveCampaign: false,
      campaignName: '',
      promotionText: '',
      currentRevenue: 0,
      progressPercentage: 0,
      progressLabel: 'No Active Campaign',
      totalCampaigns: 0,
      totalRevenue: 0,
    };
  }

    const campaign = campaignSummary.currentCampaign;
    
    // Format dates
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    const startDateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDateStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Create promotion text
    const promotionText = campaign.offerType === 'discount' 
      ? `${campaign.offerName}. ${campaign.discount}% off. Valid: ${startDateStr} - ${endDateStr}.`
      : `${campaign.offerName}. Valid: ${startDateStr} - ${endDateStr}.`;
    
    // Calculate progress (assume target revenue is 2x of current if boost enabled, otherwise 1.5x)
    const targetRevenue = campaign.boostEnabled && campaign.boostBudget
      ? campaign.boostBudget * 20 // Estimate: $20 per dollar spent
      : campaign.revenue * 1.5;
    
    const progressPercentage = targetRevenue > 0
      ? Math.min(100, Math.round((campaign.revenue / targetRevenue) * 100))
      : 0;
    
    // Determine progress label based on percentage
    let progressLabel = 'Starting';
    if (progressPercentage >= 75) progressLabel = 'Excellent';
    else if (progressPercentage >= 50) progressLabel = 'Good';
    else if (progressPercentage >= 25) progressLabel = 'Moderate';
    else if (progressPercentage > 0) progressLabel = 'Starting';
    
    return {
      hasActiveCampaign: true,
      campaignName: campaign.offerName,
      promotionText,
      currentRevenue: campaign.revenue,
      progressPercentage,
      progressLabel,
      totalRevenue: campaignSummary.totalRevenue,
      totalCampaigns: campaignSummary.activeCampaigns,
    };
  }, [campaignSummary]);

  const renderLineChart = () => {
    const chartWidth = width - 100; // Account for card padding and Y-axis space
    const chartHeight = 100;
    
    // Get hourly revenue data for business hours
    const hourlyRevenue = revenueMetrics.hourlyRevenue || Array(24).fill(0);
    const businessStartHour = revenueMetrics.businessStartHour || 8;
    const businessEndHour = revenueMetrics.businessEndHour || 20;
    
    // Extract revenue for business hours only (8 AM - 8 PM)
    const revenueData: number[] = [];
    for (let hour = businessStartHour; hour <= businessEndHour; hour++) {
      revenueData.push(hourlyRevenue[hour] || 0);
    }
    
    const maxRevenue = Math.max(...revenueData, 1); // Prevent division by zero
    
    if (revenueData.length === 0 || revenueData.every(val => val === 0)) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartPlaceholder}>No revenue data for this date</Text>
        </View>
      );
    }
    
    const pointSpacing = revenueData.length > 1 ? chartWidth / (revenueData.length - 1) : chartWidth;
    
    // Generate hour labels with positions (8 AM - 8 PM)
    const xAxisLabels: Array<{ label: string; hour: number; index: number }> = [];
    for (let hour = businessStartHour; hour <= businessEndHour; hour++) {
      const index = hour - businessStartHour;
      // Show every 2nd hour label to avoid crowding (8, 10, 12, 2, 4, 6, 8)
      if ((hour - businessStartHour) % 2 === 0 || hour === businessEndHour) {
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const amPm = hour >= 12 ? 'PM' : 'AM';
        xAxisLabels.push({
          label: `${displayHour}${amPm}`,
          hour,
          index
        });
      }
    }

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            {maxRevenue >= 1000 ? (
              <>
                <Text style={styles.yAxisLabel}>{Math.ceil(maxRevenue / 1000)}k</Text>
                <Text style={styles.yAxisLabel}>{Math.ceil(maxRevenue / 2000)}k</Text>
                <Text style={styles.yAxisLabel}>0</Text>
              </>
            ) : (
              <>
                <Text style={styles.yAxisLabel}>{Math.ceil(maxRevenue)}</Text>
                <Text style={styles.yAxisLabel}>{Math.ceil(maxRevenue / 2)}</Text>
                <Text style={styles.yAxisLabel}>0</Text>
              </>
            )}
          </View>
          
          {/* Chart area */}
          <View style={styles.chartArea}>
            {/* Grid lines */}
            <View style={[styles.gridLine, { top: 0 }]} />
            <View style={[styles.gridLine, { top: 50 }]} />
            <View style={[styles.gridLine, { top: 100 }]} />
            
            {/* Green line using multiple small segments */}
            <View style={styles.lineContainer}>
              {revenueData.map((value, index) => {
                if (index === 0) return null;
                const prevValue = revenueData[index - 1];
                const currentValue = value;
                
                const prevX = (index - 1) * pointSpacing;
                const currentX = index * pointSpacing;
                const prevY = chartHeight - (prevValue / maxRevenue) * chartHeight;
                const currentY = chartHeight - (currentValue / maxRevenue) * chartHeight;
                
                const steps = Math.max(2, Math.abs(currentX - prevX) / 1.5);
                const segments = [];
                
                for (let i = 0; i < steps; i++) {
                  const t = i / steps;
                  const x = prevX + (currentX - prevX) * t;
                  const y = prevY + (currentY - prevY) * t;
                  
                  segments.push(
                    <View
                      key={`${index}-${i}`}
                      style={[
                        styles.linePoint,
                        {
                          left: x - 1,
                          top: y - 1,
                        }
                      ]}
                    />
                  );
                }
                
                return segments;
              })}
            </View>
            
            {/* Data points */}
            {revenueData.map((value, index) => {
              const x = index * pointSpacing;
              const y = chartHeight - (value / maxRevenue) * chartHeight;
              return (
                <View
                  key={`point-${index}`}
                  style={[
                    styles.dataPoint,
                    {
                      left: x - 4,
                      top: y - 4,
                    }
                  ]}
                />
              );
            })}
          </View>
          
          {/* X-axis labels */}
          <View style={styles.xAxisLabels}>
            {xAxisLabels.map((labelData) => {
              // Calculate position based on the hour index
              const xPos = labelData.index * pointSpacing - 15; // Center the label
              
              return (
                <Text 
                  key={`hour-${labelData.hour}`} 
                  style={[
                    styles.xAxisLabel,
                    { left: xPos }
                  ]}
                >
                  {labelData.label}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderProgressBar = (percentage: number, color: string, isThin: boolean = false) => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, isThin && styles.thinProgressBar]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${percentage}%`, 
              backgroundColor: color 
            }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{percentage}%</Text>
    </View>
  );

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading analytics...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.backButton} />
            <Text style={styles.businessName}>Man's Cave – Men's Hair Salon</Text>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Minimal Horizontal Calendar */}
        <View style={styles.minimalCalendarCard}>
          {/* Header Section */}
          <View style={styles.minimalCalendarHeader}>
            <TouchableOpacity 
              style={styles.minimalMonthYearContainer}
              onPress={handleDoubleTap}
              activeOpacity={0.7}
            >
              <Text style={styles.minimalMonthYear}>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
            <View style={styles.minimalNavButtons}>
              <TouchableOpacity 
                style={styles.minimalNavButton} 
                onPress={() => setWeekStart(addDays(weekStart, -7))}
              >
                <Ionicons name="chevron-back" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.minimalNavButton} 
                onPress={() => setWeekStart(addDays(weekStart, 7))}
              >
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Weekday Row */}
          <View style={styles.minimalWeekdayRow}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
              <Text key={index} style={styles.minimalWeekdayText}>{day}</Text>
            ))}
          </View>
          
          {/* Date Row */}
          <View style={styles.minimalDateRow}>
            {Array.from({ length: 7 }, (_, i) => {
              const day = addDays(weekStart, i);
              const isSelected = isSameDay(day, selectedDate);
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.minimalDateContainer}
                  onPress={() => setSelectedDate(day)}
                >
                  <View style={[
                    styles.minimalDateCircle,
                    isSelected && styles.minimalDateCircleSelected
                  ]}>
                    <Text style={[
                      styles.minimalDateText,
                      isSelected && styles.minimalDateTextSelected
                    ]}>
                      {day.getDate()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dynamic Cards based on configuration */}
        {getEnabledCards().map(renderCard)}

      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCalendar(false)}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeaderRow}>
              <View style={styles.calendarLeftDate}>
                <Text style={styles.calendarBigDay}>{selectedDate.getDate()}</Text>
                <View>
                  <Text style={styles.calendarWeekday}>{selectedDate.toLocaleDateString(undefined, { weekday: 'short' })}</Text>
                  <Text style={styles.calendarMonth}>{monthLabel(selectedDate)}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.todayPill} onPress={() => { setSelectedDate(new Date()); setWeekStart(getStartOfWeek(new Date())); }}>
                <Text style={styles.todayPillText}>Today</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarStripRow}>
              <TouchableOpacity style={styles.navArrow} onPress={() => setWeekStart(addDays(weekStart, -7))}>
                <Ionicons name="chevron-back" size={20} color="#333" />
              </TouchableOpacity>

              <View style={styles.stripDays}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = addDays(weekStart, i);
                  const isSelected = isSameDay(d, selectedDate);
                  return (
                    <TouchableOpacity key={i} style={[styles.stripDay, isSelected && styles.stripDaySelected]} onPress={() => setSelectedDate(d)}>
                      <Text style={[styles.stripDayLetter, isSelected && styles.stripDayLetterSelected]}>{formatDayLetter(d)}</Text>
                      <Text style={[styles.stripDayNum, isSelected && styles.stripDayNumSelected]}>{d.getDate()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.navArrow} onPress={() => setWeekStart(addDays(weekStart, 7))}>
                <Ionicons name="chevron-forward" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarActionRow}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Period Selection Modal */}
      <Modal
        visible={showPeriodModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowPeriodModal(false)}
        >
          <View style={styles.modalContent}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedPeriod(period);
                  setShowPeriodModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{period}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header Section
  header: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    padding: 5,
  },
  iconButton: {
    padding: 5,
    marginRight: 6,
  },
  
  // Revenue Card Styles - Matching Other Cards
  revenueSection: {
    marginBottom: 15,
  },
  totalRevenue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cardMenuButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    padding: 5,
  },
  
  // Legacy Revenue Overview Card Styles
  revenueOverviewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    minHeight: 200,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginTop: 8,
    marginLeft: 8,
  },
  dateFilterButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: 36,
    width: 90,
    backgroundColor: '#000000',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  chartAreaContainer: {
    marginTop: 20,
    flex: 1,
  },
  hamburgerMenu: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 14,
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  periodText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  
  // Revenue Chart Styles
  revenueChartContainer: {
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    overflow: 'hidden',
  },
  revenueChart: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
  },
  revenueYAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 120,
    justifyContent: 'space-between',
    paddingRight: 5,
  },
  revenueYAxisLabel: {
    fontSize: 10,
    color: '#999999',
  },
  revenueChartArea: {
    flex: 1,
    marginLeft: 30,
    position: 'relative',
    height: 120,
    overflow: 'hidden',
  },
  revenueGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
    top: 0,
  },
  revenueLineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    overflow: 'hidden',
  },
  revenueLinePoint: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#2ECC71', // Bright green
    borderRadius: 1,
  },
  revenueXAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 30,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
  },
  revenueXAxisLabel: {
    fontSize: 10,
    color: '#666666',
  },
  
  // Legacy Chart Styles (for other charts)
  chartContainer: {
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    overflow: 'hidden',
  },
  chart: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
  },
  legacyYAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 80,
    justifyContent: 'space-between',
    paddingRight: 5,
  },
  legacyYAxisLabel: {
    fontSize: 10,
    color: '#666',
  },
  yAxisLabels: {
    position: 'absolute',
    left: 5,
    top: 0,
    height: 100,
    justifyContent: 'space-between',
    paddingRight: 3,
    width: 25,
    alignItems: 'flex-end',
  },
  yAxisLabel: {
    fontSize: 9,
    color: '#666',
    textAlign: 'right',
    lineHeight: 12,
  },
  chartArea: {
    flex: 1,
    marginLeft: 30,
    position: 'relative',
    height: 100,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
    top: 0,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    overflow: 'hidden',
  },
  linePoint: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#34C759', // Green color for revenue chart
    borderRadius: 1,
  },
  legacyXAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 30,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
  },
  legacyXAxisLabel: {
    fontSize: 10,
    color: '#666',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 30,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    height: 20,
  },
  chartPlaceholder: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    zIndex: 2,
  },
  xAxisLabel: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    minWidth: 15,
  },
  
  // Card Styles
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardChevron: {
    marginLeft: 8,
  },
  
  // Analysis Styles
  analysisContainer: {
    marginTop: 10,
  },
  analysisItem: {
    marginBottom: 15,
  },
  analysisItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  analysisCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    marginRight: 10,
  },
  thinProgressBar: {
    height: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 35,
  },
  
  // Operational Insights
  insightsSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  hoursContainer: {
    marginBottom: 15,
  },
  hoursLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hoursLabelContainer: {
    alignItems: 'center',
  },
  hoursLabelLeft: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  hoursLabelRight: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  hoursValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
    marginTop: 2,
  },
  hoursCenterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  hoursBar: {
    flexDirection: 'row',
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  hoursSegment: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  utilizationText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  hoursText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Marketing Analysis
  promotionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentRevenueLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  currentRevenueValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  milestoneContainer: {
    marginTop: 10,
  },
  milestoneText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
    marginBottom: 5,
  },
  milestoneBar: {
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
  },
  milestoneProgress: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 2.5,
  },
  campaignCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    gap: 6,
  },
  campaignCountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  noCampaignContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  noCampaignText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
    marginBottom: 4,
  },
  noCampaignSubtext: {
    fontSize: 13,
    color: '#ccc',
    textAlign: 'center',
  },
  activeCampaignsList: {
    marginTop: 12,
  },
  activeCampaignItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 6,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
  },
  activeCampaignInfo: {
    flex: 1,
    marginRight: 8,
  },
  activeCampaignName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activeCampaignRevenue: {
    fontSize: 11,
    color: '#666',
  },
  activeCampaignStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCampaignsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },

  // Calendar Styles
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    width: '92%',
  },
  calendarMonth: {
    fontSize: 12,
    color: '#999',
  },
  todayPill: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  todayPillText: {
    color: '#333',
    fontWeight: '600',
  },
  calendarStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 0,
  },
  navArrow: {
    padding: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripDays: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: 4,
  },
  stripDay: {
    flex: 1,
    minWidth: 36,
    maxWidth: 44,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  stripDaySelected: {
    backgroundColor: '#111',
  },
  stripDayLetter: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500',
  },
  stripDayLetterSelected: {
    color: '#fff',
  },
  stripDayNum: {
    fontSize: 14,
    color: '#777',
    fontWeight: '600',
  },
  stripDayNumSelected: {
    color: '#fff',
  },
  calendarActionRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#111',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Minimal Calendar Styles
  minimalCalendarCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  minimalCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  minimalMonthYearContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  minimalMonthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'System',
  },
  minimalNavButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  minimalNavButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  minimalWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  minimalWeekdayText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    width: 32,
    fontFamily: 'System',
  },
  minimalDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  minimalDateContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalDateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalDateCircleSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  minimalDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    fontFamily: 'System',
  },
  minimalDateTextSelected: {
    color: '#FFFFFF',
  },

  // Legacy Modern Calendar Styles (keeping for reference)
  modernCalendarCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modernCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modernDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernBigDay: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 16,
  },
  modernDateInfo: {
    flex: 1,
  },
  modernWeekday: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  modernMonthYear: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
  modernTodayButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  modernTodayButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
  },
  modernCalendarStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernNavArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  modernDaysContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: 12,
  },
  modernDayCard: {
    width: 44,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  modernDayCardSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modernDayCardToday: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  modernDayLetter: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C757D',
    marginBottom: 4,
  },
  modernDayLetterSelected: {
    color: '#FFFFFF',
  },
  modernDayLetterToday: {
    color: '#1976D2',
  },
  modernDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  modernDayNumberSelected: {
    color: '#FFFFFF',
  },
  modernDayNumberToday: {
    color: '#1976D2',
  },

  // Legacy Calendar Styles (keeping for modal)
  calendarCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: width - 32,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarLeftDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarBigDay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarWeekday: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  todayButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  todayButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
});

