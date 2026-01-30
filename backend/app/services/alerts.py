import smtplib
import requests
from typing import Any
from email.mime.text import MIMEText
from app.core.config import settings
from app.utils.redaction import apply_redaction
from app.models.alert_rule import AlertRule


def send_email(recipients: list[str], subject: str, body: str) -> None:
    if not settings.smtp_host or not recipients:
        return
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from
    msg["To"] = ", ".join(recipients)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        if settings.smtp_user and settings.smtp_password:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_from, recipients, msg.as_string())


def send_sms(recipients: list[str], body: str) -> None:
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        return
    if not recipients:
        return
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
    for recipient in recipients:
        requests.post(
            url,
            data={"From": settings.twilio_from_number, "To": recipient, "Body": body},
            auth=(settings.twilio_account_sid, settings.twilio_auth_token),
            timeout=10,
        )


def send_webhooks(urls: list[str], payload: dict) -> None:
    for url in urls:
        requests.post(url, json=payload, timeout=10)


def _apply_overrides(payload: dict, recipients: dict) -> dict[str, dict]:
    overrides = recipients.get("overrides", {}) if isinstance(recipients, dict) else {}
    return {
        "emails": apply_redaction(payload, overrides.get("emails", {})),
        "phones": apply_redaction(payload, overrides.get("phones", {})),
        "webhooks": apply_redaction(payload, overrides.get("webhooks", {})),
    }


def _build_alert_payload(rule: AlertRule, findings: list[Any]) -> dict:
    return {
        "event": "alert",
        "rule": rule.name,
        "findings_count": len(findings),
        "findings": [
            {
                "matched_entity": f.matched_entity,
                "severity": f.severity,
                "source": f.source,
                "exposure_types": f.exposure_types,
            }
            for f in findings
        ],
    }


def send_alert(rule: AlertRule, findings: list[Any]) -> None:
    payload = _build_alert_payload(rule, findings)
    redacted = apply_redaction(payload, rule.redaction_policy or {})
    recipients = rule.recipients or {}
    overrides = _apply_overrides(redacted, recipients)
    send_email(recipients.get("emails", []), f"DarkWeb Guard Alert: {rule.name}", str(overrides["emails"]))
    send_sms(recipients.get("phones", []), str(overrides["phones"]))
    send_webhooks(recipients.get("webhooks", []), overrides["webhooks"])


def send_test_alert(rule: AlertRule) -> None:
    sample_payload = {"event": "test_alert", "rule": rule.name, "severity": "medium"}
    redacted = apply_redaction(sample_payload, rule.redaction_policy or {})
    recipients = rule.recipients or {}
    overrides = _apply_overrides(redacted, recipients)
    send_email(recipients.get("emails", []), "DarkWeb Guard Test Alert", str(overrides["emails"]))
    send_sms(recipients.get("phones", []), str(overrides["phones"]))
    send_webhooks(recipients.get("webhooks", []), overrides["webhooks"])
