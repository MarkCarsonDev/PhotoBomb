# models/photo.py

import numpy as np
import uuid
from datetime import datetime
from typing import List

class Photo:
    def __init__(self, filename: str, face_encodings: List[np.ndarray], upload_timestamp: str = None):
        self.photo_id = str(uuid.uuid4())  # Unique identifier for the photo
        self.filename = filename
        self.face_encodings = face_encodings
        self.upload_timestamp = upload_timestamp or datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            'photo_id': self.photo_id,
            'filename': self.filename,
            'face_encodings': [enc.tolist() for enc in self.face_encodings],
            'upload_timestamp': self.upload_timestamp
        }
