import React, { useState } from 'react';
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

    const [subscription] = useState({
        currentPlan: 'Premium',
        planPrice: 9.99,
        billingCycle: 'Monthly',
        nextBilling: 'Jan 15, 2024',
        features: [
            'Unlimited bookings',
            'Priority customer support',
            'Exclusive discounts',
            'No booking fees',
            'Free cancellation'
        ]
    });

    const [billingHistory] = useState([
        {
            id: '1',
            date: 'Dec 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Visa •••• 4242'
        },
        {
            id: '2',
            date: 'Nov 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Visa •••• 4242'
        },
        {
            id: '3',
            date: 'Oct 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Visa •••• 4242'
        }
    ]);

    const [allTransactions] = useState([
        {
            id: '1',
            date: 'Dec 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Visa •••• 4242',
            transactionId: 'TXN-2023-001'
        },
        {
            id: '2',
            date: 'Nov 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Visa •••• 4242',
            transactionId: 'TXN-2023-002'
        },
        {
            id: '3',
            date: 'Oct 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Visa •••• 4242',
            transactionId: 'TXN-2023-003'
        },
        {
            id: '4',
            date: 'Sep 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Mastercard •••• 5555',
            transactionId: 'TXN-2023-004'
        },
        {
            id: '5',
            date: 'Aug 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Mastercard •••• 5555',
            transactionId: 'TXN-2023-005'
        },
        {
            id: '6',
            date: 'Jul 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Visa •••• 4242',
            transactionId: 'TXN-2023-006'
        },
        {
            id: '7',
            date: 'Jun 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Visa •••• 4242',
            transactionId: 'TXN-2023-007'
        },
        {
            id: '8',
            date: 'May 15, 2023',
            amount: 9.99,
            description: 'Premium Subscription',
            status: 'Paid',
            paymentMethod: 'Visa •••• 4242',
            transactionId: 'TXN-2023-008'
        }
    ]);

    const [paymentSettings, setPaymentSettings] = useState({
        autoRenewal: true,
        savePaymentInfo: true,
        emailReceipts: true,
        paperlessBilling: true
    });

    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const [showTransactionsModal, setShowTransactionsModal] = useState(false);
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
        Alert.alert(
            'Remove Payment Method',
            `Are you sure you want to remove ${method.type} ending in ${method.last4}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => console.log('Remove payment method') }
            ]
        );
    };

    const handleSavePaymentMethod = () => {
        // Validate form
        if (!newPaymentMethod.cardNumber || !newPaymentMethod.cardholderName || 
            !newPaymentMethod.expiryMonth || !newPaymentMethod.expiryYear || !newPaymentMethod.cvv) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Create new payment method
        const newMethod = {
            id: Date.now().toString(),
            type: newPaymentMethod.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
            last4: newPaymentMethod.cardNumber.slice(-4),
            isDefault: newPaymentMethod.isDefault,
            expiry: `${newPaymentMethod.expiryMonth}/${newPaymentMethod.expiryYear}`,
            cardholder: newPaymentMethod.cardholderName
        };

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

    const handleCancelSubscription = () => {
        Alert.alert(
            'Cancel Subscription',
            'Are you sure you want to cancel your Premium subscription? You will lose access to premium features at the end of your current billing period.',
            [
                { text: 'Keep Subscription', style: 'cancel' },
                { text: 'Cancel Subscription', style: 'destructive', onPress: () => console.log('Subscription cancelled') }
            ]
        );
    };

    const handleSettingChange = (key, value) => {
        setPaymentSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const renderPaymentMethods = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Methods</Text>
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
                        <TouchableOpacity onPress={() => handleRemovePaymentMethod(method)}>
                            <Ionicons name="trash" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderSubscription = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Subscription</Text>
            
            <View style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                    <Ionicons name="diamond" size={24} color="#FFD700" />
                    <View style={styles.subscriptionInfo}>
                        <Text style={styles.subscriptionPlan}>{subscription.currentPlan} Plan</Text>
                        <Text style={styles.subscriptionPrice}>${subscription.planPrice}/{subscription.billingCycle}</Text>
                    </View>
                </View>
                
                <View style={styles.subscriptionFeatures}>
                    <Text style={styles.featuresTitle}>Plan Features:</Text>
                    {subscription.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>
                
                <View style={styles.subscriptionActions}>
                    <Text style={styles.nextBilling}>Next billing: {subscription.nextBilling}</Text>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
                        <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

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
                        <Text style={styles.amountText}>${item.amount}</Text>
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
            
            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Auto-Renewal</Text>
                    <Text style={styles.explanationText}>Automatically renew your subscription</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        paymentSettings.autoRenewal ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleSettingChange('autoRenewal', !paymentSettings.autoRenewal)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        paymentSettings.autoRenewal ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

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
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment & Subscription</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Payment Methods */}
                {renderPaymentMethods()}

                {/* Current Subscription */}
                {renderSubscription()}

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
                            <TouchableOpacity onPress={handleSavePaymentMethod}>
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
                                    onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: text }))}
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
                                <View style={styles.formSection}>
                                    <Text style={styles.inputLabel}>Expiry Month</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={newPaymentMethod.expiryMonth}
                                        onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: text }))}
                                        placeholder="MM"
                                        keyboardType="numeric"
                                        maxLength={2}
                                    />
                                </View>
                                <View style={styles.formSection}>
                                    <Text style={styles.inputLabel}>Expiry Year</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={newPaymentMethod.expiryYear}
                                        onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: text }))}
                                        placeholder="YY"
                                        keyboardType="numeric"
                                        maxLength={2}
                                    />
                                </View>
                                <View style={styles.formSection}>
                                    <Text style={styles.inputLabel}>CVV</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={newPaymentMethod.cvv}
                                        onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, cvv: text }))}
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
                                             <Text style={styles.transactionAmountText}>${transaction.amount}</Text>
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
                                     <Text style={styles.summaryValue}>${(allTransactions.length * 9.99).toFixed(2)}</Text>
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
    subscriptionCard: {
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    subscriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    subscriptionInfo: {
        marginLeft: 12,
        flex: 1,
    },
    subscriptionPlan: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    subscriptionPrice: {
        fontSize: 16,
        color: '#666',
        marginTop: 2,
    },
    subscriptionFeatures: {
        marginBottom: 16,
    },
    featuresTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        marginBottom: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    featureText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    subscriptionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    nextBilling: {
        fontSize: 14,
        color: '#666',
    },
    cancelButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
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
});

export default PaymentSubscription;