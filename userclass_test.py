import os
import numpy as np
import face_recognition
from userclass import User  # Ensure the User class code is updated accordingly
import json

photos_directory = r"C:\Users\natef\Desktop\Everything\Programming\Projects\PhotoBomb\photos\all_photos"

# Specify the photo filename to use for the user
user_photo_filename = 'IMG_5401.jpg'  # Replace with your actual filename

# Build the full path to the user photo
user_photo_path = os.path.join(photos_directory, user_photo_filename)

# Check if the file exists
if not os.path.exists(user_photo_path):
    print(f"User photo '{user_photo_filename}' not found in the directory.")
    exit()

# Load and process the user photo
user_image = face_recognition.load_image_file(user_photo_path)
user_face_locations = face_recognition.face_locations(user_image, model='hog')
user_face_encodings = face_recognition.face_encodings(user_image, user_face_locations)

# Check if at least one face was found
if len(user_face_encodings) == 0:
    print(f"No faces found in user photo '{user_photo_filename}'.")
    exit()

# Use the first face encoding as the user's face embedding
user_face_embedding = user_face_encodings[0]
username = 'test_user'

# Create a User instance
user = User(username=username, face_embedding=user_face_embedding)
print(f"Created user '{username}' using photo '{user_photo_filename}' as the face embedding.")

# Initialize dictionaries to store face embeddings with integer IDs
photo_embeddings = {}
face_counter = 1  # Initialize face counter

# Process the rest of the photos
for filename in os.listdir(photos_directory):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        # Skip the user's photo
        if filename == user_photo_filename:
            continue
        file_path = os.path.join(photos_directory, filename)
        image = face_recognition.load_image_file(file_path)
        face_locations = face_recognition.face_locations(image, model='hog')
        face_encodings = face_recognition.face_encodings(image, face_locations)
        photo_id = filename
        for idx, face_encoding in enumerate(face_encodings):
            face_id = face_counter
            face_counter += 1
            photo_embeddings[face_id] = {
                'face_encoding': face_encoding,
                'photo_id': photo_id,
                'face_index': idx,
                'file_path': file_path
            }

# Test User methods
for face_id, data in photo_embeddings.items():
    face_encoding = data['face_encoding']
    photo_id = data['photo_id']
    if user.is_match(face_encoding):
        user.add_known_photo(face_id, face_encoding)
        print(f"Added face ID '{face_id}' from photo '{photo_id}' to known_photos.")
    else:
        user.add_unknown_photo(face_id, face_encoding)
        print(f"Added face ID '{face_id}' from photo '{photo_id}' to unknown_photos.")

# Inspect known and unknown faces
print("\nKnown Faces:")
for face_id in user.known_photos:
    photo_id = photo_embeddings[face_id]['photo_id']
    print(f" - Face ID {face_id} from photo '{photo_id}'")

print("\nUnknown Faces:")
for face_id in user.unknown_photos:
    photo_id = photo_embeddings[face_id]['photo_id']
    print(f" - Face ID {face_id} from photo '{photo_id}'")

# Optional: Confirm an unknown face
if user.unknown_photos:
    unknown_face_id = next(iter(user.unknown_photos))
    user.confirm_unknown_photo(unknown_face_id)
    photo_id = photo_embeddings[unknown_face_id]['photo_id']
    print(f"\nConfirmed unknown face ID '{unknown_face_id}' from photo '{photo_id}'. Moved to known_photos.")

# Print updated lists
print("\nUpdated Known Faces:")
for face_id in user.known_photos:
    photo_id = photo_embeddings[face_id]['photo_id']
    print(f" - Face ID {face_id} from photo '{photo_id}'")

print("\nUpdated Unknown Faces:")
for face_id in user.unknown_photos:
    photo_id = photo_embeddings[face_id]['photo_id']
    print(f" - Face ID {face_id} from photo '{photo_id}'")

# Optional: Save user data
user_data = user.to_dict()
with open('user_data.json', 'w') as f:
    json.dump(user_data, f)
    print("\nUser data saved to 'user_data.json'.")


print(photo_embeddings[1]['face_encoding'])