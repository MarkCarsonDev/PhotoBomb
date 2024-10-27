import { SafeAreaView, Text, View, ScrollView, } from "react-native";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Image, Platform } from 'react-native';
import { Header } from 'react-native-elements';
import { Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function Settings() {
    return (
      <View>
        <Header
          centerComponent={{ text: 'Settings', style: { color: '#000' } }}
          leftComponent= {
            <Link href="/">
              <AntDesign name="back" size={24} color="#000" />
            </Link>
          }
          backgroundColor="#fff"
        />
        <ScrollView>
          <Text>Settings</Text>
        </ScrollView>
      </View>
    );
  }