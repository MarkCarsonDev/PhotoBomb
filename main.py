from fastapi import FastAPI

app = FastAPI(title="PhotoBomb API")

# Import routers
from routers import users, photos

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(photos.router, prefix="/photos", tags=["photos"])
