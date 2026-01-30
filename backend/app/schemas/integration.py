from pydantic import BaseModel
from app.schemas.common import BaseSchema


class IntegrationCreate(BaseModel):
    name: str
    integration_type: str
    config: dict | None = None
    secrets: dict | None = None


class IntegrationUpdate(BaseModel):
    name: str | None = None
    config: dict | None = None
    secrets: dict | None = None
    is_active: bool | None = None


class IntegrationOut(BaseSchema):
    name: str
    integration_type: str
    config: dict
    is_active: bool
    last_test_status: str
    org_id: str
