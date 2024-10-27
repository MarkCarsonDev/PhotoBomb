import numpy as np

class User:
    def __init__(self, username: str, face_embedding: np.ndarray, known_photos: dict = None, unknown_photos: dict = None):
        self.username = username
        self.face_embedding = face_embedding
        self.known_photos = known_photos if known_photos is not None else {}
        self.unknown_photos = unknown_photos if unknown_photos is not None else {}

    def add_known_photo(self, photo_id: str, face_encoding: np.ndarray) -> None:
        # Add the photo directly to known_photos dictionary
        self.known_photos[photo_id] = face_encoding
        # Remove from unknown_photos if it exists there
        self.unknown_photos.pop(photo_id, None)

    def remove_known_photo(self, photo_id: str) -> None:
        # gets rid of a photo from the user's known photos
        self.known_photos.pop(photo_id, None)

    def add_unknown_photo(self, photo_id: str, face_encoding: np.ndarray) -> None:
        # adds a photo to the user's unknown photos
        # only add if it's not already in known or unknown photos
        if photo_id not in self.known_photos and photo_id not in self.unknown_photos:
            self.unknown_photos[photo_id] = face_encoding

    def remove_unknown_photo(self, photo_id: str) -> None:
        # removes a photo from unknown photo
        self.unknown_photos.pop(photo_id, None)

    def confirm_unknown_photo(self, photo_id: str) -> None:
        if photo_id in self.unknown_photos:
            face_encoding = self.unknown_photos.pop(photo_id)
            self.known_photos[photo_id] = face_encoding

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
            'known_photos': {pid: enc.tolist() for pid, enc in self.known_photos.items()},
            'unknown_photos': {pid: enc.tolist() for pid, enc in self.unknown_photos.items()}
        }

    @staticmethod
    def from_dict(data: dict) -> 'User':
        # deserializes the dictionary into a user object
        return User(
            username=data['username'],
            face_embedding=np.array(data['face_embedding']),
            known_photos={pid: np.array(enc) for pid, enc in data.get('known_photos', {}).items()},
            unknown_photos={pid: np.array(enc) for pid, enc in data.get('unknown_photos', {}).items()}
        )
