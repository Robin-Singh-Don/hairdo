import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (isOwnerLogin = false) => {
    if (!phoneOrEmail.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', phoneOrEmail);
      
      // Use real authentication
      const result = await login(phoneOrEmail, password);
      
      setIsLoading(false);
      
      if (result.success) {
        Alert.alert('Success', result.message);
        // Navigation will be handled by RoleRouter
      } else {
        Alert.alert('Login Failed', result.message);
      }
      
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleSignUp = () => {
    router.push('/auth/RoleSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>CutTrack</Text>
          
          <Text style={styles.loginText}>Log in</Text>
          <Text style={styles.subtitle}>Access to your account</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone / email"
              value={phoneOrEmail}
              onChangeText={setPhoneOrEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={togglePasswordVisibility}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={() => handleLogin(false)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Logging in...' : 'Customer Login'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Or</Text>

          <TouchableOpacity
            style={[styles.ownerBarberButton, isLoading && styles.disabledButton]}
            onPress={() => handleLogin(true)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Logging in...' : 'Owner/Barber Login'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.adminNote}>
            Business owners and barbers can access their dashboard here
          </Text>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.signUpText}>New here? Join now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#000',
  },
  loginText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    marginBottom: 40,
    color: '#00000080',
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#00000061',
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#00000061',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  passwordInput: {
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  loginButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 350,
    marginBottom: 20,
  },
  ownerBarberButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 20,
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 16,
  },
  signUpButton: {
    marginTop: 20,
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  adminNote: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    fontStyle: 'italic',
  },
});
