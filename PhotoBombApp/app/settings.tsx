// app/settings.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, ScrollView, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/components/AuthContext';
import { db, auth } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, increment, deleteDoc, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Header } from 'react-native-elements';
import { Link, useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Settings() {
  const { user } = useAuth();
  const [authoredPhotos, setAuthoredPhotos] = useState<any[]>([]);
  const [userPhotos, setUserPhotos] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
        if (user) {
            try {
                // Fetch authored photos
                const authoredRef = collection(db, 'photos');
                const authoredQ = query(authoredRef, where('author_uid', '==', user.uid));
                const authoredSnap = await getDocs(authoredQ);
                const authored: any[] = authoredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAuthoredPhotos(authored);
                console.log(`Authored photos fetched: ${authored.length}`);

                // Fetch user_photos data
                const userPhotosDocRef = doc(db, 'user_photos', user.uid);
                const userPhotosDocSnap = await getDoc(userPhotosDocRef);

                if (userPhotosDocSnap.exists()) {
                    // Fetch confirmed photos subcollection
                    const confirmedPhotosSnap = await getDocs(collection(userPhotosDocRef, 'confirmed_photos'));
                    const predictedPhotosSnap = await getDocs(collection(userPhotosDocRef, 'predicted_photos'));

                    const confirmedPhotos: string[] = confirmedPhotosSnap.docs.map(doc => doc.id);
                    const predictedPhotos: string[] = predictedPhotosSnap.docs.map(doc => doc.id);

                    setUserPhotos({
                        confirmed_photos: confirmedPhotos,
                        predicted_photos: predictedPhotos,
                    });

                    console.log(`Confirmed photos fetched: ${confirmedPhotos.length}`);
                    console.log(`Predicted photos fetched: ${predictedPhotos.length}`);
                } else {
                    console.warn('No user_photos document found for the user.');
                    setUserPhotos({
                        confirmed_photos: [],
                        predicted_photos: [],
                    });
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Error', 'An error occurred while fetching user data.');
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
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'An error occurred while signing out.');
    }
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
      if (updatedDocSnap.exists()) {
        Alert.alert('Success', `Monkey counter: ${updatedDocSnap.data().monkeyCounter}`);
      }
    } catch (error) {
      console.error('Error updating monkeyCounter:', error);
      Alert.alert('Error', 'An error occurred while adding a monkey.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        centerComponent={{ text: 'Settings', style: styles.title }}
        leftComponent={
          <Link href="/Library">
            <AntDesign name="back" size={24} color="#000" />
          </Link>
        }
        backgroundColor="#fff"
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.sectionTitle}>Authored Photos</Text>
        {loading ? (
          <Text>Loading authored photos...</Text>
        ) : authoredPhotos.length > 0 ? (
          <Text style={styles.jsonText}>
            {JSON.stringify(authoredPhotos, null, 2)}
          </Text>
        ) : (
          <Text>No authored photos found.</Text>
        )}

        <Text style={styles.sectionTitle}>User Photos</Text>
        {loading ? (
          <Text>Loading user photos...</Text>
        ) : (
          <Text style={styles.jsonText}>
            {JSON.stringify(userPhotos, null, 2)}
          </Text>
        )}

        <Button title="Add a Monkey" onPress={handleAddMonkey} color="#4CAF50" />
        <View style={{ marginTop: 10 }}>
          <Button title="Sign Out" onPress={handleSignOut} color="#d9534f" />
        </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  jsonText: {
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
});
