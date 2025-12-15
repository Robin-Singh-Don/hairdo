// Lightweight persisted booking preferences with AsyncStorage fallback
// Values: maxAdvanceDays (default 30), cancellationHours (default 24), depositPercentage (default 20)

let memoryStore: Record<string, string> = {};

function getStorage() {
  try {
    // Lazy require to avoid bundling issues if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage && AsyncStorage.getItem) {
      return AsyncStorage as {
        getItem(key: string): Promise<string | null>;
        setItem(key: string, value: string): Promise<void>;
      };
    }
  } catch (_) {
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

const KEYS = {
  MABD: 'booking.maxAdvanceDays',
  CNW: 'booking.cancellationHours',
  DP: 'booking.depositPercentage',
  REM_MINUTES: 'reminder.minutesBefore',
  WL_MAX: 'waitlist.maxSize',
};

export async function getMaxAdvanceDays(): Promise<number> {
  const raw = await storage.getItem(KEYS.MABD);
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : 30;
}

export async function setMaxAdvanceDays(days: number): Promise<void> {
  await storage.setItem(KEYS.MABD, String(days));
}

export async function getCancellationHours(): Promise<number> {
  const raw = await storage.getItem(KEYS.CNW);
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : 24;
}

export async function setCancellationHours(hours: number): Promise<void> {
  await storage.setItem(KEYS.CNW, String(hours));
}

export async function getDepositPercentage(): Promise<number> {
  const raw = await storage.getItem(KEYS.DP);
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : 20;
}

export async function setDepositPercentage(percent: number): Promise<void> {
  await storage.setItem(KEYS.DP, String(percent));
}

export async function getReminderMinutesBefore(): Promise<number> {
  const raw = await storage.getItem(KEYS.REM_MINUTES);
  const n = raw ? parseInt(raw, 10) : NaN;
  // Default to 24 hours
  return Number.isFinite(n) ? n : 24 * 60;
}

export async function setReminderMinutesBefore(minutes: number): Promise<void> {
  await storage.setItem(KEYS.REM_MINUTES, String(minutes));
}

export async function getWaitlistMax(): Promise<number> {
  const raw = await storage.getItem(KEYS.WL_MAX);
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : 10;
}

export async function setWaitlistMax(max: number): Promise<void> {
  await storage.setItem(KEYS.WL_MAX, String(max));
}


