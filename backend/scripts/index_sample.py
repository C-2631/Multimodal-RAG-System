import os
import sys
import asyncio
from sqlalchemy import select

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from backend.storage.database import init_db, AsyncSessionLocal
from backend.models.db_models import Document
from backend.ingestion.indexer import indexer
from backend.core.rag_pipeline import rag_pipeline
from backend.models.schemas import QueryRequest

async def main():
    await init_db()

    pdf_path = os.path.abspath("./data/sample_docs/multimodal_rag_whitepaper.pdf")
    if not os.path.exists(pdf_path):
        print(f"Sample PDF not found at {pdf_path}")
        return

    print(f"Indexing PDF: {pdf_path}...")
    async with AsyncSessionLocal() as session:
        # Check if already indexed
        stmt = select(Document).where(Document.filename == "multimodal_rag_whitepaper.pdf")
        existing = (await session.execute(stmt)).scalar_one_or_none()

        if existing:
            doc_id = existing.id
            print(f"Document already recorded with ID: {doc_id}")
        else:
            doc = Document(
                filename="multimodal_rag_whitepaper.pdf",
                file_type="pdf",
                file_path=pdf_path,
                status="pending"
            )
            session.add(doc)
            await session.commit()
            await session.refresh(doc)
            doc_id = doc.id
            print(f"Created document record: {doc_id}")

    # Index document
    await indexer.index_document(doc_id)
    print("Indexing completed!")

    # Test query 1: Text query asking about CLIP
    print("\n--- Running Multimodal Query 1: 'How does CLIP align text and images in vector space?' ---")
    req1 = QueryRequest(text_query="How does CLIP align text and images in vector space?", top_k=3)
    resp1 = rag_pipeline.run(req1)
    print(f"Answer:\n{resp1.answer}\n")
    print(f"Retrieved {len(resp1.sources)} sources:")
    for i, s in enumerate(resp1.sources, 1):
        print(f"  [{i}] ({s.type}) {s.document_name} P.{s.page_number} | Score: {s.similarity_score} | Content: {s.content[:80]}...")

    # Test query 2: Visual search for diagram
    print("\n--- Running Multimodal Query 2: 'architecture diagram dual-encoder' ---")
    req2 = QueryRequest(text_query="architecture diagram dual-encoder", top_k=3)
    resp2 = rag_pipeline.run(req2)
    print(f"Answer:\n{resp2.answer}\n")
    print(f"Retrieved {len(resp2.sources)} sources:")
    for i, s in enumerate(resp2.sources, 1):
        print(f"  [{i}] ({s.type}) {s.document_name} P.{s.page_number} | Score: {s.similarity_score} | Content: {s.content[:80]}...")

if __name__ == "__main__":
    asyncio.run(main())
