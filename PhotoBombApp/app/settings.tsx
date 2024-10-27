// app/settings.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, ScrollView, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/components/AuthContext';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Header } from 'react-native-elements';
import { Link, useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Settings() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            console.log('No such document for UID:', user.uid);
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Sign Out', 'You have been signed out successfully.');
    } catch (error) {
      Alert.alert('Error', 'An error occurred while signing out.');
    }
    router.replace('/');
  };

  const handleAddMonkey = async () => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);

    try {
      // Fetch the document first to check if monkeyCounter exists
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userDocData = userDocSnap.data();
        if (userDocData && userDocData.monkeyCounter !== undefined) {
          // Increment monkeyCounter if it exists
          await updateDoc(userDocRef, {
            monkeyCounter: increment(1),
          });
        } else {
          // Initialize monkeyCounter if it does not exist
          await updateDoc(userDocRef, {
            monkeyCounter: 1,
          });
        }
      } else {
        // Create the document with monkeyCounter if the document doesn't exist
        await setDoc(userDocRef, { monkeyCounter: 1 }, { merge: true });
      }

      // Fetch the updated document data to display
      const updatedDocSnap = await getDoc(userDocRef);
      setUserData(updatedDocSnap.data());
      Alert.alert('Success', 'Monkey added successfully!');
    } catch (error) {
      console.error('Error updating monkeyCounter:', error);
      Alert.alert('Error', 'An error occurred while adding a monkey.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        centerComponent={{ text: 'Settings', style: { color: '#000' } }}
        leftComponent={
          <Link href="/Library">
            <AntDesign name="back" size={24} color="#000" />
          </Link>
        }
        backgroundColor="#fff"
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Settings</Text>
        {loading ? (
          <Text>Loading user data...</Text>
        ) : (
          <View style={styles.userDataContainer}>
            <Text style={styles.jsonText}>
              {JSON.stringify(userData, null, 2)}
            </Text>
          </View>
        )}
        <Button title="Add a Monkey" onPress={handleAddMonkey} color="#4CAF50" />
        <Button title="Sign Out" onPress={handleSignOut} color="#d9534f" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userDataContainer: {
    marginBottom: 20,
  },
  jsonText: {
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
});
