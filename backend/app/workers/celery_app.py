from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "darkweb_guard",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.beat_schedule = {
    "run-connectors": {
        "task": "app.workers.tasks.run_connectors",
        "schedule": 60 * 60 * 6,
    }
}
