import asyncio
from typing import Dict, List, Any
from fastapi import WebSocket
from backend.utils.logger import logger

class IndexingProgressManager:
    """Manages real-time WebSocket notifications for document indexing progress."""

    def __init__(self):
        # document_id -> list of active WebSocket connections
        self._connections: Dict[str, List[WebSocket]] = {}
        # document_id -> latest event dict
        self._latest_events: Dict[str, Dict[str, Any]] = {}

    async def connect(self, document_id: str, websocket: WebSocket):
        await websocket.accept()
        if document_id not in self._connections:
            self._connections[document_id] = []
        self._connections[document_id].append(websocket)
        logger.info(f"WebSocket client connected for document {document_id}")

        # Send latest state immediately if exists
        if document_id in self._latest_events:
            try:
                await websocket.send_json(self._latest_events[document_id])
            except Exception:
                pass

    def disconnect(self, document_id: str, websocket: WebSocket):
        if document_id in self._connections:
            if websocket in self._connections[document_id]:
                self._connections[document_id].remove(websocket)
            if not self._connections[document_id]:
                del self._connections[document_id]
        logger.info(f"WebSocket client disconnected for document {document_id}")

    async def broadcast(self, document_id: str, event: str, message: str, percent: int = 0, extra: Dict[str, Any] = None):
        """Broadcast an indexing progress update to all listening clients."""
        payload = {
            "event": event,
            "document_id": document_id,
            "percent": percent,
            "message": message,
            **(extra or {})
        }
        self._latest_events[document_id] = payload

        if document_id in self._connections:
            stale_sockets = []
            for ws in self._connections[document_id]:
                try:
                    await ws.send_json(payload)
                except Exception:
                    stale_sockets.append(ws)

            for ws in stale_sockets:
                self.disconnect(document_id, ws)

    def get_latest_status(self, document_id: str) -> Dict[str, Any]:
        return self._latest_events.get(document_id, {
            "event": "unknown",
            "document_id": document_id,
            "percent": 0,
            "message": "No active status"
        })

progress_manager = IndexingProgressManager()
