// Appointments repository abstraction with TempDB-backed implementation

// NOTE: We keep the entity shape compatible with the existing TempDB TempAppointment
// so the current convertTempAppointmentToAppointment function in AppointmentContext
// can continue to work without changes.

export type AppointmentEntity = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  employeeId: string;
  employeeName: string;
  businessId: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "HH:MM" 24-hour
  endTime: string; // "HH:MM" 24-hour
  duration: number; // minutes
  status: string;
  price: number;
  notes?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  customerRating?: number;
  customerReview?: string;
};

export interface AppointmentsRepository {
  listByBusiness(businessId: string): Promise<AppointmentEntity[]>;
  listByEmployee(employeeId: string): Promise<AppointmentEntity[]>;
  listByCustomer(customerId: string): Promise<AppointmentEntity[]>;
  create(data: Omit<AppointmentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentEntity>;
  update(id: string, updates: Partial<AppointmentEntity>): Promise<AppointmentEntity>;
  delete(id: string): Promise<boolean>;
}

// TempDB Implementation
class TempAppointmentsRepository implements AppointmentsRepository {
  private TempDB = require('../../data/TemporaryDatabase');

  async listByBusiness(businessId: string): Promise<AppointmentEntity[]> {
    const items = this.TempDB.TempDB.getAppointmentsByBusiness(businessId);
    return items as AppointmentEntity[];
  }

  async listByEmployee(employeeId: string): Promise<AppointmentEntity[]> {
    const items = this.TempDB.TempDB.getAppointmentsByEmployee(employeeId);
    return items as AppointmentEntity[];
  }

  async listByCustomer(customerId: string): Promise<AppointmentEntity[]> {
    const items = this.TempDB.TempDB.getAppointmentsByCustomer(customerId);
    return items as AppointmentEntity[];
  }

  async create(data: Omit<AppointmentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentEntity> {
    const created = this.TempDB.TempDB.createAppointment(data);
    return created as AppointmentEntity;
  }

  async update(id: string, updates: Partial<AppointmentEntity>): Promise<AppointmentEntity> {
    const updated = this.TempDB.TempDB.updateAppointment(id, updates);
    if (!updated) {
      throw new Error('Appointment not found');
    }
    return updated as AppointmentEntity;
  }

  async delete(id: string): Promise<boolean> {
    return this.TempDB.TempDB.deleteAppointment(id);
  }
}

// Supabase Implementation
class SupabaseAppointmentsRepository implements AppointmentsRepository {
  private client: any;

  constructor(client: any) {
    if (!client) {
      throw new Error('Supabase client is required');
    }
    this.client = client;
  }

  // Helper function to convert Supabase row (snake_case) to AppointmentEntity (camelCase)
  private mapSupabaseRowToEntity(row: any): AppointmentEntity {
    return {
      id: row.id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone || '',
      customerEmail: row.customer_email,
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      businessId: row.business_id,
      serviceId: row.service_id,
      serviceName: row.service_name,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: row.duration,
      status: row.status,
      price: parseFloat(row.price) || 0,
      notes: row.notes,
      specialRequests: row.special_requests,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      customerRating: row.customer_rating,
      customerReview: row.customer_review,
    };
  }

  // Helper function to convert AppointmentEntity (camelCase) to Supabase row (snake_case)
  private mapEntityToSupabaseRow(entity: Partial<AppointmentEntity>): any {
    const row: any = {};
    if (entity.customerId !== undefined) row.customer_id = entity.customerId;
    if (entity.customerName !== undefined) row.customer_name = entity.customerName;
    if (entity.customerPhone !== undefined) row.customer_phone = entity.customerPhone;
    if (entity.customerEmail !== undefined) row.customer_email = entity.customerEmail;
    if (entity.employeeId !== undefined) row.employee_id = entity.employeeId;
    if (entity.employeeName !== undefined) row.employee_name = entity.employeeName;
    if (entity.businessId !== undefined) row.business_id = entity.businessId;
    if (entity.serviceId !== undefined) row.service_id = entity.serviceId;
    if (entity.serviceName !== undefined) row.service_name = entity.serviceName;
    if (entity.date !== undefined) row.date = entity.date;
    if (entity.startTime !== undefined) row.start_time = entity.startTime;
    if (entity.endTime !== undefined) row.end_time = entity.endTime;
    if (entity.duration !== undefined) row.duration = entity.duration;
    if (entity.status !== undefined) row.status = entity.status;
    if (entity.price !== undefined) row.price = entity.price;
    if (entity.notes !== undefined) row.notes = entity.notes;
    if (entity.specialRequests !== undefined) row.special_requests = entity.specialRequests;
    if (entity.customerRating !== undefined) row.customer_rating = entity.customerRating;
    if (entity.customerReview !== undefined) row.customer_review = entity.customerReview;
    return row;
  }

  async listByBusiness(businessId: string): Promise<AppointmentEntity[]> {
    try {
      const { data, error } = await this.client
        .from('appointments')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments by business:', error);
        throw error;
      }

      return (data || []).map((row: any) => this.mapSupabaseRowToEntity(row));
    } catch (error) {
      console.error('Supabase listByBusiness error:', error);
      throw error;
    }
  }

  async listByEmployee(employeeId: string): Promise<AppointmentEntity[]> {
    try {
      const { data, error } = await this.client
        .from('appointments')
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments by employee:', error);
        throw error;
      }

      return (data || []).map((row: any) => this.mapSupabaseRowToEntity(row));
    } catch (error) {
      console.error('Supabase listByEmployee error:', error);
      throw error;
    }
  }

  async listByCustomer(customerId: string): Promise<AppointmentEntity[]> {
    try {
      const { data, error } = await this.client
        .from('appointments')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching appointments by customer:', error);
        throw error;
      }

      return (data || []).map((row: any) => this.mapSupabaseRowToEntity(row));
    } catch (error) {
      console.error('Supabase listByCustomer error:', error);
      throw error;
    }
  }

  async create(data: Omit<AppointmentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentEntity> {
    try {
      const row = this.mapEntityToSupabaseRow(data);
      
      const { data: created, error } = await this.client
        .from('appointments')
        .insert(row)
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      return this.mapSupabaseRowToEntity(created);
    } catch (error) {
      console.error('Supabase create error:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<AppointmentEntity>): Promise<AppointmentEntity> {
    try {
      const row = this.mapEntityToSupabaseRow(updates);
      
      const { data: updated, error } = await this.client
        .from('appointments')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating appointment:', error);
        throw error;
      }

      if (!updated) {
        throw new Error('Appointment not found');
      }

      return this.mapSupabaseRowToEntity(updated);
    } catch (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting appointment:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
  }
}

export function getAppointmentsRepository(): AppointmentsRepository {
  // Try to get Supabase client
  try {
    const { supabaseClient } = require('../supabase/SupabaseConfig');
    
    // Check if Supabase is properly configured
    if (supabaseClient) {
      const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
      const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
      
      // If both URL and key are configured, use Supabase
      if (url && key && url !== 'your-supabase-url' && key !== 'your-supabase-anon-key') {
        try {
          return new SupabaseAppointmentsRepository(supabaseClient);
        } catch (error) {
          console.warn('Failed to initialize Supabase repository, falling back to TempDB:', error);
          return new TempAppointmentsRepository();
        }
      }
    }
  } catch (error) {
    // Supabase not available, use TempDB
    console.log('Supabase not available, using TempDB for appointments');
  }
  
  // Default to TempDB if Supabase is not configured
  return new TempAppointmentsRepository();
}


