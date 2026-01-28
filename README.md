# darkweb-guard

Enterprise-grade dark web & breach exposure monitoring platform with a GUI. DarkWeb Guard is designed to be **legal, ethical, and compliant by default**, supporting only public OSINT feeds, user-provided feeds, and lawful APIs such as Have I Been Pwned.

> **Compliance & Safety**
> - No Tor marketplace/forum scraping.
> - No bypassing auth, paywalls, or access controls.
> - Custom connectors allow customers to integrate authorized feeds without shipping illegal collectors.

## Features
- Multi-tenant organizations with strict data isolation
- RBAC: SUPER_ADMIN, ORG_ADMIN, ANALYST, VIEWER
- FastAPI + PostgreSQL + Alembic migrations
- Celery + Redis workers for scheduled scans
- Connectors: HIBP, DeHashed, Generic REST, RSS, Demo feed
- Custom Source Connector interface for customer-provided or internal feeds
- Integrations: Jira, Microsoft 365 (Teams webhook), Trellix, Generic Webhook
- Alerting: Email (SMTP), SMS (Twilio), Webhooks
- Redaction policies for alert payloads
- Audit logs and structured logging with redaction
- Demo Mode (GitHub Pages) with mock API data

## Repository Structure
```
/backend    FastAPI services, worker, database models
/frontend   React + TypeScript + Tailwind UI
/infra      Docker Compose and infra config
/docs       Security, architecture, threat model
/scripts    Utilities (e.g., Fernet key generation)
```

## Severity Rubric
- **High**: Password/hash present for monitored identity OR database dump with credentials.
- **Medium**: PII without password (phone/address) for monitored identity.
- **Low**: Mention only (name/company mention without exposed credentials).

## Quick Start (Docker Compose)
```bash
cd infra
docker compose up --build
```

Then:
- Backend: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Local Development
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

### Worker
```bash
cd backend
celery -A app.workers.celery_app.celery_app worker -B --loglevel=info
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Demo Mode (GitHub Pages)
Demo mode runs without any backend using mocked API responses.

```bash
cd frontend
VITE_DEMO_MODE=true npm run build
```

Deploy the `dist/` folder to GitHub Pages (e.g., `gh-pages` branch). The UI will display a **Demo Mode** banner and sample data.

## First Run (Bootstrap)
1. Bootstrap SUPER_ADMIN:
   ```bash
   curl -X POST http://localhost:8000/auth/bootstrap-super-admin \
     -H 'Content-Type: application/json' \
     -d '{"email":"admin@example.com","password":"ChangeMe123"}'
   ```
2. Login and create orgs via `/orgs`.
3. Create org users via `/orgs/{org_id}/users`.
4. Configure connectors and integrations in the UI.
5. Add targets and alert rules.

## Environment Variables (Backend)
- `SECRET_KEY`: JWT signing key
- `MASTER_KEY`: Fernet key for encryption
- `DATABASE_URL`: Postgres SQLAlchemy DSN
- `REDIS_URL`: Redis for Celery
- `SMTP_*`: Email settings
- `TWILIO_*`: SMS settings

Generate a Fernet key:
```bash
python scripts/generate_fernet_key.py
```

## CI & Security Checks
GitHub Actions runs linting, tests, dependency audits, and secret scanning.

## Production Notes
- Terminate TLS at a reverse proxy (nginx, Envoy).
- Store `SECRET_KEY` and `MASTER_KEY` in a secrets manager.
- Restrict egress to approved connector endpoints.
- Use database backups and point-in-time recovery.

## Sanity Checklist
```bash
cd infra
docker compose up --build
```
```bash
cd backend
pytest
```
```bash
cd frontend
npm run build
```
```bash
cd frontend
VITE_DEMO_MODE=true npm run build
```
```bash
cd backend
bandit -r app
pip-audit
```
```bash
cd frontend
npm audit --audit-level=high
```

## License
MIT
