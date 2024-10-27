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
import AddTrashButton from "@/components/AddTrashButton";
import AddDownloadButton from "@/components/AddDownloadButton";
import AddShareButton from "@/components/AddShareButton";


export default function ImagePage(): JSX.Element {
    return (
        <View style={styles.mainContainer}>
            <Header
                centerComponent={{ text: 'View Photo', style: styles.title }}
                leftComponent={
                    <Link push href="/Library">
                    <AntDesign name="user" size={24} color="#000" />
                </Link>
                }
                backgroundColor="#fff"
                />
            <View style={styles.container}>
                <Image/>
            </View>
            <View style={styles.buttonContainer}>
                <AddTrashButton style={styles.button} />
                <AddShareButton style={styles.button} />
                <AddDownloadButton style={styles.button} />
            </View>
        </View>
    )};


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