from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role, require_org
from app.models.target import Target
from app.models.audit_log import AuditLog
from app.schemas.target import TargetCreate, TargetOut, TargetUpdate

router = APIRouter(prefix="/targets", tags=["targets"])


@router.post("", response_model=TargetOut)
def create_target(
    payload: TargetCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    target = Target(org_id=org_id, target_type=payload.target_type, value=payload.value, metadata=payload.metadata or {})
    db.add(target)
    db.add(AuditLog(action="create_target", actor_id=user.id, org_id=org_id, payload={"target": payload.value}))
    db.commit()
    db.refresh(target)
    return target


@router.get("", response_model=list[TargetOut])
def list_targets(
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST", "VIEWER")),
    org_id: str = Depends(require_org),
):
    return db.query(Target).filter(Target.org_id == org_id).all()


@router.put("/{target_id}", response_model=TargetOut)
def update_target(
    target_id: str,
    payload: TargetUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    target = db.query(Target).filter(Target.id == target_id, Target.org_id == org_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(target, field, value)
    db.add(AuditLog(action="update_target", actor_id=user.id, org_id=org_id, payload={"target": target_id}))
    db.commit()
    db.refresh(target)
    return target


@router.delete("/{target_id}")
def delete_target(
    target_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    target = db.query(Target).filter(Target.id == target_id, Target.org_id == org_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target not found")
    db.delete(target)
    db.add(AuditLog(action="delete_target", actor_id=user.id, org_id=org_id, payload={"target": target_id}))
    db.commit()
    return {"status": "deleted"}
