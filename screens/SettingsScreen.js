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
  const renderSettingItem = ({ title, navigateTo }, index) => (
    <TouchableOpacity
      key={index}
      style={styles.settingItem}
      onPress={() => {
        if (navigateTo === 'NotificationSettings') {
          navigation.navigate('(tabs)/notifications');
        } else {
          navigation.navigate(navigateTo);
        }
      }}
    >
      <Text style={styles.settingText}>{title}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.settingsContainerWrapper}>
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
            <Text style={styles.backIconText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.settingsTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.settingsContainer}>
          {settingsOptions.map((item, index) => renderSettingItem(item, index))}
        </View>
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
  settingsContainerWrapper: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backIcon: {
    padding: 8,
  },
  backIconText: {
    fontSize: 32,
    color: '#000',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#000000de',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 48, // Same width as backIcon for centering
  },
});

export default SettingsScreen;