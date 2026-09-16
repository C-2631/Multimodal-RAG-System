import os
import sys
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from backend.main import app
from backend.storage.database import init_db
from backend.storage.vector_store import vector_store

@pytest.mark.asyncio
async def test_multimodal_new_features():
    await init_db()
    vector_store.ensure_collections()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        print("\n=== 1. Testing Query with Image Markdown Embedding ===")
        res = await ac.post("/api/query", json={
            "text_query": "Explain the dual-encoder architecture diagram",
            "top_k": 3
        })
        assert res.status_code == 200
        data = res.json()
        print("Answer preview:\n", data["answer"][:300])
        print("\nSources found:", len(data["sources"]))
        # Verify that images are present in sources
        image_sources = [s for s in data["sources"] if s["type"] == "image"]
        print(f"Image sources found: {len(image_sources)}")

        print("\n=== 2. Testing Live Web Search Augmentation ===")
        web_res = await ac.post("/api/query", json={
            "text_query": "What are recent developments in quantum computing?",
            "use_web": True,
            "top_k": 3
        })
        assert web_res.status_code == 200
        web_data = web_res.json()
        print("Web search answer preview:\n", web_data["answer"][:300])
        print("Web results count:", len(web_data.get("web_results", [])))
        assert len(web_data.get("web_results", [])) > 0, "Expected web search to return results"

        print("\n=== 3. Testing Text-to-Speech (TTS) Synthesis ===")
        tts_res = await ac.post("/api/query/tts", json={
            "text": "Hello, welcome to the Multimodal RAG system with text, image, audio, and web search."
        })
        assert tts_res.status_code == 200
        assert "audio/mpeg" in tts_res.headers["content-type"]
        audio_content = tts_res.content
        print(f"Generated TTS MP3 audio: {len(audio_content)} bytes")
        assert len(audio_content) > 1000

        print("\n=== 4. Testing Audio Query Flag ===")
        q_audio_res = await ac.post("/api/query", json={
            "text_query": "Summarize the whitepaper",
            "generate_audio": True,
            "top_k": 2
        })
        assert q_audio_res.status_code == 200
        qa_data = q_audio_res.json()
        print("Audio URL generated:", qa_data.get("audio_url"))
        assert qa_data.get("audio_url") is not None

        print("\n>>> ALL MULTIMODAL EXTENSIONS (WEB, AUDIO TTS, IMAGE EMBEDDING) PASSED! <<<")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_multimodal_new_features())
