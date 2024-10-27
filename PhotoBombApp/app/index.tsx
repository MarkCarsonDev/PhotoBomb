// app/index.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    console.log('Index Component Mounted');
    console.log(`User loading status: ${loading}`);
    console.log(`User authentication status: ${user ? 'Authenticated' : 'Not Authenticated'}`);

    const checkVerificationStatus = async () => {
      if (user) {
        console.log(`Checking verification status for user: ${user.uid}`);
        try {
          const photosRef = collection(db, 'photos');
          const q = query(
            photosRef,
            where('author_uid', '==', user.uid),
            where('is_verification_photo', '==', true)
          );
          const querySnapshot = await getDocs(q);

          console.log(`Verification photos found: ${querySnapshot.size}`);

          if (!querySnapshot.empty) {
            // User is verified, navigate to Library
            console.log('User verified. Navigating to /Library');
            router.replace('/Library');
          } else {
            // User is not verified, navigate to VerificationPage
            console.log('User not verified. Navigating to /VerificationPage');
            router.replace('/VerificationPage');
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
        } finally {
          setIsReady(true);
        }
      } else {
        // User is not authenticated, navigate to LoginSignup
        console.log('User not authenticated. Navigating to /LoginSignup');
        router.replace('/LoginSignup');
        setIsReady(true);
      }
    };

    const timeout = setTimeout(() => {
      console.warn('Timeout reached. Redirecting to LoginSignup.');
      setTimeoutReached(true);
      setIsReady(true);
      router.replace('/LoginSignup');
    }, 5000);

    if (!loading && !isReady && !timeoutReached) {
      console.log('Starting verification check');
      checkVerificationStatus();
    }

    return () => {
      console.log('Clearing timeout');
      clearTimeout(timeout);
    };
  }, [loading, user, isReady, timeoutReached]);

  // Display loading screen while the app is verifying the user's status
  if (loading || !isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Find yourself.</Text>
      </View>
    );
  }

  // This should never render since navigation occurs before this point
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#000',
  },
});
