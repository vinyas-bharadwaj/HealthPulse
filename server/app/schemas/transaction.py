from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    sender_hospital_id: int
    receiver_hospital_id: int
    item_name: str
    quantity: int

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    status: Optional[str] = None

class Transaction(TransactionBase):
    id: int
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True
