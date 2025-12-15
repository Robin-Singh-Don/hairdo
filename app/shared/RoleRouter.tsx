import React, { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function RoleRouter() {
  const { isLoading, user, isAuthenticated } = useAuth();
  const router = useRouter();

  const role = user?.userType;
  
  console.log('RoleRouter: user:', user, 'role:', role, 'isLoading:', isLoading);
  console.log('RoleRouter: Current state - user exists:', !!user, 'role exists:', !!role, 'isLoading:', isLoading);

  useEffect(() => {
    // If user is logged in but no role is set, redirect to role selection
    if (user && !role && !isLoading) {
      console.log('RoleRouter: User logged in but no role, redirecting to role selection');
      router.replace('/auth/RoleSelection');
    }
  }, [user, role, isLoading, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // If no user is logged in, go to login
  if (!isAuthenticated || !user) {
    return <Redirect href="/Login" />;
  }

  // If user exists but no role, go to role selection
  if (!role) {
    return <Redirect href="/auth/RoleSelection" />;
  }

  switch (role) {
    case 'customer':
      console.log('RoleRouter: User has customer role, redirecting to explore page');
      return <Redirect href="/(customer)/explore" />;
    case 'employee':
      console.log('RoleRouter: User has employee role, redirecting to AdminHomeScreen');
      return <Redirect href="/(employee)/AdminHomeScreen" />;
    case 'owner':
      console.log('RoleRouter: User has owner role, redirecting to OwnerDashboard');
      return <Redirect href="/(owner)/OwnerDashboard" />;
    default:
      console.log('RoleRouter: Unknown role, redirecting to role selection');
      return <Redirect href="/auth/RoleSelection" />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
