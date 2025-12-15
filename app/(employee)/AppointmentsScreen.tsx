import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppointments } from '../../contexts/AppointmentContext';

export default function AppointmentsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { appointments } = useAppointments();
  
  const employeeAppointments = appointments;
  
  // Sort and filter appointments by time (morning to evening), supporting search
  // Filter out appointments with "Unknown" or empty customer names
  const convertedAppointments = useMemo(() => {
    return employeeAppointments
      .filter((apt) => {
        const customerName = apt.customerName?.trim();
        if (!customerName || customerName.length === 0) {
          return false;
        }
        // Filter out any variation of "Unknown" (case-insensitive)
        const normalizedName = customerName.toLowerCase();
        return !normalizedName.startsWith('unknown');
      })
      .map((apt) => {
        // Parse times from 24-hour format strings (e.g., "11:30" or "15:45")
        // IMPORTANT: startTime and endTime come as strings in "HH:MM" format from AddClientScreen
        const startTime = String(apt.startTime || '00:00').trim();
        const endTime = String(apt.endTime || '00:00').trim();
        
        // Debug log to verify what we're receiving
        console.log('📋 AppointmentsScreen parsing:', {
          customerName: apt.customerName,
          rawStartTime: apt.startTime,
          rawEndTime: apt.endTime,
          startTimeStr: startTime,
          endTimeStr: endTime,
          appointmentDate: apt.date
        });
        
        const [startHour = '0', startMinute = '0'] = startTime.split(':');
        const [endHour = '0', endMinute = '0'] = endTime.split(':');
        
        const startHourNum = parseInt(startHour, 10);
        const startMinuteNum = parseInt(startMinute, 10);
        const endHourNum = parseInt(endHour, 10);
        const endMinuteNum = parseInt(endMinute, 10);
        
        // Convert 24-hour to 12-hour format with AM/PM
        const formatTo12Hour = (hour24: number, minute: number) => {
          let hour12: number;
          let ampm: string;
          
          if (hour24 === 0) {
            hour12 = 12;
            ampm = 'AM';
          } else if (hour24 === 12) {
            hour12 = 12;
            ampm = 'PM';
          } else if (hour24 > 12) {
            hour12 = hour24 - 12;
            ampm = 'PM';
          } else {
            hour12 = hour24;
            ampm = 'AM';
          }
          
          return `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`;
        };
        
        const startTime12Hour = formatTo12Hour(startHourNum, startMinuteNum);
        const endTime12Hour = formatTo12Hour(endHourNum, endMinuteNum);
        const displayTime = `${startTime12Hour}-${endTime12Hour}`;
        
        // For sorting: convert to decimal hours (0-23.xx)
        const timeValue = startHourNum + startMinuteNum / 60;
        
        // Debug log the conversion
        console.log('📋 AppointmentsScreen converted:', {
          customerName: apt.customerName,
          original24Hour: `${startHourNum}:${String(startMinuteNum).padStart(2, '0')}`,
          display12Hour: displayTime,
          appointmentDate: apt.date
        });

        return {
          id: apt.id?.toString() || `${apt.customerName}-${startTime}-${apt.date}`,
          name: apt.customerName || '',
          phone: apt.customerPhone || '',
          email: apt.customerEmail || '',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          status: apt.status || 'pending',
          service: apt.serviceName || 'No Service',
          staff: apt.employeeName || 'No Staff',
          time: displayTime, // Display in 12-hour format with AM/PM
          startTimeRaw: apt.startTime || '', // Keep raw for internal use
          endTimeRaw: apt.endTime || '', // Keep raw for internal use
          date: apt.date || new Date().toISOString().split('T')[0], // Use the actual appointment date
          timeValue,
          rating: 4.5,
        };
      });
  }, [employeeAppointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const digitsQuery = searchQuery.replace(/\D/g, '');
    const shouldFilter = normalizedQuery.length > 0 || digitsQuery.length > 0;

    const sorted = [...convertedAppointments].sort((a, b) => {
      if (a.timeValue !== null && b.timeValue !== null) {
        return a.timeValue - b.timeValue;
      }
      if (a.timeValue !== null && b.timeValue === null) {
        return -1;
      }
      if (a.timeValue === null && b.timeValue !== null) {
        return 1;
      }
      return 0;
    });

    if (!shouldFilter) {
      return sorted;
    }

    return sorted.filter((appointment) => {
      const nameMatch = normalizedQuery
        ? appointment.name.toLowerCase().includes(normalizedQuery)
        : false;
      const phoneDigits = appointment.phone.replace(/\D/g, '');
      const phoneMatch = digitsQuery ? phoneDigits.includes(digitsQuery) : false;
      return nameMatch || phoneMatch;
    });
  }, [convertedAppointments, searchQuery]);

  const handleBack = () => {
    router.back();
  };

  const handleClientPress = (client: any) => {
    router.push({
      pathname: '/ClientInformationScreen',
      params: {
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        avatar: client.avatar || '',
        service: client.service || '',
        staff: client.staff || '',
        startTime: client.startTimeRaw || '',
        endTime: client.endTimeRaw || '',
        date: client.date || '',
        status: client.status || '',
        rating: client.rating ? String(client.rating) : '',
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50'; // Green
      case 'pending': return '#9E9E9E'; // Grey
      case 'cancelled': return '#F44336'; // Red
      case 'unpaid': return '#FF9800'; // Orange
      default: return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointments</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="menu" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            {searchQuery.trim().length > 0 ? (
              <>
                <Ionicons name="search-outline" size={48} color="#999" />
                <Text style={styles.emptyStateText}>No clients found</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your search</Text>
              </>
            ) : (
              <>
                <Ionicons name="calendar-outline" size={48} color="#999" />
                <Text style={styles.emptyStateText}>No appointments yet</Text>
                <Text style={styles.emptyStateSubtext}>When you add clients, their appointments will show here</Text>
              </>
            )}
          </View>
        ) : (
          filteredAppointments.map((client) => (
            <TouchableOpacity 
              key={client.id} 
              style={styles.clientCard}
              onPress={() => handleClientPress(client)}
            >
              <View style={styles.clientLeft}>
                <View style={styles.avatarContainer}>
                  {client.avatar ? (
                    <Image source={{ uri: client.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.placeholderAvatar}>
                      <Ionicons name="person" size={24} color="#999" />
                    </View>
                  )}
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientPhone}>{client.phone}</Text>
                  {client.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>{client.rating}</Text>
                    </View>
                  )}
                  <View style={styles.colorDots}>
                    <View style={[styles.colorDot, { backgroundColor: getStatusColor(client.status) }]} />
                  </View>
                </View>
              </View>
              <View style={styles.clientRight}>
                {client.service && (
                  <>
                    <Text style={styles.serviceText}>{client.service}</Text>
                    <Text style={styles.staffText}>{client.staff}</Text>
                    <Text style={styles.timeText}>Time {client.time}</Text>
                    <Text style={styles.dateText}>Date {client.date}</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  clientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 4,
    fontWeight: '500',
  },
  colorDots: {
    flexDirection: 'row',
    marginTop: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  clientRight: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  serviceText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginBottom: 2,
  },
  staffText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
});
