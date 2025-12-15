// Lightweight store for per-service metadata not covered by employeeAPI
// Uses AsyncStorage if available; falls back to in-memory store
type ServiceMeta = {
  description?: string;
  mediaUri?: string;
  mediaType?: 'photo' | 'video';
  advanceBookingOverrideEnabled?: boolean;
  advanceBookingDaysOverride?: number | null;
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
        removeItem(key: string): Promise<void>;
      };
    }
  } catch {
    // ignore
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
    },
  };
}

const storage = getStorage();
const KEY_PREFIX = 'service.meta.';

export async function getServiceMeta(serviceId: string): Promise<ServiceMeta | null> {
  const raw = await storage.getItem(KEY_PREFIX + serviceId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServiceMeta;
  } catch {
    return null;
  }
}

export async function setServiceMeta(serviceId: string, meta: ServiceMeta): Promise<void> {
  await storage.setItem(KEY_PREFIX + serviceId, JSON.stringify(meta));
}

export type { ServiceMeta };

export async function deleteServiceMeta(serviceId: string): Promise<void> {
  // remove stored metadata for this service
  // @ts-expect-error removeItem is present in real AsyncStorage and our fallback
  await storage.removeItem(KEY_PREFIX + serviceId);
}


