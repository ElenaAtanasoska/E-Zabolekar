from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas, database  

router = APIRouter(
    prefix="/teeth",
    tags=["Teeth"]
)

@router.get("/{tooth_number}/image", response_model=schemas.ToothImageOut)
def get_tooth_image(tooth_number: int, patient_id: int, db: Session = Depends(database.get_db)):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_number,
        models.Tooth.patient_id == patient_id
    ).first()
    if not tooth:
        raise HTTPException(status_code=404, detail="Забот не е пронајден")
    
    return tooth

@router.post("/{tooth_number}/electricity", response_model=schemas.EndodonticTestOut)
def update_electricity_test(
    tooth_number: int, 
    patient_id: int,  
    payload: schemas.ElectricityUpdate, 
    db: Session = Depends(database.get_db)
):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_number,
        models.Tooth.patient_id == patient_id
    ).first()
    if not tooth:
        raise HTTPException(status_code=404, detail="Не е пронајден таков заб за овој пациент")

    test_record = db.query(models.EndodonticTest).filter(
        models.EndodonticTest.tooth_id == tooth.tooth_id
    ).first()

    if test_record:
        test_record.electricity_value = payload.electricity_value
    else:
        test_record = models.EndodonticTest(
            tooth_id=tooth.tooth_id,
            electricity_value=payload.electricity_value
        )
        db.add(test_record)

    try:
        db.commit()
        db.refresh(test_record)
        return test_record
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{tooth_number}/tests", response_model=schemas.EndodonticTestOut)
def get_tooth_tests(
    tooth_number: int, 
    patient_id: int,
    db: Session = Depends(database.get_db)
):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_number,
        models.Tooth.patient_id == patient_id
    ).first()

    if not tooth:
        return {"test_id": 0, "tooth_id": 0, "electricity_value": None}

    test = db.query(models.EndodonticTest).filter(
        models.EndodonticTest.tooth_id == tooth.tooth_id
    ).first()
    
    if not test:
        return {"test_id": 0, "tooth_id": tooth.tooth_id, "electricity_value": None}
    
    return test

@router.post("/{tooth_number}/heat", response_model=schemas.EndodonticTestOut)
def update_heat_test(
    tooth_number: int, 
    patient_id: int, 
    payload: schemas.HeatTestUpdate, 
    db: Session = Depends(database.get_db)
):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_number,
        models.Tooth.patient_id == patient_id
    ).first()

    if not tooth:
        raise HTTPException(status_code=404, detail="Не е пронајден таков заб за овој пациент")

    test_record = db.query(models.EndodonticTest).filter(
        models.EndodonticTest.tooth_id == tooth.tooth_id
    ).first()

    if test_record:
        test_record.heat_result = payload.heat_result
        test_record.heat_detail = payload.heat_detail
    else:
        test_record = models.EndodonticTest(
            tooth_id=tooth.tooth_id,
            heat_result=payload.heat_result,
            heat_detail=payload.heat_detail
        )
        db.add(test_record)

    try:
        db.commit()
        db.refresh(test_record)
        return test_record
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{tooth_number}/palpation", response_model=schemas.EndodonticTestOut)
def update_palpation_test(
    tooth_number: int, 
    patient_id: int, 
    payload: schemas.PalpationUpdate, 
    db: Session = Depends(database.get_db)
):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_number,
        models.Tooth.patient_id == patient_id
    ).first()

    if not tooth:
        raise HTTPException(status_code=404, detail="Забот не е пронајден")

    test_record = db.query(models.EndodonticTest).filter(
        models.EndodonticTest.tooth_id == tooth.tooth_id
    ).first()

    if test_record:
        test_record.palpation = payload.palpation 
    else:
        test_record = models.EndodonticTest(
            tooth_id=tooth.tooth_id,
            palpation=payload.palpation 
        )
        db.add(test_record)

    db.commit()
    db.refresh(test_record)
    return test_record

@router.post("/{tooth_number}/percussion", response_model=schemas.EndodonticTestOut)
def update_percussion_test(
    tooth_number: int, 
    patient_id: int, 
    payload: schemas.PercussionUpdate, 
    db: Session = Depends(database.get_db)
):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_number,
        models.Tooth.patient_id == patient_id
    ).first()
    if not tooth:
        raise HTTPException(status_code=404, detail="Забот не е пронајден")

    test_record = db.query(models.EndodonticTest).filter(
        models.EndodonticTest.tooth_id == tooth.tooth_id
    ).first()

    if test_record:
        test_record.percussion = payload.percussion 
    else:
        test_record = models.EndodonticTest(
            tooth_id=tooth.tooth_id,
            percussion=payload.percussion 
        )
        db.add(test_record)

    db.commit()
    db.refresh(test_record)
    return test_record

@router.post("/{tooth_number}/cold", response_model=schemas.EndodonticTestOut)
def update_cold_test(
    tooth_number: int, 
    patient_id: int, 
    payload: schemas.ColdTestUpdate, 
    db: Session = Depends(database.get_db)
):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_number,
        models.Tooth.patient_id == patient_id
    ).first()

    if not tooth:
        raise HTTPException(status_code=404, detail="Забот не е пронајден")

    test_record = db.query(models.EndodonticTest).filter(
        models.EndodonticTest.tooth_id == tooth.tooth_id
    ).first()

    if test_record:
        test_record.cold_result = payload.cold_result
        test_record.cold_detail = payload.cold_detail
    else:
        test_record = models.EndodonticTest(
            tooth_id=tooth.tooth_id,
            cold_result=payload.cold_result,
            cold_detail=payload.cold_detail
        )
        db.add(test_record)

    try:
        db.commit()
        db.refresh(test_record)
        return test_record
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{tooth_number}/notes")
def update_tooth_notes(
    tooth_number: int, 
    patient_id: int, 
    payload: schemas.ToothNotesUpdate, 
    db: Session = Depends(database.get_db)
):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_number,
        models.Tooth.patient_id == patient_id
    ).first()

    if not tooth:
        raise HTTPException(status_code=404, detail="Забот не е пронајден за овој пациент")

    tooth.notes = payload.notes
    db.commit()
    db.refresh(tooth)
    return {"message": "Белешката е успешно зачувана", "notes": tooth.notes}

@router.get("/{tooth_number}/notes")
def get_tooth_notes(tooth_number: int, patient_id: int, db: Session = Depends(database.get_db)):
    tooth = db.query(models.Tooth).filter(
        models.Tooth.tooth_number == tooth_number,
        models.Tooth.patient_id == patient_id
    ).first()
    if not tooth:
        raise HTTPException(status_code=404, detail="Забот не е пронајден")
    
    return {"notes": tooth.notes}


@router.get("/{tooth_id}/treatments", response_model=list[schemas.TreatmentResponse])
def get_treatments_for_tooth(tooth_id: int, db: Session = Depends(database.get_db)):
    # Бараме третмани кои се поврзани со тој специфичен заб
    treatments = db.query(models.Treatment).filter(models.Treatment.tooth_id == tooth_id).all()
    return treatments

@router.patch("/{tooth_id}/missing")
async def mark_tooth_as_missing(tooth_id: int, db: Session = Depends(database.get_db)):
    # Го наоѓаме забот
    db_tooth = db.query(models.Tooth).filter(models.Tooth.tooth_id == tooth_id).first()
    if not db_tooth:
        raise HTTPException(status_code=404, detail="Забот не е пронајден")
    
    db_tooth.is_missing = True
    db.commit()
    db.refresh(db_tooth)
    return {"message": "Забот е успешно обележан како недостасува"}

@router.get("/{tooth_id}/status", response_model=schemas.ToothMissingStatus)
def get_tooth_status(tooth_id: int, db: Session = Depends(database.get_db)):
    tooth = db.query(models.Tooth).filter(models.Tooth.tooth_id == tooth_id).first()
    if not tooth:
        raise HTTPException(status_code=404, detail="Забот не е пронајден")
    
    return {"is_missing": tooth.is_missing}