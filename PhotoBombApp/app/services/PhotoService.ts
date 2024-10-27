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
export const uploadPhoto = async (userId: string, photoBlob: Blob, isVerification: boolean): Promise<string> => {
  const maxRetries = 3; // Set the max retry count
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`Attempting upload for user: ${userId}, attempt #${retryCount + 1}`);

      const timestamp = Date.now();
      const filePath = `users/${userId}/photos/${timestamp}.jpg`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, photoBlob);
      console.log("Upload to Firebase Storage completed.");

      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL retrieved from Firebase:", downloadURL);

      const photosCollectionRef = collection(db, 'photos');
      await addDoc(photosCollectionRef, {
        author_uid: userId,
        embeddings: [], // Placeholder for future implementation
        filepath: downloadURL,
        is_verification_photo: isVerification,
        created_at: serverTimestamp(),
      });
      console.log("Photo metadata successfully added to Firestore.");

      return downloadURL; // Return the URL if successful
    } catch (error) {
      console.error(`Error uploading photo on attempt #${retryCount + 1}:`, error);
      retryCount += 1;
      if (retryCount >= maxRetries) {
        console.error("Max retries reached. Failing upload.");
        throw error;
      }
    }
  }
  throw new Error("Upload failed after max retries."); // Shouldn’t reach this, added for TypeScript compliance
};