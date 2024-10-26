import { Text, View } from "react-native";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Image, Platform } from 'react-native';

export default function Index() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
   
        <Text>Welcome!</Text>

      </View>
    );
  }