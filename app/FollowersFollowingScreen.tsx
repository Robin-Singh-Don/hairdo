import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, TextInput, ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import BottomBar from '../components/BottomBar';

// Mock data for followers and following
const mockFollowers = [
  {
    id: '1',
    name: 'Alex Johnson',
    username: 'alex.j',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center',
    isFollowing: true,
    mutualFriends: 3,
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    username: 'sarah.w',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center',
    isFollowing: false,
    mutualFriends: 1,
  },
  {
    id: '3',
    name: 'Mike Davis',
    username: 'mike.d',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center',
    isFollowing: true,
    mutualFriends: 5,
  },
  {
    id: '4',
    name: 'Emma Brown',
    username: 'emma.b',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center',
    isFollowing: false,
    mutualFriends: 2,
  },
  {
    id: '5',
    name: 'David Lee',
    username: 'david.l',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=center',
    isFollowing: true,
    mutualFriends: 0,
  },
];

const mockFollowing = [
  {
    id: '1',
    name: 'John Smith',
    username: 'john.s',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center',
    isFollowingBack: true,
    mutualFriends: 3,
  },
  {
    id: '2',
    name: 'Lisa Anderson',
    username: 'lisa.a',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center',
    isFollowingBack: false,
    mutualFriends: 1,
  },
  {
    id: '3',
    name: 'Tom Wilson',
    username: 'tom.w',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center',
    isFollowingBack: true,
    mutualFriends: 5,
  },
  {
    id: '4',
    name: 'Rachel Green',
    username: 'rachel.g',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center',
    isFollowingBack: false,
    mutualFriends: 2,
  },
  {
    id: '5',
    name: 'Chris Martin',
    username: 'chris.m',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=center',
    isFollowingBack: true,
    mutualFriends: 0,
  },
  {
    id: '6',
    name: 'Amanda Taylor',
    username: 'amanda.t',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center',
    isFollowingBack: false,
    mutualFriends: 4,
  },
];

type FollowerItem = typeof mockFollowers[0];
type FollowingItem = typeof mockFollowing[0];

const TAB_ITEMS = [
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
];

const FollowersFollowingScreen = () => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredFollowers = mockFollowers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFollowing = mockFollowing.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  const renderTabBar = () => (
    <View style={styles.tabBarContainer}>
      <View style={styles.centeredContent}>
        <View style={styles.tabRow}>
          {TAB_ITEMS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key as 'followers' | 'following')}
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

  const renderFollower: ListRenderItem<FollowerItem> = ({ item }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      <View style={styles.userContent}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
        {item.mutualFriends > 0 && (
          <Text style={styles.mutualFriends}>{item.mutualFriends} mutual friends</Text>
        )}
      </View>
      <TouchableOpacity 
        style={[
          styles.followButton,
          item.isFollowing ? styles.followingButton : styles.followButton
        ]}
      >
        <Text style={[
          styles.followButtonText,
          item.isFollowing ? styles.followingButtonText : styles.followButtonText
        ]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFollowing: ListRenderItem<FollowingItem> = ({ item }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      <View style={styles.userContent}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
        {item.mutualFriends > 0 && (
          <Text style={styles.mutualFriends}>{item.mutualFriends} mutual friends</Text>
        )}
        {item.isFollowingBack && (
          <View style={styles.followsBackBadge}>
            <Text style={styles.followsBackText}>Follows you</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.followingButton}>
        <Text style={styles.followingButtonText}>Following</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.centeredContent}>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Robin.10</Text>
              <View style={{ width: 40 }} />
            </View>

            {renderTabBar()}

            {/* Search Bar */}
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

            {/* Content */}
            {activeTab === 'followers' ? (
              <FlatList
                data={filteredFollowers}
                keyExtractor={item => item.id}
                renderItem={renderFollower}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <FlatList
                data={filteredFollowing}
                keyExtractor={item => item.id}
                renderItem={renderFollowing}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
        <BottomBar />
      </SafeAreaView>
    </>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userContent: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 11,
    color: '#999',
  },
  followsBackBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  followsBackText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
  followButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  followingButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  followingButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default FollowersFollowingScreen; 