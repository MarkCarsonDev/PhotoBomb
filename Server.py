import clustering
import photo_processing
import userclass
import photo

import firebase_admin
from firebase_admin import credentials, firestore

# Replace with the path to your Firebase service account key
cred = credentials.Certificate("firebaseConfig.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()
