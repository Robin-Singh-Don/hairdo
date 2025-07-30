import React from 'react';
import { useRouter } from 'expo-router';
import SettingsScreen from '@/screens/SettingsScreen';

// Hide the default header
export const options = { headerShown: false };

export default function SettingsScreenPage() {
  const router = useRouter();
  
  // Create a navigation object that matches the expected interface
  const navigation = {
    navigate: (screenName: string) => router.push(screenName as any),
    goBack: () => router.back(),
  };

  return <SettingsScreen navigation={navigation} />;
} 