// Employee availability notification preferences with AsyncStorage and Supabase support
// Persists availability notification settings across app sessions

let memoryStore: Record<string, string> = {};

function getStorage() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage && AsyncStorage.getItem) {
      return AsyncStorage as {
        getItem(key: string): Promise<string | null>;
        setItem(key: string, value: string): Promise<void>;
        removeItem(key: string): Promise<void>;
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
    },
    async removeItem(key: string) {
      delete memoryStore[key];
    }
  };
}

const storage = getStorage();

export interface NotificationSettings {
  sms: boolean;
  email: boolean;
  push: boolean;
}

export interface AvailabilityNotificationSettings {
  shiftReminders: NotificationSettings & { reminderHours: number };
  shiftSwaps: NotificationSettings;
  shiftReleases: NotificationSettings;
  scheduleChanges: NotificationSettings;
}

const STORAGE_KEY = '@availability_notification_settings';

const DEFAULT_SETTINGS: AvailabilityNotificationSettings = {
  shiftReminders: {
    sms: false,
    email: false,
    push: false,
    reminderHours: 24,
  },
  shiftSwaps: {
    sms: false,
    email: false,
    push: true,
  },
  shiftReleases: {
    sms: false,
    email: false,
    push: false,
  },
  scheduleChanges: {
    sms: false,
    email: false,
    push: false,
  },
};

/**
 * Get availability notification preferences from storage
 */
export async function getAvailabilityPreferences(): Promise<AvailabilityNotificationSettings> {
  try {
    const jsonValue = await storage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      // Merge with defaults to ensure all fields exist
      return {
        shiftReminders: {
          ...DEFAULT_SETTINGS.shiftReminders,
          ...parsed.shiftReminders,
        },
        shiftSwaps: {
          ...DEFAULT_SETTINGS.shiftSwaps,
          ...parsed.shiftSwaps,
        },
        shiftReleases: {
          ...DEFAULT_SETTINGS.shiftReleases,
          ...parsed.shiftReleases,
        },
        scheduleChanges: {
          ...DEFAULT_SETTINGS.scheduleChanges,
          ...parsed.scheduleChanges,
        },
      };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading availability preferences:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save availability notification preferences to storage
 */
export async function setAvailabilityPreferences(
  settings: AvailabilityNotificationSettings
): Promise<void> {
  try {
    const jsonValue = JSON.stringify(settings);
    await storage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving availability preferences:', error);
    throw error;
  }
}

/**
 * Clear availability notification preferences (for logout, etc.)
 */
export async function clearAvailabilityPreferences(): Promise<void> {
  try {
    await storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing availability preferences:', error);
  }
}

