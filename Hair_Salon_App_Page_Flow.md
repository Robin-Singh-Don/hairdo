# 🏗️ Hair Salon App - Complete Page Flow & Connections

## 📱 **Main Navigation Structure**

```
┌─────────────────────────────────────────────────────────────┐
│                    BOTTOM NAVIGATION BAR                    │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│    Home     │ Appointment │My Bookings │     Profile       │
│             │             │             │                   │
│  🏠         │  📅         │  📋         │  👤               │
└─────────────┴─────────────┴─────────────┴───────────────────┘
```

## 🚀 **Page Flow & Connections**

### **1. HOME SCREEN (Entry Point)**
```
🏠 HOME SCREEN
├── Quick Actions
│   ├── "Quick Book" → 📅 APPOINTMENT PAGE
│   └── "View Bookings" → 📋 MY BOOKINGS PAGE
├── Featured Content
│   ├── Promotions → 🎯 PROMOTIONS SCREEN
│   └── Salons → 🏢 SALONS LIST
└── Navigation
    ├── Top Right Bell → 📬 INBOX PAGE
    └── Profile Picture → 👤 PROFILE PAGE
```

### **2. APPOINTMENT FLOW (Main User Journey)**
```
📅 APPOINTMENT PAGE
├── Service Selection
│   ├── Service Capsules → Selected Services Context
│   └── Service Modal → Service Management
├── City/Area Filter
│   └── Location-based Salon Filtering
├── Filter Options
│   ├── Distance, Rating, Price, Availability
│   └── Salon Sorting & Filtering
├── Featured Salons
│   └── Salon Cards → 🏢 SALON DETAILS SCREEN
└── Service Context
    └── Passes selected services to next screens
```

```
🏢 SALON DETAILS SCREEN
├── Selected Services Display (next to Caesar icon)
├── Barber Selection
│   └── Barber Cards → 👨‍💼 BARBER PROFILE SCREEN
├── Date Selection
│   └── Calendar Picker → 📅 ALL SLOTS PAGE
├── Time Selection
│   └── Time Slots → 📅 ALL SLOTS PAGE
└── Service Context
    └── Maintains selected services data
```

```
👨‍💼 BARBER PROFILE SCREEN
├── Barber Information
├── Ratings & Reviews
├── Service Context
│   └── Selected services maintained
└── Navigation
    └── Continue → 📅 ALL SLOTS PAGE
```

```
📅 ALL SLOTS PAGE
├── Date Picker
│   └── Calendar interface
├── Time Grid
│   └── Available time slots
├── Service Context
│   └── Selected services maintained
└── Navigation
    └── Confirm → ✅ BOOKING CONFIRMATION
```

```
✅ BOOKING CONFIRMATION
├── Receipt Display
│   └── Traditional receipt layout
├── Service Summary
│   └── All selected services with prices
├── Edit Features
│   ├── Time Editing → Time picker modal
│   ├── Date Editing → Date picker modal
│   └── Service Editing → Service management
├── Payment Selection
│   └── Payment method options
└── Final Confirmation
    └── Complete booking process
```

### **3. MY BOOKINGS FLOW**
```
📋 MY BOOKINGS PAGE
├── Tab Navigation
│   ├── Upcoming Tab
│   │   ├── Active Bookings
│   │   ├── Reschedule Button → Reschedule Modal
│   │   ├── Cancel Button → Cancel Confirmation Modal
│   │   └── View Details → Receipt Modal
│   └── History Tab
│       ├── Past Bookings
│       ├── Book Again → 🔄 REBOOK MODAL
│       ├── View Details → Receipt Modal
│       └── View Media → 🖼️ MEDIA GALLERY
└── Modals
    ├── Reschedule Modal
    │   ├── Calendar picker
    │   └── Time slot picker
    ├── Cancel Modal
    │   └── Custom confirmation dialog
    ├── Receipt Modal
    │   └── Booking details receipt
    ├── Rebook Modal
    │   ├── Quick edit interface
    │   └── Confirm → ✅ BOOKING CONFIRMATION
    └── Media Gallery
        ├── Photo viewing
        ├── Video viewing
        └── Horizontal scrolling
```

### **4. INBOX & NOTIFICATIONS FLOW**
```
📬 INBOX PAGE
├── Header (Collapsible)
│   ├── Back Button → Previous Screen
│   ├── User ID Display
│   └── Floating Back Button (when header hidden)
├── Sticky Tabs
│   ├── Notifications Tab
│   │   └── Notification Cards
│   └── Messages Tab
│       ├── Search Bar
│       └── Message Cards
└── Navigation
    └── Back to previous screen
```

### **5. PROFILE & SETTINGS FLOW**
```
👤 PROFILE PAGE
├── User Information
├── Settings Navigation
│   ├── Language & Regional → 🌍 LANGUAGE & REGIONAL
│   ├── Security Settings → 🔒 SECURITY SETTINGS
│   ├── Help & Support → ❓ HELP & SUPPORT
│   ├── Loyalty Rewards → 🎁 LOYALTY REWARDS
│   └── Other Settings
└── Navigation
    └── Back to previous screen
```

```
🌍 LANGUAGE & REGIONAL
├── Language Selection
│   └── Language toggles with explanations
├── Regional Settings
│   └── Location preferences
└── Navigation
    └── Back to Profile
```

```
🔒 SECURITY SETTINGS
├── Account Security
│   ├── Change Password → Password Change Modal
│   ├── Two-Factor Auth → 2FA Setup Modal
│   └── Biometric Login (with explanation)
├── Account Recovery
│   ├── Backup Email → Email Modal
│   └── Phone Verification → Phone Modal
├── Security Score
│   └── Progress bar visualization
├── Security Activity
│   └── Activity log display
└── Navigation
    └── Back to Profile
```

```
❓ HELP & SUPPORT
├── Support Categories
├── Contact Methods
└── Navigation
    └── Back to Profile
```

```
🎁 LOYALTY REWARDS
├── Points Display
├── Rewards Catalog
├── Points History
└── Navigation
    └── Back to Profile
```

### **6. EXPLORE & DISCOVERY FLOW**
```
🔍 EXPLORE PAGE
├── Header
│   ├── Notifications Button → 📬 INBOX PAGE
│   └── Profile Picture → 👤 PROFILE PAGE
├── Content Discovery
│   └── Explore content display
└── Navigation
    └── Various content links
```

```
🏢 SALONS LIST
├── Salon Directory
├── Filtering Options
├── Sorting Options
└── Navigation
    ├── Salon Cards → 🏢 SALON DETAILS SCREEN
    └── Back to previous screen
```

```
🎯 PROMOTIONS SCREEN
├── Promotion Cards
├── Promotion Details
└── Navigation
    └── Back to previous screen
```

## 🔄 **Data Flow & Context Management**

### **Service Context Flow**
```
📅 APPOINTMENT PAGE
    ↓ (selectedServices)
🏢 SALON DETAILS SCREEN
    ↓ (selectedServicesJson)
👨‍💼 BARBER PROFILE SCREEN
    ↓ (selectedServicesJson)
📅 ALL SLOTS PAGE
    ↓ (selectedServicesJson)
✅ BOOKING CONFIRMATION
    ↓ (selectedServices)
📋 MY BOOKINGS PAGE
    ↓ (service data)
🔄 REBOOK MODAL
    ↓ (service data)
✅ BOOKING CONFIRMATION (rebook)
```

### **User Context Flow**
```
👤 PROFILE PAGE
    ↓ (user data)
🌍 LANGUAGE & REGIONAL
🔒 SECURITY SETTINGS
❓ HELP & SUPPORT
🎁 LOYALTY REWARDS
    ↓ (user preferences)
All other pages
```

### **Navigation Context Flow**
```
🏠 HOME SCREEN
    ↓ (navigation context)
📅 APPOINTMENT PAGE
    ↓ (service context)
🏢 SALON DETAILS SCREEN
    ↓ (salon + service context)
👨‍💼 BARBER PROFILE SCREEN
    ↓ (barber + service context)
📅 ALL SLOTS PAGE
    ↓ (time + service context)
✅ BOOKING CONFIRMATION
    ↓ (complete booking context)
📋 MY BOOKINGS PAGE
    ↓ (booking management context)
```

## 📊 **Page Connection Matrix**

| From Page | To Page | Connection Type | Data Passed |
|-----------|---------|----------------|-------------|
| Home Screen | Appointment Page | Direct Navigation | None |
| Home Screen | My Bookings Page | Direct Navigation | None |
| Home Screen | Inbox Page | Bell Icon | None |
| Home Screen | Profile Page | Profile Picture | None |
| Appointment Page | Salon Details Screen | Salon Card | selectedServicesJson |
| Salon Details Screen | Barber Profile Screen | Barber Card | selectedServicesJson |
| Salon Details Screen | All Slots Page | Continue Button | selectedServicesJson |
| Barber Profile Screen | All Slots Page | Continue Button | selectedServicesJson |
| All Slots Page | Booking Confirmation | Confirm Button | selectedServicesJson |
| My Bookings Page | Booking Confirmation | Book Again | Previous booking data |
| Profile Page | Language & Regional | Settings Menu | None |
| Profile Page | Security Settings | Settings Menu | None |
| Profile Page | Help & Support | Settings Menu | None |
| Profile Page | Loyalty Rewards | Settings Menu | None |

## 🎯 **Key User Journeys**

### **Primary Journey: New Booking**
```
Home → Appointment → Salon Details → Barber Profile → All Slots → Booking Confirmation
```

### **Secondary Journey: Rebooking**
```
My Bookings (History) → Book Again → Rebook Modal → Booking Confirmation
```

### **Settings Journey: Profile Management**
```
Profile → Specific Setting → Setting Details → Back to Profile
```

### **Support Journey: Help Access**
```
Profile → Help & Support → Support Options → Contact Methods
```

## 🔧 **Technical Implementation Notes**

- **Context Management**: Uses React Context API for selectedServices and rewards
- **Navigation**: Expo Router with parameter passing
- **Data Persistence**: Service selection maintained across navigation
- **Modal System**: Custom modals for better UX than native alerts
- **Responsive Design**: Mobile-first approach with horizontal scrolling
- **Animation**: Smooth transitions and collapsible headers
- **State Management**: Local state + Context API for cross-page data

This flow diagram shows the complete structure of your hair salon application and how all pages connect to create a seamless user experience!

