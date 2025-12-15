// Customer notification preferences with AsyncStorage and Supabase support
// Persists notification settings across app sessions

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

const KEY = 'customer.notification.preferences';

export interface CustomerNotificationPreferences {
  pauseAll: boolean;
  posts: boolean;
  messages: boolean;
  email: boolean;
  appointmentReminders: boolean;
  waitlist: boolean;
}

const DEFAULT_PREFERENCES: CustomerNotificationPreferences = {
  pauseAll: false,
  posts: false,
  messages: true,
  email: false,
  appointmentReminders: false,
  waitlist: false,
};

export async function getNotificationPreferences(): Promise<CustomerNotificationPreferences> {
  try {
    // Try Supabase first if available
    const { supabaseClient } = await import('../supabase/SupabaseConfig');
    const { useAuth } = await import('../../contexts/AuthContext');
    
    // Note: In a real implementation, we'd need to get the user from context
    // For now, we'll use AsyncStorage as fallback
    if (supabaseClient && false) { // Disabled for now, needs proper user context
      // Supabase query would go here
      // const { data, error } = await supabaseClient
      //   .from('notification_preferences')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single();
      // if (!error && data) {
      //   return data.preferences as CustomerNotificationPreferences;
      // }
    }
  } catch (error) {
    // Supabase not available, use AsyncStorage
  }

  // Fallback to AsyncStorage
  const raw = await storage.getItem(KEY);
  if (!raw) return DEFAULT_PREFERENCES;
  
  try {
    const parsed = JSON.parse(raw) as Partial<CustomerNotificationPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function setNotificationPreferences(
  prefs: Partial<CustomerNotificationPreferences>
): Promise<CustomerNotificationPreferences> {
  // Get current preferences
  const current = await getNotificationPreferences();
  const updated = { ...current, ...prefs };

  try {
    // Try Supabase first if available
    const { supabaseClient } = await import('../supabase/SupabaseConfig');
    
    if (supabaseClient && false) { // Disabled for now, needs proper user context
      // Supabase update would go here
      // const { error } = await supabaseClient
      //   .from('notification_preferences')
      //   .upsert({
      //     user_id: userId,
      //     preferences: updated,
      //     updated_at: new Date().toISOString(),
      //   }, {
      //     onConflict: 'user_id'
      //   });
      // if (!error) {
      //   return updated;
      // }
    }
  } catch (error) {
    // Supabase not available, use AsyncStorage
  }

  // Fallback to AsyncStorage
  await storage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

