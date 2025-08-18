import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Post = {
  id: string;
  label: string;
  image: string;
  author: string;
  authorImage: string;
  likes: number;
  comments: number;
  timeAgo: string;
};

// Mock posts data - this would come from your backend
const mockPosts: Post[] = [
  {
    id: '1',
    label: 'Pools that make us dream',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    author: 'Robin.10',
    authorImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    likes: 124,
    comments: 8,
    timeAgo: '2 hours ago'
  },
  {
    id: '2',
    label: 'Incredible beach houses',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    author: 'Robin.10',
    authorImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    likes: 89,
    comments: 5,
    timeAgo: '1 day ago'
  },
  {
    id: '3',
    label: 'Dreamy creek',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    author: 'Robin.10',
    authorImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    likes: 156,
    comments: 12,
    timeAgo: '3 days ago'
  },
  {
    id: '4',
    label: 'Beautiful beach inspiration',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
    author: 'Robin.10',
    authorImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    likes: 203,
    comments: 15,
    timeAgo: '1 week ago'
  },
  {
    id: 's1',
    label: 'Amazing haircut style',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80',
    author: 'StyleMaster',
    authorImage: 'https://randomuser.me/api/portraits/men/45.jpg',
    likes: 89,
    comments: 6,
    timeAgo: '2 days ago'
  },
  {
    id: 's2',
    label: 'Modern fade design',
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=400&q=80',
    author: 'BarberPro',
    authorImage: 'https://randomuser.me/api/portraits/men/67.jpg',
    likes: 134,
    comments: 9,
    timeAgo: '4 days ago'
  }
];

export default function PostViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialPostId = params.postId as string;
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = mockPosts.findIndex(post => post.id === initialPostId);
    return index >= 0 ? index : 0;
  });
  
  const flatListRef = useRef<FlatList>(null);

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <Image source={{ uri: item.authorImage }} style={styles.authorImage} />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
          </View>
        </View>
                 <TouchableOpacity style={styles.moreButton}>
           <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
         </TouchableOpacity>
      </View>

      {/* Post Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
                 <View style={styles.leftActions}>
           <TouchableOpacity style={styles.actionButton}>
             <Ionicons name="heart-outline" size={28} color="#000" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionButton}>
             <Ionicons name="chatbubble-outline" size={24} color="#000" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionButton}>
             <Ionicons name="paper-plane-outline" size={24} color="#000" />
           </TouchableOpacity>
         </View>
         <TouchableOpacity style={styles.actionButton}>
           <Ionicons name="bookmark-outline" size={24} color="#000" />
         </TouchableOpacity>
      </View>

      {/* Post Info */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>{item.likes} likes</Text>
        <View style={styles.captionContainer}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.captionText}> {item.label}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.viewCommentsText}>View all {item.comments} comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
                   <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Ionicons name="chevron-back" size={28} color="#000" />
         </TouchableOpacity>
          <Text style={styles.headerTitle}>Posts</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Posts FlatList */}
        <FlatList
          ref={flatListRef}
          data={mockPosts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          initialScrollIndex={currentIndex}
          getItemLayout={(data, index) => ({
            length: SCREEN_HEIGHT,
            offset: SCREEN_HEIGHT * index,
            index,
          })}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 44,
  },
  postContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 4,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
    padding: 4,
  },
  postInfo: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  likesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  captionContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  captionText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  viewCommentsText: {
    fontSize: 14,
    color: '#666',
  },
}); 