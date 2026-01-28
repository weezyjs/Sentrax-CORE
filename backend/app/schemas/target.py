from pydantic import BaseModel
from app.schemas.common import BaseSchema


class TargetCreate(BaseModel):
    target_type: str
    value: str
    metadata: dict | None = None


class TargetUpdate(BaseModel):
    target_type: str | None = None
    value: str | None = None
    metadata: dict | None = None


class TargetOut(BaseSchema):
    target_type: str
    value: str
    metadata: dict | None = None
    org_id: str
