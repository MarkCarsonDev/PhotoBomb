# ML/photo.py

import face_recognition
import os
import json
import pickle
from datetime import datetime
import uuid
import numpy as np
import logging
from typing import List
import pickle
import base64

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Photo:
    def __init__(
        self, 
        file_path: str, 
        created_at: str = None, 
        is_verification_photo: bool = False, 
        author_uid: str = None, 
        face_embeddings: List[List[float]] = None, 
        photo_id: str = None
    ):
        self.photo_id = photo_id #or str(uuid.uuid4())  # Unique identifier for the photo
        self.file_path = file_path
        self.image = None
        self.face_locations = []
        self.face_encodings = []
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.is_verification_photo = is_verification_photo
        self.author_uid = author_uid  # Reference to User UID
        
        if face_embeddings:
            self.face_encodings = [np.array(enc) for enc in face_embeddings]
            self.face_locations = []  # Optional: You can store face locations if needed
        else:
            self.load_image()
            self.process_faces()
    
    def load_image(self):
        """Loads the image from the file path with error handling."""
        if not os.path.exists(self.file_path):
            logging.error(f"File not found: {self.file_path}")
            self.image = None
            return
        try:
            self.image = face_recognition.load_image_file(self.file_path)
            logging.info(f"Loaded image: {self.file_path}")
        except Exception as e:
            logging.error(f"Error loading image {self.file_path}: {e}")
            self.image = None
    
    def process_faces(self):
        """Detects face locations and encodings in the image with error handling."""
        if self.image is not None:
            try:
                self.face_locations = face_recognition.face_locations(self.image, model='hog')
                self.face_encodings = face_recognition.face_encodings(self.image, self.face_locations)
                logging.info(f"Detected {len(self.face_encodings)} face(s) in {self.file_path}")
            except Exception as e:
                logging.error(f"Error processing faces in {self.file_path}: {e}")
                self.face_locations = []
                self.face_encodings = []
        else:
            logging.warning(f"Skipping face processing for {self.file_path} due to image loading failure.")
    
    @staticmethod
    def from_dict(doc) -> 'Photo':
        """
        Creates a Photo instance from a dictionary (e.g., Firestore document).
        
        Args:
            data (dict): Dictionary containing photo data from Firestore.
        
        Returns:
            Photo: An instance of the Photo class.
        """
        data = doc.to_dict()
        required_fields = ['file_path', 'author_uid']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field '{field}' in photo document.")
        
        file_path = data['file_path']
        created_at = data.get('created_at', datetime.utcnow().isoformat())
        is_verification_photo = data.get('is_verification_photo')
        author_uid = data['author_uid']
        photo_id = doc.id #, str(uuid.uuid4()))
        face_embeddings_pickled = data.get('face_embeddings')
        if face_embeddings_pickled =="faceless":
            padding_needed = len(face_embeddings_pickled) % 4
            if padding_needed != 0:
                face_embeddings_pickled += "=" * (4 - padding_needed)
            face_embeddings = pickle.loads(base64.b64decode(face_embeddings_pickled))
        else:
            face_embeddings = face_embeddings_pickled
        # Instantiate Photo without processing if face_embeddings are provided
        photo = Photo(
            file_path=file_path, 
            created_at=created_at, 
            is_verification_photo=is_verification_photo, 
            author_uid=author_uid, 
            face_embeddings=face_embeddings, 
            photo_id=photo_id
        )
        
        return photo
    
    def to_dict(self) -> dict:
        """
        Converts the Photo instance to a dictionary suitable for Firestore.
        
        Returns:
            dict: A dictionary representation of the Photo instance.
        """
        return {
            'is_verification_photo': self.is_verification_photo,
            'face_embeddings': [emb.tolist() for emb in self.face_encodings],
            'file_path': self.file_path,
            'author_uid': self.author_uid,
            'photo_id': self.photo_id,
            'created_at': self.created_at
        }
