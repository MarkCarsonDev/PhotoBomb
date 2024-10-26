import face_recognition
import os
import json
import pickle
from datetime import datetime

class Photo:
    def __init__(self, file_path, upload_timestamp=None):
        self.file_path = file_path
        self.image = None
        self.face_locations = []
        self.face_encodings = []
        self.metadata = {}
        self.upload_timestamp = upload_timestamp or datetime.utcnow().isoformat()
    
        self.load_image()
        self.process_faces()
        self.generate_metadata()
    
    def load_image(self):
        self.image = face_recognition.load_image_file(self.file_path)
    
    def process_faces(self):
        self.face_locations = face_recognition.face_locations(self.image, model='hog')
        self.face_encodings = face_recognition.face_encodings(self.image, self.face_locations)
    
    def generate_metadata(self):
        self.metadata = {
            'file_name': os.path.basename(self.file_path),
            'num_faces': len(self.face_encodings),
            'face_locations': self.face_locations,
            'image_height': self.image.shape[0],
            'image_width': self.image.shape[1],
            'upload_timestamp': self.upload_timestamp,
        }
    
    def save_metadata(self, output_directory):
        metadata_file = os.path.join(
            output_directory, self.metadata['file_name'] + '_metadata.json'
        )
        with open(metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=4)
    
    def save_encodings(self, output_directory):
        encodings_file = os.path.join(
            output_directory, self.metadata['file_name'] + '_encodings.pkl'
        )
        with open(encodings_file, 'wb') as f:
            pickle.dump(self.face_encodings, f)

# Usage Example
def process_photos(input_directory, output_directory):
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    for photo_filename in os.listdir(input_directory):
        if photo_filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            photo_path = os.path.join(input_directory, photo_filename)
            photo = Photo(photo_path)
            photo.save_metadata(output_directory)
            photo.save_encodings(output_directory)
            print(
                f"Processed '{photo.metadata['file_name']}' with "
                f"{photo.metadata['num_faces']} face(s)."
            )

# Replace with your directories
input_dir = r"C:\Users\natef\Desktop\Everything\Programming\Projects\PhotoBomb\photos"
output_dir = r"C:\Users\natef\Desktop\Everything\Programming\Projects\PhotoBomb\processed"

process_photos(input_dir, output_dir)
