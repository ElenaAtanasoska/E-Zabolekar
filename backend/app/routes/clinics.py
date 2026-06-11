from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/clinics", tags=["Clinics"])


@router.post("/", response_model=schemas.ClinicResponse)
def create_clinic(clinic: schemas.ClinicCreate, db: Session = Depends(get_db)):
    return crud.create_clinic(db, clinic)


@router.get("/", response_model=list[schemas.ClinicResponse])
def get_clinics(db: Session = Depends(get_db)):
    return crud.get_clinics(db)