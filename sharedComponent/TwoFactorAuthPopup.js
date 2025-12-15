import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TwoFactorAuthPopup = ({ isVisible, onClose, onEnable2FA, currentStatus }) => {
    const [step, setStep] = useState('main'); // main, setup, backup, verify
    const [selectedMethod, setSelectedMethod] = useState('authenticator');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [qrCodeData, setQrCodeData] = useState('otpauth://totp/HairDoApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=HairDoApp');

    const authMethods = [
        {
            id: 'authenticator',
            title: 'Authenticator App',
            subtitle: 'Use apps like Google Authenticator or Authy',
            icon: 'phone-portrait',
            description: 'Generate time-based codes for secure access'
        },
        {
            id: 'sms',
            title: 'SMS Verification',
            subtitle: 'Receive codes via text message',
            icon: 'chatbubble',
            description: 'Get verification codes sent to your phone'
        },
        {
            id: 'email',
            title: 'Email Verification',
            subtitle: 'Receive codes via email',
            icon: 'mail',
            description: 'Get verification codes sent to your email'
        }
    ];

    const generateBackupCodes = () => {
        const codes = [];
        for (let i = 0; i < 8; i++) {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            codes.push(code);
        }
        return codes;
    };

    const handleMethodSelect = (methodId) => {
        setSelectedMethod(methodId);
        setStep('setup');
    };

    const handleSetup = () => {
        if (selectedMethod === 'authenticator') {
            setStep('setup');
        } else {
            // For SMS/Email, simulate sending code
            Alert.alert(
                'Verification Code Sent',
                `A verification code has been sent to your ${selectedMethod === 'sms' ? 'phone' : 'email'}.`,
                [{ text: 'OK' }]
            );
            setStep('verify');
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate backup codes
            const codes = generateBackupCodes();
            setBackupCodes(codes);
            
            setStep('backup');
        } catch (error) {
            Alert.alert('Error', 'Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteSetup = () => {
        // Generate final backup codes if not already generated
        if (backupCodes.length === 0) {
            setBackupCodes(generateBackupCodes());
        }
        
        // Call parent function to enable 2FA
        onEnable2FA({
            method: selectedMethod,
            backupCodes: backupCodes
        });
        
        onClose();
        Alert.alert('Success', 'Two-factor authentication has been enabled successfully!');
    };

    const handleDisable2FA = () => {
        Alert.alert(
            'Disable Two-Factor Authentication',
            'Are you sure you want to disable 2FA? This will make your account less secure.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Disable', 
                    style: 'destructive',
                    onPress: () => {
                        onEnable2FA({ method: null, backupCodes: [] });
                        onClose();
                        Alert.alert('Disabled', 'Two-factor authentication has been disabled.');
                    }
                }
            ]
        );
    };

    const handleBack = () => {
        if (step === 'setup') {
            setStep('main');
        } else if (step === 'verify') {
            setStep('setup');
        } else if (step === 'backup') {
            setStep('verify');
        }
    };

    const renderMainStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choose Authentication Method</Text>
            <Text style={styles.stepSubtitle}>
                Select how you'd like to receive your verification codes
            </Text>

            {authMethods.map((method) => (
                <TouchableOpacity
                    key={method.id}
                    style={styles.methodCard}
                    onPress={() => handleMethodSelect(method.id)}
                >
                    <View style={styles.methodIcon}>
                        <Ionicons name={method.icon} size={24} color="#AEB4F7" />
                    </View>
                    <View style={styles.methodInfo}>
                        <Text style={styles.methodTitle}>{method.title}</Text>
                        <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                        <Text style={styles.methodDescription}>{method.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
            ))}

            <View style={styles.securityNote}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.securityNoteText}>
                    Two-factor authentication adds an extra layer of security to your account
                </Text>
            </View>
        </View>
    );

    const renderSetupStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Setup {selectedMethod === 'authenticator' ? 'Authenticator App' : selectedMethod === 'sms' ? 'SMS Verification' : 'Email Verification'}</Text>
            
            {selectedMethod === 'authenticator' ? (
                <View style={styles.authenticatorSetup}>
                    <Text style={styles.setupInstructions}>
                        1. Install an authenticator app like Google Authenticator or Authy{'\n'}
                        2. Scan the QR code below{'\n'}
                        3. Enter the 6-digit code from your app
                    </Text>
                    
                    <View style={styles.qrContainer}>
                        <View style={styles.qrCode}>
                            <Text style={styles.qrPlaceholder}>QR Code</Text>
                            <Text style={styles.qrSubtext}>Scan with your authenticator app</Text>
                        </View>
                    </View>
                    
                    <View style={styles.secretKeyContainer}>
                        <Text style={styles.secretKeyLabel}>Secret Key (if you can't scan):</Text>
                        <Text style={styles.secretKey}>JBSWY3DPEHPK3PXP</Text>
                        <TouchableOpacity style={styles.copyButton}>
                            <Ionicons name="copy" size={16} color="#AEB4F7" />
                            <Text style={styles.copyButtonText}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.smsEmailSetup}>
                    <Text style={styles.setupInstructions}>
                        We'll send a verification code to your {selectedMethod === 'sms' ? 'phone number' : 'email address'}.
                    </Text>
                    
                    <View style={styles.contactInfo}>
                        <Ionicons name={selectedMethod === 'sms' ? 'phone' : 'mail'} size={20} color="#AEB4F7" />
                        <Text style={styles.contactText}>
                            {selectedMethod === 'sms' ? '+1 (555) 123-4567' : 'user@example.com'}
                        </Text>
                    </View>
                </View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={handleSetup}>
                <Text style={styles.primaryButtonText}>
                    {selectedMethod === 'authenticator' ? 'Continue' : 'Send Code'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderVerifyStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Enter Verification Code</Text>
            <Text style={styles.stepSubtitle}>
                Enter the 6-digit code from your {selectedMethod === 'authenticator' ? 'authenticator app' : selectedMethod === 'sms' ? 'SMS' : 'email'}
            </Text>

            <View style={styles.codeInputContainer}>
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

            <TouchableOpacity style={styles.resendButton}>
                <Text style={styles.resendButtonText}>Resend Code</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.primaryButton, !verificationCode.trim() && styles.primaryButtonDisabled]}
                onPress={handleVerifyCode}
                disabled={!verificationCode.trim() || isLoading}
            >
                {isLoading ? (
                    <Text style={styles.primaryButtonText}>Verifying...</Text>
                ) : (
                    <Text style={styles.primaryButtonText}>Verify Code</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderBackupStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Backup Codes Generated</Text>
            <Text style={styles.stepSubtitle}>
                Save these backup codes in a secure location. You can use them to access your account if you lose your authentication device.
            </Text>

            <View style={styles.backupCodesContainer}>
                {backupCodes.map((code, index) => (
                    <View key={index} style={styles.backupCode}>
                        <Text style={styles.backupCodeText}>{code}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.backupWarning}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.backupWarningText}>
                    Each backup code can only be used once. Keep them safe and secure.
                </Text>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleCompleteSetup}>
                <Text style={styles.primaryButtonText}>Complete Setup</Text>
            </TouchableOpacity>
        </View>
    );

    const renderCurrentStatus = () => (
        <View style={styles.stepContent}>
            <View style={styles.statusHeader}>
                <Ionicons name="shield-checkmark" size={48} color="#4CAF50" />
                <Text style={styles.statusTitle}>Two-Factor Authentication Enabled</Text>
                <Text style={styles.statusSubtitle}>
                    Your account is protected with an extra layer of security
                </Text>
            </View>

            <View style={styles.statusInfo}>
                <View style={styles.statusRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.statusText}>Authentication method: Authenticator App</Text>
                </View>
                <View style={styles.statusRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.statusText}>Last verified: 2 days ago</Text>
                </View>
                <View style={styles.statusRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.statusText}>Backup codes available</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="refresh" size={20} color="#AEB4F7" />
                <Text style={styles.secondaryButtonText}>Regenerate Backup Codes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dangerButton} onPress={handleDisable2FA}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.dangerButtonText}>Disable 2FA</Text>
            </TouchableOpacity>
        </View>
    );

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
                        {step !== 'main' && (
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={28} color="#666" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>
                            {currentStatus ? 'Two-Factor Authentication' : 'Enable 2FA'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {currentStatus ? renderCurrentStatus() : (
                            <>
                                {step === 'main' && renderMainStep()}
                                {step === 'setup' && renderSetupStep()}
                                {step === 'verify' && renderVerifyStep()}
                                {step === 'backup' && renderBackupStep()}
                            </>
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
    stepContent: {
        paddingBottom: 24,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 12,
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8EAF6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    methodInfo: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    methodSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    methodDescription: {
        fontSize: 12,
        color: '#999',
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E8F5E8',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    securityNoteText: {
        fontSize: 14,
        color: '#2E7D32',
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
    setupInstructions: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 24,
        textAlign: 'center',
    },
    authenticatorSetup: {
        alignItems: 'center',
    },
    qrContainer: {
        marginBottom: 24,
    },
    qrCode: {
        width: 200,
        height: 200,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    qrPlaceholder: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    qrSubtext: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    secretKeyContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    secretKeyLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    secretKey: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'monospace',
        marginBottom: 12,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#E8EAF6',
        borderRadius: 8,
    },
    copyButtonText: {
        fontSize: 14,
        color: '#AEB4F7',
        marginLeft: 6,
        fontWeight: '500',
    },
    smsEmailSetup: {
        alignItems: 'center',
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    contactText: {
        fontSize: 16,
        color: '#000',
        marginLeft: 12,
        fontWeight: '500',
    },
    codeInputContainer: {
        alignItems: 'center',
        marginBottom: 24,
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
    },
    resendButton: {
        alignItems: 'center',
        marginBottom: 24,
    },
    resendButtonText: {
        fontSize: 14,
        color: '#AEB4F7',
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: '#AEB4F7',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonDisabled: {
        backgroundColor: '#CCC',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 12,
    },
    secondaryButtonText: {
        color: '#AEB4F7',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F44336',
        backgroundColor: '#FFEBEE',
    },
    dangerButtonText: {
        color: '#F44336',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    statusHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    statusSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    statusInfo: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusText: {
        fontSize: 14,
        color: '#000',
        marginLeft: 12,
    },
    backupCodesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backupCode: {
        width: (width - 80) / 4 - 8,
        height: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    backupCodeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'monospace',
    },
    backupWarning: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF3E0',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    backupWarningText: {
        fontSize: 14,
        color: '#E65100',
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
});

export default TwoFactorAuthPopup;
