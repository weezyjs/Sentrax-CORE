from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role, require_org
from app.models.finding import Finding
from app.schemas.finding import FindingOut

router = APIRouter(prefix="/findings", tags=["findings"])


@router.get("", response_model=list[FindingOut])
def list_findings(
    severity: str | None = Query(default=None),
    source: str | None = Query(default=None),
    exposure_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST", "VIEWER")),
    org_id: str = Depends(require_org),
):
    query = db.query(Finding).filter(Finding.org_id == org_id)
    if severity:
        query = query.filter(Finding.severity == severity)
    if source:
        query = query.filter(Finding.source == source)
    if exposure_type:
        query = query.filter(Finding.exposure_types.contains([exposure_type]))
    return query.order_by(Finding.created_at.desc()).all()


@router.get("/{finding_id}", response_model=FindingOut)
def get_finding(
    finding_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST", "VIEWER")),
    org_id: str = Depends(require_org),
):
    finding = db.query(Finding).filter(Finding.id == finding_id, Finding.org_id == org_id).first()
    if not finding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")
    return finding
