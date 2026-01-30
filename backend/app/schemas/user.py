from pydantic import BaseModel, EmailStr, validator
from app.schemas.common import BaseSchema
from app.schemas.auth import _validate_password_strength

VALID_ROLES = {"SUPER_ADMIN", "ORG_ADMIN", "ANALYST", "VIEWER"}


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    org_id: str | None = None

    @validator("role")
    def validate_role(cls, v):
        if v not in VALID_ROLES:
            raise ValueError(f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}")
        return v

    @validator("password")
    def validate_password(cls, v):
        return _validate_password_strength(v)


class UserOut(BaseSchema):
    email: EmailStr
    role: str
    org_id: str | None = None
    is_active: bool


class UserUpdate(BaseModel):
    role: str | None = None
    is_active: bool | None = None

    @validator("role")
    def validate_role(cls, v):
        if v is not None and v not in VALID_ROLES:
            raise ValueError(f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}")
        return v
