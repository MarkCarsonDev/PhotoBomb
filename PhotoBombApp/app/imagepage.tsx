import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, StatusBar, ActivityIndicator, Alert, Share } from "react-native";
import { Header } from 'react-native-elements';
import { Link, useLocalSearchParams } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AddTrashButton from "@/components/AddTrashButton";
import AddDownloadButton from "@/components/AddDownloadButton";
import AddShareButton from "@/components/AddShareButton";

export default function ImagePage(): JSX.Element {
  const { photoId } = useLocalSearchParams();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImageUri = async () => {
      if (photoId) {
        try {
          console.log("Fetching photo with ID:", photoId);
          const docRef = doc(db, 'photos', photoId as string);
          const docSnapshot = await getDoc(docRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            if (data.filepath) {
              setImageUri(data.filepath);
              console.log("Image URI found:", data.filepath);
            } else {
              console.warn("No filepath found in document.");
            }
          } else {
            console.warn("No document found with this ID.");
          }
        } catch (error) {
          console.error("Error fetching photo data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchImageUri();
  }, [photoId]);

  // Delete the image from Firebase Firestore and Firebase Storage
  const onTrashPress = async () => {
    if (!photoId) return;
    try {
      await deleteDoc(doc(db, 'photos', photoId as string));
      Alert.alert("Deleted", "The image has been deleted successfully.");
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Error", "An error occurred while deleting the image.");
    }
  };

  // Download the image to device storage
  const onDownloadPress = async () => {
    if (!imageUri) return;

    try {
      const downloadUri = FileSystem.documentDirectory + `photo_${photoId}.jpg`;
      await FileSystem.downloadAsync(imageUri, downloadUri);
      const asset = await MediaLibrary.createAssetAsync(downloadUri);
      await MediaLibrary.createAlbumAsync("Downloads", asset, false);
      Alert.alert("Downloaded", "The image has been downloaded successfully.");
    } catch (error) {
      console.error("Error downloading image:", error);
      Alert.alert("Error", "An error occurred while downloading the image.");
    }
  };

  // Share the image using the device's share dialog
  const onSharePress = async () => {
    if (!imageUri) return;

    try {
      await Share.share({
        url: imageUri,
        message: "Check out this photo!",
      });
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "An error occurred while sharing the image.");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Header
        centerComponent={{ text: 'View Photo', style: styles.title }}
        leftComponent={
          <Link push href="/Library">
            <AntDesign name="arrowleft" size={24} color="#000" />
          </Link>
        }
        backgroundColor="#fff"
      />
      
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF7E70" />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.errorText}>⚠ Error: Image not found.</Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <AddTrashButton style={styles.button} onTrashPress={onTrashPress} />
        <AddShareButton style={styles.button} onSharePress={onSharePress} />
        <AddDownloadButton style={styles.button} onDownloadPress={onDownloadPress} />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  buttonContainer: {
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