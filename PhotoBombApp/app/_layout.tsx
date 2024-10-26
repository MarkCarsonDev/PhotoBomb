import { Stack } from "expo-router";
import { NavigationContainer } from '@react-navigation/native';
import { Pressable, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs, Link } from 'expo-router';




export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="index" 
        options={{ 
          href: null,
          headerTitle: "My Library", 
          headerRight: () => (
            <View>
              <Link href="/settings"> <AntDesign name="user" size={24} color="black" /> </Link>
            </View>
          ),
          }}/>
      <Tabs.Screen 
        name="settings" 
        options={{ 
          headerTitle: "Settings",
          href: null, 

          }}/>
    </Tabs>
  );
}
