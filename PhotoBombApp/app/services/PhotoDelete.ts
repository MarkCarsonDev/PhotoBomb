// app/services/PhotoDelete.ts
import { db, storage } from '../../firebaseConfig';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch, getDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

/**
 * Deletes a photo from Firebase Storage and removes all references to it from Firestore.
 * @param {string} photoId - The ID of the photo to delete.
 * @returns {Promise<void>}
 */
export const deletePhoto = async (photoId: string): Promise<void> => {
  try {
    // Fetch the photo document from the 'photos' collection
    const photoDocRef = doc(db, 'photos', photoId);
    const photoDoc = await getDoc(photoDocRef);

    if (!photoDoc.exists()) {
      console.warn(`Photo with ID ${photoId} does not exist.`);
      return;
    }

    const photoData = photoDoc.data();
    const filePath = photoData?.filepath;

    // Batch operation to delete references in user_photos and photos collections
    const batch = writeBatch(db);

    // 1. Delete the photo document from the 'photos' collection
    batch.delete(photoDocRef);

    // 2. Delete all instances of the photo in 'user_photos'
    const userPhotosRef = collection(db, 'user_photos');
    const userPhotosQuery = query(userPhotosRef, where('photo_ids', 'array-contains', photoId));
    const userPhotosSnapshot = await getDocs(userPhotosQuery);

    userPhotosSnapshot.forEach((doc) => {
      // Remove photoId from the 'photo_ids' array in each user document
      const updatedPhotoIds = doc.data().photo_ids.filter((id: string) => id !== photoId);
      batch.update(doc.ref, { photo_ids: updatedPhotoIds });
    });

    // Commit the batch operation
    await batch.commit();

    console.log(`References to photo ${photoId} deleted successfully from Firestore.`);

    // 3. Delete the actual photo file from Firebase Storage if it exists
    if (filePath) {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      console.log(`Photo file ${filePath} deleted successfully from Storage.`);
    } else {
      console.warn(`File path for photo ${photoId} is missing. Skipping storage deletion.`);
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};
