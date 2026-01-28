from typing import Iterable


HIGH_INDICATORS = {"password", "hash", "credentials", "credential"}
MEDIUM_INDICATORS = {"phone", "address", "email", "ssn"}


def compute_severity(exposure_types: Iterable[str]) -> str:
    exposure_set = {e.lower() for e in exposure_types}
    if exposure_set & HIGH_INDICATORS:
        return "high"
    if exposure_set & MEDIUM_INDICATORS:
        return "medium"
    return "low"
