from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
import enum
from .database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_first_login = Column(Boolean, default=True, nullable=False)
    doctor = relationship("Doctor", back_populates="user", uselist=False)
    patient = relationship("Patient", back_populates="user", uselist=False)

class Clinic(Base):
    __tablename__ = "clinics"
    clinic_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    address = Column(String, nullable=True)
    is_configured = Column(Boolean, default=False)
    doctors = relationship("Doctor", back_populates="clinic")
    patients = relationship("Patient", back_populates="clinic")

class Doctor(Base):
    __tablename__ = "doctors"
    doctor_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    license_number = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    clinic_id = Column(Integer, ForeignKey("clinics.clinic_id"), nullable=False)
    user = relationship("User", back_populates="doctor")
    clinic = relationship("Clinic", back_populates="doctors")
    patients = relationship("Patient", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patient"
    patient_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    image = Column(String, nullable=True)
    file_number = Column(String, unique=True, nullable=False)
    national_id = Column(String, unique=True, nullable=True)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    birth_date = Column(Date, nullable=False)
    blood_type = Column(String, nullable=False)
    last_visit = Column(Date, nullable=True)
    next_visit = Column(Date, nullable=True)
    next_visit_description = Column(String, nullable=True)
    bleeding_index = Column(Integer, nullable=True)
    plaque_index = Column(Integer, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_surname = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)

    clinic_id = Column(Integer, ForeignKey("clinics.clinic_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id", ondelete="SET NULL"), nullable=True)

    user = relationship("User", back_populates="patient")
    clinic = relationship("Clinic", back_populates="patients")
    doctor = relationship("Doctor", back_populates="patients")

    teeth = relationship("Tooth", back_populates="patient")
    conditions = relationship("PatientConditionJoin", back_populates="patient")
    allergies = relationship("PatientAllergyJoin", back_populates="patient")
    therapies = relationship("PatientTherapy", back_populates="patient")
    xrays = relationship("PatientXRay", back_populates="patient", cascade="all, delete-orphan")
    treatments = relationship("Treatment", back_populates="patient", cascade="all, delete-orphan")

class MedicalConditionGroup(Base):
    __tablename__ = "medical_condition_groups"
    group_id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String, nullable=False)
    conditions = relationship("MedicalCondition", back_populates="group")

class MedicalCondition(Base):
    __tablename__ = "medical_conditions"
    condition_id = Column(Integer, primary_key=True, index=True)
    condition_name = Column(String, nullable=False)
    group_id = Column(Integer, ForeignKey("medical_condition_groups.group_id"))
    patients = relationship("PatientConditionJoin", back_populates="condition")
    group = relationship("MedicalConditionGroup", back_populates="conditions")

class Allergy(Base):
    __tablename__ = "allergy"
    allergy_id = Column(Integer, primary_key=True, index=True)
    allergy_name = Column(String, nullable=False)
    patients = relationship("PatientAllergyJoin", back_populates="allergy")

class Therapy(Base):
    __tablename__ = "therapies"
    therapy_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)
    patients = relationship("PatientTherapy", back_populates="therapy")

class XRayType(Base):
    __tablename__ = "xray_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    xrays = relationship("PatientXRay", back_populates="xray_type")

class PatientConditionJoin(Base):
    __tablename__ = "patient_conditions_join"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    condition_id = Column(Integer, ForeignKey("medical_conditions.condition_id"), nullable=False)
    patient = relationship("Patient", back_populates="conditions")
    condition = relationship("MedicalCondition", back_populates="patients")

class PatientAllergyJoin(Base):
    __tablename__ = "patient_allergies_join"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    allergy_id = Column(Integer, ForeignKey("allergy.allergy_id"), nullable=False)
    patient = relationship("Patient", back_populates="allergies")
    allergy = relationship("Allergy", back_populates="patients")

class PatientTherapy(Base):
    __tablename__ = "patienttherapies"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    therapy_id = Column(Integer, ForeignKey("therapies.therapy_id"), nullable=False)
    dosage = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    start_date = Column(Date, server_default=func.current_date())
    patient = relationship("Patient", back_populates="therapies")
    therapy = relationship("Therapy", back_populates="patients")

class PatientXRay(Base):
    __tablename__ = "patient_xrays"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id", ondelete="CASCADE"))
    type_id = Column(Integer, ForeignKey("xray_types.id"))
    title = Column(String(255), nullable=False)
    image_url = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    scan_date = Column(Date, server_default=func.current_date())
    patient = relationship("Patient", back_populates="xrays")
    xray_type = relationship("XRayType", back_populates="xrays")

class ToothSurface(Base):
    __tablename__ = "tooth_surfaces"
    surface_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    restoration_surfaces = relationship("RestorationSurface", back_populates="surface")
    pathology_surfaces = relationship("PathologySurface", back_populates="surface")

class Tooth(Base):
    __tablename__ = "teeth"
    tooth_id = Column(Integer, primary_key=True, index=True)
    tooth_number = Column(Integer, nullable=False)
    tooth_name = Column(String, nullable=True)
    image = Column(String, nullable=True)
    is_missing = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)

    patient = relationship("Patient", back_populates="teeth")
    treatments = relationship("Treatment", back_populates="tooth")
    periodontal_records = relationship("PeriodontalRecord", back_populates="tooth")
    endodontic_tests = relationship("EndodonticTest", back_populates="tooth")
    
class TreatmentStatus(enum.Enum):
    SOON = "наскоро"
    IN_PROGRESS = "во тек"
    DONE = "завршено"

class Treatment(Base):
    __tablename__ = "treatments"
    treatment_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    tooth_id = Column(Integer, ForeignKey("teeth.tooth_id"), nullable=True)
    title = Column(String, nullable=False)
    status = Column(Enum(TreatmentStatus, values_callable=lambda obj: [e.value for e in obj]), 
                    default=TreatmentStatus.DONE, 
                    nullable=False)
    
    date_performed = Column(Date, server_default=func.current_date())
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="treatments")
    tooth = relationship("Tooth", back_populates="treatments")
    pathologies_manifested = relationship("ToothPathologyManifestation", back_populates="treatment", cascade="all, delete-orphan")
    restoration = relationship("Restoration", back_populates="treatment", uselist=False, cascade="all, delete-orphan")

class RestorationType(Base):
    __tablename__ = "restoration_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False) 
    restorations = relationship("Restoration", back_populates="restoration_type")

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False) 
    restorations = relationship("Restoration", back_populates="material")

class Quality(Base):
    __tablename__ = "quality"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  
    restorations = relationship("Restoration", back_populates="quality")

class Detail(Base):
    __tablename__ = "details"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False) 
    restorations = relationship("Restoration", back_populates="detail")

class Restoration(Base):
    __tablename__ = "restorations"

    restoration_id = Column(Integer, primary_key=True, index=True)
    treatment_id = Column(Integer, ForeignKey("treatments.treatment_id"), nullable=True)
    date_done = Column(Date, nullable=True)
    type_id = Column(Integer, ForeignKey("restoration_types.id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    quality_id = Column(Integer, ForeignKey("quality.id"), nullable=True)
    detail_id = Column(Integer, ForeignKey("details.id"), nullable=True)

    treatment = relationship("Treatment", back_populates="restoration")
    restoration_type = relationship("RestorationType", back_populates="restorations")
    material = relationship("Material", back_populates="restorations")
    quality = relationship("Quality", back_populates="restorations")
    detail = relationship("Detail", back_populates="restorations")
    surfaces = relationship("RestorationSurface", back_populates="restoration", cascade="all, delete-orphan")
    
class RestorationSurface(Base):
    __tablename__ = "restoration_surfaces"
    id = Column(Integer, primary_key=True, index=True)
    restoration_id = Column(Integer, ForeignKey("restorations.restoration_id"), nullable=False)
    surface_id = Column(Integer, ForeignKey("tooth_surfaces.surface_id"), nullable=False)

    restoration = relationship("Restoration", back_populates="surfaces")
    surface = relationship("ToothSurface", back_populates="restoration_surfaces")

class Pathology(Base):
    __tablename__ = "pathology"
    pathology_id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=True)
    subtype = Column(String, nullable=True)
    color_shade = Column(String, nullable=True)
    line_direction = Column(String, nullable=True)
    manifestations = relationship("ToothPathologyManifestation", back_populates="pathology")

class ToothPathologyManifestation(Base):
    __tablename__ = "tooth_pathology_manifestation"
    manifestation_id = Column(Integer, primary_key=True, index=True)
    treatment_id = Column(Integer, ForeignKey("treatments.treatment_id"), nullable=False)
    pathology_id = Column(Integer, ForeignKey("pathology.pathology_id"), nullable=False)
    date_detected = Column(Date, server_default=func.current_date())

    treatment = relationship("Treatment", back_populates="pathologies_manifested")
    pathology = relationship("Pathology", back_populates="manifestations")
    surfaces = relationship("PathologySurface", back_populates="manifestation", cascade="all, delete-orphan")

class PathologySurface(Base):
    __tablename__ = "pathology_surfaces"
    id = Column(Integer, primary_key=True, index=True)
    manifestation_id = Column(Integer, ForeignKey("tooth_pathology_manifestation.manifestation_id"), nullable=False)
    surface_id = Column(Integer, ForeignKey("tooth_surfaces.surface_id"), nullable=False)
    manifestation = relationship("ToothPathologyManifestation", back_populates="surfaces")
    surface = relationship("ToothSurface", back_populates="pathology_surfaces")

class PeriodontalRecord(Base):
    __tablename__ = "periodontal_records"
    record_id = Column(Integer, primary_key=True, index=True)
    furcation = Column(String, nullable=True)
    mobility = Column(String, nullable=True)
    bleeding = Column(Boolean, default=False)
    plaque = Column(Boolean, default=False)
    pus = Column(Boolean, default=False)
    tartar = Column(Boolean, default=False)  
    tooth_id = Column(Integer, ForeignKey("teeth.tooth_id"), nullable=False)

    tooth = relationship("Tooth", back_populates="periodontal_records")
    measurements = relationship("PeriodontalMeasurement", back_populates="record")

class PeriodontalSite(Base):
    __tablename__ = "periodontal_sites"
    site_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    measurements = relationship("PeriodontalMeasurement", back_populates="site")

class PeriodontalMeasurement(Base):
    __tablename__ = "periodontal_measurements"
    id = Column(Integer, primary_key=True, index=True)
    probing_depth = Column(Integer, nullable=True)
    gingival_margin = Column(Integer, nullable=True)
    record_id = Column(Integer, ForeignKey("periodontal_records.record_id"), nullable=False)
    site_id = Column(Integer, ForeignKey("periodontal_sites.site_id"), nullable=False)
    record = relationship("PeriodontalRecord", back_populates="measurements")
    site = relationship("PeriodontalSite", back_populates="measurements")

class EndodonticTest(Base):
    __tablename__ = "endodontic_tests"
    test_id = Column(Integer, primary_key=True, index=True)
    test_date = Column(Date, nullable=True)
    electricity_value = Column(Integer, nullable=True)
    heat_result = Column(String, nullable=True)
    heat_detail = Column(String, nullable=True)
    cold_result = Column(String, nullable=True)
    cold_detail = Column(String, nullable=True)
    palpation = Column(String, nullable=True)
    percussion = Column(String, nullable=True)

    tooth_id = Column(Integer, ForeignKey("teeth.tooth_id"), nullable=False)

    tooth = relationship("Tooth", back_populates="endodontic_tests")


