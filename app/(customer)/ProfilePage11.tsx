import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, FlatList } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomBar from '../../components/BottomBar';
import { useProfile } from '../../contexts/ProfileContext';

// For Expo Router, use the options export to hide the header
export const options = { headerShown: false };

// Profile data is now managed by ProfileContext

type GalleryItem = {
  id: string;
  label: string;
  image: string;
};

const postsData: GalleryItem[] = [
  { id: '1', label: 'Pools that make us dream', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { id: '2', label: 'Incredible beach houses', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
  { id: '3', label: 'Dreamy creek', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
  { id: '4', label: 'Beautiful beach inspiration', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80' },
];

const savedData: GalleryItem[] = [
  { id: 's1', label: 'Amazing haircut style', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80' },
  { id: 's2', label: 'Modern fade design', image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=400&q=80' },
  { id: 's3', label: 'Classic barber style', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80' },
  { id: 's4', label: 'Trendy undercut', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80' },
  { id: 's5', label: 'Professional look', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 's6', label: 'Creative styling', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80' },
];

export default function ProfilePage11() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const { profileData } = useProfile();

  const renderGalleryItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity 
      style={styles.galleryCard}
      onPress={() => router.push({ pathname: '/PostViewerScreen' as any, params: { postId: item.id } })}
    >
      <Image source={{ uri: item.image }} style={styles.galleryImage} />
      <View style={styles.galleryOverlay} />
      <Text style={styles.galleryLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderTabBar = () => (
    <View style={styles.tabBarContainer}>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'posts' && styles.activeTabItem]}
        onPress={() => setActiveTab('posts')}
      >
        <Ionicons 
          name="grid-outline" 
          size={20} 
          color={activeTab === 'posts' ? '#000' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
          Posts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'saved' && styles.activeTabItem]}
        onPress={() => setActiveTab('saved')}
      >
        <Ionicons 
          name="bookmark-outline" 
          size={20} 
          color={activeTab === 'saved' ? '#000' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
          Saved
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrapper}>
          {/* Profile Header */}
          <View style={styles.profileHeaderWrapper}>
            {/* Top Navigation Bar */}
            <View style={styles.topNavBar}>
              <View style={styles.topNavLeftGroup}>
                <Text style={styles.usernameHeader}>{profileData?.username || 'User'}</Text>
              </View>
              <TouchableOpacity style={styles.menuIconBtn} onPress={() => router.push('SettingsScreen' as any)}>
                <Feather name="menu" size={22} color="#000" />
              </TouchableOpacity>
            </View>
            {/* Profile Image + Stats Row */}
            <View style={styles.profileStatsRow}>
              <Image source={{ uri: profileData?.profileImage || 'https://via.placeholder.com/60' }} style={styles.profileImageCentered} />
            </View>
            <View style={styles.nameEditColCentered}>
              <Text style={styles.displayNameCentered}>{profileData?.name || 'User Name'}</Text>
              <TouchableOpacity style={styles.editBtnCentered} onPress={() => router.push('/EditProfileScreen' as any)}>
                <Text style={styles.editBtnText}>Edit profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab Bar */}
          {renderTabBar()}

          {/* Content Grid */}
          <FlatList
            data={activeTab === 'posts' ? postsData : savedData}
            renderItem={renderGalleryItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.galleryRow}
            contentContainerStyle={styles.galleryGrid}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          />
        </View>
      </ScrollView>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 0,
  },
  scrollContent: {
    alignItems: 'center',
    width: '100%',
  },
  contentWrapper: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#FFF',
  },
  profileHeaderWrapper: {
    width: '100%',
    paddingBottom: 16,
    borderBottomWidth: 0,
    backgroundColor: '#FFF',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 32,
    marginBottom: 0,
    marginTop: 0,
  },
  topNavLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
  },
  usernameHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 0,
    marginRight: 8,
  },
  menuIconBtn: {
    marginRight: 0,
    padding: 4,
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileNameButtonCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 14,
    textAlign: 'left',
  },
  editBtn: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 0,
    width: '100%',
  },
  profileImageCentered: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  nameEditColCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 0,
    width: '100%',
  },
  displayNameCentered: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  editBtnCentered: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  galleryGrid: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  galleryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  galleryCard: {
    flex: 1,
    aspectRatio: 166 / 210,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: '#eee',
    maxWidth: '49%',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  galleryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  galleryLabel: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFF',
    zIndex: 2,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 48,
    marginTop: 16,
    marginBottom: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: '#F0F0F0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
}); 