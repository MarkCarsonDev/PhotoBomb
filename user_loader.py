# ML/user_loader.py

from typing import List
from userclass import User  # Ensure correct import path
from firebase_admin import firestore
import logging

def load_all_users_from_firebase() -> List[User]:
    """
    Retrieves all user documents from Firestore and returns a list of User objects.
    
    Returns:
        List[User]: A list of User instances representing each user document in Firestore.
    """
    db = firestore.client()
    user_docs = db.collection('users').stream()
    
    user_objects = []
    for doc in user_docs:
        data = doc.to_dict()
        try:
            user = User.from_dict(data)
            user_objects.append(user)
            logging.info(f"Loaded User: {user.uid}, Email: {user.email}")
        except Exception as e:
            logging.error(f"Failed to create User from document {doc.id}: {e}")
    
    return user_objects
