from sqlalchemy import Column, String, ForeignKey, JSON, Boolean
from app.models.common import BaseModel


class Connector(BaseModel):
    __tablename__ = "connectors"
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    connector_type = Column(String, nullable=False)
    config = Column(JSON, default=dict)
    secrets = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    last_run_status = Column(String, default="never")
