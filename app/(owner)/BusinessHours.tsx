import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { GeneralSettings } from '../../services/mock/AppMockData';
import EditDayHoursModal from './components/EditDayHoursModal';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

interface DayHours {
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

// Convert time string (e.g., "9:00 AM") to minutes since midnight for comparison
const timeToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
};

// Validate that opening time is before closing time
const validateTimes = (openingTime: string, closingTime: string): boolean => {
  const openingMinutes = timeToMinutes(openingTime);
  const closingMinutes = timeToMinutes(closingTime);
  return openingMinutes < closingMinutes;
};

export default function BusinessHours() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [hours, setHours] = useState<Record<DayKey, DayHours>>({
    monday: { isOpen: true, openingTime: '10:00 AM', closingTime: '08:00 PM' },
    tuesday: { isOpen: true, openingTime: '10:00 AM', closingTime: '08:00 PM' },
    wednesday: { isOpen: false, openingTime: '10:00 AM', closingTime: '08:00 PM' },
    thursday: { isOpen: true, openingTime: '12:00 PM', closingTime: '08:00 PM' },
    friday: { isOpen: true, openingTime: '10:00 AM', closingTime: '08:00 PM' },
    saturday: { isOpen: true, openingTime: '09:00 AM', closingTime: '09:00 PM' },
    sunday: { isOpen: true, openingTime: '11:00 AM', closingTime: '05:00 PM' },
  });
  const [editingDay, setEditingDay] = useState<DayKey | null>(null);

  // Parse hours string to DayHours
  const parseHours = (hoursString: string): DayHours => {
    if (!hoursString || hoursString === 'Closed' || hoursString.toLowerCase().includes('closed')) {
      return { isOpen: false, openingTime: '10:00 AM', closingTime: '08:00 PM' };
    }
    
    const match = hoursString.match(/(\d{1,2}:\d{2}\s?(?:AM|PM))\s*[-–]\s*(\d{1,2}:\d{2}\s?(?:AM|PM))/i);
    if (match) {
      return {
        isOpen: true,
        openingTime: match[1],
        closingTime: match[2],
      };
    }
    
    return { isOpen: true, openingTime: '10:00 AM', closingTime: '08:00 PM' };
  };

  // Format DayHours to string
  const formatHours = (dayHours: DayHours): string => {
    if (!dayHours.isOpen) return 'Closed';
    return `${dayHours.openingTime} — ${dayHours.closingTime}`;
  };

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await ownerAPI.getGeneralSettings();
        setSettings(data);
        
        // Parse working hours
        const parsedHours: Record<DayKey, DayHours> = {} as Record<DayKey, DayHours>;
        DAYS.forEach(({ key }) => {
          parsedHours[key] = parseHours(data.locationInfo.workingHours[key]);
        });
        setHours(parsedHours);
      } catch (err: any) {
        Alert.alert('Error', 'Failed to load business hours');
        console.error('Error loading business hours:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Toggle day open/closed
  const handleToggleDay = async (day: DayKey) => {
    const newHours = { ...hours };
    newHours[day].isOpen = !newHours[day].isOpen;
    setHours(newHours);
    
    await saveHours();
  };

  // Save hours to backend
  const saveHours = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      const workingHours: Record<string, string> = {};
      
      DAYS.forEach(({ key }) => {
        workingHours[key] = formatHours(hours[key]);
      });
      
      await ownerAPI.updateLocationInfo({ workingHours });
      
      // Update settings
      const updatedSettings = {
        ...settings,
        locationInfo: {
          ...settings.locationInfo,
          workingHours: workingHours as any,
        },
      };
      setSettings(updatedSettings);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to save business hours');
      console.error('Error saving business hours:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle day hours update from edit modal with validation
  const handleDayHoursUpdate = async (day: DayKey, dayHours: DayHours) => {
    // Validate times if day is open
    if (dayHours.isOpen) {
      if (!validateTimes(dayHours.openingTime, dayHours.closingTime)) {
        Alert.alert(
          'Invalid Time',
          'Opening time must be before closing time. Please correct the times.',
          [{ text: 'OK' }]
        );
        return; // Don't save invalid times
      }
    }
    
    const newHours = { ...hours };
    newHours[day] = dayHours;
    setHours(newHours);
    
    setEditingDay(null);
    await saveHours();
    Alert.alert('Success', `${DAYS.find(d => d.key === day)?.label} hours updated successfully`);
  };


  // Get current store status
  const getStoreStatus = () => {
    const now = new Date();
    const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1].key;
    const dayHours = hours[currentDay];
    
    if (!dayHours.isOpen) {
      // Find next open day
      let nextOpenDay = null;
      for (let i = 1; i <= 7; i++) {
        const dayIndex = (now.getDay() + i - 1) % 7;
        const checkDay = DAYS[dayIndex === 0 ? 6 : dayIndex - 1].key;
        if (hours[checkDay].isOpen) {
          nextOpenDay = DAYS.find(d => d.key === checkDay);
          break;
        }
      }
      
      return {
        isOpen: false,
        message: 'Your store is currently CLOSED',
        nextInfo: nextOpenDay ? `Opens ${nextOpenDay.label} at ${hours[nextOpenDay.key].openingTime}` : null,
      };
    }
    
    // Check if currently within opening hours
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const openingMinutes = timeToMinutes(dayHours.openingTime);
    const closingMinutes = timeToMinutes(dayHours.closingTime);
    
    if (nowMinutes >= openingMinutes && nowMinutes < closingMinutes) {
      return {
        isOpen: true,
        message: 'Your store is currently OPEN',
        nextInfo: `Closes today at ${dayHours.closingTime}`,
      };
    } else if (nowMinutes < openingMinutes) {
      return {
        isOpen: false,
        message: 'Your store is currently CLOSED',
        nextInfo: `Opens today at ${dayHours.openingTime}`,
      };
    } else {
      // Find next open day
      let nextOpenDay = null;
      for (let i = 1; i <= 7; i++) {
        const dayIndex = (now.getDay() + i - 1) % 7;
        const checkDay = DAYS[dayIndex === 0 ? 6 : dayIndex - 1].key;
        if (hours[checkDay].isOpen) {
          nextOpenDay = DAYS.find(d => d.key === checkDay);
          break;
        }
      }
      
      return {
        isOpen: false,
        message: 'Your store is currently CLOSED',
        nextInfo: nextOpenDay ? `Opens ${nextOpenDay.label} at ${hours[nextOpenDay.key].openingTime}` : null,
      };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Business Hours</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  const storeStatus = getStoreStatus();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Business Hours</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Hours List */}
        <View style={styles.hoursList}>
          {DAYS.map(({ key, label }) => {
            const dayHours = hours[key];
            const isOpen = dayHours.isOpen;
            
            return (
              <View key={key} style={styles.dayRow}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayLabel}>{label}</Text>
                  <View style={styles.dayToggle}>
                    <Text style={[styles.toggleLabel, !isOpen && styles.toggleLabelOff]}>
                      {isOpen ? 'ON' : 'OFF'}
                    </Text>
                    <Switch
                      value={isOpen}
                      onValueChange={() => handleToggleDay(key)}
                      trackColor={{ false: '#E0E0E0', true: '#000' }}
                      thumbColor="#fff"
                      disabled={saving}
                    />
                  </View>
                </View>
                
                <View style={styles.dayHoursRow}>
                  <Text style={[styles.hoursText, !isOpen && styles.hoursTextClosed]}>
                    {formatHours(dayHours)}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditingDay(key)}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Store Status Preview */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIndicator, storeStatus.isOpen && styles.statusIndicatorOpen]} />
          <View style={styles.statusContent}>
            <Text style={styles.statusMessage}>{storeStatus.message}</Text>
            {storeStatus.nextInfo && (
              <Text style={styles.statusNext}>{storeStatus.nextInfo}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Day Hours Modal */}
      {editingDay && (
        <EditDayHoursModal
          visible={editingDay !== null}
          day={editingDay}
          dayHours={hours[editingDay]}
          onClose={() => setEditingDay(null)}
          onSave={(dayHours) => handleDayHoursUpdate(editingDay, dayHours)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Hours List
  hoursList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dayRow: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  toggleLabelOff: {
    color: '#999',
  },
  dayHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  hoursTextClosed: {
    color: '#999',
    fontStyle: 'italic',
  },
  editButton: {
    padding: 8,
  },
  
  // Status Card
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#999',
  },
  statusIndicatorOpen: {
    backgroundColor: '#4CAF50',
  },
  statusContent: {
    flex: 1,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusNext: {
    fontSize: 14,
    color: '#666',
  },
});
