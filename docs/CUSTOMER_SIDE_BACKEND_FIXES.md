# Customer-Side Backend Integration - Implementation Plan

## Overview
This document outlines the changes needed to connect customer-side pages to a proper backend architecture, making it ready for Supabase integration.

## Architecture Pattern
We're using the same repository pattern as the owner side:
- **Repository Layer**: `services/repository/appointments.ts` (already has pattern)
- **API Layer**: `services/api/customerAPI.ts` (needs updates)
- **UI Layer**: Customer pages (need updates)

## Changes Required

### 1. ✅ Appointments Repository
- ✅ Added `listByCustomer(customerId)` method to interface
- ✅ Implemented in TempDB repository
- ✅ Added to Supabase placeholder

### 2. Customer API Updates (In Progress)

#### `createBooking()` - Save Real Appointments
- Currently: Creates mock BookingDisplay object
- **Should**: Save to appointments repository using `getAppointmentsRepository().create()`
- Map BookingCreationRequest to AppointmentEntity format
- Return BookingDisplay from created AppointmentEntity

#### `getCustomerBookings()` - Load Real Appointments  
- Currently: Returns mock data from AppMockData.customer.upcomingBookings
- **Should**: Load from appointments repository using `getAppointmentsRepository().listByCustomer(customerId)`
- Transform AppointmentEntity[] to BookingSummary[]
- Apply filters (status, dateRange, etc.)

#### `updateBooking()` - Update Real Appointments
- Currently: Returns mock updated booking
- **Should**: Use `getAppointmentsRepository().update()`

#### `cancelBooking()` - Cancel Real Appointments
- Currently: Just logs
- **Should**: Use `getAppointmentsRepository().update()` to set status to 'cancelled'

### 3. Customer Pages Updates

#### `my-bookings.tsx`
- Currently: Uses `customerAPI.getUpcomingBookings()` which returns mock data
- **Should**: Use `customerAPI.getCustomerBookings()` which loads from repository
- Already has good state management for new/cancelled/rescheduled bookings

#### `booking-confirmation.tsx`
- Currently: Creates booking via `customerAPI.createBooking()` but doesn't persist
- **Should**: Ensure `createBooking()` saves to repository
- Already has good UI and navigation flow

#### `PromotionsScreen.tsx`
- Currently: Uses hardcoded `mockPromotions` array
- **Should**: Fetch from `ownerAPI.getActiveMarketingCampaigns()`
- Transform MarketingCampaign[] to promotion card format
- Show only active campaigns within date range

#### `HomeScreen.tsx`
- Already uses `customerAPI.getSalonCards()` - verify it's using real data
- Already uses `customerAPI.getTrendingCards()` and `getPosts()` - these can stay as mock for now (social features)

#### `SalonDetailsScreen.tsx`
- Already loads from API: `customerAPI.getSalonHours()`, `getSalonStaff()`, `getSalonPosts()`
- Verify these are using real data or acceptable mock data

#### `explore.tsx` & `search.tsx`
- Already use customerAPI methods
- Verify they're using appropriate data sources

## Implementation Steps

1. ✅ Update appointments repository to support listByCustomer
2. Update customerAPI.createBooking() to save to repository
3. Update customerAPI.getCustomerBookings() to load from repository  
4. Update customerAPI.updateBooking() and cancelBooking() to use repository
5. Update PromotionsScreen to use ownerAPI marketing campaigns
6. Test booking flow: create → save → load in my-bookings
7. Verify all pages work with repository data

## Benefits
- All customer bookings are saved in one place (repository)
- Easy to swap TempDB with Supabase later
- Consistent architecture with owner side
- Real data flow instead of disconnected mock data

## Notes
- Customer ID is currently hardcoded as 'customer-1' - this should come from auth context when available
- Service names need to be looked up from TempDB when creating appointments
- Employee names need to be looked up from TempDB when creating appointments
- Salon/business names need to be looked up when displaying bookings

