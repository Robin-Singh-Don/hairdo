import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { SelectedServicesProvider } from './(customer)/appointment';
import { RewardsProvider } from '../sharedComponent/RewardsContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppointmentProvider } from '../contexts/AppointmentContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { supabaseClient } from '../services/supabase/SupabaseConfig';
import { getConfig } from '../config/AppConfig';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const config = getConfig();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>
      <AuthProvider>
        <RewardsProvider>
          <AppointmentProvider>
            <ProfileProvider serviceType={config.profileService} supabaseClient={supabaseClient}>
              <SelectedServicesProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(customer)" options={{ headerShown: false }} />
              <Stack.Screen name="(employee)" options={{ headerShown: false }} />
              <Stack.Screen name="(owner)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="ProfilePage11" options={{ headerShown: false }} />
              <Stack.Screen name="EditProfileScreen" options={{ headerShown: false }} />
              <Stack.Screen name="SettingsScreen" options={{ headerShown: false }} />
              <Stack.Screen name="PrivacySettings" options={{ headerShown: false }} />
              <Stack.Screen name="LoyaltyRewards" options={{ headerShown: false }} />
              <Stack.Screen name="PaymentSubscription" options={{ headerShown: false }} />
              <Stack.Screen name="LanguageRegional" options={{ headerShown: false }} />
              <Stack.Screen name="SecuritySettings" options={{ headerShown: false }} />
              <Stack.Screen name="HelpSupport" options={{ headerShown: false }} />
              <Stack.Screen name="TermsAndPolicies" options={{ headerShown: false }} />
              <Stack.Screen name="AboutUs" options={{ headerShown: false }} />
              <Stack.Screen name="NotificationSettings" options={{ headerShown: false }} />
              <Stack.Screen name="location-search" options={{ headerShown: false }} />
              <Stack.Screen name="SalonDetailsScreen" options={{ headerShown: false }} />
              <Stack.Screen name="BarberProfileScreen" options={{ headerShown: false }} />
              <Stack.Screen name="search" options={{ headerShown: false }} />
              <Stack.Screen name="salons-list" options={{ headerShown: false }} />
              <Stack.Screen name="book-directly" options={{ headerShown: false }} />
              <Stack.Screen name="all-barbers" options={{ headerShown: false }} />
              <Stack.Screen name="all-slots" options={{ headerShown: false }} />
              <Stack.Screen name="booking-confirmation" options={{ headerShown: false }} />
              <Stack.Screen name="Login" options={{ headerShown: false }} />
              <Stack.Screen name="ClientInformationScreen" options={{ headerShown: false }} />
              <Stack.Screen name="BusinessAppointmentHistory" options={{ headerShown: false }} />
              <Stack.Screen name="BarberSchedule" options={{ headerShown: false }} />
              <Stack.Screen name="LogoutConfirmation" options={{ headerShown: false }} />
              <Stack.Screen name="LogoutConfirmationSimple" options={{ headerShown: false }} />
              <Stack.Screen name="TestSettingsSimple" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
              </SelectedServicesProvider>
            </ProfileProvider>
          </AppointmentProvider>
        </RewardsProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
