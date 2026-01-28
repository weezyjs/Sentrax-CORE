from app.schemas.common import BaseSchema


class AuditLogOut(BaseSchema):
    org_id: str | None = None
    actor_id: str | None = None
    action: str
    payload: dict
    scope: str
