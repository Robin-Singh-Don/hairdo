import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="appointment" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="inbox" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="schedule" />
    </Stack>
  );
}
