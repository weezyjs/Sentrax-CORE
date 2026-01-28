from sqlalchemy import Column, String, ForeignKey, JSON, Boolean
from app.models.common import BaseModel


class AlertRule(BaseModel):
    __tablename__ = "alert_rules"
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    recipients = Column(JSON, default=dict)
    filters = Column(JSON, default=dict)
    redaction_policy = Column(JSON, default=dict)
    schedule = Column(String, default="0 */6 * * *")
