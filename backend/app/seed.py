import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base 
from app.models import User, Clinic, Doctor, Allergy, Detail, Material, MedicalConditionGroup, MedicalCondition, Quality, RestorationType, ToothSurface, Pathology
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def seed_data():
    db = SessionLocal()
    try:
        clinic = db.query(Clinic).first()
        if not clinic:
            clinic = Clinic(
                name="Првична Конфигурација",
                location="Град",
                address="Адреса",
                is_configured=False 
            )
            db.add(clinic)
            db.commit()
            db.refresh(clinic)
            print("--- Креирана привремена клиника ---")

        admin_user = db.query(User).filter(User.role == "admin").first()
        
        if not admin_user:
            hashed_pw = pwd_context.hash("admin123")
            new_admin = User(
                email="admin@setup.com",
                password=hashed_pw,
                role="admin",
                is_first_login=True
            )
            db.add(new_admin)
            db.flush() 
            new_doctor_profile = Doctor(
                user_id=new_admin.user_id,
                first_name="Главен",
                last_name="Администратор",
                license_number="0000",
                phone_number="078000000",
                clinic_id=clinic.clinic_id,
                is_admin=True 
            )
            db.add(new_doctor_profile)
            db.commit()
            print("--- Креиран главен администратор и докторски профил (admin@setup.com) ---")
        else:
            print("--- Администраторот веќе постои во базата ---")


        if db.query(Allergy).count() == 0:
            allergy_names = [
                "Пеницилин", "Амоксицилин", "Цефалоспорини", "Клиндамицин", 
                "Еритромицин", "Сулфонамиди / Сулфа лекови", "Локални анестетици", 
                "Аспирин", "Ибупрофен", "Кодеин", "Наркотични аналгетици", 
                "Латекс", "Никел", "Акрилати", "Евгенол", "Копал / Смолни лакови", 
                "Берилиум / Хром", "Јод", "Флуор", "Бои и конзерванси", 
                "Јаткасти плодови / Кикирики", "Овошје", "Полен", "Прашина", 
                "Животни", "Восок"
            ]
            
            allergies_to_add = [Allergy(allergy_name=name) for name in allergy_names]
            db.add_all(allergies_to_add)
            db.commit()
            print(f"--- Успешно додадени {len(allergies_to_add)} алергии во базата ---")
        else:
            print("--- Табелата за алергии веќе содржи податоци, се прескокнува ---")

        
        if db.query(Detail).count() == 0:
            details_to_add = [
                Detail(name="Прекумерен раб (Overhang)"),
                Detail(name="Слиен раб (Flush)"),
                Detail(name="Краток раб (Shortfall)"),
                Detail(name="Екстирпација / Пулпектомија (Вадење на живец)"),
                Detail(name="Обтурација на канали (Трајно полнење на канали)")
            ]
            
            db.add_all(details_to_add)
            db.commit()
            print("--- Успешно додадени 5 записи во табелата details ---")
        else:
            print("--- Табелата details веќе содржи податоци, се прескокнува ---")

        
        if db.query(Material).count() == 0:
            materials_to_add = [
                Material(name="Композит (Бела пломба)"),
                Material(name="Амалгам (Црна пломба)"),
                Material(name="Керамика (Порцелан)"),
                Material(name="Злато"),
                Material(name="Неблагороден метал"),
                Material(name="Привремен материјал"),
                Material(name="Глас-јономерен цемент (GIC)")
            ]
            
            db.add_all(materials_to_add)
            db.commit()
            print("--- Успешно додадени 7 записи во табелата materials ---")
        else:
            print("--- Табелата materials веќе содржи податоци, се прескокнува ---")

        
        if db.query(MedicalConditionGroup).count() == 0:
            groups_to_add = [
                MedicalConditionGroup(group_name="Кардиоваскуларни"),
                MedicalConditionGroup(group_name="Ендокрини и хронични болести"),
                MedicalConditionGroup(group_name="Респираторни нарушувања"),
                MedicalConditionGroup(group_name="Системски и имунолошки состојби"),
                MedicalConditionGroup(group_name="Друго")
            ]
            
            db.add_all(groups_to_add)
            db.commit()
            print("--- Успешно додадени 5 записи во табелата medical_condition_groups ---")
        else:
            print("--- Табелата medical_condition_groups веќе содржи податоци, се прескокнува ---")

        
        if db.query(MedicalCondition).count() == 0:
            conditions_data = [
                ("Висок крвен притисок", 1), ("Ангина пекторис / Болка во градите", 1), 
                ("Срцев удар", 1), ("Неправилен срцев ритам", 1), ("Операција на срце", 1),
                ("Срцева слабост", 1), ("Оштетен срцев залисток", 1), ("Висок холестерол", 1),
                ("Инфекција на срцето", 1), ("Абнормално крварење", 1), ("Продолжено крварење", 1),
                ("Дијабетес", 2), ("Проблем со тироидната жлезда", 2), ("Бубрежно нарушување", 2),
                ("Дијализа", 2), ("Болест на црниот дроб", 2), ("Хепатитис", 2), ("Чир на желудникот", 2),
                ("Астма", 3), ("Емфизем / Бронхитис", 3), ("Отежнато дишење", 3),
                ("Артритис", 4), ("Сјогренов синдром", 4), ("Остеопороза", 4), ("Рак / Карцином", 4),
                ("Третман на рак", 4), ("ХИВ позитивен / СИДА", 4), ("Сексуално пренослива болест", 4),
                ("Глауком", 4), ("Оштетен вид", 4), ("Оштетен слух", 4),
                ("Кодеин / Наркотици", 5), ("Аспирин / Ибупрофен", 5), ("Претходна употреба на стероиди", 5),
                ("Забавено заздравување", 5), ("Бременост", 5), ("Доење", 5),
                ("Употреба на тутун", 5), ("Употреба на алкохол", 5), ("Употреба на рекреативни дроги", 5)
            ]
            
            conditions_to_add = [
                MedicalCondition(condition_name=name, group_id=gid) 
                for name, gid in conditions_data
            ]
            
            db.add_all(conditions_to_add)
            db.commit()
            print(f"--- Успешно додадени {len(conditions_to_add)} медицински состојби ---")
        else:
            print("--- Табелата medical_conditions веќе содржи податоци, се прескокнува ---")

        
        if db.query(Quality).count() == 0:
            qualities_to_add = [
                Quality(name="Задоволителен"),
                Quality(name="Потребна е мала корекција/полирање"),
                Quality(name="Незадоволителен (За замена)")
            ]
            
            db.add_all(qualities_to_add)
            db.commit()
            print("--- Успешно додадени 3 записи во табелата quality ---")
        else:
            print("--- Табелата quality веќе содржи податоци, се прескокнува ---")

        
        if db.query(RestorationType).count() == 0:
            restoration_types_to_add = [
                RestorationType(name="Пломба"),
                RestorationType(name="Инлеј"),
                RestorationType(name="Онлеј"),
                RestorationType(name="Делумна круна"),
                RestorationType(name="Круна"),
                RestorationType(name="Фасети"),
                RestorationType(name="Заштитна гума / Сплинт (Night Guard)"),
                RestorationType(name="Екстракција"),
                RestorationType(name="Ендодонтски третман"),
                RestorationType(name="Професионално чистење и полирање"),
                RestorationType(name="Белење на заби"),
                RestorationType(name="Внатрешно белење"),
                RestorationType(name="Хируршка екстракција"),
                RestorationType(name="Ортодонтски третман")
            ]
            
            db.add_all(restoration_types_to_add)
            db.commit()
            print(f"--- Успешно додадени {len(restoration_types_to_add)} записи во restoration_types ---")
        else:
            print("--- Табелата restoration_types веќе содржи податоци, се прескокнува ---")

        
        if db.query(ToothSurface).count() == 0:
            surfaces_to_add = [
                ToothSurface(name="Мезијално"),
                ToothSurface(name="Оклузално"),
                ToothSurface(name="Дистално"),
                ToothSurface(name="Букално"),
                ToothSurface(name="Палатално"),
                ToothSurface(name="Цервикално-букално"),
                ToothSurface(name="Цервикално-палатално"),
                ToothSurface(name="Мезио-букално врвче"),
                ToothSurface(name="Дисто-букално врвче"),
                ToothSurface(name="Мезио-палатално врвче"),
                ToothSurface(name="Дисто-палатално врвче")
            ]
            
            db.add_all(surfaces_to_add)
            db.commit()
            print(f"--- Успешно додадени {len(surfaces_to_add)} записи во tooth_surfaces ---")
        else:
            print("--- Табелата tooth_surfaces веќе содржи податоци, се прескокнува ---")

       
        if db.query(Pathology).count() == 0:
            pathology_data = [
                ("Кариес", None, None, None),
                ("Фрактура", "Фрактура на круна", None, "хоризонтално"),
                ("Фрактура", "Фрактура на круна", None, "вертикално"),
                ("Фрактура", "Фрактура на корен", None, "хоризонтално"),
                ("Фрактура", "Фрактура на корен", None, "вертикално"),
                ("Трошење", "Абразија (механичко трошење)", None, None),
                ("Трошење", "Атриција (контакт заб со заб)", None, None),
                ("Трошење", "Ерозија (хемиско трошење)", None, None),
                ("Дисколорација", "Екстринзична", "Сива", None),
                ("Дисколорација", "Екстринзична", "Црвена", None),
                ("Дисколорација", "Екстринзична", "Жолта", None),
                ("Дисколорација", "Интринзична", "Сива", None),
                ("Дисколорација", "Интринзична", "Црвена", None),
                ("Дисколорација", "Интринзична", "Жолта", None),
                ("Дисколорација", "Ендодонтска", "Сива", None),
                ("Дисколорација", "Ендодонтска", "Црвена", None),
                ("Дисколорација", "Ендодонтска", "Жолта", None),
                ("Апикален процес", "Гранулом", None, None),
                ("Апикален процес", "Циста", None, None),
                ("Апикален процес", "Апсцес", None, None),
                ("Развојно нарушување", "Хипоплазија", None, None),
                ("Развојно нарушување", "Анодонција/Хиподонција", None, None),
                ("Развојно нарушување", "Микродонција", None, None),
                ("Развојно нарушување", "Импактиран заб", None, None),
                ("Заостанат корен", "Супрагингивален", None, None),
                ("Заостанат корен", "Субгингивален", None, None)
            ]
            
            pathologies_to_add = [
                Pathology(
                    type=t, 
                    subtype=st, 
                    color_shade=cs, 
                    line_direction=ld
                ) for t, st, cs, ld in pathology_data
            ]
            db.add_all(pathologies_to_add)
            db.commit()
            print(f"--- Успешно додадени {len(pathologies_to_add)} записи во pathology ---")
        else:
            print("--- Табелата pathology веќе содржи податоци, се прескокнува ---")

    except Exception as e:
        db.rollback()
        print(f"Грешка при полнење на базата: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()