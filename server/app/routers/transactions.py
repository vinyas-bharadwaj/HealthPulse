from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import database, models, schemas, oauth2

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/", response_model=schemas.transaction.Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction: schemas.transaction.TransactionCreate, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    # Verify sender and receiver exist
    sender = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == transaction.sender_hospital_id).first()
    receiver = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == transaction.receiver_hospital_id).first()
    
    if not sender or not receiver:
        raise HTTPException(status_code=404, detail="Sender or Receiver hospital not found")
        
    if not hasattr(sender, transaction.item_name) or not hasattr(receiver, transaction.item_name):
        raise HTTPException(status_code=400, detail="Invalid inventory item name")
        
    current_sender_qty = getattr(sender, transaction.item_name)
    current_receiver_qty = getattr(receiver, transaction.item_name)
    
    if current_sender_qty < transaction.quantity:
        raise HTTPException(status_code=400, detail="Not enough inventory in sender hospital")
        
    # Apply transfer immediately
    setattr(sender, transaction.item_name, current_sender_qty - transaction.quantity)
    setattr(receiver, transaction.item_name, current_receiver_qty + transaction.quantity)
        
    db_transaction = models.transaction.Transaction(**transaction.model_dump(), status="completed")
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/", response_model=List[schemas.transaction.Transaction])
def get_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    transactions = db.query(models.transaction.Transaction).offset(skip).limit(limit).all()
    return transactions

@router.get("/{transaction_id}", response_model=schemas.transaction.Transaction)
def get_transaction(transaction_id: int, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    transaction = db.query(models.transaction.Transaction).filter(models.transaction.Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction

@router.put("/{transaction_id}/status", response_model=schemas.transaction.Transaction)
def update_transaction_status(transaction_id: int, transaction_update: schemas.transaction.TransactionUpdate, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    db_transaction = db.query(models.transaction.Transaction).filter(models.transaction.Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
        
    if transaction_update.status:
        db_transaction.status = transaction_update.status
        db.commit()
        db.refresh(db_transaction)
        
    return db_transaction
