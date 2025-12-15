import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotificationPreferences, setNotificationPreferences } from '../services/preferences/notificationPreferences';

const NotificationSettings = ({ navigation }) => {
  const [pauseAll, setPauseAll] = useState(false);
  const [posts, setPosts] = useState(false);
  const [messages, setMessages] = useState(true);
  const [email, setEmail] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(false);
  const [waitlist, setWaitlist] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved preferences on mount and when component updates
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getNotificationPreferences();
      setPauseAll(prefs.pauseAll);
      setPosts(prefs.posts);
      setMessages(prefs.messages);
      setEmail(prefs.email);
      setAppointmentReminders(prefs.appointmentReminders);
      setWaitlist(prefs.waitlist);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save preferences when any setting changes
  const savePreferences = useCallback(async (updates) => {
    try {
      // Get current state and merge with updates
      const current = await getNotificationPreferences();
      const merged = { ...current, ...updates };
      await setNotificationPreferences(merged);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }, []);

  // Update handlers that save immediately
  const handlePauseAll = async () => {
    const newValue = !pauseAll;
    setPauseAll(newValue);
    await savePreferences({ pauseAll: newValue });
  };

  const handlePosts = async () => {
    const newValue = !posts;
    setPosts(newValue);
    await savePreferences({ posts: newValue });
  };

  const handleMessages = async () => {
    const newValue = !messages;
    setMessages(newValue);
    await savePreferences({ messages: newValue });
  };

  const handleEmail = async () => {
    const newValue = !email;
    setEmail(newValue);
    await savePreferences({ email: newValue });
  };

  const handleAppointmentReminders = async () => {
    const newValue = !appointmentReminders;
    setAppointmentReminders(newValue);
    await savePreferences({ appointmentReminders: newValue });
  };

  const handleWaitlist = async () => {
    const newValue = !waitlist;
    setWaitlist(newValue);
    await savePreferences({ waitlist: newValue });
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.notificationItem}>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Pause all notifications</Text>
          <Text style={styles.subtitle}>Stop all CutTrack alerts.</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.customSwitch,
            pauseAll ? styles.switchActive : styles.switchInactive
          ]}
          onPress={handlePauseAll}
          activeOpacity={0.8}
        >
          <View style={[
            styles.switchKnob,
            pauseAll ? styles.knobActive : styles.knobInactive
          ]} />
        </TouchableOpacity>
      </View>

      <View style={styles.notificationItem}>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Post, stories and comments</Text>
          <Text style={styles.subtitle}>Updates when new posts/stories or when someone comments on your content.</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.customSwitch,
            posts ? styles.switchActive : styles.switchInactive
          ]}
          onPress={handlePosts}
          activeOpacity={0.8}
        >
          <View style={[
            styles.switchKnob,
            posts ? styles.knobActive : styles.knobInactive
          ]} />
        </TouchableOpacity>
      </View>

      <View style={styles.notificationItem}>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Messages</Text>
          <Text style={styles.subtitle}>Receive a ping whenever you get a new in-app message.</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.customSwitch,
            messages ? styles.switchActive : styles.switchInactive
          ]}
          onPress={handleMessages}
          activeOpacity={0.8}
        >
          <View style={[
            styles.switchKnob,
            messages ? styles.knobActive : styles.knobInactive
          ]} />
        </TouchableOpacity>
      </View>

      <View style={styles.notificationItem}>
        <View style={styles.tight}>
          <Text style={styles.mainText}>Email notifications</Text>
          <Text style={styles.subtitle}>Receive booking updates, reminders, and offers by email.</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.customSwitch,
            email ? styles.switchActive : styles.switchInactive
          ]}
          onPress={handleEmail}
          activeOpacity={0.8}
        >
          <View style={[
            styles.switchKnob,
            email ? styles.knobActive : styles.knobInactive
          ]} />
        </TouchableOpacity>
      </View>

      <View style={styles.notificationItem}>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Appointment Reminders</Text>
          <Text style={styles.subtitle}>Receive friendly alerts before your upcoming appointments.</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.customSwitch,
            appointmentReminders ? styles.switchActive : styles.switchInactive
          ]}
          onPress={handleAppointmentReminders}
          activeOpacity={0.8}
        >
          <View style={[
            styles.switchKnob,
            appointmentReminders ? styles.knobActive : styles.knobInactive
          ]} />
        </TouchableOpacity>
      </View>

      <View style={styles.notificationItem}>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Waitlist &amp; Last-Minute</Text>
          <Text style={styles.subtitle}>Receive alerts if an earlier appointment slot frees up.</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.customSwitch,
            waitlist ? styles.switchActive : styles.switchInactive
          ]}
          onPress={handleWaitlist}
          activeOpacity={0.8}
        >
          <View style={[
            styles.switchKnob,
            waitlist ? styles.knobActive : styles.knobInactive
          ]} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 80,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  mainText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  customSwitch: {
    width: 40,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#8B91B4',
  },
  switchInactive: {
    backgroundColor: '#555555',
  },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  knobActive: { alignSelf: 'flex-end' },
  knobInactive: { alignSelf: 'flex-start' },
});

export default NotificationSettings;