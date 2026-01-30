from sqlalchemy import Column, String, ForeignKey, JSON, Boolean
from app.models.common import BaseModel


class Integration(BaseModel):
    __tablename__ = "integrations"
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    integration_type = Column(String, nullable=False)
    config = Column(JSON, default=dict)
    secrets = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    last_test_status = Column(String, default="never")
