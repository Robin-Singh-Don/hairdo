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
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface EmployeeRegistrationData {
  invitationCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bankAccount: string;
  profileImage: string | null;
}

export default function EmployeeRegistration() {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EmployeeRegistrationData>({
    invitationCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    bankAccount: '',
    profileImage: null
  });

  // Simulate invitation code validation
  const validateInvitationCode = (code: string) => {
    // In a real app, this would make an API call to validate the code
    return code.startsWith('EMP-') && code.length === 8;
  };

  const handleInvitationCodeSubmit = () => {
    if (!formData.invitationCode) {
      Alert.alert('Error', 'Please enter your invitation code');
      return;
    }

    if (!validateInvitationCode(formData.invitationCode)) {
      Alert.alert('Error', 'Invalid invitation code. Please check and try again.');
      return;
    }

    setStep(2);
  };

  const handleRegistrationSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real app, this would make an API call to register the employee
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      Alert.alert(
        'Success!', 
        'Your employee account has been created successfully. You can now log in.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login or employee dashboard
              console.log('Employee registered successfully');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.step, step >= 1 && styles.stepActive]}>
        <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
      </View>
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <View style={[styles.step, step >= 2 && styles.stepActive]}>
        <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
      </View>
    </View>
  );

  const renderInvitationCodeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="mail" size={60} color="#FF6B35" />
        <Text style={styles.stepTitle}>Enter Invitation Code</Text>
        <Text style={styles.stepDescription}>
          Please enter the invitation code provided by your employer to create your employee account.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Invitation Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your invitation code (e.g., EMP-ABC123)"
            value={formData.invitationCode}
            onChangeText={(text) => setFormData({...formData, invitationCode: text.toUpperCase()})}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleInvitationCodeSubmit}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRegistrationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="person-add" size={60} color="#FF6B35" />
        <Text style={styles.stepTitle}>Complete Your Profile</Text>
        <Text style={styles.stepDescription}>
          Fill in your personal information to complete your employee account setup.
        </Text>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChangeText={(text) => setFormData({...formData, firstName: text})}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChangeText={(text) => setFormData({...formData, lastName: text})}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your address"
              multiline
              numberOfLines={3}
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
            />
          </View>
        </View>

        {/* Account Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a strong password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            />
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Emergency Contact Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter emergency contact name"
              value={formData.emergencyContact}
              onChangeText={(text) => setFormData({...formData, emergencyContact: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Emergency Contact Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter emergency contact phone"
              keyboardType="phone-pad"
              value={formData.emergencyPhone}
              onChangeText={(text) => setFormData({...formData, emergencyPhone: text})}
            />
          </View>
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bank Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your bank account number"
              keyboardType="numeric"
              value={formData.bankAccount}
              onChangeText={(text) => setFormData({...formData, bankAccount: text})}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
          onPress={handleRegistrationSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.submitButtonText}>Creating Account...</Text>
          ) : (
            <>
              <Text style={styles.submitButtonText}>Create Employee Account</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employee Registration</Text>
        <Text style={styles.subtitle}>Join your team</Text>
      </View>

      {renderStepIndicator()}

      {step === 1 ? renderInvitationCodeStep() : renderRegistrationStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#FF6B35',
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#FF6B35',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
