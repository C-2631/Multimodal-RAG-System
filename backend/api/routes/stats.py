from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.config import settings
from backend.models.db_models import Document, TextChunk, ImageRecord, QueryAnalytics
from backend.models.schemas import SystemStatsResponse, CollectionInfo
from backend.storage.database import get_db
from backend.storage.vector_store import vector_store
from backend.core.generator import generator

router = APIRouter(prefix="/api", tags=["Analytics & Collections"])

@router.get("/stats", response_model=SystemStatsResponse)
async def get_system_stats(db: AsyncSession = Depends(get_db)):
    """Retrieve operational statistics including indexed items and query analytics."""
    doc_count = (await db.execute(select(func.count(Document.id)))).scalar_one() or 0
    chunk_count = (await db.execute(select(func.count(TextChunk.id)))).scalar_one() or 0
    img_count = (await db.execute(select(func.count(ImageRecord.id)))).scalar_one() or 0
    query_count = (await db.execute(select(func.count(QueryAnalytics.id)))).scalar_one() or 0
    avg_latency = (await db.execute(select(func.avg(QueryAnalytics.latency_ms)))).scalar_one() or 0.0

    llm_info = generator.get_provider_info()

    return SystemStatsResponse(
        total_documents=doc_count,
        total_text_chunks=chunk_count,
        total_images=img_count,
        total_queries=query_count,
        avg_latency_ms=round(float(avg_latency), 2),
        llm_provider=llm_info["provider"],
        llm_model=llm_info["model"]
    )

@router.get("/collections", response_model=List[CollectionInfo])
async def list_vector_collections():
    """List details of all Qdrant vector database collections."""
    collections_info = []
    for col_name in [settings.QDRANT_TEXT_COLLECTION, settings.QDRANT_IMAGE_COLLECTION]:
        try:
            info = vector_store.client.get_collection(col_name)
            collections_info.append(
                CollectionInfo(
                    name=col_name,
                    points_count=info.points_count or 0,
                    vector_size=settings.EMBEDDING_DIM,
                    status=str(info.status)
                )
            )
        except Exception:
            collections_info.append(
                CollectionInfo(
                    name=col_name,
                    points_count=0,
                    vector_size=settings.EMBEDDING_DIM,
                    status="unknown"
                )
            )
    return collections_info
