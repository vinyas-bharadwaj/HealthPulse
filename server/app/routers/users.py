from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import database, models, schemas, oauth2

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=schemas.user.User)
def create_user(user: schemas.user.UserCreate, db: Session = Depends(database.get_db)):
    # Note: Simple plain text password storage for simplicity, DO NOT use in production
    db_user = models.user.User(username=user.username, hashed_password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=schemas.user.User)
def read_users_me(current_user: models.user.User = Depends(oauth2.get_current_user)):
    return current_user
