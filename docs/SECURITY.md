# Security Policy

## Supported Versions
This project is in active development. Security fixes are applied to the latest `main` branch.

## Reporting a Vulnerability
Please open a private issue or email security@darkweb-guard.local with details.

## Security-by-Default Principles
- **Legal & ethical monitoring**: only public or authorized sources are supported in this repository.
- **Tenant isolation**: every record is scoped by `org_id` at the database and API layers.
- **Least privilege**: roles and permissions limit access to sensitive actions.
- **Secrets at rest**: external API keys are encrypted with a master key (Fernet).
- **Redaction**: alert payloads can remove or mask sensitive fields.
- **Audit logging**: actions are recorded for compliance and forensics.

## Operational Guidance
- Use strong, rotated `SECRET_KEY` and `MASTER_KEY` values.
- Store secrets in a dedicated secret manager in production.
- Terminate TLS at a reverse proxy (nginx, Envoy).
- Restrict outbound network access to approved connectors and integrations.
