// ========================================
// AUTHENTICATION CONTEXT
// ========================================
// Centralized authentication state management
// Handles login, logout, register, and user state
// ========================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { BookingError } from '../app/structure/Error-Handling';

// ========================================
// TYPES & INTERFACES
// ========================================

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  displayName: string;
  username: string;
  profileImage?: string;
  userType: 'customer' | 'employee' | 'owner';
  isVerified: boolean;
  createdAt: string;
  lastActiveAt?: string;
}

/**
 * Get default avatar URL for users without profile images
 */
const getDefaultAvatar = (userType: AuthUser['userType']): string => {
  const baseUrl = 'https://ui-avatars.com/api/';
  const params = new URLSearchParams({
    name: 'User',
    background: userType === 'customer' ? '007AFF' : userType === 'employee' ? '34C759' : 'FF9500',
    color: 'ffffff',
    size: '200'
  });
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Get user's profile image with fallback to default avatar
 */
export const getUserProfileImage = (user: AuthUser): string => {
  return user.profileImage || getDefaultAvatar(user.userType);
};

export interface AuthState {
  user: AuthUser | null;
  session: any | null; // TODO: Replace with proper Supabase Session type when installed
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  // Authentication methods
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  
  // User management
  updateProfile: (updates: Partial<AuthUser>) => Promise<AuthResult>;
  refreshUser: (force?: boolean) => Promise<void>;
  
  // Utility methods
  checkAuth: () => Promise<boolean>;
}

export interface AuthResult {
  success: boolean;
  error?: BookingError;
  user?: AuthUser;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  username: string;
  phone?: string;
  userType: 'customer' | 'employee' | 'owner';
}

// ========================================
// CONTEXT CREATION
// ========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================
// PROVIDER COMPONENT
// ========================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Track last fetched user to avoid redundant calls
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      // Set loading state
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Attempting login for:', email);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Login error:', error);
        }
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: new BookingError({
            code: 'AUTH_LOGIN_FAILED',
            message: (error as any).message || 'Login failed',
            userMessage: 'Invalid email or password. Please try again.',
            statusCode: 401
          })
        };
      }

      if (data.user && data.session) {
        // Only fetch profile if we haven't already fetched this user
        if (lastFetchedUserId !== data.user.id) {
          const userProfile = await fetchUserProfile(data.user.id);
          
          if (userProfile) {
            setLastFetchedUserId(data.user.id);
            setAuthState({
              user: userProfile,
              session: data.session,
              isLoading: false,
              isAuthenticated: true,
            });
            
            return {
              success: true,
              user: userProfile
            };
          }
        } else {
          // Use existing user data
          setAuthState(prev => ({
            ...prev,
            session: data.session,
            isLoading: false,
            isAuthenticated: true,
          }));
          
          return {
            success: true,
            user: authState.user!
          };
        }
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: new BookingError({
          code: 'AUTH_LOGIN_FAILED',
          message: 'Login succeeded but user profile not found',
          userMessage: 'Login failed. Please try again.',
          statusCode: 500
        })
      };

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unexpected login error:', error);
      }
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: new BookingError({
          code: 'AUTH_LOGIN_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          userMessage: 'Login failed. Please try again.',
          statusCode: 500
        })
      };
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterData): Promise<AuthResult> => {
    try {
      // Set loading state
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Attempting registration for:', userData.email);
      }
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Registration auth error:', authError);
        }
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: new BookingError({
            code: 'AUTH_REGISTER_FAILED',
            message: (authError as any).message || 'Registration failed',
            userMessage: 'Registration failed. Please try again.',
            statusCode: 400
          })
        };
      }

      if (!authData.user) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: new BookingError({
            code: 'AUTH_REGISTER_FAILED',
            message: 'No user returned from registration',
            userMessage: 'Registration failed. Please try again.',
            statusCode: 500
          })
        };
      }

      // 2. Create user profile in the correct table based on user type
      const userTable = getUserTable(userData.userType);
      const result = await supabase
        .from(userTable)
        .insert({
          user_id: authData.user.id,
          display_name: userData.displayName,
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          user_type: userData.userType,
          is_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      const profileError = (result as any).error;

      if (profileError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Profile creation error:', profileError);
        }
        
        // NOTE: In production, move this cleanup to a serverless function
        // where you can safely use the service-role key
        // For now, we'll just log the error and let the user know
        setAuthState(prev => ({ ...prev, isLoading: false }));
        
        return {
          success: false,
          error: new BookingError({
            code: 'AUTH_REGISTER_FAILED',
            message: (profileError as any).message || 'Profile creation failed',
            userMessage: 'Registration failed. Please try again or contact support.',
            statusCode: 500
          })
        };
      }

      // 3. Create user profile object
      const userProfile: AuthUser = {
        id: authData.user.id,
        email: userData.email,
        phone: userData.phone,
        displayName: userData.displayName,
        username: userData.username,
        userType: userData.userType,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      // 4. Set state if session exists (immediate login)
      if (authData.session) {
        setLastFetchedUserId(authData.user.id);
        setAuthState({
          user: userProfile,
          session: authData.session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }

      return {
        success: true,
        user: userProfile
      };

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unexpected registration error:', error);
      }
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: new BookingError({
          code: 'AUTH_REGISTER_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          userMessage: 'Registration failed. Please try again.',
          statusCode: 500
        })
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Logging out user');
      }
      
      await supabase.auth.signOut();
      
      setLastFetchedUserId(null);
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Logout error:', error);
      }
      // Even if logout fails on server, clear local state
      setLastFetchedUserId(null);
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return {
          success: false,
          error: new BookingError({
            code: 'AUTH_RESET_PASSWORD_FAILED',
            message: (error as any).message || 'Password reset failed',
            userMessage: 'Password reset failed. Please try again.',
            statusCode: 400
          })
        };
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: new BookingError({
          code: 'AUTH_RESET_PASSWORD_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          userMessage: 'Password reset failed. Please try again.',
          statusCode: 500
        })
      };
    }
  };

  /**
   * Update password
   * NOTE: This only works for logged-in users changing their own password.
   * For password reset via email link, handle on a dedicated /reset route.
   */
  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    try {
      if (!authState.user) {
        return {
          success: false,
          error: new BookingError({
            code: 'AUTH_NOT_AUTHENTICATED',
            message: 'User not authenticated',
            userMessage: 'Please log in to update your password.',
            statusCode: 401
          })
        };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Password update error:', error);
        }
        return {
          success: false,
          error: new BookingError({
            code: 'AUTH_UPDATE_PASSWORD_FAILED',
            message: (error as any).message || 'Password update failed',
            userMessage: 'Password update failed. Please try again.',
            statusCode: 400
          })
        };
      }

      return { success: true };

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unexpected password update error:', error);
      }
      return {
        success: false,
        error: new BookingError({
          code: 'AUTH_UPDATE_PASSWORD_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          userMessage: 'Password update failed. Please try again.',
          statusCode: 500
        })
      };
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates: Partial<AuthUser>): Promise<AuthResult> => {
    try {
      if (!authState.user) {
        return {
          success: false,
          error: new BookingError({
            code: 'AUTH_NOT_AUTHENTICATED',
            message: 'User not authenticated',
            userMessage: 'Please log in to update your profile.',
            statusCode: 401
          })
        };
      }

      const userTable = getUserTable(authState.user.userType);
      const result = await supabase
        .from(userTable)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authState.user.id);
      
      const error = (result as any).error;

      if (error) {
        return {
          success: false,
          error: new BookingError({
            code: 'AUTH_UPDATE_PROFILE_FAILED',
            message: (error as any).message || 'Profile update failed',
            userMessage: 'Profile update failed. Please try again.',
            statusCode: 400
          })
        };
      }

      // Update local state
      const updatedUser = { ...authState.user, ...updates };
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      return {
        success: true,
        user: updatedUser
      };

    } catch (error) {
      return {
        success: false,
        error: new BookingError({
          code: 'AUTH_UPDATE_PROFILE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          userMessage: 'Profile update failed. Please try again.',
          statusCode: 500
        })
      };
    }
  };

  /**
   * Refresh user data
   * @param force - Force refresh even if user was recently fetched
   */
  const refreshUser = async (force = false): Promise<void> => {
    if (authState.user && (force || lastFetchedUserId !== authState.user.id)) {
      const userProfile = await fetchUserProfile(authState.user.id);
      if (userProfile) {
        setLastFetchedUserId(authState.user.id);
        setAuthState(prev => ({
          ...prev,
          user: userProfile
        }));
      }
    }
  };

  /**
   * Check authentication status
   */
  const checkAuth = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get the correct table name based on user type
 */
const getUserTable = (userType: AuthUser['userType']): string => {
  switch (userType) {
    case 'employee': return 'employees';
    case 'owner': return 'owners';
    default: return 'customers';
  }
};

/**
 * User type mapping for optimized profile fetching
 * TODO: In production, consider storing this in JWT claims or a lookup table
 * to avoid querying multiple tables
 */
const USER_TYPE_MAPPING: Record<string, AuthUser['userType']> = {
  // This could be populated from a cache or JWT claims
  // Example: 'user123': 'customer', 'user456': 'employee'
};

/**
 * Get user type from mapping (if available)
 * Falls back to table scanning if not found
 */
const getUserTypeFromMapping = (userId: string): AuthUser['userType'] | null => {
  return USER_TYPE_MAPPING[userId] || null;
};

/**
 * Fetch user profile from database
 * Tries multiple tables to find the user profile
 * TODO: Optimize with user type mapping for large-scale apps
 */
const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      // Check if we have user type mapping first (optimization)
      const mappedUserType = getUserTypeFromMapping(userId);
      
      if (mappedUserType) {
        // Query specific table based on mapping
        const table = getUserTable(mappedUserType);
        const result = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!result.error && result.data) {
          const data = result.data as any;
          return {
            id: data.user_id || data.id,
            email: data.email,
            phone: data.phone,
            displayName: data.display_name,
            username: data.username,
            profileImage: data.profile_image,
            userType: data.user_type,
            isVerified: data.is_verified,
            createdAt: data.created_at,
            lastActiveAt: data.last_active_at,
          };
        }
      }

      // Fallback: Define tables to try in order of likelihood
      const tables = ['customers', 'employees', 'owners'] as const;
      
      for (const table of tables) {
        const result = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!result.error && result.data) {
          const data = result.data as any;
          return {
            id: data.user_id || data.id,
            email: data.email,
            phone: data.phone,
            displayName: data.display_name,
            username: data.username,
            profileImage: data.profile_image,
            userType: data.user_type,
            isVerified: data.is_verified,
            createdAt: data.created_at,
            lastActiveAt: data.last_active_at,
          };
        }
      }

      // No user found in any table
      if (process.env.NODE_ENV !== 'production') {
        console.error('User profile not found in any table for userId:', userId);
      }
      return null;

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unexpected error fetching user profile:', error);
      }
      return null;
    }
  };

  // ========================================
  // AUTH STATE LISTENER
  // ========================================

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then(userProfile => {
          if (userProfile) {
            setAuthState({
              user: userProfile,
              session,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Auth state changed:', event, session?.user?.email);
        }
        
        if (session?.user) {
          // Only fetch profile if we haven't already fetched this user
          if (lastFetchedUserId !== session.user.id) {
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              setLastFetchedUserId(session.user.id);
              setAuthState({
                user: userProfile,
                session,
                isLoading: false,
                isAuthenticated: true,
              });
            } else {
              setLastFetchedUserId(null);
              setAuthState({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: false,
              });
            }
          } else {
            // Use existing user data, just update session
            setAuthState(prev => ({
              ...prev,
              session,
              isLoading: false,
              isAuthenticated: true,
            }));
          }
        } else {
          setLastFetchedUserId(null);
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
    // Note: lastFetchedUserId dependency is intentional for auth state changes
    // but could potentially cause re-subscription. Monitor in testing.
  }, [lastFetchedUserId]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ========================================
// HOOK
// ========================================

/**
 * Use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ========================================
// EXPORTS
// ========================================

export default AuthContext;
