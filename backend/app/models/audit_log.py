from sqlalchemy import Column, String, ForeignKey, JSON
from app.models.common import BaseModel


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=True)
    actor_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    payload = Column(JSON, default=dict)
    scope = Column(String, default="tenant")
