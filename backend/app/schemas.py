from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from typing import List
from enum import Enum

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=50)
    role: str

class UserResponse(BaseModel):
    user_id: int
    email: EmailStr
    role: str
    is_first_login: bool

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: EmailStr
    role: str
    is_first_login: bool
    is_admin: bool = False
    first_name: str  
    last_name: str
    license_number: str
    phone_number: str

class AdminSetupRequest(BaseModel):
    new_email: EmailStr
    new_password: str = Field(..., min_length=6)
    first_name: str  # ДОДАДЕНО
    last_name: str
    license_number: str
    phone_number: str
    clinic_name: str
    clinic_location: str
    clinic_address: str

class ClinicCreate(BaseModel):
    name: str
    location: Optional[str] = None
    address: Optional[str] = None

class ClinicResponse(BaseModel):
    clinic_id: int
    name: str
    location: Optional[str] = None
    address: Optional[str] = None
    is_configured: bool

    class Config:
        from_attributes = True

class DoctorCreate(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    license_number: Optional[str] = None
    phone_number: Optional[str] = None
    clinic_id: int
    is_admin: bool = False

class DoctorResponse(BaseModel):
    doctor_id: int
    user_id: int
    first_name: str
    last_name: str
    license_number: Optional[str] = None
    phone_number: Optional[str] = None
    clinic_id: int
    is_admin: bool
    class Config:
        from_attributes = True


class DoctorCreateRequest(BaseModel):
    email: EmailStr


class DoctorSetupUpdate(BaseModel):
    first_name: str
    last_name: str
    new_password: str = Field(..., min_length=6)
    license_number: str
    phone_number: str

class DoctorCreateResponse(BaseModel):
    message: str
    temp_password: str

class DoctorUpdate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str

    class Config:
        from_attributes = True

class PasswordChangeRequest(BaseModel):
    currentPassword: str
    newPassword: str
    confirmPassword: str

    class Config:
        from_attributes = True

class DoctorSimple(BaseModel):
    doctor_id: int
    first_name: str
    last_name: str

    class Config:
        from_attributes = True

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    birth_date: str
    file_number: str
    gender: str
    phone_number: str
    email: EmailStr
    blood_type: str
    emergency_name: str
    emergency_surname: str
    emergency_phone: str

    class Config:
        from_attributes = True

class PatientOut(BaseModel):
    patient_id: int
    user_id: Optional[int] = None
    clinic_id: int
    doctor_id: int
    doctor: Optional[DoctorSimple] = None
    first_name: str
    last_name: str
    email: str
    phone_number: Optional[str] = None
    gender: str
    birth_date: date  
    blood_type: str
    file_number: str
    national_id: Optional[str] = None 
    image: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_surname: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    last_visit: Optional[date] = None
    next_visit: Optional[date] = None
    next_visit_description: Optional[str] = None
    bleeding_index: Optional[int] = None
    plaque_index: Optional[int] = None

    class Config:
        from_attributes = True

class EmergencyContactUpdate(BaseModel):
    name: str
    surname: str
    phone: str

class NextVisitUpdate(BaseModel):
    next_visit: Optional[date] = None
    next_visit_description: Optional[str] = None

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    blood_type: Optional[str] = None

    class Config:
        from_attributes = True

class ConditionOut(BaseModel):
    condition_id: int
    condition_name: str

    class Config:
        from_attributes = True

class GroupedConditionsOut(BaseModel):
    group_name: str
    conditions: List[ConditionOut]

    class Config:
        from_attributes = True

class AllergyOut(BaseModel):
    allergy_id: int
    allergy_name: str

    class Config:
        from_attributes = True


class PatientAllergiesSync(BaseModel):
    allergies: List[str]

class TherapyBase(BaseModel):
    name: str
    type: Optional[str] = "Останато"

class TherapyOut(TherapyBase):
    therapy_id: int
    class Config:
        from_attributes = True

class PatientTherapyCreate(BaseModel):
    therapy_name: str
    therapy_type: str
    dosage: str
    duration: str
    start_date: Optional[date] = None

class PatientTherapyOut(BaseModel):
    id: int
    dosage: Optional[str]
    duration: Optional[str]
    start_date: Optional[date] = None
    therapy: TherapyOut  

    class Config:
        from_attributes = True

class XRayTypeBase(BaseModel):
    name: str

class XRayTypeCreate(XRayTypeBase):
    pass

class XRayType(XRayTypeBase):
    id: int
    count: Optional[int] = 0 

    class Config:
        from_attributes = True

class PatientXRayBase(BaseModel):
    title: str
    notes: Optional[str] = None
    scan_date: date

class PatientXRayCreate(PatientXRayBase):
    patient_id: int
    type_id: int

class PatientXRay(PatientXRayBase):
    id: int
    image_url: str
    patient_id: int
    type_id: int
    class Config:
        from_attributes = True

class PatientXRayNotesUpdate(BaseModel):
    notes: Optional[str] = None 

    class Config:
        orm_mode = True

class ToothImageOut(BaseModel):
    tooth_number: int
    image: Optional[str] 

    class Config:
        from_attributes = True

class ToothMissingStatus(BaseModel):
    is_missing: bool

    class Config:
        from_attributes = True

class ElectricityUpdate(BaseModel):
    electricity_value: Optional[int] = None  

class HeatTestUpdate(BaseModel):
    heat_result: Optional[str] = None
    heat_detail: Optional[str] = None

class PalpationUpdate(BaseModel):  
    palpation: Optional[str] = None

class PercussionUpdate(BaseModel): 
    percussion: Optional[str] = None

class ColdTestUpdate(BaseModel):
    cold_result: Optional[str] = None  
    cold_detail: Optional[str] = None

class EndodonticTestOut(BaseModel):
    test_id: int
    tooth_id: int
    electricity_value: Optional[int]
    heat_result: Optional[str] = None
    heat_detail: Optional[str] = None
    palpation: Optional[str] = None
    percussion: Optional[str] = None
    cold_result: Optional[str] = None 
    cold_detail: Optional[str] = None

    class Config:
        from_attributes = True

class TreatmentStatus(str, Enum):
    SOON = "Планирано"
    IN_PROGRESS = "Во тек"
    DONE = "Завршено"

class TreatmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TreatmentStatus = TreatmentStatus.DONE
    date_performed: Optional[date] = None
    notes: Optional[str] = None

class RestorationCreate(BaseModel):
    type_id: int                      
    material_id: Optional[int] = None 
    quality_id: Optional[int] = None  
    detail_id: Optional[int] = None   
    surface_ids: List[int] = []       

class PathologyManifestationCreate(BaseModel):
    pathology_id: int
    surface_ids: List[int] = [] 

class TreatmentCreate(BaseModel):
    patient_id: int
    tooth_id: Optional[int] = None  
    title: str
    status: str = "завршено"
    notes: Optional[str] = None
    date_performed: Optional[date] = None 
    pathologies: List[PathologyManifestationCreate] = []
    restoration: Optional[RestorationCreate] = None

    class Config:
        from_attributes = True

class TreatmentOut(BaseModel):
    treatment_id: int
    patient_id: int
    tooth_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    status: str
    notes: Optional[str] = None
    date_performed: date

    class Config:
        from_attributes = True

class TreatmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    date_performed: Optional[date] = None

    class Config:
        from_attributes = True

class PeriodontalSiteSchema(BaseModel):
    site_id: int
    name: str

    class Config:
        from_attributes = True


class MeasurementEntry(BaseModel):
    site_id: int
    probing_depth: Optional[int] = None
    gingival_margin: Optional[int] = None

class PeriodontalSaveSchema(BaseModel):
    tooth_id: int
    furcation: Optional[str] = None
    mobility: Optional[str] = None
    bleeding: bool = False
    plaque: bool = False
    pus: bool = False
    tartar: bool = False
    # Your existing site measurements
    measurements: List[MeasurementEntry]

class MeasurementRead(BaseModel):
    site_id: int
    probing_depth: Optional[int] = 0
    gingival_margin: Optional[int] = 0

    class Config:
        from_attributes = True 


class RecordDetails(BaseModel):
    bleeding: bool
    plaque: bool
    pus: bool
    tartar: bool
    furcation: Optional[str] = None
    mobility: Optional[str] = None

    class Config:
        from_attributes = True

class PeriodontalResponse(BaseModel):
    record_details: RecordDetails
    measurements: List[MeasurementRead]

class LookupItemResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class SubtypeDetail(BaseModel):
    pathology_id: int
    subtype: Optional[str] = None
    line_direction: Optional[str] = None
    color_shade: Optional[str] = None

class HierarchicalPathologyResponse(BaseModel):
    type: str
    subtypes: List[SubtypeDetail]

    class Config:
        from_attributes = True

class ToothNotesUpdate(BaseModel):
    notes: Optional[str] = None

class TreatmentDetailResponse(BaseModel):
    treatment_id: int
    title: str
    status: str
    date_performed: date
    notes: Optional[str] = None
    diagnosis: Optional[str] = None
    intervention_type: Optional[str] = None
    surfaces: Optional[str] = None  
    material: Optional[str] = None
    quality_condition: Optional[str] = None
    marginal_adaptation: Optional[str] = None

    class Config:
        from_attributes = True

class TreatmentResponse(BaseModel):
    treatment_id: int
    title: str
    status: str  
    date_performed: Optional[date] = None

    class Config:
        from_attributes = True