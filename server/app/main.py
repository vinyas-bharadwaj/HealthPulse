from fastapi import FastAPI
from app import models
from app.database import engine
from app.routers import auth, users, hospitals, transactions, analysis

models.user.Base.metadata.create_all(bind=engine)
# Note: we need to create metadata for hospital too. Let's do it via the Base imported from models
models.hospital.Base.metadata.create_all(bind=engine)
models.transaction.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HealthPulse API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(hospitals.router)
app.include_router(transactions.router)
app.include_router(analysis.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Simple Auth API"}
