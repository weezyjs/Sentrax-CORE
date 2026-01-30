from pydantic import BaseModel, validator
from app.schemas.common import BaseSchema

VALID_CONNECTOR_TYPES = {"demo", "hibp", "dehashed", "generic_rest", "rss", "public_paste"}


class ConnectorCreate(BaseModel):
    name: str
    connector_type: str
    config: dict | None = None
    secrets: dict | None = None

    @validator("connector_type")
    def validate_connector_type(cls, v):
        if v not in VALID_CONNECTOR_TYPES:
            raise ValueError(f"Invalid connector type. Must be one of: {', '.join(sorted(VALID_CONNECTOR_TYPES))}")
        return v


class ConnectorUpdate(BaseModel):
    name: str | None = None
    config: dict | None = None
    secrets: dict | None = None
    is_active: bool | None = None


class ConnectorOut(BaseSchema):
    name: str
    connector_type: str
    config: dict
    is_active: bool
    last_run_status: str
    org_id: str
