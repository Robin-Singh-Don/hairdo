import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, TextInput, ListRenderItem, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import { EmployeeNotification } from '../../services/mock/AppMockData';
import { useFocusEffect } from '@react-navigation/native';

// User profile data - in real app this would come from user context/state
const userData = {
  username: 'Michel.James',
  displayName: 'Michel James',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
};

// Employee-specific notification data
type EmployeeNotification = {
  id: string;
  type: 'appointment' | 'schedule' | 'message' | 'request';
  title: string;
  message: string;
  timestamp: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
};

const employeeNotifications: EmployeeNotification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'You have an appointment with Sarah Johnson in 30 minutes (2:30 PM)',
    timestamp: '5 min ago',
    icon: 'calendar',
    priority: 'high'
  },
  {
    id: '2',
    type: 'request',
    title: 'New Appointment Request',
    message: 'Mike Davis requested a haircut for tomorrow at 10:00 AM',
    timestamp: '15 min ago',
    icon: 'person-add',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'schedule',
    title: 'Schedule Update',
    message: 'Your shift has been extended by 1 hour today (until 7:00 PM)',
    timestamp: '1 hour ago',
    icon: 'time',
    priority: 'medium'
  },
  {
    id: '4',
    type: 'message',
    title: 'Owner Message',
    message: 'Great work on the client satisfaction this week! Keep it up!',
    timestamp: '2 hours ago',
    icon: 'chatbubble',
    priority: 'low'
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: 'Lisa Chen confirmed her appointment for Friday at 3:00 PM',
    timestamp: '3 hours ago',
    icon: 'checkmark-circle',
    priority: 'low'
  },
  {
    id: '6',
    type: 'request',
    title: 'Appointment Cancelled',
    message: 'John Smith cancelled his appointment for today at 4:00 PM',
    timestamp: '4 hours ago',
    icon: 'close-circle',
    priority: 'medium'
  },
  {
    id: '7',
    type: 'schedule',
    title: 'Weekly Schedule',
    message: 'Your schedule for next week has been published',
    timestamp: '1 day ago',
    icon: 'calendar-outline',
    priority: 'low'
  },
  {
    id: '8',
    type: 'message',
    title: 'Team Update',
    message: 'New client feedback system is now available in the app',
    timestamp: '2 days ago',
    icon: 'information-circle',
    priority: 'low'
  },
  {
    id: '9',
    type: 'appointment',
    title: 'Appointment Reminder',
    message: 'Emma Wilson has an appointment tomorrow at 11:00 AM',
    timestamp: '2 days ago',
    icon: 'alarm',
    priority: 'medium'
  },
  {
    id: '10',
    type: 'request',
    title: 'Walk-in Request',
    message: 'A walk-in client is waiting for a haircut',
    timestamp: '3 days ago',
    icon: 'walk',
    priority: 'high'
  }
];

// Employee team messages
const teamMessages = [
  {
    id: '1',
    name: 'Owner - Shark.11',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'Please update your availability for next week',
    timestamp: '2 hours',
  },
  {
    id: '2',
    name: 'Manager - Puneet.10',
    profileImage: 'https://randomuser.me/api/portraits/men/44.jpg',
    lastMessage: 'Great job on client satisfaction this week!',
    timestamp: '4 hours',
  },
  {
    id: '3',
    name: 'Team - Jeet.12',
    profileImage: 'https://randomuser.me/api/portraits/men/65.jpg',
    lastMessage: 'Can you cover my shift tomorrow?',
    timestamp: '1 day',
  },
  {
    id: '4',
    name: 'Owner - Shark.11',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'New training session scheduled for Friday',
    timestamp: '2 days',
  },
  {
    id: '5',
    name: 'Manager - Puneet.10',
    profileImage: 'https://randomuser.me/api/portraits/men/44.jpg',
    lastMessage: 'Client feedback system is now live',
    timestamp: '3 days',
  },
];

type MessagePreview = typeof teamMessages[0];

const TAB_ITEMS = [
  { key: 'notifications', label: 'Notifications' },
  { key: 'messages', label: 'Messages' },
];

const Notification2Screen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [search, setSearch] = useState('');
  
  // API state
  const [notifications, setNotifications] = useState<EmployeeNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle tab param to open specific tab
  useEffect(() => {
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
    
    const tabParam = getParamValue('tab');
    if (tabParam && (tabParam === 'notifications' || tabParam === 'messages')) {
      setActiveTab(tabParam as 'notifications' | 'messages');
    }
  }, [params]);

  // Load data from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refresh when screen regains focus (shows edits/cancellations immediately)
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );
  
  // Animation values for header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = 56; // Height of the header (back button + user ID)
  const tabHeight = 48; // Height of the tab bar
  const totalHeaderHeight = headerHeight + tabHeight; // Combined height
  
  // Smooth header animation with easing
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, totalHeaderHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });
  
  // Smooth tab animation - moves up with header but stays visible
  const tabTranslateY = scrollY.interpolate({
    inputRange: [0, totalHeaderHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  const filteredMessages = teamMessages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const handleMessagePress = (messageItem: MessagePreview) => {
    // Navigate to chat screen
    router.push({
      pathname: '/(employee)/chat',
      params: {
        name: messageItem.name,
        profileImage: messageItem.profileImage,
        fromMessagesTab: 'true',
      }
    });
  };

  const renderTabBar = () => (
    <View style={styles.tabBarContainer}>
      <View style={styles.centeredContent}>
        <View style={styles.tabRow}>
          {TAB_ITEMS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key as 'notifications' | 'messages')}
              activeOpacity={0.7}
            >
              <View style={styles.tabLabelWrapper}>
                <Text style={styles.tabLabel}>{tab.label}</Text>
                <View style={styles.tabUnderlineContainer}>
                  {activeTab === tab.key && <View style={styles.tabUnderline} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return '#666666';
    }
  };

  const renderNotification: ListRenderItem<EmployeeNotification> = ({ item }) => {
    const priorityColor = getPriorityColor((item as any).priority || 'low');
    const iconName = (item as any).icon || (item.type === 'schedule' ? 'time-outline' : item.type === 'appointment' ? 'calendar-outline' : 'information-circle-outline');
    const timestamp = (item as any).timestamp || item.time || '';
    const hasRoute = Boolean((item as any).route);
    const handlePress = () => {
      if (hasRoute) {
        router.push({
          pathname: (item as any).route,
          params: (item as any).params || {},
        } as any);
      }
    };
    return (
      <TouchableOpacity
        style={[styles.notificationContainer, !hasRoute && { opacity: 0.6 }]}
        onPress={handlePress}
        activeOpacity={hasRoute ? 0.8 : 1}
        disabled={!hasRoute}
      >
        <View style={styles.notificationHeader}>
          <View style={[styles.iconContainer, { backgroundColor: priorityColor + '20' }]}>
            <Ionicons name={iconName as any} size={20} color={priorityColor} />
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTimestamp}>{timestamp}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage: ListRenderItem<MessagePreview> = ({ item }) => (
    <TouchableOpacity style={styles.messageItem} onPress={() => handleMessagePress(item)}>
      <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      <View style={styles.messageContent}>
        <Text style={styles.username}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          {/* Animated Header */}
          <Animated.View 
            style={[
              styles.headerContainer,
              {
                transform: [{ translateY: headerTranslateY }],
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: '#fff',
              }
            ]}
          >
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>{userData.username}</Text>
            <View style={styles.headerSpacer} />
          </Animated.View>
          
          {/* Fixed Tab Bar */}
          <Animated.View
            style={[
              styles.tabBarContainer,
              {
                transform: [{ translateY: tabTranslateY }],
                position: 'absolute',
                top: headerHeight,
                left: 0,
                right: 0,
                zIndex: 999, // Ensure it's above content
                backgroundColor: '#fff',
              }
            ]}
          >
            <View style={styles.centeredContent}>
              <View style={styles.tabRow}>
                {TAB_ITEMS.map(tab => (
                  <TouchableOpacity
                    key={tab.key}
                    style={styles.tabItem}
                    onPress={() => setActiveTab(tab.key as 'notifications' | 'messages')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tabLabelWrapper}>
                      <Text style={styles.tabLabel}>{tab.label}</Text>
                      <View style={styles.tabUnderlineContainer}>
                        {activeTab === tab.key && <View style={styles.tabUnderline} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
          
          {activeTab === 'messages' && (
            <Animated.View 
              style={[
                styles.searchBarContainer,
                {
                  transform: [{ translateY: tabTranslateY }],
                  position: 'absolute',
                  top: headerHeight + tabHeight + 8,
                  left: 16,
                  right: 16,
                  zIndex: 998,
                }
              ]}
            >
              <Ionicons name="search-outline" size={16} color="#9A9A9A" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#9A9A9A"
                value={search}
                onChangeText={setSearch}
              />
            </Animated.View>
          )}
          
          {activeTab === 'notifications' ? (
            <Animated.FlatList
              data={notifications}
              keyExtractor={item => item.id}
              renderItem={renderNotification}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: totalHeaderHeight + 16, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            />
          ) : (
            <Animated.FlatList
              data={filteredMessages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: totalHeaderHeight + 60, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            />
          )}
        </View>
      </View>
      
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/AdminHomeScreen')}>
          <Ionicons name="home-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/explore2')}>
          <Ionicons name="search-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="chatbubble" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/EmployeeProfileScreen')}>
          <Ionicons name="person-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  centeredContent: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#fff',
    height: 48,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    paddingVertical: 8,
  },
  tabLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  tabLabel: {
    fontSize: 15,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabUnderlineContainer: {
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  tabUnderline: {
    width: 120,
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  // Notifications styles
  notificationContainer: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  // Messages styles
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    height: 36,
    margin: 12,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#000',
    padding: 0,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  messageContent: {
    flex: 1,
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 12,
    color: '#9A9A9A',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    color: '#9A9A9A',
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  activeNavItem: {
    // Active state styling if needed
  },
});

export default Notification2Screen;
