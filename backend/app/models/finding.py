from sqlalchemy import Column, String, ForeignKey, JSON, Integer
from app.models.common import BaseModel


class Finding(BaseModel):
    __tablename__ = "findings"
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    source = Column(String, nullable=False)
    confidence = Column(Integer, default=50)
    matched_entity = Column(String, nullable=False)
    exposure_types = Column(JSON, default=list)
    raw_snippet = Column(String, nullable=False)
    severity = Column(String, default="low")
    dedupe_hash = Column(String, index=True, nullable=False)
    metadata = Column(JSON, default=dict)
