// 🗄️ SIMPLIFIED TEMPORARY DATABASE - 3 USERS ONLY
// Clean, realistic data for development

// 🔐 USER MANAGEMENT
export interface TempUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'employee' | 'owner';
  profileImage: string;
  phone: string;
  businessId?: string;
  employeeId?: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin: string;
}

// 👥 EMPLOYEE MANAGEMENT
export interface TempEmployee {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage: string;
  businessId: string;
  employeeId: string;
  position: string;
  hourlyRate: number;
  commissionRate?: number;
  isActive: boolean;
  hireDate: string;
  specialization: string[];
}

// 🏢 BUSINESS MANAGEMENT
export interface TempBusiness {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  phone: string;
  email: string;
  businessHours: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
}

// 🛠️ SERVICE MANAGEMENT
export interface TempService {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  businessId: string;
  isActive: boolean;
  category: string;
}

// 📅 APPOINTMENT MANAGEMENT
export interface TempAppointment {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  employeeId: string;
  employeeName?: string;
  businessId: string;
  serviceId: string;
  serviceName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'checked-in' | 'in-service' | 'completed' | 'cancelled' | 'no-show';
  price: number;
  notes?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  customerRating?: number;
  customerReview?: string;
}

// 📊 BUSINESS METRICS
export interface TempBusinessMetrics {
  businessId: string;
  date: string;
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  averageRating: number;
  totalReviews: number;
}

// 🗄️ DATABASE DATA
const TempDatabase = {
  // 🔐 USERS - 3 REALISTIC USERS ONLY
  users: [
    // Business Owner
    {
      id: 'owner_001',
      email: 'owner@elitehairstudio.com',
      password: 'owner123',
      name: 'Sarah Mitchell',
      role: 'owner' as const,
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      phone: '+1 (555) 123-4567',
      businessId: 'business_001',
      isVerified: true,
      createdAt: '2024-01-15T10:00:00Z',
      lastLogin: '2024-12-16T09:30:00Z'
    },
    // Employee
    {
      id: 'employee_001',
      email: 'mike.chen@elitehairstudio.com',
      password: 'mike123',
      name: 'Mike Chen',
      role: 'employee' as const,
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      phone: '+1 (555) 234-5678',
      businessId: 'business_001',
      employeeId: 'emp_001',
      isVerified: true,
      createdAt: '2024-02-01T10:00:00Z',
      lastLogin: '2024-12-16T08:45:00Z'
    },
    // Customer
    {
      id: 'customer_001',
      email: 'sarah.johnson@email.com',
      password: 'sarah123',
      name: 'Sarah Johnson',
      role: 'customer' as const,
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      phone: '+1 (555) 678-9012',
      businessId: 'business_001',
      isVerified: true,
      createdAt: '2024-01-20T10:00:00Z',
      lastLogin: '2024-12-16T10:00:00Z'
    }
  ],

  // 👥 EMPLOYEES
  employees: [
    {
      id: 'emp_001',
      name: 'Mike Chen',
      email: 'mike.chen@elitehairstudio.com',
      role: 'barber',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      businessId: 'business_001',
      employeeId: 'emp_001',
      position: 'Senior Barber',
      hourlyRate: 25,
      commissionRate: 10,
      isActive: true,
      hireDate: '2024-02-01',
      specialization: ['haircut', 'beard_trim', 'hair_color']
    }
  ],

  // 🏢 BUSINESSES
  businesses: [
    {
      id: 'business_001',
      name: 'Elite Hair Studio',
      ownerId: 'owner_001',
      address: '123 Main Street, Vancouver, BC V6B 1A1',
      phone: '+1 (604) 555-0123',
      email: 'info@elitehairstudio.com',
      businessHours: {
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '19:00', isWorking: true },
        saturday: { start: '10:00', end: '17:00', isWorking: true },
        sunday: { start: '10:00', end: '16:00', isWorking: false }
      }
    }
  ],

  // 🛠️ SERVICES
  services: [
    {
      id: 'haircut_style',
      name: 'Hair Cut & Style',
      description: 'Professional haircut with styling',
      duration: 45,
      price: 35,
      businessId: 'business_001',
      isActive: true,
      category: 'hair'
    },
    {
      id: 'hair_color',
      name: 'Hair Color',
      description: 'Professional hair coloring service',
      duration: 120,
      price: 85,
      businessId: 'business_001',
      isActive: true,
      category: 'hair'
    },
    {
      id: 'beard_trim',
      name: 'Beard Trim',
      description: 'Professional beard trimming and shaping',
      duration: 30,
      price: 25,
      businessId: 'business_001',
      isActive: true,
      category: 'beard'
    }
  ],

  // 📅 APPOINTMENTS
  appointments: [
    {
      id: 'apt_001',
      customerId: 'customer_001',
      employeeId: 'emp_001',
      businessId: 'business_001',
      serviceId: 'haircut_style',
      date: '2024-12-17',
      startTime: '10:00',
      endTime: '10:45',
      duration: 45,
      status: 'confirmed' as const,
      price: 35,
      notes: 'Regular haircut',
      specialRequests: '',
      createdAt: '2024-12-16T10:00:00Z',
      updatedAt: '2024-12-16T10:00:00Z'
    }
  ] as TempAppointment[],

  // 📊 BUSINESS METRICS
  businessMetrics: [
    {
      businessId: 'business_001',
      date: '2024-12-16',
      totalRevenue: 210,
      totalAppointments: 6,
      completedAppointments: 5,
      cancelledAppointments: 1,
      noShowAppointments: 0,
      averageRating: 4.8,
      totalReviews: 12
    }
  ]
};

// 🔧 DATABASE UTILITY FUNCTIONS
export const TempDB = {
  // 🔐 Authentication
  authenticateUser: (email: string, password: string): TempUser | null => {
    const user = TempDatabase.users.find(u => u.email === email && u.password === password);
    return user || null;
  },

  getUserById: (id: string): TempUser | null => {
    return TempDatabase.users.find(u => u.id === id) || null;
  },

  getUserByEmail: (email: string): TempUser | null => {
    return TempDatabase.users.find(u => u.email === email) || null;
  },

  // 👥 Employee Management
  getEmployeesByBusiness: (businessId: string): TempEmployee[] => {
    return TempDatabase.employees.filter(emp => emp.businessId === businessId);
  },

  getEmployeeById: (id: string): TempEmployee | null => {
    return TempDatabase.employees.find(emp => emp.id === id) || null;
  },

  // 🏢 Business Management
  getBusinessById: (id: string): TempBusiness | null => {
    return TempDatabase.businesses.find(biz => biz.id === id) || null;
  },

  // 🛠️ Service Management
  getServiceById: (id: string): TempService | null => {
    return TempDatabase.services.find(service => service.id === id) || null;
  },

  getServicesByBusiness: (businessId: string): TempService[] => {
    return TempDatabase.services.filter(service => service.businessId === businessId);
  },

  // 📅 Appointment Management
  getAppointmentsByBusiness: (businessId: string): TempAppointment[] => {
    return TempDatabase.appointments.filter(apt => apt.businessId === businessId);
  },

  getAppointmentsByEmployee: (employeeId: string): TempAppointment[] => {
    return TempDatabase.appointments.filter(apt => apt.employeeId === employeeId);
  },

  getAppointmentsByCustomer: (customerId: string): TempAppointment[] => {
    return TempDatabase.appointments.filter(apt => apt.customerId === customerId);
  },

  getAppointmentsByDate: (businessId: string, date: string): TempAppointment[] => {
    return TempDatabase.appointments.filter(apt => 
      apt.businessId === businessId && apt.date === date
    );
  },

  createAppointment: (appointmentData: Omit<TempAppointment, 'id' | 'createdAt' | 'updatedAt'>): TempAppointment => {
    const newAppointment: TempAppointment = {
      ...appointmentData,
      id: `apt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: appointmentData.notes || '',
      specialRequests: appointmentData.specialRequests || ''
    };
    TempDatabase.appointments.push(newAppointment);
    return newAppointment;
  },

  updateAppointment: (id: string, updates: Partial<TempAppointment>): TempAppointment | null => {
    const index = TempDatabase.appointments.findIndex(apt => apt.id === id);
    if (index === -1) return null;
    
    TempDatabase.appointments[index] = {
      ...TempDatabase.appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return TempDatabase.appointments[index];
  },

  deleteAppointment: (id: string): boolean => {
    const index = TempDatabase.appointments.findIndex(apt => apt.id === id);
    if (index === -1) return false;
    
    TempDatabase.appointments.splice(index, 1);
    return true;
  },

  // 💰 Financial Calculations
  calculateDailyRevenue: (businessId: string, date: string): number => {
    const appointments = TempDatabase.appointments.filter(apt => 
      apt.businessId === businessId && 
      apt.date === date && 
      apt.status === 'completed'
    );
    return appointments.reduce((total, apt) => total + apt.price, 0);
  },

  calculateEmployeeEarnings: (employeeId: string, date: string): number => {
    const appointments = TempDatabase.appointments.filter(apt => 
      apt.employeeId === employeeId && 
      apt.date === date && 
      apt.status === 'completed'
    );
    
    const employee = TempDatabase.employees.find(emp => emp.id === employeeId);
    if (!employee) return 0;

    return appointments.reduce((total, apt) => {
      const hourlyEarnings = (apt.duration / 60) * employee.hourlyRate;
      const commissionEarnings = apt.price * (employee.commissionRate || 0) / 100;
      return total + hourlyEarnings + commissionEarnings;
    }, 0);
  },

  // 📊 Business Analytics
  getBusinessMetrics: (businessId: string, date: string): TempBusinessMetrics | null => {
    return TempDatabase.businessMetrics.find(
      metrics => metrics.businessId === businessId && metrics.date === date
    ) || null;
  },

  // 🔍 Search & Filter
  searchCustomers: (businessId: string, query: string): TempUser[] => {
    const customerIds = TempDatabase.appointments
      .filter(apt => apt.businessId === businessId)
      .map(apt => apt.customerId);
    
    return TempDatabase.users.filter(user => 
      user.role === 'customer' && 
      customerIds.includes(user.id) &&
      (user.name.toLowerCase().includes(query.toLowerCase()) ||
       user.email.toLowerCase().includes(query.toLowerCase()) ||
       user.phone?.includes(query))
    );
  }
};

// 🎯 EXPORT ALL DATA FOR EASY ACCESS
export default TempDatabase;