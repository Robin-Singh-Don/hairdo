// Application Configuration
// This file allows you to easily switch between different backend services

export interface AppConfig {
  profileService: 'mock' | 'supabase';
  enableOfflineMode: boolean;
  debugMode: boolean;
  apiTimeout: number;
}

// Development Configuration (using mock data)
export const DEV_CONFIG: AppConfig = {
  profileService: 'mock',
  enableOfflineMode: true,
  debugMode: true,
  apiTimeout: 10000,
};

// Production Configuration (using Supabase)
export const PROD_CONFIG: AppConfig = {
  profileService: 'supabase',
  enableOfflineMode: false,
  debugMode: false,
  apiTimeout: 30000,
};

// Current Configuration (switch between DEV and PROD)
export const CURRENT_CONFIG: AppConfig = DEV_CONFIG; // Change to PROD_CONFIG for production

// Environment-based configuration
export const getConfig = (): AppConfig => {
  const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
  return isDevelopment ? DEV_CONFIG : PROD_CONFIG;
};

// Feature flags
export const FEATURE_FLAGS = {
  enableProfileImageUpload: true,
  enableOfflineSync: true,
  enablePushNotifications: false,
  enableAnalytics: false,
};

export default CURRENT_CONFIG;
