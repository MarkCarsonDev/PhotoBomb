// app/index.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Function to check if the user is verified
  const checkVerificationStatus = async () => {
    if (user) {
      try {
        const photosRef = collection(db, 'photos');
        const q = query(
          photosRef,
          where('author_uid', '==', user.uid),
          where('is_verification_photo', '==', true)
        );
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} verification photos for user ${user.uid}`);
        if (!querySnapshot.empty && querySnapshot.size != 0) {
          // User is verified
          router.replace('/Library');
        } else {
          // User is not verified
          router.replace('/VerificationPage');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        // Handle error accordingly, possibly redirect to an error page or show a message
      }
    } else {
      // User is not authenticated
      router.replace('/LoginSignup');
    }
  };

  useEffect(() => {
    if (!loading) {
      if (user) {
        checkVerificationStatus();
      } else {
        router.replace('/LoginSignup');
      }
    }
  }, [user, loading]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (!loading) {
          if (user) {
            checkVerificationStatus();
          } else {
            router.replace('/LoginSignup');
          }
        }
      }}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text style={styles.getStartedText}>Get Started</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 24,
    color: '#000',
  },
});
