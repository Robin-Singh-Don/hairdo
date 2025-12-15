import React from 'react';
import { Stack } from 'expo-router';
// import { CustomerRoute } from '../../components/ProtectedRoute';

export default function CustomerLayout() {
  return (
    // <CustomerRoute>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="HomeScreen" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="appointment" />
        <Stack.Screen name="inbox" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="my-bookings" />
        <Stack.Screen name="ProfileScreen" />
        
        {/* Main Navigation Pages */}
        <Stack.Screen name="BookingHistoryScreen" />
        <Stack.Screen name="BookingDetailsScreen" />
        <Stack.Screen name="ActiveBookingDetails" />
        <Stack.Screen name="PromotionsScreen" />
        <Stack.Screen name="location-search" />
        <Stack.Screen name="search" />
        <Stack.Screen name="salons-list" />
        <Stack.Screen name="SalonDetailsScreen" />
        <Stack.Screen name="SalonReviewsPage" />
        <Stack.Screen name="book-directly" />
        <Stack.Screen name="all-barbers" />
        <Stack.Screen name="BarberProfileScreen" />
        <Stack.Screen name="BarberReviewsPage" />
        <Stack.Screen name="all-slots" />
        <Stack.Screen name="booking-confirmation" />
        <Stack.Screen name="ProfilePage11" />
        <Stack.Screen name="EditProfileScreen" />
        <Stack.Screen name="SettingsScreen" />
        
        {/* Settings Pages */}
        <Stack.Screen name="NotificationSettings" />
        <Stack.Screen name="PrivacySettings" />
        <Stack.Screen name="LoyaltyRewards" />
        {/* PaymentSubscription screen removed - subscription features will be introduced later */}
        <Stack.Screen name="LanguageRegional" />
        <Stack.Screen name="SecuritySettings" />
        <Stack.Screen name="HelpSupport" />
        <Stack.Screen name="TermsAndPolicies" />
        <Stack.Screen name="AboutUs" />
      </Stack>
    // </CustomerRoute>
  );
}
