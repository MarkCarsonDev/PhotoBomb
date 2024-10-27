# server.py

import firebase_admin
from firebase_admin import credentials, firestore, storage

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
import pickle
import base64
import requests

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

def create_people_cluster(photo_list: List[Photo]) -> Dict[int, List[str]]:
    """
    Clusters face encodings from a list of Photo objects and associates clusters with users based on account photos.

    Args:
        photo_list (List[Photo]): List of Photo instances to cluster.

    Returns:
        Dict[int, List[str]]: A dictionary where keys are user `author_uid`s (from account photos in clusters)
                               and values are lists of photo IDs associated with each user.
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
        dbscan = DBSCAN(eps=0.55, min_samples=1, metric="euclidean").fit(all_encodings)
        labels = dbscan.labels_
        logging.info("DBSCAN clustering completed successfully.")
    except Exception as e:
        logging.error(f"DBSCAN clustering failed: {e}")
        return {}

    # Group photos by cluster labels
    clusters = defaultdict(list)
    for idx, label in enumerate(labels):
        if label != -1:  # Skip noise points
            clusters[label].append(photo_references[idx])

    # Create a dictionary to hold clusters associated with user `author_uid`s
    people_clusters = defaultdict(list)
    for label, cluster_photos in clusters.items():
        # Find an account photo in the cluster with a valid author_uid
        cluster_key = None
        for photo in cluster_photos:
            if photo.is_verification_photo and photo.author_uid:
                cluster_key = photo.author_uid  # Ensure author_uid is an integer
                break  # Use the first account photo with an author_uid as the key for the cluster
        
        # If an account photo with author_uid was found, add all photo IDs in the cluster to `people_clusters`
        if cluster_key is not None:
            for photo in cluster_photos:
                people_clusters[cluster_key].append(photo.photo_id)

    return people_clusters


def send_predicted_photos_to_users(db: firestore.Client, people_clusters: Dict):
    # Fetch all user documents from Firestore
    users_ref = db.collection('users')
    users_docs = users_ref.stream()
    
    for user_doc in users_docs:
        user_id = user_doc.id
        logging.info(f"Processing user {user_id}.")

        # Locate the corresponding document in `user_photos` using the user_id
        user_photos_ref = db.collection('user_photos').document(user_id)
        user_photos_doc = user_photos_ref.get()

        if not user_photos_doc.exists:
            logging.warning(f"No user_photos document found for user {user_id}. Skipping.")
            continue

        # Retrieve the confirmed photos for the user
        confirmed_photo_ids = set(user_photos_doc.to_dict().get('confirmed_photos', []))  # Set of confirmed photo IDs

        # Retrieve clustered photo IDs for the user from `people_clusters`
        clustered_photo_ids = set(people_clusters.get(user_id, []))  # Set of clustered photo IDs for this user
        
        # Calculate intersection of confirmed and clustered photos to get predicted photos
        predicted_photo_ids = clustered_photo_ids - confirmed_photo_ids.intersection(clustered_photo_ids)

        # Update the `predicted_photos` field in `user_photos`
        user_photos_ref.update({
            'predicted_photos': list(predicted_photo_ids)
        })
        logging.info(f"Updated `predicted_photos` for user {user_id} with {len(predicted_photo_ids)} photos.")

def add_face_embedding(photo_id: str, db: firestore.Client):
    doc_ref = db.collection('photos').document(photo_id)
    doc = doc_ref.get()

    if not doc.exists:
        logging.error(f"Photo document {photo_id} does not exist.")
        return

    data = doc.to_dict()

    # firebase_file_path = data.get('file_path')
    # bucket = storage.bucket("photobomb-fc123.appspot.com")
    # blob = bucket.blob(firebase_file_path)

    # local_path = os.path.join("downloaded_photos", os.path.basename(firebase_file_path))
    # blob.download_to_filename(local_path)

    firebase_file_path = data.get('file_path')
    url = firebase_file_path
    local_data = requests.get(url).content 
    f = open(f'downloaded_photos\{url[-15:]}.jpg','wb') 
    f.write(local_data) 
    f.close() 

    image = face_recognition.load_image_file(f'downloaded_photos\{url[-15:]}.jpg')
    # Compute face encodings
    face_encodings = face_recognition.face_encodings(image)
    face_embeddings = [encoding.tolist() for encoding in face_encodings]
    logging.info(f"Found {len(face_embeddings)} face(s) in photo {photo_id}.")
    if len(face_embeddings) == 0:
        doc_ref.update({'face_embeddings': 'faceless'})
        return
    face_embeddings_serialized = base64.b64encode(pickle.dumps(face_encodings)).decode('utf-8')
    padding_needed = len(face_embeddings_serialized) % 4
    if padding_needed != 0:
        face_embeddings_serialized += "=" * (4 - padding_needed)
    doc_ref.update({'face_embeddings': face_embeddings_serialized})
    logging.info(f"Replaced face embeddings for photo {photo_id}.")

def add_user_face_embedding(uid: str, db: firestore.Client):
    # Query `photos` collection to find the profile photo for this user
    photos_ref = db.collection('photos').stream()
    # query = photos_ref.where('author_uid', '==', user.uid).where('is_verification_photo', '==', True)
    query = filter(lambda doc: doc.to_dict().get('is_verification_photo', False) == True and doc.to_dict().get('author_uid') == uid, photos_ref)
    profile_photo_docs = list(query)
    profile_photos = [Photo.from_dict(doc) for doc in profile_photo_docs]
    
    # Check if any profile photos are found
    if not profile_photos:
        logging.warning(f"User {uid} has no profile photo to compute face embedding.")
        return

    # Use the first profile photo found
    profile_photo = profile_photos[0]
    
    firebase_file_path = profile_photo.file_path
    # bucket = storage.bucket("photobomb-fc123.appspot.com")
    # blob = bucket.blob(firebase_file_path)
    url = firebase_file_path

    local_data = requests.get(url).content 
    f = open(f'downloaded_photos\{url[-15:]}.jpg','wb') 
    f.write(local_data) 
    f.close() 
    
    # # Download the photo to a local temporary file
    # local_path = os.path.join("downloaded_photos", os.path.basename(firebase_file_path))
    # blob.download_to_filename(local_path)

    # Process the image to compute face encodings
    image = face_recognition.load_image_file(f'downloaded_photos\{url[-15:]}.jpg')

    face_encodings = face_recognition.face_encodings(image)
    
    if not face_encodings:
        logging.warning(f"No faces found in profile photo {profile_photo.photo_id} for user {uid}.")
        return

        # Use the first face encoding as the user's primary face embedding
    user_face_embedding = face_encodings[0] if face_encodings else ""

    # Serialize the face embedding with pickle and base64 encoding
    user_face_embedding_serialized = base64.b64encode(pickle.dumps(user_face_embedding)).decode('utf-8')

    # Ensure padding in case base64 encoding needs it
    padding_needed = len(user_face_embedding_serialized) % 4
    if padding_needed != 0:
        user_face_embedding_serialized += "=" * (4 - padding_needed)

    # Update the user's document with 'face_embedding'
    user_doc_ref = db.collection('users').document(uid)
    user_doc_ref.update({'face_embedding': user_face_embedding_serialized})
    logging.info(f"Updated user {uid} with serialized primary face embedding.")


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

    # Load all Photo objects from Firestore
    photo_list = load_all_photos_from_firebase()
    logging.info(f"Retrieved {len(photo_list)} photos from Firestore.")
    print(photo_list)

    doc_ref = db.collection('photos').document("KgU1WfF5gpori0dtf61C")
    doc = doc_ref.get()
    # print(doc.id)
    # data = doc.to_dict()
    # print(data)

    
    # Example: Fetch and log photos for each user
    # Load all User objects from Firestore
    user_list = load_all_users_from_firebase()
    logging.info(f"Retrieved {len(user_list)} users from Firestore.")
    for user in user_list:
        if not hasattr(user, 'face_embedding') or not user.face_embedding:
            logging.info(f"User {user.uid} is missing a face embedding. Adding it now.")
            add_user_face_embedding(user.uid, db)

    # for user in user_list:
    #     user_photos = user.get_photo_class_objects()
    #     logging.info(f"User '{user.email}' has {len(user_photos)} photos.")

    # Add face embeddings to photos missing them
    for photo in photo_list:
        logging.info(f"Processing photo {photo.photo_id} to replace face embeddings.")
        add_face_embedding(photo.photo_id, db)

    # Reload photos to include updated face embeddings
    photo_list = load_all_photos_from_firebase()
    logging.info(f"Reloaded {len(photo_list)} photos after adding face embeddings.")

    # Perform clustering on all photo encodings
    people_clusters = create_people_cluster(photo_list)
    logging.info(f"Created {len(people_clusters)} people clusters.")

     # Display clusters
    for cluster_key, photo_paths in people_clusters.items():
        logging.info(f"Cluster Key: {cluster_key}, Number of Photos: {len(photo_paths)}")
    send_predicted_photos_to_users(db, people_clusters)

   

    # # Handling known and unknown face folders (if applicable)
    # known_folder = "photos/known_faces"
    # unknown_folder = "photos/unknown_faces"

    # # Get encodings and file paths for known and unknown images
    # known_encodings, known_paths = get_face_encodings(known_folder)
    # unknown_encodings, unknown_paths = get_face_encodings(unknown_folder)

    # # Combine all encodings and paths
    # all_encodings = known_encodings + unknown_encodings
    # all_paths = known_paths + unknown_paths

    # logging.info(f"Retrieved {len(known_encodings)} known face encodings from {known_folder}.")
    # logging.info(f"Retrieved {len(unknown_encodings)} unknown face encodings from {unknown_folder}.")

if __name__ == "__main__":
    main()
