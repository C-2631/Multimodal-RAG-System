"""
Convenience launcher for the Multimodal RAG Backend server.
Usage:
    python run_backend.py
"""
import uvicorn
from backend.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.APP_NAME} on http://{settings.HOST}:{settings.PORT}")
    print(f"Interactive API Docs: http://localhost:{settings.PORT}/docs")
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
