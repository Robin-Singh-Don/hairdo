import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, Switch, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AccountSettings = ({ navigation }) => {
    const [showPassword, setShowPassword] = useState(false);
    
    // Mock user data - in real app this would come from user context/state
    const [userData, setUserData] = useState({
        firstName: 'Shark',
        lastName: 'Arora',
        email: 'shark.arora@email.com',
        phone: '+1 (778) 636-4020',
        dateOfBirth: '10 Jun 2000',
        gender: 'Male',
        bio: 'Love getting fresh cuts and trying new styles!',
        profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        address: 'Vancouver, BC, Canada',
        preferredLanguage: 'English',
        timezone: 'PST (UTC-8)',
        memberSince: 'March 2023',
        totalBookings: 24,
        loyaltyPoints: 850,
        membershipTier: 'Gold',
        preferredBarber: 'Shark.11',
        preferredServices: ['Haircut', 'Beard Trim'],
        bookingReminderTime: '2 hours',
        autoConfirmBookings: true,
        savePaymentInfo: true
    });

    const handleSaveChanges = () => {
        Alert.alert('Success', 'Your profile has been updated successfully!');
    };

    const handleBackPress = () => {
        // Save changes automatically before navigating back
        handleSaveChanges();
        navigation.goBack();
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') }
            ]
        );
    };

    const handleExportData = () => {
        Alert.alert('Export Data', 'Your data will be exported and sent to your email address.');
    };

    const renderBookingPreferences = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Preferences</Text>
            
            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Auto-confirm Bookings</Text>
                    <Text style={styles.explanationText}>Automatically confirm your bookings without requiring manual approval</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        userData.autoConfirmBookings ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => setUserData(prev => ({ ...prev, autoConfirmBookings: !prev.autoConfirmBookings }))}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        userData.autoConfirmBookings ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Save Payment Info</Text>
                    <Text style={styles.explanationText}>Securely store your payment information for faster checkout</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        userData.savePaymentInfo ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => setUserData(prev => ({ ...prev, savePaymentInfo: !prev.savePaymentInfo }))}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        userData.savePaymentInfo ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <TouchableOpacity style={styles.profileImageContainer}>
                        <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
                        <View style={styles.editImageOverlay}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{userData.firstName} {userData.lastName}</Text>
                    <Text style={styles.membershipTier}>{userData.membershipTier} Member</Text>
                </View>

                {/* Account Statistics */}
                <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                        <Ionicons name="calendar" size={20} color="#AEB4F7" />
                        <Text style={styles.statNumber}>{userData.totalBookings}</Text>
                        <Text style={styles.statLabel}>Total Bookings</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="star" size={20} color="#FFD700" />
                        <Text style={styles.statNumber}>{userData.loyaltyPoints}</Text>
                        <Text style={styles.statLabel}>Loyalty Points</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="time" size={20} color="#03A100" />
                        <Text style={styles.statNumber}>{userData.memberSince}</Text>
                        <Text style={styles.statLabel}>Member Since</Text>
                    </View>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
                    <View style={styles.inputRow}>
                        <View style={styles.inputColumn}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                value={userData.firstName}
                                onChangeText={(text) => setUserData(prev => ({ ...prev, firstName: text }))}
                                placeholder="First Name"
                            />
                        </View>
                        <View style={styles.inputColumn}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                value={userData.lastName}
                                onChangeText={(text) => setUserData(prev => ({ ...prev, lastName: text }))}
                                placeholder="Last Name"
                            />
                        </View>
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={userData.email}
                            onChangeText={(text) => setUserData(prev => ({ ...prev, email: text }))}
                            placeholder="Email Address"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={userData.phone}
                            onChangeText={(text) => setUserData(prev => ({ ...prev, phone: text }))}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <View style={styles.inputColumn}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TextInput
                                style={styles.input}
                                value={userData.dateOfBirth}
                                onChangeText={(text) => setUserData(prev => ({ ...prev, dateOfBirth: text }))}
                                placeholder="Date of Birth"
                            />
                        </View>
                        <View style={styles.inputColumn}>
                            <Text style={styles.label}>Gender</Text>
                            <TextInput
                                style={styles.input}
                                value={userData.gender}
                                onChangeText={(text) => setUserData(prev => ({ ...prev, gender: text }))}
                                placeholder="Gender"
                            />
                        </View>
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={styles.input}
                            value={userData.address}
                            onChangeText={(text) => setUserData(prev => ({ ...prev, address: text }))}
                            placeholder="Address"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={styles.bioInput}
                            value={userData.bio}
                            onChangeText={(text) => setUserData(prev => ({ ...prev, bio: text }))}
                            placeholder="Tell us about yourself..."
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* Booking Preferences */}
                {renderBookingPreferences()}


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
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F0F0',
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#AEB4F7',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    membershipTier: {
        fontSize: 14,
        color: '#666',
    },
    statsSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    inputRow: {
        marginBottom: 16,
    },
    inputColumn: {
        flex: 1,
        marginRight: 8,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },

    bioInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
        minHeight: 80,
        textAlignVertical: 'top',
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
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#000',
        marginLeft: 12,
    },
    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    paymentMethodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentMethodDetails: {
        marginLeft: 12,
    },
    paymentMethodType: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    paymentMethodNumber: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    defaultBadge: {
        backgroundColor: '#AEB4F7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultBadgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    paymentForm: {
        marginBottom: 20,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    paymentFormRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    modalButton: {
        backgroundColor: '#AEB4F7',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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

export default AccountSettings;