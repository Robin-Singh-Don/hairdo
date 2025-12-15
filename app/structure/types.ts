// Central types used across the app to prepare for backend integration

export type ServiceEntity = {
  id: string;
  name: string;
  // UI-friendly fields (kept for backward compatibility in screens)
  price?: string; // e.g. "$35"
  duration?: string; // e.g. "30 min"
  // Normalized numeric fields (use these going forward)
  priceNumber?: number; // e.g. 35
  durationMinutes?: number; // e.g. 30
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
  mabdOverrideDays?: number | null;
  category?: string;
  description?: string;
};

export type BookingPreferencesEntity = {
  maxAdvanceDays: number;
  cancellationHours: number;
  depositPercentage: number; // 0..100
  reminderMinutes: number; // minutes
  waitlistMax: number;
};

export type AppointmentSnapshot = {
  dpUsedPercent: number; // deposit percentage used for this booking
  cnwUsedHours: number; // cancellation window used for this booking
  depositAmount: number; // calculated from service total
  cancelByTimestamp: string; // ISO
  bookedAtTimestamp: string; // ISO
};


