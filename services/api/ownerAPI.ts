// 🎯 OWNER API SERVICE
// Mock API implementation that simulates real backend calls

import { 
  OwnerStaffMember,
  OwnerBusinessData,
  OwnerScheduleData,
  OwnerAnalytics,
  OwnerNotification,
  OwnerProfilePost,
  CustomerReview,
  RevenueTrendData,
  OwnerCustomer,
  OwnerRevenue,
  OwnerReport,
  EmployeePayroll,
  RevenueData,
  ServiceRevenue,
  EmployeeRevenue,
  TopCustomer,
  ClientAppointment,
  ClientAnalysis,
  ServiceAnalysis,
  StaffAnalysis,
  StaffScheduleRequest,
  ApprovedStaffSchedule,
  EmployeeTimeOffRequest,
  MarketingCampaign,
  BookingPreferences,
  BankAccount,
  BusinessPaymentMethod,
  PayoutSettings,
  PaymentTransaction,
  StaffManagementSettings,
  StaffRolePermissions,
  SchedulingDefaults,
  StaffNotificationSettings,
  GeneralSettings,
  BusinessInfo,
  LocationInfo,
  BrandingInfo,
  PoliciesInfo,
  OwnerNotificationSettings,
  OwnerSecuritySettings,
  Device,
  RecoveryOptions
} from '../mock/AppMockData';
import { AppMockData } from '../mock/AppMockData';
import { getAppointmentsRepository } from '../repository/appointments';

// ===========================================
// HELPER FUNCTIONS FOR REVENUE CALCULATIONS
// ===========================================

// Get date range for a period
function getPeriodDateRange(period: 'day' | 'week' | 'month' | 'year'): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let start: Date;
  let end: Date = new Date(today);
  end.setHours(23, 59, 59, 999);
  
  switch (period) {
    case 'day':
      start = new Date(today);
      break;
    case 'week':
      start = new Date(today);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
      start.setDate(diff);
      break;
    case 'month':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(today);
  }
  
  return { start, end };
}

// Check if a date string (YYYY-MM-DD) falls within a date range
function isDateInRange(dateStr: string, start: Date, end: Date): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  return date >= start && date <= end;
}

// Format date to YYYY-MM-DD string
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ===========================================
// API INTERFACE - SAME FOR MOCK AND REAL API
// ===========================================

export interface OwnerAPI {
  // Dashboard APIs
  getBusinessData(period?: 'Today' | 'Week' | 'Month'): Promise<OwnerBusinessData>;
  getScheduleData(date?: string): Promise<OwnerScheduleData[]>;
  getAnalytics(): Promise<OwnerAnalytics>;
  
  // Staff Management APIs
  getStaffMembers(): Promise<OwnerStaffMember[]>;
  addStaffMember(staff: Omit<OwnerStaffMember, 'id'>): Promise<OwnerStaffMember>;
  updateStaffMember(id: number, updates: Partial<OwnerStaffMember>): Promise<OwnerStaffMember>;
  deleteStaffMember(id: number): Promise<boolean>;
  
  // Schedule Management APIs
  getScheduleRequests(): Promise<StaffScheduleRequest[]>;
  getApprovedSchedules(date?: string): Promise<ApprovedStaffSchedule[]>;
  createSchedule(schedule: Omit<ApprovedStaffSchedule, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ApprovedStaffSchedule>;
  updateSchedule(id: string, updates: Partial<ApprovedStaffSchedule>): Promise<ApprovedStaffSchedule>;
  deleteSchedule(id: string): Promise<boolean>;
  approveScheduleRequest(requestId: string, modifications?: Partial<StaffScheduleRequest>): Promise<ApprovedStaffSchedule>;
  rejectScheduleRequest(requestId: string, reason?: string): Promise<boolean>;
  
  // Time Off Request APIs
  getTimeOffRequests(): Promise<EmployeeTimeOffRequest[]>;
  approveTimeOffRequest(requestId: string): Promise<boolean>;
  rejectTimeOffRequest(requestId: string, reason?: string): Promise<boolean>;
  
  // Customer Management APIs
  getCustomers(): Promise<OwnerCustomer[]>;
  getCustomerDetails(customerId: string): Promise<OwnerCustomer>;
  
  // Revenue & Analytics APIs
  getRevenueData(): Promise<OwnerRevenue>;
  getReports(): Promise<OwnerReport[]>;
  
  // Notification APIs
  getNotifications(): Promise<OwnerNotification[]>;
  markNotificationAsRead(id: string): Promise<boolean>;
  markAllNotificationsAsRead(): Promise<boolean>;
  
  // Notification Settings APIs
  getNotificationSettings(): Promise<OwnerNotificationSettings>;
  updateNotificationSettings(settings: Partial<OwnerNotificationSettings>): Promise<OwnerNotificationSettings>;
  
  // Settings APIs
  getBusinessSettings(): Promise<any>;
  updateBusinessSettings(settings: any): Promise<any>;
  
  // Booking Preferences APIs
  getBookingPreferences(): Promise<BookingPreferences>;
  updateBookingPreferences(preferences: Partial<BookingPreferences>): Promise<BookingPreferences>;
  
  // Banking APIs
  getBankAccounts(): Promise<BankAccount[]>;
  addBankAccount(account: Omit<BankAccount, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'isVerified'>): Promise<BankAccount>;
  updateBankAccount(accountId: string, updates: Partial<BankAccount>): Promise<BankAccount>;
  deleteBankAccount(accountId: string): Promise<boolean>;
  setPrimaryBankAccount(accountId: string): Promise<boolean>;
  
  // Payment Methods APIs
  getPaymentMethods(): Promise<BusinessPaymentMethod[]>;
  updatePaymentMethod(methodId: string, enabled: boolean): Promise<BusinessPaymentMethod>;
  
  // Payout Settings APIs
  getPayoutSettings(): Promise<PayoutSettings>;
  updatePayoutSettings(settings: Partial<PayoutSettings>): Promise<PayoutSettings>;
  
  // Payment Transactions APIs
  getPaymentTransactions(limit?: number): Promise<PaymentTransaction[]>;
  
  // Staff Management Settings APIs
  getStaffManagementSettings(): Promise<StaffManagementSettings>;
  updateStaffManagementSettings(updates: Partial<StaffManagementSettings>): Promise<StaffManagementSettings>;
  updateStaffRolePermissions(roleKey: string, permissions: Partial<StaffRolePermissions['permissions']>): Promise<StaffRolePermissions>;
  updateSchedulingDefaults(defaults: Partial<SchedulingDefaults>): Promise<SchedulingDefaults>;
  updateStaffNotificationSettings(notificationSettings: Partial<StaffNotificationSettings>): Promise<StaffNotificationSettings>;
  
  // General Settings APIs
  getGeneralSettings(): Promise<GeneralSettings>;
  updateGeneralSettings(updates: Partial<GeneralSettings>): Promise<GeneralSettings>;
  updateBusinessInfo(businessInfo: Partial<BusinessInfo>): Promise<BusinessInfo>;
  updateLocationInfo(locationInfo: Partial<LocationInfo>): Promise<LocationInfo>;
  updateBrandingInfo(brandingInfo: Partial<BrandingInfo>): Promise<BrandingInfo>;
  updatePoliciesInfo(policiesInfo: Partial<PoliciesInfo>): Promise<PoliciesInfo>;
  
  // Security Settings APIs
  getSecuritySettings(): Promise<OwnerSecuritySettings>;
  updateSecuritySettings(updates: Partial<OwnerSecuritySettings>): Promise<OwnerSecuritySettings>;
  revokeDevice(deviceId: string): Promise<boolean>;
  updateRecoveryOptions(recoveryOptions: Partial<RecoveryOptions>): Promise<RecoveryOptions>;
  changePassword(currentPassword: string, newPassword: string): Promise<boolean>;
  signOutAllDevices(): Promise<boolean>;
  
  // Payroll APIs
  getEmployeePayrolls(): Promise<EmployeePayroll[]>;
  updatePayrollStatus(id: string, status: 'approved' | 'pending'): Promise<boolean>;
  
  // Revenue Analytics APIs
  getRevenueDataByPeriod(period: 'day' | 'week' | 'month' | 'year'): Promise<RevenueData>;
  getServiceRevenue(period?: { start: Date; end: Date }, serviceFilter?: string): Promise<ServiceRevenue[]>;
  getEmployeeRevenue(period?: { start: Date; end: Date }, employeeFilter?: string): Promise<EmployeeRevenue[]>;
  getTopCustomers(): Promise<TopCustomer[]>;
  
  // Client Appointment Analysis APIs
  getClientAppointments(): Promise<ClientAppointment[]>;
  getClientAnalysis(): Promise<ClientAnalysis[]>;
  getServiceAnalysis(): Promise<ServiceAnalysis[]>;
  getStaffAnalysis(): Promise<StaffAnalysis[]>;
  getOwnerProfilePosts(): Promise<OwnerProfilePost[]>;
  updateOwnerProfilePost(postId: string, updates: Partial<OwnerProfilePost>): Promise<OwnerProfilePost>;
  getOwnerProfile(): Promise<{ name: string; handle: string; bio: string }>;
  updateOwnerProfile(updates: Partial<{ name: string; handle: string; bio: string }>): Promise<{ name: string; handle: string; bio: string }>;
  getCustomerReviews(): Promise<CustomerReview[]>;
  replyToReview(reviewId: number, reply: string): Promise<boolean>;
  getRevenueTrendData(): Promise<RevenueTrendData>;
  
  // Marketing Campaign APIs
  getActiveMarketingCampaigns(): Promise<MarketingCampaign[]>;
  getAllMarketingCampaigns(): Promise<MarketingCampaign[]>;
  getMarketingCampaignById(campaignId: string): Promise<MarketingCampaign | null>;
  getActiveCampaignSummary(): Promise<{
    activeCampaigns: number;
    totalRevenue: number;
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    currentCampaign: MarketingCampaign | null;
  }>;
  createMarketingCampaign(campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'clicks' | 'conversions' | 'revenue' | 'spent'>): Promise<MarketingCampaign>;
  updateMarketingCampaign(campaignId: string, updates: Partial<MarketingCampaign>): Promise<MarketingCampaign>;
  deleteMarketingCampaign(campaignId: string): Promise<boolean>;
  updateCampaignStatus(campaignId: string, status: 'active' | 'paused' | 'completed' | 'draft'): Promise<boolean>;
  trackCampaignEvent(campaignId: string, eventType: 'view' | 'click' | 'conversion', customerId?: string, appointmentId?: string, revenue?: number): Promise<boolean>;
  incrementCampaignViews(campaignId: string): Promise<boolean>;
  incrementCampaignClicks(campaignId: string): Promise<boolean>;
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

const simulateNetworkDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ===========================================
// MOCK API IMPLEMENTATION
// ===========================================

export const ownerAPI: OwnerAPI = {
  
  // 🏠 DASHBOARD APIs
  async getBusinessData(period: 'Today' | 'Week' | 'Month' = 'Today'): Promise<OwnerBusinessData> {
    await simulateNetworkDelay(300);
    
    try {
      // Get appointments from repository
      const appointmentsRepo = getAppointmentsRepository();
      const businessId = 'business_001';
      const allAppointments = await appointmentsRepo.listByBusiness(businessId);
      
      // Get reviews for satisfaction calculation (access mock data directly to avoid circular reference)
      const reviews = AppMockData.owner.customerReviews || [];
      
      // Calculate date range based on period
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentStart: Date;
      let currentEnd: Date = new Date(today);
      currentEnd.setHours(23, 59, 59, 999);
      
      let previousStart: Date;
      let previousEnd: Date;
      
      switch (period) {
        case 'Today':
          currentStart = new Date(today);
          previousEnd = new Date(today);
          previousEnd.setDate(previousEnd.getDate() - 1);
          previousEnd.setHours(23, 59, 59, 999);
          previousStart = new Date(previousEnd);
          previousStart.setHours(0, 0, 0, 0);
          break;
        case 'Week':
          // Current week (Monday to Sunday)
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
          currentStart = new Date(today);
          currentStart.setDate(diff);
          currentStart.setHours(0, 0, 0, 0);
          // Week end (Sunday)
          currentEnd = new Date(currentStart);
          currentEnd.setDate(currentEnd.getDate() + 6);
          currentEnd.setHours(23, 59, 59, 999);
          // Previous week
          previousEnd = new Date(currentStart);
          previousEnd.setDate(previousEnd.getDate() - 1);
          previousEnd.setHours(23, 59, 59, 999);
          previousStart = new Date(previousEnd);
          previousStart.setDate(previousStart.getDate() - 6);
          previousStart.setHours(0, 0, 0, 0);
          break;
        case 'Month':
          currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
          currentEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          currentEnd.setHours(23, 59, 59, 999);
          // Previous month
          previousEnd = new Date(currentStart);
          previousEnd.setDate(previousEnd.getDate() - 1);
          previousEnd.setHours(23, 59, 59, 999);
          previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1);
          break;
        default:
          currentStart = new Date(today);
      }
      
      // Filter appointments for current and previous periods
      const currentAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        return aptDate >= currentStart && aptDate <= currentEnd;
      });
      
      const previousAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        return aptDate >= previousStart && aptDate <= previousEnd;
      });
      
      // Calculate current period metrics
      const currentCompleted = currentAppointments.filter(apt => apt.status === 'completed');
      const currentRevenue = currentCompleted.reduce((sum, apt) => sum + (apt.price || 0), 0);
      const currentAppointmentCount = currentAppointments.length;
      const currentUniqueCustomers = new Set(currentAppointments.map(apt => apt.customerId)).size;
      
      // Calculate satisfaction from reviews (average rating)
      const currentReviews = reviews.filter(review => {
        // Filter reviews for current period if possible
        // For now, use all reviews to calculate average
        return true;
      });
      const currentSatisfaction = currentReviews.length > 0
        ? currentReviews.reduce((sum, review) => sum + review.rating, 0) / currentReviews.length
        : 0;
      
      // Calculate staff utilization (from approved schedules - access mock data directly)
      const todayStr = today.toISOString().split('T')[0];
      const schedules = (AppMockData.owner.approvedSchedules || []).filter(s => s.date === todayStr);
      const totalAvailableHours = schedules.reduce((sum, sched) => {
        const startHour = parseInt(sched.startTime.split(':')[0]);
        const endHour = parseInt(sched.endTime.split(':')[0]);
        return sum + (endHour - startHour);
      }, 0);
      const bookedHours = currentAppointments.filter(apt => 
        apt.status !== 'cancelled' && apt.status !== 'no-show'
      ).length * 0.5; // Assume 0.5 hours per appointment average
      const currentStaffUtilization = totalAvailableHours > 0
        ? Math.round((bookedHours / totalAvailableHours) * 100)
        : 0;
      
      // Calculate previous period metrics
      const previousCompleted = previousAppointments.filter(apt => apt.status === 'completed');
      const previousRevenue = previousCompleted.reduce((sum, apt) => sum + (apt.price || 0), 0);
      const previousAppointmentCount = previousAppointments.length;
      const previousUniqueCustomers = new Set(previousAppointments.map(apt => apt.customerId)).size;
      
      const previousReviews = reviews; // Use same reviews for now
      const previousSatisfaction = previousReviews.length > 0
        ? previousReviews.reduce((sum, review) => sum + review.rating, 0) / previousReviews.length
        : 0;
      
      // Previous staff utilization (simplified - same calculation)
      const previousStaffUtilization = currentStaffUtilization * 0.9; // Estimate
      
      return {
        today: {
          revenue: Math.round(currentRevenue * 100) / 100,
          appointments: currentAppointmentCount,
          customers: currentUniqueCustomers,
          satisfaction: Math.round(currentSatisfaction * 10) / 10,
          staffUtilization: currentStaffUtilization
        },
        yesterday: {
          revenue: Math.round(previousRevenue * 100) / 100,
          appointments: previousAppointmentCount,
          customers: previousUniqueCustomers,
          satisfaction: Math.round(previousSatisfaction * 10) / 10,
          staffUtilization: previousStaffUtilization
        }
      };
    } catch (error) {
      console.error('Error calculating business data:', error);
      // Fallback to mock data on error
    return AppMockData.owner.businessData;
    }
  },

  async getScheduleData(date?: string): Promise<OwnerScheduleData[]> {
    await simulateNetworkDelay(200);
    
    try {
      // Get appointments from repository
      const appointmentsRepo = getAppointmentsRepository();
      const businessId = 'business_001';
      const allAppointments = await appointmentsRepo.listByBusiness(businessId);
      
      // Use provided date or today
      const targetDate = date ? new Date(date + 'T00:00:00') : new Date();
      targetDate.setHours(0, 0, 0, 0);
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      // Filter appointments for the target date
      const dayAppointments = allAppointments.filter(apt => apt.date === targetDateStr);
      
      // Filter out cancelled and no-show appointments
      const activeAppointments = dayAppointments.filter(apt => 
        !['cancelled', 'no-show'].includes(apt.status)
      );
      
      // Sort by start time
      activeAppointments.sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        return minutesA - minutesB;
      });
      
      // Convert to schedule data format
      const scheduleData: OwnerScheduleData[] = activeAppointments.map(apt => {
        // Format time to 12-hour format
        const [hours, minutes] = apt.startTime.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        
        return {
          time: timeStr,
          customer: apt.customerName || 'Unknown Customer',
          service: apt.serviceName || 'Unknown Service',
          staff: apt.employeeName || 'Unknown Staff'
        };
      });
      
      return scheduleData.length > 0 ? scheduleData : [];
    } catch (error) {
      console.error('Error calculating schedule data:', error);
      // Fallback to mock data on error
    return AppMockData.owner.scheduleData;
    }
  },

  async getAnalytics(): Promise<OwnerAnalytics> {
    await simulateNetworkDelay(400);
    return AppMockData.owner.analytics;
  },

  // 👥 STAFF MANAGEMENT APIs
  async getStaffMembers(): Promise<OwnerStaffMember[]> {
    await simulateNetworkDelay(250);
    return AppMockData.owner.staffMembers;
  },

  async addStaffMember(staff: Omit<OwnerStaffMember, 'id'>): Promise<OwnerStaffMember> {
    await simulateNetworkDelay(300);
    
    // Generate sequential ID (better than timestamp for Supabase compatibility)
    const maxId = AppMockData.owner.staffMembers.length > 0
      ? Math.max(...AppMockData.owner.staffMembers.map(s => s.id))
      : 0;
    const newId = maxId + 1;
    
    const newStaff: OwnerStaffMember = {
      ...staff,
      id: newId,
    };
    AppMockData.owner.staffMembers.push(newStaff);
    return newStaff;
  },

  async updateStaffMember(id: number, updates: Partial<OwnerStaffMember>): Promise<OwnerStaffMember> {
    await simulateNetworkDelay(200);
    const index = AppMockData.owner.staffMembers.findIndex(staff => staff.id === id);
    if (index === -1) {
      throw new Error('Staff member not found');
    }
    AppMockData.owner.staffMembers[index] = { ...AppMockData.owner.staffMembers[index], ...updates };
    return AppMockData.owner.staffMembers[index];
  },

  async deleteStaffMember(id: number): Promise<boolean> {
    await simulateNetworkDelay(200);
    const index = AppMockData.owner.staffMembers.findIndex(staff => staff.id === id);
    if (index === -1) {
      return false;
    }
    AppMockData.owner.staffMembers.splice(index, 1);
    return true;
  },

  // 👤 CUSTOMER MANAGEMENT APIs
  async getCustomers(): Promise<OwnerCustomer[]> {
    await simulateNetworkDelay(300);
    return AppMockData.owner.customers;
  },

  async getCustomerDetails(customerId: string): Promise<OwnerCustomer> {
    await simulateNetworkDelay(200);
    const customer = AppMockData.owner.customers.find(c => c.id === customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  },

  // 💰 REVENUE & ANALYTICS APIs
  async getRevenueData(): Promise<OwnerRevenue> {
    await simulateNetworkDelay(350);
    return AppMockData.owner.revenueData;
  },

  async getReports(): Promise<OwnerReport[]> {
    await simulateNetworkDelay(400);
    return AppMockData.owner.reports;
  },

  // 🔔 NOTIFICATION APIs
  async getNotifications(): Promise<OwnerNotification[]> {
    await simulateNetworkDelay(200);
    
    // Try Supabase backend first if available
    try {
      const { supabaseClient } = await import('../../services/supabase/SupabaseConfig');
      
      // Note: In a real implementation, we'd need to get the user from context
      // For now, we'll use the mock data as fallback
      if (supabaseClient && false) { // Disabled for now, needs proper user context
        // Supabase query would go here
        // const { data, error } = await supabaseClient
        //   .from('notifications')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .or('user_type.eq.owner,user_type.is.null')
        //   .order('created_at', { ascending: false });
        // if (!error && data) {
        //   return data.map(transformNotification);
        // }
      }
    } catch (error) {
      // Supabase not available, use mock data
    }
    
    // Fallback to mock data
    return AppMockData.owner.notifications;
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    await simulateNetworkDelay(100);
    
    // Try Supabase backend first if available
    try {
      const { supabaseClient } = await import('../../services/supabase/SupabaseConfig');
      
      if (supabaseClient && false) { // Disabled for now, needs proper user context
        // Supabase update would go here
        // const { error } = await supabaseClient
        //   .from('notifications')
        //   .update({ read_at: new Date().toISOString() })
        //   .eq('id', id)
        //   .eq('user_id', userId);
        // if (!error) return true;
      }
    } catch (error) {
      // Supabase not available, use mock data
    }
    
    // Fallback to mock data
    const notification = AppMockData.owner.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      return true;
    }
    return false;
  },

  async markAllNotificationsAsRead(): Promise<boolean> {
    await simulateNetworkDelay(150);
    
    // Try Supabase backend first if available
    try {
      const { supabaseClient } = await import('../../services/supabase/SupabaseConfig');
      
      if (supabaseClient && false) { // Disabled for now, needs proper user context
        // Supabase update would go here
        // const { error } = await supabaseClient
        //   .from('notifications')
        //   .update({ read_at: new Date().toISOString() })
        //   .eq('user_id', userId)
        //   .is('read_at', null);
        // if (!error) return true;
      }
    } catch (error) {
      // Supabase not available, use mock data
    }
    
    // Fallback to mock data
    AppMockData.owner.notifications.forEach(notification => {
      notification.isRead = true;
    });
    return true;
  },

  // Notification Settings APIs
  async getNotificationSettings(): Promise<OwnerNotificationSettings> {
    await simulateNetworkDelay(300);
    return AppMockData.owner.ownerNotificationSettings;
  },

  async updateNotificationSettings(
    settings: Partial<OwnerNotificationSettings>
  ): Promise<OwnerNotificationSettings> {
    await simulateNetworkDelay(300);
    
    const current = AppMockData.owner.ownerNotificationSettings;
    
    // Update all provided settings
    Object.keys(settings).forEach(key => {
      if (key !== 'businessId' && key !== 'updatedAt') {
        (current as any)[key] = (settings as any)[key];
      }
    });
    
    current.updatedAt = new Date().toISOString();
    
    return current;
  },

  // ⚙️ SETTINGS APIs
  async getBusinessSettings(): Promise<any> {
    await simulateNetworkDelay(200);
    return AppMockData.owner.businessSettings;
  },

  async updateBusinessSettings(settings: any): Promise<any> {
    await simulateNetworkDelay(300);
    AppMockData.owner.businessSettings = { ...AppMockData.owner.businessSettings, ...settings };
    return AppMockData.owner.businessSettings;
  },

  // 💰 PAYROLL APIs
  async getEmployeePayrolls(): Promise<EmployeePayroll[]> {
    await simulateNetworkDelay(400);
    return AppMockData.owner.employeePayrolls;
  },

  async updatePayrollStatus(id: string, status: 'approved' | 'pending'): Promise<boolean> {
    await simulateNetworkDelay(300);
    const payroll = AppMockData.owner.employeePayrolls.find(p => p.id === id);
    if (payroll) {
      payroll.status = status;
      return true;
    }
    return false;
  },

  // 📊 REVENUE ANALYTICS APIs
  async getRevenueDataByPeriod(period: 'day' | 'week' | 'month' | 'year'): Promise<RevenueData> {
    await simulateNetworkDelay(300);
    
    try {
      // Get appointments from repository
      const appointmentsRepo = getAppointmentsRepository();
      const businessId = 'business_001'; // Default business ID - in real app, get from auth context
      const allAppointments = await appointmentsRepo.listByBusiness(businessId);
      
      // Calculate date range for the period
      const { start, end } = getPeriodDateRange(period);
      
      // Filter appointments by period
      const periodAppointments = allAppointments.filter(apt => {
        return isDateInRange(apt.date, start, end);
      });
      
      // Calculate completed appointments revenue
      const completedAppointments = periodAppointments.filter(apt => apt.status === 'completed');
      const totalRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
      
      // Calculate expenses (using 28% expense ratio - can be made configurable)
      const expenseRatio = 0.28;
      const expenses = totalRevenue * expenseRatio;
      const netProfit = totalRevenue - expenses;
      const grossMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      // Calculate outstanding payments (pending, confirmed, checked-in appointments)
      const outstandingAppointments = periodAppointments.filter(apt => 
        ['pending', 'confirmed', 'checked-in', 'in-service'].includes(apt.status)
      );
      const outstandingPayments = outstandingAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
      
      // Calculate average transaction value
      const uniqueCustomers = new Set(completedAppointments.map(apt => apt.customerId));
      const customersServed = uniqueCustomers.size;
      const avgTransactionValue = customersServed > 0 ? totalRevenue / customersServed : 0;
      
      // Calculate future bookings value (appointments after the period end)
      const futureAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        return aptDate > end && ['confirmed', 'pending'].includes(apt.status);
      });
      const futureBookingsValue = futureAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
      
      // Calculate recurring revenue (customers with multiple appointments in the period)
      const customerAppointmentCount = new Map<string, number>();
      completedAppointments.forEach(apt => {
        const count = customerAppointmentCount.get(apt.customerId) || 0;
        customerAppointmentCount.set(apt.customerId, count + 1);
      });
      const recurringCustomers = Array.from(customerAppointmentCount.entries())
        .filter(([_, count]) => count > 1);
      const recurringRevenue = recurringCustomers.reduce((sum, [customerId]) => {
        const customerRevenue = completedAppointments
          .filter(apt => apt.customerId === customerId)
          .reduce((s, apt) => s + (apt.price || 0), 0);
        return sum + customerRevenue;
      }, 0);
      
      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        netProfit: Math.round(netProfit * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        grossMargin: Math.round(grossMargin * 100) / 100,
        outstandingPayments: Math.round(outstandingPayments * 100) / 100,
        avgTransactionValue: Math.round(avgTransactionValue * 100) / 100,
        customersServed,
        revenuePerCustomer: Math.round(avgTransactionValue * 100) / 100,
        futureBookingsValue: Math.round(futureBookingsValue * 100) / 100,
        recurringRevenue: Math.round(recurringRevenue * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating revenue data:', error);
      // Fallback to mock data if calculation fails
    return AppMockData.owner.revenueDataByPeriod[period];
    }
  },

  async getServiceRevenue(period?: { start: Date; end: Date }, serviceFilter?: string): Promise<ServiceRevenue[]> {
    await simulateNetworkDelay(250);
    
    try {
      // Get appointments from repository
      const appointmentsRepo = getAppointmentsRepository();
      const businessId = 'business_001';
      let allAppointments = await appointmentsRepo.listByBusiness(businessId);
      
      // Enrich appointments with service/employee names if missing
      const { TempDB } = await import('../../data/TemporaryDatabase');
      allAppointments = allAppointments.map(apt => {
        if (!apt.serviceName && apt.serviceId) {
          const service = TempDB.getServiceById(apt.serviceId);
          apt.serviceName = service?.name || 'Unknown Service';
        }
        if (!apt.employeeName && apt.employeeId) {
          const employee = TempDB.getEmployeeById(apt.employeeId);
          apt.employeeName = employee?.name || 'Unknown Employee';
        }
        return apt;
      });
      
      // Filter by period if provided
      if (period) {
        allAppointments = allAppointments.filter(apt => {
          return isDateInRange(apt.date, period.start, period.end);
        });
      }
      
      // Filter by service if provided
      if (serviceFilter && serviceFilter !== 'all') {
        allAppointments = allAppointments.filter(apt => apt.serviceName === serviceFilter);
      }
      
      // Calculate revenue by service
      const serviceRevenueMap = new Map<string, { revenue: number; count: number }>();
      
      const completedAppointments = allAppointments.filter(apt => apt.status === 'completed');
      completedAppointments.forEach(apt => {
        const serviceName = apt.serviceName || 'Unknown Service';
        const current = serviceRevenueMap.get(serviceName) || { revenue: 0, count: 0 };
        serviceRevenueMap.set(serviceName, {
          revenue: current.revenue + (apt.price || 0),
          count: current.count + 1
        });
      });
      
      // Calculate total revenue for percentage calculation
      const totalRevenue = Array.from(serviceRevenueMap.values())
        .reduce((sum, s) => sum + s.revenue, 0);
      
      // Convert to ServiceRevenue array
      const serviceColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#F44336', '#00BCD4', '#FF5722'];
      const serviceRevenue: ServiceRevenue[] = Array.from(serviceRevenueMap.entries()).map(([name, data], index) => ({
        name,
        revenue: Math.round(data.revenue * 100) / 100,
        percentage: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0,
        color: serviceColors[index % serviceColors.length]
      }));
      
      // Sort by revenue descending
      serviceRevenue.sort((a, b) => b.revenue - a.revenue);
      
      // Always return calculated data (even if empty) - never fall back to mock data
      // Empty array means no revenue in the period, which is accurate
      return serviceRevenue;
    } catch (error) {
      console.error('Error calculating service revenue:', error);
      // Only fall back to mock data on actual errors
    return AppMockData.owner.serviceRevenue;
    }
  },

  async getEmployeeRevenue(period?: { start: Date; end: Date }, employeeFilter?: string): Promise<EmployeeRevenue[]> {
    await simulateNetworkDelay(250);
    
    try {
      // Get appointments from repository
      const appointmentsRepo = getAppointmentsRepository();
      const businessId = 'business_001';
      let allAppointments = await appointmentsRepo.listByBusiness(businessId);
      
      // Enrich appointments with service/employee names if missing
      const { TempDB } = await import('../../data/TemporaryDatabase');
      allAppointments = allAppointments.map(apt => {
        if (!apt.serviceName && apt.serviceId) {
          const service = TempDB.getServiceById(apt.serviceId);
          apt.serviceName = service?.name || 'Unknown Service';
        }
        if (!apt.employeeName && apt.employeeId) {
          const employee = TempDB.getEmployeeById(apt.employeeId);
          apt.employeeName = employee?.name || 'Unknown Employee';
        }
        return apt;
      });
      
      // Filter by period if provided
      if (period) {
        allAppointments = allAppointments.filter(apt => {
          return isDateInRange(apt.date, period.start, period.end);
        });
      }
      
      // Filter by employee if provided
      if (employeeFilter && employeeFilter !== 'all') {
        allAppointments = allAppointments.filter(apt => apt.employeeName === employeeFilter);
      }
      
      // Calculate revenue by employee
      const employeeRevenueMap = new Map<string, { revenue: number; customers: Set<string> }>();
      
      const completedAppointments = allAppointments.filter(apt => apt.status === 'completed');
      completedAppointments.forEach(apt => {
        const employeeName = apt.employeeName || 'Unknown Employee';
        const current = employeeRevenueMap.get(employeeName) || { revenue: 0, customers: new Set<string>() };
        current.revenue += apt.price || 0;
        current.customers.add(apt.customerId);
        employeeRevenueMap.set(employeeName, current);
      });
      
      // Convert to EmployeeRevenue array
      const employeeRevenue: EmployeeRevenue[] = Array.from(employeeRevenueMap.entries()).map(([name, data]) => {
        // Get employee avatar/initials
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        return {
          name,
          revenue: Math.round(data.revenue * 100) / 100,
          customers: data.customers.size,
          avatar: initials
        };
      });
      
      // Sort by revenue descending
      employeeRevenue.sort((a, b) => b.revenue - a.revenue);
      
      // Always return calculated data (even if empty) - never fall back to mock data
      // Empty array means no revenue in the period, which is accurate
      return employeeRevenue;
    } catch (error) {
      console.error('Error calculating employee revenue:', error);
      // Only fall back to mock data on actual errors
    return AppMockData.owner.employeeRevenue;
    }
  },

  async getTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
    await simulateNetworkDelay(200);
    
    try {
      // Get appointments from repository
      const appointmentsRepo = getAppointmentsRepository();
      const businessId = 'business_001';
      const allAppointments = await appointmentsRepo.listByBusiness(businessId);
      
      // Filter completed appointments
      const completedAppointments = allAppointments.filter(apt => apt.status === 'completed');
      
      // Group by customer and calculate metrics
      const customerMap = new Map<string, {
        name: string;
        totalSpent: number;
        visits: number;
        lastVisitDate: Date;
        customerId: string;
      }>();
      
      completedAppointments.forEach(apt => {
        const customerId = apt.customerId;
        const customerName = apt.customerName || 'Unknown Customer';
        
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            name: customerName,
            totalSpent: 0,
            visits: 0,
            lastVisitDate: new Date(0), // Initialize to epoch
            customerId
          });
        }
        
        const customer = customerMap.get(customerId)!;
        customer.totalSpent += apt.price || 0;
        customer.visits += 1;
        
        // Update last visit date if this appointment is more recent
        const aptDate = new Date(apt.date + 'T00:00:00');
        if (aptDate > customer.lastVisitDate) {
          customer.lastVisitDate = aptDate;
        }
      });
      
      // Convert to TopCustomer array and format dates
      const topCustomers: TopCustomer[] = Array.from(customerMap.values()).map(customer => {
        // Format last visit date
        const lastVisitDate = customer.lastVisitDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let lastVisit = '';
        if (lastVisitDate.getTime() === 0) {
          lastVisit = 'Never';
        } else {
          const daysDiff = Math.floor((today.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 0) {
            lastVisit = 'Today';
          } else if (daysDiff === 1) {
            lastVisit = 'Yesterday';
          } else if (daysDiff < 7) {
            lastVisit = `${daysDiff} days ago`;
          } else if (daysDiff < 30) {
            const weeks = Math.floor(daysDiff / 7);
            lastVisit = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
          } else {
            lastVisit = lastVisitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          }
        }
        
        // Generate avatar initials
        const initials = customer.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        
        return {
          name: customer.name,
          totalSpent: Math.round(customer.totalSpent * 100) / 100,
          visits: customer.visits,
          lastVisit,
          avatar: initials
        };
      });
      
      // Sort by total spent (descending) and limit
      topCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
      return topCustomers.slice(0, limit);
    } catch (error) {
      console.error('Error calculating top customers:', error);
      // Fallback to mock data if calculation fails
    return AppMockData.owner.topCustomers;
    }
  },

  // 📊 CLIENT APPOINTMENT ANALYSIS APIs
  async getClientAppointments(): Promise<ClientAppointment[]> {
    await simulateNetworkDelay(300);
    return AppMockData.owner.clientAppointments;
  },

  async getClientAnalysis(): Promise<ClientAnalysis[]> {
    await simulateNetworkDelay(300);
    return AppMockData.owner.clientAnalysis;
  },

  async getServiceAnalysis(): Promise<ServiceAnalysis[]> {
    await simulateNetworkDelay(250);
    return AppMockData.owner.serviceAnalysis;
  },

  async getStaffAnalysis(): Promise<StaffAnalysis[]> {
    await simulateNetworkDelay(250);
    return AppMockData.owner.staffAnalysis;
  },

  async getOwnerProfilePosts(): Promise<OwnerProfilePost[]> {
    await simulateNetworkDelay(250);
    return AppMockData.owner.ownerProfilePosts;
  },

  async updateOwnerProfilePost(postId: string, updates: Partial<OwnerProfilePost>): Promise<OwnerProfilePost> {
    await simulateNetworkDelay(300);
    const postIndex = AppMockData.owner.ownerProfilePosts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    AppMockData.owner.ownerProfilePosts[postIndex] = {
      ...AppMockData.owner.ownerProfilePosts[postIndex],
      ...updates,
    };
    return AppMockData.owner.ownerProfilePosts[postIndex];
  },

  async getOwnerProfile(): Promise<{ name: string; handle: string; bio: string }> {
    await simulateNetworkDelay(200);
    
    // Try Supabase backend first if available
    try {
      const { supabaseClient } = await import('../../services/supabase/SupabaseConfig');
      
      // Note: In a real implementation, we'd need to get the user from context
      // For now, we'll use the mock data as fallback
      if (supabaseClient && false) { // Disabled for now, needs proper user context
        // Supabase query would go here
        // const { data, error } = await supabaseClient
        //   .from('profiles')
        //   .select('full_name, username, bio')
        //   .eq('user_id', userId)
        //   .single();
        // if (!error && data) {
        //   return {
        //     name: data.full_name || '',
        //     handle: data.username ? `@${data.username}` : '',
        //     bio: data.bio || '',
        //   };
        // }
      }
    } catch (error) {
      // Supabase not available, use mock data
    }
    
    // Fallback to mock data
    const profile = AppMockData.owner.ownerProfile || {
      name: "Man's Cave Salon",
      handle: "@manscave_salon",
      bio: "Premium men's hair salon specializing in modern cuts and styling. Book your appointment today!",
    };
    return {
      name: profile.name,
      handle: profile.handle,
      bio: profile.bio,
    };
  },

  async updateOwnerProfile(updates: Partial<{ name: string; handle: string; bio: string }>): Promise<{ name: string; handle: string; bio: string }> {
    await simulateNetworkDelay(300);
    
    // Try Supabase backend first if available
    try {
      const { supabaseClient } = await import('../../services/supabase/SupabaseConfig');
      const { useAuth } = await import('../../contexts/AuthContext');
      
      // Note: In a real implementation, we'd need to get the user from context
      // For now, we'll use the mock data as fallback
      if (supabaseClient && false) { // Disabled for now, needs proper user context
        // Supabase update would go here
        // const { data, error } = await supabaseClient
        //   .from('profiles')
        //   .update({ ... })
        //   .eq('user_id', userId);
      }
    } catch (error) {
      // Supabase not available, use mock data
    }
    
    // Fallback to mock data
    if (!AppMockData.owner.ownerProfile) {
      AppMockData.owner.ownerProfile = {
        name: "Man's Cave Salon",
        handle: "@manscave_salon",
        bio: "Premium men's hair salon specializing in modern cuts and styling. Book your appointment today!",
        updatedAt: new Date().toISOString(),
      };
    }
    // Only update fields that are actually provided
    if (updates.name !== undefined) {
      AppMockData.owner.ownerProfile.name = updates.name;
    }
    if (updates.handle !== undefined) {
      AppMockData.owner.ownerProfile.handle = updates.handle;
    }
    if (updates.bio !== undefined) {
      AppMockData.owner.ownerProfile.bio = updates.bio;
    }
    AppMockData.owner.ownerProfile.updatedAt = new Date().toISOString();
    
    return {
      name: AppMockData.owner.ownerProfile.name,
      handle: AppMockData.owner.ownerProfile.handle,
      bio: AppMockData.owner.ownerProfile.bio,
    };
  },

  // 📅 SCHEDULE MANAGEMENT APIs
  async getScheduleRequests(): Promise<StaffScheduleRequest[]> {
    await simulateNetworkDelay(200);
    return AppMockData.owner.scheduleRequests || [];
  },

  async getApprovedSchedules(date?: string): Promise<ApprovedStaffSchedule[]> {
    await simulateNetworkDelay(200);
    const schedules = AppMockData.owner.approvedSchedules || [];
    if (date) {
      return schedules.filter(s => s.date === date);
    }
    return schedules;
  },

  async createSchedule(schedule: Omit<ApprovedStaffSchedule, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ApprovedStaffSchedule> {
    await simulateNetworkDelay(300);
    const newSchedule: ApprovedStaffSchedule = {
      ...schedule,
      id: `schedule-${Date.now()}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!AppMockData.owner.approvedSchedules) {
      AppMockData.owner.approvedSchedules = [];
    }
    AppMockData.owner.approvedSchedules.push(newSchedule);
    return newSchedule;
  },

  async updateSchedule(id: string, updates: Partial<ApprovedStaffSchedule>): Promise<ApprovedStaffSchedule> {
    await simulateNetworkDelay(300);
    if (!AppMockData.owner.approvedSchedules) {
      AppMockData.owner.approvedSchedules = [];
    }
    const index = AppMockData.owner.approvedSchedules.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Schedule not found');
    }
    AppMockData.owner.approvedSchedules[index] = {
      ...AppMockData.owner.approvedSchedules[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return AppMockData.owner.approvedSchedules[index];
  },

  async deleteSchedule(id: string): Promise<boolean> {
    await simulateNetworkDelay(200);
    if (!AppMockData.owner.approvedSchedules) {
      return false;
    }
    const index = AppMockData.owner.approvedSchedules.findIndex(s => s.id === id);
    if (index === -1) {
      return false;
    }
    AppMockData.owner.approvedSchedules.splice(index, 1);
    return true;
  },

  async approveScheduleRequest(requestId: string, modifications?: Partial<StaffScheduleRequest>): Promise<ApprovedStaffSchedule> {
    await simulateNetworkDelay(300);
    if (!AppMockData.owner.scheduleRequests) {
      throw new Error('Schedule request not found');
    }
    const request = AppMockData.owner.scheduleRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error('Schedule request not found');
    }
    
    // Update request status
    request.status = modifications ? 'modified' : 'approved';
    request.approvedAt = new Date().toISOString();
    
    // Create approved schedule
    const approvedSchedule: ApprovedStaffSchedule = {
      id: `schedule-${Date.now()}`,
      staffId: request.staffId,
      date: modifications?.date || request.date,
      startTime: modifications?.startTime || request.startTime,
      endTime: modifications?.endTime || request.endTime,
      status: 'scheduled',
      notes: modifications?.notes || request.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (!AppMockData.owner.approvedSchedules) {
      AppMockData.owner.approvedSchedules = [];
    }
    AppMockData.owner.approvedSchedules.push(approvedSchedule);
    return approvedSchedule;
  },

  async rejectScheduleRequest(requestId: string, reason?: string): Promise<boolean> {
    await simulateNetworkDelay(200);
    if (!AppMockData.owner.scheduleRequests) {
      return false;
    }
    const request = AppMockData.owner.scheduleRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'rejected';
      if (reason) {
        request.notes = reason;
      }
      return true;
    }
    return false;
  },

  // 📅 TIME OFF REQUEST APIs
  async getTimeOffRequests(): Promise<EmployeeTimeOffRequest[]> {
    await simulateNetworkDelay(200);
    if (!AppMockData.owner.timeOffRequests) {
      return [];
    }
    return AppMockData.owner.timeOffRequests;
  },

  async approveTimeOffRequest(requestId: string): Promise<boolean> {
    await simulateNetworkDelay(300);
    if (!AppMockData.owner.timeOffRequests) {
      return false;
    }
    const request = AppMockData.owner.timeOffRequests.find((r: any) => r.id === requestId);
    if (request) {
      request.status = 'approved';
      request.updatedAt = new Date().toISOString();
      
      // Also update in employee's timeOffRequests (shared storage)
      if (AppMockData.employee.timeOffRequests) {
        const employeeRequest = AppMockData.employee.timeOffRequests.find((r: any) => r.id === requestId);
        if (employeeRequest) {
          employeeRequest.status = 'approved';
          employeeRequest.updatedAt = request.updatedAt;
        }
      }
      
      return true;
    }
    return false;
  },

  async rejectTimeOffRequest(requestId: string, reason?: string): Promise<boolean> {
    await simulateNetworkDelay(200);
    if (!AppMockData.owner.timeOffRequests) {
      return false;
    }
    const request = AppMockData.owner.timeOffRequests.find((r: any) => r.id === requestId);
    if (request) {
      request.status = 'rejected';
      if (reason) {
        request.notes = reason;
      }
      request.updatedAt = new Date().toISOString();
      
      // Also update in employee's timeOffRequests (shared storage)
      if (AppMockData.employee.timeOffRequests) {
        const employeeRequest = AppMockData.employee.timeOffRequests.find((r: any) => r.id === requestId);
        if (employeeRequest) {
          employeeRequest.status = 'rejected';
          employeeRequest.updatedAt = request.updatedAt;
          if (reason) {
            employeeRequest.notes = reason;
          }
        }
      }
      
      return true;
    }
    return false;
  },

  async getCustomerReviews(): Promise<CustomerReview[]> {
    await simulateNetworkDelay(250);
    return AppMockData.owner.customerReviews;
  },

  async replyToReview(reviewId: number, reply: string): Promise<boolean> {
    await simulateNetworkDelay(300);
    const review = AppMockData.owner.customerReviews.find(r => r.id === reviewId);
    if (review) {
      review.ownerReply = reply;
      review.ownerReplyDate = new Date().toISOString();
      return true;
    }
    return false;
  },

  async getRevenueTrendData(): Promise<RevenueTrendData> {
    await simulateNetworkDelay(250);
    
    try {
      // Get appointments from repository
      const appointmentsRepo = getAppointmentsRepository();
      const businessId = 'business_001';
      const allAppointments = await appointmentsRepo.listByBusiness(businessId);
      
      // Filter completed appointments
      const completedAppointments = allAppointments.filter(apt => apt.status === 'completed');
      
      // Calculate monthly revenue for last 12 months
      const today = new Date();
      const monthlyRevenue: number[] = [];
      
      for (let i = 11; i >= 0; i--) {
        // Get month date range (from first day to last day of the month)
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        // Filter appointments for this month
        const monthAppointments = completedAppointments.filter(apt => {
          const aptDate = new Date(apt.date + 'T00:00:00');
          return aptDate >= monthStart && aptDate <= monthEnd;
        });
        
        // Calculate revenue for this month
        const monthRevenue = monthAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
        monthlyRevenue.push(Math.round(monthRevenue * 100) / 100);
      }
      
      // Calculate current year revenue (last 12 months total)
      const currentYearRevenue = monthlyRevenue.reduce((sum, revenue) => sum + revenue, 0);
      
      // Calculate previous year revenue (months 13-24 months ago)
      const previousYearMonthlyRevenue: number[] = [];
      
      for (let i = 23; i >= 12; i--) {
        // Get month date range for previous year
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        // Filter appointments for this month
        const monthAppointments = completedAppointments.filter(apt => {
          const aptDate = new Date(apt.date + 'T00:00:00');
          return aptDate >= monthStart && aptDate <= monthEnd;
        });
        
        // Calculate revenue for this month
        const monthRevenue = monthAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
        previousYearMonthlyRevenue.push(Math.round(monthRevenue * 100) / 100);
      }
      
      // Calculate previous year total revenue
      const previousYearRevenue = previousYearMonthlyRevenue.reduce((sum, revenue) => sum + revenue, 0);
      
      // If we don't have enough historical data, estimate based on current year growth
      let finalPreviousYearRevenue = previousYearRevenue;
      if (previousYearRevenue === 0 && monthlyRevenue.length > 0) {
        // Estimate: assume first month of current year is similar to average of previous year
        const firstMonthRevenue = monthlyRevenue[0] || 0;
        finalPreviousYearRevenue = firstMonthRevenue * 12; // Simple estimation
      }
      
      // Calculate year-over-year change
      const yearOverYearChange = finalPreviousYearRevenue > 0
        ? (((currentYearRevenue - finalPreviousYearRevenue) / finalPreviousYearRevenue) * 100).toFixed(1)
        : '0.0';
      
      return {
        monthlyRevenue,
        periods: [
          { key: 'day', label: 'Today' },
          { key: 'week', label: 'Week' },
          { key: 'month', label: 'Month' },
          { key: 'quarter', label: 'Quarter' },
          { key: 'year', label: 'Year' }
        ],
        currentYearRevenue: Math.round(currentYearRevenue * 100) / 100,
        previousYearRevenue: Math.round(finalPreviousYearRevenue * 100) / 100,
        yearOverYearChange
      };
    } catch (error) {
      console.error('Error calculating revenue trend data:', error);
      // Fallback to mock data if calculation fails
    return AppMockData.owner.revenueTrendData;
    }
  },

  // Marketing Campaign APIs
  async getActiveMarketingCampaigns(): Promise<MarketingCampaign[]> {
    await simulateNetworkDelay(300);
    const today = new Date().toISOString().split('T')[0];
    
    // Return only active campaigns that are within their date range
    return AppMockData.owner.marketingCampaigns.filter(campaign => {
      return campaign.status === 'active' &&
             campaign.startDate <= today &&
             campaign.endDate >= today;
    });
  },

  async getMarketingCampaignById(campaignId: string): Promise<MarketingCampaign | null> {
    await simulateNetworkDelay(200);
    const campaign = AppMockData.owner.marketingCampaigns.find(c => c.id === campaignId);
    return campaign || null;
  },

  async getActiveCampaignSummary(): Promise<{
    activeCampaigns: number;
    totalRevenue: number;
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    currentCampaign: MarketingCampaign | null;
  }> {
    await simulateNetworkDelay(300);
    const activeCampaigns = await this.getActiveMarketingCampaigns();
    
    // Calculate totals
    const totalRevenue = activeCampaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
    const totalViews = activeCampaigns.reduce((sum, campaign) => sum + campaign.views, 0);
    const totalClicks = activeCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
    const totalConversions = activeCampaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
    
    // Get the most recent active campaign (or highest revenue)
    const currentCampaign = activeCampaigns.length > 0
      ? activeCampaigns.reduce((latest, campaign) => {
          return new Date(campaign.updatedAt) > new Date(latest.updatedAt) ? campaign : latest;
        })
      : null;
    
    return {
      activeCampaigns: activeCampaigns.length,
      totalRevenue,
      totalViews,
      totalClicks,
      totalConversions,
      currentCampaign,
    };
  },

  async getAllMarketingCampaigns(): Promise<MarketingCampaign[]> {
    await simulateNetworkDelay(300);
    // Return all campaigns sorted by updatedAt (most recent first)
    return [...AppMockData.owner.marketingCampaigns].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },

  async createMarketingCampaign(campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'clicks' | 'conversions' | 'revenue' | 'spent'>): Promise<MarketingCampaign> {
    await simulateNetworkDelay(400);
    
    // Generate UUID-like ID
    const generateUUID = () => {
      return 'campaign-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    };
    
    const newCampaign: MarketingCampaign = {
      ...campaign,
      id: generateUUID(),
      views: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      spent: 0,
      photos: campaign.photos || [],
      sharePlatforms: campaign.sharePlatforms || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to mock data
    AppMockData.owner.marketingCampaigns.push(newCampaign);
    
    return newCampaign;
  },

  async updateMarketingCampaign(campaignId: string, updates: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
    await simulateNetworkDelay(300);
    
    const index = AppMockData.owner.marketingCampaigns.findIndex(c => c.id === campaignId);
    if (index === -1) {
      throw new Error('Campaign not found');
    }
    
    const updatedCampaign: MarketingCampaign = {
      ...AppMockData.owner.marketingCampaigns[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    AppMockData.owner.marketingCampaigns[index] = updatedCampaign;
    
    return updatedCampaign;
  },

  async deleteMarketingCampaign(campaignId: string): Promise<boolean> {
    await simulateNetworkDelay(300);
    
    const index = AppMockData.owner.marketingCampaigns.findIndex(c => c.id === campaignId);
    if (index === -1) {
      return false;
    }
    
    AppMockData.owner.marketingCampaigns.splice(index, 1);
    return true;
  },

  async updateCampaignStatus(campaignId: string, status: 'active' | 'paused' | 'completed' | 'draft'): Promise<boolean> {
    await simulateNetworkDelay(200);
    
    const campaign = await this.getMarketingCampaignById(campaignId);
    if (!campaign) {
      return false;
    }
    
    await this.updateMarketingCampaign(campaignId, { status });
    return true;
  },

  async trackCampaignEvent(
    campaignId: string, 
    eventType: 'view' | 'click' | 'conversion',
    customerId?: string,
    appointmentId?: string,
    revenue?: number
  ): Promise<boolean> {
    await simulateNetworkDelay(200);
    
    const campaign = await this.getMarketingCampaignById(campaignId);
    if (!campaign) {
      return false;
    }
    
    const updates: Partial<MarketingCampaign> = {
      updatedAt: new Date().toISOString(),
    };
    
    if (eventType === 'view') {
      updates.views = (campaign.views || 0) + 1;
    } else if (eventType === 'click') {
      updates.clicks = (campaign.clicks || 0) + 1;
    } else if (eventType === 'conversion') {
      updates.conversions = (campaign.conversions || 0) + 1;
      if (revenue) {
        updates.revenue = (campaign.revenue || 0) + revenue;
      }
    }
    
    await this.updateMarketingCampaign(campaignId, updates);
    return true;
  },

  async incrementCampaignViews(campaignId: string): Promise<boolean> {
    return await this.trackCampaignEvent(campaignId, 'view');
  },

  async incrementCampaignClicks(campaignId: string): Promise<boolean> {
    return await this.trackCampaignEvent(campaignId, 'click');
  },

  async getBookingPreferences(): Promise<BookingPreferences> {
    await simulateNetworkDelay(200);
    return AppMockData.owner.bookingPreferences;
  },

  async updateBookingPreferences(preferences: Partial<BookingPreferences>): Promise<BookingPreferences> {
    await simulateNetworkDelay(300);
    AppMockData.owner.bookingPreferences = {
      ...AppMockData.owner.bookingPreferences,
      ...preferences,
    };
    return AppMockData.owner.bookingPreferences;
  },

  // Banking APIs
  async getBankAccounts(): Promise<BankAccount[]> {
    await simulateNetworkDelay(200);
    return AppMockData.owner.bankAccounts;
  },

  async addBankAccount(account: Omit<BankAccount, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'isVerified'>): Promise<BankAccount> {
    await simulateNetworkDelay(300);
    const newAccount: BankAccount = {
      id: `bank-${Date.now()}`,
      businessId: 'business_001', // TODO: Get from auth context
      ...account,
      isVerified: false, // New accounts need verification
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // If this is set as primary, unset other primary accounts
    if (account.isPrimary) {
      AppMockData.owner.bankAccounts.forEach(acc => {
        if (acc.isPrimary) acc.isPrimary = false;
      });
    }
    
    AppMockData.owner.bankAccounts.push(newAccount);
    return newAccount;
  },

  async updateBankAccount(accountId: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    await simulateNetworkDelay(300);
    const accountIndex = AppMockData.owner.bankAccounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) {
      throw new Error('Bank account not found');
    }
    
    // If setting as primary, unset other primary accounts
    if (updates.isPrimary) {
      AppMockData.owner.bankAccounts.forEach(acc => {
        if (acc.id !== accountId && acc.isPrimary) acc.isPrimary = false;
      });
    }
    
    AppMockData.owner.bankAccounts[accountIndex] = {
      ...AppMockData.owner.bankAccounts[accountIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    return AppMockData.owner.bankAccounts[accountIndex];
  },

  async deleteBankAccount(accountId: string): Promise<boolean> {
    await simulateNetworkDelay(300);
    const accountIndex = AppMockData.owner.bankAccounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) {
      return false;
    }
    
    // Don't allow deleting primary account if it's the only one
    const account = AppMockData.owner.bankAccounts[accountIndex];
    if (account.isPrimary && AppMockData.owner.bankAccounts.length === 1) {
      throw new Error('Cannot delete the only bank account');
    }
    
    AppMockData.owner.bankAccounts.splice(accountIndex, 1);
    return true;
  },

  async setPrimaryBankAccount(accountId: string): Promise<boolean> {
    await simulateNetworkDelay(300);
    const account = AppMockData.owner.bankAccounts.find(acc => acc.id === accountId);
    if (!account) {
      return false;
    }
    
    // Unset all primary accounts
    AppMockData.owner.bankAccounts.forEach(acc => {
      acc.isPrimary = false;
    });
    
    // Set this one as primary
    account.isPrimary = true;
    account.updatedAt = new Date().toISOString();
    
    return true;
  },

  async getPaymentMethods(): Promise<BusinessPaymentMethod[]> {
    await simulateNetworkDelay(200);
    return AppMockData.owner.paymentMethods;
  },

  async updatePaymentMethod(methodId: string, enabled: boolean): Promise<BusinessPaymentMethod> {
    await simulateNetworkDelay(300);
    const method = AppMockData.owner.paymentMethods.find(pm => pm.id === methodId);
    if (!method) {
      throw new Error('Payment method not found');
    }
    
    method.enabled = enabled;
    method.updatedAt = new Date().toISOString();
    
    return method;
  },

  async getPayoutSettings(): Promise<PayoutSettings> {
    await simulateNetworkDelay(200);
    return AppMockData.owner.payoutSettings;
  },

  async updatePayoutSettings(settings: Partial<PayoutSettings>): Promise<PayoutSettings> {
    await simulateNetworkDelay(300);
    AppMockData.owner.payoutSettings = {
      ...AppMockData.owner.payoutSettings,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    return AppMockData.owner.payoutSettings;
  },

  async getPaymentTransactions(limit: number = 10): Promise<PaymentTransaction[]> {
    await simulateNetworkDelay(200);
    return AppMockData.owner.paymentTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },

  // Staff Management Settings API
  async getStaffManagementSettings(): Promise<StaffManagementSettings> {
    await simulateNetworkDelay(300);
    return AppMockData.owner.staffManagementSettings;
  },

  async updateStaffManagementSettings(
    updates: Partial<StaffManagementSettings>
  ): Promise<StaffManagementSettings> {
    await simulateNetworkDelay(400);
    
    const current = AppMockData.owner.staffManagementSettings;
    
    if (updates.roles) {
      current.roles = updates.roles;
    }
    if (updates.schedulingDefaults) {
      current.schedulingDefaults = { ...current.schedulingDefaults, ...updates.schedulingDefaults };
    }
    if (updates.notificationSettings) {
      current.notificationSettings = { ...current.notificationSettings, ...updates.notificationSettings };
    }
    
    current.updatedAt = new Date().toISOString();
    
    return current;
  },

  async updateStaffRolePermissions(
    roleKey: string,
    permissions: Partial<StaffRolePermissions['permissions']>
  ): Promise<StaffRolePermissions> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.staffManagementSettings;
    const role = settings.roles.find(r => r.roleKey === roleKey);
    
    if (!role) {
      throw new Error(`Role ${roleKey} not found`);
    }
    
    role.permissions = { ...role.permissions, ...permissions };
    settings.updatedAt = new Date().toISOString();
    
    return role;
  },

  async updateSchedulingDefaults(
    defaults: Partial<SchedulingDefaults>
  ): Promise<SchedulingDefaults> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.staffManagementSettings;
    settings.schedulingDefaults = { ...settings.schedulingDefaults, ...defaults };
    settings.updatedAt = new Date().toISOString();
    
    return settings.schedulingDefaults;
  },

  async updateStaffNotificationSettings(
    notificationSettings: Partial<StaffNotificationSettings>
  ): Promise<StaffNotificationSettings> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.staffManagementSettings;
    settings.notificationSettings = { ...settings.notificationSettings, ...notificationSettings };
    settings.updatedAt = new Date().toISOString();
    
    return settings.notificationSettings;
  },

  // General Settings API
  async getGeneralSettings(): Promise<GeneralSettings> {
    await simulateNetworkDelay(300);
    return AppMockData.owner.generalSettings;
  },

  async updateGeneralSettings(updates: Partial<GeneralSettings>): Promise<GeneralSettings> {
    await simulateNetworkDelay(400);
    
    const current = AppMockData.owner.generalSettings;
    
    if (updates.businessInfo) {
      current.businessInfo = { ...current.businessInfo, ...updates.businessInfo };
    }
    if (updates.locationInfo) {
      current.locationInfo = { ...current.locationInfo, ...updates.locationInfo };
    }
    if (updates.brandingInfo) {
      current.brandingInfo = { ...current.brandingInfo, ...updates.brandingInfo };
    }
    if (updates.policiesInfo) {
      current.policiesInfo = { ...current.policiesInfo, ...updates.policiesInfo };
    }
    
    current.updatedAt = new Date().toISOString();
    
    return current;
  },

  async updateBusinessInfo(businessInfo: Partial<BusinessInfo>): Promise<BusinessInfo> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.generalSettings;
    settings.businessInfo = { ...settings.businessInfo, ...businessInfo };
    settings.updatedAt = new Date().toISOString();
    
    return settings.businessInfo;
  },

  async updateLocationInfo(locationInfo: Partial<LocationInfo>): Promise<LocationInfo> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.generalSettings;
    if (locationInfo.address) {
      settings.locationInfo.address = locationInfo.address;
    }
    if (locationInfo.workingHours) {
      settings.locationInfo.workingHours = { ...settings.locationInfo.workingHours, ...locationInfo.workingHours };
    }
    settings.updatedAt = new Date().toISOString();
    
    return settings.locationInfo;
  },

  async updateBrandingInfo(brandingInfo: Partial<BrandingInfo>): Promise<BrandingInfo> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.generalSettings;
    settings.brandingInfo = { ...settings.brandingInfo, ...brandingInfo };
    settings.updatedAt = new Date().toISOString();
    
    return settings.brandingInfo;
  },

  async updatePoliciesInfo(policiesInfo: Partial<PoliciesInfo>): Promise<PoliciesInfo> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.generalSettings;
    settings.policiesInfo = { ...settings.policiesInfo, ...policiesInfo };
    settings.updatedAt = new Date().toISOString();
    
    return settings.policiesInfo;
  },

  // Security Settings APIs
  async getSecuritySettings(): Promise<OwnerSecuritySettings> {
    await simulateNetworkDelay(200);
    return { ...AppMockData.owner.ownerSecuritySettings };
  },

  async updateSecuritySettings(updates: Partial<OwnerSecuritySettings>): Promise<OwnerSecuritySettings> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.ownerSecuritySettings;
    
    // Update individual fields
    if (updates.twoFactorAuth !== undefined) {
      settings.twoFactorAuth = updates.twoFactorAuth;
    }
    if (updates.twoFactorAuthMethod !== undefined) {
      settings.twoFactorAuthMethod = updates.twoFactorAuthMethod;
    }
    if (updates.biometricLogin !== undefined) {
      settings.biometricLogin = updates.biometricLogin;
    }
    if (updates.sessionTimeout !== undefined) {
      settings.sessionTimeout = updates.sessionTimeout;
    }
    if (updates.sessionTimeoutMinutes !== undefined) {
      settings.sessionTimeoutMinutes = updates.sessionTimeoutMinutes;
    }
    if (updates.loginNotifications !== undefined) {
      settings.loginNotifications = updates.loginNotifications;
    }
    if (updates.deviceManagement !== undefined) {
      settings.deviceManagement = updates.deviceManagement;
    }
    
    settings.lastSecurityUpdate = new Date().toISOString();
    settings.updatedAt = new Date().toISOString();
    
    return { ...settings };
  },

  async revokeDevice(deviceId: string): Promise<boolean> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.ownerSecuritySettings;
    const deviceIndex = settings.devices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex === -1) {
      throw new Error('Device not found');
    }
    
    settings.devices.splice(deviceIndex, 1);
    settings.lastSecurityUpdate = new Date().toISOString();
    settings.updatedAt = new Date().toISOString();
    
    return true;
  },

  async updateRecoveryOptions(recoveryOptions: Partial<RecoveryOptions>): Promise<RecoveryOptions> {
    await simulateNetworkDelay(300);
    
    const settings = AppMockData.owner.ownerSecuritySettings;
    settings.recoveryOptions = { ...settings.recoveryOptions, ...recoveryOptions };
    settings.lastSecurityUpdate = new Date().toISOString();
    settings.updatedAt = new Date().toISOString();
    
    return { ...settings.recoveryOptions };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    await simulateNetworkDelay(500);
    
    // TODO: In real implementation, verify current password and update in database
    // For now, just validate the new password requirements
    
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    const settings = AppMockData.owner.ownerSecuritySettings;
    const now = new Date().toISOString();
    
    settings.passwordLastChanged = now;
    settings.lastPasswordChange = now;
    settings.lastSecurityUpdate = now;
    settings.updatedAt = now;
    
    return true;
  },

  async signOutAllDevices(): Promise<boolean> {
    await simulateNetworkDelay(500);
    
    const settings = AppMockData.owner.ownerSecuritySettings;
    // Keep only the current device, remove all others
    settings.devices = settings.devices.filter(d => d.isCurrent);
    settings.lastSecurityUpdate = new Date().toISOString();
    settings.updatedAt = new Date().toISOString();
    
    return true;
  },
};
