# Threat Model

## Assets
- Tenant data (targets, findings, alert rules)
- Secrets (API keys, SMTP/Twilio creds)
- Audit logs and admin actions

## Abuse Cases
1. **Cross-tenant data access**: attacker attempts to access another tenant's findings.
2. **Credential exposure**: secrets logged or leaked in alerts.
3. **Connector misuse**: malicious configuration to scrape unauthorized sources.
4. **Webhook exfiltration**: attacker sets webhooks to exfiltrate data.
5. **Privilege escalation**: user elevates role to ORG_ADMIN/SUPER_ADMIN.

## Mitigations
- Tenant isolation enforced with `org_id` in DB queries and API dependencies.
- Secrets encrypted at rest and redacted in logs.
- Connector framework limited to public OSINT and lawful APIs.
- Alert rules include redaction policies and recipient validation.
- RBAC checks at endpoint level with audit logging for admin actions.

## Limitations
- In-memory rate limiting is best-effort; use a gateway-based rate limiter in production.
- Demo mode uses mock data and is not a security boundary.

## Legal/Ethical Guardrails
- No scraping or bypassing access controls.
- Only public feeds, user-provided feeds, or lawful APIs are supported.
- Custom connectors must follow local laws and the organization’s policies.
