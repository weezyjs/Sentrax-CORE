from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse, BootstrapSuperAdmin
from app.core.security import verify_password, create_access_token, hash_password
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user.id, "role": user.role, "org_id": user.org_id})
    return TokenResponse(access_token=token, role=user.role, org_id=user.org_id)


@router.post("/bootstrap-super-admin", response_model=TokenResponse)
def bootstrap_super_admin(payload: BootstrapSuperAdmin, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.query(User).filter(User.role == "SUPER_ADMIN").first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Super admin already exists")
    user = User(email=payload.email, hashed_password=hash_password(payload.password), role="SUPER_ADMIN")
    db.add(user)
    db.add(AuditLog(action="bootstrap_super_admin", actor_id=user.id, scope="platform"))
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.id, "role": user.role, "org_id": user.org_id})
    return TokenResponse(access_token=token, role=user.role, org_id=user.org_id)
