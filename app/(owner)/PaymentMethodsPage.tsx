import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  Modal,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [failedPaymentAlerts, setFailedPaymentAlerts] = useState(true);
  
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    isDefault: false
  });

  const paymentMethods = [
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '25',
      cardholderName: 'John Doe',
      isDefault: true,
      isVerified: true
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '5555',
      expiryMonth: '08',
      expiryYear: '26',
      cardholderName: 'John Doe',
      isDefault: false,
      isVerified: true
    }
  ];

  const subscriptionPlans = [
    { id: 'basic', name: 'Basic Plan', price: '$19.99', features: ['Up to 100 appointments', 'Basic analytics'] },
    { id: 'professional', name: 'Professional Plan', price: '$29.99', features: ['Unlimited appointments', 'Advanced analytics', 'Staff management'], isCurrent: true },
    { id: 'enterprise', name: 'Enterprise Plan', price: '$49.99', features: ['Everything in Professional', 'API access', 'Priority support'] }
  ];

  const outgoingTransactions = [
    {
      id: 1,
      date: 'Dec 1, 2024',
      amount: '$29.99',
      service: 'Professional Plan Subscription',
      method: 'Visa ****4242',
      status: 'completed'
    },
    {
      id: 2,
      date: 'Nov 15, 2024',
      amount: '$15.00',
      service: 'Premium Add-on',
      method: 'Visa ****4242',
      status: 'completed'
    },
    {
      id: 3,
      date: 'Nov 1, 2024',
      amount: '$29.99',
      service: 'Professional Plan Subscription',
      method: 'Mastercard ****5555',
      status: 'completed'
    }
  ];

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.cardholderName) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    if (newCard.cardNumber.length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }

    // TODO: Implement actual card addition with 2FA
    Alert.alert('Success', 'Payment method added successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setShowAddCardModal(false);
          setNewCard({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardholderName: '',
            isDefault: false
          });
        }
      }
    ]);
  };

  const handleUpgradePlan = (planId: string) => {
    Alert.alert('Upgrade Plan', `Are you sure you want to upgrade to ${subscriptionPlans.find(p => p.id === planId)?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Upgrade',
        onPress: () => {
          // TODO: Implement plan upgrade
          Alert.alert('Success', 'Plan upgraded successfully!');
          setShowSubscriptionModal(false);
        }
      }
    ]);
  };

  const handleVerifyTwoFactor = () => {
    if (!twoFactorCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    // TODO: Implement 2FA verification
    Alert.alert('Success', 'Two-factor authentication verified!');
    setShowTwoFactorModal(false);
    setTwoFactorCode('');
  };

  const renderPaymentCard = (card: any) => (
    <View key={card.id} style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name="card-outline" size={24} color="#000" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardType}>{card.type.toUpperCase()}</Text>
          <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
        </View>
        <View style={styles.cardActions}>
          {card.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>DEFAULT</Text>
            </View>
          )}
          {card.isVerified && (
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          )}
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <Text style={styles.cardholderName}>{card.cardholderName}</Text>
        <Text style={styles.expiryDate}>Expires {card.expiryMonth}/{card.expiryYear}</Text>
      </View>
      
      <View style={styles.cardButtons}>
        {!card.isDefault && (
          <TouchableOpacity style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.cardButton, styles.deleteButton]}>
          <Ionicons name="trash-outline" size={16} color="#FF6B35" />
          <Text style={[styles.cardButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSubscriptionPlan = (plan: any) => (
    <TouchableOpacity 
      key={plan.id} 
      style={[styles.planCard, plan.isCurrent && styles.currentPlan]}
      onPress={() => !plan.isCurrent && handleUpgradePlan(plan.id)}
    >
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        {plan.isCurrent && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentText}>CURRENT</Text>
          </View>
        )}
      </View>
      <Text style={styles.planPrice}>{plan.price}/month</Text>
      <View style={styles.planFeatures}>
        {plan.features.map((feature: string, index: number) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark" size={16} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      {!plan.isCurrent && (
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderTransaction = (transaction: any) => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons name="card" size={16} color="#FF6B35" />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{transaction.service}</Text>
        <Text style={styles.transactionMethod}>{transaction.method} • {transaction.date}</Text>
      </View>
      <Text style={styles.transactionAmount}>-{transaction.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity 
          onPress={() => setShowAddCardModal(true)} 
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {paymentMethods.map(renderPaymentCard)}
        </View>

        {/* Subscription Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription & Billing</Text>
          <View style={styles.subscriptionInfo}>
            <View style={styles.subscriptionIcon}>
              <Ionicons name="business" size={24} color="#000" />
            </View>
            <View style={styles.subscriptionDetails}>
              <Text style={styles.subscriptionTitle}>Professional Plan</Text>
              <Text style={styles.subscriptionPrice}>$29.99/month</Text>
              <Text style={styles.subscriptionDate}>Next billing: Dec 15, 2024</Text>
            </View>
            <View style={styles.subscriptionActions}>
              <TouchableOpacity
                style={[
                  styles.customSwitch,
                  autoRenewal ? styles.switchActive : styles.switchInactive
                ]}
                onPress={() => setAutoRenewal(!autoRenewal)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.switchKnob,
                  autoRenewal ? styles.knobActive : styles.knobInactive
                ]} />
              </TouchableOpacity>
              <Text style={styles.autoRenewalText}>Auto-renewal</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="arrow-up-circle-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Manage Subscription</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {outgoingTransactions.map(renderTransaction)}
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="receipt-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Download Receipts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <View style={styles.notificationIcon}>
                <Ionicons name="mail-outline" size={20} color="#000" />
              </View>
              <Text style={styles.notificationText}>Payment confirmations</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.customSwitch,
                emailNotifications ? styles.switchActive : styles.switchInactive
              ]}
              onPress={() => setEmailNotifications(!emailNotifications)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.switchKnob,
                emailNotifications ? styles.knobActive : styles.knobInactive
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <View style={styles.notificationIcon}>
                <Ionicons name="warning-outline" size={20} color="#000" />
              </View>
              <Text style={styles.notificationText}>Failed payment alerts</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.customSwitch,
                failedPaymentAlerts ? styles.switchActive : styles.switchInactive
              ]}
              onPress={() => setFailedPaymentAlerts(!failedPaymentAlerts)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.switchKnob,
                failedPaymentAlerts ? styles.knobActive : styles.knobInactive
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowTwoFactorModal(true)}
          >
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Two-Factor Authentication</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="eye-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>High-Value Transaction Verification</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Optional Add-ons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Gateways</Text>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="link-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Connect Stripe Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="logo-paypal" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Connect PayPal Business</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddCardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                value={newCard.cardholderName}
                onChangeText={(text) => setNewCard({...newCard, cardholderName: text})}
                placeholder="Enter cardholder name"
              />
              
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                value={newCard.cardNumber}
                onChangeText={(text) => setNewCard({...newCard, cardNumber: text.replace(/\D/g, '')})}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
              
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    value={newCard.expiryDate}
                    onChangeText={(text) => setNewCard({...newCard, expiryDate: text})}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard({...newCard, cvv: text.replace(/\D/g, '')})}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setNewCard({...newCard, isDefault: !newCard.isDefault})}
                >
                  <View style={[styles.checkboxInner, newCard.isDefault && styles.checkboxChecked]}>
                    {newCard.isDefault && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Set as default payment method</Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowAddCardModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCard}>
                <Text style={styles.saveButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Subscription Plans Modal */}
      <Modal
        visible={showSubscriptionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Your Plan</Text>
              <TouchableOpacity onPress={() => setShowSubscriptionModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.plansContainer} showsVerticalScrollIndicator={false}>
              {subscriptionPlans.map(renderSubscriptionPlan)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Two-Factor Authentication Modal */}
      <Modal
        visible={showTwoFactorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTwoFactorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
              <TouchableOpacity onPress={() => setShowTwoFactorModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.twoFactorIcon}>
                <Ionicons name="shield-checkmark" size={48} color="#4CAF50" />
              </View>
              <Text style={styles.twoFactorDescription}>
                Enter the 6-digit code from your authenticator app to verify this transaction.
              </Text>
              
              <TextInput
                style={styles.codeInput}
                value={twoFactorCode}
                onChangeText={setTwoFactorCode}
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowTwoFactorModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleVerifyTwoFactor}>
                <Text style={styles.saveButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  // Payment Cards
  paymentCard: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 16,
    color: '#666',
  },
  cardActions: {
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  defaultText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardholderName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  expiryDate: {
    fontSize: 14,
    color: '#666',
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  cardButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    borderColor: '#FF6B35',
  },
  deleteButtonText: {
    color: '#FF6B35',
  },
  
  // Subscription Info
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subscriptionPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  subscriptionDate: {
    fontSize: 12,
    color: '#666',
  },
  subscriptionActions: {
    alignItems: 'center',
  },
  autoRenewalText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  
  // Subscription Plans
  plansContainer: {
    padding: 20,
  },
  planCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currentPlan: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  currentBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  planFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Transactions
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  
  // Notifications
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  
  // Action Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  
  // Two-Factor Authentication
  twoFactorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  twoFactorDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    width: '100%',
    letterSpacing: 8,
  },
  
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
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
