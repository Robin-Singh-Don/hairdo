import React from 'react';
import { Redirect } from 'expo-router';

export default function CustomerIndex() {
  // Redirect to explore page as the default customer page
  return <Redirect href="/(customer)/explore" />;
}
