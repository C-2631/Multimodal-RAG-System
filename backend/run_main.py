"""Convenience launcher for the Multimodal RAG Backend server."""
import os
import sys

_curr = os.path.dirname(os.path.abspath(__file__))
_root = os.path.dirname(_curr) if os.path.basename(_curr) == "backend" else _curr
if _root not in sys.path:
    sys.path.insert(0, _root)

import uvicorn
from backend.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.APP_NAME} on http://{settings.HOST}:{settings.PORT}")
    print(f"Swagger API Docs: http://localhost:{settings.PORT}/docs")
    app_target = "backend.main:app" if os.path.exists("backend") else "main:app"
    uvicorn.run(app_target, host=settings.HOST, port=settings.PORT, reload=True)
