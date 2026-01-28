from pydantic import BaseModel, EmailStr
from app.schemas.common import BaseSchema


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    org_id: str | None = None


class UserOut(BaseSchema):
    email: EmailStr
    role: str
    org_id: str | None = None
    is_active: bool


class UserUpdate(BaseModel):
    role: str | None = None
    is_active: bool | None = None
