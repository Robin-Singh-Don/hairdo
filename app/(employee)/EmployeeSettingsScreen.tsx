import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import { getPrivacyPrefs, setPrivacyPrefs, getSecurityPrefs, setSecurityPrefs, PrivacyPrefs, SecurityPrefs } from '../../services/preferences/employeePreferences';

// Employee-specific settings options
const employeeSettingsOptions = [
  // Account & Profile Section
  {
    section: 'Account & Profile',
    items: [
      {
        title: 'Edit Profile',
        navigateTo: 'EmployeeProfileEdit',
        icon: 'create-outline',
      },
    ]
  },
  // Appointment Settings Section
  {
    section: 'Appointment Settings',
    items: [
      {
        title: 'Booking Preferences',
        navigateTo: 'BookingPreferences',
        icon: 'calendar-outline',
      },
      {
        title: 'Availability Settings',
        navigateTo: 'AvailabilitySettingsScreen',
        icon: 'time-outline',
      },
      {
        title: 'Appointment Reminders',
        navigateTo: 'AppointmentReminders',
        icon: 'notifications-outline',
      },
    ]
  },
  // Services Settings Section
  {
    section: 'Services & Pricing',
    items: [
      {
        title: 'My Services',
        navigateTo: 'MyServicesScreen',
        icon: 'cut-outline',
      },
      {
        title: 'Service Catalog',
        navigateTo: 'ServiceCatalogScreen',
        icon: 'list-outline',
      },
    ]
  },
  // Social Media Integration Section
  {
    section: 'Social Media Integration',
    items: [
      {
        title: 'Instagram Connect',
        navigateTo: 'InstagramConnect',
        icon: 'logo-instagram',
        isConnected: false,
      },
      {
        title: 'Facebook Connect',
        navigateTo: 'FacebookConnect',
        icon: 'logo-facebook',
        isConnected: false,
      },
      {
        title: 'TikTok Connect',
        navigateTo: 'TikTokConnect',
        icon: 'musical-notes-outline',
        isConnected: false,
      },
      {
        title: 'Social Media Posts',
        navigateTo: 'SocialMediaPosts',
        icon: 'share-outline',
      },
    ]
  },
  // Notifications Section
  {
    section: 'Notifications',
    items: [
      {
        title: 'Notification Settings',
        navigateTo: 'EmployeeNotificationSettings',
        icon: 'notifications-outline',
      },
    ]
  },
  // Privacy & Security Section
  {
    section: 'Privacy & Security',
    items: [
      {
        title: 'Privacy & Security',
        navigateTo: 'EmployeePrivacyAndSecurity',
        icon: 'shield-outline',
      },
    ]
  },
  // Support Section
  {
    section: 'Support & Help',
    items: [
      {
        title: 'Help & Support',
        navigateTo: 'HelpSupport',
        icon: 'help-circle-outline',
      },
      {
        title: 'Contact Us',
        navigateTo: 'ContactUs',
        icon: 'mail-outline',
      },
      {
        title: 'Terms and Policies',
        navigateTo: 'TermsAndPolicies',
        icon: 'document-text-outline',
      },
      {
        title: 'About Us',
        navigateTo: 'AboutUs',
        icon: 'information-circle-outline',
      },
    ]
  },
  // Logout Section
  {
    section: 'Account Actions',
    items: [
      {
        title: 'Logout',
        navigateTo: 'logout',
        icon: 'log-out-outline',
        isLogout: true,
      },
    ]
  },
];

export default function EmployeeSettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [privacyPrefs, setPrivacyPrefsState] = useState<PrivacyPrefs | null>(null);
  const [securityPrefs, setSecurityPrefsState] = useState<SecurityPrefs | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, we'll just simulate loading since this is a settings screen
        // In a real app, you might call employeeAPI.getSettings() to load user preferences
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        try {
          const p = await getPrivacyPrefs();
          setPrivacyPrefsState(p);
        } catch {}
        try {
          const s = await getSecurityPrefs();
          setSecurityPrefsState(s);
        } catch {}
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    router.push('/LogoutConfirmation');
  };

  const handleSocialMediaConnect = (platform: string) => {
    Alert.alert(
      `${platform} Integration`,
      `Connect your ${platform} account to share your work and attract more clients?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Connect', 
          onPress: () => {
            // Here you would implement the actual social media connection logic
            Alert.alert('Success', `${platform} account connected successfully!`);
          }
        },
      ]
    );
  };

  const renderSettingItem = (item: any, index: number) => {
    const isSocialMedia = item.navigateTo.includes('Connect');
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.settingItem}
        onPress={() => {
          if (item.isLogout) {
            handleLogout();
          } else if (isSocialMedia) {
            handleSocialMediaConnect(item.title.replace(' Connect', ''));
          } else {
            // Navigate to the screen (expo-router handles relative paths within the same layout)
            try {
              router.push(`/(employee)/${item.navigateTo}` as any);
            } catch (error) {
              console.error('Navigation error:', error);
              // Fallback: try without prefix
              router.push(item.navigateTo as any);
            }
          }
        }}
      >
        <View style={styles.settingItemLeft}>
          <Ionicons 
            name={item.icon as any} 
            size={22} 
            color={item.isLogout ? '#FF3B30' : '#666'} 
            style={styles.settingIcon}
          />
          <Text style={[
            styles.settingText,
            item.isLogout && styles.logoutSettingText
          ]}>
            {item.title}
          </Text>
        </View>
        
        {isSocialMedia && (
          <View style={styles.connectionStatus}>
            <Text style={[
              styles.connectionText,
              { color: item.isConnected ? '#4CAF50' : '#FF9800' }
            ]}>
              {item.isConnected ? 'Connected' : 'Connect'}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color="#999" 
            />
          </View>
        )}
        
        {!isSocialMedia && !item.isLogout && (
          <Ionicons name="chevron-forward" size={16} color="#999" />
        )}
      </TouchableOpacity>
    );
  };

  const renderSection = (section: any, sectionIndex: number) => (
    <View key={sectionIndex} style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{section.section}</Text>
      <View style={styles.sectionItems}>
        {section.items.map((item: any, itemIndex: number) => 
          renderSettingItem(item, itemIndex)
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.settingsContainerWrapper}>
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.settingsTitle}>Employee Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {employeeSettingsOptions.map((section, index) => 
            renderSection(section, index)
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  settingsContainerWrapper: {
    flex: 1,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backIcon: {
    padding: 8,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000de',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionItems: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutSettingText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
});
