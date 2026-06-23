from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app import database, models, oauth2
from app.agent import allocation_agent

router = APIRouter(prefix="/analysis", tags=["analysis"])

class AnalysisRequest(BaseModel):
    pass

class TransactionDetail(BaseModel):
    sender: str
    receiver: str
    item: str
    quantity: int

class AnalysisGenerateResponse(BaseModel):
    analysis_id: int
    high_level_overview: str
    transactions: List[TransactionDetail]

class AnalysisActionResponse(BaseModel):
    status: str
    message: str



@router.get("/latest", response_model=AnalysisGenerateResponse)
async def get_latest_analysis(db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    latest = db.query(models.analysis_run.AnalysisRun).order_by(models.analysis_run.AnalysisRun.id.desc()).first()
    if not latest:
        raise HTTPException(status_code=404, detail="No analysis found")
        
    transactions = db.query(models.transaction.Transaction).filter(models.transaction.Transaction.analysis_id == latest.id).all()
    
    tx_details = []
    for tx in transactions:
        sender = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == tx.sender_hospital_id).first()
        receiver = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == tx.receiver_hospital_id).first()
        if sender and receiver:
            tx_details.append(TransactionDetail(
                sender=sender.name,
                receiver=receiver.name,
                item=tx.item_name,
                quantity=tx.quantity
            ))
            
    return AnalysisGenerateResponse(
        analysis_id=latest.id,
        high_level_overview=latest.high_level_overview,
        transactions=tx_details
    )



@router.post("/generate", response_model=AnalysisGenerateResponse)
async def generate_analysis(request: AnalysisRequest, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    hospitals = db.query(models.hospital.Hospital).all()
    hospital_data = []
    for h in hospitals:
        hospital_data.append({
            "id": h.id,
            "name": h.name,
            "city": h.city,
            "latitude": h.latitude,
            "longitude": h.longitude,
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
    
    Generate transactions to balance resources based on the inventory alone.
    """
    
    try:
        result = await allocation_agent.run(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
        
    recommended = result.output.transactions[:5] # Hard limit to 5 to guarantee stability
    
    # Create AnalysisRun
    db_analysis = models.analysis_run.AnalysisRun(
        high_level_overview=result.output.high_level_overview,
        status="pending"
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    pending_details = []
    
    for tx in recommended:
        sender = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == tx.sender_hospital_id).first()
        receiver = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == tx.receiver_hospital_id).first()
        
        if sender and receiver and hasattr(sender, tx.item_name):
            current_sender_qty = getattr(sender, tx.item_name)
            
            if current_sender_qty >= tx.quantity and tx.quantity > 0:
                # Create transaction log (pending)
                db_transaction = models.transaction.Transaction(
                    analysis_id=db_analysis.id,
                    sender_hospital_id=sender.id,
                    receiver_hospital_id=receiver.id,
                    item_name=tx.item_name,
                    quantity=tx.quantity,
                    status="pending"
                )
                db.add(db_transaction)
                
                pending_details.append(TransactionDetail(
                    sender=sender.name,
                    receiver=receiver.name,
                    item=tx.item_name,
                    quantity=tx.quantity
                ))
    
    db.commit()
    
    return AnalysisGenerateResponse(
        analysis_id=db_analysis.id,
        high_level_overview=db_analysis.high_level_overview,
        transactions=pending_details
    )

@router.post("/{analysis_id}/approve", response_model=AnalysisActionResponse)
async def approve_analysis(analysis_id: int, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    analysis = db.query(models.analysis_run.AnalysisRun).filter(models.analysis_run.AnalysisRun.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if analysis.status != "pending":
        raise HTTPException(status_code=400, detail=f"Analysis is already {analysis.status}")
        
    transactions = db.query(models.transaction.Transaction).filter(models.transaction.Transaction.analysis_id == analysis_id).all()
    
    # Materialize transactions
    for tx in transactions:
        if tx.status == "pending":
            sender = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == tx.sender_hospital_id).first()
            receiver = db.query(models.hospital.Hospital).filter(models.hospital.Hospital.id == tx.receiver_hospital_id).first()
            
            if sender and receiver and hasattr(sender, tx.item_name):
                current_sender_qty = getattr(sender, tx.item_name) or 0
                current_receiver_qty = getattr(receiver, tx.item_name) or 0
                
                if current_sender_qty >= tx.quantity:
                    setattr(sender, tx.item_name, current_sender_qty - tx.quantity)
                    setattr(receiver, tx.item_name, current_receiver_qty + tx.quantity)
                    tx.status = "completed"
                else:
                    tx.status = "failed_insufficient_qty"
    
    analysis.status = "approved"
    db.commit()
    
    return AnalysisActionResponse(status="success", message="Analysis approved and transactions applied where possible")

@router.post("/{analysis_id}/decline", response_model=AnalysisActionResponse)
async def decline_analysis(analysis_id: int, db: Session = Depends(database.get_db), current_user: models.user.User = Depends(oauth2.get_current_user)):
    analysis = db.query(models.analysis_run.AnalysisRun).filter(models.analysis_run.AnalysisRun.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if analysis.status != "pending":
        raise HTTPException(status_code=400, detail=f"Analysis is already {analysis.status}")
        
    transactions = db.query(models.transaction.Transaction).filter(models.transaction.Transaction.analysis_id == analysis_id).all()
    
    for tx in transactions:
        tx.status = "declined"
        
    analysis.status = "declined"
    db.commit()
    
    return AnalysisActionResponse(status="success", message="Analysis declined")
