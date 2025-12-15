import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, FlatList, SafeAreaView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';
import { EmployeeReview, EmployeeProfileData } from '../../services/mock/AppMockData';

// Profile data is now loaded from API

type GalleryItem = {
  id: string;
  label: string;
  image: string;
};

const postsData: GalleryItem[] = [
  { id: '1', label: 'Fresh Fade Cut', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80' },
  { id: '2', label: 'Wedding Styling', image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=400&q=80' },
  { id: '3', label: 'Beard Trim & Shape', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80' },
  { id: '4', label: 'Hair Coloring', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80' },
  { id: '5', label: 'Modern Bob Cut', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: '6', label: 'Creative Styling', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80' },
];

const savedData: GalleryItem[] = [
  { id: 's1', label: 'Amazing haircut style', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80' },
  { id: 's2', label: 'Modern fade design', image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=400&q=80' },
  { id: 's3', label: 'Classic barber style', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80' },
  { id: 's4', label: 'Trendy undercut', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80' },
  { id: 's5', label: 'Professional look', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 's6', label: 'Creative styling', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80' },
];

// Reviews data is now loaded from API

export default function EmployeeProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews' | 'saved'>('posts');
  
  // API state
  const [reviews, setReviews] = useState<EmployeeReview[]>([]);
  const [profileData, setProfileData] = useState<EmployeeProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [reviewsData, profileDataResponse] = await Promise.all([
          employeeAPI.getEmployeeReviews(),
          employeeAPI.getEmployeeProfileData()
        ]);
        setReviews(reviewsData);
        setProfileData(profileDataResponse);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }


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

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.clientImage }} style={styles.reviewerAvatar} />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.clientName}</Text>
          <View style={styles.reviewRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star} 
                name={star <= item.rating ? 'star' : 'star-outline'} 
                size={14} 
                color="#FFD700" 
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>
      <Text style={styles.reviewText}>{item.review}</Text>
      <Text style={styles.reviewService}>{item.service}</Text>
    </View>
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
        style={[styles.tabItem, activeTab === 'reviews' && styles.activeTabItem]}
        onPress={() => setActiveTab('reviews')}
      >
        <Ionicons 
          name="star-outline" 
          size={20} 
          color={activeTab === 'reviews' ? '#000' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
          Reviews
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
                <Text style={styles.usernameHeader}>{profileData?.username || 'Loading...'}</Text>
              </View>
              <TouchableOpacity style={styles.menuIconBtn} onPress={() => router.push('EmployeeSettingsScreen' as any)}>
                <Feather name="menu" size={22} color="#000" />
              </TouchableOpacity>
            </View>
            {/* Profile Image + Stats Row */}
            <View style={styles.profileStatsRow}>
              <Image source={{ uri: profileData?.profileImage || 'https://via.placeholder.com/150' }} style={styles.profileImageCentered} />
            </View>
            <View style={styles.nameEditColCentered}>
              <Text style={styles.displayNameCentered}>{profileData?.displayName || 'Loading...'}</Text>
            </View>
          </View>

          {/* Tab Bar */}
          {renderTabBar()}

          {/* Content */}
          {activeTab === 'reviews' && (
            <FlatList
              data={reviews}
              renderItem={renderReviewItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.reviewsContainer}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            />
          )}
          {activeTab === 'posts' && (
            <FlatList
              data={postsData}
              renderItem={renderGalleryItem}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.galleryRow}
              contentContainerStyle={styles.galleryGrid}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            />
          )}
          {activeTab === 'saved' && (
            <FlatList
              data={savedData}
              renderItem={renderGalleryItem}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.galleryRow}
              contentContainerStyle={styles.galleryGrid}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            />
          )}
        </View>
      </ScrollView>
      
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
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/notification2')}>
          <Ionicons name="chatbubble-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="person" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
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
  reviewsContainer: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewService: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
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