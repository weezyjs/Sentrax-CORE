from pydantic import BaseModel, validator
from app.schemas.common import BaseSchema

VALID_INTEGRATION_TYPES = {"jira", "o365", "trellix", "webhook"}


class IntegrationCreate(BaseModel):
    name: str
    integration_type: str
    config: dict | None = None
    secrets: dict | None = None

    @validator("integration_type")
    def validate_integration_type(cls, v):
        if v not in VALID_INTEGRATION_TYPES:
            raise ValueError(f"Invalid integration type. Must be one of: {', '.join(sorted(VALID_INTEGRATION_TYPES))}")
        return v


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
