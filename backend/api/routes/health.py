from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from backend.config import settings
from backend.models.schemas import HealthResponse
from backend.storage.database import get_db
from backend.storage.vector_store import vector_store
from backend.core.generator import generator

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health(db: AsyncSession = Depends(get_db)):
    """System health check endpoint."""
    # Check Database
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {e}"

    # Check Vector DB
    vdb_status = vector_store.health()

    # Get active LLM configuration
    llm_info = generator.get_provider_info()

    return HealthResponse(
        status="ok" if db_status == "healthy" and "healthy" in vdb_status else "degraded",
        app_name=settings.APP_NAME,
        version="1.0.0",
        clip_model=settings.CLIP_MODEL_NAME,
        llm_provider=llm_info["provider"],
        llm_model=llm_info["model"],
        vector_db_status=vdb_status,
        db_status=db_status
    )
