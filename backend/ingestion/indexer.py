import os
import uuid
from typing import List
from sqlalchemy import select

from backend.config import settings
from backend.storage.database import AsyncSessionLocal
from backend.storage.vector_store import vector_store
from backend.models.db_models import Document, TextChunk, ImageRecord
from backend.core.embedder import embedder
from backend.ingestion.pdf_parser import pdf_parser
from backend.ingestion.image_loader import image_loader
from backend.ingestion.video_parser import video_parser
from backend.core.audio_service import audio_service
from backend.ingestion.text_chunker import text_chunker
from backend.utils.progress_manager import progress_manager
from backend.utils.logger import logger

class Indexer:
    """Orchestrates indexing of documents, images, video, and audio into database and vector store."""

    async def index_document(self, document_id: str):
        """Asynchronously index a document by its ID with real-time progress broadcast."""
        logger.info(f"Starting indexing for document ID: {document_id}")
        await progress_manager.broadcast(document_id, "started", "Beginning multimodal indexing...", 5)

        async with AsyncSessionLocal() as session:
            stmt = select(Document).where(Document.id == document_id)
            result = await session.execute(stmt)
            doc: Document = result.scalar_one_or_none()

            if not doc:
                logger.error(f"Document {document_id} not found.")
                await progress_manager.broadcast(document_id, "error", "Document not found in database.", 0)
                return

            try:
                doc.status = "indexing"
                await session.commit()

                if doc.file_type == "pdf":
                    await self._index_pdf(session, doc)
                elif doc.file_type == "image":
                    await self._index_image(session, doc)
                elif doc.file_type == "video":
                    await self._index_video(session, doc)
                elif doc.file_type == "audio":
                    await self._index_audio(session, doc)
                else:
                    raise ValueError(f"Unsupported file type: {doc.file_type}")

                doc.status = "indexed"
                await session.commit()
                logger.info(f"Successfully indexed document '{doc.filename}' (chunks={doc.chunk_count}, images={doc.image_count})")

                await progress_manager.broadcast(
                    document_id,
                    "completed",
                    f"Indexing ready. {doc.chunk_count} text chunks, {doc.image_count} visual elements indexed.",
                    100,
                    {"chunks": doc.chunk_count, "images": doc.image_count}
                )

            except Exception as e:
                logger.error(f"Failed to index document {document_id}: {e}", exc_info=True)
                doc.status = "failed"
                doc.error_message = str(e)
                await session.commit()
                await progress_manager.broadcast(document_id, "error", f"Indexing failed: {str(e)}", 0)

    async def _index_pdf(self, session, doc: Document):
        """Extract and index text and images from a PDF file."""
        await progress_manager.broadcast(doc.id, "progress", f"Extracting text & diagrams from {doc.filename}...", 20)
        pages_text, extracted_images = pdf_parser.parse(doc.file_path)
        doc.page_count = len(pages_text)

        await self._store_text_and_images(session, doc, pages_text, extracted_images)

    async def _index_video(self, session, doc: Document):
        """Extract keyframes and timestamps from video."""
        await progress_manager.broadcast(doc.id, "progress", f"Sampling keyframes and extracting scenes from {doc.filename}...", 20)
        timeline_chunks, extracted_frames = video_parser.parse(doc.file_path)
        doc.page_count = len(extracted_frames)

        await self._store_text_and_images(session, doc, timeline_chunks, extracted_frames)

    async def _index_audio(self, session, doc: Document):
        """Transcribe and index audio speech."""
        await progress_manager.broadcast(doc.id, "progress", f"Transcribing speech from {doc.filename} via Whisper...", 25)
        with open(doc.file_path, "rb") as f:
            audio_bytes = f.read()

        transcribed_text = audio_service.transcribe_audio(audio_bytes, filename=doc.filename)
        doc.page_count = 1

        pages_text = [{"page_number": 1, "text": transcribed_text}]
        await self._store_text_and_images(session, doc, pages_text, [])

    async def _store_text_and_images(self, session, doc: Document, pages_text, extracted_images):
        """Common embedding and persistence logic for text and images."""
        # 1. Chunk and embed text
        all_chunks = []
        for p in pages_text:
            chunks = text_chunker.chunk_text(p["text"], page_number=p["page_number"])
            all_chunks.extend(chunks)

        if all_chunks:
            chunk_contents = [c["content"] for c in all_chunks]
            await progress_manager.broadcast(doc.id, "progress", f"Embedding {len(chunk_contents)} text chunks via CLIP...", 45)
            text_embeddings = embedder.batch_embed_text(chunk_contents)

            qdrant_ids = []
            text_chunk_db_objects = []
            payloads = []

            for chunk, vec in zip(all_chunks, text_embeddings):
                point_id = str(uuid.uuid4())
                qdrant_ids.append(point_id)
                payloads.append({
                    "document_id": doc.id,
                    "doc_filename": doc.filename,
                    "page_number": chunk["page_number"],
                    "chunk_index": chunk["chunk_index"],
                    "content": chunk["content"]
                })
                text_chunk_db_objects.append(
                    TextChunk(
                        document_id=doc.id,
                        page_number=chunk["page_number"],
                        chunk_index=chunk["chunk_index"],
                        content=chunk["content"],
                        token_count=chunk["token_count"],
                        qdrant_id=point_id
                    )
                )

            vector_store.upsert_vectors(
                collection_name=settings.QDRANT_TEXT_COLLECTION,
                ids=qdrant_ids,
                vectors=text_embeddings,
                payloads=payloads
            )
            session.add_all(text_chunk_db_objects)
            doc.chunk_count = len(text_chunk_db_objects)

        # 2. Embed images/frames
        if extracted_images:
            image_paths = [img["image_path"] for img in extracted_images]
            await progress_manager.broadcast(doc.id, "progress", f"Embedding {len(image_paths)} visual elements via CLIP...", 75)
            image_embeddings = embedder.batch_embed_images(image_paths)

            image_qdrant_ids = []
            image_db_objects = []
            img_payloads = []

            for img_info, vec in zip(extracted_images, image_embeddings):
                point_id = str(uuid.uuid4())
                image_qdrant_ids.append(point_id)
                img_payloads.append({
                    "document_id": doc.id,
                    "doc_filename": doc.filename,
                    "page_number": img_info["page_number"],
                    "caption": img_info["caption"],
                    "image_url": img_info["image_url"]
                })
                image_db_objects.append(
                    ImageRecord(
                        document_id=doc.id,
                        page_number=img_info["page_number"],
                        image_path=img_info["image_path"],
                        caption=img_info["caption"],
                        width=img_info["width"],
                        height=img_info["height"],
                        qdrant_id=point_id
                    )
                )

            vector_store.upsert_vectors(
                collection_name=settings.QDRANT_IMAGE_COLLECTION,
                ids=image_qdrant_ids,
                vectors=image_embeddings,
                payloads=img_payloads
            )
            session.add_all(image_db_objects)
            doc.image_count = len(image_db_objects)

    async def _index_image(self, session, doc: Document):
        """Index a single standalone uploaded image."""
        await progress_manager.broadcast(doc.id, "progress", f"Processing image {doc.filename}...", 30)
        doc.page_count = 1
        img_info = image_loader.process_standalone_image(doc.file_path, doc.filename)

        await progress_manager.broadcast(doc.id, "progress", "Generating visual embedding via CLIP...", 60)
        image_embedding = embedder.embed_image(doc.file_path)

        point_id = str(uuid.uuid4())
        payload = {
            "document_id": doc.id,
            "doc_filename": doc.filename,
            "page_number": 1,
            "caption": img_info["caption"],
            "image_url": img_info["image_url"]
        }

        vector_store.upsert_vectors(
            collection_name=settings.QDRANT_IMAGE_COLLECTION,
            ids=[point_id],
            vectors=[image_embedding],
            payloads=[payload]
        )

        image_record = ImageRecord(
            document_id=doc.id,
            page_number=1,
            image_path=img_info["image_path"],
            caption=img_info["caption"],
            width=img_info["width"],
            height=img_info["height"],
            qdrant_id=point_id
        )
        session.add(image_record)
        doc.chunk_count = 0
        doc.image_count = 1

indexer = Indexer()
