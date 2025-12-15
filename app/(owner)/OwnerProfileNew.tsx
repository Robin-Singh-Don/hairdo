import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { OwnerProfilePost } from '../../services/mock/AppMockData';
import { supabaseClient } from '../../services/supabase/SupabaseConfig';

const { width } = Dimensions.get('window');

interface ProfileData {
  name: string;
  handle: string;
  bio: string;
}

export default function OwnerProfileNew() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'promotions'>('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'text' | 'image' | 'video'>('text');

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    name: "Man's Cave Salon",
    handle: "@manscave_salon",
    bio: "Premium men's hair salon specializing in modern cuts and styling. Book your appointment today!",
  });

  // Posts state
  const [posts, setPosts] = useState<OwnerProfilePost[]>([]);

  // Stats state
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    rating: 0,
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  // Load profile data function
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to load profile from Supabase first
      let profileData: ProfileData;
      if (user && supabaseClient) {
        try {
          const { data: supabaseProfile, error } = await supabaseClient
            .from('profiles')
            .select('full_name, username, bio')
            .eq('user_id', user.id)
            .single();

          if (!error && supabaseProfile) {
            profileData = {
              name: supabaseProfile.full_name || supabaseProfile.name || user.displayName || '',
              handle: supabaseProfile.username ? `@${supabaseProfile.username}` : '',
              bio: supabaseProfile.bio || '',
            };
          } else {
            // Fallback to API
            profileData = await ownerAPI.getOwnerProfile();
          }
        } catch (supabaseError) {
          console.error('Supabase error, using API fallback:', supabaseError);
          profileData = await ownerAPI.getOwnerProfile();
        }
      } else {
        // No Supabase, use API
        profileData = await ownerAPI.getOwnerProfile();
      }

      const [postsData, customersData, reviewsData] = await Promise.all([
        ownerAPI.getOwnerProfilePosts(),
        ownerAPI.getCustomers(),
        ownerAPI.getCustomerReviews(),
      ]);
      
      setProfile(profileData);
      setPosts(postsData);
      
      // Calculate stats
      const avgRating = reviewsData.length > 0
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
        : 0;
      
      setStats({
        posts: postsData.length,
        followers: customersData.length,
        rating: Math.round(avgRating * 10) / 10,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when screen comes into focus (after editing)
  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure any database updates are committed
      const timer = setTimeout(() => {
        loadData();
      }, 100);
      
      return () => clearTimeout(timer);
    }, [loadData])
  );


  // Handle header back button
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);


  // Render profile field (read-only)
  const renderProfileField = (
    field: 'name' | 'handle' | 'bio',
    value: string
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text 
          style={field === 'name' ? styles.profileName : field === 'handle' ? styles.profileHandle : styles.profileBio}
        >
          {value}
        </Text>
      </View>
    );
  };

  // Render post (read-only)
  const renderPost = (post: OwnerProfilePost) => {
    return (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.postAuthor}>
            <View style={styles.postAvatar}>
              <Text style={styles.postAvatarText}>👨‍💼</Text>
            </View>
            <View style={styles.postAuthorInfo}>
              <Text style={styles.postAuthorName}>{profile.name}</Text>
              <Text style={styles.postTimestamp}>{post.timestamp}</Text>
            </View>
          </View>
          {post.isPromotion && (
            <View style={styles.promotionBadge}>
              <Text style={styles.promotionText}>PROMOTION</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.postContent}>{post.content}</Text>
        
        {post.type === 'image' && post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
        )}
        
        {post.type === 'video' && post.videoUrl && (
          <View style={styles.videoContainer}>
            <Image source={{ uri: post.videoUrl }} style={styles.postImage} />
            <View style={styles.playButton}>
              <Ionicons name="play" size={40} color="#fff" />
            </View>
          </View>
        )}
        
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCreatePostModal = () => (
    <Modal
      visible={showCreatePost}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCreatePost(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={() => {
              Alert.alert('Success', 'Post created successfully!');
              setShowCreatePost(false);
              setNewPostContent('');
            }}>
              <Text style={styles.postText}>Post</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.createPostContent}>
            <View style={styles.createPostAuthor}>
              <View style={styles.createPostAvatar}>
                <Text style={styles.createPostAvatarText}>👨‍💼</Text>
              </View>
              <Text style={styles.createPostName}>{profile.name}</Text>
            </View>
            
            <TextInput
              style={styles.postInput}
              placeholder="What's happening at your salon?"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              textAlignVertical="top"
            />
            
            <View style={styles.postTypeSelector}>
              <TouchableOpacity 
                style={[styles.typeButton, newPostType === 'text' && styles.activeTypeButton]}
                onPress={() => setNewPostType('text')}
              >
                <Ionicons name="document-text" size={20} color={newPostType === 'text' ? '#fff' : '#666'} />
                <Text style={[styles.typeButtonText, newPostType === 'text' && styles.activeTypeButtonText]}>Text</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeButton, newPostType === 'image' && styles.activeTypeButton]}
                onPress={() => setNewPostType('image')}
              >
                <Ionicons name="image" size={20} color={newPostType === 'image' ? '#fff' : '#666'} />
                <Text style={[styles.typeButtonText, newPostType === 'image' && styles.activeTypeButtonText]}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeButton, newPostType === 'video' && styles.activeTypeButton]}
                onPress={() => setNewPostType('video')}
              >
                <Ionicons name="videocam" size={20} color={newPostType === 'video' ? '#fff' : '#666'} />
                <Text style={[styles.typeButtonText, newPostType === 'video' && styles.activeTypeButtonText]}>Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const filteredPosts = posts.filter(post => 
    activeTab === 'posts' ? !post.isPromotion : post.isPromotion
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{profile.name}</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/(owner)/OwnerSettings')}
        >
          <View style={styles.settingsButtonBackground}>
            <Ionicons name="menu" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👨‍💼</Text>
          </View>
          
          {renderProfileField('name', profile.name)}
          {renderProfileField('handle', profile.handle)}
          {renderProfileField('bio', profile.bio)}
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'promotions' && styles.activeTab]}
            onPress={() => setActiveTab('promotions')}
          >
            <Text style={[styles.tabText, activeTab === 'promotions' && styles.activeTabText]}>
              Promotions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsContainer}>
          {filteredPosts.map(renderPost)}
        </View>
      </ScrollView>

      {/* Create Post Button */}
      <TouchableOpacity 
        style={styles.createPostButton}
        onPress={() => setShowCreatePost(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {renderCreatePostModal()}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  
  // Profile Header
  profileHeader: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 35,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profileHandle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },

  // Profile Fields
  fieldContainer: {
    width: '100%',
    marginBottom: 8,
    alignItems: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },

  // Posts
  postsContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postAvatarText: {
    fontSize: 20,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  postTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  promotionBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  promotionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  videoContainer: {
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },

  // Create Post Button
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  postText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  createPostContent: {
    padding: 20,
  },
  createPostAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createPostAvatarText: {
    fontSize: 20,
  },
  createPostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  postTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeTypeButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTypeButtonText: {
    color: '#fff',
  },

});
