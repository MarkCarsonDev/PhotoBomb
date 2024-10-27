import numpy as np

class User:
    def __init__(self, username: str, face_embedding: np.ndarray, confirmed_photos: dict = None, predicted_photos: dict = None, user_id = int):
        self.username = username
        self.face_embedding = face_embedding
        self.confirmed_photos = confirmed_photos if confirmed_photos is not None else {}
        self.predicted_photos = predicted_photos if predicted_photos is not None else {}
        self.user_id = user_id
        

    def add_confirmed_photo(self, photo_id: str, face_encoding: np.ndarray) -> None:
        # Add the photo directly to known_photos dictionary
        self.confirmed_photos[photo_id] = face_encoding
        # Remove from unknown_photos if it exists there
        self.predicted_photos.pop(photo_id, None)

    def remove_confirmed_photo(self, photo_id: str) -> None:
        # gets rid of a photo from the user's known photos
        self.confirmed_photos.pop(photo_id, None)

    def add_predicted_photo(self, photo_id: str, face_encoding: np.ndarray) -> None:
        # adds a photo to the user's unknown photos
        # only add if it's not already in known or unknown photos
        if photo_id not in self.confirmed_photos and photo_id not in self.predicted_photos:
            self.predicted_photos[photo_id] = face_encoding

    def remove_predicted_photo(self, photo_id: str) -> None:
        # removes a photo from unknown photo
        self.predicted_photos.pop(photo_id, None)

    def confirm_predicted_photo(self, photo_id: str) -> None:
        if photo_id in self.predicted_photos:
            face_encoding = self.predicted_photos.pop(photo_id)
            self.confirmed_photos[photo_id] = face_encoding

    def is_match(self, face_encoding: np.ndarray, tolerance: float = 0.6) -> bool:
        # checks if the embedding matches the user's embedding/face
        distance = np.linalg.norm(self.face_embedding - face_encoding)
        return distance <= tolerance

    def update_face_embedding(self, new_face_embedding: np.ndarray) -> None:
        # updates the user's embedding
        self.face_embedding = new_face_embedding

    def to_dict(self) -> dict:
        # turns the user object into a JSON serializable format
        return {
            'username': self.username,
            'face_embedding': self.face_embedding.tolist(),
            'confirmed_photos': {pid: enc.tolist() for pid, enc in self.confirmed_photos.items()},
            'predicted_photos': {pid: enc.tolist() for pid, enc in self.predicted_photos.items()}
        }

    @staticmethod
    def from_dict(data: dict) -> 'User':
        # deserializes the dictionary into a user object
        return User(
            username=data['username'],
            face_embedding=np.array(data['face_embedding']),
            confirmed_photos={pid: np.array(enc) for pid, enc in data.get('confirmed_photos', {}).items()},
            predicted_photos={pid: np.array(enc) for pid, enc in data.get('predicted_photos', {}).items()}
        )
