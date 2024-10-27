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
    def __init__(self, file_path, upload_timestamp=None):
        self.photo_id = str(uuid.uuid4())  # Unique identifier for the photo
        self.file_path = file_path
        self.image = None
        self.face_locations = []
        self.face_encodings = []
        self.metadata = {}
        self.upload_timestamp = upload_timestamp or datetime.utcnow().isoformat()
        self.face_hash = ''
    
        self.load_image()
        self.process_faces()
        self.generate_metadata()
    
    def load_image(self):
        """Loads the image from the file path with error handling."""
        try:
            self.image = face_recognition.load_image_file(self.file_path)
            logging.info(f"Loaded image: {self.file_path}")
        except FileNotFoundError:
            logging.error(f"File not found: {self.file_path}")
            self.image = None
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
    
    def to_dict(self) -> dict:
        """
        Converts the Photo instance to a dictionary suitable for Firestore.
        
        Returns:
            dict: A dictionary representation of the Photo instance.
        """
        return {
            'face_encodings': [enc.tolist() for enc in self.face_encodings],
        }
    @staticmethod
    def from_dict(data: dict) -> 'Photo':
        """
        Creates a Photo instance from a dictionary (e.g., Firestore document).
        
        Args:
            data (dict): Dictionary containing photo data.
        
        Returns:
            Photo: An instance of the Photo class.
        """
        # Extract required fields with defaults
        file_path = data.get('file_path')
        upload_timestamp = data.get('upload_timestamp', datetime.utcnow().isoformat())
        photo_id = data.get('photo_id', str(uuid.uuid4()))
        
        # Instantiate Photo without processing
        photo = Photo(file_path, upload_timestamp)
        photo.photo_id = photo_id
        
        # Load metadata if available
        metadata = data.get('metadata', {})
        photo.metadata = metadata
        
        # Load face locations and encodings if available
        face_locations = data.get('face_locations', [])
        face_encodings = data.get('face_encodings', [])
        photo.face_locations = face_locations
        photo.face_encodings = [np.array(enc) for enc in face_encodings]
        
        # Optionally, you can skip loading the image and processing faces since data is already provided
        # photo.load_image()
        # photo.process_faces()
        # photo.generate_metadata()
        
        return photo
