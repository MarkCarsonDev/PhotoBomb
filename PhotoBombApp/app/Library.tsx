// app/Library.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, StatusBar, Alert, ActivityIndicator, TouchableOpacity, Animated, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Header } from 'react-native-elements';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from './services/PhotoService';
import { useAuth } from '../components/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import IconButton from '@/components/IconButton';
import { Feather } from '@expo/vector-icons';

type PhotoItem = { uri: string; key: string };

export default function Library() {
  const { user } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [predictedPhotos, setPredictedPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const uploadQueue = useRef<(() => Promise<void>)[]>([]);
  const isProcessingQueue = useRef(false);
  const panelAnimation = useRef(new Animated.Value(0)).current;

  // Fetch photos from Firestore
  const fetchPhotos = async () => {
    if (user) {
      try {
        const userPhotos: PhotoItem[] = [];
        const q = query(collection(db, 'photos'), where('author_uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.file_path) {
            userPhotos.push({ uri: data.file_path, key: doc.id });
            console.log("Photo found:", data.file_path);
          }
        });
        setPhotos(userPhotos);
      } catch (error) {
        console.error("Error fetching user photos:", error);
      }
    }
  };

// Fetch predicted photos from Firestore
const fetchPredictedPhotos = async () => {
    try {
      if (user) {
        const predicted: PhotoItem[] = [];
        // Accessing the nested collection 'predicted_photos' within 'user_photos/{user.uid}'
        const predictedPhotosRef = collection(db, `user_photos/${user.uid}/predicted_photos`);
        const querySnapshot = await getDocs(predictedPhotosRef);
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.filepath) {
            predicted.push({ uri: data.filepath, key: doc.id });
          }
        });
        
        setPredictedPhotos(predicted);
      }
    } catch (error) {
      console.error("Error fetching predicted photos:", error);
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchPredictedPhotos();
  }, [user]);

  // Toggle for floating panel
  const togglePanel = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(panelAnimation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const panelWidth = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Adjust width as needed
  });

  // Upload handling and queue management
  const handleImageUpload = (uri: string) => {
    uploadQueue.current.push(async () => {
      if (!user) return;

      try {
        setIsUploading(true);
        const response = await fetch(uri);
        const blob = await response.blob();
        await uploadPhoto(user.uid, blob, false);
        await fetchPhotos();
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    });
    processQueue();
  };

  const processQueue = async () => {
    if (isProcessingQueue.current || uploadQueue.current.length === 0) return;
    isProcessingQueue.current = true;
    while (uploadQueue.current.length > 0) {
      const nextUpload = uploadQueue.current.shift();
      if (nextUpload) await nextUpload();
    }
    isProcessingQueue.current = false;
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

      {/* Bottom Upload and Camera Buttons */}
      <View style={styles.buttonContainer}>
        <IconButton icon="file-plus" size={32} color="#fff" onPress={pickImages} wide={true} widthAmount={60} />
        <IconButton icon="camera" size={32} color="#fff" onPress={openCamera} />
      </View>

      {/* Blur Background when Expanded */}
      {isExpanded && (
        <BlurView intensity={50} style={StyleSheet.absoluteFill} />
      )}

      {/* Floating Panel with 1xN Grid for Predicted Photos */}
      <View style={styles.panelContainer}>
        <TouchableOpacity style={styles.mainButton} onPress={togglePanel}>
          <Feather name="menu" size={24} color="#fff" />
        </TouchableOpacity>

        <Animated.View style={[styles.panel, { width: panelWidth }]}>
          <View style={styles.panelContent}>
            <TouchableOpacity onPress={togglePanel} style={styles.closeButton}>
              <Feather name="x" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.panelText}>Predicted Photos</Text>
          </View>

          {/* Single Column Scrollable Grid for Predicted Photos */}
          <ScrollView contentContainerStyle={styles.predictedPhotoContainer}>
            {predictedPhotos.map((photo) => (
              <Image key={photo.key} source={{ uri: photo.uri }} style={styles.predictedPhoto} />
            ))}
          </ScrollView>
        </Animated.View>

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
      panelContainer: {
        position: 'absolute',
        top: '50%',
        right: 20,
        alignItems: 'center',
      },
      mainButton: {
        backgroundColor: '#FF7E70',
        borderRadius: 30,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
      },
      panel: {
        position: 'absolute',
        right: 60,
        backgroundColor: '#333',
        borderRadius: 10,
        overflow: 'hidden',
        //paddingBottom: 10,
        height: 200,
      },
      panelContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
      },
      panelText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 10,
      },
      closeButton: {
        backgroundColor: '#555',
        borderRadius: 15,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
      },
      buttonContainer: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 20,
      },
      predictedPhotoContainer: {
        flexDirection: 'column',
        paddingVertical: 10,
        alignItems: 'center',
      },
      predictedPhoto: {
        height: 60,
        width: 60,
        marginVertical: 5,
        borderRadius: 5,
      },
});