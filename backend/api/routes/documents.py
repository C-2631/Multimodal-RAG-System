from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.models.db_models import Document, TextChunk, ImageRecord
from backend.models.schemas import (
    DocumentResponse,
    DocumentDetailResponse,
    DocumentStatusResponse,
    TextChunkResponse,
    ImageRecordResponse
)
from backend.storage.database import get_db
from backend.storage.object_store import object_store
from backend.storage.vector_store import vector_store
from backend.utils.progress_manager import progress_manager
from backend.utils.logger import logger

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    """List all indexed documents with summary statistics."""
    stmt = select(Document).order_by(Document.created_at.desc())
    result = await db.execute(stmt)
    docs = result.scalars().all()
    return docs

@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
async def get_document_indexing_status(document_id: str, db: AsyncSession = Depends(get_db)):
    """Poll the indexing progress status for a specific document."""
    # Check in-memory real-time progress manager first
    live_status = progress_manager.get_latest_status(document_id)

    # Cross-reference with database
    stmt = select(Document).where(Document.id == document_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    percent = 100 if doc.status == "indexed" else (0 if doc.status == "pending" else live_status.get("percent", 50))
    message = doc.error_message if doc.status == "failed" else live_status.get("message", f"Status: {doc.status}")

    return DocumentStatusResponse(
        document_id=doc.id,
        status=doc.status,
        percent=percent,
        message=message,
        chunk_count=doc.chunk_count or 0,
        image_count=doc.image_count or 0
    )

@router.get("/{document_id}", response_model=DocumentDetailResponse)
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve detailed information about a single document including chunks and images."""
    stmt = (
        select(Document)
        .options(selectinload(Document.text_chunks), selectinload(Document.images))
        .where(Document.id == document_id)
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    image_responses = []
    for img in doc.images:
        image_responses.append(
            ImageRecordResponse(
                id=img.id,
                page_number=img.page_number,
                image_path=img.image_path,
                image_url=f"/static/uploads/images/{img.image_path.split('images')[-1].replace(chr(92), '/').lstrip('/')}",
                caption=img.caption,
                width=img.width,
                height=img.height
            )
        )

    return DocumentDetailResponse(
        id=doc.id,
        filename=doc.filename,
        file_type=doc.file_type,
        status=doc.status,
        page_count=doc.page_count,
        chunk_count=doc.chunk_count,
        image_count=doc.image_count,
        created_at=doc.created_at,
        error_message=doc.error_message,
        text_chunks=[
            TextChunkResponse(
                id=tc.id,
                page_number=tc.page_number,
                chunk_index=tc.chunk_index,
                content=tc.content,
                token_count=tc.token_count
            )
            for tc in doc.text_chunks
        ],
        images=image_responses
    )

@router.delete("/{document_id}")
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a document, its database records, vectors, and files."""
    stmt = (
        select(Document)
        .options(selectinload(Document.images))
        .where(Document.id == document_id)
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        vector_store.delete_document_vectors(document_id)
        object_store.delete_file(doc.file_path)
        for img in doc.images:
            object_store.delete_file(img.image_path)

        await db.delete(doc)
        await db.commit()

        logger.info(f"Successfully deleted document '{doc.filename}' ({document_id})")
        return {"status": "success", "message": f"Document '{doc.filename}' deleted successfully."}

    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {e}")
