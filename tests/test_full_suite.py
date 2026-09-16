import os
import sys
import json
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from backend.main import app
from backend.config import settings
from backend.storage.database import init_db
from backend.storage.vector_store import vector_store

@pytest.mark.asyncio
async def test_full_api_suite():
    await init_db()
    vector_store.ensure_collections()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        print("\n=== 1. Testing Health Endpoint ===")
        res = await ac.get("/api/health")
        assert res.status_code == 200
        health_data = res.json()
        print("Health response:", health_data)
        assert health_data["status"] in ["ok", "degraded"]
        assert health_data["vector_db_status"] == "healthy"

        print("\n=== 2. Testing Stats & Collections Endpoints ===")
        stats_res = await ac.get("/api/stats")
        assert stats_res.status_code == 200
        stats_data = stats_res.json()
        print("Stats response:", stats_data)
        assert "total_documents" in stats_data
        assert "llm_provider" in stats_data

        col_res = await ac.get("/api/collections")
        assert col_res.status_code == 200
        col_data = col_res.json()
        print("Collections response:", col_data)
        assert len(col_data) >= 2

        print("\n=== 3. Testing Documents List Endpoint ===")
        docs_res = await ac.get("/api/documents")
        assert docs_res.status_code == 200
        docs_list = docs_res.json()
        print(f"Current documents count: {len(docs_list)}")

        if docs_list:
            doc_id = docs_list[0]["id"]
            print(f"\n=== 4. Testing Document Status & Detail for ID: {doc_id} ===")
            status_res = await ac.get(f"/api/documents/{doc_id}/status")
            assert status_res.status_code == 200
            print("Document status:", status_res.json())

            detail_res = await ac.get(f"/api/documents/{doc_id}")
            assert detail_res.status_code == 200
            detail_data = detail_res.json()
            print(f"Document detail - chunks: {len(detail_data['text_chunks'])}, images: {len(detail_data['images'])}")

        print("\n=== 5. Testing Standard JSON Query (/api/query) ===")
        query_payload = {
            "text_query": "How does CLIP embedding work?",
            "top_k": 2,
            "stream": False
        }
        q_res = await ac.post("/api/query", json=query_payload)
        assert q_res.status_code == 200
        q_data = q_res.json()
        assert "answer" in q_data
        assert "sources" in q_data
        print("Query Answer snippet:", q_data["answer"][:120])
        print("Retrieved sources count:", len(q_data["sources"]))

        print("\n=== 6. Testing Text-Only Query (/api/query/text) ===")
        tq_payload = {
            "query": "architecture dual-encoder diagram",
            "top_k": 2
        }
        tq_res = await ac.post("/api/query/text", json=tq_payload)
        assert tq_res.status_code == 200
        tq_data = tq_res.json()
        print("Text query answer snippet:", tq_data["answer"][:120])

        print("\n=== 7. Testing Streaming Query via SSE (/api/query?stream=true) ===")
        stream_payload = {
            "text_query": "Describe the multimodal architecture",
            "top_k": 2,
            "stream": True
        }
        stream_res = await ac.post("/api/query", json=stream_payload)
        assert stream_res.status_code == 200
        assert "text/event-stream" in stream_res.headers["content-type"]
        lines = stream_res.text.strip().split("\n\n")
        print(f"Received {len(lines)} SSE chunks from streaming endpoint.")
        first_event = json.loads(lines[0].replace("data: ", ""))
        assert first_event["type"] == "sources"
        print(f"First SSE event type: {first_event['type']} with {len(first_event['sources'])} sources.")

        print("\n=== 8. Testing Image Upload Query (/api/query/image) ===")
        sample_img_path = "./data/sample_images/clip_multimodal_architecture.png"
        if os.path.exists(sample_img_path):
            with open(sample_img_path, "rb") as f:
                img_res = await ac.post(
                    "/api/query/image",
                    files={"file": ("test_img.png", f, "image/png")},
                    data={"top_k": 2}
                )
            assert img_res.status_code == 200
            img_query_data = img_res.json()
            print("Image query answer snippet:", img_query_data["answer"][:120])
            print("Image query sources count:", len(img_query_data["sources"]))

        print("\n>>> ALL ADVANCED API & PIPELINE SUITE TESTS PASSED! <<<")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_full_api_suite())
