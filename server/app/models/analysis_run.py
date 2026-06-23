from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(Integer, primary_key=True, index=True)
    high_level_overview = Column(String)
    status = Column(String, default="pending") # 'pending', 'approved', 'declined'
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
