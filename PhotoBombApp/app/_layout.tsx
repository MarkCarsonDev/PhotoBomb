import { Stack } from "expo-router";
import { NavigationContainer } from '@react-navigation/native';
import { Pressable, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs, Link } from 'expo-router';




export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name = "index" />
      <Stack.Screen name = "settings" />
      </Stack>
  );
}
