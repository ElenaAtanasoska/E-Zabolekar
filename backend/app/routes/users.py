from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)


@router.get("/", response_model=list[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return crud.get_users(db)