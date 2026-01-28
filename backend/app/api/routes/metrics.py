from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role, require_org
from app.models.finding import Finding
from app.models.connector import Connector
from app.models.alert_rule import AlertRule

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/summary")
def summary(
    db: Session = Depends(get_db),
    user=Depends(require_role("SUPER_ADMIN", "ORG_ADMIN", "ANALYST", "VIEWER")),
    org_id: str = Depends(require_org),
):
    findings_count = db.query(Finding).filter(Finding.org_id == org_id).count()
    connectors_count = db.query(Connector).filter(Connector.org_id == org_id).count()
    alert_rules_count = db.query(AlertRule).filter(AlertRule.org_id == org_id).count()
    return {
        "findings": findings_count,
        "connectors": connectors_count,
        "alert_rules": alert_rules_count,
    }
