import os
import sys

# Ensure project root is in sys.path whether run from project root or inside backend/
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.dirname(_backend_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Ensure virtualenv site-packages are accessible
_venv_site_pkgs = os.path.join(_root_dir, ".venv", "Lib", "site-packages")
if os.path.exists(_venv_site_pkgs) and _venv_site_pkgs not in sys.path:
    sys.path.insert(0, _venv_site_pkgs)

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.storage.database import init_db
from backend.storage.vector_store import vector_store
from backend.core.embedder import embedder
from backend.api.routes import (
    health_router,
    upload_router,
    documents_router,
    query_router,
    stats_router
)
from backend.utils.progress_manager import progress_manager
from backend.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events: startup and shutdown logic."""
    logger.info("Starting up Multimodal RAG Backend...")

    # 1. Initialize SQLite / PostgreSQL tables
    await init_db()

    # 2. Ensure Qdrant collections exist
    vector_store.ensure_collections()

    # 3. Warm-up CLIP model
    logger.info("Initializing CLIP embedder...")
    embedder.load_model()

    logger.info("Backend services ready.")
    yield
    logger.info("Shutting down Multimodal RAG Backend...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Multimodal RAG API for indexing and retrieving text and images with CLIP embeddings.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file directory for serving uploaded documents and extracted images
upload_abs_path = os.path.abspath(settings.UPLOAD_DIR)
os.makedirs(upload_abs_path, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=upload_abs_path), name="uploads")

# Include Routers
app.include_router(health_router)
app.include_router(upload_router)
app.include_router(documents_router)
app.include_router(query_router)
app.include_router(stats_router)

# WebSocket for Real-time Document Indexing Progress
@app.websocket("/ws/indexing/{document_id}")
async def websocket_indexing(websocket: WebSocket, document_id: str):
    """Real-time indexing progress events over WebSocket."""
    await progress_manager.connect(document_id, websocket)
    try:
        while True:
            # Maintain listening loop
            await websocket.receive_text()
    except WebSocketDisconnect:
        progress_manager.disconnect(document_id, websocket)
    except Exception:
        progress_manager.disconnect(document_id, websocket)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
        "stats": "/api/stats",
        "collections": "/api/collections"
    }

if __name__ == "__main__":
    import uvicorn
    app_target = "backend.main:app" if os.path.exists("backend") else "main:app"
    uvicorn.run(app_target, host=settings.HOST, port=settings.PORT, reload=True)
