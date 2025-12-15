import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ListRenderItem, Modal, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface ChatMessage {
  id: string;
  from: 'me' | 'them';
  text: string;
}

const sampleMessages: ChatMessage[] = [
  { id: '1', from: 'them', text: 'Hi! Thank you for choosing our salon. How can I help you today?' },
  { id: '2', from: 'me', text: 'Hi! I would like to book an appointment for a haircut.' },
  { id: '3', from: 'them', text: 'Great! What day works best for you?' },
  { id: '4', from: 'me', text: 'This Saturday afternoon would be perfect.' },
  { id: '5', from: 'them', text: 'Perfect! We have availability at 2:00 PM and 3:30 PM. Which would you prefer?' },
  { id: '6', from: 'me', text: '2:00 PM sounds great!' },
  { id: '7', from: 'them', text: 'Excellent! I have you booked for Saturday at 2:00 PM. See you then!' },
];

interface ChatParams {
  name?: string;
  profileImage?: string;
  fromMessagesTab?: string;
  bookingId?: string;
  bookingDate?: string;
  bookingTime?: string;
  bookingService?: string;
  bookingStatus?: string;
  salonName?: string;
  barberName?: string;
  phone?: string;
}

// ChatScreen - Direct Message (DM) Page
// This screen displays a chat conversation and header with user info and menu
const ChatScreen = () => {
  // Router for navigation
  const router = useRouter();
  // Params from navigation (user info, etc)
  const params = useLocalSearchParams() as ChatParams;
  // State for chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);
  // State for input field
  const [input, setInput] = useState('');
  // Ref for FlatList to scroll to end
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  // State for showing/hiding the popover menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [muted, setMuted] = useState(false);

  // Send a new message
  const handleSend = () => {
    if (input.trim()) {
      setMessages(prev => [
        ...prev,
        { id: (prev.length + 1).toString(), from: 'me', text: input }
      ]);
      setInput('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // Handle back navigation (to messages tab or previous screen)
  const handleBack = () => {
    if (params.fromMessagesTab) {
      // Go back to inbox page with messages tab active
      router.replace({ pathname: '/(customer)/inbox', params: { tab: 'messages' } });
    } else {
      router.back();
    }
  };

  // Render a single chat message bubble
  const renderMessage: ListRenderItem<ChatMessage> = ({ item }) => (
    <View style={[styles.bubbleRow, item.from === 'me' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}> 
      <View style={[styles.bubble, item.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={styles.bubbleText}>{item.text}</Text>
      </View>
    </View>
  );

  // Render booking info card if this is a booking-related chat
  const renderBookingInfo = () => {
    if (!params.bookingId) return null;
    
    return (
      <View style={styles.bookingInfoCard}>
        <View style={styles.bookingInfoHeader}>
          <Text style={styles.bookingInfoTitle}>Your Booking</Text>
          <Text style={styles.bookingInfoStatus}>{params.bookingStatus || 'Confirmed'}</Text>
        </View>
        <View style={styles.bookingInfoDetails}>
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.bookingInfoText}><Text style={styles.bookingInfoLabel}>Service:</Text> {params.bookingService}</Text>
          </View>
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.bookingInfoText}><Text style={styles.bookingInfoLabel}>Date:</Text> {params.bookingDate}</Text>
          </View>
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.bookingInfoText}><Text style={styles.bookingInfoLabel}>Time:</Text> {params.bookingTime}</Text>
          </View>
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.bookingInfoText}><Text style={styles.bookingInfoLabel}>Booking ID:</Text> {params.bookingId}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          {/* Header with back button, user info, and menu */}
          <View style={styles.header}>
            {/* Back button */}
            <TouchableOpacity onPress={handleBack} style={styles.headerIcon}>
              <Text style={{ fontSize: 24 }}>←</Text>
            </TouchableOpacity>
            {/* User info (profile image, name, time) */}
            <View style={styles.headerUser}>
              <Image source={{ uri: typeof params.profileImage === 'string' ? params.profileImage : 'https://via.placeholder.com/36' }} style={styles.headerProfile} />
              <View>
                <Text style={styles.headerName}>{params.name || 'Salon Staff'}</Text>
                <Text style={styles.headerTime}>1 hour ago</Text>
              </View>
            </View>
            {/* Three-lines menu button */}
            <TouchableOpacity style={styles.headerIcon} onPress={() => setMenuVisible(true)}>
              <Text style={{ fontSize: 24 }}>≡</Text>
            </TouchableOpacity>
          </View>
          {/* Popover Menu for Call, Mute, Block */}
          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            {/* Overlay to close menu when tapping outside */}
            <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
              {/* Menu card positioned below the three-lines icon */}
              <View style={styles.menuBox}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); /* Call action */ }}>
                  <Text style={styles.menuText}>Call</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); /* Mute action - to be implemented later */ }}>
                  <Text style={styles.menuText}>Mute</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); /* Block action */ }}>
                  <Text style={styles.menuTextBlock}>Block</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
          {/* Chat message list */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <>
                {renderBookingInfo()}
                <Text style={styles.chatTimestamp}>Today, 2:30 PM</Text>
              </>
            )}
          />
          {/* Input bar for typing and sending messages */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.inputBar}>
              {/* Plus button (for attachments, etc) */}
              <TouchableOpacity style={styles.inputPlus}>
                <Text style={{ color: '#000', fontSize: 20 }}>+</Text>
              </TouchableOpacity>
              {/* Text input field */}
              <TextInput
                style={styles.inputField}
                placeholder="Type a message..."
                placeholderTextColor="#A0A0A0"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              {/* Send button */}
              <TouchableOpacity style={styles.inputSend} onPress={handleSend}>
                <Text style={{ color: '#000', fontSize: 20 }}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
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
    backgroundColor: '#fff',
  },
  centeredContent: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerIcon: {
    width: 28,
    alignItems: 'center',
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 6,
  },
  headerProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 6,
  },
  headerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  headerTime: {
    fontSize: 11,
    color: '#A0A0A0',
  },

  chatContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  chatTimestamp: {
    alignSelf: 'center',
    color: '#A0A0A0',
    fontSize: 11,
    marginBottom: 12,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bubble: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: '75%',
  },
  bubbleThem: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
  },
  bubbleMe: {
    backgroundColor: '#E0E0E0',
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: 12,
    color: '#000',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  inputPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    color: '#000',
    padding: 0,
    borderWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  inputSend: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuBox: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 100,
    height: 90,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 10,
    height: 30,
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  menuTextBlock: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
  bookingInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  bookingInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  bookingInfoStatus: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  bookingInfoDetails: {
    // Using marginBottom for spacing instead of gap
  },
  bookingInfoText: {
    fontSize: 12,
    color: '#666',
  },
  bookingInfoLabel: {
    fontWeight: '600',
    color: '#000',
  },
});

export default ChatScreen;
