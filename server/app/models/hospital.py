from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    city = Column(String, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
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

    # Graph relationships
    distances_from = relationship("HospitalDistance", foreign_keys="[HospitalDistance.source_hospital_id]", back_populates="source_hospital", cascade="all, delete-orphan")
    distances_to = relationship("HospitalDistance", foreign_keys="[HospitalDistance.target_hospital_id]", back_populates="target_hospital", cascade="all, delete-orphan")


class HospitalDistance(Base):
    __tablename__ = "hospital_distances"

    id = Column(Integer, primary_key=True, index=True)
    source_hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), index=True)
    target_hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), index=True)
    distance = Column(Float)

    source_hospital = relationship("Hospital", foreign_keys=[source_hospital_id], back_populates="distances_from")
    target_hospital = relationship("Hospital", foreign_keys=[target_hospital_id], back_populates="distances_to")
