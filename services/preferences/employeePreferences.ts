// Employee preferences (privacy and security) with AsyncStorage fallback

type PrivacyPrefs = {
  allowProfileDiscovery: boolean;
  showOnlineStatus: boolean;
  shareWorkGalleryPublicly: boolean;
  showReviewsOnProfile: boolean;
  allowMessagesFromNonClients: boolean;
  // Profile Visibility controls
  showProfileToClients: boolean;
  showContactInfo: boolean;
  showSocialMedia: boolean;
  // Data & Privacy controls
  dataCollection: boolean;
  analytics: boolean;
  dataRetention: boolean;
  locationTracking: boolean;
};

type SecurityPrefs = {
  twoFactorAuthEnabled: boolean;
  loginAlertsEmail: boolean;
  loginAlertsPush: boolean;
};

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
  } catch {}
  return {
    async getItem(key: string) {
      return memoryStore[key] ?? null;
    },
    async setItem(key: string, value: string) {
      memoryStore[key] = value;
    },
  };
}

const storage = getStorage();

const KEYS = {
  PRIVACY: 'employee.privacy.prefs',
  SECURITY: 'employee.security.prefs',
};

const DEFAULT_PRIVACY: PrivacyPrefs = {
  allowProfileDiscovery: true,
  showOnlineStatus: true,
  shareWorkGalleryPublicly: true,
  showReviewsOnProfile: true,
  allowMessagesFromNonClients: false,
  showProfileToClients: true,
  showContactInfo: false,
  showSocialMedia: true,
  dataCollection: true,
  analytics: true,
  dataRetention: true,
  locationTracking: false,
};

const DEFAULT_SECURITY: SecurityPrefs = {
  twoFactorAuthEnabled: false,
  loginAlertsEmail: true,
  loginAlertsPush: true,
};

export async function getPrivacyPrefs(): Promise<PrivacyPrefs> {
  const raw = await storage.getItem(KEYS.PRIVACY);
  if (!raw) return DEFAULT_PRIVACY;
  try {
    return { ...DEFAULT_PRIVACY, ...(JSON.parse(raw) as PrivacyPrefs) };
  } catch {
    return DEFAULT_PRIVACY;
  }
}

export async function setPrivacyPrefs(prefs: Partial<PrivacyPrefs>): Promise<PrivacyPrefs> {
  const current = await getPrivacyPrefs();
  const next = { ...current, ...prefs };
  await storage.setItem(KEYS.PRIVACY, JSON.stringify(next));
  return next;
}

export async function getSecurityPrefs(): Promise<SecurityPrefs> {
  const raw = await storage.getItem(KEYS.SECURITY);
  if (!raw) return DEFAULT_SECURITY;
  try {
    return { ...DEFAULT_SECURITY, ...(JSON.parse(raw) as SecurityPrefs) };
  } catch {
    return DEFAULT_SECURITY;
  }
}

export async function setSecurityPrefs(prefs: Partial<SecurityPrefs>): Promise<SecurityPrefs> {
  const current = await getSecurityPrefs();
  const next = { ...current, ...prefs };
  await storage.setItem(KEYS.SECURITY, JSON.stringify(next));
  return next;
}

export type { PrivacyPrefs, SecurityPrefs };


