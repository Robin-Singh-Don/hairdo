// Store Hours Configuration
// This should eventually come from an API or database

export interface StoreHours {
  [key: string]: {
    open: string; // Format: "09:00" (24-hour)
    close: string; // Format: "20:00" (24-hour)
  };
}

export interface StoreInfo {
  name: string;
  hours: StoreHours;
}

// Default store hours - this should be fetched from API or context
export const getStoreInfo = (): StoreInfo => {
  return {
    name: "Man's Cave Salon",
    hours: {
      monday: { open: '09:00', close: '20:00' },
      tuesday: { open: '09:00', close: '20:00' },
      wednesday: { open: '09:00', close: '20:00' },
      thursday: { open: '09:00', close: '20:00' },
      friday: { open: '09:00', close: '21:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '10:00', close: '18:00' },
    }
  };
};

// Convert time string "09:00" to decimal hour (e.g., 9.0)
export const timeStringToDecimalHour = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
};

// Get store hours for a specific day
export const getStoreHoursForDay = (dayIndex: number): { open: number; close: number } | null => {
  const storeInfo = getStoreInfo();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayKey = dayNames[dayIndex];
  
  const dayHours = storeInfo.hours[dayKey];
  if (!dayHours || !dayHours.open || !dayHours.close) {
    return null;
  }
  
  return {
    open: timeStringToDecimalHour(dayHours.open),
    close: timeStringToDecimalHour(dayHours.close)
  };
};

// Get the earliest open hour and latest close hour across all days
// This is useful for determining the overall timeline range
export const getTimelineRange = (): { earliestOpen: number; latestClose: number } => {
  const storeInfo = getStoreInfo();
  let earliestOpen = 24;
  let latestClose = 0;
  
  Object.values(storeInfo.hours).forEach(dayHours => {
    if (dayHours && dayHours.open && dayHours.close) {
      const openHour = timeStringToDecimalHour(dayHours.open);
      const closeHour = timeStringToDecimalHour(dayHours.close);
      if (openHour < earliestOpen) earliestOpen = openHour;
      if (closeHour > latestClose) latestClose = closeHour;
    }
  });
  
  // Default to 6 AM - 10 PM if no hours found
  if (earliestOpen === 24) earliestOpen = 6;
  if (latestClose === 0) latestClose = 22;
  
  return { earliestOpen, latestClose };
};

