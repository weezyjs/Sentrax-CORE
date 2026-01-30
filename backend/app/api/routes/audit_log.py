from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogOut

router = APIRouter(prefix="/audit-log", tags=["audit-log"])


@router.get("", response_model=list[AuditLogOut])
def list_audit_log(
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN")),
    x_org_id: str | None = Header(default=None, alias="X-Org-Id"),
):
    if user.role == "SUPER_ADMIN" and not x_org_id:
        return db.query(AuditLog).filter(AuditLog.scope == "platform").order_by(AuditLog.created_at.desc()).all()
    if user.role != "SUPER_ADMIN":
        if x_org_id and x_org_id != user.org_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Org mismatch")
        org_id = user.org_id
    else:
        org_id = x_org_id
    return db.query(AuditLog).filter(AuditLog.org_id == org_id).order_by(AuditLog.created_at.desc()).all()
