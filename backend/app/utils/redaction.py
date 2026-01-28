import re
from typing import Any


def sanitize_snippet(snippet: str) -> str:
    return re.sub(r"\s+", " ", snippet).strip()[:500]


def apply_redaction(payload: dict[str, Any], policy: dict[str, Any]) -> dict[str, Any]:
    redacted = payload.copy()
    remove_fields = policy.get("remove_fields", [])
    mask_fields = policy.get("mask_fields", {})
    for field in remove_fields:
        redacted.pop(field, None)
    for field, mask in mask_fields.items():
        if field in redacted and isinstance(redacted[field], str):
            value = redacted[field]
            if mask == "last3":
                redacted[field] = "***" + value[-3:]
            elif mask == "full":
                redacted[field] = "***"
    return redacted
