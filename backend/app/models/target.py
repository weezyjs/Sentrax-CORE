from sqlalchemy import Column, String, ForeignKey, JSON
from app.models.common import BaseModel


class Target(BaseModel):
    __tablename__ = "targets"
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    target_type = Column(String, nullable=False)
    value = Column(String, nullable=False)
    metadata = Column(JSON, default=dict)
