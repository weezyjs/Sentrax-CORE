from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role
from app.models.organization import Organization
from app.models.audit_log import AuditLog
from app.schemas.organization import OrganizationCreate, OrganizationOut, OrganizationUpdate

router = APIRouter(prefix="/orgs", tags=["orgs"])


@router.post("", response_model=OrganizationOut)
def create_org(payload: OrganizationCreate, db: Session = Depends(get_db), user=Depends(require_role("SUPER_ADMIN"))):
    org = Organization(name=payload.name)
    db.add(org)
    db.add(AuditLog(action="create_org", actor_id=user.id, scope="platform", payload={"org": payload.name}))
    db.commit()
    db.refresh(org)
    return org


@router.get("", response_model=list[OrganizationOut])
def list_orgs(db: Session = Depends(get_db), user=Depends(require_role("SUPER_ADMIN"))):
    return db.query(Organization).all()


@router.put("/{org_id}", response_model=OrganizationOut)
def update_org(org_id: str, payload: OrganizationUpdate, db: Session = Depends(get_db), user=Depends(require_role("SUPER_ADMIN"))):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Org not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(org, field, value)
    db.add(AuditLog(action="update_org", actor_id=user.id, scope="platform", payload={"org": org_id}))
    db.commit()
    db.refresh(org)
    return org


@router.delete("/{org_id}")
def delete_org(org_id: str, db: Session = Depends(get_db), user=Depends(require_role("SUPER_ADMIN"))):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Org not found")
    db.delete(org)
    db.add(AuditLog(action="delete_org", actor_id=user.id, scope="platform", payload={"org": org_id}))
    db.commit()
    return {"status": "deleted"}
