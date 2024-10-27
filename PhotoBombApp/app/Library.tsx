// app/Library.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, StatusBar } from 'react-native';
import { Header } from 'react-native-elements';
import { Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker'; // Import expo-image-picker
import AddPlusButton from '@/components/AddPlusButton';
import AddCameraButton from '@/components/AddCameraButton';

export default function Library() {
  const [image, setImage] = useState<string | null>(null);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Permission to access photos is required!");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        setImage(pickerResult.assets[0].uri || null);
      }
    } catch (error) {
      console.warn("Error picking image:", error);
    }
  };

  // Function to capture an image using the camera
  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Permission to access the camera is required!");
        return;
      }

      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
        setImage(cameraResult.assets[0].uri || null);
      }
    } catch (error) {
      console.warn("Error opening camera:", error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Header
        centerComponent={{ text: 'Library', style: styles.title }}
        rightComponent={
          <Link push href="/settings">
            <AntDesign name="user" size={24} color="#000" />
          </Link>
        }
        backgroundColor="#fff"
      />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.librarycontent}>
            {image ? (
              <Image source={{ uri: image }} style={styles.photo} />
            ) : (
              <Image source={require('../assets/images/1.jpg')} style={styles.photo} />
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <AddPlusButton style={styles.customButton} onAddPress={pickImage} />
        <AddCameraButton style={styles.customButton} onPress={openCamera} />
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
    fontSize: 30,
    fontWeight: 'bold',
  },
  container: {
    flex: 7,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#D3D3D3',
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
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  customButton: {
    backgroundColor: '#FF7E70',
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
});