# userclass.py

import numpy as np
from typing import Dict, List
from photo_loader import load_all_photos
from photo import Photo

class User:
    def __init__(self, username: str, face_embedding: np.ndarray, confirmed_photos: Dict[int, np.ndarray] = None, predicted_photos: Dict[int, np.ndarray] = None, user_id: int = 0
    ):
        self.username = username
        self.face_embedding = face_embedding
        self.confirmed_photos = confirmed_photos if confirmed_photos is not None else {}
        self.predicted_photos = predicted_photos if predicted_photos is not None else {}
        self.user_id = user_id
    
    def get_photo_class_objects(self, photos_directory: str) -> List[Photo]:
        """
        Returns a list of Photo class objects from the specified directory.
        """
        return load_all_photos(photos_directory)
    
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
        return {
            'username': self.username,
            'face_embedding': self.face_embedding.tolist(),
            'confirmed_photos': {pid: enc.tolist() for pid, enc in self.confirmed_photos.items()},
            'predicted_photos': {pid: enc.tolist() for pid, enc in self.predicted_photos.items()},
            'user_id': self.user_id
        }
    
    @staticmethod
    def from_dict(data: dict) -> 'User':
        return User(
            face_embedding=np.array(data['face_embedding']),
            confirmed_photos={int(pid): np.array(enc) for pid, enc in data.get('confirmed_photos', {}).items()},
            predicted_photos={int(pid): np.array(enc) for pid, enc in data.get('predicted_photos', {}).items()},
            user_id=data.get('user_id', 0)
        )
