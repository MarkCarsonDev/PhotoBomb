from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from models.user import User
import numpy as np

router = APIRouter()

# In-memory user storage
users_db = {}

class UserCreateRequest(BaseModel):
    username: str
    face_embedding: List[float]  # List of floats representing the face embedding

@router.post("/register", response_model=dict)
def register_user(user_request: UserCreateRequest):
    if user_request.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists.")

    # Convert the face_embedding list to a numpy array
    face_embedding = np.array(user_request.face_embedding)

    # Create a new User instance
    user = User(username=user_request.username, face_embedding=face_embedding)
    users_db[user.username] = user

    return {"message": f"User '{user.username}' registered successfully."}

@router.get("/{username}", response_model=dict)
def get_user(username: str):
    user = users_db.get(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user.to_dict()
