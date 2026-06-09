from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app import database, models, oauth2
from app.agent import allocation_agent

router = APIRouter(prefix="/analysis", tags=["analysis"])

class AnalysisRequest(BaseModel):
    news_context: str

class TransactionDetail(BaseModel):
    sender: str
    receiver: str
    item: str
    quantity: int
    reasoning: str

class AnalysisResponse(BaseModel):
    transactions_applied: int
    details: List[TransactionDetail]

@router.post("/reallocate", response_model=AnalysisResponse)
async def analyze_and_reallocate(request: AnalysisRequest, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    hospitals = db.query(models.hospital.Hospital).all()
    hospital_data = []
    for h in hospitals:
        hospital_data.append({
            "id": h.id,
            "name": h.name,
            "city": h.city,
            "available_beds": h.available_beds,
            "icu_beds_available": h.icu_beds_available,
            "ventilators_available": h.ventilators_available,
            "oxygen_cylinders": h.oxygen_cylinders,
            "blood_units_a_plus": h.blood_units_a_plus,
            "blood_units_b_plus": h.blood_units_b_plus,
            "blood_units_o_plus": h.blood_units_o_plus,
            "blood_units_ab_plus": h.blood_units_ab_plus,
        })
    
    prompt = f"""
    Current Hospital Data:
    {hospital_data}
    
    Current News/Context:
    {request.news_context}
    
    Generate transactions to balance resources based on the news.
    """
    
    try:
        result = await allocation_agent.run(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
        
    recommended = result.output.transactions
    
    applied_count = 0
    applied_details = []
    
    for tx in recommended:
        sender = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == tx.sender_hospital_id).first()
        receiver = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == tx.receiver_hospital_id).first()
        
        if sender and receiver and hasattr(sender, tx.item_name):
            current_sender_qty = getattr(sender, tx.item_name)
            current_receiver_qty = getattr(receiver, tx.item_name)
            
            if current_sender_qty >= tx.quantity and tx.quantity > 0:
                # Apply transaction
                setattr(sender, tx.item_name, current_sender_qty - tx.quantity)
                setattr(receiver, tx.item_name, current_receiver_qty + tx.quantity)
                
                # Create transaction log
                db_transaction = models.transaction.Transaction(
                    sender_hospital_id=sender.id,
                    receiver_hospital_id=receiver.id,
                    item_name=tx.item_name,
                    quantity=tx.quantity,
                    status="completed"
                )
                db.add(db_transaction)
                applied_count += 1
                
                applied_details.append(TransactionDetail(
                    sender=sender.name,
                    receiver=receiver.name,
                    item=tx.item_name,
                    quantity=tx.quantity,
                    reasoning=tx.reasoning
                ))
    
    db.commit()
    
    return AnalysisResponse(
        transactions_applied=applied_count,
        details=applied_details
    )
