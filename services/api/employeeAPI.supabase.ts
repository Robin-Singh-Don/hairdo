// Supabase-backed implementation placeholder. Matches EmployeeAPI interface.
// Fill methods incrementally when connecting Supabase.

import type { EmployeeAPI } from './employeeAPI';
import type {
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
  EmployeeTimeOffRequest,
} from '../mock/AppMockData';

function notReady<T = never>(msg: string): Promise<T> {
  return Promise.reject(new Error(`[Supabase API not implemented] ${msg}`));
}

export const employeeAPISupabase: EmployeeAPI = {
  async getBarbers(): Promise<Barber[]> { return notReady('getBarbers'); },
  async getDays(): Promise<Day[]> { return notReady('getDays'); },
  async getTimeSlots(): Promise<string[]> { return notReady('getTimeSlots'); },
  async getAppointments(): Promise<EmployeeAppointment[]> { return notReady('getAppointments'); },

  async getClientsData(): Promise<ClientData[]> { return notReady('getClientsData'); },

  async getServices(): Promise<EmployeeService[]> { return notReady('getServices'); },
  async addService(_service: Omit<EmployeeService, 'id'>): Promise<EmployeeService> { return notReady('addService'); },
  async updateService(_id: string, _updates: Partial<EmployeeService>): Promise<EmployeeService> { return notReady('updateService'); },
  async deleteService(_id: string): Promise<boolean> { return notReady('deleteService'); },

  async getAvailability(): Promise<Availability> { return notReady('getAvailability'); },
  async updateAvailability(_availability: Availability): Promise<Availability> { return notReady('updateAvailability'); },

  async getNotifications(): Promise<EmployeeNotification[]> { return notReady('getNotifications'); },
  async addNotification(_notification: any): Promise<EmployeeNotification> { return notReady('addNotification'); },
  async updateNotificationForRequest(_requestId: string, _updates: Partial<EmployeeNotification>): Promise<boolean> { return notReady('updateNotificationForRequest'); },
  async removeNotificationsForRequest(_requestId: string): Promise<number> { return notReady('removeNotificationsForRequest'); },
  async markNotificationAsRead(_id: string): Promise<boolean> { return notReady('markNotificationAsRead'); },
  async markAllNotificationsAsRead(): Promise<boolean> { return notReady('markAllNotificationsAsRead'); },

  async createTimeOffRequest(_req: any): Promise<EmployeeTimeOffRequest> { return notReady('createTimeOffRequest'); },
  async updateTimeOffRequest(_id: string, _updates: Partial<EmployeeTimeOffRequest>): Promise<EmployeeTimeOffRequest> { return notReady('updateTimeOffRequest'); },
  async getTimeOffRequestById(_id: string): Promise<EmployeeTimeOffRequest | undefined> { return notReady('getTimeOffRequestById'); },
  async cancelTimeOffRequest(_id: string): Promise<EmployeeTimeOffRequest> { return notReady('cancelTimeOffRequest'); },
  async deleteTimeOffRequest(_id: string): Promise<boolean> { return notReady('deleteTimeOffRequest'); },

  async getSchedule(_date?: string): Promise<EmployeeAppointment[]> { return notReady('getSchedule'); },
  async addAppointment(_appointment: Omit<EmployeeAppointment, 'id'>): Promise<EmployeeAppointment> { return notReady('addAppointment'); },
  async updateAppointment(_id: number, _updates: Partial<EmployeeAppointment>): Promise<EmployeeAppointment> { return notReady('updateAppointment'); },
  async deleteAppointment(_id: number): Promise<boolean> { return notReady('deleteAppointment'); },

  async getAdminAppointments(): Promise<AdminAppointment[]> { return notReady('getAdminAppointments'); },

  async getEmployeeReviews(): Promise<EmployeeReview[]> { return notReady('getEmployeeReviews'); },
  async getEmployeeProfileData(): Promise<EmployeeProfileData> { return notReady('getEmployeeProfileData'); },
};


