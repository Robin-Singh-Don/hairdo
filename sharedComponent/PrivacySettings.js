import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPrivacyPreferences, setPrivacyPreferences } from '../services/preferences/privacyPreferences';

const PrivacySettings = ({ navigation }) => {
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: true,
        showLocation: true,
        allowDataSharing: false,
        allowAnalytics: true,
        allowMarketing: false,
        allowNotifications: true,
        allowLocationServices: true,
        allowCameraAccess: true,
        allowPhotoSharing: false,
        allowReviewSharing: true,
        allowBookingHistory: true,
        allowPersonalization: true
    });
    const [loading, setLoading] = useState(true);

    // Load saved preferences
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const prefs = await getPrivacyPreferences();
            setPrivacySettings(prefs);
        } catch (error) {
            console.error('Error loading privacy preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    // Save preferences when any setting changes
    const savePreferences = useCallback(async (updates) => {
        try {
            const current = await getPrivacyPreferences();
            const merged = { ...current, ...updates };
            await setPrivacyPreferences(merged);
        } catch (error) {
            console.error('Error saving privacy preferences:', error);
        }
    }, []);

    const handleSettingChange = async (key, value) => {
        // Update local state immediately
        setPrivacySettings(prev => ({
            ...prev,
            [key]: value
        }));
        // Save to storage
        await savePreferences({ [key]: value });
    };

    const handleDataExport = () => {
        Alert.alert(
            'Export Data',
            'Your personal data will be exported and sent to your email address within 24 hours.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Export', onPress: () => console.log('Data export requested') }
            ]
        );
    };

    const handleDeleteData = () => {
        Alert.alert(
            'Delete All Data',
            'This will permanently delete all your personal data, booking history, and account information. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => console.log('Data deletion requested') }
            ]
        );
    };

    const renderPrivacySection = (title, items) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, index) => (
                <View key={index} style={styles.optionRow}>
                    <View style={styles.textContainer}>
                        <Text style={styles.optionText}>{item.title}</Text>
                        <Text style={styles.explanationText}>{item.subtitle}</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.customSwitch,
                            privacySettings[item.key] ? styles.switchActive : styles.switchInactive
                        ]}
                        onPress={() => handleSettingChange(item.key, !privacySettings[item.key])}
                        activeOpacity={0.8}
                    >
                        <View style={[
                            styles.switchKnob,
                            privacySettings[item.key] ? styles.knobActive : styles.knobInactive
                        ]} />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Privacy */}
                {renderPrivacySection('Profile Privacy', [
                    {
                        key: 'profileVisibility',
                        title: 'Public Profile',
                        subtitle: 'Allow others to see your profile information',
                        icon: 'person'
                    },
                    {
                        key: 'showLocation',
                        title: 'Location Sharing',
                        subtitle: 'Share your location for nearby salon recommendations',
                        icon: 'location'
                    },
                    {
                        key: 'allowPhotoSharing',
                        title: 'Photo Sharing',
                        subtitle: 'Allow sharing your photos with barbers for styling',
                        icon: 'camera'
                    }
                ])}

                {/* Data & Analytics */}
                {renderPrivacySection('Data & Analytics', [
                    {
                        key: 'allowDataSharing',
                        title: 'Data Sharing',
                        subtitle: 'Share data with third-party services',
                        icon: 'share'
                    },
                    {
                        key: 'allowAnalytics',
                        title: 'Analytics',
                        subtitle: 'Help improve the app with usage analytics',
                        icon: 'analytics'
                    },
                    {
                        key: 'allowPersonalization',
                        title: 'Personalization',
                        subtitle: 'Personalized recommendations and content',
                        icon: 'star'
                    }
                ])}

                {/* Communication */}
                {renderPrivacySection('Communication', [
                    {
                        key: 'allowNotifications',
                        title: 'Push Notifications',
                        subtitle: 'Receive booking reminders and updates',
                        icon: 'notifications'
                    },
                    {
                        key: 'allowMarketing',
                        title: 'Marketing Communications',
                        subtitle: 'Receive promotional offers and deals',
                        icon: 'mail'
                    }
                ])}

                {/* Location & Services */}
                {renderPrivacySection('Location & Services', [
                    {
                        key: 'allowLocationServices',
                        title: 'Location Services',
                        subtitle: 'Use location for salon discovery',
                        icon: 'location-outline'
                    },
                    {
                        key: 'allowCameraAccess',
                        title: 'Camera Access',
                        subtitle: 'Take photos for style consultations',
                        icon: 'camera-outline'
                    }
                ])}

                {/* Content Sharing */}
                {renderPrivacySection('Content Sharing', [
                    {
                        key: 'allowReviewSharing',
                        title: 'Review Sharing',
                        subtitle: 'Share your reviews publicly',
                        icon: 'chatbubble'
                    },
                    {
                        key: 'allowBookingHistory',
                        title: 'Booking History',
                        subtitle: 'Keep your booking history private',
                        icon: 'time'
                    }
                ])}

                {/* Data Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Management</Text>
                    
                    <TouchableOpacity style={styles.actionRow} onPress={handleDataExport}>
                        <View style={styles.actionInfo}>
                            <Ionicons name="download" size={20} color="#AEB4F7" />
                            <View style={styles.actionText}>
                                <Text style={styles.actionTitle}>Export My Data</Text>
                                <Text style={styles.actionSubtitle}>Download all your personal data</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionRow} onPress={handleDeleteData}>
                        <View style={styles.actionInfo}>
                            <Ionicons name="trash" size={20} color="#FF6B6B" />
                            <View style={styles.actionText}>
                                <Text style={[styles.actionTitle, styles.dangerText]}>Delete All Data</Text>
                                <Text style={styles.actionSubtitle}>Permanently delete your data</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>



                {/* Information */}
                <View style={styles.infoSection}>
                    <Ionicons name="information-circle" size={20} color="#666" />
                    <Text style={styles.infoText}>
                        Your privacy is important to us. You can control how your data is used and shared through these settings.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

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
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    optionText: {
        fontSize: 16,
        color: '#111',
        fontWeight: '500',
    },
    explanationText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        lineHeight: 18,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    actionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionText: {
        marginLeft: 12,
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    dangerText: {
        color: '#FF6B6B',
    },
    infoSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#F8F8F8',
        marginHorizontal: 16,
        marginVertical: 20,
        borderRadius: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
    // Custom Switch Styles
    customSwitch: {
        width: 40,
        height: 25,
        borderRadius: 12.5,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    switchActive: {
        backgroundColor: '#8B91B4',
    },
    switchInactive: {
        backgroundColor: '#555555',
    },
    switchKnob: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    knobActive: {
        alignSelf: 'flex-end',
    },
    knobInactive: {
        alignSelf: 'flex-start',
    },
});

export default PrivacySettings;