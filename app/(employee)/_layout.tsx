import React from 'react';
import { Stack } from 'expo-router';
// import { EmployeeRoute } from '../../components/ProtectedRoute';

export default function EmployeeLayout() {
  return (
    // <EmployeeRoute>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
      <Stack.Screen name="AdminHomeScreen" />
      <Stack.Screen name="explore2" />
      <Stack.Screen name="AppointmentsScreen" />
      <Stack.Screen name="notification2" />
      <Stack.Screen name="EmployeeProfileScreen" />
      <Stack.Screen name="EmployeeProfileEdit" />
      <Stack.Screen name="EmployeeSettingsScreen" />
      <Stack.Screen name="EmployeeNotificationSettings" />
      <Stack.Screen name="MyServicesScreen" />
      <Stack.Screen name="ServiceCatalogScreen" />
      <Stack.Screen name="EmployeePrivacyAndSecurity" />
      <Stack.Screen name="BookingPreferences" />
      <Stack.Screen name="AppointmentReminders" />
      <Stack.Screen name="ContactUs" />
      <Stack.Screen name="LogoutConfirmation" />
            <Stack.Screen name="AddClientScreen" />
            <Stack.Screen name="ClientHistoryScreen" />
            <Stack.Screen name="IndividualClientHistoryScreen" />
            <Stack.Screen name="ScheduleScreen" />
            <Stack.Screen name="AvailabilitySettingsScreen" />
            <Stack.Screen name="TimeOffRequestScreen" />
            <Stack.Screen name="chat" />
      </Stack>
    // </EmployeeRoute>
  );
}
