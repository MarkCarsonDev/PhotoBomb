# ML/userclass.py

import numpy as np
from typing import Dict, List
from photo_loader import load_photos_by_author_from_firebase
from photo import Photo
import logging

class User:
    def __init__(
        self, 
        email: str, 
        uid: str, 
        face_embedding: np.ndarray, 
        confirmed_photos: Dict[int, np.ndarray] = None, 
        predicted_photos: Dict[int, np.ndarray] = None
    ):
        self.email = email
        self.uid = uid
        self.face_embedding = face_embedding
        self.confirmed_photos = confirmed_photos if confirmed_photos is not None else {}
        self.predicted_photos = predicted_photos if predicted_photos is not None else {}
    
    def get_photo_class_objects(self) -> List[Photo]:
        """
        Retrieves and returns a list of Photo objects authored by this user from Firestore.
        """
        logging.info(f"Fetching photos for user UID: {self.uid}")
        return load_photos_by_author_from_firebase(self.uid)
    
    def add_confirmed_photo(self, face_id: int, face_encoding: np.ndarray) -> None:
        self.confirmed_photos[face_id] = face_encoding
        self.predicted_photos.pop(face_id, None)
    
    def remove_confirmed_photo(self, face_id: int) -> None:
        self.confirmed_photos.pop(face_id, None)
    
    def add_predicted_photo(self, face_id: int, face_encoding: np.ndarray) -> None:
        if face_id not in self.confirmed_photos and face_id not in self.predicted_photos:
            self.predicted_photos[face_id] = face_encoding
    
    def remove_predicted_photo(self, face_id: int) -> None:
        self.predicted_photos.pop(face_id, None)
    
    def confirm_predicted_photo(self, face_id: int) -> None:
        if face_id in self.predicted_photos:
            face_encoding = self.predicted_photos.pop(face_id)
            self.confirmed_photos[face_id] = face_encoding
    
    def is_match(self, face_encoding: np.ndarray, tolerance: float = 0.6) -> bool:
        distance = np.linalg.norm(self.face_embedding - face_encoding)
        return distance <= tolerance
    
    def update_face_embedding(self, new_face_embedding: np.ndarray) -> None:
        self.face_embedding = new_face_embedding
    
    def to_dict(self) -> dict:
        """
        Converts the User instance to a dictionary suitable for Firestore.
        
        Returns:
            dict: A dictionary representation of the User instance.
        """
        return {
            'email': self.email,
            'uid': self.uid,
            'face_embedding': self.face_embedding.tolist(),
            'confirmed_photos': {pid: enc.tolist() for pid, enc in self.confirmed_photos.items()},
            'predicted_photos': {pid: enc.tolist() for pid, enc in self.predicted_photos.items()}
        }
    
    @staticmethod
    def from_dict(data: dict) -> 'User':
        """
        Creates a User instance from a dictionary (e.g., Firestore document).
        
        Args:
            data (dict): Dictionary containing user data from Firestore.
        
        Returns:
            User: An instance of the User class.
        """
        required_fields = ['email', 'uid', 'face_embedding']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field '{field}' in user document.")
        
        email = data['email']
        uid = data['uid']
        face_embedding = np.array(data['face_embedding'])
        
        confirmed_photos = {}
        predicted_photos = {}
        
        if 'confirmed_photos' in data:
            for pid, enc in data['confirmed_photos'].items():
                confirmed_photos[int(pid)] = np.array(enc)
        
        if 'predicted_photos' in data:
            for pid, enc in data['predicted_photos'].items():
                predicted_photos[int(pid)] = np.array(enc)
        
        return User(
            email=email,
            uid=uid,
            face_embedding=face_embedding,
            confirmed_photos=confirmed_photos,
            predicted_photos=predicted_photos
        )
