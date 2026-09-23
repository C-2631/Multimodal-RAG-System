"""Convenience launcher for the Multimodal RAG Backend server."""
import os
import sys
import multiprocessing

_curr = os.path.dirname(os.path.abspath(__file__))
_root = os.path.dirname(_curr) if os.path.basename(_curr) == "backend" else _curr
if _root not in sys.path:
    sys.path.insert(0, _root)

# Auto-detect and inject .venv site-packages so all Python environments can load dependencies
_venv_scripts = os.path.join(_root, ".venv", "Scripts", "python.exe")
_venv_site_pkgs = os.path.join(_root, ".venv", "Lib", "site-packages")

if os.path.exists(_venv_site_pkgs) and _venv_site_pkgs not in sys.path:
    sys.path.insert(0, _venv_site_pkgs)

if os.path.exists(_venv_scripts):
    sys.executable = _venv_scripts
    try:
        multiprocessing.set_executable(_venv_scripts)
    except Exception:
        pass

import uvicorn
from backend.config import settings

if __name__ == "__main__":
    port = int(os.environ.get("PORT", settings.PORT))
    host = os.environ.get("HOST", settings.HOST)
    print(f"Starting {settings.APP_NAME} on http://{host}:{port}")
    print(f"Swagger API Docs: http://localhost:{port}/docs")
    app_target = "backend.main:app" if os.path.exists("backend") else "main:app"
    uvicorn.run(app_target, host=host, port=port, reload=False)
