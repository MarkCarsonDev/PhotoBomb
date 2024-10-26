import face_recognition
import os
from os import listdir

folder_directory = r"C:\Users\natef\Desktop\Everything\Programming\Projects\PhotoBomb\photos"
for photos in os.listdir(folder_directory):
    if (photos.endswith(".png")) or (photos.endswith(".jpg") or (photos.endswith)):
        print(images)
    

image = face_recognition.load_image_file("your_file.jpg")
face_locations = face_recognition.face_locations(image)