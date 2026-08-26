from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager 
#from fastapi.staticfiles import StaticFiles 
#import os 

from .routes import auth_routes, users, clinics, doctors, patients, xrays, teeth, treatment
from .database import Base, engine, SessionLocal
from .models import User
from .seed import seed_data 

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            print("--- Базата е празна. Автоматски се извршува seed_data... ---")
            seed_data()
    finally:
        db.close()
    
    yield

app = FastAPI(title="Dental App API", lifespan=lifespan)
#app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "http://68.210.80.49", "http://68.210.89.72"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"], 
)

app.include_router(users.router)
app.include_router(auth_routes.router)
app.include_router(clinics.router)
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(xrays.router)
app.include_router(teeth.router)
app.include_router(treatment.router)

@app.get("/")
def root():
    return {"message": "Dental App API is running with PostgreSQL"}