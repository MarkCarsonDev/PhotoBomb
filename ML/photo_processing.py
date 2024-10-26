from photo import Photo
import face_recognition
import numpy as np
import pickle
import json
import os
from os import listdir

photo_objects = []

photo_directory = r"C:\Users\natef\Desktop\Everything\Programming\Projects\PhotoBomb\photos\all_photos"
for photo in os.listdir(photo_directory):
    # Check if the file is an image
    if photo.lower().endswith(('.png', '.jpg', '.jpeg')):
        file_path = os.path.join(photo_directory, photo)
        photo = Photo(file_path)
        photo_objects.append(photo)
        
# Accessing photo metadata
embeddings = []
metadata_list = []

for photo in photo_objects:
    # Getting metadata of the photo
    for index in range(len(photo.face_encodings)):
        face_metadata = {'photo_file_name' : photo.metadata['file_name'], 'face_index' : index, 'upload_timestamp' : photo.upload_timestamp}
        metadata_list.append(face_metadata)
    # Getting embeddings of the faces and adding them to the embeddings list
    embeddings.extend(photo.face_encodings)
    
embeddings_array = np.array(embeddings)

# Saving embeddings and metadata to pass into DBSCAN
embeddings_file = 'embeddings.npy'
np.save(embeddings_file, embeddings_array)

metadata_file = 'metadata.json'
with open(metadata_file, 'w') as f:
    json.dump(metadata_list, f)





    
