import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function App() {
  // Temporarily bypass authentication for development
  // Go directly to customer explore page
  return <Redirect href="/(customer)/explore" />;
  
  // Original auth code (commented out for now):
  /*
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Redirect href="/Login" />;
  }

  // Redirect based on user type
  const userTypeRedirects = {
    customer: '/(customer)/explore',
    employee: '/(employee)',
    owner: '/(owner)'
  };

  const redirectPath = userTypeRedirects[user.userType] || '/(customer)';
  return <Redirect href={redirectPath as any} />;
  */
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
