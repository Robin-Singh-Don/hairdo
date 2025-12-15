import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import { useAppointments } from '../../contexts/AppointmentContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock detailed client data and appointment history
const MOCK_CLIENT_DETAILS = {
  '1': {
    id: '1',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    isEmailVerified: true,
    clientTag: 'VIP',
    totalVisits: 24,
    totalSpent: 1250,
    lastVisit: '2024-01-15',
    averageSpend: 52,
    visitFrequency: 'Weekly',
    loyaltyPoints: 1250,
    status: 'Active',
    preferredServices: ['Haircut', 'Beard Trim'],
    preferredEmployee: 'Shark.11',
    notes: 'Prefers short fade, always books Saturday morning',
    joinDate: '2023-06-15',
    birthday: '1985-03-22',
    address: '123 Main St, City, State 12345',
    allergies: 'None',
    emergencyContact: 'Jane Smith (555) 987-6543',
  },
  '2': {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+1 (555) 234-5678',
    email: 'sarah.j@email.com',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    isEmailVerified: true,
    clientTag: 'Regular',
    totalVisits: 12,
    totalSpent: 480,
    lastVisit: '2024-01-10',
    averageSpend: 40,
    visitFrequency: 'Bi-weekly',
    loyaltyPoints: 480,
    status: 'Active',
    preferredServices: ['Hair Styling', 'Hair Color'],
    preferredEmployee: 'Puneet.10',
    notes: 'Likes bold colors, very particular about styling',
    joinDate: '2023-09-20',
    birthday: '1992-07-14',
    address: '456 Oak Ave, City, State 12345',
    allergies: 'Sensitive to certain hair dyes',
    emergencyContact: 'Mike Johnson (555) 876-5432',
  },
  '3': {
    id: '3',
    name: 'Mike Wilson',
    phone: '+1 (555) 345-6789',
    email: 'mike.wilson@email.com',
    profileImage: 'https://randomuser.me/api/portraits/men/65.jpg',
    isEmailVerified: false,
    clientTag: 'New',
    totalVisits: 3,
    totalSpent: 90,
    lastVisit: '2024-01-12',
    averageSpend: 30,
    visitFrequency: 'Monthly',
    loyaltyPoints: 90,
    status: 'Active',
    preferredServices: ['Haircut'],
    preferredEmployee: 'Jeet.12',
    notes: 'New client, still exploring services',
    joinDate: '2023-12-01',
    birthday: '1988-11-30',
    address: '789 Pine St, City, State 12345',
    allergies: 'None',
    emergencyContact: 'Lisa Wilson (555) 765-4321',
  },
  '4': {
    id: '4',
    name: 'Emily Davis',
    phone: '+1 (555) 456-7890',
    email: 'emily.davis@email.com',
    profileImage: 'https://randomuser.me/api/portraits/women/12.jpg',
    isEmailVerified: true,
    clientTag: 'VIP',
    totalVisits: 18,
    totalSpent: 720,
    lastVisit: '2024-01-08',
    averageSpend: 40,
    visitFrequency: 'Weekly',
    loyaltyPoints: 720,
    status: 'Active',
    preferredServices: ['Facial', 'Eyebrow Shaping'],
    preferredEmployee: 'Abhay.0',
    notes: 'VIP client, always books premium services',
    joinDate: '2023-04-10',
    birthday: '1990-05-18',
    address: '321 Elm St, City, State 12345',
    allergies: 'None',
    emergencyContact: 'Tom Davis (555) 654-3210',
  },
  '5': {
    id: '5',
    name: 'David Brown',
    phone: '+1 (555) 567-8901',
    email: 'david.brown@email.com',
    profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    isEmailVerified: true,
    clientTag: 'Regular',
    totalVisits: 8,
    totalSpent: 320,
    lastVisit: '2023-12-20',
    averageSpend: 40,
    visitFrequency: 'Monthly',
    loyaltyPoints: 320,
    status: 'At-Risk',
    preferredServices: ['Haircut & Beard'],
    preferredEmployee: 'Shark.11',
    notes: 'Haven\'t visited in a while, send reminder',
    joinDate: '2023-08-15',
    birthday: '1987-12-03',
    address: '654 Maple Dr, City, State 12345',
    allergies: 'None',
    emergencyContact: 'Mary Brown (555) 543-2109',
  },
};

const MOCK_APPOINTMENT_HISTORY = {
  '1': [
    {
      id: '1',
      date: '2024-01-15',
      time: '10:00 AM',
      services: ['Haircut', 'Beard Trim'],
      employee: 'Shark.11',
      duration: '45 min',
      totalCost: 50,
      status: 'Completed',
      notes: 'Perfect cut, client very satisfied',
      rating: 5,
    },
    {
      id: '2',
      date: '2024-01-08',
      time: '10:00 AM',
      services: ['Haircut'],
      employee: 'Shark.11',
      duration: '30 min',
      totalCost: 35,
      status: 'Completed',
      notes: 'Regular maintenance cut',
      rating: 5,
    },
    {
      id: '3',
      date: '2024-01-01',
      time: '10:00 AM',
      services: ['Haircut', 'Beard Trim', 'Head Massage'],
      employee: 'Shark.11',
      duration: '60 min',
      totalCost: 80,
      status: 'Completed',
      notes: 'New Year special package',
      rating: 5,
    },
    {
      id: '4',
      date: '2023-12-25',
      time: '9:00 AM',
      services: ['Haircut'],
      employee: 'Shark.11',
      duration: '30 min',
      totalCost: 35,
      status: 'Completed',
      notes: 'Christmas morning appointment',
      rating: 4,
    },
    {
      id: '5',
      date: '2023-12-18',
      time: '10:00 AM',
      services: ['Haircut', 'Beard Trim'],
      employee: 'Shark.11',
      duration: '45 min',
      totalCost: 50,
      status: 'Completed',
      notes: 'Regular weekly appointment',
      rating: 5,
    },
  ],
  '2': [
    {
      id: '1',
      date: '2024-01-10',
      time: '2:00 PM',
      services: ['Hair Styling', 'Hair Color'],
      employee: 'Puneet.10',
      duration: '90 min',
      totalCost: 120,
      status: 'Completed',
      notes: 'Bold red color, client loved it',
      rating: 5,
    },
    {
      id: '2',
      date: '2023-12-27',
      time: '2:00 PM',
      services: ['Hair Styling'],
      employee: 'Puneet.10',
      duration: '45 min',
      totalCost: 40,
      status: 'Completed',
      notes: 'Holiday party styling',
      rating: 5,
    },
  ],
  '3': [
    {
      id: '1',
      date: '2024-01-12',
      time: '11:00 AM',
      services: ['Haircut'],
      employee: 'Jeet.12',
      duration: '30 min',
      totalCost: 35,
      status: 'Completed',
      notes: 'First visit, basic haircut',
      rating: 4,
    },
    {
      id: '2',
      date: '2023-12-15',
      time: '11:00 AM',
      services: ['Haircut'],
      employee: 'Jeet.12',
      duration: '30 min',
      totalCost: 35,
      status: 'Completed',
      notes: 'Second visit, exploring styles',
      rating: 5,
    },
    {
      id: '3',
      date: '2023-12-01',
      time: '11:00 AM',
      services: ['Haircut'],
      employee: 'Jeet.12',
      duration: '30 min',
      totalCost: 35,
      status: 'Completed',
      notes: 'Initial consultation and haircut',
      rating: 4,
    },
  ],
  '4': [
    {
      id: '1',
      date: '2024-01-08',
      time: '3:00 PM',
      services: ['Facial', 'Eyebrow Shaping'],
      employee: 'Abhay.0',
      duration: '60 min',
      totalCost: 70,
      status: 'Completed',
      notes: 'VIP treatment, excellent service',
      rating: 5,
    },
    {
      id: '2',
      date: '2023-12-25',
      time: '3:00 PM',
      services: ['Facial'],
      employee: 'Abhay.0',
      duration: '40 min',
      totalCost: 45,
      status: 'Completed',
      notes: 'Holiday special facial',
      rating: 5,
    },
    {
      id: '3',
      date: '2023-12-11',
      time: '3:00 PM',
      services: ['Eyebrow Shaping'],
      employee: 'Abhay.0',
      duration: '15 min',
      totalCost: 25,
      status: 'Completed',
      notes: 'Regular eyebrow maintenance',
      rating: 5,
    },
  ],
  '5': [
    {
      id: '1',
      date: '2023-12-20',
      time: '10:00 AM',
      services: ['Haircut & Beard'],
      employee: 'Shark.11',
      duration: '45 min',
      totalCost: 50,
      status: 'Completed',
      notes: 'Regular maintenance, client satisfied',
      rating: 4,
    },
    {
      id: '2',
      date: '2023-11-15',
      time: '10:00 AM',
      services: ['Haircut & Beard'],
      employee: 'Shark.11',
      duration: '45 min',
      totalCost: 50,
      status: 'Completed',
      notes: 'Monthly appointment',
      rating: 5,
    },
    {
      id: '3',
      date: '2023-10-20',
      time: '10:00 AM',
      services: ['Haircut & Beard'],
      employee: 'Shark.11',
      duration: '45 min',
      totalCost: 50,
      status: 'Completed',
      notes: 'Regular service',
      rating: 4,
    },
    {
      id: '4',
      date: '2023-09-15',
      time: '10:00 AM',
      services: ['Haircut'],
      employee: 'Shark.11',
      duration: '30 min',
      totalCost: 35,
      status: 'Completed',
      notes: 'Basic haircut only',
      rating: 4,
    },
  ],
};

export default function IndividualClientHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const { appointments } = useAppointments();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Local state for editable client data
  const [editedClientData, setEditedClientData] = useState<any>(null);

  const getParamValue = (key: string): string | undefined => {
    const value = params[key];
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === 'string') {
      return value;
    }
    return undefined;
  };

  // Get client identifier from params (could be clientId from mock or name/phone from real data)
  const clientId = getParamValue('clientId');
  const clientName = getParamValue('name');
  const clientPhone = getParamValue('phone');

  // Find client appointments from real data
  const clientAppointments = useMemo(() => {
    if (clientName || clientPhone) {
      // Find by name or phone from real appointments
      return appointments.filter(apt => {
        const nameMatch = clientName && apt.customerName?.toLowerCase().includes(clientName.toLowerCase());
        const phoneMatch = clientPhone && apt.customerPhone?.includes(clientPhone);
        return nameMatch || phoneMatch;
      });
    } else if (clientId) {
      // Fallback to mock data lookup for backward compatibility
      return [];
    }
    return [];
  }, [appointments, clientName, clientPhone, clientId]);

  // Calculate client data from real appointments
  const clientData = useMemo(() => {
    if (clientAppointments.length === 0) {
      // Fallback to mock data if no real appointments found
      if (clientId) {
        return MOCK_CLIENT_DETAILS[clientId as keyof typeof MOCK_CLIENT_DETAILS] || null;
      }
      // If we have name/phone but no appointments, create basic client data
      if (clientName || clientPhone) {
        return {
          id: `customer_${Date.now()}`,
          name: clientName || 'Unknown Client',
          phone: clientPhone || '',
          email: getParamValue('email') || '',
          profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
          isEmailVerified: false,
          clientTag: 'New',
          totalVisits: 0,
          totalSpent: 0,
          lastVisit: '',
          averageSpend: 0,
          visitFrequency: 'N/A',
          loyaltyPoints: 0,
          status: 'New',
          preferredServices: [],
          preferredEmployee: '',
          preferredEmployeeId: '',
          preferredServiceId: '',
          notes: '',
          joinDate: '',
          birthday: '',
          address: '',
          allergies: '',
          emergencyContact: '',
        };
      }
      return null;
    }

    // Get client info from first appointment
    const firstAppt = clientAppointments[0];
    const customerName = firstAppt.customerName || 'Unknown';
    const customerPhone = firstAppt.customerPhone || '';
    const customerEmail = firstAppt.customerEmail || '';

    // Calculate stats
    const totalVisits = clientAppointments.length;
    const totalSpent = clientAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
    const averageSpend = totalVisits > 0 ? totalSpent / totalVisits : 0;
    
    // Get last visit date
    const sortedAppointments = [...clientAppointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateB - dateA;
    });
    const lastVisit = sortedAppointments[0]?.date || '';

    // Calculate preferred services (most frequent)
    const serviceCounts: Record<string, number> = {};
    clientAppointments.forEach(apt => {
      const serviceName = apt.serviceName || '';
      if (serviceName) {
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
      }
    });
    const preferredServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([service]) => service);

    // Calculate preferred employee (most frequent)
    const employeeCounts: Record<string, number> = {};
    clientAppointments.forEach(apt => {
      const employeeName = apt.employeeName || '';
      if (employeeName) {
        employeeCounts[employeeName] = (employeeCounts[employeeName] || 0) + 1;
      }
    });
    const preferredEmployee = Object.entries(employeeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    // Calculate visit frequency
    const visitDates = clientAppointments.map(apt => new Date(apt.date).getTime()).sort();
    let visitFrequency = 'Monthly';
    if (visitDates.length >= 2) {
      const avgDays = (visitDates[0] - visitDates[visitDates.length - 1]) / (visitDates.length - 1) / (1000 * 60 * 60 * 24);
      if (avgDays <= 10) visitFrequency = 'Weekly';
      else if (avgDays <= 20) visitFrequency = 'Bi-weekly';
    }

    // Get most recent employee ID for booking
    const lastEmployeeId = sortedAppointments[0]?.employeeId || '';
    
    // Get most recent service IDs for booking
    const lastServiceId = sortedAppointments[0]?.serviceId || '';

    return {
      id: firstAppt.customerId || `customer_${Date.now()}`,
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg', // Default avatar
      isEmailVerified: false,
      clientTag: totalVisits >= 20 ? 'VIP' : totalVisits >= 10 ? 'Regular' : 'New',
      totalVisits,
      totalSpent,
      lastVisit,
      averageSpend,
      visitFrequency,
      loyaltyPoints: Math.round(totalSpent), // Simple loyalty points = total spent
      status: lastVisit ? (() => {
        const today = new Date();
        const lastVisitDate = new Date(lastVisit);
        const diffDays = Math.ceil((today.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 60 ? 'At-Risk' : 'Active';
      })() : 'Active',
      preferredServices,
      preferredEmployee,
      preferredEmployeeId: lastEmployeeId,
      preferredServiceId: lastServiceId,
      notes: sortedAppointments[0]?.notes || '',
      joinDate: sortedAppointments[sortedAppointments.length - 1]?.date || '',
      birthday: '',
      address: '',
      allergies: '',
      emergencyContact: '',
    };
  }, [clientAppointments]);

  // Format appointment history for display
  const formattedAppointments = useMemo(() => {
    return clientAppointments.map(apt => {
      // Convert 24-hour time to 12-hour format
      const [hourStr, minuteStr] = (apt.startTime || '00:00').split(':');
      const hour24 = parseInt(hourStr, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 < 12 ? 'AM' : 'PM';
      const formattedTime = `${hour12}:${minuteStr} ${period}`;

      return {
        id: apt.id,
        date: apt.date,
        time: formattedTime,
        services: apt.serviceName ? [apt.serviceName] : [],
        employee: apt.employeeName || 'Unknown',
        duration: `${apt.duration || 30} min`,
        totalCost: apt.price || 0,
        status: apt.status === 'completed' ? 'Completed' : apt.status === 'cancelled' ? 'Cancelled' : apt.status === 'no-show' ? 'No-Show' : 'Pending',
        notes: apt.notes || '',
        rating: apt.customerRating || 0,
        employeeId: apt.employeeId,
        serviceId: apt.serviceId,
      };
    }).sort((a, b) => {
      // Sort by date descending (newest first)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [clientAppointments]);

  useEffect(() => {
    // Set loading to false after a short delay to allow data to load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [clientData, appointments]);

  // Initialize edited client data when clientData is loaded
  useEffect(() => {
    if (clientData && !editedClientData) {
      setEditedClientData(clientData);
    }
  }, [clientData, editedClientData]);

  // Use editedClientData if available, otherwise use clientData
  const displayClientData = editedClientData || clientData;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading client details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!clientData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Client History</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="person-outline" size={48} color="#999" />
          <Text style={styles.emptyStateText}>Client not found</Text>
          <Text style={styles.emptyStateSubtext}>No appointments found for this client</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysSinceLastVisit = (lastVisit: string) => {
    const today = new Date();
    const lastVisitDate = new Date(lastVisit);
    const diffTime = Math.abs(today.getTime() - lastVisitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      case 'No-Show': return '#FF9800';
      case 'Pending': return '#2196F3';
      default: return '#666';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'VIP': return '#9C27B0';
      case 'Regular': return '#2196F3';
      case 'New': return '#4CAF50';
      case 'At-Risk': return '#FF9800';
      default: return '#666';
    }
  };

  const handleBookAgain = () => {
    if (!displayClientData) return;
    
    // Navigate to AddClientScreen with pre-filled data
    router.push({
      pathname: '/(employee)/AddClientScreen',
      params: {
        name: displayClientData.name || '',
        phone: displayClientData.phone || '',
        email: displayClientData.email || '',
        employeeId: displayClientData.preferredEmployeeId || '',
        serviceId: displayClientData.preferredServiceId || '',
        clientTag: displayClientData.clientTag || 'Regular',
      },
    });
  };

  const handleSendReminder = () => {
    Alert.alert('Send Reminder', 'Reminder sent to client via SMS and email');
  };

  const handleTextClient = () => {
    if (!displayClientData) return;
    // Navigate to in-app chat with client
    router.push({
      pathname: '/(employee)/chat',
      params: {
        name: displayClientData.name || '',
        profileImage: displayClientData.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg',
        phone: displayClientData.phone || '',
      }
    });
  };

  const handleChangeTag = (tag: string) => {
    if (!displayClientData) return;
    // Update the local state
    setEditedClientData({ ...displayClientData, clientTag: tag });
    // In a real app, this would update the database
    Alert.alert('Success', `Client tag changed to ${tag}`);
    setTagModalVisible(false);
    setMenuVisible(false);
  };

  const handleBlockClient = () => {
    if (!displayClientData) return;
    Alert.alert(
      'Block Client',
      `Are you sure you want to block ${displayClientData.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would update the database
            Alert.alert('Success', `${displayClientData.name} has been blocked`);
            setMenuVisible(false);
          }
        }
      ]
    );
  };

  const handleEditInformation = () => {
    if (!displayClientData) return;
    // Toggle edit mode
    setIsEditMode(true);
    setMenuVisible(false);
  };

  const handleSaveEdit = () => {
    // In a real app, this would save to the database
    Alert.alert('Success', 'Client information updated successfully');
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    // Reset to original data
    setEditedClientData(clientData);
    setIsEditMode(false);
  };

  const renderAppointmentItem = ({ item: appointment }: { item: any }) => {
    return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentDate}>
          <Text style={styles.appointmentDateText}>
            {formatDate(appointment.date)}
          </Text>
          <Text style={styles.appointmentTimeText}>
            {appointment.time}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Text style={styles.statusText}>{appointment.status}</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.serviceRow}>
          <Ionicons name="cut-outline" size={16} color="#666" />
          <Text style={styles.serviceText}>
            {appointment.services?.join(', ') || appointment.serviceName || 'No service'}
          </Text>
        </View>
        <View style={styles.serviceRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.serviceText}>{appointment.employee || 'Unknown'}</Text>
        </View>
        <View style={styles.serviceRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.serviceText}>{appointment.duration || 'N/A'}</Text>
        </View>
        <View style={styles.serviceRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.serviceText}>{formatCurrency(appointment.totalCost || 0)}</Text>
        </View>
      </View>

      {appointment.notes && (
        <View style={styles.appointmentNotes}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </View>
      )}

      {appointment.rating && appointment.rating > 0 && (
        <View style={styles.appointmentFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating:</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= appointment.rating ? 'star' : 'star-outline'}
                  size={14}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
    );
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{displayClientData?.totalVisits || 0}</Text>
          <Text style={styles.statLabel}>Total Visits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(displayClientData?.totalSpent || 0)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{displayClientData?.lastVisit ? `${getDaysSinceLastVisit(displayClientData.lastVisit)}d` : 'N/A'}</Text>
          <Text style={styles.statLabel}>Last Visit</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{displayClientData?.loyaltyPoints || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      {/* Client Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Client Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          {isEditMode ? (
            <TextInput
              style={styles.editInput}
              value={displayClientData?.phone || ''}
              onChangeText={(text) => setEditedClientData({ ...displayClientData, phone: text })}
              placeholder="Phone number"
            />
          ) : (
            <Text style={styles.infoValue}>{displayClientData?.phone || 'Unavailable'}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          {isEditMode ? (
            <TextInput
              style={styles.editInput}
              value={displayClientData?.email || ''}
              onChangeText={(text) => setEditedClientData({ ...displayClientData, email: text })}
              placeholder="Email address"
            />
          ) : (
            <Text style={styles.infoValue}>{displayClientData?.email || 'Unavailable'}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address:</Text>
          {isEditMode ? (
            <TextInput
              style={styles.editInput}
              value={displayClientData?.address || ''}
              onChangeText={(text) => setEditedClientData({ ...displayClientData, address: text })}
              placeholder="Address"
            />
          ) : (
            <Text style={styles.infoValue}>{displayClientData?.address || 'Unavailable'}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Birthday:</Text>
          {isEditMode ? (
            <TextInput
              style={styles.editInput}
              value={displayClientData?.birthday || ''}
              onChangeText={(text) => setEditedClientData({ ...displayClientData, birthday: text })}
              placeholder="Birthday"
            />
          ) : (
            <Text style={styles.infoValue}>{displayClientData?.birthday ? formatDate(displayClientData.birthday) : 'Unavailable'}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Emergency Contact:</Text>
          {isEditMode ? (
            <TextInput
              style={styles.editInput}
              value={displayClientData?.emergencyContact || ''}
              onChangeText={(text) => setEditedClientData({ ...displayClientData, emergencyContact: text })}
              placeholder="Emergency contact"
            />
          ) : (
            <Text style={styles.infoValue}>{displayClientData?.emergencyContact || 'Unavailable'}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Allergies:</Text>
          {isEditMode ? (
            <TextInput
              style={styles.editInput}
              value={displayClientData?.allergies || ''}
              onChangeText={(text) => setEditedClientData({ ...displayClientData, allergies: text })}
              placeholder="Allergies"
            />
          ) : (
            <Text style={styles.infoValue}>{displayClientData?.allergies || 'Unavailable'}</Text>
          )}
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Preferred Services:</Text>
          <Text style={styles.infoValue}>{displayClientData?.preferredServices?.length > 0 ? displayClientData.preferredServices.join(', ') : 'None'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Preferred Employee:</Text>
          <Text style={styles.infoValue}>{displayClientData?.preferredEmployee || 'Unavailable'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Visit Frequency:</Text>
          <Text style={styles.infoValue}>{displayClientData?.visitFrequency || 'Unavailable'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Average Spend:</Text>
          <Text style={styles.infoValue}>{formatCurrency(displayClientData?.averageSpend || 0)}</Text>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Notes</Text>
        {isEditMode ? (
          <TextInput
            style={styles.editTextArea}
            value={displayClientData?.notes || ''}
            onChangeText={(text) => setEditedClientData({ ...displayClientData, notes: text })}
            placeholder="Add notes about this client"
            multiline
            numberOfLines={4}
          />
        ) : (
          <Text style={styles.notesText}>{displayClientData?.notes || 'No notes available'}</Text>
        )}
      </View>
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={formattedAppointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.appointmentList}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client History</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Client Profile Header */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: displayClientData?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.clientName}>{displayClientData?.name || 'Unknown Client'}</Text>
            {displayClientData?.isEmailVerified && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            )}
          </View>
          <Text style={styles.clientContact}>{displayClientData?.phone || ''}</Text>
          <Text style={styles.clientEmail}>{displayClientData?.email || ''}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.tagBadge, { backgroundColor: getTagColor(displayClientData?.clientTag || 'Regular') }]}>
              <Text style={styles.tagText}>{displayClientData?.clientTag || 'Regular'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(displayClientData?.status || 'Active') }]}>
              <Text style={styles.statusText}>{displayClientData?.status || 'Active'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleBookAgain}>
          <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
          <Text style={styles.actionText}>Book Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSendReminder}>
          <Ionicons name="notifications-outline" size={20} color="#FF9800" />
          <Text style={styles.actionText}>Send Reminder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleTextClient}>
          <Ionicons name="chatbubble-outline" size={20} color="#2196F3" />
          <Text style={styles.actionText}>Text</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}
        >
          <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
            History ({formattedAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Mode Action Buttons */}
      {isEditMode && (
        <View style={styles.editModeActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Content */}
      <ScrollView style={styles.tabContentContainer}>
        {selectedTab === 'overview' ? renderOverviewTab() : renderHistoryTab()}
      </ScrollView>

      {/* Menu Popup */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setTagModalVisible(true); }}>
              <Ionicons name="pricetag-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Change Tag</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleEditInformation}>
              <Ionicons name="create-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Edit Information</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleBlockClient}>
              <Ionicons name="ban-outline" size={20} color="red" />
              <Text style={styles.menuTextBlock}>Block Client</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Tag Selection Modal */}
      <Modal
        visible={tagModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTagModalVisible(false)}
      >
        <Pressable style={styles.tagModalOverlay} onPress={() => setTagModalVisible(false)}>
          <Pressable style={styles.tagModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.tagModalTitle}>Select Client Tag</Text>
            <TouchableOpacity style={styles.tagOption} onPress={() => handleChangeTag('New')}>
              <View style={[styles.tagBadgeModal, { backgroundColor: getTagColor('New') }]}>
                <Text style={styles.tagTextModal}>New</Text>
              </View>
              {displayClientData?.clientTag === 'New' && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.tagOption} onPress={() => handleChangeTag('Regular')}>
              <View style={[styles.tagBadgeModal, { backgroundColor: getTagColor('Regular') }]}>
                <Text style={styles.tagTextModal}>Regular</Text>
              </View>
              {displayClientData?.clientTag === 'Regular' && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.tagOption} onPress={() => handleChangeTag('VIP')}>
              <View style={[styles.tagBadgeModal, { backgroundColor: getTagColor('VIP') }]}>
                <Text style={styles.tagTextModal}>VIP</Text>
              </View>
              {displayClientData?.clientTag === 'VIP' && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.tagOption} onPress={() => handleChangeTag('At-Risk')}>
              <View style={[styles.tagBadgeModal, { backgroundColor: getTagColor('At-Risk') }]}>
                <Text style={styles.tagTextModal}>At-Risk</Text>
              </View>
              {displayClientData?.clientTag === 'At-Risk' && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.tagModalCancelButton} onPress={() => setTagModalVisible(false)}>
              <Text style={styles.tagModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  clientContact: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
    fontWeight: '500',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  appointmentList: {
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appointmentDate: {
    flex: 1,
  },
  appointmentDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appointmentTimeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  appointmentDetails: {
    marginBottom: 10,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  appointmentNotes: {
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  notesLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 5,
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  stars: {
    flexDirection: 'row',
  },
  emptyStateText: {
    fontSize: 18,
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
  // Menu styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    top: 60,
    right: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  menuTextBlock: {
    fontSize: 16,
    color: 'red',
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  // Tag modal styles
  tagModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  tagModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  tagModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tagBadgeModal: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagTextModal: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  tagModalCancelButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tagModalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  // Edit mode styles
  editModeActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
    paddingVertical: 5,
  },
  editTextArea: {
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
