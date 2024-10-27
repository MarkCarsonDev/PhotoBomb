import os
from typing import List
from photo import Photo  # Ensure correct import path
from firebase_admin import firestore

def load_all_photos_from_firebase() -> List[Photo]:
    """
    Retrieves all photo documents from Firestore and returns a list of Photo objects.
    """
    db = firestore.client()
    all_photo_docs = db.collection('photos').stream()
    
    photo_objects = []
    for doc in all_photo_docs:
        data = doc.to_dict()
        # Assuming Firestore document has 'file_path' and other necessary fields
        photo = Photo.from_dict(data)
        photo_objects.append(photo)
    
    return photo_objects
