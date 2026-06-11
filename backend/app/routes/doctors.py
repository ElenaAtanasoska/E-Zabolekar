from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..models import Doctor, User, Patient
from ..database import get_db
from .. import schemas, crud
from fastapi import HTTPException

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.post("/", response_model=schemas.DoctorResponse)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    return crud.create_doctor(db, doctor)


@router.get("/", response_model=list[schemas.DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    return crud.get_doctors(db)

@router.get("/list")
def get_doctors(db: Session = Depends(get_db)):
    # и во табелата Doctor има is_admin = False
    doctors = db.query(Doctor).join(User).filter(
        User.role == "doctor", 
        Doctor.is_admin == False
    ).all()
    
    return [{"id": d.doctor_id, "name": f"{d.first_name} {d.last_name}", "email": d.user.email} for d in doctors]

@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    # 1. Најди го докторот што се брише
    doctor_to_delete = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    
    if not doctor_to_delete:
        raise HTTPException(status_code=404, detail="Докторот не е пронајден")
    
    user_id_to_delete = doctor_to_delete.user_id
    
    if doctor_to_delete.is_admin:
        raise HTTPException(status_code=400, detail="Не може да се избрише главниот админ.")

    # 2. Најди го админот (за префрлање на пациентите)
    admin_doctor = db.query(Doctor).filter(Doctor.is_admin == True).first()
    
    try:
        # 3. Префрлање на сите пациенти кај админот
        db.query(Patient).filter(Patient.doctor_id == doctor_id).update(
            {"doctor_id": admin_doctor.doctor_id}
        )
        
        # 4. Бришење на докторот 
        # Бидејќи имаш ForeignKey со ondelete="CASCADE" кон User, 
        # со бришење на 'doctor_to_delete', базата ќе го избрише и корисникот.
        db.delete(doctor_to_delete)

        user_to_delete = db.query(User).filter(User.user_id == user_id_to_delete).first()
        if user_to_delete:
            db.delete(user_to_delete)
        
        db.commit()
        return {"message": "Докторот е успешно избришан, а неговите пациенти се префрлени кај админот."}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Грешка при операцијата: {str(e)}")