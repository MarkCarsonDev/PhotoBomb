import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, StatusBar } from 'react-native';
import { Button, Header } from 'react-native-elements';
import { Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import AddPlusButton from '@/components/AddPlusButton';
import AddCameraButton from '@/components/AddCameraButton';

export default function Library() {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 1,
      };

      const response = await new Promise((resolve, reject) => {
        launchImageLibrary(options, (pickerResult) => {
          if (pickerResult.didCancel) {
            reject(new Error("User cancelled image picker"));
          } else if (pickerResult.errorCode) {
            reject(new Error(`Image Picker Error: ${pickerResult.errorMessage}`));
          } else if (pickerResult.assets && pickerResult.assets.length > 0) {
            resolve(pickerResult.assets[0]);
          } else {
            reject(new Error("Unexpected result from image picker"));
          }
        });
      });

      const pickedImage = response as Asset;
      setImage(pickedImage.uri || null);
    } catch (error) {
      console.warn("Error picking image:");
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
        leftComponent={<Button title="sort"/>}
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
        <Button
          onPress={pickImage}
          buttonStyle={styles.customButton}
          icon={<AddPlusButton />}
          type="solid"
        />
        <Button
          buttonStyle={styles.customButton}
          icon={<AddCameraButton />}
          type="solid"
        />
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
    backgroundColor: 'D3D3D3',
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
    backgroundColor: 'transparent',
    padding: 10,
  },
});