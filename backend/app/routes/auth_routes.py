from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets
import string
from ..database import get_db
from .. import schemas, crud, models, database, auth

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )
    return crud.create_user(db, user)

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
    is_admin_status = False
    f_name, l_name, lic_num, phone_num = "", "", "", ""
    
    if user.doctor:
        is_admin_status = user.doctor.is_admin
        f_name = user.doctor.first_name
        l_name = user.doctor.last_name
        lic_num = user.doctor.license_number
        phone_num = user.doctor.phone_number
    elif user.role == "admin":
        is_admin_status = True
        f_name, l_name = "Главен", "Администратор"

    access_token = auth.create_access_token(
        data={
            "sub": user.email,
            "user_id": user.user_id,
            "role": user.role,
            "is_first_login": user.is_first_login,
            "is_admin": is_admin_status
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role,
        "is_first_login": user.is_first_login,
        "is_admin": is_admin_status,
        "first_name": f_name,
        "last_name": l_name,
        "license_number": lic_num,
        "phone_number": phone_num
    }

@router.get("/doctors/{doctor_id}")
def get_doctor_profile(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Докторот не е пронајден")
    
    return {
        "first_name": doctor.first_name,
        "last_name": doctor.last_name,
        "email": doctor.user.email if doctor.user else "",
        "license_number": doctor.license_number,
        "phone_number": doctor.phone_number,
        "clinic_name": doctor.clinic.name if doctor.clinic else "Непозната ординација"
    }

@router.put("/doctors/{doctor_id}")
def update_doctor_profile(doctor_id: int, updated_data: schemas.DoctorUpdate, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Докторот не е пронајден")

    doctor.first_name = updated_data.first_name
    doctor.last_name = updated_data.last_name
    doctor.phone_number = updated_data.phone_number

    if doctor.user:
        doctor.user.email = updated_data.email

    try:
        db.commit()
        return {"message": "Успешно ажурирано"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/initial-status")
def get_initial_status(db: Session = Depends(get_db)):
    user_count = db.query(models.User).count()
    if user_count == 1:
        first_user = db.query(models.User).first()
        if first_user.is_first_login:
            return {"needs_setup": True, "temp_email": first_user.email, "temp_pass": "admin123"}
    return {"needs_setup": False}

@router.put("/complete-setup")
def complete_setup(data: schemas.AdminSetupRequest, db: Session = Depends(get_db)):
    admin = db.query(models.User).filter(models.User.role == "admin").first()
    if not admin: raise HTTPException(status_code=404, detail="Admin not found")

    admin.email = data.new_email
    admin.password = auth.hash_password(data.new_password)
    admin.is_first_login = False
    admin.role = "doctor"

    if admin.doctor:
        admin.doctor.first_name = data.first_name
        admin.doctor.last_name = data.last_name
        admin.doctor.license_number = data.license_number
        admin.doctor.phone_number = data.phone_number
        admin.doctor.is_admin = True

    clinic = db.query(models.Clinic).first()
    if clinic:
        clinic.name = data.clinic_name
        clinic.location = data.clinic_location
        clinic.address = data.clinic_address
        clinic.is_configured = True

    db.commit()
    return {"message": "Setup completed"}

@router.post("/add-doctor", response_model=schemas.DoctorCreateResponse)
def add_doctor(payload: schemas.DoctorCreateRequest, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user: raise HTTPException(status_code=400, detail="Е-маил е зафатен")

    temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
    new_user = models.User(email=payload.email, password=auth.hash_password(temp_password), role="doctor", is_first_login=True)
    db.add(new_user)
    db.flush()

    new_doctor = models.Doctor(user_id=new_user.user_id, first_name="Нов", last_name="Доктор", license_number="TBD",phone_number="000", clinic_id=1, is_admin=False)
    db.add(new_doctor)
    db.commit()
    return {"message": "Успешно", "temp_password": temp_password}

@router.put("/change-password")
def change_password(
    data: schemas.PasswordChangeRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) 
):
    
    if not auth.verify_password(data.currentPassword, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Тековната лозинка е неточна"
        )

    new_hashed_password = auth.hash_password(data.newPassword)
    
    current_user.password = new_hashed_password
    
    try:
        db.commit()  
        return {"message": "Успешно променета лозинка"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Грешка при зачувување во базата")

@router.put("/complete-doctor-setup")
def complete_doctor_setup(
    data: schemas.DoctorSetupUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    
    user = current_user
    user.password = auth.hash_password(data.new_password)
    user.is_first_login = False
    if hasattr(data, 'email') and data.email:
        user.email = data.email

    if user.doctor:
        user.doctor.first_name = data.first_name
        user.doctor.last_name = data.last_name
        user.doctor.license_number = data.license_number
        user.doctor.phone_number = data.phone_number
    else:
        raise HTTPException(
            status_code=404, 
            detail="Докторскиот профил не е пронајден."
        )

    try:
        db.commit()
        return {"message": "Профилот е успешно ажуриран. Најавете се со новата лозинка."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Грешка при зачувување во базата")