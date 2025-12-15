import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { ownerAPI } from '../../services/api/ownerAPI';
import { supabaseClient } from '../../services/supabase/SupabaseConfig';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  time: string;
  isRead: boolean;
  category: 'business' | 'staff' | 'customer' | 'system';
  createdAt: string;
  priority?: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export default function OwnerNotifications() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Map notification type to category
  const getCategoryFromType = (type: string): 'business' | 'staff' | 'customer' | 'system' => {
    // Staff-related notifications
    if (type.includes('staff') || type.includes('employee') || type.includes('schedule') || type.includes('time_off')) {
      return 'staff';
    }
    // Customer-related notifications
    if (type.includes('customer') || type.includes('appointment') || type.includes('booking') || type.includes('review')) {
      return 'customer';
    }
    // Business-related notifications
    if (type.includes('revenue') || type.includes('payment') || type.includes('business') || type.includes('marketing')) {
      return 'business';
    }
    // System notifications
    return 'system';
  };

  // Map notification type to priority/color
  const getTypeFromPriority = (priority?: string, type?: string): 'critical' | 'warning' | 'info' | 'success' => {
    if (priority === 'high' || type?.includes('critical') || type?.includes('alert')) {
      return 'critical';
    }
    if (priority === 'medium' || type?.includes('warning')) {
      return 'warning';
    }
    if (type?.includes('success') || type?.includes('completed')) {
      return 'success';
    }
    return 'info';
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          .or('user_type.eq.owner,user_type.is.null')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && supabaseNotifications) {
          // Transform Supabase data to our format
          const transformedNotifications: Notification[] = supabaseNotifications.map((notif: any) => ({
            id: notif.id,
            title: notif.title || 'Notification',
            message: notif.body || notif.message || '',
            type: getTypeFromPriority(notif.priority, notif.type),
            time: formatTimeAgo(notif.created_at),
            isRead: !!notif.read_at,
            category: getCategoryFromType(notif.type || ''),
            createdAt: notif.created_at,
            priority: notif.priority || 'medium',
            actionUrl: notif.action_url || notif.data?.actionUrl,
          }));

          setNotifications(transformedNotifications);
        } else {
          // Fallback to API if Supabase fails
          console.error('Supabase error, using API fallback:', error);
          const notificationsData = await ownerAPI.getNotifications();
          // Transform API data to include category
          const transformed: Notification[] = notificationsData.map((notif: any) => ({
            id: notif.id,
            title: notif.title,
            message: notif.message,
            type: getTypeFromPriority(undefined, notif.type),
            time: notif.time,
            isRead: notif.isRead,
            category: getCategoryFromType(notif.type || 'general'),
            createdAt: new Date().toISOString(),
          }));
          setNotifications(transformed);
        }
      } else {
        // No Supabase, use API
        const notificationsData = await ownerAPI.getNotifications();
        const transformed: Notification[] = notificationsData.map((notif: any) => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: getTypeFromPriority(undefined, notif.type),
          time: notif.time,
          isRead: notif.isRead,
          category: getCategoryFromType(notif.type || 'general'),
          createdAt: new Date().toISOString(),
        }));
        setNotifications(transformed);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
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
          // Update local state
          setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          ));
        } else {
          // Fallback to API
          await ownerAPI.markNotificationAsRead(notificationId);
          setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          ));
        }
      } else {
        await ownerAPI.markNotificationAsRead(notificationId);
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      if (user && supabaseClient) {
        const { error } = await supabaseClient
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .is('read_at', null);

        if (!error) {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          Alert.alert('Success', 'All notifications marked as read');
        } else {
          // Fallback to API
          await ownerAPI.markAllNotificationsAsRead();
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
      } else {
        await ownerAPI.markAllNotificationsAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const filteredNotifications = selectedFilter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.category === selectedFilter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      case 'success': return 'checkmark-circle';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      case 'success': return '#4CAF50';
      default: return '#666';
    }
  };

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity 
      key={notification.id}
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => {
        if (!notification.isRead) {
          markAsRead(notification.id);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={[
              styles.notificationTitle,
              !notification.isRead && styles.unreadText
            ]}>
              {notification.title}
            </Text>
            {!notification.isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>
          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>
              {notification.time}
            </Text>
            <View style={[styles.categoryBadge, styles[`categoryBadge${notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}`]]}>
              <Text style={styles.categoryText}>{notification.category}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.notificationIcon, { backgroundColor: getNotificationColor(notification.type) + '20' }]}>
          <Ionicons 
            name={getNotificationIcon(notification.type) as any} 
            size={20} 
            color={getNotificationColor(notification.type)} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: string, label: string, count: number) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getFilterCount = (filter: string) => {
    if (filter === 'all') return notifications.length;
    return notifications.filter(n => n.category === filter).length;
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Alerts & Notifications</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Alerts & Notifications</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} />
        }
      >
        {/* Filter Buttons - Always visible */}
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All', getFilterCount('all'))}
          {renderFilterButton('business', 'Business', getFilterCount('business'))}
          {renderFilterButton('staff', 'Staff', getFilterCount('staff'))}
          {renderFilterButton('customer', 'Customer', getFilterCount('customer'))}
          {renderFilterButton('system', 'System', getFilterCount('system'))}
        </View>

        {/* Notifications List or Empty State */}
        {filteredNotifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {filteredNotifications.map(renderNotification)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'all' 
                ? 'No notifications yet' 
                : `No ${selectedFilter} notifications`}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              You'll see notifications here when they arrive
            </Text>
          </View>
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    position: 'relative',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Filter Buttons
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  filterButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  
  // Notifications List
  notificationsList: {
    marginBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    // Removed black left border
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeBusiness: {
    backgroundColor: '#E3F2FD',
  },
  categoryBadgeStaff: {
    backgroundColor: '#FFF3E0',
  },
  categoryBadgeCustomer: {
    backgroundColor: '#E8F5E9',
  },
  categoryBadgeSystem: {
    backgroundColor: '#F3E5F5',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  
});
