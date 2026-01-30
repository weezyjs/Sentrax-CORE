from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from time import time
from app.core.config import settings
from app.utils.logging import configure_logging
from app.api.routes import auth, orgs, users, targets, findings, alert_rules, connectors, integrations, metrics, audit_log

configure_logging()

app = FastAPI(title="darkweb-guard", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_rate_limits: dict[str, list[float]] = {}
_RATE_LIMIT_MAX_KEYS = 10000


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    identifier = request.client.host if request.client else "unknown"
    now = time()
    window = 60
    timestamps = [t for t in _rate_limits.get(identifier, []) if now - t < window]
    if len(timestamps) >= settings.rate_limit_per_minute:
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})
    timestamps.append(now)
    _rate_limits[identifier] = timestamps
    if len(_rate_limits) > _RATE_LIMIT_MAX_KEYS:
        stale = [k for k, v in _rate_limits.items() if not v or now - v[-1] > window]
        for k in stale:
            del _rate_limits[k]
    return await call_next(request)


app.include_router(auth.router)
app.include_router(orgs.router)
app.include_router(users.router)
app.include_router(targets.router)
app.include_router(findings.router)
app.include_router(alert_rules.router)
app.include_router(connectors.router)
app.include_router(integrations.router)
app.include_router(metrics.router)
app.include_router(audit_log.router)
