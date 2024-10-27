# server.py

import firebase_admin
from firebase_admin import credentials, firestore

import os
import numpy as np
import face_recognition
from sklearn.cluster import DBSCAN
from collections import defaultdict
from typing import List, Dict

from photo_loader import load_all_photos_from_firebase
from user_loader import load_all_users_from_firebase
from userclass import User
from photo import Photo

import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def initialize_firebase():
    """
    Initializes Firebase Admin SDK with the provided service account key.
    """
    try:
        cred = credentials.Certificate("./firebaseConfig.json")
        firebase_admin.initialize_app(cred)
        logging.info("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        logging.error(f"Failed to initialize Firebase Admin SDK: {e}")
        raise

def add_face_embedding(photo_id: str, db: firestore.Client):
    """
    Computes face embeddings for a given photo and updates the Firestore document.

    Args:
        photo_id (str): The ID of the photo document in Firestore.
        db (firestore.Client): The Firestore client instance.
    """
    try:
        doc_ref = db.collection('photos').document(photo_id)
        doc = doc_ref.get()

        if not doc.exists:
            logging.error(f"Photo document {photo_id} does not exist.")
            return

        data = doc.to_dict()

        if 'face_embeddings' in data and data['face_embeddings']:
            logging.info(f"Photo {photo_id} already has face embeddings. Skipping.")
            return

        file_path = data.get('file_path')

        if not file_path:
            logging.error(f"Photo {photo_id} is missing 'file_path' field.")
            return

        if not os.path.exists(file_path):
            logging.error(f"File path {file_path} does not exist for photo {photo_id}.")
            return

        # Load the image
        image = face_recognition.load_image_file(file_path)

        # Compute face encodings
        face_encodings = face_recognition.face_encodings(image)

        if not face_encodings:
            logging.info(f"No faces found in photo {photo_id}.")
            face_embeddings = []
        else:
            # Convert numpy arrays to lists for JSON serialization
            face_embeddings = [encoding.tolist() for encoding in face_encodings]
            logging.info(f"Found {len(face_embeddings)} face(s) in photo {photo_id}.")

        # Update the Firestore document with 'face_embeddings'
        doc_ref.update({'face_embeddings': face_embeddings})
        logging.info(f"Updated photo {photo_id} with face embeddings.")

    except Exception as e:
        logging.error(f"Error processing photo {photo_id}: {e}")

def add_user_face_embedding(user: User, db: firestore.Client):
    """
    Computes the primary face embedding for a user and updates the Firestore document.

    Args:
        user (User): The User object.
        db (firestore.Client): The Firestore client instance.
    """
    try:
        # Assuming each user has a profile photo marked as 'is_account_photo'
        user_photos = user.get_photo_class_objects()
        profile_photos = [photo for photo in user_photos if photo.is_account_photo]

        if not profile_photos:
            logging.warning(f"User {user.uid} has no profile photo to compute face embedding.")
            return

        # Use the first profile photo
        profile_photo = profile_photos[0]

        if not profile_photo.face_encodings:
            logging.info(f"Profile photo {profile_photo.photo_id} for user {user.uid} lacks face embeddings. Adding them now.")
            add_face_embedding(profile_photo.photo_id, db)
            # Reload the photo to get the updated face encodings
            db_photo_doc = db.collection('photos').document(profile_photo.photo_id).get()
            if db_photo_doc.exists:
                profile_photo = Photo.from_dict(db_photo_doc.to_dict())
            else:
                logging.error(f"Failed to reload profile photo {profile_photo.photo_id} for user {user.uid}.")
                return

        if not profile_photo.face_encodings:
            logging.warning(f"Profile photo {profile_photo.photo_id} for user {user.uid} still lacks face embeddings.")
            return

        # Compute the user's primary face embedding as the first encoding
        user_face_embedding = profile_photo.face_encodings[0].tolist()

        # Update the user's document with 'face_embedding'
        user_doc_ref = db.collection('users').document(user.uid)
        user_doc_ref.update({'face_embedding': user_face_embedding})
        logging.info(f"Updated user {user.uid} with primary face embedding.")

    except Exception as e:
        logging.error(f"Error processing user {user.uid}: {e}")

def create_people_cluster(photo_list: List[Photo]) -> Dict:
    """
    Clusters face encodings from the provided list of Photo objects using DBSCAN.

    Args:
        photo_list (List[Photo]): List of Photo instances to cluster.

    Returns:
        Dict: A dictionary where keys are cluster identifiers (author_id or cluster label)
              and values are lists of file paths associated with each cluster.
    """
    all_encodings = []
    photo_references = []

    for photo in photo_list:
        all_encodings.extend(photo.face_encodings)
        photo_references.extend([photo] * len(photo.face_encodings))

    if not all_encodings:
        logging.warning("No face encodings found to cluster.")
        return {}

    all_encodings = np.array(all_encodings)

    try:
        dbscan = DBSCAN(eps=0.5, min_samples=1, metric="euclidean").fit(all_encodings)
        labels = dbscan.labels_
        logging.info("DBSCAN clustering completed successfully.")
    except Exception as e:
        logging.error(f"DBSCAN clustering failed: {e}")
        return {}

    people_clusters = defaultdict(list)
    for idx, label in enumerate(labels):
        if label != -1:  # Ignore noise points if any
            photo = photo_references[idx]
            # Use author_id as cluster key if the photo is an account/profile photo
            if photo.is_account_photo and photo.author_id:
                cluster_key = photo.author_id
            else:
                cluster_key = f"Cluster_{label}"
            people_clusters[cluster_key].append(photo.file_path)

    return people_clusters

def get_face_encodings(folder_path: str) -> tuple[[np.ndarray], List[str]]:
    """
    Retrieves face encodings from images in the specified folder.

    Args:
        folder_path (str): Path to the folder containing images.

    Returns:
        Tuple[List[np.ndarray], List[str]]: A tuple containing a list of face encodings and their corresponding file paths.
    """
    encodings = []
    file_paths = []
    supported_formats = ('.png', '.jpg', '.jpeg')

    if not os.path.exists(folder_path):
        logging.warning(f"Folder not found: {folder_path}")
        return encodings, file_paths

    for file_name in os.listdir(folder_path):
        if not file_name.lower().endswith(supported_formats):
            logging.debug(f"Skipping non-image file: {file_name}")
            continue  # Skip non-image files

        file_path = os.path.join(folder_path, file_name)
        try:
            image = face_recognition.load_image_file(file_path)
            face_encodings = face_recognition.face_encodings(image)
            if not face_encodings:
                logging.info(f"No faces found in image: {file_path}")
                continue
            for encoding in face_encodings:
                encodings.append(encoding)
                file_paths.append(file_path)  # Associate each encoding with the image path
            logging.info(f"Processed image: {file_path} with {len(face_encodings)} face(s).")
        except Exception as e:
            logging.error(f"Failed to process image {file_path}: {e}")

    return encodings, file_paths

def main():
    """
    Main function to execute the server operations:
    - Initialize Firebase
    - Load Users and Photos from Firestore
    - Add face embeddings to photos missing them
    - Add face embeddings to users missing them
    - Perform clustering on face encodings
    - Handle known and unknown face encodings from local directories
    """
    # Initialize Firebase
    initialize_firebase()

    # Initialize Firestore client
    db = firestore.client()

    # Load all User objects from Firestore
    user_list = load_all_users_from_firebase()
    logging.info(f"Retrieved {len(user_list)} users from Firestore.")

    # Load all Photo objects from Firestore
    photo_list = load_all_photos_from_firebase()
    logging.info(f"Retrieved {len(photo_list)} photos from Firestore.")

    # Example: Fetch and log photos for each user
    for user in user_list:
        user_photos = user.get_photo_class_objects()
        logging.info(f"User '{user.email}' has {len(user_photos)} photos.")

    # Add face embeddings to photos missing them
    for photo in photo_list:
        doc_ref = db.collection('photos').document(photo.photo_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            face_embeddings = data.get('face_embeddings', [])
            if face_embeddings:
                # Assign face_encodings from the database
                photo.face_encodings = [np.array(enc) for enc in face_embeddings]
                logging.info(f"Photo {photo.photo_id} already has face embeddings.")
            else:
                logging.info(f"Photo {photo.photo_id} is missing face embeddings. Adding them now.")
                add_face_embedding(photo.photo_id, db)
        else:
            logging.error(f"Photo document {photo.photo_id} does not exist.")

    # Reload photos to include updated face embeddings
    photo_list = load_all_photos_from_firebase()
    logging.info(f"Reloaded {len(photo_list)} photos after adding face embeddings.")

    # Add face embeddings to users missing them
    for user in user_list:
        if not hasattr(user, 'face_embedding') or not user.face_embedding:
            logging.info(f"User {user.uid} is missing a face embedding. Adding it now.")
            add_user_face_embedding(user, db)

    # Perform clustering on all photo encodings
    people_clusters = create_people_cluster(photo_list)
    logging.info(f"Created {len(people_clusters)} people clusters.")

    # Display clusters
    for cluster_key, photo_paths in people_clusters.items():
        logging.info(f"Cluster Key: {cluster_key}, Number of Photos: {len(photo_paths)}")

    # Handling known and unknown face folders (if applicable)
    known_folder = "photos/known_faces"
    unknown_folder = "photos/unknown_faces"

    # Get encodings and file paths for known and unknown images
    known_encodings, known_paths = get_face_encodings(known_folder)
    unknown_encodings, unknown_paths = get_face_encodings(unknown_folder)

    # Combine all encodings and paths
    all_encodings = known_encodings + unknown_encodings
    all_paths = known_paths + unknown_paths

    logging.info(f"Retrieved {len(known_encodings)} known face encodings from {known_folder}.")
    logging.info(f"Retrieved {len(unknown_encodings)} unknown face encodings from {unknown_folder}.")

    # Example: Further processing with known and unknown encodings
    # This could include matching unknown encodings to known users, etc.
    # Implement based on your application's requirements

if __name__ == "__main__":
    main()
