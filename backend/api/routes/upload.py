import os
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.db_models import Document
from backend.models.schemas import UploadResponse
from backend.storage.database import get_db
from backend.storage.object_store import object_store
from backend.ingestion.indexer import indexer
from backend.utils.logger import logger

router = APIRouter(prefix="/api", tags=["Upload & Ingestion"])

ALLOWED_EXTENSIONS = {
    ".pdf": "pdf",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".webp": "image",
    ".mp3": "audio",
    ".wav": "audio",
    ".m4a": "audio",
    ".ogg": "audio",
    ".mp4": "video",
    ".webm": "video",
    ".mov": "video",
    ".mkv": "video"
}

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a document (PDF) or image file.
    Saves the file to local storage and dispatches asynchronous indexing.
    """
    filename = file.filename or "uploaded_file"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {list(ALLOWED_EXTENSIONS.keys())}"
        )

    file_type = ALLOWED_EXTENSIONS[ext]

    try:
        content = await file.read()
        saved_path, _ = object_store.save_upload_file(content, filename)

        doc = Document(
            filename=filename,
            file_type=file_type,
            file_path=saved_path,
            status="pending"
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)

        # Trigger indexing in background
        background_tasks.add_task(indexer.index_document, doc.id)

        return UploadResponse(
            document_id=doc.id,
            filename=doc.filename,
            file_type=doc.file_type,
            status=doc.status,
            message="File uploaded successfully. Indexing started in the background."
        )

    except Exception as e:
        logger.error(f"Error during file upload: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
