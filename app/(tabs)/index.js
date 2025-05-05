import { Image, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from '@/components/Login';
import ProfileScreen from '@/components/ProfileScreen';
// import RootLayout from '../_layouts/RootLayout';
import SettingsScreen from '@/components/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
      // <RootLayout />
      <Stack.Navigator initialRouteName="Login" >
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: false }}/>
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
