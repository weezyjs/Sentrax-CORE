from pydantic import BaseModel
from app.schemas.common import BaseSchema


class FindingOut(BaseSchema):
    org_id: str
    source: str
    confidence: int
    matched_entity: str
    exposure_types: list[str]
    raw_snippet: str
    severity: str
    dedupe_hash: str
    metadata: dict | None = None


class FindingFilter(BaseModel):
    severity: str | None = None
    source: str | None = None
    exposure_type: str | None = None
