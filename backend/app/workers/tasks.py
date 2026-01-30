import logging
from celery import shared_task
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.connector import Connector
from app.models.target import Target
from app.models.finding import Finding
from app.models.alert_rule import AlertRule
from app.services.connectors import get_connector
from app.services.alerts import send_alert, send_test_alert

logger = logging.getLogger(__name__)


def _store_findings(db: Session, findings: list[Finding]) -> int:
    stored = 0
    for finding in findings:
        exists = db.query(Finding).filter(Finding.dedupe_hash == finding.dedupe_hash).first()
        if exists:
            continue
        db.add(finding)
        stored += 1
    db.commit()
    return stored


@shared_task(name="app.workers.tasks.run_connectors")
def run_connectors() -> dict:
    db = SessionLocal()
    results = {}
    try:
        connectors = db.query(Connector).filter(Connector.is_active.is_(True)).all()
        for connector in connectors:
            try:
                targets = db.query(Target).filter(Target.org_id == connector.org_id).all()
                handler = get_connector(connector.connector_type)
                findings = handler.fetch(targets, {**connector.config, "org_id": connector.org_id}, connector.secrets)
                stored = _store_findings(db, findings)
                results[connector.id] = stored
                connector.last_run_status = f"stored:{stored}"
            except Exception:
                logger.exception("Connector %s failed", connector.id)
                connector.last_run_status = "error"
                results[connector.id] = "error"
        db.commit()
    finally:
        db.close()
    return results


@shared_task(name="app.workers.tasks.run_alerts")
def run_alerts() -> dict:
    db = SessionLocal()
    results = {}
    try:
        rules = db.query(AlertRule).filter(AlertRule.is_active.is_(True)).all()
        for rule in rules:
            try:
                new_findings = db.query(Finding).filter(
                    Finding.org_id == rule.org_id,
                ).order_by(Finding.created_at.desc()).limit(50).all()
                if new_findings:
                    send_alert(rule, new_findings)
                    results[rule.id] = f"sent:{len(new_findings)}"
                else:
                    results[rule.id] = "no_findings"
            except Exception:
                logger.exception("Alert rule %s failed", rule.id)
                results[rule.id] = "error"
    finally:
        db.close()
    return results
