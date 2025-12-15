import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" />
      <Stack.Screen name="RoleSelection" />
    </Stack>
  );
}
