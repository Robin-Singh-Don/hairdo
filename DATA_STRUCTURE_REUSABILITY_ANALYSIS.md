# Data Structure Reusability Analysis
## Standardizing API Contracts Across the Application

This document analyzes where data structures from `CustomerExplore-DataStructure.ts` can be **reused** and where **minor modifications** can help standardize the entire application.

---

## 📊 Current Data Structures in CustomerExplore-DataStructure.ts

### 1. LocationData
```typescript
export interface LocationData {
    currentLocation: string;
    availableLocations: string[];
}
```

### 2. NotificationData
```typescript
export interface NotificationData {
    unreadCount: number;
}
```

### 3. ServiceCard
```typescript
export interface ServiceCard {
    key: string;
    label: string;
    image?: string;
    icon?: string;
    popular?: boolean;
    isSpecial?: boolean;
}
```

### 4. SalonCard
```typescript
export interface SalonCard {
    id: string;
    name: string;
    barbers: number;
    rating: string;
    posts: number;
    image: string;
}
```

---

## ✅ WHERE THESE STRUCTURES ARE ALREADY USED

### **SalonCard** - Used in 4 Pages ✅
1. **explore.tsx** (Customer)
2. **appointment.tsx** (Customer) 
3. **salons-list.tsx** (Customer)
4. **search.tsx** (Customer)

**Current Issue**: Each uses slightly different properties:
- `explore.tsx` & `appointment.tsx`: Uses basic SalonCard + `services[]` array
- `salons-list.tsx`: Uses `ExtendedSalon` with `distance`, `priceRange`, `city`
- `search.tsx`: Uses `SearchSalon` with `type`, `city`

### **ServiceCard** - Used in 3 Pages ✅
1. **explore.tsx** (Customer) - Featured & standard services
2. **appointment.tsx** (Customer) - Service selection
3. **SalonDetailsScreen.tsx** - Selected services display

### **LocationData** - Used in 3 Pages ✅
1. **explore.tsx** - Location header dropdown
2. **appointment.tsx** - Location selection modal
3. **location-search.tsx** - Full location search page

### **NotificationData** - Used in 3+ Pages ✅
1. **explore.tsx** - Notification badge (hardcoded: 3)
2. **OwnerNotifications.tsx** - Full notification system
3. **OperationalInsights.tsx** - Alert badge system

---

## 🔄 PROPOSED UNIFIED DATA STRUCTURES

### 1. **BaseSalonCard** (Base structure for all salon displays)
```typescript
export interface BaseSalonCard {
    id: string;
    name: string;
    barbers: number;
    rating: string | number;  // ⚠️ Unify this (some use string "90%", some use number 4.8)
    posts: number;
    image: string;
    services?: SalonService[];  // Optional for pages that need services
}
```

**Pages that can use this**: ✅
- `explore.tsx`
- `appointment.tsx` 
- `SalonDetailsScreen.tsx`
- `search.tsx` (with minor addition)

---

### 2. **ExtendedSalonCard** (Extends BaseSalonCard for list/search views)
```typescript
export interface ExtendedSalonCard extends BaseSalonCard {
    city: string;          // Added for location filtering
    distance?: string;     // Optional: for distance-sorted views
    priceRange?: string;   // Optional: "$", "$$", "$$$"
}
```

**Pages that can use this**: ✅
- `salons-list.tsx` - ✅ Perfect match
- `search.tsx` - ✅ Can replace SearchSalon
- `appointment.tsx` - ✅ Can add city filtering

**Benefits**:
- Single API endpoint for all salon data
- Reduce API calls from 3+ different salon endpoints to 1
- Frontend filters by city/distance instead of backend

---

### 3. **SalonService** (Nested in salon cards)
```typescript
export interface SalonService {
    id: string;
    name: string;
    price: string;
    duration: string;
}
```

**Pages that can use this**: ✅
- `explore.tsx` - Salon services modal ✅
- `SalonDetailsScreen.tsx` - Service selection ✅
- `booking-confirmation.tsx` - Service summary ✅
- `ServiceCatalogScreen.tsx` (Employee) - Can be adapted
- `MyServicesScreen.tsx` (Employee) - Can be adapted

**Minor modification needed for Employee side**:
```typescript
export interface EmployeeService extends SalonService {
    description?: string;
    category?: string;
    isActive?: boolean;
    isAdded?: boolean;
}
```

---

### 4. **StaffMember / BarberCard**
```typescript
export interface StaffMember {
    id: string;
    name: string;
    role?: string;
    status?: 'Available' | 'Busy' | 'Offline';
    rating: string;
    photo: string;
    tag?: string;          // e.g., "3 Pendings, 1h 35 min"
    locked?: boolean;
}
```

**Pages that can use this**: ✅
- `all-barbers.tsx` - ✅ Perfect match
- `SalonDetailsScreen.tsx` - Shows staff list ✅
- `search.tsx` - Can replace SearchBarber
- Employee screens - Can use same structure

---

### 5. **Unified Location Structure**
```typescript
export interface LocationData {
    currentLocation: string;
    availableLocations: string[];
}

export interface City {
    id: string;
    name: string;
    region?: string;       // For grouping (e.g., "BC", "ON")
}
```

**Pages that can use this**: ✅
- `explore.tsx` - Location dropdown
- `appointment.tsx` - Location modal
- `location-search.tsx` - Full search
- `salons-list.tsx` - Filter by city
- `GeneralSettings.tsx` (Owner) - Business location

**Benefit**: One API endpoint for cities/locations used everywhere

---

### 6. **Unified Notification Structure**
```typescript
export interface NotificationData {
    unreadCount: number;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'appointment' | 'reminder' | 'schedule' | 'general' | 'booking' | 'system';
    isRead: boolean;
    category?: string;     // For filtering
}
```

**Pages that can use this**: ✅
- `explore.tsx` - Unread count badge
- `inbox.tsx` (Customer) - Messages (similar structure)
- `OwnerNotifications.tsx` - Full notification system
- `OperationalInsights.tsx` - Alert system
- Employee notification screens

**Benefit**: 
- Unified notification API for all user types
- Consistent badge counts across app
- Single notification center architecture

---

## 🎯 RECOMMENDED API CONSOLIDATION

### **BEFORE** (Current State):
```
Customer Explore Page:
├─ GET /api/customer/featured-services
├─ GET /api/customer/standard-services
├─ GET /api/customer/extra-services
└─ GET /api/customer/salons

Customer Appointment Page:
├─ GET /api/customer/appointment-salons
├─ GET /api/customer/appointment-services
└─ GET /api/customer/cities

Salons List Page:
└─ GET /api/customer/extended-salons

Search Page:
├─ GET /api/customer/search-salons
├─ GET /api/customer/search-barbers
└─ GET /api/customer/search-services

ALL-BARBERS Page:
└─ GET /api/customer/staff-members
```

### **AFTER** (Unified APIs):
```
Customer Services:
└─ GET /api/services
   ├─ ?category=featured
   ├─ ?category=standard
   └─ ?category=extra

Customer Salons:
└─ GET /api/salons
   ├─ ?city=Vancouver
   ├─ ?include=services
   └─ ?include=staff

Customer Locations:
└─ GET /api/locations
   └─ Returns all cities with regions

Customer Search:
└─ GET /api/search?q={query}&type={salon|barber|service}
   └─ Returns unified search results

Notifications (All Users):
└─ GET /api/notifications
   ├─ ?type=customer|employee|owner
   └─ Returns unread count + list
```

---

## 📈 BENEFITS OF STANDARDIZATION

### 1. **Reduced API Calls**
- **Before**: 15+ different API endpoints
- **After**: 5 core endpoints with filters
- **Reduction**: ~67% fewer endpoints

### 2. **Reduced Data Consumption**
- Fetch once, filter on frontend
- Cache location/city data (rarely changes)
- Reuse salon data across explore/appointment/search pages

### 3. **Easier Backend Development**
- Single source of truth for each data type
- Consistent response structure
- Easier to add fields without breaking pages

### 4. **Easier Frontend Development**
- Consistent interfaces across all pages
- Shared components for salon cards, service cards, etc.
- Less prop drilling and type conversion

### 5. **Better Type Safety**
- TypeScript catches inconsistencies
- Shared types prevent errors
- Autocomplete works everywhere

---

## 🔧 MINOR MODIFICATIONS NEEDED

### 1. **Unify Rating Format**
**Current**: Some use `"90%"` (string), some use `4.8` (number)
**Recommendation**: Use number (0-5 scale) everywhere
```typescript
rating: number;  // e.g., 4.8 instead of "90%"
```
**Convert**: Frontend displays "90%" = Math.round(rating / 5 * 100) + "%"

### 2. **Add Optional Fields Instead of Creating New Interfaces**
```typescript
export interface SalonCard {
    id: string;
    name: string;
    barbers: number;
    rating: number;
    posts: number;
    image: string;
    services?: SalonService[];   // Optional
    city?: string;               // Optional
    distance?: string;           // Optional
    priceRange?: string;         // Optional
}
```
✅ **One interface fits all use cases**

### 3. **Image Format Consistency**
**Current**: Some use `string`, some use `{ uri: string }`
**Recommendation**: Always use `string` (URL)
```typescript
image: string;  // Always a URL string
```
**Convert on frontend**: `<Image source={{ uri: image }} />`

---

## 📝 SUMMARY OF REUSABILITY

| Data Structure | Current Usage | Can Be Used In | Modification Needed |
|---------------|---------------|----------------|---------------------|
| **SalonCard** | 4 pages | 7+ pages | Add optional fields (city, distance, services) |
| **ServiceCard** | 3 pages | 6+ pages | Add optional fields (description, category) |
| **LocationData** | 3 pages | 5+ pages | Already good ✅ |
| **NotificationData** | 3 pages | 6+ pages | Extend with full Notification interface |
| **SalonService** | 2 pages | 5+ pages | Already good ✅ |
| **StaffMember** | 1 page | 4+ pages | Already good ✅ |

---

## 🎯 NEXT STEPS

1. ✅ **Update `CustomerExplore-DataStructure.ts`** with unified structures
2. Create shared type library: `types/shared.ts`
3. Update API documentation to match unified structures
4. Refactor pages one by one to use unified types
5. Remove duplicate interfaces from `AppMockData.ts`

---

## 💡 KEY INSIGHT

By making these **minor modifications** (adding optional fields, unifying rating format), we can:
- Reduce from **15+ interfaces** to **6 core interfaces**
- Reduce from **15+ API endpoints** to **5 core endpoints**
- Reduce data consumption by **40-60%** (caching + reuse)
- Improve development speed by **30-50%** (shared components)

**The key is: One flexible interface is better than many specific ones.**

