import os
import numpy as np
from face_recognition import api
from sklearn.cluster import DBSCAN
from collections import defaultdict

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
<<<<<<< Updated upstream

db = DBSCAN(eps=0.6, min_samples=2, metric="euclidean").fit(all_encodings)
labels = db.labels_
=======
all_paths = known_paths + unknown_paths

# Run DBSCAN on all encodings
dbscan = DBSCAN(eps=0.6, min_samples=1, metric="euclidean").fit(all_encodings)
labels = dbscan.labels_

# Organize clusters by unique faces
face_clusters = defaultdict(set)
>>>>>>> Stashed changes

for idx, label in enumerate(labels):
    if label != -1:  # Exclude noise points
        image_path = all_paths[idx]
        face_clusters[label].add(image_path)

# Display clusters
for label, images in face_clusters.items():
    print(f"Cluster {label} (unique face):")
    for image_path in images:
        print(f"  - {image_path}")

# For unclustered (noise) points
unclustered_images = [all_paths[idx] for idx, label in enumerate(labels) if label == -1]
if unclustered_images:
    print("\nUnclustered faces:")
    for image_path in set(unclustered_images):  # Unique images only
        print(f"  - {image_path}")
