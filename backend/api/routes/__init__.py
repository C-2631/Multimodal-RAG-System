from backend.api.routes.health import router as health_router
from backend.api.routes.upload import router as upload_router
from backend.api.routes.documents import router as documents_router
from backend.api.routes.query import router as query_router
from backend.api.routes.stats import router as stats_router

__all__ = [
    "health_router",
    "upload_router",
    "documents_router",
    "query_router",
    "stats_router",
]
