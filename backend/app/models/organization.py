from sqlalchemy import Column, String, Boolean
from app.models.common import BaseModel


class Organization(BaseModel):
    __tablename__ = "organizations"
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
