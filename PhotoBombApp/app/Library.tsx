// app/Library.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, StatusBar, Alert } from 'react-native';
import { Header } from 'react-native-elements';
import { Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from './services/PhotoService';
import { useAuth } from '../components/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AddPlusButton from '@/components/AddPlusButton';
import AddCameraButton from '@/components/AddCameraButton';

export default function Library() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);

  // Load user's photos from Firestore
  useEffect(() => {
    const loadPhotos = async () => {
      if (user) {
        try {
          const userPhotos: string[] = [];
          const q = query(collection(db, 'photos'), where('author_uid', '==', user.uid));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.filepath) {
              userPhotos.push(data.filepath);
            }
          });
          setPhotos(userPhotos);
        } catch (error) {
          console.error("Error fetching user photos:", error);
        }
      }
    };
    loadPhotos();
  }, [user]);

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
        const uri = pickerResult.assets[0].uri;
        if (uri && user) {
          const response = await fetch(uri);
          const blob = await response.blob();
          await uploadPhoto(user.uid, blob, false);
          setPhotos((prev) => [...prev, uri]); // Update state to show new photo
        }
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
        const uri = cameraResult.assets[0].uri;
        if (uri && user) {
          const response = await fetch(uri);
          const blob = await response.blob();
          await uploadPhoto(user.uid, blob, false);
          setPhotos((prev) => [...prev, uri]);
        }
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
            {photos.map((photoUri, index) => (
              <Image key={index} source={{ uri: photoUri }} style={styles.photo} />
            ))}
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