// 🎯 EMPLOYEE API SERVICE
// Mock API implementation that simulates real backend calls

import { 
  Barber, 
  Day, 
  EmployeeAppointment, 
  ClientData, 
  EmployeeService, 
  Availability, 
  EmployeeNotification,
  AdminAppointment,
  EmployeeReview,
  EmployeeProfileData,
  EmployeeTimeOffRequest
} from '../mock/AppMockData';
import { AppMockData } from '../mock/AppMockData';
import { withNormalizedFields, withDisplayFields } from './adapters/serviceAdapter';
import { getAppointmentsRepository, AppointmentEntity } from '../repository/appointments';

// ===========================================
// API INTERFACE - SAME FOR MOCK AND REAL API
// ===========================================

export interface EmployeeAPI {
  // AdminHomeScreen APIs
  getBarbers(): Promise<Barber[]>;
  getDays(): Promise<Day[]>;
  getTimeSlots(): Promise<string[]>;
  getAppointments(): Promise<EmployeeAppointment[]>;
  
  // AppointmentsScreen APIs
  getClientsData(): Promise<ClientData[]>;
  getClientHistory(): Promise<any[]>; // Returns client history with stats
  
  // Service management APIs
  getServices(): Promise<EmployeeService[]>;
  addService(service: Omit<EmployeeService, 'id'>): Promise<EmployeeService>;
  updateService(id: string, updates: Partial<EmployeeService>): Promise<EmployeeService>;
  deleteService(id: string): Promise<boolean>;
  
  // Availability management APIs
  getAvailability(): Promise<Availability>;
  updateAvailability(availability: Availability): Promise<Availability>;
  
  // Notification APIs
  getNotifications(): Promise<EmployeeNotification[]>;
  addNotification(notification: Omit<EmployeeNotification, 'id' | 'isRead' | 'time'> & { time?: string, isRead?: boolean }): Promise<EmployeeNotification>;
  updateNotificationForRequest(requestId: string, updates: Partial<EmployeeNotification>): Promise<boolean>;
  removeNotificationsForRequest(requestId: string): Promise<number>;
  markNotificationAsRead(id: string): Promise<boolean>;
  markAllNotificationsAsRead(): Promise<boolean>;

  // Time off request APIs
  createTimeOffRequest(req: Omit<EmployeeTimeOffRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: EmployeeTimeOffRequest['status'], employeeId?: number }): Promise<EmployeeTimeOffRequest>;
  updateTimeOffRequest(id: string, updates: Partial<EmployeeTimeOffRequest>): Promise<EmployeeTimeOffRequest>;
  getTimeOffRequestById(id: string): Promise<EmployeeTimeOffRequest | undefined>;
  cancelTimeOffRequest(id: string): Promise<EmployeeTimeOffRequest>;
  deleteTimeOffRequest(id: string): Promise<boolean>;
  
  // Schedule management APIs
  getSchedule(date?: string): Promise<EmployeeAppointment[]>;
  addAppointment(appointment: Omit<EmployeeAppointment, 'id'>): Promise<EmployeeAppointment>;
  updateAppointment(id: number, updates: Partial<EmployeeAppointment>): Promise<EmployeeAppointment>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // AdminHomeScreen APIs
  getAdminAppointments(): Promise<AdminAppointment[]>;
  
  // EmployeeProfileScreen APIs
  getEmployeeReviews(): Promise<EmployeeReview[]>;
  getEmployeeProfileData(): Promise<EmployeeProfileData>;
}

// ===========================================
// MOCK API IMPLEMENTATION
// ===========================================

const mockEmployeeAPI: EmployeeAPI = {
  
  // 🏠 ADMIN HOME SCREEN APIs
  async getBarbers(): Promise<Barber[]> {
    await simulateNetworkDelay(200);
    return AppMockData.employee.barbers;
  },

  async getDays(): Promise<Day[]> {
    await simulateNetworkDelay(100);
    return AppMockData.employee.days;
  },

  async getTimeSlots(): Promise<string[]> {
    await simulateNetworkDelay(100);
    return AppMockData.employee.timeSlots;
  },

  async getAppointments(): Promise<EmployeeAppointment[]> {
    await simulateNetworkDelay(300);
    return AppMockData.employee.appointments;
  },

  // 📅 APPOINTMENTS SCREEN APIs
  async getClientHistory(): Promise<any[]> {
    await simulateNetworkDelay(400);
    
    try {
      // Get repository
      const appointmentsRepo = getAppointmentsRepository();
      
      // Get employee ID (for now using default - should come from auth context)
      const employeeId = 'employee_001'; // TODO: Get from auth context
      
      // Load all appointments for this employee
      const appointments = await appointmentsRepo.listByEmployee(employeeId);
      
      // Group by customer and calculate statistics
      const customerMap = new Map<string, {
        customerId: string;
        name: string;
        phone?: string;
        email?: string;
        appointments: AppointmentEntity[];
        totalSpent: number;
        visits: number;
        lastVisitDate: Date;
        firstVisitDate: Date;
        services: string[];
      }>();
      
      appointments.forEach(apt => {
        const customerId = apt.customerId;
        const customerName = apt.customerName || 'Unknown Customer';
        
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            customerId,
            name: customerName,
            phone: apt.customerPhone,
            email: apt.customerEmail,
            appointments: [],
            totalSpent: 0,
            visits: 0,
            lastVisitDate: new Date(0),
            firstVisitDate: new Date('2099-12-31'),
            services: [],
          });
        }
        
        const customer = customerMap.get(customerId)!;
        customer.appointments.push(apt);
        customer.totalSpent += apt.price || 0;
        customer.visits += 1;
        
        // Track services
        if (apt.serviceName && !customer.services.includes(apt.serviceName)) {
          customer.services.push(apt.serviceName);
        }
        
        // Update last visit date
        const aptDate = new Date(apt.date + 'T00:00:00');
        if (aptDate > customer.lastVisitDate) {
          customer.lastVisitDate = aptDate;
        }
        if (aptDate < customer.firstVisitDate) {
          customer.firstVisitDate = aptDate;
        }
      });
      
      // Transform to client history format
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const clientHistory = Array.from(customerMap.values()).map(customer => {
        // Calculate visit frequency
        const daysSinceFirst = Math.floor((today.getTime() - customer.firstVisitDate.getTime()) / (1000 * 60 * 60 * 24));
        const weeksSinceFirst = Math.max(1, Math.floor(daysSinceFirst / 7));
        const visitsPerWeek = customer.visits / weeksSinceFirst;
        
        let visitFrequency = 'Monthly';
        if (visitsPerWeek >= 0.8) {
          visitFrequency = 'Weekly';
        } else if (visitsPerWeek >= 0.4) {
          visitFrequency = 'Bi-weekly';
        }
        
        // Determine client tag
        let clientTag = 'Regular';
        if (customer.totalSpent > 1000 || customer.visits > 20) {
          clientTag = 'VIP';
        } else if (customer.visits <= 3) {
          clientTag = 'New';
        }
        
        // Determine status
        const daysSinceLastVisit = Math.floor((today.getTime() - customer.lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
        let status = 'Active';
        if (daysSinceLastVisit > 90) {
          status = 'At-Risk';
        } else if (daysSinceLastVisit > 180) {
          status = 'Inactive';
        }
        
        // Calculate average spend
        const averageSpend = customer.visits > 0 ? Math.round((customer.totalSpent / customer.visits) * 100) / 100 : 0;
        
        // Format last visit
        const lastVisit = customer.lastVisitDate.getTime() === 0 
          ? 'Never' 
          : customer.lastVisitDate.toISOString().split('T')[0];
        
        // Format join date
        const joinDate = customer.firstVisitDate.getTime() === 0 || customer.firstVisitDate.getFullYear() === 2099
          ? new Date().toISOString().split('T')[0]
          : customer.firstVisitDate.toISOString().split('T')[0];
        
        // Generate avatar from name initials
        const initials = customer.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        
        const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&size=100&background=random`;
        
        return {
          id: customer.customerId,
          name: customer.name,
          phone: customer.phone || '',
          email: customer.email || '',
          profileImage,
          isEmailVerified: !!customer.email,
          clientTag,
          totalVisits: customer.visits,
          totalSpent: Math.round(customer.totalSpent * 100) / 100,
          lastVisit,
          averageSpend,
          visitFrequency,
          loyaltyPoints: Math.round(customer.totalSpent), // Assuming 1 point per dollar
          status,
          preferredServices: customer.services.slice(0, 3), // Top 3 services
          preferredEmployee: 'Current Employee', // Could be enhanced
          notes: `${customer.visits} visits, ${visitFrequency} frequency`,
          joinDate,
          birthday: '', // Not available from appointments
          address: '', // Not available from appointments
        };
      });
      
      // Sort by total spent (descending)
      clientHistory.sort((a, b) => b.totalSpent - a.totalSpent);
      
      return clientHistory;
    } catch (error: any) {
      console.error('Error loading client history from repository:', error);
      // Fallback to mock data on error
      return [];
    }
  },
  
  async getClientsData(): Promise<ClientData[]> {
    await simulateNetworkDelay(400);
    
    try {
      // Get repository
      const appointmentsRepo = getAppointmentsRepository();
      
      // Get employee ID (for now using default - should come from auth context)
      const employeeId = 'employee_001'; // TODO: Get from auth context
      
      // Load appointments from repository
      const appointments = await appointmentsRepo.listByEmployee(employeeId);
      
      // Filter upcoming/pending/confirmed appointments (not completed/cancelled)
      const activeAppointments = appointments.filter(apt => 
        ['pending', 'confirmed', 'checked-in'].includes(apt.status)
      );
      
      // Sort by date and time (earliest first)
      activeAppointments.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.startTime).getTime();
        const dateB = new Date(b.date + 'T' + b.startTime).getTime();
        return dateA - dateB;
      });
      
      // Transform to ClientData format
      const clientsData: ClientData[] = activeAppointments.map((apt, index) => {
        // Calculate time value for sorting
        const [hours, minutes] = apt.startTime.split(':').map(Number);
        const timeValue = hours * 60 + minutes;
        
        return {
          id: index + 1,
          name: apt.customerName || 'Unknown Customer',
          phone: apt.customerPhone || '',
          avatar: null, // Could look up from customer data
          rating: null,
          status: apt.status as 'confirmed' | 'pending' | 'completed' | 'cancelled',
          service: apt.serviceName || null,
          staff: apt.employeeName || null,
          time: apt.startTime,
          date: apt.date,
          timeValue: timeValue,
        };
      });
      
      return clientsData;
    } catch (error: any) {
      console.error('Error loading clients data from repository:', error);
      // Fallback to mock data on error
      return AppMockData.employee.clientsData;
    }
  },

  // 💼 SERVICE MANAGEMENT APIs
  async getServices(): Promise<EmployeeService[]> {
    await simulateNetworkDelay(200);
    // Attach normalized numeric fields without breaking UI
    return AppMockData.employee.services.map((s: any) => {
      const norm = withNormalizedFields(s as any);
      return withDisplayFields(norm as any) as any;
    });
  },

  async addService(service: Omit<EmployeeService, 'id'>): Promise<EmployeeService> {
    await simulateNetworkDelay(500);
    const norm = withNormalizedFields(service as any);
    const withUi = withDisplayFields(norm as any);
    const newService: EmployeeService = {
      ...(withUi as any),
      id: (AppMockData.employee.services.length + 1).toString()
    } as any;
    AppMockData.employee.services.push(newService);
    return newService;
  },

  async updateService(id: string, updates: Partial<EmployeeService>): Promise<EmployeeService> {
    await simulateNetworkDelay(400);
    const index = AppMockData.employee.services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    const merged = { ...AppMockData.employee.services[index], ...updates } as any;
    const norm = withNormalizedFields(merged);
    const withUi = withDisplayFields(norm);
    AppMockData.employee.services[index] = withUi as any;
    return AppMockData.employee.services[index];
  },

  async deleteService(id: string): Promise<boolean> {
    await simulateNetworkDelay(300);
    const index = AppMockData.employee.services.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    AppMockData.employee.services.splice(index, 1);
    return true;
  },

  // ⏰ AVAILABILITY MANAGEMENT APIs
  async getAvailability(): Promise<Availability> {
    await simulateNetworkDelay(200);
    return AppMockData.employee.availability;
  },

  async updateAvailability(availability: Availability): Promise<Availability> {
    await simulateNetworkDelay(500);
    AppMockData.employee.availability = availability;
    return availability;
  },

  // 🔔 NOTIFICATION APIs
  async getNotifications(): Promise<EmployeeNotification[]> {
    await simulateNetworkDelay(300);
    return AppMockData.employee.notifications;
  },
  
  async addNotification(notification: Omit<EmployeeNotification, 'id' | 'isRead' | 'time'> & { time?: string, isRead?: boolean }): Promise<EmployeeNotification> {
    await simulateNetworkDelay(150);
    const newNotification: EmployeeNotification = {
      id: (AppMockData.employee.notifications.length + 1).toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      time: notification.time ?? 'Just now',
      isRead: notification.isRead ?? false,
      route: (notification as any).route,
      params: (notification as any).params,
    };
    AppMockData.employee.notifications.unshift(newNotification);
    return newNotification;
  },

  async updateNotificationForRequest(requestId: string, updates: Partial<EmployeeNotification>): Promise<boolean> {
    await simulateNetworkDelay(120);
    const n = AppMockData.employee.notifications.find(nn => (nn as any).params?.id === requestId);
    if (!n) return false;
    Object.assign(n, updates);
    return true;
  },

  async removeNotificationsForRequest(requestId: string): Promise<number> {
    await simulateNetworkDelay(120);
    const before = AppMockData.employee.notifications.length;
    AppMockData.employee.notifications = AppMockData.employee.notifications.filter(nn => (nn as any).params?.id !== requestId);
    return before - AppMockData.employee.notifications.length;
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    await simulateNetworkDelay(200);
    const notification = AppMockData.employee.notifications.find(n => n.id === id);
    if (!notification) return false;
    
    notification.isRead = true;
    return true;
  },

  async markAllNotificationsAsRead(): Promise<boolean> {
    await simulateNetworkDelay(300);
    AppMockData.employee.notifications.forEach(n => n.isRead = true);
    return true;
  },

  // 🗓️ TIME OFF REQUEST APIs (mock)
  async createTimeOffRequest(req: Omit<EmployeeTimeOffRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: EmployeeTimeOffRequest['status'], employeeId?: number }): Promise<EmployeeTimeOffRequest> {
    await simulateNetworkDelay(250);
    
    // Generate UUID-compatible ID (for Supabase compatibility)
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const now = new Date().toISOString();
    
    // Check for duplicate requests (same employee, same dates, pending status)
    const employeeId = req.employeeId;
    if (employeeId && AppMockData.owner.timeOffRequests) {
      const existingRequest = AppMockData.owner.timeOffRequests.find((existing: any) => {
        return (
          existing.employeeId === employeeId &&
          existing.startDate === req.startDate &&
          existing.endDate === (req.endDate || req.startDate) &&
          existing.status === 'pending'
        );
      });
      
      if (existingRequest) {
        throw new Error('A pending time off request already exists for these dates. Please wait for approval or cancel the existing request.');
      }
    }
    
    const newReq: EmployeeTimeOffRequest & { employeeId?: number } = {
      id: generateUUID(),
      type: req.type,
      startDate: req.startDate,
      endDate: req.endDate,
      duration: req.duration,
      halfDayPeriod: req.halfDayPeriod,
      reason: req.reason,
      notes: req.notes,
      status: req.status ?? 'pending',
      createdAt: now,
      updatedAt: now,
      employeeId: employeeId,
    };
    
    // Save to both employee and owner storage (shared)
    AppMockData.employee.timeOffRequests.unshift(newReq);
    
    // Also save to owner's timeOffRequests (shared storage)
    if (!AppMockData.owner.timeOffRequests) {
      AppMockData.owner.timeOffRequests = [];
    }
    AppMockData.owner.timeOffRequests.unshift(newReq as any);
    
    return newReq;
  },

  async updateTimeOffRequest(id: string, updates: Partial<EmployeeTimeOffRequest>): Promise<EmployeeTimeOffRequest> {
    await simulateNetworkDelay(200);
    const i = AppMockData.employee.timeOffRequests.findIndex(r => r.id === id);
    if (i === -1) throw new Error('Time off request not found');
    const updated: EmployeeTimeOffRequest = {
      ...AppMockData.employee.timeOffRequests[i],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    AppMockData.employee.timeOffRequests[i] = updated;
    return updated;
  },

  async getTimeOffRequestById(id: string): Promise<EmployeeTimeOffRequest | undefined> {
    await simulateNetworkDelay(120);
    return AppMockData.employee.timeOffRequests.find(r => r.id === id);
  },

  async cancelTimeOffRequest(id: string): Promise<EmployeeTimeOffRequest> {
    return this.updateTimeOffRequest(id, { status: 'cancelled' });
  },

  async deleteTimeOffRequest(id: string): Promise<boolean> {
    await simulateNetworkDelay(150);
    const i = AppMockData.employee.timeOffRequests.findIndex(r => r.id === id);
    if (i === -1) return false;
    AppMockData.employee.timeOffRequests.splice(i, 1);
    
    // Also delete from owner's timeOffRequests (shared storage)
    if (AppMockData.owner.timeOffRequests) {
      const ownerIndex = AppMockData.owner.timeOffRequests.findIndex((r: any) => r.id === id);
      if (ownerIndex !== -1) {
        AppMockData.owner.timeOffRequests.splice(ownerIndex, 1);
      }
    }
    
    return true;
  },

  // 📋 SCHEDULE MANAGEMENT APIs
  async getSchedule(date?: string): Promise<EmployeeAppointment[]> {
    await simulateNetworkDelay(400);
    
    try {
      // Get repository
      const appointmentsRepo = getAppointmentsRepository();
      
      // Get employee ID (for now using default - should come from auth context)
      const employeeId = 'employee_001'; // TODO: Get from auth context
      
      // Load appointments from repository
      const appointments = await appointmentsRepo.listByEmployee(employeeId);
      
      // Filter by date if provided
      let filteredAppointments = appointments;
      if (date) {
        filteredAppointments = appointments.filter(apt => apt.date === date);
      }
      
      // Transform AppointmentEntity to EmployeeAppointment format
      const employeeAppointments: EmployeeAppointment[] = filteredAppointments.map((apt, index) => {
        // Calculate start/end time in minutes from midnight
        const [startHours, startMinutes] = apt.startTime.split(':').map(Number);
        const startTimeInMinutes = startHours * 60 + startMinutes;
        const endTimeInMinutes = startTimeInMinutes + apt.duration;
        
        // Get status icon based on status
        const getStatusIcon = (status: string) => {
          switch (status) {
            case 'confirmed': return 'checkmark-circle';
            case 'pending': return 'time-outline';
            case 'completed': return 'checkmark-done-circle';
            case 'cancelled': return 'close-circle';
            default: return 'help-circle';
          }
        };
        
        // Get date as number (timestamp or date number)
        const dateObj = new Date(apt.date + 'T00:00:00');
        const dateNumber = dateObj.getDate(); // Day of month
        
        return {
          id: parseInt(apt.id.replace(/\D/g, '')) || (Date.now() + index), // Extract numeric part or use timestamp
          clientName: apt.customerName || 'Unknown Customer',
          clientAvatar: 'https://via.placeholder.com/50', // Default avatar, could look up from customer data
          phone: apt.customerPhone || '',
          service: apt.serviceName || 'Service',
          time: apt.startTime,
          duration: apt.duration,
          startTime: startTimeInMinutes,
          endTime: endTimeInMinutes,
          status: apt.status as 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'unpaid',
          statusIcon: getStatusIcon(apt.status),
          statusText: apt.status.charAt(0).toUpperCase() + apt.status.slice(1),
          barberId: parseInt(apt.employeeId.replace(/\D/g, '')) || 1,
          barber: apt.employeeName || 'Staff',
          date: dateNumber,
        };
      });
      
      return employeeAppointments;
    } catch (error: any) {
      console.error('Error loading schedule from repository:', error);
      // Fallback to mock data on error
      if (date) {
        return AppMockData.employee.appointments.filter(apt => apt.date.toString() === date);
      }
      return AppMockData.employee.appointments;
    }
  },

  async addAppointment(appointment: Omit<EmployeeAppointment, 'id'>): Promise<EmployeeAppointment> {
    await simulateNetworkDelay(600);
    const newAppointment: EmployeeAppointment = {
      ...appointment,
      id: Math.max(...AppMockData.employee.appointments.map(a => a.id)) + 1
    };
    (AppMockData.employee.appointments as EmployeeAppointment[]).push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(id: number, updates: Partial<EmployeeAppointment>): Promise<EmployeeAppointment> {
    await simulateNetworkDelay(500);
    const index = AppMockData.employee.appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');
    
    (AppMockData.employee.appointments as EmployeeAppointment[])[index] = { ...AppMockData.employee.appointments[index], ...updates } as EmployeeAppointment;
    return AppMockData.employee.appointments[index];
  },

  async deleteAppointment(id: number): Promise<boolean> {
    await simulateNetworkDelay(300);
    const index = AppMockData.employee.appointments.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    AppMockData.employee.appointments.splice(index, 1);
    return true;
  },

  // 🏠 ADMIN HOME SCREEN APIs
  async getAdminAppointments(): Promise<AdminAppointment[]> {
    await simulateNetworkDelay(400);
    return AppMockData.employee.adminAppointments;
  },

  // 👤 EMPLOYEE PROFILE SCREEN APIs
  async getEmployeeReviews(): Promise<EmployeeReview[]> {
    await simulateNetworkDelay(300);
    return AppMockData.employee.employeeReviews;
  },

  async getEmployeeProfileData(): Promise<EmployeeProfileData> {
    await simulateNetworkDelay(200);
    return AppMockData.employee.employeeProfileData;
  }
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Simulates network delay for realistic API behavior
 */
async function simulateNetworkDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Provider switch: choose mock vs supabase by config
import CURRENT_CONFIG from '../../config/AppConfig';
import { employeeAPISupabase } from './employeeAPI.supabase';

export const employeeAPI: EmployeeAPI =
  (CURRENT_CONFIG.profileService === 'supabase')
    ? employeeAPISupabase
    : mockEmployeeAPI;

/**
 * Simulates network error (for testing error handling)
 */
export function simulateNetworkError(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Network error')), 500);
  });
}

// ===========================================
// REAL API IMPLEMENTATION (FOR FUTURE USE)
// ===========================================

/**
 * When backend is ready, replace the mock implementation above with this:
 */
/*
export const employeeAPI: EmployeeAPI = {
  async getBarbers(): Promise<Barber[]> {
    const response = await fetch('/api/employee/barbers');
    return response.json();
  },
  
  async getClientsData(): Promise<ClientData[]> {
    const response = await fetch('/api/employee/clients');
    return response.json();
  },
  
  // ... implement all other methods with real fetch calls
};
*/
