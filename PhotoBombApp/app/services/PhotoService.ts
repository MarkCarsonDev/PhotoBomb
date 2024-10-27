// app/services/PhotoService.ts
import { db, storage } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a photo to Firebase Storage and creates a Firestore document in the 'photos' collection.
 * @param {string} userId - The UID of the authenticated user.
 * @param {Blob} photoBlob - The photo blob to upload.
 * @param {boolean} isVerification - Indicates if the photo is a verification photo.
 * @returns {Promise<string>} - The download URL of the uploaded photo.
 */
export const uploadPhoto = async (userId: string, photoBlob: Blob, isVerification: boolean): Promise<void> => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const filePath = `users/${userId}/photos/${timestamp}.jpg`;
      const storageRef = ref(storage, filePath);

      // Upload the photo to Firebase Storage
      await uploadBytes(storageRef, photoBlob);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Create a new document in the 'photos' collection with an incremental ID
      const photosCollectionRef = collection(db, 'photos');
      await addDoc(photosCollectionRef, {
        author_uid: userId,
        embeddings: [], // To be implemented as needed
        filepath: downloadURL,
        is_verification_photo: isVerification,
        created_at: serverTimestamp(),
      });

      console.log('Photo uploaded successfully');
      return; // Exit function if successful
    } catch (error) {
      console.error(`Error uploading photo on attempt ${attempt + 1}:`, error);
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error('Failed to upload photo after multiple attempts');
      }

      // Wait for a short delay before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Upload failed after max retries."); // Shouldn’t reach this, added for TypeScript compliance
};