import React from 'react';
import { useRouter } from 'expo-router';
import SettingsScreen from '../../screens/SettingsScreen';

// Hide the default header
export const options = { headerShown: false };

export default function SettingsScreenPage() {
  const router = useRouter();
  
          // Create a navigation object that matches the expected interface
        const navigation = {
          navigate: (screenName: string) => {
            console.log('Navigation called with screenName:', screenName);
            if (screenName === 'Login') {
              console.log('Navigating to Login screen using router.replace');
              // Use replace for logout to prevent going back to settings
              router.replace('/Login');
            } else if (screenName === 'LogoutConfirmation') {
              console.log('Navigating to LogoutConfirmation page');
              try {
                router.push('/LogoutConfirmation');
                console.log('Router.push completed successfully');
              } catch (error) {
                console.error('Router.push error:', error);
              }
            } else {
              console.log('Navigating to other screen:', screenName);
              router.push(`/(customer)/${screenName}` as any);
            }
          },
          goBack: () => router.back(),
        };

  return <SettingsScreen navigation={navigation} />;
} 