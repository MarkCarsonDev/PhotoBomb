from fastapi import APIRouter, UploadFile, File, HTTPException
from models.photo import Photo
from models.user import User
from services.face_recognition_service import process_photo
from typing import List
import numpy as np

router = APIRouter()

# In-memory photo storage
photos_db = {}
# Access the users_db from the users module
from routers.users import users_db

@router.post("/upload", response_model=dict)
async def upload_photo(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Invalid image format.")

    # Read the image data
    image_data = await file.read()

    # Process the photo to extract face encodings
    photo = process_photo(image_data, file.filename)
    photos_db[photo.photo_id] = photo

    # Initialize face ID counter
    face_counter = 1

    # Iterate over each face encoding in the photo
    for face_encoding in photo.face_encodings:
        face_id = face_counter
        face_counter += 1

        # Compare with each user in users_db
        for user in users_db.values():
            if user.is_match(face_encoding):
                # Face matches the user
                user.add_known_photo(face_id, face_encoding)
                print(f"Added face ID '{face_id}' from photo '{photo.photo_id}' to known_photos of user '{user.username}'.")
            else:
                # Face does not match; add to unknown_photos
                user.add_unknown_photo(face_id, face_encoding)
                print(f"Added face ID '{face_id}' from photo '{photo.photo_id}' to unknown_photos of user '{user.username}'.")

    return {"message": f"Photo '{photo.photo_id}' uploaded and processed successfully."}

@router.get("/{photo_id}", response_model=dict)
def get_photo(photo_id: str):
    photo = photos_db.get(photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found.")

    return photo.to_dict()
