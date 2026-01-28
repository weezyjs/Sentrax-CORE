# Architecture

## Overview
DarkWeb Guard is a multi-tenant dark web exposure monitoring platform built with a FastAPI backend, Celery workers, PostgreSQL persistence, and a React/Tailwind frontend.

## Components
- **Backend API** (`/backend`): FastAPI services, RBAC, tenant enforcement, and audit logging.
- **Workers** (`/backend/app/workers`): Celery tasks that run connector scans and alerts.
- **Connectors** (`/backend/app/services/connectors.py`): pluggable collectors for public OSINT and legal APIs.
- **Integrations** (`/backend/app/services/integrations.py`): outbound notifications to Jira, O365, Trellix, and webhooks.
- **Frontend** (`/frontend`): React UI with demo mode using mock API data.
- **Infra** (`/infra`): Docker Compose for local and production-like deployments.

## Multi-Tenancy
Each data model includes an `org_id` tenant key. APIs enforce tenant isolation by combining JWT claims with `X-Org-Id` header checks. SUPER_ADMIN users can scope requests to any org; other roles are restricted to their own org.

## Data Flow
1. Targets are configured per tenant.
2. Connectors execute on a schedule (default 6 hours).
3. Findings are normalized, deduped, and stored in PostgreSQL.
4. Alert rules filter findings and deliver notifications.
5. Integrations forward enriched data to external systems.

## Security Controls
- Fernet encryption for secrets at rest.
- Structured logging with redaction.
- Rate limiting middleware.
- Role-based access control at API endpoints.
