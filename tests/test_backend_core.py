import os
import sys
import asyncio
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

def test_imports_and_components():
    print("--- 1. Testing Config & Utils ---")
    from backend.config import settings
    from backend.utils.logger import logger
    from backend.utils.image_utils import load_image_to_pil, pil_to_base64
    print(f"Config loaded. App name: {settings.APP_NAME}")

    print("\n--- 2. Testing CLIP Embedder ---")
    from backend.core.embedder import embedder
    text_emb = embedder.embed_text("A diagram showing deep neural network architecture")
    print(f"Text embedding shape: len={len(text_emb)}, sample={text_emb[:3]}")
    assert len(text_emb) == 512, "Embedding dimension should be 512"

    # Create dummy image in memory to test image embedding
    dummy_img = Image.new("RGB", (224, 224), color=(73, 109, 137))
    img_emb = embedder.embed_image(dummy_img)
    print(f"Image embedding shape: len={len(img_emb)}, sample={img_emb[:3]}")
    assert len(img_emb) == 512, "Embedding dimension should be 512"

    # Cosine similarity between text and image
    sim = np.dot(text_emb, img_emb)
    print(f"Cosine similarity between text and dummy image: {sim:.4f}")

    print("\n--- 3. Testing Vector Store (Qdrant) ---")
    from backend.storage.vector_store import vector_store
    assert vector_store.health() == "healthy"
    print("Qdrant vector store is healthy and collections are ready.")

    print("\n--- 4. Testing Database (SQLite Async) ---")
    from backend.storage.database import init_db, AsyncSessionLocal
    from backend.models.db_models import Document
    from sqlalchemy import select

    async def run_db_test():
        await init_db()
        async with AsyncSessionLocal() as session:
            doc = Document(
                filename="test_doc.pdf",
                file_type="pdf",
                file_path="./test_doc.pdf",
                status="indexed"
            )
            session.add(doc)
            await session.commit()

            stmt = select(Document).where(Document.filename == "test_doc.pdf")
            res = await session.execute(stmt)
            fetched = res.scalar_one_or_none()
            print(f"Saved & fetched test document ID: {fetched.id}")
            await session.delete(fetched)
            await session.commit()
            print("Cleaned up test document.")

    asyncio.run(run_db_test())

    print("\n--- 5. Testing RAG Pipeline ---")
    from backend.core.rag_pipeline import rag_pipeline
    from backend.models.schemas import QueryRequest
    req = QueryRequest(text_query="neural network diagram", top_k=3)
    resp = rag_pipeline.run(req)
    print(f"Pipeline executed successfully. Retrieved sources: {len(resp.sources)}")
    print(f"Sample response answer: {resp.answer[:120]}...")

    print("\n>>> ALL CORE BACKEND CHECKS PASSED! <<<")

if __name__ == "__main__":
    test_imports_and_components()
