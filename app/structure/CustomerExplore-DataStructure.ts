
// ========================================
// CUSTOMER EXPLORE DATA STRUCTURES
// ========================================
// Data structures for the customer explore page
// Uses shared interfaces from Shared-DataStructure.ts
// ========================================

import { LocationData, NotificationData, Rating } from './Shared-DataStructure';

// 1. HEADER ROW (Location + Notifications)
// Uses shared interfaces: LocationData and NotificationData


// 2. SERVICE CARDS (Featured & Standard Services)

export interface ServiceCard {
    key: string;                    // 'haircut', 'styling', 'beard', 'mustache', etc.
    label: string;                  // Service name
    image?: string;                 // Service image (for big cards)
    icon?: string;                  // Ionicons name (for small cards)
    popular?: boolean;              // Shows "Popular" badge
    isSpecial?: boolean;            // 'more' button
}


// 3. SALON CARDS (Horizontal Scroll)

// 3.1 - Main Salon Card
export interface SalonCard {
    id: string;                     // Unique salon ID
    name: string;                   // Salon name
    barbers: number;                // Number of barbers
    rating: Rating;                 // Standardized rating (0-5 scale)
    posts: number;                  // Number of posts
    image: string;                  // Salon image URL
    services?: SalonService[];      // Services array (for "Book Now" popup) - Optional, loaded when needed
    city?: string;                  // City name (optional, for filtering)
    distance?: string;              // Distance from user (optional, e.g., "0.2 km")
}

// / 3.2 - Salon Service (for "Book Now" popup modal)
export interface SalonService {
    id: string;                     // Service ID
    name: string;                   // Service name (e.g., "Haircut", "Beard Trim")
    price: string;                  // Service price (e.g., "$35")
    duration: string;               // Service duration (e.g., "30 min")
}

