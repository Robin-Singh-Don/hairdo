// Customer language and regional preferences with AsyncStorage and Supabase support
// Persists language/regional settings across app sessions

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
const KEY = 'customer.language.preferences';

export interface CustomerLanguagePreferences {
  currentLanguage: string;
  currentRegion: string;
  currentCurrency: string;
  currentDateFormat: string;
  currentTimeFormat: string;
  deviceTimezone: string;
  languageSettings: {
    autoDetectLanguage: boolean;
    showLanguageIndicator: boolean;
    translateReviews: boolean;
    translateNotifications: boolean;
  };
  regionalSettings: {
    showLocalTime: boolean;
    showLocalCurrency: boolean;
    showLocalSalons: boolean;
    useMetricSystem: boolean;
    useDeviceTimezone: boolean;
  };
}

const DEFAULT_PREFERENCES: CustomerLanguagePreferences = {
  currentLanguage: 'English',
  currentRegion: 'Canada',
  currentCurrency: 'CAD',
  currentDateFormat: 'MM/DD/YYYY',
  currentTimeFormat: '12-hour',
  deviceTimezone: '',
  languageSettings: {
    autoDetectLanguage: true,
    showLanguageIndicator: true,
    translateReviews: false,
    translateNotifications: true,
  },
  regionalSettings: {
    showLocalTime: true,
    showLocalCurrency: true,
    showLocalSalons: true,
    useMetricSystem: false,
    useDeviceTimezone: true,
  },
};

export async function getLanguagePreferences(): Promise<CustomerLanguagePreferences> {
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
  if (!raw) {
    // Auto-detect timezone if not set
    const prefs = { ...DEFAULT_PREFERENCES };
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      prefs.deviceTimezone = timezone;
    } catch {
      prefs.deviceTimezone = 'Unknown';
    }
    return prefs;
  }
  
  try {
    const parsed = JSON.parse(raw) as Partial<CustomerLanguagePreferences>;
    const merged = { ...DEFAULT_PREFERENCES, ...parsed };
    // Ensure nested objects are merged correctly
    if (parsed.languageSettings) {
      merged.languageSettings = { ...DEFAULT_PREFERENCES.languageSettings, ...parsed.languageSettings };
    }
    if (parsed.regionalSettings) {
      merged.regionalSettings = { ...DEFAULT_PREFERENCES.regionalSettings, ...parsed.regionalSettings };
    }
    return merged;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function setLanguagePreferences(
  prefs: Partial<CustomerLanguagePreferences>
): Promise<CustomerLanguagePreferences> {
  // Get current preferences
  const current = await getLanguagePreferences();
  const updated = { ...current, ...prefs };
  
  // Merge nested objects if provided
  if (prefs.languageSettings) {
    updated.languageSettings = { ...current.languageSettings, ...prefs.languageSettings };
  }
  if (prefs.regionalSettings) {
    updated.regionalSettings = { ...current.regionalSettings, ...prefs.regionalSettings };
  }

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

