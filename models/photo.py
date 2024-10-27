# ML/photo.py

import face_recognition
import os
import json
import pickle
from datetime import datetime
import uuid
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Photo:
    def __init__(self, file_path, upload_timestamp=None, is_account_photo=False, author_id=None):
        self.photo_id = str(uuid.uuid4())  # Unique identifier for the photo
        self.file_path = file_path
        self.image = None
        self.face_locations = []
        self.face_encodings = []
        self.metadata = {}
        self.upload_timestamp = upload_timestamp or datetime.utcnow().isoformat()
        self.is_account_photo = is_account_photo
        self.author_id = author_id  # Reference to User UID
    
        self.load_image()
        self.process_faces()
        self.generate_metadata()
    
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
    
    def generate_metadata(self):
        """Generates metadata for the photo."""
        if self.image is not None:
            self.metadata = {
                'file_name': os.path.basename(self.file_path),
                'num_faces': len(self.face_encodings),
                'face_locations': self.face_locations,
                'image_height': self.image.shape[0],
                'image_width': self.image.shape[1],
                'upload_timestamp': self.upload_timestamp,
                'is_account_photo': self.is_account_photo,
                'author_id': self.author_id,
                'photo_id': self.photo_id
            }
        else:
            self.metadata = {
                'file_name': os.path.basename(self.file_path),
                'num_faces': 0,
                'face_locations': [],
                'image_height': None,
                'image_width': None,
                'upload_timestamp': self.upload_timestamp,
                'is_account_photo': self.is_account_photo,
                'author_id': self.author_id,
                'photo_id': self.photo_id
            }
    
    def save_metadata(self, output_directory):
        """Saves the metadata to a JSON file."""
        metadata_file = os.path.join(
            output_directory, self.metadata['file_name'] + '_metadata.json'
        )
        try:
            with open(metadata_file, 'w') as f:
                json.dump(self.metadata, f, indent=4)
            logging.info(f"Saved metadata to {metadata_file}")
        except Exception as e:
            logging.error(f"Failed to save metadata for {self.metadata['file_name']}: {e}")
    
    def save_encodings(self, output_directory):
        """Saves the face encodings to a pickle file."""
        encodings_file = os.path.join(
            output_directory, self.metadata['file_name'] + '_encodings.pkl'
        )
        try:
            with open(encodings_file, 'wb') as f:
                pickle.dump(self.face_encodings, f)
            logging.info(f"Saved encodings to {encodings_file}")
        except Exception as e:
            logging.error(f"Failed to save encodings for {self.metadata['file_name']}: {e}")
    
    @staticmethod
    def from_dict(data: dict) -> 'Photo':
        """
        Creates a Photo instance from a dictionary (e.g., Firestore document).
        
        Args:
            data (dict): Dictionary containing photo data from Firestore.
        
        Returns:
            Photo: An instance of the Photo class.
        """
        required_fields = ['file_path', 'author_id']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field '{field}' in photo document.")
        
        file_path = data['file_path']
        upload_timestamp = data.get('upload_timestamp', datetime.utcnow().isoformat())
        is_account_photo = data.get('IsAccountPhoto', False)
        author_id = data['author_id']
        photo_id = data.get('photo_id', str(uuid.uuid4()))
        face_embeddings = data.get('face_embeddings', [])
        
        # Instantiate Photo without processing (since data is provided)
        photo = Photo(file_path, upload_timestamp, is_account_photo, author_id)
        photo.photo_id = photo_id
        photo.metadata['face_embeddings'] = face_embeddings
        
        # Convert face_embeddings to NumPy arrays
        photo.face_encodings = [np.array(emb) for emb in face_embeddings]
        photo.metadata['num_faces'] = len(photo.face_encodings)
        
        # Optionally, you can calculate face_locations if needed
        # Here, we're assuming that face_locations are not stored separately
        
        return photo
    
    def to_dict(self) -> dict:
        """
        Converts the Photo instance to a dictionary suitable for Firestore.
        
        Returns:
            dict: A dictionary representation of the Photo instance.
        """
        return {
            'photo_id': self.photo_id,
            'file_path': self.file_path,
            'face_embeddings': [emb.tolist() for emb in self.face_encodings],
            'IsAccountPhoto': self.is_account_photo,
            'author_id': self.author_id,
            'upload_timestamp': self.upload_timestamp
        }
