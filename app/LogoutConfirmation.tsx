import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';

export default function LogoutConfirmation() {
  const router = useRouter();

  const handleConfirmLogout = () => {
    console.log('User confirmed logout from confirmation page');
    // Clear user data from storage
    // AsyncStorage.removeItem('userToken');
    // AsyncStorage.removeItem('userData');
    
    // Clear any global state
    // setUser(null);
    // setIsAuthenticated(false);
    
    // Navigate to login screen
    router.replace('/Login');
  };

  const handleCancelLogout = () => {
    console.log('User cancelled logout');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Logout Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </View>
        
        {/* Title */}
        <Text style={styles.title}>Logout</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Are you sure you want to logout from your account?
        </Text>
        
        <Text style={styles.subDescription}>
          You will need to sign in again to access your account.
        </Text>
        
        {/* Buttons Container */}
        <View style={styles.buttonsContainer}>
          {/* Cancel Button */}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelLogout}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleConfirmLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  subDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
