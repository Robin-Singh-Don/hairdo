import React, { useState, useEffect } from 'react';
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
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { BankAccount, BusinessPaymentMethod, PaymentTransaction } from '../../services/mock/AppMockData';

export default function BankInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<BusinessPaymentMethod[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<PaymentTransaction[]>([]);
  
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    accountType: 'checking' as 'checking' | 'savings',
    isPrimary: false
  });

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [accounts, methods, transactions] = await Promise.all([
          ownerAPI.getBankAccounts(),
          ownerAPI.getPaymentMethods(),
          ownerAPI.getPaymentTransactions(10),
        ]);
        
        setBankAccounts(accounts);
        setPaymentMethods(methods);
        setRecentTransactions(transactions);
      } catch (error) {
        console.error('Error loading banking data:', error);
        Alert.alert('Error', 'Failed to load banking information');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddBankAccount = async () => {
    if (!newBankAccount.bankName || !newBankAccount.accountNumber || !newBankAccount.routingNumber || !newBankAccount.accountHolderName) {
      Alert.alert('Error', 'Please fill in all bank account details');
      return;
    }

    try {
      const addedAccount = await ownerAPI.addBankAccount({
        bankName: newBankAccount.bankName,
        accountNumber: newBankAccount.accountNumber,
        routingNumber: newBankAccount.routingNumber,
        accountHolderName: newBankAccount.accountHolderName,
        accountType: newBankAccount.accountType,
        isPrimary: newBankAccount.isPrimary,
      });
      
      setBankAccounts([...bankAccounts, addedAccount]);
      Alert.alert('Success', 'Bank account added successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setShowAddBankModal(false);
            setNewBankAccount({
              bankName: '',
              accountNumber: '',
              routingNumber: '',
              accountHolderName: '',
              accountType: 'checking',
              isPrimary: false
            });
          }
        }
      ]);
    } catch (error) {
      console.error('Error adding bank account:', error);
      Alert.alert('Error', 'Failed to add bank account. Please try again.');
    }
  };

  const handleDeleteBankAccount = async (accountId: string) => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to delete this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ownerAPI.deleteBankAccount(accountId);
              setBankAccounts(bankAccounts.filter(acc => acc.id !== accountId));
              Alert.alert('Success', 'Bank account deleted successfully');
            } catch (error: any) {
              console.error('Error deleting bank account:', error);
              Alert.alert('Error', error.message || 'Failed to delete bank account');
            }
          }
        }
      ]
    );
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      await ownerAPI.setPrimaryBankAccount(accountId);
      setBankAccounts(bankAccounts.map(acc => ({
        ...acc,
        isPrimary: acc.id === accountId
      })));
      Alert.alert('Success', 'Primary bank account updated');
    } catch (error) {
      console.error('Error setting primary account:', error);
      Alert.alert('Error', 'Failed to update primary account');
    }
  };


  const renderBankAccount = (account: BankAccount) => (
    <View key={account.id} style={styles.bankCard}>
      <View style={styles.bankHeader}>
        <View style={styles.bankIcon}>
          <Ionicons name="business" size={24} color="#000" />
        </View>
        <View style={styles.bankInfo}>
          <Text style={styles.bankName}>{account.bankName}</Text>
          <Text style={styles.accountNumber}>Account: ****{account.accountNumber}</Text>
        </View>
        <View style={styles.bankActions}>
          {account.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>PRIMARY</Text>
            </View>
          )}
          {account.isVerified && (
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          )}
        </View>
      </View>
      
      <View style={styles.bankDetails}>
        <Text style={styles.routingNumber}>Routing: {account.routingNumber}</Text>
        <Text style={styles.accountHolder}>{account.accountHolderName}</Text>
        <Text style={styles.accountType}>{account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}</Text>
      </View>
      
      <View style={styles.bankCardActions}>
        {!account.isPrimary && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSetPrimary(account.id)}
          >
            <Text style={styles.actionButtonText}>Set as Primary</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBankAccount(account.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#FF6B35" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handlePaymentMethodToggle = async (methodId: string) => {
    const toggledMethod = paymentMethods.find(method => method.id === methodId);
    if (!toggledMethod) return;
    
    const newEnabled = !toggledMethod.enabled;
    
    try {
      await ownerAPI.updatePaymentMethod(methodId, newEnabled);
      setPaymentMethods(paymentMethods.map(method => 
        method.id === methodId 
          ? { ...method, enabled: newEnabled }
          : method
      ));
      Alert.alert('Success', `${toggledMethod.name} ${newEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating payment method:', error);
      Alert.alert('Error', 'Failed to update payment method');
    }
  };

  const renderPaymentMethod = (method: BusinessPaymentMethod) => (
    <View key={method.id} style={styles.paymentMethodItem}>
      <View style={styles.paymentMethodLeft}>
        <View style={styles.paymentMethodIcon}>
          <Ionicons name={method.icon as any} size={20} color="#000" />
        </View>
        <Text style={styles.paymentMethodName}>{method.name}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.customSwitch,
          method.enabled ? styles.switchActive : styles.switchInactive
        ]}
        onPress={() => handlePaymentMethodToggle(method.id)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.switchKnob,
          method.enabled ? styles.knobActive : styles.knobInactive
        ]} />
      </TouchableOpacity>
    </View>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const renderTransaction = (transaction: PaymentTransaction) => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons name="card" size={16} color="#4CAF50" />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{transaction.customerName}</Text>
        <Text style={styles.transactionMethod}>{transaction.method} • {formatDate(transaction.date)}</Text>
      </View>
      <Text style={styles.transactionAmount}>+{formatAmount(transaction.amount)}</Text>
    </View>
  );


  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading banking information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Bank Information</Text>
        <TouchableOpacity 
          onPress={() => setShowAddBankModal(true)} 
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bank Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Account Details</Text>
          {bankAccounts.map(renderBankAccount)}
        </View>

        {/* Customer Payment Flow */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accepted Payment Methods</Text>
          {paymentMethods.map(renderPaymentMethod)}
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="eye-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Preview Customer Payment</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          {recentTransactions.map(renderTransaction)}
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="download-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Export CSV Report</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Verify Bank Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonLeft}>
              <View style={styles.actionIcon}>
                <Ionicons name="list-outline" size={20} color="#000" />
              </View>
              <Text style={styles.actionButtonText}>Audit Logs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Bank Account Modal */}
      <Modal
        visible={showAddBankModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Bank Account</Text>
              <TouchableOpacity onPress={() => setShowAddBankModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Bank Name</Text>
              <TextInput
                style={styles.input}
                value={newBankAccount.bankName}
                onChangeText={(text) => setNewBankAccount({...newBankAccount, bankName: text})}
                placeholder="Enter bank name"
              />
              
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput
                style={styles.input}
                value={newBankAccount.accountNumber}
                onChangeText={(text) => setNewBankAccount({...newBankAccount, accountNumber: text})}
                placeholder="Enter account number"
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Routing Number</Text>
              <TextInput
                style={styles.input}
                value={newBankAccount.routingNumber}
                onChangeText={(text) => setNewBankAccount({...newBankAccount, routingNumber: text})}
                placeholder="Enter routing number"
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Account Type</Text>
              <View style={styles.radioGroup}>
                {['checking', 'savings'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.radioOption}
                    onPress={() => setNewBankAccount({...newBankAccount, accountType: type as 'checking' | 'savings'})}
                  >
                    <View style={[styles.radioButton, newBankAccount.accountType === type && styles.radioSelected]}>
                      {newBankAccount.accountType === type && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>Account Holder Name</Text>
              <TextInput
                style={styles.input}
                value={newBankAccount.accountHolderName}
                onChangeText={(text) => setNewBankAccount({...newBankAccount, accountHolderName: text})}
                placeholder="Enter account holder name"
              />
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setNewBankAccount({...newBankAccount, isPrimary: !newBankAccount.isPrimary})}
                >
                  <View style={[styles.checkboxInner, newBankAccount.isPrimary && styles.checkboxChecked]}>
                    {newBankAccount.isPrimary && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Set as primary account</Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowAddBankModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddBankAccount}>
                <Text style={styles.saveButtonText}>Add Bank Account</Text>
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
  
  // Bank Cards
  bankCard: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
  },
  bankActions: {
    alignItems: 'center',
  },
  primaryBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  primaryText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  bankDetails: {
    marginBottom: 16,
  },
  routingNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  accountHolder: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  accountType: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  bankCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  actionButtonText: {
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
  
  // Payment Methods
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
    backgroundColor: '#E8F5E8',
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
    color: '#4CAF50',
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
  
  // Radio Group
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#000',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
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
