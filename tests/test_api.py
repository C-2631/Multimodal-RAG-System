import os
import sys
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from backend.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "clip-vit-base-patch32" in data["clip_model"]
        print("\n[PASS] /api/health:", data)

@pytest.mark.asyncio
async def test_documents_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/documents")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"\n[PASS] /api/documents returned {len(data)} documents.")

@pytest.mark.asyncio
async def test_query_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "text_query": "multimodal dual encoder architecture",
            "top_k": 2
        }
        response = await ac.post("/api/query", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "sources" in data
        print(f"\n[PASS] /api/query answer length: {len(data['answer'])}, sources: {len(data['sources'])}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_health_endpoint())
    asyncio.run(test_documents_endpoint())
    asyncio.run(test_query_endpoint())
