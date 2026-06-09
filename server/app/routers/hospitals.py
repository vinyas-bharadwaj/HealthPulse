from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import database, models, schemas, oauth2

router = APIRouter(prefix="/hospitals", tags=["hospitals"])

@router.post("/", response_model=schemas.hospital.Hospital, status_code=status.HTTP_201_CREATED)
def create_hospital(hospital: schemas.hospital.HospitalCreate, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    db_hospital = models.hospital.Hospital(**hospital.model_dump())
    db.add(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

@router.get("/", response_model=List[schemas.hospital.Hospital])
def get_hospitals(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    hospitals = db.query(models.hospital.Hospital).offset(skip).limit(limit).all()
    return hospitals

@router.get("/{hospital_id}", response_model=schemas.hospital.Hospital)
def get_hospital(hospital_id: int, db: Session = Depends(database.get_db)):
    hospital = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")
    return hospital

@router.put("/{hospital_id}", response_model=schemas.hospital.Hospital)
def update_hospital(hospital_id: int, hospital_update: schemas.hospital.HospitalUpdate, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    db_hospital = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == hospital_id).first()
    if not db_hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")
    
    update_data = hospital_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_hospital, key, value)
    
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

@router.delete("/{hospital_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hospital(hospital_id: int, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    db_hospital = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == hospital_id).first()
    if not db_hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")
    
    db.delete(db_hospital)
    db.commit()
    return None
