from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role
from app.core.security import hash_password
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.user import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/orgs/{org_id}/users", tags=["users"])


@router.post("", response_model=UserOut)
def create_user(
    org_id: str,
    payload: UserCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN")),
):
    if user.role != "SUPER_ADMIN" and user.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Org mismatch")
    new_user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        org_id=org_id,
    )
    db.add(new_user)
    db.add(AuditLog(action="create_user", actor_id=user.id, org_id=org_id, payload={"email": payload.email}))
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("", response_model=list[UserOut])
def list_users(
    org_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN")),
):
    if user.role != "SUPER_ADMIN" and user.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Org mismatch")
    return db.query(User).filter(User.org_id == org_id).all()


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    org_id: str,
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN")),
):
    if user.role != "SUPER_ADMIN" and user.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Org mismatch")
    existing = db.query(User).filter(User.id == user_id, User.org_id == org_id).first()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(existing, field, value)
    db.add(AuditLog(action="update_user", actor_id=user.id, org_id=org_id, payload={"user": user_id}))
    db.commit()
    db.refresh(existing)
    return existing


@router.delete("/{user_id}")
def delete_user(
    org_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN")),
):
    if user.role != "SUPER_ADMIN" and user.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Org mismatch")
    existing = db.query(User).filter(User.id == user_id, User.org_id == org_id).first()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(existing)
    db.add(AuditLog(action="delete_user", actor_id=user.id, org_id=org_id, payload={"user": user_id}))
    db.commit()
    return {"status": "deleted"}
