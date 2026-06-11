from sqlalchemy.orm import Session
from . import models, schemas
from .auth import hash_password, verify_password

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        is_first_login=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user

def get_users(db: Session):
    return db.query(models.User).all()

def create_clinic(db: Session, clinic: schemas.ClinicCreate):
    db_clinic = models.Clinic(**clinic.model_dump())
    db.add(db_clinic)
    db.commit()
    db.refresh(db_clinic)
    return db_clinic

def get_clinics(db: Session):
    return db.query(models.Clinic).all()

def create_doctor(db: Session, doctor: schemas.DoctorCreate):
    db_doctor = models.Doctor(
        user_id=doctor.user_id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        license_number=doctor.license_number,
        clinic_id=doctor.clinic_id,
        is_admin=doctor.is_admin
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def get_doctors(db: Session):
    return db.query(models.Doctor).all()

def create_patient(db: Session, patient: schemas.PatientCreate):
    data = patient.model_dump()
    db_patient = models.Patient(**data)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def get_patients(db: Session):
    return db.query(models.Patient).all()