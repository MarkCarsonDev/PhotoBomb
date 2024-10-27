import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../components/AuthContext';
import { uploadPhoto } from './services/PhotoService';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function VerificationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Request camera permissions on component mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Handle taking a photo
  const handleTakePhoto = async () => {
    if (cameraRef && isCameraReady) {
      try {
        const photo = await cameraRef.takePictureAsync({ quality: 0.5, base64: false });
        if (photo && photo.uri) {
          setCapturedPhoto(photo.uri);
        } else {
          throw new Error('No photo captured.');
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'An error occurred while taking the photo.');
      }
    }
  };

  // Handle uploading the photo
  const handleUploadPhoto = async () => {
    if (!user || !capturedPhoto) return;

    setUploading(true);

    try {
      // Manipulate the image (resize and compress)
      const manipResult = await ImageManipulator.manipulateAsync(
        capturedPhoto,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: false }
      );

      // Convert the manipulated image URI to a Blob
      const response = await fetch(manipResult.uri);
      const blob = await response.blob();

      // Upload the photo as a verification photo
      await uploadPhoto(user.uid, blob, true);

      Alert.alert('Success', 'Verification photo uploaded successfully!');
      router.replace('/Library');
    } catch (error) {
      console.error('Error uploading verification photo:', error);
      Alert.alert('Error', 'An error occurred while uploading the photo.');
    } finally {
      setUploading(false);
    }
  };

  // Handle Log Out
  const handleLogOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged Out', 'You have been logged out successfully.');
      router.replace('/LoginSignup');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'An error occurred while logging out.');
    }
  };

  // Render loading indicator while permissions are being fetched
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render permission request UI if permissions are not granted
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera.</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
        <View style={{ marginTop: 20 }}>
          <Button title="Log Out" onPress={handleLogOut} color="#d9534f" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedPhoto ? (
        <CameraView
          style={styles.camera}
          facing='front'
          ref={(ref) => setCameraRef(ref)}
          onCameraReady={() => setIsCameraReady(true)}
        >
          <View style={styles.cameraButtonContainer}>
            <Button title={isCameraReady ? "Take Selfie" : "Camera Uninitialized"} onPress={handleTakePhoto} disabled={!isCameraReady} />
          </View>
        </CameraView>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          <Button
            title={uploading ? 'Uploading...' : 'Upload Selfie'}
            onPress={handleUploadPhoto}
            disabled={uploading}
          />
          <Button title="Retake Selfie" onPress={() => setCapturedPhoto(null)} />
        </View>
      )}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>We're sure you look great.</Text>
        <Text style={styles.instructionsSubtitle}>Take a selfie for us to match which photos are you.</Text>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Log Out" onPress={handleLogOut} color="#d9534f" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 18,
    color: '#ff0000',
    marginBottom: 10,
  },
  camera: {
    flex: 3,
    justifyContent: 'flex-end',
  },
  cameraButtonContainer: {
    backgroundColor: 'white',
    borderRadius: 50,
    opacity: 0.8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  previewContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
    marginBottom: 20,
  },
  instructionsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionsSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
});