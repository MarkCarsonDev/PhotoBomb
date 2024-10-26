# import face_recognition
import unittest
import os
import numpy as np
from click.testing import CliRunner

from face_recognition import api
from face_recognition import face_recognition_cli
from face_recognition import face_detection_cli

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
        if face_encodings:
            encodings.append(face_encodings[0])  # Assuming one face per image
            file_paths.append(file_path)
    return encodings, file_paths

known_folder = "photos/known_faces"
unknown_folder = "photos/unknown_faces"

known_encodings, known_paths = get_face_encodings(known_folder)
unknown_encodings, unknown_paths = get_face_encodings(unknown_folder)

all_encodings = known_encodings + unknown_encodings
print(len(all_encodings[0]))
db = DBSCAN(eps=0.5, min_samples=2, metric="euclidean").fit(all_encodings)
labels = db.labels_

clusters = defaultdict(list)
for idx, label in enumerate(labels):
    image_path = known_paths[idx] if idx < len(known_encodings) else unknown_paths[idx - len(known_encodings)]
    clusters[label].append(image_path)

for label, images in clusters.items():
    if label == -1:
        print("Unclustered faces:")
    else:
        print(f"Cluster {label}:")
    for image_path in images:
        print(f"  - {image_path}")
