import { Image, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from '@/screens/Login';
import ProfileScreen from '@/screens/ProfileScreen';
// import RootLayout from '../_layouts/RootLayout';
import SettingsScreen from '@/screens/SettingsScreen';
import NotificationSettings from '@/sharedComponent/NotificationSettings';
import AccountSettings from '@/sharedComponent/AccountSettings';
import LoyaltyRewards from '@/sharedComponent/LoyaltyRewards';
import AppearanceAccessibility from '@/sharedComponent/AppearanceAccessibility';
import LanguageRegional from '@/sharedComponent/LanguageRegional';
import HelpSupport from '@/sharedComponent/HelpSupport';
import PrivacySettings from '@/sharedComponent/PrivacySettings';
import PaymentSubscription from '@/sharedComponent/PaymentSubscription';
import SecuritySettings from '@/sharedComponent/SecuritySettings';
import TermsPolicies from '@/sharedComponent/TermsPolicies';


const Stack = createStackNavigator();

export default function App() {
  return (
      // <RootLayout />
      <Stack.Navigator initialRouteName="Login" >
        <Stack.Screen name="Login" component={SettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ headerShown: false }} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ headerShown: false }} />
        <Stack.Screen name="AppearanceAccessibility" component={AppearanceAccessibility} options={{ headerShown: false }} />
        <Stack.Screen name="HelpSupport" component={HelpSupport} options={{ headerShown: false }} />
        <Stack.Screen name="LanguageRegional" component={LanguageRegional} options={{ headerShown: false }} />
        <Stack.Screen name="LoyaltyRewards" component={LoyaltyRewards} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentSubscription" component={PaymentSubscription} options={{ headerShown: false }} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ headerShown: false }} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettings} options={{ headerShown: false }} />
        <Stack.Screen name="TermsPolicies" component={TermsPolicies} options={{ headerShown: false }} />

      </Stack.Navigator>
     );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
