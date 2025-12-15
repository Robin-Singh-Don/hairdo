import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function OwnerSettings() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const renderProfileItem = (icon: string, title: string, value: string, onPress?: () => void) => (
    <TouchableOpacity 
      style={styles.profileItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <View style={styles.profileIcon}>
          <Ionicons name={icon as any} size={20} color="#000" />
        </View>
        <View style={styles.profileItemContent}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          <Text style={styles.profileItemValue}>{value}</Text>
        </View>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color="#999" />}
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header - Clickable */}
        <TouchableOpacity 
          style={styles.profileHeader}
          onPress={() => router.push('/(owner)/OwnerProfileEdit')}
          activeOpacity={0.7}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>👨‍💼</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Business Owner'}</Text>
              <Text style={styles.profileRole}>Salon Owner</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Business Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business</Text>
          {renderProfileItem('business-outline', 'Business Information', 'Name, address, hours & contact', () => router.push('/(owner)/BusinessInformationDetails'))}
          {renderProfileItem('people-outline', 'Staff Management', 'Manage your team', () => router.push('/(owner)/StaffManagement'))}
          {renderProfileItem('cut-outline', 'Services Management', 'Manage business services', () => {
            // TODO: Create OwnerServicesManagement page or link to employee version
            router.push('/(employee)/MyServicesScreen' as any);
          })}
          {renderProfileItem('calendar-outline', 'Booking Preferences', 'Business-wide booking rules', () => {
            // TODO: Create OwnerBookingPreferences page or link to employee version
            router.push('/(employee)/BookingPreferences' as any);
          })}
        </View>

        {/* Financial Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial</Text>
          {renderProfileItem('business-outline', 'Bank Information', 'Set up payment receiving', () => router.push('/(owner)/BankInfoPage'))}
          {renderProfileItem('card-outline', 'Payment Methods', 'Manage subscriptions & billing', () => router.push('/(owner)/PaymentMethodsPage'))}
        </View>

        {/* Operations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operations</Text>
          {renderProfileItem('people-outline', 'Staff Management Settings', 'Roles, permissions & scheduling', () => router.push('/(owner)/StaffManagementSettings'))}
          {renderProfileItem('settings-outline', 'General Settings', 'Hours, policies & branding', () => router.push('/(owner)/GeneralSettings'))}
        </View>

        {/* Account & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
          {renderProfileItem('lock-closed-outline', 'Change Password', 'Update your password', () => router.push('/(owner)/PasswordSettings'))}
          {renderProfileItem('shield-checkmark-outline', 'Privacy & Security', 'Account security & 2FA', () => router.push('/(owner)/SecuritySettings'))}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderProfileItem('notifications-outline', 'Notifications', 'Manage alerts & notifications', () => router.push('/(owner)/NotificationSettings'))}
        </View>
      </ScrollView>
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
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Profile Header
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 30,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
    color: '#666',
  },
  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  // Profile Items
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 14,
    color: '#666',
  },
  
  // Section Button
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
