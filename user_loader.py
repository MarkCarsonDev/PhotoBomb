from typing import List
from userclass import User  # Ensure correct import path
from firebase_admin import firestore
import numpy as np

def load_all_users_from_firebase() -> List[User]:
    """
    Retrieves all user documents from Firestore and returns a list of User objects.
    """
    db = firestore.client()
    user_docs = db.collection('users').stream()
    
    user_objects = []
    for doc in user_docs:
        data = doc.to_dict()
        # Assuming Firestore document has 'username', 'face_embedding', 'confirmed_photos', 'predicted_photos', 'user_id'
        user = User.from_dict(data)
        user_objects.append(user)
    
    return user_objects
