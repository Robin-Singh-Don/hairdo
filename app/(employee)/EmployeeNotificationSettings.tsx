import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function EmployeeNotificationSettings() {
  const router = useRouter();
  const [pauseAll, setPauseAll] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [clientMessages, setClientMessages] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [scheduleUpdates, setScheduleUpdates] = useState(true);
  const [clientReviews, setClientReviews] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 32 }} /> {/* Placeholder for alignment */}
      </View>
      
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Pause all notifications</Text>
        <Switch
          value={pauseAll}
          onValueChange={() => setPauseAll(!pauseAll)}
          trackColor={{ false: '#888', true: '#000' }} 
          thumbColor={pauseAll ? '#000' : '#fff'} 
          ios_backgroundColor="#000" 
        />
      </View>
      
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Appointment reminders</Text>
        <Switch
          value={appointmentReminders}
          onValueChange={() => setAppointmentReminders(!appointmentReminders)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={appointmentReminders ? '#000' : '#fff'}
        />
      </View>
      
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>New booking notifications</Text>
        <Switch
          value={bookingNotifications}
          onValueChange={() => setBookingNotifications(!bookingNotifications)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={bookingNotifications ? '#000' : '#fff'}
        />
      </View>
      
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Client messages</Text>
        <Switch
          value={clientMessages}
          onValueChange={() => setClientMessages(!clientMessages)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={clientMessages ? '#000' : '#fff'}
          ios_backgroundColor="#000"
        />
      </View>
      
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Email notifications</Text>
        <Switch
          value={emailNotifications}
          onValueChange={() => setEmailNotifications(!emailNotifications)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={!emailNotifications ? '#000' : '#000'}
        />
      </View>
      
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>SMS notifications</Text>
        <Switch
          value={smsNotifications}
          onValueChange={() => setSmsNotifications(!smsNotifications)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={smsNotifications ? '#000' : '#fff'}
        />
      </View>
      
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Schedule updates</Text>
        <Switch
          value={scheduleUpdates}
          onValueChange={() => setScheduleUpdates(!scheduleUpdates)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={scheduleUpdates ? '#000' : '#fff'}
        />
      </View>
      
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Client reviews</Text>
        <Switch
          value={clientReviews}
          onValueChange={() => setClientReviews(!clientReviews)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={clientReviews ? '#000' : '#fff'}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  backArrow: {
    fontSize: 28,
    color: '#000',
    width: 32,
    textAlign: 'left',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  optionText: {
    fontSize: 16,
    color: '#111',
  },
});
