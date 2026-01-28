from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role, require_org
from app.models.connector import Connector
from app.models.target import Target
from app.models.audit_log import AuditLog
from app.schemas.connector import ConnectorCreate, ConnectorOut, ConnectorUpdate
from app.services.connectors import get_connector
from app.utils.secrets import encrypt_secrets

router = APIRouter(prefix="/connectors", tags=["connectors"])


@router.post("", response_model=ConnectorOut)
def create_connector(
    payload: ConnectorCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    connector = Connector(
        org_id=org_id,
        name=payload.name,
        connector_type=payload.connector_type,
        config=payload.config or {},
        secrets=encrypt_secrets(payload.secrets),
    )
    db.add(connector)
    db.add(AuditLog(action="create_connector", actor_id=user.id, org_id=org_id, payload={"connector": payload.name}))
    db.commit()
    db.refresh(connector)
    return connector


@router.get("", response_model=list[ConnectorOut])
def list_connectors(
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST", "VIEWER")),
    org_id: str = Depends(require_org),
):
    return db.query(Connector).filter(Connector.org_id == org_id).all()


@router.put("/{connector_id}", response_model=ConnectorOut)
def update_connector(
    connector_id: str,
    payload: ConnectorUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    connector = db.query(Connector).filter(Connector.id == connector_id, Connector.org_id == org_id).first()
    if not connector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")
    data = payload.dict(exclude_unset=True)
    if "secrets" in data:
        data["secrets"] = encrypt_secrets(data["secrets"])
    for field, value in data.items():
        setattr(connector, field, value)
    db.add(AuditLog(action="update_connector", actor_id=user.id, org_id=org_id, payload={"connector": connector_id}))
    db.commit()
    db.refresh(connector)
    return connector


@router.delete("/{connector_id}")
def delete_connector(
    connector_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    connector = db.query(Connector).filter(Connector.id == connector_id, Connector.org_id == org_id).first()
    if not connector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")
    db.delete(connector)
    db.add(AuditLog(action="delete_connector", actor_id=user.id, org_id=org_id, payload={"connector": connector_id}))
    db.commit()
    return {"status": "deleted"}


@router.post("/{connector_id}/test")
def test_connector(
    connector_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    connector = db.query(Connector).filter(Connector.id == connector_id, Connector.org_id == org_id).first()
    if not connector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")
    targets = db.query(Target).filter(Target.org_id == org_id).all()
    handler = get_connector(connector.connector_type)
    handler.fetch(targets, {**connector.config, "org_id": org_id}, connector.secrets)
    return {"status": "ok"}
