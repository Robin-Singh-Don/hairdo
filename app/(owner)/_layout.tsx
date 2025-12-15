import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import OwnerBottomBar from './components/OwnerBottomBar';
// import { OwnerRoute } from '../../components/ProtectedRoute';

export default function OwnerLayout() {
  return (
    // <OwnerRoute>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
        <Stack.Screen name="OwnerDashboard" />
        <Stack.Screen name="OwnerAppointments" />
        <Stack.Screen name="StaffManagement" />
        <Stack.Screen name="AddStaff" />
        <Stack.Screen name="StaffSchedule" />
        <Stack.Screen name="DailySchedule" />
        <Stack.Screen name="TimeOffRequest" />
        <Stack.Screen name="StaffManagementSettings" />
        <Stack.Screen name="NotificationSettings" />
        <Stack.Screen name="GeneralSettings" />
        <Stack.Screen name="BusinessAnalytics" />
        <Stack.Screen name="RevenueOverview" />
        <Stack.Screen name="MarketingAnalysis" />
        <Stack.Screen name="CustomersListPage" />
        <Stack.Screen name="CustomerReviewsPage" />
        <Stack.Screen name="OwnerNotifications" />
        <Stack.Screen name="OwnerProfileNew" />
        <Stack.Screen name="OwnerProfileEdit" />
        <Stack.Screen name="OwnerSettings" />
        <Stack.Screen name="SecuritySettings" />
        <Stack.Screen name="PasswordSettings" />
        <Stack.Screen name="BusinessInformationDetails" />
        <Stack.Screen name="BusinessHours" />
        <Stack.Screen name="PaymentMethodsPage" />
        </Stack>
        <OwnerBottomBar />
      </View>
    // </OwnerRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
