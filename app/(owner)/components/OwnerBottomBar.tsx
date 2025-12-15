import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export default function OwnerBottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Dashboard',
      icon: 'analytics-outline',
      route: '/(owner)/OwnerDashboard',
    },
    {
      name: 'Staff',
      icon: 'people-outline',
      route: '/(owner)/StaffSchedule',
    },
    {
      name: 'Analytics',
      icon: 'bar-chart-outline',
      route: '/(owner)/BusinessAnalytics',
    },
    {
      name: 'Alerts',
      icon: 'notifications-outline',
      route: '/(owner)/OwnerNotifications',
    },
    {
      name: 'Profile',
      icon: 'person-outline',
      route: '/(owner)/OwnerProfileNew',
    },
  ];

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => router.push(tab.route as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={24}
            color={isActive(tab.route) ? '#FF6B35' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              { color: isActive(tab.route) ? '#FF6B35' : '#666' },
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
