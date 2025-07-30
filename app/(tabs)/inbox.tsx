import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, TextInput, ListRenderItem } from 'react-native';
import { notifications, NotificationItem } from './mockNotifications';
import BottomBar from '../../components/BottomBar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Message preview data
const messagePreviews = [
  {
    id: '1',
    name: 'Jenny Wilson',
    profileImage: 'https://via.placeholder.com/48',
    lastMessage: 'Hi Peter! Do u want 2 come 2 the cinema tonight?',
    timestamp: '1 hour',
  },
  {
    id: '2',
    name: 'Wade Warren',
    profileImage: 'https://via.placeholder.com/48',
    lastMessage: 'Hi man! What film?',
    timestamp: '1 hour',
  },
  {
    id: '3',
    name: 'Courtney Henry',
    profileImage: 'https://via.placeholder.com/48',
    lastMessage: 'Do you have any holidays coming up?',
    timestamp: '1 hour',
  },
];

type MessagePreview = typeof messagePreviews[0];

const TAB_ITEMS = [
  { key: 'notifications', label: 'Notifications' },
  { key: 'messages', label: 'Messages' },
];

const InboxScreen = () => {
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>(
    params.tab === 'messages' ? 'messages' : 'notifications'
  );
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredMessages = messagePreviews.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const handleMessagePress = (messageItem: MessagePreview) => {
    router.push({
      pathname: '/(tabs)/chat',
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
    if (item.type === 'promotion') {
      return (
        <View style={styles.notificationContainer}>
          <View style={styles.notificationHeader}>
            <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
            <View style={styles.notificationContent}>
              <Text style={styles.username}>{item.username}</Text>
              {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
            </View>
            <Text style={styles.availableText}>Available</Text>
          </View>
          <View style={styles.promoCard}>
            <Text style={styles.promoTitle}>{item.promoTitle}</Text>
            <Text style={styles.promoDetails}>{item.promoDetails}</Text>
            <Text style={styles.promoDescription}>{item.promoDescription}</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>{item.buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.notificationContainer}>
        <View style={styles.notificationHeader}>
          <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
          <View style={styles.notificationContent}>
            <Text style={styles.username}>{item.username} <Text style={styles.message}>{item.message}</Text></Text>
            {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
          </View>
        </View>
      </View>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          {renderTabBar()}
          {activeTab === 'messages' && (
            <View style={styles.searchBarContainer}>
              <Ionicons name="search-outline" size={16} color="#9A9A9A" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#9A9A9A"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          )}
          {activeTab === 'notifications' ? (
            <FlatList
              data={notifications}
              keyExtractor={item => item.id}
              renderItem={renderNotification}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={filteredMessages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
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
  promoCard: {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  promoDetails: {
    fontSize: 12,
    color: '#5A5A5A',
    marginBottom: 2,
  },
  promoDescription: {
    fontSize: 12,
    color: '#5A5A5A',
    marginBottom: 6,
  },
  promoButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  promoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
});

export default InboxScreen; 