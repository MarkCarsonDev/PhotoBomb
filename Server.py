# import clustering
# import photo_processing
# import userclass
# import photo

import firebase_admin
from firebase_admin import credentials, firestore

import os
import numpy as np
from face_recognition import api
from sklearn.cluster import DBSCAN
from collections import defaultdict

# Replace with the path to your Firebase service account key
cred = credentials.Certificate("./firebaseConfig.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

user_docs = db.collection('users').stream()

all_photo_docs = db.collection('photos').stream()
for doc in all_photo_docs:

    print(f'{doc.id} => {doc.to_dict()}')

def create_people_cluster(photo_list):
    all_encodings = []
    photo_references = []
    
    for photo in photo_list:
        for encoding in photo.face_encodings:
            all_encodings.append(encoding)
            photo_references.append(photo)

    all_encodings = np.array(all_encodings)

    dbscan = DBSCAN(eps=0.5, min_samples=1, metric="euclidean").fit(all_encodings)
    labels = dbscan.labels_

    people_clusters = defaultdict(list)
    for idx, label in enumerate(labels):
        if label != -1:  
            photo = photo_references[idx]
            if photo.isProfilePhoto and photo.author:
                people_clusters[photo.author].append(photo.file_path)
            else:
                people_clusters[label].append(photo.file_path)
    return people_clusters
    
    #create clusters where each one is a different person
    # there will be list of users
    # There will be list of photos
    # Each photo will be a photo class where the features are the following: class Photo:
    # the output of clustering should be a dictionary where the key is the clusters user and the value is the list of all the clusters photo_ids. 
    # The clusters user can be found by iterating through the photos and seeing if isProfilePhoto is true.
    # If that photo is true then its author becomes the clusters key. If not then skip the cluster and dont add it to the dictionary.
    # return the people cluster dictionary

    # iterate through list of user docs and access their uid and find their user cluster using the uid key. 
viniimage = api.load_image_file(file_path)
markimage = api.load_image_file(file_path)
users = [{ uid: api.face_encodings(viniimage)[0]}, { "uid":get_face_encodings(folder_path)[0]}]

def get_face_encodings(folder_path):
    encodings = []
    file_paths = []
    for file_name in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file_name)
        image = api.load_image_file(file_path)
        face_encodings = api.face_encodings(image)
        for encoding in face_encodings:
            encodings.append(encoding)
            file_paths.append(file_path)  # Associate each encoding with the image path
    return encodings, file_paths

# Paths to known and unknown face folders
known_folder = "photos/known_faces"
unknown_folder = "photos/unknown_faces"

# Get encodings and file paths for both known and unknown images
known_encodings, known_paths = get_face_encodings(known_folder)
unknown_encodings, unknown_paths = get_face_encodings(unknown_folder)

# Combine all encodings and paths
all_encodings = known_encodings + unknown_encodings
all_paths = known_paths + unknown_paths