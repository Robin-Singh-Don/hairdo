import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, TextInput, ListRenderItem, Animated, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import BottomBar from '../../components/BottomBar';
import { customerAPI } from '../../services/api/customerAPI';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile, MessagePreview } from '../../services/mock/AppMockData';
import { supabaseClient } from '../../services/supabase/SupabaseConfig';

interface NotificationItem {
  id: string;
  type: 'text' | 'appointment' | 'promotion' | 'system';
  username: string;
  subtitle?: string;
  profileImage: string;
  message?: string;
  title?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export default function InboxScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams();
  const { profileData } = useProfile();
  const { user } = useAuth();
  
  // API state
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [messagePreviews, setMessagePreviews] = useState<MessagePreview[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Transform Supabase notification to NotificationItem
  const transformNotification = (notif: any): NotificationItem => {
    // Extract username from title or use a default
    const username = notif.title?.split(' ')[0] || 'System';
    
    // Determine notification type from Supabase type
    let notificationType: 'text' | 'appointment' | 'promotion' | 'system' = 'text';
    if (notif.type?.includes('appointment') || notif.type?.includes('booking')) {
      notificationType = 'appointment';
    } else if (notif.type?.includes('promotion') || notif.type?.includes('marketing')) {
      notificationType = 'promotion';
    } else if (notif.type?.includes('system')) {
      notificationType = 'system';
    }

    return {
      id: notif.id,
      type: notificationType,
      username: username,
      subtitle: notif.action_data?.subtitle || notif.action_data?.businessName,
      profileImage: notif.action_data?.profileImage || 'https://via.placeholder.com/48',
      message: notif.body || notif.message || notif.title,
      title: notif.title,
      isRead: !!notif.read_at,
      createdAt: notif.created_at,
      actionUrl: notif.action_url || notif.action_data?.actionUrl,
    };
  };

  // Load notifications from Supabase
  const loadNotifications = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (user && supabaseClient) {
        // Try to load from Supabase
        const { data: supabaseNotifications, error } = await supabaseClient
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .or('user_type.eq.customer,user_type.is.null')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && supabaseNotifications) {
          const transformedNotifications = supabaseNotifications.map(transformNotification);
          setNotifications(transformedNotifications);
        } else {
          // Fallback to API if Supabase fails
          console.error('Supabase error, using API fallback:', error);
          // For now, use empty array - can add API fallback if needed
          setNotifications([]);
        }
      } else {
        // No Supabase, use empty array
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Load messages from Supabase
  const loadMessages = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      }

      if (user && supabaseClient) {
        // Try to load conversations from Supabase
        // First, try conversations table (if it exists)
        const { data: conversations, error: conversationsError } = await supabaseClient
          .from('conversations')
          .select('id, participant_ids, last_message_at, last_message_text, created_at')
          .contains('participant_ids', [user.id])
          .order('last_message_at', { ascending: false })
          .limit(50);

        if (!conversationsError && conversations && conversations.length > 0) {
          // Get participant profiles for each conversation
          const transformedPromises = conversations.map(async (conv: any) => {
            // Get the other participant (not the current user)
            const otherParticipantId = conv.participant_ids?.find((id: string) => id !== user.id);
            
            if (!otherParticipantId) return null;

            // Get profile of the other participant
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('username, full_name, profile_image')
              .eq('user_id', otherParticipantId)
              .single();

            return {
              id: conv.id,
              name: profile?.full_name || profile?.username || 'Unknown User',
              profileImage: profile?.profile_image || 'https://via.placeholder.com/48',
              lastMessage: conv.last_message_text || 'Tap to view conversation',
              timestamp: formatTimeAgo(conv.last_message_at || conv.created_at),
            };
          });

          const transformed = (await Promise.all(transformedPromises)).filter(Boolean) as MessagePreview[];
          setMessagePreviews(transformed);
        } else {
          // Fallback: Try to get from messages table directly and group by sender/receiver
          const { data: messages, error: messagesError } = await supabaseClient
            .from('messages')
            .select('id, sender_id, receiver_id, text, created_at, conversation_id')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(100);

          if (!messagesError && messages && messages.length > 0) {
            // Group messages by conversation/participant
            const conversationMap = new Map<string, { message: any; timestamp: string }>();
            
            messages.forEach((msg: any) => {
              const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
              const convKey = msg.conversation_id || otherUserId;
              
              if (!conversationMap.has(convKey)) {
                conversationMap.set(convKey, { message: msg, timestamp: msg.created_at });
              }
            });

            // Get profiles for all participants
            const participantIds = Array.from(new Set(
              Array.from(conversationMap.values()).map(m => 
                m.message.sender_id === user.id ? m.message.receiver_id : m.message.sender_id
              )
            ));

            const { data: profiles } = await supabaseClient
              .from('profiles')
              .select('user_id, username, full_name, profile_image')
              .in('user_id', participantIds);

            const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

            // Transform to MessagePreview format
            const transformed: MessagePreview[] = Array.from(conversationMap.entries()).map(([convKey, data]) => {
              const msg = data.message;
              const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
              const profile = profileMap.get(otherUserId);

              return {
                id: convKey,
                name: profile?.full_name || profile?.username || 'Unknown User',
                profileImage: profile?.profile_image || 'https://via.placeholder.com/48',
                lastMessage: msg.text || '',
                timestamp: formatTimeAgo(data.timestamp),
              };
            });

            setMessagePreviews(transformed);
          } else {
            // Final fallback to API (mock data)
            console.log('Supabase messages not available, using API fallback');
            const messagePreviewsResponse = await customerAPI.getMessagePreviews();
            setMessagePreviews(messagePreviewsResponse);
          }
        }
      } else {
        // No Supabase, use API (mock data)
        const messagePreviewsResponse = await customerAPI.getMessagePreviews();
        setMessagePreviews(messagePreviewsResponse);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback to API (mock data)
      try {
        const messagePreviewsResponse = await customerAPI.getMessagePreviews();
        setMessagePreviews(messagePreviewsResponse);
      } catch (apiError) {
        console.error('API fallback also failed:', apiError);
        setMessagePreviews([]);
      }
    } finally {
      if (showRefreshing) {
        setRefreshing(false);
      }
    }
  }, [user]);

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const userDataResponse = await customerAPI.getUserProfile();
      setUserData(userDataResponse);
      
      // Load notifications and messages in parallel
      await Promise.all([
        loadNotifications(),
        loadMessages()
      ]);
    } catch (error) {
      console.error('Error loading inbox data:', error);
      Alert.alert('Error', 'Failed to load inbox data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loadNotifications, loadMessages]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      loadMessages();
    }, [loadNotifications, loadMessages])
  );

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      if (user && supabaseClient) {
        const { error } = await supabaseClient
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', notificationId)
          .eq('user_id', user.id);

        if (!error) {
          setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          ));
        } else {
          // Fallback to API
          await customerAPI.markNotificationAsRead(notificationId);
          setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          ));
        }
      } else {
        await customerAPI.markNotificationAsRead(notificationId);
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const TAB_ITEMS = [
    { key: 'notifications', label: 'Notifications' },
    { key: 'messages', label: 'Messages' },
  ];

  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>(
    tab === 'messages' ? 'messages' : 'notifications'
  );
  const [search, setSearch] = useState('');
  
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

  const filteredMessages = messagePreviews.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const handleMessagePress = (messageItem: MessagePreview) => {
    router.push({
      pathname: '/(customer)/chat',
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

  const renderNotification: ListRenderItem<NotificationItem> = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.notificationContainer,
          !item.isRead && styles.unreadNotification
        ]}
        onPress={() => {
          if (!item.isRead) {
            markAsRead(item.id);
          }
          // Navigate if actionUrl exists
          if (item.actionUrl) {
            router.push(item.actionUrl as any);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
          <View style={styles.notificationContent}>
            <View style={styles.notificationTitleRow}>
              <Text style={[styles.username, !item.isRead && styles.unreadText]}>
                {item.username} <Text style={styles.message}>{item.message || item.title}</Text>
              </Text>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
            <Text style={styles.notificationTime}>{formatTimeAgo(item.createdAt)}</Text>
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

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading inbox...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          {/* Animated Header with Back Button */}
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{profileData.username}</Text>
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
            notifications.length > 0 ? (
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
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} />
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyStateText}>No notifications yet</Text>
                    <Text style={styles.emptyStateSubtext}>You'll see notifications here when they arrive</Text>
                  </View>
                }
              />
            ) : (
              <View style={[styles.emptyState, { paddingTop: totalHeaderHeight + 60 }]}>
                <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No notifications yet</Text>
                <Text style={styles.emptyStateSubtext}>You'll see notifications here when they arrive</Text>
              </View>
            )
          ) : (
            messagePreviews.length > 0 ? (
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
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={() => loadMessages(true)} />
                }
              />
            ) : (
              <View style={[styles.emptyState, { paddingTop: totalHeaderHeight + 100 }]}>
                <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No messages yet</Text>
                <Text style={styles.emptyStateSubtext}>Start a conversation to see messages here</Text>
              </View>
            )
          )}
        </View>
      </View>
      <BottomBar />
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
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAEAEA',
    marginRight: 8,
  },
  notificationContent: {
    flex: 1,
  },
  username: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  message: {
    fontWeight: '400',
    color: '#5A5A5A',
  },
  subtitle: {
    fontSize: 11,
    color: '#5A5A5A',
    marginTop: 2,
  },
  availableText: {
    fontSize: 12,
    color: '#5A5A5A',
    fontWeight: '400',
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
  unreadNotification: {
    backgroundColor: '#F8F9FA',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginLeft: 8,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTime: {
    fontSize: 11,
    color: '#9A9A9A',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
}); 