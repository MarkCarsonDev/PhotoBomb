import firebase
from firebase_admin import credentials, firestore, storage

import os
import numpy as np
import face_recognition
from sklearn.cluster import DBSCAN
from collections import defaultdict
from typing import List, Dict

from photo_loader import load_all_photos_from_firebase
from user_loader import load_all_users_from_firebase
from userclass import User
from photo import Photo

import logging
import pickle
import base64

from google.cloud.firestore import CollectionReference
from google.cloud.firestore_v1.base_query import FieldFilter

import threading
import Server
from Server import *


# Initialize Firestore and set up the callback event
initialize_firebase()
db = firestore.client()

# Callback function to handle changes in Firestore
callback_new_verif_photo = threading.Event()
def new_verif_photo(doc_snapshot, changes, read_time):
    for change in changes:
        doc_data = change.document.to_dict()
        embeddings = doc_data.get("face_embeddings", [])

        # if there are new users
        if doc_data.get("is_verification_photo", False) and len(embeddings) == 0:
            if change.type.name == "ADDED" or change.type.name == "MODIFIED":
                print(f'Document ID: {change.document.id} needs embedding!')
                print(f'Document Data: {doc_data}')
                add_face_embedding(change.document.id, db)
                add_user_face_embedding(doc_data.get("author_uid", None), db)
                
                photo_list = load_all_photos_from_firebase()
                people_clusters = create_people_cluster(photo_list)
                send_predicted_photos_to_users(db, people_clusters) 
                print("Completed embedding.")
    print("Listening to DB.")
                
    callback_new_verif_photo.set()

doc_ref = db.collection("photos")\
    .where("is_verification_photo", "==", True)

doc_watch = doc_ref.on_snapshot(new_verif_photo)



#// - New Non-Verif Photo - //

# Callback function to handle changes in Firestore
callback_new_photo = threading.Event()
def new_photo(doc_snapshot, changes, read_time):
    for change in changes:
        doc_data = change.document.to_dict()
        embeddings = doc_data.get("face_embeddings", [])
    
        

        # if there are new users
        if not doc_data.get("is_verification_photo", False) and len(embeddings) == 0:
            
                    
            if change.type.name == "ADDED" or change.type.name == "MODIFIED":
                print(f'\t Document ID: {change.document.id} needs embedding!\n\tDocument Data: {doc_data}\n\n\t\tRunning new photo embedding:')
                add_face_embedding(change.document.id, db)
                
                photo_list = load_all_photos_from_firebase()
                # people_clusters = create_people_cluster(photo_list)
                # send_predicted_photos_to_users(db, people_clusters) 
                print("Completed embedding.")
    print("Listening to DB.")
                
    callback_new_photo.set()

doc_ref_new = db.collection("photos")\
    .where("is_verification_photo", "==", False)

doc_watch_new = doc_ref_new.on_snapshot(new_photo)











# Keep the program running to listen for changes
try:
    while True:
        # Optionally, you could replace this with input() if you prefer
        pass
except KeyboardInterrupt:
    print("Program interrupted. Stopping the listener.")
