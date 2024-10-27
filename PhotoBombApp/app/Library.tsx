// app/Library.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, StatusBar, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Header } from 'react-native-elements';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from './services/PhotoService';
import { useAuth } from '../components/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import IconButton from '@/components/IconButton'; // Import the new IconButton component
import { AntDesign, Feather } from '@expo/vector-icons';


type PhotoItem = { uri: string; key: string };

export default function Library() {
  const { user } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadQueue = useRef<(() => Promise<void>)[]>([]);
  const isProcessingQueue = useRef(false);

  // Fetch photos from Firestore
  const fetchPhotos = async () => {
    if (user) {
      try {
        console.log("Fetching photos for user:", user.uid);
        const userPhotos: PhotoItem[] = [];
        const q = query(collection(db, 'photos'), where('author_uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.filepath) {
            userPhotos.push({ uri: data.filepath, key: doc.id });
            console.log("Photo found:", data.filepath);
          }
        });
        setPhotos(userPhotos);
        console.log("Photos successfully loaded:", userPhotos.length);
      } catch (error) {
        console.error("Error fetching user photos:", error);
      }
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [user]);

  // Process the upload queue sequentially
  const processQueue = async () => {
    if (isProcessingQueue.current || uploadQueue.current.length === 0) return;
    isProcessingQueue.current = true;

    while (uploadQueue.current.length > 0) {
      const nextUpload = uploadQueue.current.shift();
      if (nextUpload) {
        try {
          await nextUpload();
          console.log("Upload completed successfully.");
        } catch (error) {
          console.error("Error during queue processing:", error);
        }
      }
    }

    isProcessingQueue.current = false;
  };

  // Handle image upload and add it to the queue
  const handleImageUpload = (uri: string) => {
    uploadQueue.current.push(async () => {
      if (!user) return;

      try {
        setIsUploading(true);
        console.log("Starting image upload for URI:", uri);

        const response = await fetch(uri);
        const blob = await response.blob();
        
        console.log("Uploading blob to Firebase.");
        await uploadPhoto(user.uid, blob, false);

        console.log("Image uploaded. Refreshing photo list.");
        await fetchPhotos();
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    });

    processQueue(); // Start processing the queue if not already
  };

  // Pick images from the library
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
        pickerResult.assets.forEach((asset) => {
          if (asset.uri) handleImageUpload(asset.uri);
        });
      }
    } catch (error) {
      console.warn("Error picking images:", error);
    }
  };

  // Capture image with camera
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
        cameraResult.assets.forEach((asset) => {
          if (asset.uri) handleImageUpload(asset.uri);
        });
      }
    } catch (error) {
      console.warn("Error opening camera:", error);
    }
  };

  // Navigate to ImagePage with the photo key (document ID)
  const handleImagePress = (photoKey: string) => {
    router.push({
      pathname: '/imagepage',
      params: { photoId: photoKey },
    });
  };

  return (
    <View style={styles.mainContainer}>
      <Header
        centerComponent={{ text: 'Library', style: styles.title }}
        rightComponent={
          <Link push href="/settings">
            <Feather name="user" size={42} color="#2c2c2c" />
          </Link>
        }
        backgroundColor="#fff"
      />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.librarycontent}>
            {photos.map((photo) => (
              <TouchableOpacity key={photo.key} onPress={() => handleImagePress(photo.key)}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
              </TouchableOpacity>
            ))}
            {isUploading && <ActivityIndicator size="large" color="#FF7E70" />}
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <IconButton icon="file-plus" size={32} color="#fff" onPress={pickImages} wide={true} widthAmount={60} />
        <IconButton icon="camera" size={32} color="#fff" onPress={openCamera} />
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
    flex: 1,
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
  },
});
