import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Custom iOS-style Toggle Switch Component
const CustomToggleSwitch = ({ value, onValueChange }) => {
    const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

    const handleToggle = () => {
        const newValue = !value;
        Animated.timing(animatedValue, {
            toValue: newValue ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        onValueChange(newValue);
    };

    const thumbPosition = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [3, 23], // 3px from left when OFF, 23px from left when ON (52-26-3=23)
    });

    return (
        <TouchableOpacity
            style={[
                styles.toggleTrack,
                { backgroundColor: value ? '#4F4F4F' : '#B0B0C2' }
            ]}
            onPress={handleToggle}
            activeOpacity={0.8}
        >
            <Animated.View
                style={[
                    styles.toggleThumb,
                    {
                        transform: [{ translateX: thumbPosition }],
                    }
                ]}
            />
        </TouchableOpacity>
    );
};

const NotificationSettings = () => {
    const [notifications, setNotifications] = useState({
        pauseAll: false,
        postsStoriesComments: false,
        messages: true,
        emailNotifications: false,
        appointmentReminders: false,
        waitlistLastMinute: false,
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const notificationItems = [
        {
            key: 'pauseAll',
            label: 'Pause all notifications',
            subtext: 'Stop all CuttTack alerts.',
            value: notifications.pauseAll
        },
        {
            key: 'postsStoriesComments',
            label: 'Post, stories and comments',
            subtext: 'Update when new posts/stories or when someone comments on your content.',
            value: notifications.postsStoriesComments
        },
        {
            key: 'messages',
            label: 'Messages',
            subtext: 'Receive a ping whenever you get a new in-app message.',
            value: notifications.messages
        },
        {
            key: 'emailNotifications',
            label: 'Email notifications',
            subtext: 'Receive booking updates, reminders, and offers by email.',
            value: notifications.emailNotifications
        },
        {
            key: 'appointmentReminders',
            label: 'Appointment Reminders',
            subtext: 'Receive friendly alerts before your upcoming appointments.',
            value: notifications.appointmentReminders
        },
        {
            key: 'waitlistLastMinute',
            label: 'Waitlist & Last-Minute',
            subtext: 'Receive alerts if an earlier appointment slot frees up.',
            value: notifications.waitlistLastMinute
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Status Bar */}
            <View style={styles.statusBar}>
                <View style={styles.statusBarLeft}>
                    <Ionicons name="chevron-back" size={24} color="#000000" />
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
                    <Ionicons name="chevron-back" size={24} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {notificationItems.map((item, index) => (
                    <View key={item.key} style={styles.notificationItem}>
                        <View style={styles.notificationContent}>
                            <Text style={styles.notificationLabel}>{item.label}</Text>
                            <Text style={styles.notificationSubtext}>{item.subtext}</Text>
                        </View>
                        <CustomToggleSwitch
                            value={item.value}
                            onValueChange={() => handleToggle(item.key)}
                        />
                    </View>
                ))}
            </ScrollView>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
        flex: 1,
    },
    placeholder: {
        width: 34,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        minHeight: 70,
    },
    notificationContent: {
        flex: 1,
        marginRight: 16,
    },
    notificationLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    notificationSubtext: {
        fontSize: 12,
        color: '#6D6D6D',
        lineHeight: 16,
    },
    // Custom Toggle Switch Styles
    toggleTrack: {
        width: 52,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    toggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});

export default NotificationSettings; 