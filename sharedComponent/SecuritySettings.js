import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChangePasswordPopup from './ChangePasswordPopup';
import TwoFactorAuthPopup from './TwoFactorAuthPopup';
import BackupEmailModal from './BackupEmailModal';
import PhoneVerificationModal from './PhoneVerificationModal';
import { getSecurityPreferences, setSecurityPreferences } from '../services/preferences/securityPreferences';

const SecuritySettings = ({ navigation }) => {
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [show2FAPopup, setShow2FAPopup] = useState(false);
    const [showBackupEmailModal, setShowBackupEmailModal] = useState(false);
    const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
    const [securitySettings, setSecuritySettings] = useState({
        biometricLogin: true,
        twoFactorAuth: false,
        loginNotifications: true,
        suspiciousActivityAlerts: true,
        sessionManagement: true,
        cameraAccess: true,
        locationAccess: true,
        contactsAccess: false
    });
    const [backupEmail, setBackupEmail] = useState('user@backup.com');
    const [phoneNumber, setPhoneNumber] = useState('(555) 123-4567');
    const [loading, setLoading] = useState(true);

    // Load saved preferences
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const prefs = await getSecurityPreferences();
            setSecuritySettings({
                biometricLogin: prefs.biometricLogin,
                twoFactorAuth: prefs.twoFactorAuth,
                loginNotifications: prefs.loginNotifications,
                suspiciousActivityAlerts: prefs.suspiciousActivityAlerts,
                sessionManagement: prefs.sessionManagement,
                cameraAccess: prefs.cameraAccess,
                locationAccess: prefs.locationAccess,
                contactsAccess: prefs.contactsAccess
            });
            if (prefs.backupEmail) setBackupEmail(prefs.backupEmail);
            if (prefs.phoneNumber) setPhoneNumber(prefs.phoneNumber);
        } catch (error) {
            console.error('Error loading security preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    // Save preferences when any setting changes
    const savePreferences = useCallback(async (updates) => {
        try {
            const current = await getSecurityPreferences();
            const merged = { ...current, ...updates };
            await setSecurityPreferences(merged);
        } catch (error) {
            console.error('Error saving security preferences:', error);
        }
    }, []);

    const [activeSessions] = useState([
        { id: 1, device: 'iPhone 14 Pro', location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true },
        { id: 2, device: 'MacBook Pro', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
        { id: 3, device: 'iPad Air', location: 'Los Angeles, CA', lastActive: '3 days ago', current: false }
    ]);


    const handleSettingChange = async (key, value) => {
        // Update local state immediately
        setSecuritySettings(prev => ({
            ...prev,
            [key]: value
        }));
        // Save to storage
        await savePreferences({ [key]: value });
    };

    const handleChangePassword = () => {
        setShowPasswordPopup(true);
    };

    const handlePasswordChange = (passwordData) => {
        // In a real app, this would make an API call to change the password
        console.log('Password change requested:', {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        
        // You could also update local state or make additional API calls here
        // For example, you might want to log the user out after password change
        // or update some security-related settings
    };

    const handle2FAChange = async (twoFAData) => {
        // In a real app, this would make an API call to enable/disable 2FA
        console.log('2FA change requested:', twoFAData);
        
        const newValue = !!twoFAData.method;
        
        // Update local state immediately
        setSecuritySettings(prev => ({
            ...prev,
            twoFactorAuth: newValue
        }));
        
        // Save to storage
        await savePreferences({ twoFactorAuth: newValue });
        
        // You could also update local state or make additional API calls here
        // For example, you might want to log the user out after 2FA change
        // or update some security-related settings
    };

    const handleTwoFactorAuth = () => {
        setShow2FAPopup(true);
    };

    const handleLogoutSession = (sessionId) => {
        Alert.alert(
            'Logout Session',
            `Are you sure you want to logout from ${activeSessions.find(s => s.id === sessionId)?.device}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive' }
            ]
        );
    };




    const handleBackupEmail = () => {
        setShowBackupEmailModal(true);
    };

    const handlePhoneVerification = () => {
        setShowPhoneVerificationModal(true);
    };

    const handleSaveBackupEmail = async (data) => {
        // In a real app, this would make an API call to save the backup email
        console.log('Backup email change requested:', {
            email: data.email,
            password: data.password
        });
        
        const email = data.email || '';
        setBackupEmail(email);
        // Save to storage
        await savePreferences({ backupEmail: email });
        
        // You could also update local state or make additional API calls here
        // For example, you might want to log the user out after this change
        // or update some security-related settings
    };

    const handleSavePhoneNumber = async (data) => {
        // In a real app, this would make an API call to save the phone number
        console.log('Phone number change requested:', {
            phoneNumber: data.phoneNumber,
            password: data.password,
            verified: data.verified
        });
        
        const phone = data.phoneNumber || '';
        setPhoneNumber(phone);
        // Save to storage
        await savePreferences({ phoneNumber: phone });
        
        // You could also update local state or make additional API calls here
        // For example, you might want to log the user out after this change
        // or update some security-related settings
    };

    const renderSecurityScore = () => {
        const securityScore = calculateSecurityScore();
        const getScoreColor = (score) => {
            if (score >= 80) return '#4CAF50';
            if (score >= 60) return '#FF9800';
            return '#F44336';
        };
        const getScoreText = (score) => {
            if (score >= 80) return 'Excellent';
            if (score >= 60) return 'Good';
            return 'Needs Improvement';
        };

        return (
            <View style={styles.securityScoreSection}>
                <View style={styles.scoreHeader}>
                    <View style={styles.scoreTitleRow}>
                        <Text style={styles.scoreTitle}>Security Score</Text>
                        <Text style={styles.scoreValue}>{securityScore}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressFill, 
                                    { 
                                        width: `${securityScore}%`,
                                        backgroundColor: getScoreColor(securityScore)
                                    }
                                ]} 
                            />
                        </View>
                        <Text style={styles.scoreStatus}>{getScoreText(securityScore)}</Text>
                    </View>
                </View>
                {securityScore < 80 && (
                    <View style={styles.quickAction}>
                        <Ionicons name="shield-checkmark" size={16} color="#FF9800" />
                        <Text style={styles.quickActionText}>Enable 2FA to boost score</Text>
                        <TouchableOpacity onPress={handleTwoFactorAuth} style={styles.quickActionButton}>
                            <Text style={styles.quickActionButtonText}>Enable</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const calculateSecurityScore = () => {
        let score = 0;
        
        // Base score for having an account
        score += 20;
        
        // Password strength (assuming strong password)
        score += 20;
        
        // Biometric login
        if (securitySettings.biometricLogin) score += 15;
        
        // Two-factor authentication
        if (securitySettings.twoFactorAuth) score += 25;
        
        // Login notifications
        if (securitySettings.loginNotifications) score += 10;
        
        // Suspicious activity alerts
        if (securitySettings.suspiciousActivityAlerts) score += 10;
        
        return Math.min(score, 100);
    };

    const renderAccountSecurity = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>
            
            <TouchableOpacity style={styles.settingRow} onPress={handleChangePassword}>
                <View style={styles.settingInfo}>
                    <Ionicons name="lock-closed" size={20} color="#000" />
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Change Password</Text>
                        <Text style={styles.settingSubtitle}>Update your account password</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={handleTwoFactorAuth}>
                <View style={styles.settingInfo}>
                    <Ionicons name="shield-checkmark" size={20} color="#000" />
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                        <Text style={styles.settingSubtitle}>Add an extra layer of security</Text>
                    </View>
                </View>
                <View style={styles.settingAction}>
                    <Text style={[styles.statusText, { color: securitySettings.twoFactorAuth ? '#4CAF50' : '#FF9800' }]}>
                        {securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
            </TouchableOpacity>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                <Text style={styles.optionText}>Biometric Login</Text>
                    <Text style={styles.explanationText}>Use fingerprint or face ID for quick and secure login</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        securitySettings.biometricLogin ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('biometricLogin', !securitySettings.biometricLogin)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        securitySettings.biometricLogin ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderLoginSecurity = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Login Security</Text>
            
            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Login Notifications</Text>
                    <Text style={styles.explanationText}>Get notified when someone logs into your account</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        securitySettings.loginNotifications ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('loginNotifications', !securitySettings.loginNotifications)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        securitySettings.loginNotifications ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Suspicious Activity Alerts</Text>
                    <Text style={styles.explanationText}>Receive alerts for unusual account activity</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        securitySettings.suspiciousActivityAlerts ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('suspiciousActivityAlerts', !securitySettings.suspiciousActivityAlerts)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        securitySettings.suspiciousActivityAlerts ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                    <Ionicons name="desktop" size={20} color="#000" />
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Session Management</Text>
                        <Text style={styles.settingSubtitle}>Manage active sessions</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => console.log('Session management')}>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
            </View>
        </View>
    );


    const renderAppPermissions = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Permissions</Text>
            
            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Camera Access</Text>
                    <Text style={styles.explanationText}>Allow app to take photos for style consultations</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        securitySettings.cameraAccess ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('cameraAccess', !securitySettings.cameraAccess)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        securitySettings.cameraAccess ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Location Services</Text>
                    <Text style={styles.explanationText}>Allow app to find nearby salons</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        securitySettings.locationAccess ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('locationAccess', !securitySettings.locationAccess)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        securitySettings.locationAccess ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Contacts Access</Text>
                    <Text style={styles.explanationText}>Allow app to access your contacts</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        securitySettings.contactsAccess ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('contactsAccess', !securitySettings.contactsAccess)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        securitySettings.contactsAccess ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderAccountRecovery = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Recovery</Text>
            
            <TouchableOpacity style={styles.settingRow} onPress={handleBackupEmail}>
                <View style={styles.settingInfo}>
                    <Ionicons name="mail" size={20} color="#000" />
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Backup Email</Text>
                        <Text style={styles.settingSubtitle}>
                            {backupEmail ? backupEmail : 'Add recovery email address'}
                        </Text>
                    </View>
                </View>
                <View style={styles.settingStatus}>
                                         {backupEmail ? (
                         <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                     ) : (
                         <Ionicons name="add-circle" size={20} color="#fff" />
                     )}
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={handlePhoneVerification}>
                <View style={styles.settingInfo}>
                    <Ionicons name="call" size={20} color="#000" />
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Phone Verification</Text>
                        <Text style={styles.settingSubtitle}>
                            {phoneNumber ? phoneNumber : 'Add recovery phone number'}
                        </Text>
                    </View>
                </View>
                <View style={styles.settingStatus}>
                                         {phoneNumber ? (
                         <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                     ) : (
                         <Ionicons name="add-circle" size={20} color="#fff" />
                     )}
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderActiveSessions = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Sessions</Text>
            
            {activeSessions.map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                    <View style={styles.sessionInfo}>
                        <Ionicons 
                            name={session.device.includes('iPhone') ? 'phone-portrait' : 
                                  session.device.includes('MacBook') ? 'laptop' : 'tablet'} 
                            size={20} 
                            color="#000" 
                        />
                        <View style={styles.sessionDetails}>
                            <Text style={styles.sessionDevice}>{session.device}</Text>
                            <Text style={styles.sessionLocation}>{session.location}</Text>
                            <Text style={styles.sessionTime}>{session.lastActive}</Text>
                        </View>
                    </View>
                    <View style={styles.sessionActions}>
                        {session.current && (
                            <Text style={styles.currentSession}>Current</Text>
                        )}
                        {!session.current && (
                            <TouchableOpacity onPress={() => handleLogoutSession(session.id)}>
                                <Text style={styles.logoutText}>Logout</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );

    const renderSecurityActivityLog = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security Activity Log</Text>
            
            {[
                { id: 1, action: 'Password Changed', device: 'iPhone 14 Pro', location: 'San Francisco, CA', time: '2 minutes ago', status: 'success' },
                { id: 2, action: 'Login Attempt', device: 'Unknown Device', location: 'New York, NY', time: '1 hour ago', status: 'warning' },
                { id: 3, action: 'Two-Factor Enabled', device: 'MacBook Pro', location: 'San Francisco, CA', time: '2 days ago', status: 'success' },
                { id: 4, action: 'Biometric Login Enabled', device: 'iPhone 14 Pro', location: 'San Francisco, CA', time: '3 days ago', status: 'success' }
            ].map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityInfo}>
                        <View style={[
                            styles.activityIcon,
                            { backgroundColor: activity.status === 'success' ? '#E8F5E8' : '#FFF3E0' }
                        ]}>
                            <Ionicons 
                                name={activity.status === 'success' ? 'checkmark-circle' : 'warning'} 
                                size={16} 
                                color={activity.status === 'success' ? '#4CAF50' : '#FF9800'} 
                            />
                        </View>
                        <View style={styles.activityDetails}>
                            <Text style={styles.activityAction}>{activity.action}</Text>
                            <Text style={styles.activityDevice}>{activity.device}</Text>
                            <Text style={styles.activityLocation}>{activity.location}</Text>
                            <Text style={styles.activityTime}>{activity.time}</Text>
                        </View>
                    </View>
                    <View style={styles.activityStatus}>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: activity.status === 'success' ? '#E8F5E8' : '#FFF3E0' }
                        ]}>
                            <Text style={[
                                styles.statusBadgeText,
                                { color: activity.status === 'success' ? '#2E7D32' : '#E65100' }
                            ]}>
                                {activity.status === 'success' ? 'Secure' : 'Review'}
                            </Text>
                        </View>
                    </View>
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
                <Text style={styles.headerTitle}>Security Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Security Score */}
                {renderSecurityScore()}

                {/* Account Security */}
                {renderAccountSecurity()}

                {/* Login Security */}
                {renderLoginSecurity()}


                {/* App Permissions */}
                {renderAppPermissions()}

                {/* Account Recovery */}
                {renderAccountRecovery()}

                {/* Active Sessions */}
                {renderActiveSessions()}

                {/* Security Activity Log */}
                {renderSecurityActivityLog()}



                {/* Information */}
                <View style={styles.infoSection}>
                    <Ionicons name="shield-checkmark" size={20} color="#666" />
                    <Text style={styles.infoText}>
                        These settings help protect your account and personal information. We recommend enabling two-factor authentication for enhanced security.
                    </Text>
                </View>
            </ScrollView>

            {/* Change Password Popup */}
            <ChangePasswordPopup
                isVisible={showPasswordPopup}
                onClose={() => setShowPasswordPopup(false)}
                onPasswordChange={handlePasswordChange}
            />

            {/* Two-Factor Authentication Popup */}
            <TwoFactorAuthPopup
                isVisible={show2FAPopup}
                onClose={() => setShow2FAPopup(false)}
                onEnable2FA={handle2FAChange}
                currentStatus={securitySettings.twoFactorAuth}
            />

            {/* Account Recovery Modals */}
            <BackupEmailModal
                isVisible={showBackupEmailModal}
                onClose={() => setShowBackupEmailModal(false)}
                currentBackupEmail={backupEmail}
                onSaveBackupEmail={handleSaveBackupEmail}
            />

            <PhoneVerificationModal
                isVisible={showPhoneVerificationModal}
                onClose={() => setShowPhoneVerificationModal(false)}
                currentPhoneNumber={phoneNumber}
                onSavePhoneNumber={handleSavePhoneNumber}
            />
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
        borderBottomColor: '#3c4c48',
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
        borderBottomColor: 'rgba(60,76,72,0.15)',
    },
    securityScoreSection: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.15)',
    },
    scoreHeader: {
        marginBottom: 8,
    },
    scoreTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    scoreTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    progressBarContainer: {
        width: '100%',
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(60,76,72,0.15)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    scoreStatus: {
        fontSize: 12,
        color: '#3c4c48',
        textAlign: 'center',
        fontWeight: '500',
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#d72638',
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.15)',
    },
    quickActionText: {
        fontSize: 13,
        color: '#000',
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
    },
    quickActionButton: {
        backgroundColor: '#d72638',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    quickActionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(60,76,72,0.15)',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#3c4c48',
        marginTop: 2,
    },
    settingStatus: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
    },
    settingAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 8,
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
        color: '#3c4c48',
        marginTop: 4,
        lineHeight: 18,
    },
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.15)',
    },
    sessionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sessionDetails: {
        marginLeft: 12,
        flex: 1,
    },
    sessionDevice: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    sessionLocation: {
        fontSize: 14,
        color: '#3c4c48',
        marginTop: 2,
    },
    sessionTime: {
        fontSize: 12,
        color: '#3c4c48',
        marginTop: 2,
    },
    sessionActions: {
        alignItems: 'flex-end',
    },
    currentSession: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    logoutText: {
        fontSize: 14,
        color: '#FF5722',
        fontWeight: '500',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.15)',
    },
    activityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityDetails: {
        flex: 1,
    },
    activityAction: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    activityDevice: {
        fontSize: 12,
        color: '#3c4c48',
        marginBottom: 2,
    },
    activityLocation: {
        fontSize: 12,
        color: '#3c4c48',
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 11,
        color: '#3c4c48',
    },
    activityStatus: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    infoSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.15)',
    },
    infoText: {
        fontSize: 14,
        color: '#3c4c48',
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
        backgroundColor: '#555555',
    },
    switchInactive: {
        backgroundColor: '#E0E0E0',
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

export default SecuritySettings;