from sqlalchemy import Column, Integer, String
from app.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    city = Column(String, index=True)
    
    # Inventory details
    total_beds = Column(Integer, default=0)
    available_beds = Column(Integer, default=0)
    icu_beds_total = Column(Integer, default=0)
    icu_beds_available = Column(Integer, default=0)
    ventilators_total = Column(Integer, default=0)
    ventilators_available = Column(Integer, default=0)
    oxygen_cylinders = Column(Integer, default=0)
    blood_units_a_plus = Column(Integer, default=0)
    blood_units_b_plus = Column(Integer, default=0)
    blood_units_o_plus = Column(Integer, default=0)
    blood_units_ab_plus = Column(Integer, default=0)
