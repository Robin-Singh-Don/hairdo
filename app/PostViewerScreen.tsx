import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, FlatList, SafeAreaView, Modal, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { customerAPI } from '../services/api/customerAPI';
import { PostComment, PostCommentReply } from '../services/mock/AppMockData';

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
  
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [archivedPosts, setArchivedPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = mockPosts.findIndex(post => post.id === initialPostId);
    return index >= 0 ? index : 0;
  });
  
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string>('');
  
  // Comment state
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [comments, setComments] = useState<{ [postId: string]: PostComment[] }>({});
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [showCommentInput, setShowCommentInput] = useState<{ [postId: string]: boolean }>({});
  const [loadingComments, setLoadingComments] = useState<{ [postId: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{ [postId: string]: string | null }>({});
  const [replyText, setReplyText] = useState<{ [commentId: string]: string }>({});
  
  const flatListRef = useRef<FlatList>(null);

  const handleMenuPress = (postId: string) => {
    setSelectedPostId(postId);
    setShowMenu(true);
  };

  const handleMenuOption = (option: string) => {
    console.log('handleMenuOption called with:', option);
    console.log('selectedPostId:', selectedPostId);
    
    if (!selectedPostId) {
      console.log('No selectedPostId');
      return;
    }
    
    const postToProcess = posts.find(p => p.id === selectedPostId);
    if (!postToProcess) {
      console.log('No post found');
      return;
    }
    
    // Close menu first
    setShowMenu(false);
    
    // Small delay to ensure menu is closed before showing alert
    setTimeout(() => {
      switch (option) {
      case 'delete':
        console.log('Delete option selected');
        Alert.alert(
          'Delete Post',
          'Are you sure you want to delete this post? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive', 
              onPress: () => {
                const updatedPosts = posts.filter(p => p.id !== selectedPostId);
                console.log('Deleting post. Remaining posts:', updatedPosts.length);
                setPosts(updatedPosts);
                
                // Navigate to next post or adjust index
                if (updatedPosts.length === 0) {
                  // No posts left, go back
                  setTimeout(() => router.back(), 500);
                } else if (currentIndex >= updatedPosts.length) {
                  // Current index is out of bounds, go to last post
                  const newIndex = Math.max(0, updatedPosts.length - 1);
                  setCurrentIndex(newIndex);
                  flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
                }
              }
            }
          ]
        );
        break;
        
      case 'archive':
        console.log('Archive option selected');
        Alert.alert(
          'Archive Post',
          'This post will be moved to your archive.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Archive', 
              onPress: () => {
                const updatedPosts = posts.filter(p => p.id !== selectedPostId);
                console.log('Archiving post. Remaining posts:', updatedPosts.length);
                setPosts(updatedPosts);
                setArchivedPosts([...archivedPosts, postToProcess]);
                
                // Navigate to next post or adjust index
                if (updatedPosts.length === 0) {
                  // No posts left, go back
                  setTimeout(() => router.back(), 500);
                } else if (currentIndex >= updatedPosts.length) {
                  // Current index is out of bounds, go to last post
                  const newIndex = Math.max(0, updatedPosts.length - 1);
                  setCurrentIndex(newIndex);
                  flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
                }
              }
            }
          ]
        );
        break;
        
      case 'report':
        setShowReportModal(true);
        break;
      }
    }, 100);
  };
  
  const handleSubmitReport = () => {
    if (!selectedReportReason) {
      Alert.alert('Required', 'Please select a reason for reporting');
      return;
    }
    
    setShowReportModal(false);
    setSelectedReportReason('');
    
    Alert.alert(
      'Report Submitted',
      'Thank you for your report. We will review this content.',
      [{ text: 'OK' }]
    );
  };

  const postsToRender = posts;
  
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
                 <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleMenuPress(item.id)}
        >
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
            <Ionicons name="paper-plane-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => toggleComments(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#000" />
            {comments[item.id] && comments[item.id].length > 0 && (
              <Text style={styles.commentCount}>{comments[item.id].length}</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Post Info */}
      <View style={styles.postInfo}>
        <View style={styles.captionContainer}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.captionText}> {item.label}</Text>
        </View>
        
        {/* Comments Section */}
        {showComments[item.id] && (
          <View style={styles.commentsSection}>
            {loadingComments[item.id] ? (
              <ActivityIndicator size="small" color="#666" style={{ marginVertical: 16 }} />
            ) : (
              <>
                {comments[item.id] && comments[item.id].length > 0 ? (
                  <ScrollView style={styles.commentsList} nestedScrollEnabled>
                    {comments[item.id].map(comment => renderComment(comment, item.id))}
                  </ScrollView>
                ) : (
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                )}
                
                {/* Comment Input */}
                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor="#999"
                    value={commentText[item.id] || ''}
                    onChangeText={(text) => setCommentText({ ...commentText, [item.id]: text })}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, (!commentText[item.id] || !commentText[item.id].trim()) && styles.sendButtonDisabled]}
                    onPress={() => handleSubmitComment(item.id)}
                    disabled={!commentText[item.id] || !commentText[item.id].trim()}
                  >
                    <Ionicons name="send" size={20} color={commentText[item.id]?.trim() ? "#2196F3" : "#ccc"} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
  
  const toggleComments = async (postId: string) => {
    const isShowing = showComments[postId];
    setShowComments({ ...showComments, [postId]: !isShowing });
    
    if (!isShowing && !comments[postId]) {
      // Load comments when opening for first time
      setLoadingComments({ ...loadingComments, [postId]: true });
      try {
        const postComments = await customerAPI.getPostComments(postId);
        setComments({ ...comments, [postId]: postComments });
      } catch (error) {
        console.error('Error loading comments:', error);
        Alert.alert('Error', 'Failed to load comments');
      } finally {
        setLoadingComments({ ...loadingComments, [postId]: false });
      }
    }
  };
  
  const handleSubmitComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    
    try {
      const newComment = await customerAPI.addPostComment(postId, text);
      setComments({ ...comments, [postId]: [...(comments[postId] || []), newComment] });
      setCommentText({ ...commentText, [postId]: '' });
      
      // Update post comment count
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };
  
  const handleLikeComment = async (commentId: string, postId: string) => {
    try {
      await customerAPI.likePostComment(commentId);
      setComments({
        ...comments,
        [postId]: comments[postId].map(c => 
          c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
        )
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  
  const handleReplyToComment = async (commentId: string, postId: string) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;
    
    try {
      const newReply = await customerAPI.replyToComment(commentId, text);
      setComments({
        ...comments,
        [postId]: comments[postId].map(c => 
          c.id === commentId 
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        )
      });
      setReplyText({ ...replyText, [commentId]: '' });
      setReplyingTo({ ...replyingTo, [postId]: null });
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to add reply. Please try again.');
    }
  };
  
  const renderComment = (comment: PostComment, postId: string) => (
    <View key={comment.id} style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{comment.customerName}</Text>
        <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
      </View>
      <Text style={styles.commentText}>{comment.comment}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity 
          style={styles.commentActionButton}
          onPress={() => handleLikeComment(comment.id, postId)}
        >
          <Ionicons name="heart-outline" size={14} color="#666" />
          <Text style={styles.commentActionText}>{comment.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.commentActionButton}
          onPress={() => setReplyingTo({ ...replyingTo, [postId]: comment.id })}
        >
          <Text style={styles.commentActionText}>Reply</Text>
        </TouchableOpacity>
      </View>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply: PostCommentReply) => (
            <View key={reply.id} style={styles.replyItem}>
              <Text style={styles.replyAuthor}>{reply.customerName}</Text>
              <Text style={styles.replyText}>{reply.reply}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Reply Input */}
      {replyingTo[postId] === comment.id && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor="#999"
            value={replyText[comment.id] || ''}
            onChangeText={(text) => setReplyText({ ...replyText, [comment.id]: text })}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!replyText[comment.id] || !replyText[comment.id].trim()) && styles.sendButtonDisabled]}
            onPress={() => handleReplyToComment(comment.id, postId)}
            disabled={!replyText[comment.id] || !replyText[comment.id].trim()}
          >
            <Ionicons name="send" size={16} color={replyText[comment.id]?.trim() ? "#2196F3" : "#ccc"} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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
          data={postsToRender}
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

      {/* Menu Popup Modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={() => {
                console.log('Delete button tapped');
                handleMenuOption('delete');
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <Text style={[styles.menuOptionText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={() => {
                console.log('Archive button tapped');
                handleMenuOption('archive');
              }}
            >
              <Ionicons name="archive-outline" size={22} color="#000" />
              <Text style={styles.menuOptionText}>Archive</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <View style={styles.reportModalHeader}>
              <Text style={styles.reportModalTitle}>Report Post</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.reportModalSubtitle}>Why are you reporting this post?</Text>
            
            <ScrollView style={styles.reportReasonsContainer}>
              {[
                { id: 'spam', label: 'Spam or Scam' },
                { id: 'inappropriate', label: 'Inappropriate Content' },
                { id: 'harassment', label: 'Harassment or Bullying' },
                { id: 'fake', label: 'False Information' },
                { id: 'violence', label: 'Violence or scary content' },
                { id: 'other', label: 'Other' }
              ].map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reportReasonOption,
                    selectedReportReason === reason.id && styles.reportReasonSelected
                  ]}
                  onPress={() => setSelectedReportReason(reason.id)}
                >
                  <Text style={[
                    styles.reportReasonText,
                    selectedReportReason === reason.id && styles.reportReasonTextSelected
                  ]}>
                    {reason.label}
                  </Text>
                  {selectedReportReason === reason.id && (
                    <Ionicons name="checkmark" size={20} color="#000" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.submitReportButton}
              onPress={handleSubmitReport}
            >
              <Text style={styles.submitReportButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: 'flex-start',
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
  captionContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  captionText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  // Menu Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    width: 140,
    position: 'absolute',
    top: 110,
    right: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  menuOptionText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
    fontWeight: '400',
  },
  // Report Modal Styles
  reportModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    maxHeight: '70%',
    paddingTop: 20,
  },
  reportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reportModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  reportModalSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 12,
  },
  reportReasonsContainer: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  reportReasonOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  reportReasonSelected: {
    backgroundColor: '#F0F0F0',
  },
  reportReasonText: {
    fontSize: 15,
    color: '#000',
  },
  reportReasonTextSelected: {
    fontWeight: '600',
  },
  submitReportButton: {
    backgroundColor: '#000',
    margin: 20,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commentCount: {
    fontSize: 12,
    color: '#000',
    marginLeft: 4,
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 12,
    maxHeight: 300,
  },
  commentsList: {
    maxHeight: 200,
    marginBottom: 8,
  },
  noCommentsText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  commentItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  commentTime: {
    fontSize: 11,
    color: '#999',
  },
  commentText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 6,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: '#666',
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
  },
  replyItem: {
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#000',
    maxHeight: 80,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#000',
    maxHeight: 60,
    marginRight: 6,
  },
}); 