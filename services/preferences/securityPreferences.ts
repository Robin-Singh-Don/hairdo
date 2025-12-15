// Customer security preferences with AsyncStorage and Supabase support
// Persists security settings across app sessions

let memoryStore: Record<string, string> = {};

function getStorage() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage && AsyncStorage.getItem) {
      return AsyncStorage as {
        getItem(key: string): Promise<string | null>;
        setItem(key: string, value: string): Promise<void>;
      };
    }
  } catch {
    // Fallback to memoryStore
  }
  return {
    async getItem(key: string) {
      return memoryStore[key] ?? null;
    },
    async setItem(key: string, value: string) {
      memoryStore[key] = value;
    }
  };
}

const storage = getStorage();
const KEY = 'customer.security.preferences';

export interface CustomerSecurityPreferences {
  biometricLogin: boolean;
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  sessionManagement: boolean;
  cameraAccess: boolean;
  locationAccess: boolean;
  contactsAccess: boolean;
  backupEmail?: string;
  phoneNumber?: string;
}

const DEFAULT_PREFERENCES: CustomerSecurityPreferences = {
  biometricLogin: true,
  twoFactorAuth: false,
  loginNotifications: true,
  suspiciousActivityAlerts: true,
  sessionManagement: true,
  cameraAccess: true,
  locationAccess: true,
  contactsAccess: false,
  backupEmail: '',
  phoneNumber: '',
};

export async function getSecurityPreferences(): Promise<CustomerSecurityPreferences> {
  try {
    // Try Supabase first if available
    const { supabaseClient } = await import('../supabase/SupabaseConfig');
    
    if (supabaseClient && false) { // Disabled for now, needs proper user context
      // Supabase query would go here
    }
  } catch (error) {
    // Supabase not available, use AsyncStorage
  }

  // Fallback to AsyncStorage
  const raw = await storage.getItem(KEY);
  if (!raw) return DEFAULT_PREFERENCES;
  
  try {
    const parsed = JSON.parse(raw) as Partial<CustomerSecurityPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function setSecurityPreferences(
  prefs: Partial<CustomerSecurityPreferences>
): Promise<CustomerSecurityPreferences> {
  // Get current preferences
  const current = await getSecurityPreferences();
  const updated = { ...current, ...prefs };

  try {
    // Try Supabase first if available
    const { supabaseClient } = await import('../supabase/SupabaseConfig');
    
    if (supabaseClient && false) { // Disabled for now, needs proper user context
      // Supabase update would go here
    }
  } catch (error) {
    // Supabase not available, use AsyncStorage
  }

  // Fallback to AsyncStorage
  await storage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

