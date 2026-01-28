from pydantic import BaseModel
from app.schemas.common import BaseSchema


class ConnectorCreate(BaseModel):
    name: str
    connector_type: str
    config: dict | None = None
    secrets: dict | None = None


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
