import hashlib
import requests
import feedparser
from typing import Any
from app.models.target import Target
from app.models.finding import Finding
from app.utils.crypto import decrypt_value
from app.services.severity import compute_severity
from app.utils.redaction import sanitize_snippet


class BaseConnector:
    name = "base"

    def fetch(self, targets: list[Target], config: dict[str, Any], secrets: dict[str, Any]) -> list[Finding]:
        raise NotImplementedError


class DemoConnector(BaseConnector):
    name = "demo"

    def fetch(self, targets: list[Target], config: dict[str, Any], secrets: dict[str, Any]) -> list[Finding]:
        findings = []
        for target in targets:
            snippet = f"Demo leak mention for {target.value} with placeholder data"
            exposure = ["email"] if target.target_type == "email" else ["mention"]
            dedupe_hash = hashlib.sha256(f"demo-{target.value}".encode()).hexdigest()
            findings.append(
                Finding(
                    org_id=target.org_id,
                    source="demo",
                    confidence=55,
                    matched_entity=target.value,
                    exposure_types=exposure,
                    raw_snippet=sanitize_snippet(snippet),
                    severity=compute_severity(exposure),
                    dedupe_hash=dedupe_hash,
                    metadata={"note": "demo"},
                )
            )
        return findings


class HIBPConnector(BaseConnector):
    name = "hibp"

    def fetch(self, targets: list[Target], config: dict[str, Any], secrets: dict[str, Any]) -> list[Finding]:
        api_key = decrypt_value(secrets.get("api_key", ""))
        base_url = config.get("base_url", "https://haveibeenpwned.com/api/v3/breachedaccount")
        findings = []
        headers = {"hibp-api-key": api_key, "user-agent": "darkweb-guard"}
        for target in targets:
            if target.target_type != "email":
                continue
            resp = requests.get(f"{base_url}/{target.value}", headers=headers, timeout=10)
            if resp.status_code == 404:
                continue
            resp.raise_for_status()
            for breach in resp.json():
                exposure_types = breach.get("DataClasses", [])
                snippet = f"HIBP breach {breach.get('Name')} affecting {target.value}"
                dedupe_hash = hashlib.sha256(f"hibp-{target.value}-{breach.get('Name')}".encode()).hexdigest()
                findings.append(
                    Finding(
                        org_id=target.org_id,
                        source="hibp",
                        confidence=90,
                        matched_entity=target.value,
                        exposure_types=exposure_types,
                        raw_snippet=sanitize_snippet(snippet),
                        severity=compute_severity(exposure_types),
                        dedupe_hash=dedupe_hash,
                        metadata={"breach": breach},
                    )
                )
        return findings


class DehashedConnector(BaseConnector):
    name = "dehashed"

    def fetch(self, targets: list[Target], config: dict[str, Any], secrets: dict[str, Any]) -> list[Finding]:
        api_key = decrypt_value(secrets.get("api_key", ""))
        username = decrypt_value(secrets.get("username", ""))
        base_url = config.get("base_url", "https://api.dehashed.com/search")
        findings = []
        for target in targets:
            resp = requests.get(base_url, params={"query": target.value}, auth=(username, api_key), timeout=10)
            if resp.status_code == 401:
                continue
            resp.raise_for_status()
            data = resp.json().get("entries", [])
            for entry in data:
                exposure_types = [key for key in entry.keys() if entry.get(key)]
                snippet = f"DeHashed entry for {target.value}"
                dedupe_hash = hashlib.sha256(f"dehashed-{target.value}-{entry.get('id', '')}".encode()).hexdigest()
                findings.append(
                    Finding(
                        org_id=target.org_id,
                        source="dehashed",
                        confidence=70,
                        matched_entity=target.value,
                        exposure_types=exposure_types,
                        raw_snippet=sanitize_snippet(snippet),
                        severity=compute_severity(exposure_types),
                        metadata={"entry": entry},
                        dedupe_hash=dedupe_hash,
                    )
                )
        return findings


class GenericRestConnector(BaseConnector):
    name = "generic_rest"

    def fetch(self, targets: list[Target], config: dict[str, Any], secrets: dict[str, Any]) -> list[Finding]:
        url = config.get("url")
        if not url:
            return []
        headers = config.get("headers", {})
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        payload = response.json()
        findings = []
        for item in payload.get("findings", []):
            dedupe_hash = hashlib.sha256(str(item).encode()).hexdigest()
            findings.append(
                Finding(
                    org_id=config.get("org_id"),
                    source="generic_rest",
                    confidence=item.get("confidence", 50),
                    matched_entity=item.get("matched_entity", "unknown"),
                    exposure_types=item.get("exposure_types", []),
                    raw_snippet=sanitize_snippet(item.get("raw_snippet", "")),
                    severity=compute_severity(item.get("exposure_types", [])),
                    dedupe_hash=dedupe_hash,
                    metadata=item,
                )
            )
        return findings


class RssConnector(BaseConnector):
    name = "rss"

    def fetch(self, targets: list[Target], config: dict[str, Any], secrets: dict[str, Any]) -> list[Finding]:
        url = config.get("url")
        if not url:
            return []
        feed = feedparser.parse(url)
        findings = []
        for entry in feed.entries:
            content = entry.get("title", "") + " " + entry.get("summary", "")
            for target in targets:
                if target.value.lower() in content.lower():
                    exposure_types = ["mention"]
                    dedupe_hash = hashlib.sha256(f"rss-{entry.get('id', entry.get('link'))}".encode()).hexdigest()
                    findings.append(
                        Finding(
                            org_id=target.org_id,
                            source="rss",
                            confidence=40,
                            matched_entity=target.value,
                            exposure_types=exposure_types,
                            raw_snippet=sanitize_snippet(content[:280]),
                            severity=compute_severity(exposure_types),
                            dedupe_hash=dedupe_hash,
                            metadata={"link": entry.get("link")},
                        )
                    )
        return findings


class PublicPasteConnector(BaseConnector):
    name = "public_paste"

    def fetch(self, targets: list[Target], config: dict[str, Any], secrets: dict[str, Any]) -> list[Finding]:
        url = config.get("url")
        if not url:
            return []
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        content = response.text
        findings = []
        for target in targets:
            if target.value.lower() in content.lower():
                exposure_types = ["mention"]
                dedupe_hash = hashlib.sha256(f"paste-{target.value}-{url}".encode()).hexdigest()
                findings.append(
                    Finding(
                        org_id=target.org_id,
                        source="public_paste",
                        confidence=35,
                        matched_entity=target.value,
                        exposure_types=exposure_types,
                        raw_snippet=sanitize_snippet(content[:280]),
                        severity=compute_severity(exposure_types),
                        dedupe_hash=dedupe_hash,
                        metadata={"url": url},
                    )
                )
        return findings


CONNECTOR_REGISTRY = {
    DemoConnector.name: DemoConnector(),
    HIBPConnector.name: HIBPConnector(),
    DehashedConnector.name: DehashedConnector(),
    GenericRestConnector.name: GenericRestConnector(),
    RssConnector.name: RssConnector(),
    PublicPasteConnector.name: PublicPasteConnector(),
}


def get_connector(connector_type: str) -> BaseConnector:
    if connector_type not in CONNECTOR_REGISTRY:
        raise ValueError("Unknown connector")
    return CONNECTOR_REGISTRY[connector_type]
