// Customer privacy preferences with AsyncStorage and Supabase support
// Persists privacy settings across app sessions

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
const KEY = 'customer.privacy.preferences';

export interface CustomerPrivacyPreferences {
  profileVisibility: boolean;
  showLocation: boolean;
  allowDataSharing: boolean;
  allowAnalytics: boolean;
  allowMarketing: boolean;
  allowNotifications: boolean;
  allowLocationServices: boolean;
  allowCameraAccess: boolean;
  allowPhotoSharing: boolean;
  allowReviewSharing: boolean;
  allowBookingHistory: boolean;
  allowPersonalization: boolean;
}

const DEFAULT_PREFERENCES: CustomerPrivacyPreferences = {
  profileVisibility: true,
  showLocation: true,
  allowDataSharing: false,
  allowAnalytics: true,
  allowMarketing: false,
  allowNotifications: true,
  allowLocationServices: true,
  allowCameraAccess: true,
  allowPhotoSharing: false,
  allowReviewSharing: true,
  allowBookingHistory: true,
  allowPersonalization: true,
};

export async function getPrivacyPreferences(): Promise<CustomerPrivacyPreferences> {
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
    const parsed = JSON.parse(raw) as Partial<CustomerPrivacyPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function setPrivacyPreferences(
  prefs: Partial<CustomerPrivacyPreferences>
): Promise<CustomerPrivacyPreferences> {
  // Get current preferences
  const current = await getPrivacyPreferences();
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

