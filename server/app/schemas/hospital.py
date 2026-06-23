from pydantic import BaseModel
from typing import Optional, List

class HospitalBase(BaseModel):
    name: str
    address: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_beds: int = 0
    available_beds: int = 0
    icu_beds_total: int = 0
    icu_beds_available: int = 0
    ventilators_total: int = 0
    ventilators_available: int = 0
    oxygen_cylinders: int = 0
    blood_units_a_plus: int = 0
    blood_units_b_plus: int = 0
    blood_units_o_plus: int = 0
    blood_units_ab_plus: int = 0

class HospitalCreate(HospitalBase):
    pass

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_beds: Optional[int] = None
    available_beds: Optional[int] = None
    icu_beds_total: Optional[int] = None
    icu_beds_available: Optional[int] = None
    ventilators_total: Optional[int] = None
    ventilators_available: Optional[int] = None
    oxygen_cylinders: Optional[int] = None
    blood_units_a_plus: Optional[int] = None
    blood_units_b_plus: Optional[int] = None
    blood_units_o_plus: Optional[int] = None
    blood_units_ab_plus: Optional[int] = None

class Hospital(HospitalBase):
    id: int

    class Config:
        from_attributes = True

class HospitalDistanceBase(BaseModel):
    source_hospital_id: int
    target_hospital_id: int
    distance: float

class HospitalDistanceCreate(HospitalDistanceBase):
    pass

class HospitalDistanceUpdate(BaseModel):
    distance: Optional[float] = None

class HospitalDistance(HospitalDistanceBase):
    id: int

    class Config:
        from_attributes = True
