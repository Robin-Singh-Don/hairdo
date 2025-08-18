import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PhoneVerificationModal = ({ isVisible, onClose, currentPhoneNumber, onSavePhoneNumber }) => {
    const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber || '');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [step, setStep] = useState('setup'); // 'setup' or 'verify'
    const [countdown, setCountdown] = useState(0);

    const handleSendCode = async () => {
        if (!phoneNumber.trim()) {
            Alert.alert('Error', 'Please enter a phone number');
            return;
        }

        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your current password to verify this change');
            return;
        }

        // Basic phone validation (simple US format)
        const phoneRegex = /^\+?1?\s*\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call - in real app, this would call your backend to send SMS
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Move to verification step
            setStep('verify');
            
            // Start countdown for resend (60 seconds)
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            Alert.alert('Code Sent', 'A verification code has been sent to your phone number.');
        } catch (error) {
            Alert.alert('Error', 'Failed to send verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }

        if (verificationCode.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-digit verification code');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call - in real app, this would call your backend to verify code
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Call parent function to save the phone number
            onSavePhoneNumber({
                phoneNumber: phoneNumber.trim(),
                password: password,
                verified: true
            });
            
            onClose();
            Alert.alert('Success', 'Phone number has been verified and added successfully!');
        } catch (error) {
            Alert.alert('Error', 'Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemovePhone = () => {
        if (!currentPhoneNumber) return;

        Alert.alert(
            'Remove Phone Number',
            'Are you sure you want to remove your verified phone number? This will make account recovery more difficult.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: () => {
                        onSavePhoneNumber({ phoneNumber: '', password: '', verified: false });
                        onClose();
                        Alert.alert('Removed', 'Phone number has been removed.');
                    }
                }
            ]
        );
    };

    const handleResendCode = () => {
        if (countdown > 0) return;
        handleSendCode();
    };

    const handleBackToSetup = () => {
        setStep('setup');
        setVerificationCode('');
        setCountdown(0);
    };

    const formatPhoneNumber = (text) => {
        // Remove all non-digits
        const cleaned = text.replace(/\D/g, '');
        
        // Format as (XXX) XXX-XXXX
        if (cleaned.length <= 3) {
            return cleaned;
        } else if (cleaned.length <= 6) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        } else {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        {step === 'verify' && (
                            <TouchableOpacity onPress={handleBackToSetup} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color="#666" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>
                            {step === 'verify' ? 'Verify Phone Number' : 'Phone Verification'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Current Status */}
                        {currentPhoneNumber && step === 'setup' && (
                            <View style={styles.currentStatus}>
                                <View style={styles.statusHeader}>
                                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                    <Text style={styles.statusTitle}>Phone Number Verified</Text>
                                </View>
                                <Text style={styles.currentPhone}>{currentPhoneNumber}</Text>
                                <Text style={styles.statusDescription}>
                                    This phone number will be used for account recovery via SMS verification.
                                </Text>
                                
                                <View style={styles.statusActions}>
                                    <TouchableOpacity 
                                        style={styles.secondaryButton}
                                        onPress={() => setStep('verify')}
                                    >
                                        <Ionicons name="refresh" size={16} color="#AEB4F7" />
                                        <Text style={styles.secondaryButtonText}>Change Number</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.dangerButton}
                                        onPress={handleRemovePhone}
                                    >
                                        <Ionicons name="trash" size={16} color="#F44336" />
                                        <Text style={styles.dangerButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Setup Form */}
                        {step === 'setup' && (
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>
                                    {currentPhoneNumber ? 'Update Phone Number' : 'Add Phone Number'}
                                </Text>
                                <Text style={styles.sectionDescription}>
                                    {currentPhoneNumber 
                                        ? 'Enter a new phone number below for verification.'
                                        : 'Add a phone number to help you recover your account via SMS verification.'
                                    }
                                </Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Phone Number</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={phoneNumber}
                                        onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                                        placeholder="(555) 123-4567"
                                        keyboardType="phone-pad"
                                        maxLength={14}
                                    />
                                    <Text style={styles.inputHelp}>
                                        Enter your phone number including country code if needed
                                    </Text>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Current Password</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={[styles.textInput, styles.passwordInput]}
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="Enter your current password"
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity 
                                            style={styles.eyeButton}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <Ionicons 
                                                name={showPassword ? "eye-off" : "eye"} 
                                                size={20} 
                                                color="#666" 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.inputHelp}>
                                        Required to verify this security change
                                    </Text>
                                </View>

                                <View style={styles.securityNote}>
                                    <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                                    <Text style={styles.securityNoteText}>
                                        Your phone number will only be used for account recovery and security notifications.
                                    </Text>
                                </View>

                                <TouchableOpacity 
                                    style={[
                                        styles.primaryButton, 
                                        (!phoneNumber.trim() || !password.trim() || isLoading) && 
                                        styles.primaryButtonDisabled
                                    ]}
                                    onPress={handleSendCode}
                                    disabled={!phoneNumber.trim() || !password.trim() || isLoading}
                                >
                                    {isLoading ? (
                                        <Text style={styles.primaryButtonText}>Sending...</Text>
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Send Verification Code</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Verification Form */}
                        {step === 'verify' && (
                            <View style={styles.formSection}>
                                <View style={styles.verificationHeader}>
                                    <Ionicons name="phone-portrait" size={48} color="#AEB4F7" />
                                    <Text style={styles.verificationTitle}>Enter Verification Code</Text>
                                    <Text style={styles.verificationSubtitle}>
                                        We've sent a 6-digit code to {phoneNumber}
                                    </Text>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Verification Code</Text>
                                    <TextInput
                                        style={styles.codeInput}
                                        value={verificationCode}
                                        onChangeText={setVerificationCode}
                                        placeholder="000000"
                                        keyboardType="numeric"
                                        maxLength={6}
                                        textAlign="center"
                                        fontSize={24}
                                    />
                                </View>

                                <TouchableOpacity 
                                    style={[
                                        styles.resendButton, 
                                        countdown > 0 && styles.resendButtonDisabled
                                    ]}
                                    onPress={handleResendCode}
                                    disabled={countdown > 0}
                                >
                                    <Text style={[
                                        styles.resendButtonText,
                                        countdown > 0 && styles.resendButtonTextDisabled
                                    ]}>
                                        {countdown > 0 
                                            ? `Resend in ${countdown}s` 
                                            : 'Resend Code'
                                        }
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[
                                        styles.primaryButton, 
                                        (!verificationCode.trim() || verificationCode.length !== 6 || isLoading) && 
                                        styles.primaryButtonDisabled
                                    ]}
                                    onPress={handleVerifyCode}
                                    disabled={!verificationCode.trim() || verificationCode.length !== 6 || isLoading}
                                >
                                    {isLoading ? (
                                        <Text style={styles.primaryButtonText}>Verifying...</Text>
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Verify Code</Text>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.verificationNote}>
                                    <Ionicons name="information-circle" size={20} color="#2196F3" />
                                    <Text style={styles.verificationNoteText}>
                                        The verification code will expire in 10 minutes for security reasons.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '90%',
        maxWidth: 400,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        padding: 4,
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    currentStatus: {
        backgroundColor: '#F8F9FA',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    currentPhone: {
        fontSize: 16,
        fontWeight: '500',
        color: '#AEB4F7',
        marginBottom: 8,
    },
    statusDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    statusActions: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
    },
    secondaryButtonText: {
        fontSize: 14,
        color: '#AEB4F7',
        marginLeft: 6,
        fontWeight: '500',
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F44336',
        backgroundColor: '#FFEBEE',
    },
    dangerButtonText: {
        fontSize: 14,
        color: '#F44336',
        marginLeft: 6,
        fontWeight: '500',
    },
    formSection: {
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#F8F9FA',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        top: 12,
        padding: 4,
    },
    inputHelp: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E8F5E8',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    securityNoteText: {
        fontSize: 14,
        color: '#2E7D32',
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
    verificationHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    verificationTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    verificationSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    codeInput: {
        width: 200,
        height: 60,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        alignSelf: 'center',
    },
    resendButton: {
        alignItems: 'center',
        marginBottom: 24,
    },
    resendButtonDisabled: {
        opacity: 0.5,
    },
    resendButtonText: {
        fontSize: 14,
        color: '#AEB4F7',
        fontWeight: '500',
    },
    resendButtonTextDisabled: {
        color: '#999',
    },
    primaryButton: {
        backgroundColor: '#AEB4F7',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    primaryButtonDisabled: {
        backgroundColor: '#CCC',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    verificationNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
    },
    verificationNoteText: {
        fontSize: 14,
        color: '#1976D2',
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
});

export default PhoneVerificationModal;
