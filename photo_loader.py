# ML/photo_loader.py

from typing import List
from photo import Photo  # Ensure correct import path
from firebase_admin import firestore
import logging

def load_all_photos_from_firebase() -> List[Photo]:
    """
    Retrieves all photo documents from Firestore and returns a list of Photo objects.
    
    Returns:
        List[Photo]: A list of Photo instances representing each photo document in Firestore.
    """
    db = firestore.client()
    all_photo_docs = db.collection('photos').stream()
    
    photo_objects = []
    for doc in all_photo_docs:
        try:
            photo = Photo.from_dict(doc)
            photo_objects.append(photo)
            logging.info(f"Loaded Photo: {photo.photo_id}, Filename: {photo.metadata.get('file_name', 'N/A')}")
        except Exception as e:
            logging.error(f"Failed to create Photo from document {doc.id}: {e}")
    
    return photo_objects

def load_photos_by_author_from_firebase(author_uid: str) -> List[Photo]:
    """
    Retrieves photo documents authored by a specific user from Firestore and returns a list of Photo objects.
    
    Args:
        author_uid (str): The UID of the author/user.
    
    Returns:
        List[Photo]: A list of Photo instances authored by the specified user.
    """
    db = firestore.client()
    photos_ref = db.collection('photos')
    query = photos_ref.where('author_uid', '==', author_uid)
    photo_docs = query.stream()
    
    photo_objects = []
    for doc in photo_docs:
        try:
            photo = Photo.from_dict(doc)
            photo_objects.append(photo)
            logging.info(f"Loaded Photo: {photo.photo_id}, Filename: {photo.metadata.get('file_name', 'N/A')}")
        except Exception as e:
            logging.error(f"Failed to create Photo from document {doc.id}: {e}")
    
    return photo_objects
