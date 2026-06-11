from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from .. import models, schemas, auth
from datetime import datetime
from typing import List

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_new_patient(
    payload: schemas.PatientCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Е-маил адресата веќе постои")

    temp_password = f"{payload.last_name.capitalize()}123"
    new_user = models.User(
        email=payload.email,
        password=auth.hash_password(temp_password),
        role="patient",
        is_first_login=True
    )
    db.add(new_user)
    db.flush() 

    doctor_profile = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.user_id).first()
    if not doctor_profile:
        raise HTTPException(status_code=403, detail="Само доктори можат да регистрираат пациенти")

    last_patient = db.query(models.Patient)\
        .filter(models.Patient.clinic_id == doctor_profile.clinic_id)\
        .order_by(models.Patient.patient_id.desc()).first()
    
    if last_patient and last_patient.file_number and last_patient.file_number.isdigit():
        new_file_num = str(int(last_patient.file_number) + 1)
    else:
        new_file_num = "1001"

    try:
        birth_date_obj = datetime.strptime(payload.birth_date, "%d.%m.%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Невалиден формат на датум. Користете ДД.ММ.ГГГГ")

    new_patient = models.Patient(
        user_id=new_user.user_id,
        doctor_id=doctor_profile.doctor_id,
        clinic_id=doctor_profile.clinic_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        birth_date=birth_date_obj,
        national_id=payload.file_number, 
        file_number=new_file_num,       
        gender=payload.gender,
        phone_number=payload.phone_number,
        email=payload.email,
        blood_type=payload.blood_type,
        emergency_contact_name=payload.emergency_name,
        emergency_contact_surname=payload.emergency_surname,
        emergency_contact_phone=payload.emergency_phone
    )
    db.add(new_patient)
    db.flush()

    fdi_teeth_numbers = [
        18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
        48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
    ]

    for tooth_num in fdi_teeth_numbers:
        default_image_path = f"{tooth_num}.png"
        tooth = models.Tooth(
            patient_id=new_patient.patient_id,
            tooth_number=tooth_num,
            is_missing=False,
            tooth_name=f"Заб {tooth_num}",
            image=default_image_path
        )
        db.add(tooth)

    try:
        db.commit()
        return {
            "message": "Пациентот е успешно регистриран", 
            "temp_password": temp_password,
            "file_number": new_file_num 
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Грешка при запишување: {str(e)}")

@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient_details(
    patient_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    patient = db.query(models.Patient).options(
        joinedload(models.Patient.doctor)
    ).filter(models.Patient.patient_id == patient_id).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Пациентот не е пронајден")
        
    return patient

@router.get("/search/{file_number}", response_model=schemas.PatientOut)
def search_patient_by_file(
    file_number: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    patient = db.query(models.Patient).filter(models.Patient.file_number == file_number).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Пациентот не е пронајден")
    
    return patient

@router.patch("/{patient_id}/indices")
def update_patient_indices(
    patient_id: int, 
    plaque_index: int, 
    bleeding_index: int, 
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Пациентот не е пронајден")
    
    patient.plaque_index = plaque_index
    patient.bleeding_index = bleeding_index
    db.commit()
    return {"message": "Успешно ажурирано"}

@router.patch("/{patient_id}/emergency-contact")
def update_emergency_contact(
    patient_id: int, 
    contact_data: schemas.EmergencyContactUpdate, 
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Пациентот не е пронајден")
    
    patient.emergency_contact_name = contact_data.name
    patient.emergency_contact_surname = contact_data.surname
    patient.emergency_contact_phone = contact_data.phone
    
    db.commit()
    db.refresh(patient)
    return {"message": "Успешно ажурирано", "patient": patient}

@router.patch("/{patient_id}/next-visit")
def update_next_visit(
    patient_id: int, 
    visit_data: schemas.NextVisitUpdate, 
    db: Session = Depends(get_db)
):
    db_patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Пациентот не е пронајден")

    db_patient.next_visit = visit_data.next_visit
    db_patient.next_visit_description = visit_data.next_visit_description
    db.commit()
    db.refresh(db_patient)
    return {
        "message": "Успешно ажурирана наредна посета",
        "next_visit": db_patient.next_visit,
        "next_visit_description": db_patient.next_visit_description
    }

@router.patch("/{patient_id}", response_model=schemas.PatientOut)
def update_patient(
    patient_id: int, 
    patient_data: schemas.PatientUpdate, 
    db: Session = Depends(get_db)
):
    db_patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Пациентот не е пронајден")

    update_data = patient_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_patient, key, value)

    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/medical-conditions/grouped", response_model=List[schemas.GroupedConditionsOut])
def get_all_conditions(db: Session = Depends(get_db)):
    groups = db.query(models.MedicalConditionGroup).all()
    return groups

@router.post("/{patient_id}/conditions")
def save_patient_conditions(
    patient_id: int, 
    condition_ids: List[int], 
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Пациентот не е пронајден")

    db.query(models.PatientConditionJoin).filter(
        models.PatientConditionJoin.patient_id == patient_id
    ).delete()
    
    for c_id in condition_ids:
        new_entry = models.PatientConditionJoin(patient_id=patient_id, condition_id=c_id)
        db.add(new_entry)
    
    db.commit()
    return {"status": "success", "message": "Состојбите се успешно ажурирани"}

@router.get("/{patient_id}/conditions", response_model=List[schemas.ConditionOut])
def get_patient_conditions(patient_id: int, db: Session = Depends(get_db)):
    conditions = db.query(models.MedicalCondition).join(
        models.PatientConditionJoin
    ).filter(
        models.PatientConditionJoin.patient_id == patient_id
    ).all()
    return conditions

@router.get("/allergies/all", response_model=List[schemas.AllergyOut])
def get_all_available_allergies(db: Session = Depends(get_db)):
    return db.query(models.Allergy).order_by(models.Allergy.allergy_name.asc()).all()

@router.get("/{patient_id}/allergies", response_model=List[schemas.AllergyOut])
def get_patient_allergies(patient_id: int, db: Session = Depends(get_db)):
    allergies = db.query(models.Allergy).join(
        models.PatientAllergyJoin
    ).filter(
        models.PatientAllergyJoin.patient_id == patient_id
    ).all()
    return allergies

@router.post("/{patient_id}/allergies")
def sync_patient_allergies(
    patient_id: int, 
    payload: schemas.PatientAllergiesSync, 
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Пациентот не е пронајден")

    db.query(models.PatientAllergyJoin).filter(
        models.PatientAllergyJoin.patient_id == patient_id
    ).delete()

    for name in payload.allergies:
        clean_name = name.strip()
        if not clean_name:
            continue
            
        allergy_obj = db.query(models.Allergy).filter(
            models.Allergy.allergy_name == clean_name
        ).first()
        
        if not allergy_obj:
            allergy_obj = models.Allergy(allergy_name=clean_name)
            db.add(allergy_obj)
            db.flush() 

        new_join = models.PatientAllergyJoin(
            patient_id=patient_id, 
            allergy_id=allergy_obj.allergy_id
        )
        db.add(new_join)

    try:
        db.commit()
        return {"status": "success", "message": "Алергиите се успешно ажурирани"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Грешка при зачувување")
    

@router.get("/{patient_id}/therapies", response_model=List[schemas.PatientTherapyOut])
def get_patient_therapies(patient_id: int, db: Session = Depends(get_db)):
    return db.query(models.PatientTherapy).options(
        joinedload(models.PatientTherapy.therapy)
    ).filter(models.PatientTherapy.patient_id == patient_id).all()

@router.post("/{patient_id}/therapies")
def add_patient_therapy(
    patient_id: int, 
    payload: schemas.PatientTherapyCreate, 
    db: Session = Depends(get_db)
):
    therapy = db.query(models.Therapy).filter(models.Therapy.name == payload.therapy_name).first()
    if not therapy:
        therapy = models.Therapy(name=payload.therapy_name, type=payload.therapy_type)
        db.add(therapy)
        db.flush()

    new_pt = models.PatientTherapy(
        patient_id=patient_id,
        therapy_id=therapy.therapy_id,
        dosage=payload.dosage,
        duration=payload.duration,
        start_date=payload.start_date
    )
    db.add(new_pt)
    db.commit()
    return {"message": "Терапијата е успешно додадена"}

@router.delete("/therapies/{therapy_record_id}")
def delete_patient_therapy(therapy_record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(models.PatientTherapy).filter(models.PatientTherapy.id == therapy_record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Терапијата не е пронајдена")
    
    original_therapy_id = db_record.therapy_id
    db.delete(db_record)
    actual_therapy = db.query(models.Therapy).filter(models.Therapy.therapy_id == original_therapy_id).first()
    if actual_therapy:
        db.delete(actual_therapy)

    db.commit()
    return {"message": "Успешно избришано од двете табели"}

#@router.get("/{id}/treatments", response_model=List[schemas.TreatmentOut])
#def get_patient_treatments(id: int, db: Session = Depends(get_db)):
 #   treatments = db.query(models.Treatment).filter(
  #      models.Treatment.patient_id == id
   # ).order_by(models.Treatment.date_performed.desc()).all()
  #  return treatments

@router.get("/periodontal-sites", response_model=List[schemas.PeriodontalSiteSchema])
def get_periodontal_sites(db: Session = Depends(get_db)):
    return db.query(models.PeriodontalSite).all()

@router.post("/{patient_id}/periodontal-measurements")
def save_periodontal_measurements(
    patient_id: int, 
    payload: schemas.PeriodontalSaveSchema, 
    db: Session = Depends(get_db)
):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.patient_id == patient_id,
        models.Tooth.tooth_number == payload.tooth_id 
    ).first()

    if not tooth:
        raise HTTPException(
            status_code=404, 
            detail=f"Забот со број {payload.tooth_id} не е пронајден за овој пациент."
        )

    record = db.query(models.PeriodontalRecord).filter(
        models.PeriodontalRecord.tooth_id == tooth.tooth_id
    ).first()

    if not record:
        record = models.PeriodontalRecord(
            tooth_id=tooth.tooth_id, 
            bleeding=getattr(payload, 'bleeding', False),
            plaque=getattr(payload, 'plaque', False),
            pus=getattr(payload, 'pus', False),
            tartar=getattr(payload, 'tartar', False)
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    for entry in payload.measurements:
        existing_measurement = db.query(models.PeriodontalMeasurement).filter(
            models.PeriodontalMeasurement.record_id == record.record_id,
            models.PeriodontalMeasurement.site_id == entry.site_id
        ).first()

        if existing_measurement:
            existing_measurement.probing_depth = entry.probing_depth
            existing_measurement.gingival_margin = entry.gingival_margin
        else:
            new_measurement = models.PeriodontalMeasurement(
                record_id=record.record_id,
                site_id=entry.site_id,
                probing_depth=entry.probing_depth,
                gingival_margin=entry.gingival_margin
            )
            db.add(new_measurement)

    db.commit()
    return {"message": "Успешно зачувано", "record_id": record.record_id}


@router.get("/{patient_id}/tooth/{tooth_number}/treatments")
def get_treatments(patient_id: int, tooth_number: int, db: Session = Depends(get_db)):
    # 1. Најди го забот за ТОЧНО тој пациент
    print(f"Барам третмани за пациент {patient_id} и заб со број {tooth_number}")
    tooth = db.query(models.Tooth).filter(
        models.Tooth.patient_id == patient_id,
        models.Tooth.tooth_number == tooth_number
    ).first()
    
    if not tooth:
        raise HTTPException(status_code=404, detail="Заб не е најден")
        
    # 2. Врати ги третманите каде што се совпаѓа И tooth_id И patient_id
    # Ова е заштита од враќање на третмани на туѓи пациенти
    return db.query(models.Treatment).filter(
        models.Treatment.tooth_id == tooth.tooth_id,
        models.Treatment.patient_id == patient_id  # <--- ОВА Е КЛУЧНОТО
    ).all()


@router.get("/{patient_id}/tooth/{tooth_number}/periodontal-measurements", 
            response_model=schemas.PeriodontalResponse) # Use the schema here
def get_periodontal_measurements(patient_id: int, tooth_number: int, db: Session = Depends(get_db)):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.patient_id == patient_id,
        models.Tooth.tooth_number == tooth_number
    ).first()

    if not tooth or not tooth.periodontal_records:
        return {
            "record_details": {
                "bleeding": False, "plaque": False, "pus": False, 
                "tartar": False, "furcation": None, "mobility": None
            },
            "measurements": []
        }

    record = tooth.periodontal_records[-1]
    return {
        "record_details": record, 
        "measurements": record.measurements 
    }

@router.post("/{patient_id}/chart/{tooth_num}/periodontic-flow")
def save_periodontal_flow(
    patient_id: int, 
    tooth_num: int,
    payload: schemas.PeriodontalSaveSchema, 
    db: Session = Depends(get_db)
):
    target_tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_num,
        models.Tooth.patient_id == patient_id
    ).first()

    if not target_tooth:
        raise HTTPException(status_code=404, detail="Tooth number not found for this patient")

    real_id = target_tooth.tooth_id
    db_record = db.query(models.PeriodontalRecord).filter(
        models.PeriodontalRecord.tooth_id == real_id
    ).first()

    if not db_record:
        db_record = models.PeriodontalRecord(tooth_id=real_id)
        db.add(db_record)

    db_record.furcation = payload.furcation
    db_record.mobility = payload.mobility
    db_record.bleeding = payload.bleeding
    db_record.plaque = payload.plaque
    db_record.pus = payload.pus
    db_record.tartar = payload.tartar
    db.flush() 

    for entry in payload.measurements:
        db_measurement = db.query(models.PeriodontalMeasurement).filter(
            models.PeriodontalMeasurement.record_id == db_record.record_id,
            models.PeriodontalMeasurement.site_id == entry.site_id
        ).first()

        if db_measurement:
            db_measurement.probing_depth = entry.probing_depth
            db_measurement.gingival_margin = entry.gingival_margin
        else:
            new_m = models.PeriodontalMeasurement(
                record_id=db_record.record_id,
                site_id=entry.site_id,
                probing_depth=entry.probing_depth,
                gingival_margin=entry.gingival_margin
            )
            db.add(new_m)

    db.commit()
    return {"status": "success", "record_id": db_record.record_id}
