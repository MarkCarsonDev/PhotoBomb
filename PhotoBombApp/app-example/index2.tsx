import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert } from "react-native";
import { Header } from 'react-native-elements';
import { Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import Button from 'react-native-elements/dist/buttons/Button';
import AddPlusButton from "../components/AddPlusButton";
import AddCameraButton from "../components/AddCameraButton";
import PhotoItem from "../components/PhotoItem";
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

interface PhotoData {
  url: string;
  // Add other fields as necessary
}

export default function Library(): JSX.Element {
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photosCol = collection(db, 'photos');
        const photoSnapshot = await getDocs(photosCol);
        const photoList = photoSnapshot.docs.map(doc => doc.data() as PhotoData);
        setPhotos(photoList);
      } catch (error) {
        console.error('Error fetching photos:', error);
        Alert.alert('Error', 'Failed to load photos.');
      }
    };

    fetchPhotos();
  }, []);

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
          <Button title="Sort" type="clear" onPress={() => { /* Implement sort functionality */ }} />
        }
        backgroundColor="#fff"
      />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.librarycontent}>
            {photos.map((photo, index) => (
              <PhotoItem key={index} source={{ uri: photo.url }} />
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={{ flex: 3 }}>
        {/* Additional content if needed */}
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
    fontSize: 30,
    fontWeight: 'bold',
  },
  container: {
    flex: 7,
    paddingTop: StatusBar.currentHeight,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  librarycontent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
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
