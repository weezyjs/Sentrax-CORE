from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role, require_org
from app.models.integration import Integration
from app.models.audit_log import AuditLog
from app.schemas.integration import IntegrationCreate, IntegrationOut, IntegrationUpdate
from app.services.integrations import INTEGRATION_HANDLERS
from app.utils.secrets import encrypt_secrets

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.post("", response_model=IntegrationOut)
def create_integration(
    payload: IntegrationCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    integration = Integration(
        org_id=org_id,
        name=payload.name,
        integration_type=payload.integration_type,
        config=payload.config or {},
        secrets=encrypt_secrets(payload.secrets),
    )
    db.add(integration)
    db.add(AuditLog(action="create_integration", actor_id=user.id, org_id=org_id, payload={"integration": payload.name}))
    db.commit()
    db.refresh(integration)
    return integration


@router.get("", response_model=list[IntegrationOut])
def list_integrations(
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST", "VIEWER")),
    org_id: str = Depends(require_org),
):
    return db.query(Integration).filter(Integration.org_id == org_id).all()


@router.put("/{integration_id}", response_model=IntegrationOut)
def update_integration(
    integration_id: str,
    payload: IntegrationUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    integration = db.query(Integration).filter(Integration.id == integration_id, Integration.org_id == org_id).first()
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    data = payload.dict(exclude_unset=True)
    if "secrets" in data:
        data["secrets"] = encrypt_secrets(data["secrets"])
    for field, value in data.items():
        setattr(integration, field, value)
    db.add(AuditLog(action="update_integration", actor_id=user.id, org_id=org_id, payload={"integration": integration_id}))
    db.commit()
    db.refresh(integration)
    return integration


@router.delete("/{integration_id}")
def delete_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    integration = db.query(Integration).filter(Integration.id == integration_id, Integration.org_id == org_id).first()
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    db.delete(integration)
    db.add(AuditLog(action="delete_integration", actor_id=user.id, org_id=org_id, payload={"integration": integration_id}))
    db.commit()
    return {"status": "deleted"}


@router.post("/{integration_id}/test")
def test_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    integration = db.query(Integration).filter(Integration.id == integration_id, Integration.org_id == org_id).first()
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    handler = INTEGRATION_HANDLERS.get(integration.integration_type)
    if not handler:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown integration")
    handler(integration.config, integration.secrets, {"message": "DarkWeb Guard test"})
    integration.last_test_status = "success"
    db.commit()
    return {"status": "sent"}
