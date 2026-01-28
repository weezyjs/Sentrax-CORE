import requests
from app.utils.crypto import decrypt_value


def send_jira(config: dict, secrets: dict, payload: dict) -> None:
    url = config.get("url")
    if not url:
        return
    auth = (config.get("username"), decrypt_value(secrets.get("api_token", "")))
    requests.post(url, json=payload, auth=auth, timeout=10)


def send_o365(config: dict, secrets: dict, payload: dict) -> None:
    webhook_url = config.get("teams_webhook")
    if webhook_url:
        requests.post(webhook_url, json={"text": payload.get("message", "DarkWeb Guard Alert")}, timeout=10)


def send_trellix(config: dict, secrets: dict, payload: dict) -> None:
    url = config.get("epo_url")
    token = decrypt_value(secrets.get("token", ""))
    if url:
        requests.post(url, json=payload, headers={"Authorization": f"Bearer {token}"}, timeout=10)


def send_webhook(config: dict, secrets: dict, payload: dict) -> None:
    url = config.get("url")
    if url:
        requests.post(url, json=payload, timeout=10)


INTEGRATION_HANDLERS = {
    "jira": send_jira,
    "o365": send_o365,
    "trellix": send_trellix,
    "webhook": send_webhook,
}
