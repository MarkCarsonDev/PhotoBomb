import face_recognition
import numpy as np
from models.photo import Photo
from typing import List

def process_photo(image_data: bytes, filename: str) -> Photo:
    import io
    from PIL import Image

    # Load the image from bytes
    image = Image.open(io.BytesIO(image_data))
    image = image.convert('RGB')  # Ensure the image is in RGB format
    image_array = np.array(image)

    # Detect face locations
    face_locations = face_recognition.face_locations(image_array, model='hog')

    # Extract face encodings
    face_encodings = face_recognition.face_encodings(image_array, face_locations)

    # Create a Photo object
    photo = Photo(filename=filename, face_encodings=face_encodings)

    return photo
