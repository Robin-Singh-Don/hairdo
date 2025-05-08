import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const settingsOptions = [
  {
    title: 'Account settings',
    navigateTo: 'AccountSettings',
  },
  {
    title: 'Notification settings',
    navigateTo: 'NotificationSettings',
  },
  {
    title: 'Privacy Settings',
    navigateTo: 'PrivacySettings',
  },
  {
    title: 'Loyalty and Rewards',
    navigateTo: 'LoyaltyRewards',
  },
  {
    title: 'Appearance and Accessibility',
    navigateTo: 'AppearanceAccessibility',
  },
  {
    title: 'Payment and Subscription',
    navigateTo: 'PaymentSubscription',
  },
  {
    title: 'Language and Regional',
    navigateTo: 'LanguageRegional',
  },
  {
    title: 'Security Settings',
    navigateTo: 'SecuritySettings',
  },
  {
    title: 'Help and Support',
    navigateTo: 'HelpSupport',
  },
  {
    title: 'Terms and Policies',
    navigateTo: 'TermsPolicies',
  },
];

const SettingsScreen = ({ navigation }) => {
  console.log('SettingsScreen', navigation);
  debugger;
  const renderSettingItem = ({ title, navigateTo }, index) => (
    <TouchableOpacity
      key={index}
      style={styles.settingItem}
      onPress={() => navigation.navigate(navigateTo)}
    >
      <Text style={styles.settingText}>{title}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        {settingsOptions.map((item, index) => renderSettingItem(item, index))}
      </View>
{/* 
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>☰</Text>
          <Text style={styles.tabText}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>⊞</Text>
          <Text style={styles.tabText}>Grid</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>+</Text>
          <Text style={styles.tabText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>🔔</Text>
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>⌂</Text>
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};

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
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    fontSize: 32,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000de'
  },
  menuIcon: {
    fontSize: 24,
    color: '#000',
  },
  settingsContainer: {
    flex: 1,
    paddingTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00000061' //#F0F0F0',
  },
  settingText: {
    fontSize: 14,
    color: '#000000de',
    fontWeight: 500
  },
  chevron: {
    fontSize: 24,
    color: '#282828a3',
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
    color: '#000',
    marginBottom: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
});

export default SettingsScreen;