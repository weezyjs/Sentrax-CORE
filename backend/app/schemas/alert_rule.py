from pydantic import BaseModel
from app.schemas.common import BaseSchema


class AlertRuleCreate(BaseModel):
    name: str
    recipients: dict
    filters: dict | None = None
    redaction_policy: dict | None = None
    schedule: str | None = None


class AlertRuleUpdate(BaseModel):
    name: str | None = None
    recipients: dict | None = None
    filters: dict | None = None
    redaction_policy: dict | None = None
    schedule: str | None = None
    is_active: bool | None = None


class AlertRuleOut(BaseSchema):
    name: str
    recipients: dict
    filters: dict
    redaction_policy: dict
    schedule: str
    is_active: bool
    org_id: str
