import React, { useState, useRef, useEffect } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    TextInput, 
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! I'd like to book an appointment for a haircut this weekend.",
            sender: 'user',
            timestamp: '7:30 PM'
        },
        {
            id: 2,
            text: "Hello! I'd be happy to help you book an appointment. What day works best for you?",
            sender: 'barber',
            timestamp: '7:32 PM'
        },
        {
            id: 3,
            text: "Saturday afternoon would be perfect. Do you have any availability around 2 PM?",
            sender: 'user',
            timestamp: '7:33 PM'
        },
        {
            id: 4,
            text: "Let me check my schedule... Yes, I have a 2:00 PM slot available on Saturday. Would you like me to book that for you?",
            sender: 'barber',
            timestamp: '7:35 PM'
        },
        {
            id: 5,
            text: "That sounds great! Please book me for 2 PM on Saturday.",
            sender: 'user',
            timestamp: '7:36 PM'
        },
        {
            id: 6,
            text: "Perfect! I've booked you for Saturday at 2:00 PM. See you then!",
            sender: 'barber',
            timestamp: '7:37 PM'
        }
    ]);
    
    const scrollViewRef = useRef();

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                text: message.trim(),
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages([...messages, newMessage]);
            setMessage('');
            
            // Auto-scroll to bottom
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const renderMessage = (msg) => {
        const isUser = msg.sender === 'user';
        return (
            <View key={msg.id} style={[
                styles.messageContainer,
                isUser ? styles.userMessageContainer : styles.barberMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userMessageBubble : styles.barberMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.barberMessageText
                    ]}>
                        {msg.text}
                    </Text>
                    <Text style={[
                        styles.messageTimestamp,
                        isUser ? styles.userTimestamp : styles.barberTimestamp
                    ]}>
                        {msg.timestamp}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Status Bar */}
            <View style={styles.statusBar}>
                <View style={styles.statusBarLeft}>
                    <Ionicons name="chevron-back" size={20} color="#000000" />
                </View>
                <View style={styles.statusBarCenter}>
                    <Text style={styles.statusBarTime}>9:41</Text>
                </View>
                <View style={styles.statusBarRight}>
                    <Ionicons name="wifi" size={16} color="#000000" />
                    <Ionicons name="battery-full" size={20} color="#000000" />
                </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="chevron-back" size={20} color="#000000" />
                </TouchableOpacity>
                
                <View style={styles.userInfo}>
                    <View style={styles.profilePicture}>
                        <Text style={styles.profileInitial}>J</Text>
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.username}>Jenny Wilson</Text>
                        <Text style={styles.userStatus}>1 hour</Text>
                    </View>
                </View>
                
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#000000" />
                </TouchableOpacity>
            </View>

            {/* Chat Content */}
            <KeyboardAvoidingView 
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.messagesContent}
                >
                    {/* Timestamp */}
                    <View style={styles.timestampContainer}>
                        <Text style={styles.timestampText}>Sat, Jan 25, 7:30 PM</Text>
                    </View>

                    {/* Messages */}
                    {messages.map(renderMessage)}
                </ScrollView>

                {/* Message Input */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Message…"
                            placeholderTextColor="#888888"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity 
                            style={[
                                styles.sendButton,
                                message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                            ]}
                            onPress={sendMessage}
                            disabled={!message.trim()}
                        >
                            <Ionicons 
                                name="paper-plane" 
                                size={20} 
                                color={message.trim() ? "#000000" : "#CCCCCC"} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="add-circle" size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
                    <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
        backgroundColor: '#FFFFFF',
    },
    statusBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBarCenter: {
        flex: 1,
        alignItems: 'center',
    },
    statusBarTime: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    statusBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
    },
    profilePicture: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    profileInitial: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2B2B2B',
    },
    userDetails: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 2,
    },
    userStatus: {
        fontSize: 12,
        color: '#888888',
    },
    menuButton: {
        padding: 5,
    },
    chatContainer: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
    },
    timestampContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    timestampText: {
        fontSize: 12,
        color: '#B0B0B0',
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    messageContainer: {
        marginBottom: 12,
    },
    userMessageContainer: {
        alignItems: 'flex-end',
    },
    barberMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    userMessageBubble: {
        backgroundColor: '#E8E8E8',
    },
    barberMessageBubble: {
        backgroundColor: '#F4F4F4',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 4,
    },
    userMessageText: {
        color: '#2B2B2B',
    },
    barberMessageText: {
        color: '#2B2B2B',
    },
    messageTimestamp: {
        fontSize: 11,
        alignSelf: 'flex-end',
    },
    userTimestamp: {
        color: '#888888',
    },
    barberTimestamp: {
        color: '#888888',
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#F5F5F5',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 36,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#2B2B2B',
        maxHeight: 100,
        paddingVertical: 4,
    },
    sendButton: {
        padding: 8,
        marginLeft: 8,
    },
    sendButtonActive: {
        opacity: 1,
    },
    sendButtonInactive: {
        opacity: 0.5,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#000000',
        height: 70,
        paddingBottom: 10,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    activeNavItem: {
        transform: [{ scale: 1.1 }],
    },
});

export default ChatScreen; 