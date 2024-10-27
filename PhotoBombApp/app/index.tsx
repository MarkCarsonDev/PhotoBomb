import React from 'react';
import { Text, View, StyleSheet, Image, Platform, SafeAreaView, ScrollView, StatusBar } from "react-native";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { Button, Header } from 'react-native-elements';
import { Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import AddPlusButton from "@/components/AddPlusButton";
import AddCameraButton from "@/components/AddCameraButton";
import BottomSheet from '@gorhom/bottom-sheet';

export default function Library(): JSX.Element {
  return (
    <View style={styles.mainContainer}>
      
        <Header
        centerComponent={{ text: 'Library', style: styles.title }}
        rightComponent={
          <Link push href="/settings">
            <AntDesign name="user" size={24} color="#000" />
          </Link>
        }
        leftComponent={
          <Button title="Sort" type="clear" />
          //Attach sort icon and the function
        }
        backgroundColor="#fff"
        />
  
      
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.librarycontent}>
            {/* Add images as needed */}
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
          </View>
        </ScrollView>
      </View>
      <View style={{flex: 3}}>
      </View>
      <View style={styles.buttonContainer}>
        <AddPlusButton style={styles.button} />
        <AddCameraButton style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    flex: 1,
    fontSize: 30,
    fontWeight: 'bold',
  },
  container: {
    flex: 7,
    paddingTop: StatusBar.currentHeight,
  },
  scrollViewContent: {
    paddingBottom: '100%', 
  },
  librarycontent: {
    alignSelf: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photo: {
    height: 120,
    width: 120,
    margin: 5,
  },
  buttonContainer: {
    flex: 2,
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  button: {
    marginHorizontal: 10,
  },
});