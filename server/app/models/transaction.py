from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    sender_hospital_id = Column(Integer, ForeignKey("hospitals.id"), index=True)
    receiver_hospital_id = Column(Integer, ForeignKey("hospitals.id"), index=True)
    item_name = Column(String, index=True) # e.g., 'ventilators_available', 'blood_units_a_plus'
    quantity = Column(Integer)
    status = Column(String, default="pending") # 'pending', 'completed', 'cancelled'
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
