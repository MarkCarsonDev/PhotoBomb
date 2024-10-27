// app/Library.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
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

type PhotoItem = { uri: string; key: string };

export default function Library() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadQueue = useRef<(() => Promise<void>)[]>([]); // Queue for upload functions
  const isProcessingQueue = useRef(false); // Tracks if queue is processing

  // Fetch photos from Firebase and update state
  const fetchPhotos = async () => {
    if (user) {
      try {
        const userPhotos: PhotoItem[] = [];
        const q = query(collection(db, 'photos'), where('author_uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.filepath) {
            userPhotos.push({ uri: data.filepath, key: doc.id });
          }
        });
        setPhotos(userPhotos);
      } catch (error) {
        console.error("Error fetching user photos:", error);
      }
    }
  };

  useEffect(() => {
    fetchPhotos(); // Initial photo load on component mount
  }, [user]);

  // Sequential processing for the upload queue
  const processQueue = async () => {
    if (isProcessingQueue.current || uploadQueue.current.length === 0) return;
    isProcessingQueue.current = true;

    while (uploadQueue.current.length > 0) {
      const nextUpload = uploadQueue.current.shift();
      if (nextUpload) await nextUpload();
    }

    isProcessingQueue.current = false;
  };

  // Add an image to the upload queue
  const handleImageUpload = async (uri: string) => {
    uploadQueue.current.push(async () => {
      if (!user) return;

      try {
        setIsUploading(true);
        const response = await fetch(uri);
        const blob = await response.blob();

        // Upload photo to Firebase and wait for completion
        await uploadPhoto(user.uid, blob, false);
        
        // Refresh the photo list to include the newly uploaded image
        await fetchPhotos();
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    });

    processQueue(); // Trigger the queue to process the uploads
  };

  // Open image picker and queue selected images for upload
  const pickImages = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Permission to access photos is required!");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!pickerResult.canceled && pickerResult.assets) {
        for (const asset of pickerResult.assets) {
          if (asset.uri) handleImageUpload(asset.uri);
        }
      }
    } catch (error) {
      console.warn("Error picking images:", error);
    }
  };

  // Open camera, capture images, and queue for upload
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

      if (!cameraResult.canceled && cameraResult.assets) {
        for (const asset of cameraResult.assets) {
          if (asset.uri) handleImageUpload(asset.uri);
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
            {photos.map((photo) => (
              <Image key={photo.key} source={{ uri: photo.uri }} style={styles.photo} />
            ))}
            {isUploading && <ActivityIndicator size="large" color="#FF7E70" />}
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <AddPlusButton style={styles.customButton} onAddPress={pickImages} />
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