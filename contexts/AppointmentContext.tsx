import React, { createContext, useContext, useState, useEffect } from 'react';
import { TempDB, TempAppointment, TempEmployee, TempUser } from '../data/TemporaryDatabase';
import { getAppointmentsRepository } from '../services/repository/appointments';

// Types - Use standardized temporary database types
interface Appointment {
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
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'in-service' | 'completed' | 'cancelled' | 'no-show';
  price: number;
  notes?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  customerRating?: number;
  customerReview?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  businessId: string;
  employeeId: string;
  position: string;
  hourlyRate: number;
  commissionRate?: number;
  isActive: boolean;
  hireDate: string;
  specialization: string[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isVerified: boolean;
}

// Context
const AppointmentContext = createContext<{
  appointments: Appointment[];
  employees: Employee[];
  customers: Customer[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; message: string; appointment?: Appointment }>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<{ success: boolean; message: string; appointment?: Appointment }>;
  deleteAppointment: (id: string) => Promise<{ success: boolean; message: string }>;
  getAppointmentsByEmployee: (employeeId: string) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByBusiness: (businessId: string) => Appointment[];
  getEmployeeById: (id: string) => Employee | null;
  getCustomerById: (id: string) => Customer | null;
  calculateDailyRevenue: (businessId: string, date: string) => number;
  calculateEmployeeEarnings: (employeeId: string, date: string) => number;
}>({
  appointments: [],
  employees: [],
  customers: [],
  addAppointment: async () => ({ success: false, message: '' }),
  updateAppointment: async () => ({ success: false, message: '' }),
  deleteAppointment: async () => ({ success: false, message: '' }),
  getAppointmentsByEmployee: () => [],
  getAppointmentsByDate: () => [],
  getAppointmentsByBusiness: () => [],
  getEmployeeById: () => null,
  getCustomerById: () => null,
  calculateDailyRevenue: () => 0,
  calculateEmployeeEarnings: () => 0,
});

// Provider
export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Helper function to convert TempAppointment to Appointment
  const convertTempAppointmentToAppointment = (tempAppt: TempAppointment): Appointment => {
    // Use the serviceName from tempAppt if available, otherwise look it up
    const serviceName = tempAppt.serviceName || getServiceNameById(tempAppt.serviceId);
    
    return {
      id: tempAppt.id,
      customerId: tempAppt.customerId,
      customerName: tempAppt.customerName || 'Unknown Customer',
      customerPhone: tempAppt.customerPhone || '',
      customerEmail: tempAppt.customerEmail,
      employeeId: tempAppt.employeeId,
      employeeName: tempAppt.employeeName || 'Unknown Employee',
      businessId: tempAppt.businessId,
      serviceId: tempAppt.serviceId,
      serviceName: serviceName,
      date: tempAppt.date,
      startTime: tempAppt.startTime,
      endTime: tempAppt.endTime,
      duration: tempAppt.duration,
      status: tempAppt.status,
      price: tempAppt.price,
      notes: tempAppt.notes,
      specialRequests: tempAppt.specialRequests,
      createdAt: tempAppt.createdAt,
      updatedAt: tempAppt.updatedAt,
      customerRating: tempAppt.customerRating,
      customerReview: tempAppt.customerReview,
    };
  };

  // Helper function to convert TempEmployee to Employee
  const convertTempEmployeeToEmployee = (tempEmp: TempEmployee): Employee => {
    return {
      id: tempEmp.id,
      name: tempEmp.name,
      email: tempEmp.email,
      role: tempEmp.role,
      profileImage: tempEmp.profileImage,
      businessId: tempEmp.businessId,
      employeeId: tempEmp.employeeId,
      position: tempEmp.position,
      hourlyRate: tempEmp.hourlyRate,
      commissionRate: tempEmp.commissionRate,
      isActive: tempEmp.isActive,
      hireDate: tempEmp.hireDate,
      specialization: tempEmp.specialization,
    };
  };

  // Helper function to convert TempUser to Customer
  const convertTempUserToCustomer = (tempUser: TempUser): Customer => {
    return {
      id: tempUser.id,
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      profileImage: tempUser.profileImage,
      isVerified: tempUser.isVerified,
    };
  };

  // Helper function to get service name by ID
  const getServiceNameById = (serviceId: string): string => {
    const serviceMap: Record<string, string> = {
      'haircut_style': 'Hair Cut & Style',
      'hair_color': 'Hair Color',
      'beard_trim': 'Beard Trim',
      'highlights': 'Highlights',
      'hair_wash_blowdry': 'Hair Wash & Blow Dry',
      'facial_treatment': 'Facial Treatment',
      'full_service': 'Full Service Package',
    };
    return serviceMap[serviceId] || 'Unknown Service';
  };

  // Load data (appointments via repository; employees/customers via TempDB for now)
  useEffect(() => {
    const loadData = async () => {
      try {
        const repo = getAppointmentsRepository();
        const tempAppointments = await repo.listByBusiness('business_001');
        const convertedAppointments = tempAppointments.map((t: any) => 
          convertTempAppointmentToAppointment(t as TempAppointment)
        );
        setAppointments(convertedAppointments);

        const tempEmployees = TempDB.getEmployeesByBusiness('business_001');
        const convertedEmployees = tempEmployees.map(convertTempEmployeeToEmployee);
        setEmployees(convertedEmployees);

        const allUsers = TempDB.searchCustomers('business_001', '');
        const convertedCustomers = allUsers.map(convertTempUserToCustomer);
        setCustomers(convertedCustomers);
      } catch (e) {
        // Fallback to TempDB if repository fails
        const tempAppointments = TempDB.getAppointmentsByBusiness('business_001');
        const convertedAppointments = tempAppointments.map(convertTempAppointmentToAppointment);
        setAppointments(convertedAppointments);

        const tempEmployees = TempDB.getEmployeesByBusiness('business_001');
        const convertedEmployees = tempEmployees.map(convertTempEmployeeToEmployee);
        setEmployees(convertedEmployees);

        const allUsers = TempDB.searchCustomers('business_001', '');
        const convertedCustomers = allUsers.map(convertTempUserToCustomer);
        setCustomers(convertedCustomers);
      }
    };

    loadData();
  }, []);

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; appointment?: Appointment }> => {
    try {
      // Validate required fields
      if (!appointmentData.customerId || !appointmentData.employeeId || !appointmentData.date || !appointmentData.startTime) {
        return { success: false, message: 'Missing required appointment information' };
      }

      // Check for conflicts against current in-memory state (same employee & date)
      const existingAppointments = appointments.filter(
        apt => apt.employeeId === appointmentData.employeeId && apt.date === appointmentData.date
      );
      const hasConflict = existingAppointments.some(apt => 
        apt.date === appointmentData.date && 
        apt.id !== appointmentData.id &&
        ((appointmentData.startTime >= apt.startTime && appointmentData.startTime < apt.endTime) ||
         (appointmentData.endTime > apt.startTime && appointmentData.endTime <= apt.endTime))
      );

      if (hasConflict) {
        return { success: false, message: 'Time conflict detected. Please choose a different time slot.' };
      }

      // Create appointment via repository
      const repo = getAppointmentsRepository();
      const tempAppointment = await repo.create({
        customerId: appointmentData.customerId,
        customerName: appointmentData.customerName,
        customerPhone: appointmentData.customerPhone,
        customerEmail: appointmentData.customerEmail,
        employeeId: appointmentData.employeeId,
        employeeName: appointmentData.employeeName,
        businessId: appointmentData.businessId,
        serviceId: appointmentData.serviceId,
        serviceName: appointmentData.serviceName,
        date: appointmentData.date,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        duration: appointmentData.duration,
        status: appointmentData.status,
        price: appointmentData.price,
        notes: appointmentData.notes,
        specialRequests: appointmentData.specialRequests,
      } as any);

      // Convert to Appointment format and update state
      const newAppointment = convertTempAppointmentToAppointment(tempAppointment as unknown as TempAppointment);
      setAppointments(prev => [...prev, newAppointment]);

      return { 
        success: true, 
        message: 'Appointment created successfully!',
        appointment: newAppointment
      };

    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, message: 'Failed to create appointment. Please try again.' };
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<{ success: boolean; message: string; appointment?: Appointment }> => {
    try {
      // Update via repository
      const repo = getAppointmentsRepository();
      const updatedTempAppointment = await repo.update(id, updates as any);
      
      if (!updatedTempAppointment) {
        return { success: false, message: 'Appointment not found' };
      }

      // Convert to Appointment format and update state
      const updatedAppointment = convertTempAppointmentToAppointment(updatedTempAppointment as unknown as TempAppointment);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? updatedAppointment : appointment
        )
      );

      return { 
        success: true, 
        message: 'Appointment updated successfully!',
        appointment: updatedAppointment
      };

    } catch (error) {
      console.error('Error updating appointment:', error);
      return { success: false, message: 'Failed to update appointment. Please try again.' };
    }
  };

  const deleteAppointment = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const repo = getAppointmentsRepository();
      const success = await repo.delete(id);
      
      if (!success) {
        return { success: false, message: 'Appointment not found' };
      }

      setAppointments(prev => prev.filter(appointment => appointment.id !== id));

      return { success: true, message: 'Appointment deleted successfully!' };

    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, message: 'Failed to delete appointment. Please try again.' };
    }
  };

  const getAppointmentsByEmployee = (employeeId: string) => {
    return appointments.filter(appointment => appointment.employeeId === employeeId);
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(appointment => appointment.date === date);
  };

  const getAppointmentsByBusiness = (businessId: string) => {
    return appointments.filter(appointment => appointment.businessId === businessId);
  };

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp.id === id) || null;
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id) || null;
  };

  const calculateDailyRevenue = (businessId: string, date: string) => {
    // Calculate from appointments in state (works with both TempDB and Supabase)
    const dayAppointments = appointments.filter(
      apt => apt.businessId === businessId && apt.date === date && apt.status === 'completed'
    );
    return dayAppointments.reduce((total, apt) => total + apt.price, 0);
  };

  const calculateEmployeeEarnings = (employeeId: string, date: string): number => {
    // Calculate from appointments in state (works with both TempDB and Supabase)
    const dayAppointments = appointments.filter(
      apt => apt.employeeId === employeeId && apt.date === date && apt.status === 'completed'
    );
    
    // For now, calculate simple earnings (can be enhanced with hourly rate + commission later)
    return dayAppointments.reduce((total, apt) => total + apt.price, 0);
  };

  return (
    <AppointmentContext.Provider value={{
      appointments,
      employees,
      customers,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      getAppointmentsByEmployee,
      getAppointmentsByDate,
      getAppointmentsByBusiness,
      getEmployeeById,
      getCustomerById,
      calculateDailyRevenue,
      calculateEmployeeEarnings,
    }}>
      {children}
    </AppointmentContext.Provider>
  );
}

// Hook
export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
