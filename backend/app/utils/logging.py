import logging
from typing import Any

SENSITIVE_KEYS = {"password", "token", "secret", "api_key", "auth", "authorization"}


class RedactingFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        if isinstance(record.args, dict):
            record.args = {k: "***" if k.lower() in SENSITIVE_KEYS else v for k, v in record.args.items()}
        return super().format(record)


def configure_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(RedactingFormatter("%(asctime)s %(levelname)s %(message)s"))
    logging.basicConfig(level=logging.INFO, handlers=[handler])


def redact_dict(data: dict[str, Any]) -> dict[str, Any]:
    return {k: "***" if k.lower() in SENSITIVE_KEYS else v for k, v in data.items()}
