import React from 'react';
import { useRouter } from 'expo-router';
import NotificationSettings from '@/sharedComponent/NotificationSettings';

export const options = { headerShown: false };

export default function NotificationSettingsPage() {
  const router = useRouter();
  const navigation = {
    navigate: (screenName: string) => router.push(screenName as any),
    goBack: () => router.back(),
  };
  return <NotificationSettings navigation={navigation} />;
} 