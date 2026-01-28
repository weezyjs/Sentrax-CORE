from pydantic import BaseModel
from app.schemas.common import BaseSchema


class OrganizationCreate(BaseModel):
    name: str


class OrganizationUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None


class OrganizationOut(BaseSchema):
    name: str
    is_active: bool
