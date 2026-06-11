from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import shutil
import os
import uuid
from ..database import get_db
from .. import schemas, models, database
from app.cloudinary_service import upload_image_to_cloudinary

router = APIRouter(prefix="/xrays", tags=["xrays"])

@router.get("/types", response_model=List[schemas.XRayType])
def get_xray_types(db: Session = Depends(database.get_db)):
    return db.query(models.XRayType).all()

@router.post("/types", response_model=schemas.XRayType)
def create_xray_type(xray_type: schemas.XRayTypeCreate, db: Session = Depends(database.get_db)):
    db_type = models.XRayType(name=xray_type.name)
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type

@router.post("/", response_model=schemas.PatientXRay)
async def upload_xray(  
    patient_id: int = Form(...),
    type_id: int = Form(...),
    title: str = Form(...),
    scan_date: date = Form(...),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    
    image_url = await upload_image_to_cloudinary(file)
    
    db_xray = models.PatientXRay(
        patient_id=patient_id,
        type_id=type_id,
        title=title,
        image_url=image_url, 
        notes=notes,
        scan_date=scan_date
    )
    db.add(db_xray)
    db.commit()
    db.refresh(db_xray)
    return db_xray

@router.get("/")
def get_xrays(patient_id: int, type_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.PatientXRay).filter(models.PatientXRay.patient_id == patient_id)
    if type_id:
        query = query.filter(models.PatientXRay.type_id == type_id)
    return query.all()

@router.put("/{xray_id}/notes", response_model=schemas.PatientXRayNotesUpdate)
def update_xray_notes(
    xray_id: int,
    notes_update: schemas.PatientXRayNotesUpdate, 
    db: Session = Depends(get_db)
):
    db_xray = db.query(models.PatientXRay).filter(models.PatientXRay.id == xray_id).first()
    if not db_xray:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Снимката со ID {xray_id} не е пронајдена."
        )
    db_xray.notes = notes_update.notes
    try:
        db.commit()
        db.refresh(db_xray) 
    except Exception as e:
        db.rollback()
        print(f"Грешка при зачувување на белешките во база: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Настана грешка при зачувување на белешките во базата на податоци."
        )

    return {"notes": db_xray.notes}