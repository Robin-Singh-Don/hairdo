import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { RevenueData, ServiceRevenue, EmployeeRevenue, TopCustomer, RevenueTrendData } from '../../services/mock/AppMockData';

const { width } = Dimensions.get('window');



export default function RevenueOverview() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  
  // API state
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [previousRevenueData, setPreviousRevenueData] = useState<RevenueData | null>(null);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([]);
  const [employeeRevenue, setEmployeeRevenue] = useState<EmployeeRevenue[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [revenueTrendData, setRevenueTrendData] = useState<RevenueTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allServices, setAllServices] = useState<string[]>([]);
  const [allEmployees, setAllEmployees] = useState<string[]>([]);

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get previous period for comparison
      const previousPeriodMap: Record<string, 'day' | 'week' | 'month' | 'year'> = {
        'day': 'day', // For day, we'd need to get yesterday - simplified for now
        'week': 'week',
        'month': 'month',
        'year': 'year'
      };
      
      const currentPeriod = selectedPeriod as 'day' | 'week' | 'month' | 'year';
      
      // Calculate date range for the period
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let periodStart: Date;
      let periodEnd: Date = new Date(today);
      periodEnd.setHours(23, 59, 59, 999);
      
      switch (currentPeriod) {
        case 'day':
          periodStart = new Date(today);
          break;
        case 'week':
          periodStart = new Date(today);
          const day = periodStart.getDay();
          const diff = periodStart.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
          periodStart.setDate(diff);
          break;
        case 'month':
          periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
          periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          periodEnd.setHours(23, 59, 59, 999);
          break;
        case 'year':
          periodStart = new Date(today.getFullYear(), 0, 1);
          periodEnd = new Date(today.getFullYear(), 11, 31);
          periodEnd.setHours(23, 59, 59, 999);
          break;
        default:
          periodStart = new Date(today);
      }
      
      const periodRange = { start: periodStart, end: periodEnd };
      
      const [revenueDataResponse, serviceRevenueResponse, employeeRevenueResponse, topCustomersResponse, revenueTrendResponse, staffMembers] = await Promise.all([
        ownerAPI.getRevenueDataByPeriod(currentPeriod),
        ownerAPI.getServiceRevenue(periodRange, selectedService !== 'all' ? selectedService : undefined),
        ownerAPI.getEmployeeRevenue(periodRange, selectedEmployee !== 'all' ? selectedEmployee : undefined),
        ownerAPI.getTopCustomers(),
        ownerAPI.getRevenueTrendData(),
        ownerAPI.getStaffMembers()
      ]);
      
      setRevenueData(revenueDataResponse);
      
      // Extract services and employees for filters (get all services/employees, not filtered)
      const allServicesResponse = await ownerAPI.getServiceRevenue(periodRange);
      const allEmployeesResponse = await ownerAPI.getEmployeeRevenue(periodRange);
      const services = allServicesResponse.map(s => s.name);
      setAllServices(['all', ...services]);
      setAllEmployees(['all', ...allEmployeesResponse.map(e => e.name)]);
      
      // Use the filtered results directly from API
      setServiceRevenue(serviceRevenueResponse);
      setEmployeeRevenue(employeeRevenueResponse);
      setTopCustomers(topCustomersResponse);
      setRevenueTrendData(revenueTrendResponse);
      
      // For trend calculation, we'll compare with previous period from monthly trend data
      if (revenueTrendResponse && revenueTrendResponse.monthlyRevenue.length > 1) {
        const currentMonthIndex = new Date().getMonth();
        const currentMonthRevenue = revenueTrendResponse.monthlyRevenue[currentMonthIndex] || 0;
        const prevIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : revenueTrendResponse.monthlyRevenue.length - 1;
        const previousMonthRevenue = revenueTrendResponse.monthlyRevenue[prevIndex] || currentMonthRevenue;
        
        // Calculate margin from current data
        const margin = revenueDataResponse.totalRevenue > 0 
          ? ((revenueDataResponse.netProfit / revenueDataResponse.totalRevenue) * 100)
          : 72;
        
        // Store for trend calculations
        setPreviousRevenueData({
          totalRevenue: previousMonthRevenue,
          netProfit: previousMonthRevenue * (margin / 100),
          expenses: previousMonthRevenue * (1 - margin / 100),
          grossMargin: margin,
          outstandingPayments: 0,
          avgTransactionValue: revenueDataResponse.avgTransactionValue * 0.95, // Slight decrease assumption
          customersServed: 0,
          revenuePerCustomer: 0,
          futureBookingsValue: 0,
          recurringRevenue: 0
        });
      }
    } catch (error: any) {
      console.error('Error loading revenue data:', error);
      setError(error?.message || 'Failed to load revenue data. Please try again.');
      Alert.alert('Error', error?.message || 'Failed to load revenue data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedService, selectedEmployee]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Use API data with fallbacks
  const monthlyRevenue = revenueTrendData?.monthlyRevenue || [8500, 9200, 8800, 10500, 11200, 9800, 12500, 11800, 13200, 12800, 14100, 12500];
  const currentYearRevenue = revenueTrendData?.currentYearRevenue || 14100;
  const previousYearRevenue = revenueTrendData?.previousYearRevenue || 8500;
  const yearOverYearChange = revenueTrendData?.yearOverYearChange || '65.9';
  
  // Get previous period data for accurate trend calculation
  const getPreviousPeriodData = useMemo(() => {
    if (!revenueData || !revenueTrendData) return null;
    
    const today = new Date();
    let previousData: RevenueData | null = null;
    
    if (selectedPeriod === 'month') {
      // Compare with previous month from trend data
      const currentMonthIndex = today.getMonth();
      const prevMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : 11;
      const prevMonthRevenue = revenueTrendData.monthlyRevenue[prevMonthIndex] || 0;
      const margin = revenueData.grossMargin || 72;
      
      previousData = {
        totalRevenue: prevMonthRevenue,
        netProfit: prevMonthRevenue * (margin / 100),
        expenses: prevMonthRevenue * (1 - margin / 100),
        grossMargin: margin,
        outstandingPayments: revenueData.outstandingPayments,
        avgTransactionValue: revenueData.avgTransactionValue * 0.95,
        customersServed: 0,
        revenuePerCustomer: 0,
        futureBookingsValue: 0,
        recurringRevenue: 0
      };
    } else if (selectedPeriod === 'year') {
      // Compare with previous year
      const margin = revenueData.grossMargin || 72;
      previousData = {
        totalRevenue: previousYearRevenue,
        netProfit: previousYearRevenue * (margin / 100),
        expenses: previousYearRevenue * (1 - margin / 100),
        grossMargin: margin,
        outstandingPayments: 0,
        avgTransactionValue: revenueData.avgTransactionValue * 0.9,
        customersServed: 0,
        revenuePerCustomer: 0,
        futureBookingsValue: 0,
        recurringRevenue: 0
      };
    }
    
    return previousData;
  }, [revenueData, revenueTrendData, selectedPeriod, previousYearRevenue]);
  
  // Update previousRevenueData when period changes
  useEffect(() => {
    if (getPreviousPeriodData) {
      setPreviousRevenueData(getPreviousPeriodData);
    }
  }, [getPreviousPeriodData]);

  // Filter periods to only include supported ones (exclude 'quarter')
  const allPeriods = revenueTrendData?.periods || [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' }
  ];
  const periods = allPeriods.filter(p => p.key !== 'quarter');

  // Calculate real trend percentages
  const calculateTrend = (current: number, previous: number): string => {
    if (!previous || previous === 0) return '0';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
  };

  const revenueTrend = revenueData && previousRevenueData 
    ? calculateTrend(revenueData.totalRevenue, previousRevenueData.totalRevenue)
    : '+0';
  
  const profitTrend = revenueData && previousRevenueData
    ? calculateTrend(revenueData.netProfit, previousRevenueData.netProfit)
    : '+0';
  
  const marginTrend = revenueData && previousRevenueData
    ? calculateTrend(revenueData.grossMargin, previousRevenueData.grossMargin)
    : '+0';
  
  const avgTransactionTrend = revenueData && previousRevenueData && previousRevenueData.avgTransactionValue > 0
    ? calculateTrend(revenueData.avgTransactionValue, previousRevenueData.avgTransactionValue)
    : '+0';

  // Format period label with actual date range
  const getPeriodLabel = (period: string): string => {
    const today = new Date();
    const labels: Record<string, string> = {
      day: `Today, ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      week: (() => {
        const weekStart = getWeekStart(today);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      })(),
      month: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      year: `${today.getFullYear()}`,
    };
    return labels[period] || 'This month';
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
    return new Date(d.setDate(diff));
  };
  
  // Get period range for better display
  const getPeriodRange = (period: string): { start: string; end: string } => {
    const today = new Date();
    let start: Date, end: Date;
    
    switch (period) {
      case 'day':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'week':
        start = getWeekStart(today);
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        start = today;
        end = today;
    }
    
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: period === 'year' ? 'numeric' : undefined })
    };
  };

  // Generate dynamic alerts based on actual data
  const generateAlerts = (): Array<{ icon: string; color: string; text: string }> => {
    const alerts: Array<{ icon: string; color: string; text: string }> = [];
    
    if (!revenueData) return alerts;

    // Outstanding payments alert
    if (revenueData.outstandingPayments > 0) {
      alerts.push({
        icon: 'warning-outline',
        color: '#FF9800',
        text: `Outstanding payments: $${revenueData.outstandingPayments.toLocaleString()}`
      });
    }

    // Monthly target progress (simulated - would need target data from API)
    const monthlyTarget = 100000; // Placeholder target
    const progress = (revenueData.totalRevenue / monthlyTarget) * 100;
    if (progress > 0 && progress < 100) {
      alerts.push({
        icon: 'checkmark-circle-outline',
        color: '#4CAF50',
        text: `Monthly target ${Math.round(progress)}% complete`
      });
    } else if (progress >= 100) {
      alerts.push({
        icon: 'checkmark-circle-outline',
        color: '#4CAF50',
        text: 'Monthly target exceeded! 🎉'
      });
    }

    // Gross margin alert if low
    if (revenueData.grossMargin < 60) {
      alerts.push({
        icon: 'information-outline',
        color: '#2196F3',
        text: `Gross margin at ${revenueData.grossMargin}% - below optimal`
      });
    }

    // Service performance alert
    if (serviceRevenue.length > 0) {
      const topService = serviceRevenue[0];
      const lowestService = serviceRevenue[serviceRevenue.length - 1];
      if (lowestService.percentage < 5 && serviceRevenue.length > 1) {
        alerts.push({
          icon: 'information-outline',
          color: '#2196F3',
          text: `${lowestService.name} revenue below average`
        });
      }
    }

    // Default alerts if none generated
    if (alerts.length === 0) {
      alerts.push({
        icon: 'checkmark-circle-outline',
        color: '#4CAF50',
        text: 'All metrics within normal range'
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  // Handle filter application
  const handleApplyFilters = () => {
    setShowFilters(false);
    setShowServiceDropdown(false);
    setShowEmployeeDropdown(false);
    loadData();
  };

  const handleResetFilters = () => {
    setSelectedService('all');
    setSelectedEmployee('all');
    setShowServiceDropdown(false);
    setShowEmployeeDropdown(false);
    setShowFilters(false);
    loadData();
  };

  const renderKPICard = (title: string, value: string, subtitle: string, icon: string, color: string, trend?: string) => (
    <TouchableOpacity 
      style={[styles.kpiCard, { borderLeftColor: color }]}
      activeOpacity={0.7}
      onPress={() => {
        // Future: Add drill-down functionality
        // For now, just provide visual feedback
      }}
    >
      <View style={styles.kpiHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.kpiTitle}>{title}</Text>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: parseFloat(trend) >= 0 ? '#E8F5E8' : '#FFEBEE' }]}>
            <Ionicons 
              name={parseFloat(trend) >= 0 ? "trending-up" : "trending-down"} 
              size={12} 
              color={parseFloat(trend) >= 0 ? "#4CAF50" : "#F44336"} 
            />
            <Text style={[styles.trendText, { color: parseFloat(trend) >= 0 ? "#4CAF50" : "#F44336" }]}>
              {trend}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const renderServiceItem = (service: ServiceRevenue, index: number) => {
    // Calculate total revenue for progress bar
    const totalRevenue = serviceRevenue.reduce((sum, s) => sum + s.revenue, 0);
    const progressPercentage = totalRevenue > 0 ? (service.revenue / totalRevenue) * 100 : 0;
    
    return (
      <View key={index} style={styles.serviceItem}>
        <View style={styles.serviceInfo}>
          <View style={[styles.serviceDot, { backgroundColor: service.color }]} />
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>{service.name}</Text>
            {renderProgressBar(progressPercentage, service.color)}
          </View>
        </View>
        <View style={styles.serviceStats}>
          <Text style={styles.serviceRevenue}>${service.revenue.toLocaleString()}</Text>
          <Text style={styles.servicePercentage}>{service.percentage}%</Text>
        </View>
      </View>
    );
  };

  const renderEmployeeItem = (employee: EmployeeRevenue, index: number) => (
    <View key={index} style={styles.employeeItem}>
      <View style={styles.employeeAvatar}>
        <Text style={styles.employeeAvatarText}>{employee.avatar}</Text>
      </View>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{employee.name}</Text>
        <Text style={styles.employeeStats}>{employee.customers} customers</Text>
      </View>
      <Text style={styles.employeeRevenue}>${employee.revenue.toLocaleString()}</Text>
    </View>
  );

  const renderCustomerItem = (customer: TopCustomer, index: number) => (
    <View key={index} style={styles.customerItem}>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <Text style={styles.customerVisits}>{customer.visits} visits • {customer.lastVisit}</Text>
      </View>
      <Text style={styles.customerSpent}>${customer.totalSpent.toLocaleString()}</Text>
    </View>
  );

  const renderProgressBar = (percentage: number, color: string) => (
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );

  // Render Revenue Chart - Custom implementation
  const renderRevenueChart = () => {
    if (!monthlyRevenue || monthlyRevenue.length === 0) {
      return (
        <View style={styles.chartEmpty}>
          <Text style={styles.chartPlaceholder}>📊 No data available</Text>
        </View>
      );
    }

    const chartWidth = width - 80; // Account for padding
    const chartHeight = 180;
    const padding = 20;
    const graphWidth = chartWidth - (padding * 2);
    const graphHeight = chartHeight - (padding * 2);
    
    // Find min and max values for scaling
    const maxValue = Math.max(...monthlyRevenue);
    const minValue = Math.min(...monthlyRevenue);
    const valueRange = maxValue - minValue || 1; // Avoid division by zero
    
    // Calculate points
    const pointSpacing = graphWidth / (monthlyRevenue.length - 1);
    const points = monthlyRevenue.map((value, index) => {
      const x = padding + (index * pointSpacing);
      const y = padding + graphHeight - ((value - minValue) / valueRange) * graphHeight;
      return { x, y, value };
    });

    // Month labels (short names)
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Y-axis labels (5 ticks)
    const yAxisTicks = 5;
    const yAxisLabels = [];
    for (let i = 0; i <= yAxisTicks; i++) {
      const value = maxValue - (valueRange * (i / yAxisTicks));
      yAxisLabels.push(Math.round(value / 1000) + 'k');
    }

    return (
      <View style={styles.chartWrapper}>
        {/* Y-Axis Labels */}
        <View style={styles.yAxis}>
          {yAxisLabels.map((label, index) => (
            <Text key={index} style={styles.yAxisLabel}>{label}</Text>
          ))}
        </View>
        
        {/* Chart Area */}
        <View style={styles.chartArea}>
          {/* Grid Lines */}
          {yAxisLabels.map((_, index) => {
            const yPos = padding + (graphHeight * (index / yAxisTicks));
            return (
              <View
                key={`grid-${index}`}
                style={[
                  styles.gridLine,
                  { top: yPos, width: graphWidth + padding }
                ]}
              />
            );
          })}
          
          {/* Line Path */}
          <View style={styles.linePath}>
            {points.map((point, index) => {
              if (index === 0) return null;
              
              const prevPoint = points[index - 1];
              const dx = point.x - prevPoint.x;
              const dy = point.y - prevPoint.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const steps = Math.max(10, Math.floor(distance / 2));
              
              return (
                <View key={`line-${index}`}>
                  {Array.from({ length: steps }, (_, i) => {
                    const t = i / steps;
                    const x = prevPoint.x + (dx * t);
                    const y = prevPoint.y + (dy * t);
                    return (
                      <View
                        key={`point-${index}-${i}`}
                        style={[
                          styles.chartPoint,
                          {
                            left: x - 1.5,
                            top: y - 1.5,
                          }
                        ]}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
          
          {/* Data Points */}
          {points.map((point, index) => (
            <TouchableOpacity
              key={`dot-${index}`}
              style={[
                styles.dataPoint,
                {
                  left: point.x - 4,
                  top: point.y - 4,
                }
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.dataPointInner} />
            </TouchableOpacity>
          ))}
          
          {/* X-Axis Labels */}
          <View style={styles.xAxis}>
            {monthLabels.slice(0, monthlyRevenue.length).map((label, index) => {
              // Show every 2nd month label to avoid crowding
              if (monthlyRevenue.length > 6 && index % 2 !== 0 && index !== monthlyRevenue.length - 1) {
                return null;
              }
              const xPos = padding + (index * pointSpacing);
              return (
                <Text
                  key={`x-${index}`}
                  style={[
                    styles.xAxisLabel,
                    { left: xPos - 15 }
                  ]}
                >
                  {label}
                </Text>
              );
            })}
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Revenue Overview</Text>
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Revenue Overview</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading revenue data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revenue Overview</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => {
            // Ensure we don't allow 'quarter' selection
            if (period.key === 'quarter') return null;
            return (
              <TouchableOpacity
                key={period.key}
                style={styles.periodButton}
                onPress={() => {
                  if (period.key !== 'quarter') {
                    setSelectedPeriod(period.key as 'day' | 'week' | 'month' | 'year');
                  }
                }}
              >
                <Text style={[styles.periodText, selectedPeriod === period.key && styles.periodTextActive]}>
                  {period.label}
                </Text>
                {selectedPeriod === period.key && <View style={styles.periodIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Top-Level KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Financial Metrics</Text>
          <View style={styles.kpiGrid}>
            {renderKPICard(
              "Total Revenue", 
              `$${revenueData?.totalRevenue.toLocaleString() || '0'}`, 
              getPeriodLabel(selectedPeriod), 
              "cash-outline", 
              "#4CAF50",
              revenueTrend
            )}
            {renderKPICard(
              "Net Profit", 
              `$${revenueData?.netProfit.toLocaleString() || '0'}`, 
              "After expenses", 
              "trending-up-outline", 
              "#2196F3",
              profitTrend
            )}
            {renderKPICard(
              "Expenses", 
              `$${revenueData?.expenses.toLocaleString() || '0'}`, 
              "Operational costs", 
              "receipt-outline", 
              "#FF9800"
            )}
            {renderKPICard(
              "Gross Margin", 
              `${revenueData?.grossMargin || 0}%`, 
              "Profit margin", 
              "analytics-outline", 
              "#9C27B0",
              marginTrend
            )}
            {renderKPICard(
              "Outstanding", 
              `$${revenueData?.outstandingPayments.toLocaleString() || '0'}`, 
              "Receivables", 
              "time-outline", 
              "#F44336"
            )}
            {renderKPICard(
              "Avg Transaction", 
              `$${revenueData?.avgTransactionValue || 0}`, 
              "Per customer", 
              "person-outline", 
              "#607D8B",
              avgTransactionTrend
            )}
          </View>
        </View>

        {/* Revenue Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Trends</Text>
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendTitle}>Monthly Revenue</Text>
              <View style={styles.trendBadge}>
                <Ionicons name="trending-up" size={12} color="#4CAF50" />
                <Text style={[styles.trendText, { color: "#4CAF50" }]}>{yearOverYearChange}%</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              {renderRevenueChart()}
            </View>
          </View>
        </View>

        {/* Service Revenue Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue by Service</Text>
          <View style={styles.serviceCard}>
            {serviceRevenue.map(renderServiceItem)}
          </View>
        </View>

        {/* Employee Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <View style={styles.employeeCard}>
            {employeeRevenue.map(renderEmployeeItem)}
          </View>
        </View>

        {/* Customer Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Customers</Text>
          <View style={styles.customerCard}>
            {topCustomers.map(renderCustomerItem)}
          </View>
        </View>

        {/* Cash Flow */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cash Flow</Text>
          <View style={styles.cashFlowCard}>
            <View style={styles.cashFlowItem}>
              <Text style={styles.cashFlowLabel}>Inflow</Text>
              <Text style={[styles.cashFlowValue, { color: '#4CAF50' }]}>+${revenueData?.totalRevenue.toLocaleString() || '0'}</Text>
            </View>
            <View style={styles.cashFlowItem}>
              <Text style={styles.cashFlowLabel}>Outflow</Text>
              <Text style={[styles.cashFlowValue, { color: '#F44336' }]}>-${revenueData?.expenses.toLocaleString() || '0'}</Text>
            </View>
            <View style={styles.cashFlowDivider} />
            <View style={styles.cashFlowItem}>
              <Text style={styles.cashFlowLabel}>Net Cash Flow</Text>
              <Text style={[styles.cashFlowValue, { color: '#4CAF50' }]}>+${revenueData?.netProfit.toLocaleString() || '0'}</Text>
            </View>
          </View>
        </View>

        {/* Future Revenue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Revenue</Text>
          <View style={styles.futureCard}>
            <View style={styles.futureItem}>
              <Ionicons name="calendar-outline" size={20} color="#2196F3" />
              <View style={styles.futureInfo}>
                <Text style={styles.futureLabel}>Scheduled Bookings</Text>
                <Text style={styles.futureValue}>${revenueData?.futureBookingsValue.toLocaleString() || '0'}</Text>
              </View>
            </View>
            <View style={styles.futureItem}>
              <Ionicons name="refresh-outline" size={20} color="#4CAF50" />
              <View style={styles.futureInfo}>
                <Text style={styles.futureLabel}>Recurring Revenue</Text>
                <Text style={styles.futureValue}>${revenueData?.recurringRevenue.toLocaleString() || '0'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alerts */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
            <View style={styles.alertsCard}>
              {alerts.map((alert, index) => (
                <View key={index} style={styles.alertItem}>
                  <Ionicons name={alert.icon as any} size={20} color={alert.color} />
                  <Text style={styles.alertText}>{alert.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowFilters(false);
          setShowServiceDropdown(false);
          setShowEmployeeDropdown(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => {
                setShowFilters(false);
                setShowServiceDropdown(false);
                setShowEmployeeDropdown(false);
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Service Type</Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={styles.filterOption}
                    onPress={() => {
                      setShowServiceDropdown(!showServiceDropdown);
                      setShowEmployeeDropdown(false);
                    }}
                  >
                    <Text style={styles.filterOptionText}>
                      {selectedService === 'all' ? 'All Services' : selectedService}
                    </Text>
                    <Ionicons 
                      name={showServiceDropdown ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                  {showServiceDropdown && (
                    <View style={styles.dropdownMenu}>
                      {allServices.map((service) => (
                        <TouchableOpacity
                          key={service}
                          style={[
                            styles.dropdownItem,
                            selectedService === service && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setSelectedService(service);
                            setShowServiceDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedService === service && styles.dropdownItemTextSelected
                          ]}>
                            {service === 'all' ? 'All Services' : service}
                          </Text>
                          {selectedService === service && (
                            <Ionicons name="checkmark" size={18} color="#000" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Employee</Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={styles.filterOption}
                    onPress={() => {
                      setShowEmployeeDropdown(!showEmployeeDropdown);
                      setShowServiceDropdown(false);
                    }}
                  >
                    <Text style={styles.filterOptionText}>
                      {selectedEmployee === 'all' ? 'All Employees' : selectedEmployee}
                    </Text>
                    <Ionicons 
                      name={showEmployeeDropdown ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                  {showEmployeeDropdown && (
                    <View style={styles.dropdownMenu}>
                      {allEmployees.map((employee) => (
                        <TouchableOpacity
                          key={employee}
                          style={[
                            styles.dropdownItem,
                            selectedEmployee === employee && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setSelectedEmployee(employee);
                            setShowEmployeeDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedEmployee === employee && styles.dropdownItemTextSelected
                          ]}>
                            {employee === 'all' ? 'All Employees' : employee}
                          </Text>
                          {selectedEmployee === employee && (
                            <Ionicons name="checkmark" size={18} color="#000" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {(selectedService !== 'all' || selectedEmployee !== 'all') && (
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={handleResetFilters}
                >
                  <Ionicons name="refresh-outline" size={18} color="#666" />
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowFilters(false);
                  setShowServiceDropdown(false);
                  setShowEmployeeDropdown(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterButton: {
    padding: 5,
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
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
  },
  periodText: {
    fontSize: 12,
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

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },

  // KPI Cards
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    flex: 1,
    marginLeft: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  kpiSubtitle: {
    fontSize: 11,
    color: '#999',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },

  // Trend Card
  trendCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    minHeight: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 5,
    overflow: 'hidden',
  },
  chartWrapper: {
    flexDirection: 'row',
    height: '100%',
  },
  yAxis: {
    width: 35,
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignItems: 'flex-end',
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#E0E0E0',
    left: 0,
  },
  linePath: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  chartPoint: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 1.5,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dataPointInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 25,
    flexDirection: 'row',
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    width: 30,
    textAlign: 'center',
  },
  chartEmpty: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    fontSize: 14,
    color: '#999',
  },

  // Service Card
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  serviceStats: {
    alignItems: 'flex-end',
  },
  serviceRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  servicePercentage: {
    fontSize: 12,
    color: '#666',
  },

  // Employee Card
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeAvatarText: {
    fontSize: 18,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  employeeStats: {
    fontSize: 12,
    color: '#666',
  },
  employeeRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Customer Card
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  customerVisits: {
    fontSize: 12,
    color: '#666',
  },
  customerSpent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Cash Flow Card
  cashFlowCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cashFlowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cashFlowLabel: {
    fontSize: 14,
    color: '#666',
  },
  cashFlowValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  cashFlowDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },

  // Future Revenue Card
  futureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  futureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  futureInfo: {
    marginLeft: 12,
    flex: 1,
  },
  futureLabel: {
    fontSize: 14,
    color: '#666',
  },
  futureValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // Alerts Card
  alertsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },

  // Progress Bar
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading & Error States
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

  // Filter Modal Styles
  filterScrollView: {
    maxHeight: 300,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#F8F9FA',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#000',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});
