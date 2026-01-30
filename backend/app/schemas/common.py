from pydantic import BaseModel
from datetime import datetime


class BaseSchema(BaseModel):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        orm_mode = True
