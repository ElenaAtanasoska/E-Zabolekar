from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/treatments", tags=["Treatments"])

# =====================================================================
# 1. GET ЕНДПОИНТИ ЗА ПОЛНЕЊЕ НА ИНТЕРФЕЈСОТ (Влечење податоци за копчињата)
# =====================================================================


@router.get("/pathologies-lookup", response_model=List[schemas.HierarchicalPathologyResponse])
def get_hierarchical_pathologies(db: Session = Depends(get_db)):
    raw_pathologies = db.query(models.Pathology).all()
    grouped = {}
    for p in raw_pathologies:
        if p.type not in grouped:
            grouped[p.type] = []
        
        # ДОДАЈ ГО line_direction ОВДЕ
        grouped[p.type].append({
            "pathology_id": p.pathology_id, 
            "subtype": p.subtype,
            "line_direction": p.line_direction,
            "color_shade": p.color_shade
        })
    
    return [{"type": main_type, "subtypes": sub_list} for main_type, sub_list in grouped.items()]

@router.get("/materials", response_model=List[schemas.LookupItemResponse])
def get_materials(db: Session = Depends(get_db)):
    """ Ги враќа сите македонски преводи за Материјали (Composite, Ceramic...) """
    return db.query(models.Material).all()

@router.get("/quality", response_model=List[schemas.LookupItemResponse])
def get_quality(db: Session = Depends(get_db)):
    """ Ги враќа опциите за Квалитет (Задоволителен, Сумнивелен...) """
    return db.query(models.Quality).all()

@router.get("/details", response_model=List[schemas.LookupItemResponse])
def get_details(db: Session = Depends(get_db)):
    """ Ги враќа опциите за Детали/Маргини (Прекумерен, Слиен, Кус раб) """
    return db.query(models.Detail).all()

@router.get("/restoration-types", response_model=List[schemas.LookupItemResponse])
def get_restoration_types(db: Session = Depends(get_db)):
    """ Ги враќа видовите реставрации (Пломба, Круна, Ендодонтски третман...) """
    return db.query(models.RestorationType).all()


# =====================================================================
# 2. POST ЕНДПОИНТ ЗА КОМПЛЕТНО ЗАЧУВУВАЊЕ НА КЛИКНАТИОТ ТРЕТМАН
# =====================================================================
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_full_treatment(payload: schemas.TreatmentCreate, db: Session = Depends(get_db)):
    try:
        # Чекор 0: Мапирање на текстуалниот статус од React во соодветниот Python Enum објект
        incoming_status = payload.status.strip() if payload.status else ""

        if incoming_status == "завршено":
            status_enum = models.TreatmentStatus.DONE
        elif incoming_status == "во тек":
            status_enum = models.TreatmentStatus.IN_PROGRESS
        else:
            status_enum = models.TreatmentStatus.SOON

        # Чекор 0.5: Наоѓање на вистинскиот tooth_id преку бројот на забот (tooth_number)
        # Напомена: Провери дали колоната во твојот Tooth модел се вика точно 'tooth_number'
        tooth_obj = db.query(models.Tooth).filter(
             models.Tooth.tooth_number == payload.tooth_id,
             models.Tooth.patient_id == payload.patient_id  # <--- ОВА Е КЛУЧНАТА ИСПРАВКА
          ).first()
        
        if not tooth_obj:
          raise HTTPException(
           status_code=404, 
           detail=f"Забот со број {payload.tooth_id} не е пронајден за овој пациент."
           )

        # Чекор A: Зачувување во главната табела treatments со вистинскиот tooth_id од базата
        db_treatment = models.Treatment(
            patient_id=payload.patient_id,
            tooth_id=tooth_obj.tooth_id,  # Го ставаме ОРИГИНАЛНОТО ID од пронајдениот заб
            title=payload.title if payload.title else "Стоматолошки третман",
            status=status_enum,
            notes=payload.notes
        )
        db.add(db_treatment)
        db.flush()  # Го земаме автоматски генерираното treatment_id

        # Чекор Б: Зачувување на селектираните Патологии
        if payload.pathologies:
            for path_in in payload.pathologies:
                db_manifestation = models.ToothPathologyManifestation(
                    treatment_id=db_treatment.treatment_id,
                    pathology_id=path_in.pathology_id
                )
                db.add(db_manifestation)
                db.flush()

                for s_id in path_in.surface_ids:
                    db_surface_link = models.PathologySurface(
                        manifestation_id=db_manifestation.manifestation_id,
                        surface_id=s_id
                    )
                    db.add(db_surface_link)

        # Чекор В: Зачувување во реставрации (Претворање на ИД-ата во текст од шифрарниците)
        if payload.restoration:
            db_restoration = models.Restoration(
                treatment_id=db_treatment.treatment_id,
                type_id=payload.restoration.type_id,         # Праќаме ID (Integer)
                material_id=payload.restoration.material_id, # Праќаме ID (Integer)
                quality_id=payload.restoration.quality_id,   # Праќаме ID (Integer)
                detail_id=payload.restoration.detail_id      # Праќаме ID (Integer)
            )
            db.add(db_restoration)
            db.flush()  # Ова ќе го генерира restoration_id

            # Врзување на реставрацијата со површините
            for s_id in payload.restoration.surface_ids:
                db_rest_surface = models.RestorationSurface(
                    restoration_id=db_restoration.restoration_id,
                    surface_id=s_id
                )
                db.add(db_rest_surface)

        # Финален упис во базата ако сè помина без грешка
        db.commit()
        return {"status": "success", "message": "Третманот е комплетно зачуван!", "treatment_id": db_treatment.treatment_id}

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        print("\n=== КРИТИЧНА ГРЕШКА ПРИ ЗАЧУВУВАЊЕ ===")
        print(str(e))
        print("=======================================\n")
        raise HTTPException(status_code=500, detail=f"Грешка: {str(e)}")
    
@router.get("/tooth-surfaces", response_model=List[schemas.LookupItemResponse])
def get_tooth_surfaces(db: Session = Depends(get_db)):
    # Базата има surface_id, а шемата очекува id. 
    # Со ова рачно мапирање, ги елиминираме грешките од типот 'missing field'
    results = db.query(models.ToothSurface).all()
    return [{"id": r.surface_id, "name": r.name} for r in results]

@router.delete("/{treatment_id}")
async def delete_treatment(treatment_id: int, db: Session = Depends(get_db)):
    # 1. Пронајди го третманот
    treatment = db.query(models.Treatment).filter(models.Treatment.treatment_id == treatment_id).first()
    
    if not treatment:
        raise HTTPException(status_code=404, detail="Третманот не е пронајден")

    # 2. Избриши го (поради cascade="all, delete-orphan", ова ќе ги избрише и реставрациите/патологиите)
    db.delete(treatment)
    db.commit()
    
    return {"message": "Третманот е успешно избришан"}

@router.get("/{treatment_id}/details", response_model=schemas.TreatmentDetailResponse)
def get_treatment_details(treatment_id: int, db: Session = Depends(get_db)):
    treatment = db.query(models.Treatment).filter(models.Treatment.treatment_id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Третманот не е пронајден")

    # Повлекување на реставрациските податоци
    restoration = db.query(models.Restoration).filter(models.Restoration.treatment_id == treatment_id).first()
    
    # Користете ги точните имиња на релациите од вашите модели
    return {
        "treatment_id": treatment.treatment_id,
        "title": treatment.title,
        "status": treatment.status.value if hasattr(treatment.status, 'value') else treatment.status,
        "date_performed": treatment.date_performed,
        "notes": treatment.notes,
        "diagnosis": "Кариес", 
        "intervention_type": restoration.restoration_type.name if restoration and restoration.restoration_type else None,
        "surfaces": ", ".join([s.surface.name for s in restoration.surfaces]) if restoration and restoration.surfaces else None,
        "material": restoration.material.name if restoration and restoration.material else None,
        "quality_condition": restoration.quality.name if restoration and restoration.quality else None,
        "marginal_adaptation": restoration.detail.name if restoration and restoration.detail else None,
    }


@router.get("/tooth/{tooth_id}", response_model=List[schemas.TreatmentResponse])
def get_treatments_by_tooth(tooth_id: int, db: Session = Depends(get_db)):
    """
    Ги враќа само третманите за конкретен заб (tooth_id).
    """
    # Важно: користиме tooth_id (примарниот клуч од табелата teeth)
    treatments = db.query(models.Treatment).filter(models.Treatment.tooth_id == tooth_id).all()
    
    if not treatments:
        return [] # Враќа празна листа ако нема третмани, наместо грешка
        
    return treatments