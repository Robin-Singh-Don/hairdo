import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentSubscription = ({ navigation }) => {
    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: '1',
            type: 'Visa',
            last4: '4242',
            isDefault: true,
            expiry: '12/25',
            cardholder: 'Shark Arora'
        },
        {
            id: '2',
            type: 'Mastercard',
            last4: '5555',
            isDefault: false,
            expiry: '08/26',
            cardholder: 'Shark Arora'
        }
    ]);

    // Subscription features removed - will be introduced later

    const [billingHistory] = useState([
        // Billing history cleared - subscription features removed
    ]);

    const [allTransactions] = useState([
        // Transaction history cleared - subscription features removed
    ]);

    const [paymentSettings, setPaymentSettings] = useState({
        savePaymentInfo: true,
        emailReceipts: true,
        paperlessBilling: true
    });

    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const [showTransactionsModal, setShowTransactionsModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [methodToDelete, setMethodToDelete] = useState(null);
    const [newPaymentMethod, setNewPaymentMethod] = useState({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        isDefault: false
    });


    const handleAddPaymentMethod = () => {
        setShowAddPaymentModal(true);
    };

    const handleRemovePaymentMethod = (method) => {
        console.log('Delete button pressed for method:', method);
        setMethodToDelete(method);
        setShowDeleteConfirmModal(true);
    };

    const confirmDeletePaymentMethod = () => {
        if (methodToDelete) {
            console.log('User confirmed deletion, removing payment method:', methodToDelete);
            setPaymentMethods(prev => {
                const updated = prev.filter(pm => pm.id !== methodToDelete.id);
                console.log('Payment methods after removal:', updated);
                return updated;
            });
            setShowDeleteConfirmModal(false);
            setMethodToDelete(null);
            // Show success message using a simple alert
            Alert.alert('Success', 'Payment method removed successfully!');
        }
    };

    const cancelDeletePaymentMethod = () => {
        console.log('User cancelled deletion');
        setShowDeleteConfirmModal(false);
        setMethodToDelete(null);
    };

    const validateAndFormatMonth = (month) => {
        const num = parseInt(month);
        if (isNaN(num)) return '';
        
        if (num >= 1 && num <= 9) {
            return `0${num}`;
        } else if (num >= 10 && num <= 12) {
            return num.toString();
        } else {
            return month; // Keep as is for validation error
        }
    };

    const validateMonth = (month) => {
        const num = parseInt(month);
        return !isNaN(num) && num >= 1 && num <= 12;
    };

    const validateYear = (year) => {
        const num = parseInt(year);
        const currentYear = new Date().getFullYear() % 100; // Get last 2 digits
        const futureYear = currentYear + 20; // Allow up to 20 years in future
        
        return !isNaN(num) && num >= currentYear && num <= futureYear;
    };

    const handleSavePaymentMethod = () => {
        console.log('Save button pressed - handleSavePaymentMethod called');
        console.log('Current form data:', newPaymentMethod);
        
        // Validate form
        console.log('Validating form fields...');
        console.log('Card Number:', newPaymentMethod.cardNumber);
        console.log('Cardholder Name:', newPaymentMethod.cardholderName);
        console.log('Expiry Month:', newPaymentMethod.expiryMonth);
        console.log('Expiry Year:', newPaymentMethod.expiryYear);
        console.log('CVV:', newPaymentMethod.cvv);
        
        if (!newPaymentMethod.cardNumber || !newPaymentMethod.cardholderName || 
            !newPaymentMethod.expiryMonth || !newPaymentMethod.expiryYear || !newPaymentMethod.cvv) {
            console.log('Validation failed: Missing required fields');
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        console.log('Form validation passed');

        // Validate month
        if (!validateMonth(newPaymentMethod.expiryMonth)) {
            Alert.alert('Invalid Month', 'Please enter a valid month (01-12)');
            return;
        }

        // Validate year
        if (!validateYear(newPaymentMethod.expiryYear)) {
            const currentYear = new Date().getFullYear() % 100;
            Alert.alert('Invalid Year', `Please enter a valid year (${currentYear} - ${currentYear + 20})`);
            return;
        }

        // Validate CVV
        if (newPaymentMethod.cvv.length < 3) {
            Alert.alert('Invalid CVV', 'CVV must be at least 3 digits');
            return;
        }

        // Validate card number (basic validation)
        const cleanCardNumber = newPaymentMethod.cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            Alert.alert('Invalid Card Number', 'Please enter a valid card number');
            return;
        }

        try {
            // Format month
            const formattedMonth = validateAndFormatMonth(newPaymentMethod.expiryMonth);

        // Create new payment method
        const newMethod = {
            id: Date.now().toString(),
                type: cleanCardNumber.startsWith('4') ? 'Visa' : 
                      cleanCardNumber.startsWith('5') ? 'Mastercard' : 'Card',
                last4: cleanCardNumber.slice(-4),
            isDefault: newPaymentMethod.isDefault,
                expiry: `${formattedMonth}/${newPaymentMethod.expiryYear}`,
            cardholder: newPaymentMethod.cardholderName
        };

            console.log('New payment method:', newMethod);

            // If this is set as default, remove default from other cards
            if (newPaymentMethod.isDefault) {
                setPaymentMethods(prev => prev.map(method => ({ ...method, isDefault: false })));
            }

        // Add to payment methods
        setPaymentMethods(prev => [...prev, newMethod]);

        // Reset form and close modal
        setNewPaymentMethod({
            cardNumber: '',
            cardholderName: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: '',
            isDefault: false
        });
        setShowAddPaymentModal(false);

        Alert.alert('Success', 'Payment method added successfully!');
        } catch (error) {
            console.error('Error saving payment method:', error);
            Alert.alert('Error', 'Failed to save payment method. Please try again.');
        }
    };

    const handleCancelAddPayment = () => {
        setNewPaymentMethod({
            cardNumber: '',
            cardholderName: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: '',
            isDefault: false
        });
        setShowAddPaymentModal(false);
    };

    // Subscription cancellation removed - will be introduced later

    const handleSettingChange = (key, value) => {
        setPaymentSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const renderPaymentMethods = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Methods ({paymentMethods.length})</Text>
                <TouchableOpacity onPress={handleAddPaymentMethod}>
                    <Ionicons name="add-circle" size={24} color="#AEB4F7" />
                </TouchableOpacity>
            </View>
            
            {paymentMethods.map((method) => (
                <View key={method.id} style={styles.paymentMethodCard}>
                    <View style={styles.paymentMethodInfo}>
                        <Ionicons 
                            name={method.type === 'Visa' ? 'card' : 'card-outline'} 
                            size={24} 
                            color="#AEB4F7" 
                        />
                        <View style={styles.paymentMethodDetails}>
                            <Text style={styles.paymentMethodType}>{method.type}</Text>
                            <Text style={styles.paymentMethodNumber}>•••• {method.last4}</Text>
                            <Text style={styles.paymentMethodExpiry}>Expires {method.expiry}</Text>
                        </View>
                    </View>
                    <View style={styles.paymentMethodActions}>
                        {method.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>Default</Text>
                            </View>
                        )}
                        <TouchableOpacity 
                            onPress={() => handleRemovePaymentMethod(method)}
                            style={{ padding: 8 }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );

    // Subscription rendering removed - will be introduced later

    const renderBillingHistory = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing History</Text>
            
            {billingHistory.map((item) => (
                <View key={item.id} style={styles.billingItem}>
                    <View style={styles.billingInfo}>
                        <Text style={styles.billingDate}>{item.date}</Text>
                        <Text style={styles.billingDescription}>{item.description}</Text>
                    </View>
                    <View style={styles.billingAmount}>
                        <Text style={styles.amountText}>C${item.amount}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Paid' ? '#4CAF50' : '#FF9800' }]}>
                            <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                    </View>
                </View>
            ))}
            
            <TouchableOpacity style={styles.viewAllButton} onPress={() => setShowTransactionsModal(true)}>
                <Text style={styles.viewAllText}>View All Transactions</Text>
                <Ionicons name="chevron-forward" size={16} color="#AEB4F7" />
            </TouchableOpacity>
        </View>
    );

    const renderPaymentSettings = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Settings</Text>
            
            {/* Auto-renewal setting removed - subscription features removed */}

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Save Payment Info</Text>
                    <Text style={styles.explanationText}>Securely store your payment information</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        paymentSettings.savePaymentInfo ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('savePaymentInfo', !paymentSettings.savePaymentInfo)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        paymentSettings.savePaymentInfo ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Email Receipts</Text>
                    <Text style={styles.explanationText}>Receive payment confirmations via email</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        paymentSettings.emailReceipts ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('emailReceipts', !paymentSettings.emailReceipts)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        paymentSettings.emailReceipts ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Paperless Billing</Text>
                    <Text style={styles.explanationText}>Receive bills electronically instead of paper</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        paymentSettings.paperlessBilling ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('paperlessBilling', !paymentSettings.paperlessBilling)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        paymentSettings.paperlessBilling ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Payment Methods */}
                {renderPaymentMethods()}

                {/* Subscription section removed - will be introduced later */}

                {/* Billing History */}
                {renderBillingHistory()}

                {/* Payment Settings */}
                {renderPaymentSettings()}

                {/* Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    
                    <TouchableOpacity style={styles.supportRow}>
                        <View style={styles.supportInfo}>
                            <Ionicons name="help-circle" size={20} color="#AEB4F7" />
                            <Text style={styles.supportTitle}>Payment Help</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.supportRow}>
                        <View style={styles.supportInfo}>
                            <Ionicons name="document-text" size={20} color="#AEB4F7" />
                            <Text style={styles.supportTitle}>Terms of Service</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.supportRow}>
                        <View style={styles.supportInfo}>
                            <Ionicons name="shield-checkmark" size={20} color="#AEB4F7" />
                            <Text style={styles.supportTitle}>Privacy Policy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Add Payment Method Modal */}
            <Modal
                visible={showAddPaymentModal}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCancelAddPayment}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={handleCancelAddPayment}
                >
                    <TouchableOpacity 
                        style={styles.modalContent} 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Payment Method</Text>
                                    <TouchableOpacity 
                                        onPress={() => {
                                            console.log('Save button TouchableOpacity pressed');
                                            handleSavePaymentMethod();
                                        }}
                                style={{ padding: 10 }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.saveButton}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalSubtitle}>Enter your card details securely</Text>

                            <View style={styles.formSection}>
                                <Text style={styles.inputLabel}>Card Number</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={newPaymentMethod.cardNumber}
                                    onChangeText={(text) => {
                                        // Remove all non-numeric characters
                                        const numericText = text.replace(/[^0-9]/g, '');
                                        // Limit to 16 characters
                                        const limitedText = numericText.slice(0, 16);
                                        // Add spaces every 4 digits
                                        const formattedText = limitedText.replace(/(.{4})/g, '$1 ').trim();
                                        setNewPaymentMethod(prev => ({ ...prev, cardNumber: formattedText }));
                                    }}
                                    placeholder="1234 5678 9012 3456"
                                    keyboardType="numeric"
                                    maxLength={19}
                                />
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.inputLabel}>Cardholder Name</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={newPaymentMethod.cardholderName}
                                    onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, cardholderName: text }))}
                                    placeholder="John Doe"
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.formSectionSmall}>
                                    <Text style={styles.inputLabel}>Expiry Month</Text>
                                    <TextInput
                                        style={styles.modalInputSmall}
                                        value={newPaymentMethod.expiryMonth}
                                        onChangeText={(text) => {
                                            // Only allow numbers
                                            const numericText = text.replace(/[^0-9]/g, '');
                                            // Limit to 2 characters
                                            const limitedText = numericText.slice(0, 2);
                                            setNewPaymentMethod(prev => ({ ...prev, expiryMonth: limitedText }));
                                        }}
                                        placeholder="MM"
                                        keyboardType="numeric"
                                        maxLength={2}
                                    />
                                </View>
                                <View style={styles.formSectionSmall}>
                                    <Text style={styles.inputLabel}>Expiry Year</Text>
                                    <TextInput
                                        style={styles.modalInputSmall}
                                        value={newPaymentMethod.expiryYear}
                                        onChangeText={(text) => {
                                            // Only allow numbers
                                            const numericText = text.replace(/[^0-9]/g, '');
                                            // Limit to 2 characters
                                            const limitedText = numericText.slice(0, 2);
                                            setNewPaymentMethod(prev => ({ ...prev, expiryYear: limitedText }));
                                        }}
                                        placeholder="YY"
                                        keyboardType="numeric"
                                        maxLength={2}
                                    />
                                </View>
                                <View style={styles.formSectionSmall}>
                                    <Text style={styles.inputLabel}>CVV</Text>
                                    <TextInput
                                        style={styles.modalInputSmall}
                                        value={newPaymentMethod.cvv}
                                        onChangeText={(text) => {
                                            // Only allow numbers
                                            const numericText = text.replace(/[^0-9]/g, '');
                                            // Limit to 4 characters
                                            const limitedText = numericText.slice(0, 4);
                                            setNewPaymentMethod(prev => ({ ...prev, cvv: limitedText }));
                                        }}
                                        placeholder="123"
                                        keyboardType="numeric"
                                        maxLength={4}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <View style={styles.checkboxRow}>
                                <TouchableOpacity
                                    style={styles.checkbox}
                                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                                >
                                    <View style={[
                                        styles.checkboxInner,
                                        newPaymentMethod.isDefault && styles.checkboxChecked
                                    ]}>
                                        {newPaymentMethod.isDefault && (
                                            <Ionicons name="checkmark" size={16} color="#fff" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.checkboxLabel}>Set as default payment method</Text>
                            </View>

                            <View style={styles.modalInfo}>
                                <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                                <Text style={styles.modalInfoText}>
                                    Your payment information is encrypted and secure
                                </Text>
                            </View>
                                                                          </ScrollView>
                     </TouchableOpacity>
                 </TouchableOpacity>
             </Modal>

             {/* Transactions Modal */}
             <Modal
                 visible={showTransactionsModal}
                 animationType="slide"
                 transparent={true}
                 onRequestClose={() => setShowTransactionsModal(false)}
             >
                 <TouchableOpacity 
                     style={styles.modalOverlay} 
                     activeOpacity={1} 
                     onPress={() => setShowTransactionsModal(false)}
                 >
                     <TouchableOpacity 
                         style={styles.modalContent} 
                         activeOpacity={1}
                         onPress={(e) => e.stopPropagation()}
                     >
                         <View style={styles.modalHeader}>
                             <Text style={styles.modalTitle}>Transaction History</Text>
                             <TouchableOpacity onPress={() => setShowTransactionsModal(false)}>
                                 <Text style={styles.saveButton}>Done</Text>
                             </TouchableOpacity>
                         </View>

                         <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                             <Text style={styles.modalSubtitle}>All your payment transactions</Text>

                             {allTransactions.map((transaction) => (
                                 <View key={transaction.id} style={styles.transactionItem}>
                                     <View style={styles.transactionHeader}>
                                         <View style={styles.transactionInfo}>
                                             <Text style={styles.transactionDate}>{transaction.date}</Text>
                                             <Text style={styles.transactionDescription}>{transaction.description}</Text>
                                             <Text style={styles.transactionId}>ID: {transaction.transactionId}</Text>
                                             <Text style={styles.transactionPaymentMethod}>{transaction.paymentMethod}</Text>
                                         </View>
                                         <View style={styles.transactionAmount}>
                                             <Text style={styles.transactionAmountText}>C${transaction.amount}</Text>
                                             <View style={[
                                                 styles.statusBadge, 
                                                 { backgroundColor: transaction.status === 'Paid' ? '#4CAF50' : '#FF9800' }
                                             ]}>
                                                 <Text style={styles.statusText}>{transaction.status}</Text>
                                             </View>
                                         </View>
                                     </View>
                                 </View>
                             ))}

                             <View style={styles.transactionSummary}>
                                 <Text style={styles.summaryTitle}>Summary</Text>
                                 <View style={styles.summaryRow}>
                                     <Text style={styles.summaryLabel}>Total Transactions:</Text>
                                     <Text style={styles.summaryValue}>{allTransactions.length}</Text>
                                 </View>
                                 <View style={styles.summaryRow}>
                                     <Text style={styles.summaryLabel}>Total Amount:</Text>
                                     <Text style={styles.summaryValue}>C${(allTransactions.length * 9.99).toFixed(2)}</Text>
                                 </View>
                                 <View style={styles.summaryRow}>
                                     <Text style={styles.summaryLabel}>Period:</Text>
                                     <Text style={styles.summaryValue}>May 2023 - Dec 2023</Text>
                                 </View>
                             </View>
                         </ScrollView>
                     </TouchableOpacity>
                 </TouchableOpacity>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteConfirmModal}
                transparent={true}
                animationType="fade"
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={cancelDeletePaymentMethod}
                >
                    <TouchableOpacity 
                        style={styles.deleteConfirmModal} 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.deleteConfirmHeader}>
                            <Ionicons name="warning" size={32} color="#FF6B6B" />
                            <Text style={styles.deleteConfirmTitle}>Remove Payment Method</Text>
                        </View>
                        
                        <Text style={styles.deleteConfirmMessage}>
                            Are you sure you want to remove {methodToDelete?.type} ending in {methodToDelete?.last4}?
                        </Text>
                        
                        <View style={styles.deleteConfirmButtons}>
                            <TouchableOpacity 
                                style={styles.deleteCancelButton}
                                onPress={cancelDeletePaymentMethod}
                            >
                                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.deleteConfirmButton}
                                onPress={confirmDeletePaymentMethod}
                            >
                                <Text style={styles.deleteConfirmButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                     </TouchableOpacity>
                 </TouchableOpacity>
             </Modal>
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
    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 12,
    },
    paymentMethodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentMethodDetails: {
        marginLeft: 12,
        flex: 1,
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
    paymentMethodExpiry: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    paymentMethodActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    defaultBadge: {
        backgroundColor: '#AEB4F7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 12,
    },
    defaultBadgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    // Subscription styles removed - will be introduced later
    billingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    billingInfo: {
        flex: 1,
    },
    billingDate: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    billingDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    billingAmount: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    viewAllText: {
        fontSize: 14,
        color: '#AEB4F7',
        fontWeight: '500',
        marginRight: 4,
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
    supportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    supportInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    supportTitle: {
        fontSize: 16,
        color: '#000',
        marginLeft: 12,
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        zIndex: 1000,
        elevation: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '90%',
        zIndex: 1001,
        elevation: 1001,
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
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#AEB4F7',
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
    formSection: {
        marginBottom: 16,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    formSectionSmall: {
        flex: 1,
        marginBottom: 16,
    },
    modalInputSmall: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        minWidth: 60,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
        fontWeight: '500',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkbox: {
        marginRight: 12,
    },
    checkboxInner: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#AEB4F7',
        borderColor: '#AEB4F7',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    modalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    modalInfoText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    // Transaction Modal Styles
    transactionItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    transactionInfo: {
        flex: 1,
        marginRight: 16,
    },
    transactionDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    transactionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    transactionId: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    transactionPaymentMethod: {
        fontSize: 12,
        color: '#AEB4F7',
        fontWeight: '500',
    },
    transactionAmount: {
        alignItems: 'flex-end',
    },
    transactionAmountText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    transactionSummary: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    
    // Delete Confirmation Modal Styles
    deleteConfirmModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        margin: 20,
        maxWidth: 340,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    deleteConfirmHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    deleteConfirmTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginTop: 12,
        textAlign: 'center',
    },
    deleteConfirmMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    deleteConfirmButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    deleteCancelButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    deleteCancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    deleteConfirmButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#FF6B6B',
        alignItems: 'center',
    },
    deleteConfirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default PaymentSubscription;