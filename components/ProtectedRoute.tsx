// ========================================
// PROTECTED ROUTE COMPONENT
// ========================================
// Handles route protection and authentication checks
// Redirects unauthenticated users to login
// ========================================

import React, { ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

// ========================================
// TYPES & INTERFACES
// ========================================

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'customer' | 'employee' | 'owner';
  redirectTo?: string;
  fallback?: ReactNode;
}

// ========================================
// COMPONENT
// ========================================

export function ProtectedRoute({
  children,
  requiredUserType,
  redirectTo = '/Login',
  fallback
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // ========================================
  // LOADING STATE
  // ========================================

  if (isLoading) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // ========================================
  // NOT AUTHENTICATED
  // ========================================

  if (!isAuthenticated || !user) {
    // Use router.replace for navigation in Expo Router
    if (typeof window !== 'undefined') {
      router.replace(redirectTo as any);
    }
    return null;
  }

  // ========================================
  // USER TYPE CHECK
  // ========================================

  if (requiredUserType && user.userType !== requiredUserType) {
    // Redirect based on user type
    const userTypeRedirects = {
      customer: '/(customer)',
      employee: '/(employee)',
      owner: '/(owner)'
    };

    const redirectPath = userTypeRedirects[user.userType] || redirectTo;
    
    if (typeof window !== 'undefined') {
      router.replace(redirectPath as any);
    }
    return null;
  }

  // ========================================
  // RENDER PROTECTED CONTENT
  // ========================================

  return <>{children}</>;
}

// ========================================
// SPECIALIZED COMPONENTS
// ========================================

/**
 * Customer-only route
 */
export function CustomerRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requiredUserType="customer" redirectTo="/(customer)" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Employee-only route
 */
export function EmployeeRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requiredUserType="employee" redirectTo="/(employee)" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Owner-only route
 */
export function OwnerRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requiredUserType="owner" redirectTo="/(owner)" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Admin-only route (owners and employees)
 */
export function AdminRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined') {
      router.replace('/Login' as any);
    }
    return null;
  }

  if (user.userType !== 'owner' && user.userType !== 'employee') {
    if (typeof window !== 'undefined') {
      router.replace('/(customer)' as any);
    }
    return null;
  }

  return <>{children}</>;
}

// ========================================
// UTILITY HOOKS
// ========================================

/**
 * Hook to check if user can access a route
 */
export function useRouteAccess() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const canAccess = (requiredUserType?: 'customer' | 'employee' | 'owner'): boolean => {
    if (isLoading) return false;
    if (!isAuthenticated || !user) return false;
    if (!requiredUserType) return true;
    return user.userType === requiredUserType;
  };

  const canAccessAdmin = (): boolean => {
    return canAccess('owner') || canAccess('employee');
  };

  const redirectTo = (): string => {
    if (!isAuthenticated || !user) return '/Login';
    
    const userTypeRedirects = {
      customer: '/(customer)',
      employee: '/(employee)',
      owner: '/(owner)'
    };

    return userTypeRedirects[user.userType] || '/(customer)';
  };

  return {
    canAccess,
    canAccessAdmin,
    redirectTo,
    isLoading,
    isAuthenticated,
    user
  };
}

/**
 * Hook for conditional rendering based on user type
 */
export function useUserType() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const isCustomer = user?.userType === 'customer';
  const isEmployee = user?.userType === 'employee';
  const isOwner = user?.userType === 'owner';
  const isAdmin = isEmployee || isOwner;

  return {
    isCustomer,
    isEmployee,
    isOwner,
    isAdmin,
    isLoading,
    isAuthenticated,
    user
  };
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

// ========================================
// EXPORTS
// ========================================

export default ProtectedRoute;
