from app.utils.redaction import apply_redaction


def test_redaction_masks_fields():
    payload = {"password": "secret", "token": "abcd", "email": "user@example.com"}
    policy = {"remove_fields": ["password"], "mask_fields": {"token": "full", "email": "last3"}}
    redacted = apply_redaction(payload, policy)
    assert "password" not in redacted
    assert redacted["token"] == "***"
    assert redacted["email"].endswith("com")
