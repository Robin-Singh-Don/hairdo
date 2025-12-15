// ========================================
// ENVIRONMENT CONFIGURATION
// ========================================
// Allows switching between mock data and Supabase
// ========================================

export const CONFIG = {
  // Data source configuration
  DATA_SOURCE: {
    // Set to 'mock' for development, 'supabase' for production
    PRIMARY: process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock',
    
    // Fallback to mock if Supabase fails
    FALLBACK: 'mock',
    
    // Enable real-time subscriptions
    ENABLE_REALTIME: process.env.EXPO_PUBLIC_ENABLE_REALTIME === 'true',
  },
  
  // Supabase configuration
  SUPABASE: {
    URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Development settings
  DEVELOPMENT: {
    // Show data source in UI
    SHOW_DATA_SOURCE: process.env.NODE_ENV === 'development',
    
    // Simulate network delays
    SIMULATE_DELAYS: process.env.EXPO_PUBLIC_SIMULATE_DELAYS === 'true',
    
    // Enable debug logging
    DEBUG_LOGS: process.env.NODE_ENV === 'development',
  }
};

// ========================================
// DATA SOURCE DETECTION
// ========================================

export const isUsingMockData = () => CONFIG.DATA_SOURCE.PRIMARY === 'mock';
export const isUsingSupabase = () => CONFIG.DATA_SOURCE.PRIMARY === 'supabase';
export const shouldFallbackToMock = () => CONFIG.DATA_SOURCE.FALLBACK === 'mock';

// ========================================
// LOGGING UTILITIES
// ========================================

export const logDataSource = (operation: string, source: string) => {
  if (CONFIG.DEVELOPMENT.DEBUG_LOGS) {
    console.log(`[${source.toUpperCase()}] ${operation}`);
  }
};

// ========================================
// EXPORTS
// ========================================

export default CONFIG;

