from typing import Any
from app.utils.crypto import encrypt_value, decrypt_value


def encrypt_secrets(secrets: dict[str, Any] | None) -> dict[str, Any]:
    if not secrets:
        return {}
    return {k: encrypt_value(str(v)) for k, v in secrets.items() if v is not None}


def decrypt_secrets(secrets: dict[str, Any] | None) -> dict[str, Any]:
    if not secrets:
        return {}
    return {k: decrypt_value(v) for k, v in secrets.items()}
