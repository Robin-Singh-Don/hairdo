import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BackupEmailModal = ({ isVisible, onClose, currentBackupEmail, onSaveBackupEmail }) => {
    const [email, setEmail] = useState(currentBackupEmail || '');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');

    const handleSave = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter a backup email address');
            return;
        }

        if (email !== confirmEmail) {
            Alert.alert('Error', 'Email addresses do not match');
            return;
        }

        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your current password to verify this change');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call - in real app, this would call your backend
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Call parent function to save the backup email
            onSaveBackupEmail({
                email: email.trim(),
                password: password
            });
            
            onClose();
            Alert.alert('Success', 'Backup email has been updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update backup email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveBackupEmail = () => {
        if (!currentBackupEmail) return;

        Alert.alert(
            'Remove Backup Email',
            'Are you sure you want to remove your backup email? This will make account recovery more difficult.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: () => {
                        onSaveBackupEmail({ email: '', password: '' });
                        onClose();
                        Alert.alert('Removed', 'Backup email has been removed.');
                    }
                }
            ]
        );
    };

    const handleResendVerification = () => {
        if (!currentBackupEmail) return;

        Alert.alert(
            'Resend Verification',
            'A verification email will be sent to your backup email address.',
            [{ text: 'OK' }]
        );
        // In real app, this would call your backend to resend verification
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
                        <Text style={styles.headerTitle}>Backup Email</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Current Status */}
                        {currentBackupEmail && (
                            <View style={styles.currentStatus}>
                                <View style={styles.statusHeader}>
                                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                    <Text style={styles.statusTitle}>Backup Email Active</Text>
                                </View>
                                <Text style={styles.currentEmail}>{currentBackupEmail}</Text>
                                <Text style={styles.statusDescription}>
                                    This email will be used for account recovery if you ever get locked out.
                                </Text>
                                
                                <View style={styles.statusActions}>
                                    <TouchableOpacity 
                                        style={styles.secondaryButton}
                                        onPress={handleResendVerification}
                                    >
                                        <Ionicons name="refresh" size={16} color="#AEB4F7" />
                                        <Text style={styles.secondaryButtonText}>Resend Verification</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.dangerButton}
                                        onPress={handleRemoveBackupEmail}
                                    >
                                        <Ionicons name="trash" size={16} color="#F44336" />
                                        <Text style={styles.dangerButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Setup/Update Form */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>
                                {currentBackupEmail ? 'Update Backup Email' : 'Add Backup Email'}
                            </Text>
                            <Text style={styles.sectionDescription}>
                                {currentBackupEmail 
                                    ? 'Enter a new backup email address below.'
                                    : 'Add a backup email address to help you recover your account if you ever get locked out.'
                                }
                            </Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Backup Email Address</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter backup email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Confirm Email Address</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={confirmEmail}
                                    onChangeText={setConfirmEmail}
                                    placeholder="Confirm backup email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
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
                                    Your backup email will only be used for account recovery and security notifications.
                                </Text>
                            </View>

                            <TouchableOpacity 
                                style={[
                                    styles.primaryButton, 
                                    (!email.trim() || !confirmEmail.trim() || !password.trim() || isLoading) && 
                                    styles.primaryButtonDisabled
                                ]}
                                onPress={handleSave}
                                disabled={!email.trim() || !confirmEmail.trim() || !password.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <Text style={styles.primaryButtonText}>Saving...</Text>
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        {currentBackupEmail ? 'Update Backup Email' : 'Add Backup Email'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
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
    currentEmail: {
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
    primaryButton: {
        backgroundColor: '#AEB4F7',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonDisabled: {
        backgroundColor: '#CCC',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default BackupEmailModal;
