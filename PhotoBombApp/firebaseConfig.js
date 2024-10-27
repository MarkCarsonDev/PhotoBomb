import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBB_Pz5WUYH7dvYWDELRgJDbihrCC-WwAs",
	authDomain: "photobomb-fc123.firebaseapp.com",
	projectId: "photobomb-fc123",
	storageBucket: "photobomb-fc123.appspot.com",
	messagingSenderId: "838939264780",
	appId: "1:838939264780:web:1ede66d851b5f63f12ab29",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
// const auth = getAuth(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
