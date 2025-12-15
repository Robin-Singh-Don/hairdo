import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, TextInput, Keyboard, Share, Modal, Pressable, Platform, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomBar from '../../components/BottomBar';
import { customerAPI } from '../../services/api/customerAPI';
import { TrendingCard, Post, SearchItem, AppMockData } from '../../services/mock/AppMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_WIDTH = 430; // You can adjust this for your design

// Data now loaded from API

// Types imported from AppMockData.ts

const PAGE_SIZE = 10;
const TRENDING_PAGE_SIZE = 6;

// Search data loaded from API

// Double-tap detection hook
function useDoubleTap(callback: () => void, delay = 300) {
  const lastTap = useRef<number | null>(null);
  return () => {
    const now = Date.now();
    if (lastTap.current && (now - lastTap.current) < delay) {
      callback();
    }
    lastTap.current = now;
  };
}

export default function HomeScreen() {
  // Search state
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

  // API state
  const [apiLoading, setApiLoading] = useState(true);

  // Trending pagination
  const [trending, setTrending] = useState<TrendingCard[]>([]);
  const [trendingPage, setTrendingPage] = useState(0);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingHasMore, setTrendingHasMore] = useState(true);

  // Posts pagination
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Like state for posts and trending (simulate with local state)
  const [likedPosts, setLikedPosts] = useState<{ [id: string]: boolean }>({});
  const [savedPosts, setSavedPosts] = useState<{ [id: string]: boolean }>({});
  const [likedTrending, setLikedTrending] = useState<{ [id: string]: boolean }>({});
  const [savedTrending, setSavedTrending] = useState<{ [id: string]: boolean }>({});

  // Modal state for trending actions
  const [trendingDetail, setTrendingDetail] = useState<{ trendingId: string | null; position: { x: number; y: number } | null }>({ trendingId: null, position: null });

  // Add refs for positioning
  const dotsRefs = useRef<{ [key: string]: any }>({});

  // Toggle like/save for posts
  const toggleLikePost = (id: string) => setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSavePost = (id: string) => setSavedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  // Toggle like/save for trending
  const toggleLikeTrending = (id: string) => setLikedTrending(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSaveTrending = (id: string) => setSavedTrending(prev => ({ ...prev, [id]: !prev[id] }));

  // API call for trending
  const fetchTrending = useCallback(async () => {
    if (trendingLoading || !trendingHasMore) return;
    setTrendingLoading(true);
    try {
      const newTrending = await customerAPI.getTrendingCards(trendingPage, TRENDING_PAGE_SIZE);
      setTrending(prev => [...prev, ...newTrending]);
      setTrendingHasMore(newTrending.length === TRENDING_PAGE_SIZE);
    } catch (error) {
      console.error('Error loading trending data:', error);
    } finally {
      setTrendingLoading(false);
    }
  }, [trendingPage, trendingLoading, trendingHasMore]);

  useEffect(() => { fetchTrending(); }, [trendingPage]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setApiLoading(true);
        // No followings data needed anymore
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setApiLoading(false);
      }
    };

    loadData();
  }, []);

  // API call for posts
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newPosts = await customerAPI.getPosts(page, PAGE_SIZE);
      setPosts(prev => [...prev, ...newPosts]);
      setHasMore(newPosts.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading posts data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => { fetchPosts(); }, [page]);

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (searchText.trim() === '') {
        setSearchResults([]);
        return;
      }
      
      try {
        const results = await customerAPI.searchUsers(searchText);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      }
    };

    performSearch();
  }, [searchText]);

  // Trending load more
  const handleTrendingLoadMore = () => {
    if (!trendingLoading && trendingHasMore) {
      setTrendingPage(prev => prev + 1);
    }
  };

  // Posts load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Share handler
  const handleShare = async (item: { id: string; name: string; image: string }) => {
    try {
      await Share.share({
        message: `Check out this post from ${item.name}!`,
        url: item.image,
        title: item.name,
      });
    } catch (error) {
      // Optionally handle error
    }
  };

  const router = useRouter();

  // Modal state for trending modal
  const [trendingModal, setTrendingModal] = useState<{ visible: boolean; index: number }>({ visible: false, index: 0 });

  // Render a single trending card (no three dots on HomeScreen)
  const renderTrending = ({ item, index }: { item: TrendingCard, index: number }) => {
    return (
      <Pressable onPress={() => setTrendingModal({ visible: true, index })}>
        <View style={styles.trendingCard}>
          <Image source={{ uri: item.image }} style={styles.trendingImage} />
          <View style={styles.trendingOverlay}>
            <Text style={styles.trendingName}>{item.name}</Text>
            <Text style={styles.trendingSubtitle}>{item.subtitle}</Text>
          </View>
          {/* Like and Share icons only */}
          <View style={styles.trendingActions}>
            <TouchableOpacity onPress={() => toggleLikeTrending(item.id)}>
              <Ionicons
                name={likedTrending[item.id] ? 'heart' : 'heart-outline'}
                size={24}
                color={likedTrending[item.id] ? '#e74c3c' : '#fff'}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleShare(item)}>
              <Ionicons
                name={'share-social-outline'}
                size={24}
                color={'#fff'}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  };

  // Trending modal overlay (vertical scroll, like Instagram Reels)
  const renderTrendingModal = () => (
    <Modal
      visible={trendingModal.visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setTrendingModal({ visible: false, index: 0 })}
    >
      <View style={styles.modalOverlayContainer}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => setTrendingModal({ visible: false, index: 0 })}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <FlatList
          data={trending}
          keyExtractor={item => item.id}
          horizontal={false}
          pagingEnabled
          initialScrollIndex={trendingModal.index}
          getItemLayout={(_, i) => ({ 
            length: 514 + 32, // card height + gap
            offset: (514 + 32) * i, 
            index: i 
          })}
          renderItem={({ item }) => (
            <View style={styles.modalCardWrapper}>
              <View style={styles.modalPostCard}>
                <Image source={{ uri: item.image }} style={styles.postImage} />
                <View style={styles.postOverlay}>
                  <Text style={styles.postName}>{item.name}</Text>
                  <Text style={styles.postSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.postActions}>
                  <TouchableOpacity onPress={() => toggleLikeTrending(item.id)}>
                    <Ionicons
                      name={likedTrending[item.id] ? 'heart' : 'heart-outline'}
                      size={28}
                      color={likedTrending[item.id] ? '#e74c3c' : '#fff'}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleShare(item)}>
                    <Ionicons
                      name={'share-social-outline'}
                      size={28}
                      color={'#fff'}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dotsContainer}>
                    <Ionicons
                      name={'ellipsis-vertical'}
                      size={28}
                      color={'#fff'}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );

  // Render a single post card
  const renderPost = ({ item }: { item: Post }) => {
    let lastTap = 0;
    const handleDoubleTap = () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        toggleLikePost(item.id);
      }
      lastTap = now;
    };
    return (
      <View style={styles.postCard}>
        <TouchableWithoutFeedback onPress={handleDoubleTap}>
          <Image source={{ uri: item.image }} style={styles.postImage} />
        </TouchableWithoutFeedback>
        <View style={styles.postOverlay}>
          <Text style={styles.postName}>{item.name}</Text>
          <Text style={styles.postSubtitle}>{item.subtitle}</Text>
        </View>
        {/* Like, Share, Info icons */}
        <View style={styles.postActions}>
          <TouchableOpacity onPress={() => toggleLikePost(item.id)}>
            <Ionicons
              name={likedPosts[item.id] ? 'heart' : 'heart-outline'}
              size={28}
              color={likedPosts[item.id] ? '#e74c3c' : '#fff'}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare(item)}>
            <Ionicons
              name={'share-social-outline'}
              size={28}
              color={'#fff'}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dotsContainer}>
            <Ionicons
              name={'ellipsis-vertical'}
              size={28}
              color={'#fff'}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Search logic
  useEffect(() => {
    if (searchText.trim() === '') {
      setSearchResults([]);
      return;
    }
    const lower = searchText.toLowerCase();
    setSearchResults(
      AppMockData.customer.searchData.filter(item => item.name.toLowerCase().includes(lower))
    );
  }, [searchText]);

  // Hide search bar on scroll/tap away
  const handleDismissSearch = () => {
    setSearchActive(false);
    setSearchText('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      if (searchActive) {
        setSearchActive(false);
        setSearchText('');
        setSearchResults([]);
        Keyboard.dismiss();
      }
    }}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.centeredContent}>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.searchBarWrapper}>
                  <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchBar}
                    placeholder="Search"
                    value={searchText}
                    onChangeText={setSearchText}
                    returnKeyType="search"
                    placeholderTextColor="#999"
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => {
                      setSearchText('');
                      setSearchResults([]);
                    }}>
                      <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableWithoutFeedback>
              {searchResults.length > 0 && (
                <View style={styles.searchResultsWrapper}>
                  {searchResults.map(item => (
                    <View key={item.id} style={styles.searchResultItem}>
                      <Image source={{ uri: item.image }} style={styles.searchResultAvatar} />
                      <Text style={styles.searchResultText}>{item.name} <Text style={{ color: '#888', fontSize: 12 }}>({item.type})</Text></Text>
                    </View>
                  ))}
                </View>
              )}
            </View>


        {/* Trending Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trending</Text>
        </View>
        <FlatList
          data={trending}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingList}
          renderItem={renderTrending}
          onEndReached={handleTrendingLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={trendingLoading ? <ActivityIndicator style={{ marginHorizontal: 16 }} /> : null}
        />

        {/* Posts Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Posts</Text>
        </View>
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.postsList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      </View>
      {renderTrendingModal()}
    </ScrollView>
      <BottomBar />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    paddingBottom: 90,
  },
  centeredContent: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  trendingList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  trendingCard: {
    width: 184,
    height: 322,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 20,
    backgroundColor: '#f7f7f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  trendingOverlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  trendingName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  trendingSubtitle: {
    color: '#f0f0f0',
    fontSize: 13,
    fontWeight: '400',
  },
  trendingActions: {
    position: 'absolute',
    right: 12,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  postsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  postCard: {
    width: '100%',
    maxWidth: 389,
    height: 514,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f7f7f7',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    alignSelf: 'center',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  postOverlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  postName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  postSubtitle: {
    color: '#f0f0f0',
    fontSize: 13,
    fontWeight: '400',
  },
  postActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    zIndex: 2,
  },
  actionIcon: {
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  searchResultsWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: 4,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  searchResultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  searchResultText: {
    fontSize: 15,
    color: '#222',
  },
  floatingCard: {
    width: 389,
    height: 514,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f7f7f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 12,
    alignSelf: 'center',
    zIndex: 100,
  },
  floatingBackBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  dotsContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  modalCardWrapper: {
    width: '100%',
    height: 514 + 32, // card height + gap
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalPostCard: {
    width: Math.min(SCREEN_WIDTH * 0.9, 389), // responsive width
    height: 514,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f7f7f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    alignSelf: 'center',
  },
}); 