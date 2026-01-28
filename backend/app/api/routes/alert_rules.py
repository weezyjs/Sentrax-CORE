from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role, require_org
from app.models.alert_rule import AlertRule
from app.models.audit_log import AuditLog
from app.schemas.alert_rule import AlertRuleCreate, AlertRuleOut, AlertRuleUpdate
from app.services.alerts import send_test_alert

router = APIRouter(prefix="/alert-rules", tags=["alert-rules"])


@router.post("", response_model=AlertRuleOut)
def create_alert_rule(
    payload: AlertRuleCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    rule = AlertRule(
        org_id=org_id,
        name=payload.name,
        recipients=payload.recipients,
        filters=payload.filters or {},
        redaction_policy=payload.redaction_policy or {},
        schedule=payload.schedule or "0 */6 * * *",
    )
    db.add(rule)
    db.add(AuditLog(action="create_alert_rule", actor_id=user.id, org_id=org_id, payload={"rule": payload.name}))
    db.commit()
    db.refresh(rule)
    return rule


@router.get("", response_model=list[AlertRuleOut])
def list_alert_rules(
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST", "VIEWER")),
    org_id: str = Depends(require_org),
):
    return db.query(AlertRule).filter(AlertRule.org_id == org_id).all()


@router.put("/{rule_id}", response_model=AlertRuleOut)
def update_alert_rule(
    rule_id: str,
    payload: AlertRuleUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    rule = db.query(AlertRule).filter(AlertRule.id == rule_id, AlertRule.org_id == org_id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(rule, field, value)
    db.add(AuditLog(action="update_alert_rule", actor_id=user.id, org_id=org_id, payload={"rule": rule_id}))
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}")
def delete_alert_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    rule = db.query(AlertRule).filter(AlertRule.id == rule_id, AlertRule.org_id == org_id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    db.delete(rule)
    db.add(AuditLog(action="delete_alert_rule", actor_id=user.id, org_id=org_id, payload={"rule": rule_id}))
    db.commit()
    return {"status": "deleted"}


@router.post("/{rule_id}/test")
def test_alert_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST")),
    org_id: str = Depends(require_org),
):
    rule = db.query(AlertRule).filter(AlertRule.id == rule_id, AlertRule.org_id == org_id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    send_test_alert(rule)
    return {"status": "sent"}
