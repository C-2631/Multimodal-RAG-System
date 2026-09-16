import time
import json
import uuid
import os
from typing import Optional, AsyncGenerator, List, Dict
from PIL import Image

from backend.config import settings
from backend.core.retriever import retriever
from backend.core.reranker import reranker
from backend.core.generator import generator
from backend.core.web_search import web_search_service
from backend.core.audio_service import audio_service
from backend.storage.object_store import object_store
from backend.models.schemas import QueryRequest, QueryResponse, SourceItem
from backend.storage.database import AsyncSessionLocal
from backend.models.db_models import QueryAnalytics
from backend.utils.image_utils import base64_to_pil
from backend.utils.logger import logger

class MultimodalRAGPipeline:
    """End-to-end Multimodal RAG Pipeline with local vector search, web search, streaming, and audio."""

    def __init__(self):
        self.retriever = retriever
        self.reranker = reranker
        self.generator = generator
        self.web_search = web_search_service
        self.audio = audio_service

    def run(self, request: QueryRequest) -> QueryResponse:
        """Execute complete retrieval and generation cycle (non-streaming)."""
        start_time = time.time()
        logger.info(f"Processing query: text='{request.text_query}', has_image={bool(request.image_base64)}, use_web={request.use_web}")

        # 1. Parse image if provided in base64
        pil_image: Optional[Image.Image] = None
        if request.image_base64:
            try:
                pil_image = base64_to_pil(request.image_base64)
            except Exception as e:
                logger.warning(f"Could not parse query base64 image: {e}")

        # 2. Compute query vector
        query_vector = self.retriever.compute_query_vector(
            text_query=request.text_query,
            image_query=pil_image
        )

        # 3. Retrieve local sources (text chunks + images)
        candidate_count = request.top_k * 2 if settings.RERANKING_ENABLED else request.top_k
        sources = self.retriever.search(
            query_vector=query_vector,
            top_k=candidate_count,
            search_mode=request.search_mode,
            filter_document_id=request.filter_document_id
        )

        # 4. Optional Re-ranking
        if settings.RERANKING_ENABLED and request.text_query:
            sources = self.reranker.rerank(
                query=request.text_query,
                sources=sources,
                top_k=request.top_k
            )
        else:
            sources = sources[:request.top_k]

        # 5. Live Web Search (if requested OR if local knowledge base has weak results < 0.60 score)
        web_results = []
        is_weak_local = not sources or (sources and sources[0].similarity_score < 0.60)
        if (request.use_web or is_weak_local) and request.text_query:
            logger.info(f"Augmenting query with live web search for: '{request.text_query}'...")
            web_results = self.web_search.search_text(request.text_query, max_results=5)

            # Augment visual evidence with web images if no local images found
            image_sources = [s for s in sources if s.type == "image"]
            if not image_sources:
                try:
                    web_imgs = self.web_search.search_images(request.text_query, max_results=4)
                    for w_img in web_imgs:
                        if w_img.get("image_url"):
                            sources.append(SourceItem(
                                type="image",
                                content=w_img.get("title") or f"Visual evidence: {request.text_query}",
                                document_name="Web Visual Index",
                                document_id="web-visual",
                                page_number=1,
                                similarity_score=0.82,
                                image_url=w_img.get("image_url")
                            ))
                except Exception as e:
                    logger.debug(f"Web image query skipped: {e}")

        # 6. Generate answer grounded in multimodal context
        query_label = request.text_query or "[Visual similarity search]"
        answer, tokens, cost = self.generator.generate_answer(
            query=query_label,
            sources=sources,
            web_results=web_results
        )

        # 7. Optional Text-to-Speech audio generation
        audio_url = None
        if request.generate_audio:
            try:
                import concurrent.futures
                import asyncio

                def _generate():
                    worker_loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(worker_loop)
                    try:
                        return worker_loop.run_until_complete(self.audio.generate_speech_bytes(answer))
                    finally:
                        worker_loop.close()

                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                    audio_bytes = pool.submit(_generate).result(timeout=25)

                if audio_bytes:
                    audio_filename = f"tts_{uuid.uuid4()}.mp3"
                    audio_path = os.path.join(object_store.base_dir, audio_filename)
                    with open(audio_path, "wb") as f:
                        f.write(audio_bytes)
                    audio_url = f"/static/uploads/{audio_filename}"
            except Exception as e:
                logger.warning(f"Failed to generate TTS audio: {e}")

        latency_ms = int((time.time() - start_time) * 1000)

        # 8. Save analytics
        self._record_analytics_sync(
            query_text=request.text_query,
            has_image=bool(request.image_base64),
            results_count=len(sources),
            tokens_used=tokens,
            cost_usd=cost,
            latency_ms=latency_ms
        )

        return QueryResponse(
            query_text=request.text_query,
            has_query_image=bool(request.image_base64),
            answer=answer,
            sources=sources,
            web_results=web_results,
            audio_url=audio_url,
            tokens_used=tokens,
            cost_usd=cost
        )

    async def run_stream(self, request: QueryRequest) -> AsyncGenerator[str, None]:
        """Streaming retrieval and generation via Server-Sent Events (SSE)."""
        start_time = time.time()
        logger.info(f"Processing streaming query: text='{request.text_query}'")

        pil_image: Optional[Image.Image] = None
        if request.image_base64:
            try:
                pil_image = base64_to_pil(request.image_base64)
            except Exception as e:
                logger.warning(f"Could not parse query base64 image: {e}")

        query_vector = self.retriever.compute_query_vector(
            text_query=request.text_query,
            image_query=pil_image
        )

        candidate_count = request.top_k * 2 if settings.RERANKING_ENABLED else request.top_k
        sources = self.retriever.search(
            query_vector=query_vector,
            top_k=candidate_count,
            search_mode=request.search_mode,
            filter_document_id=request.filter_document_id
        )

        if settings.RERANKING_ENABLED and request.text_query:
            sources = self.reranker.rerank(
                query=request.text_query,
                sources=sources,
                top_k=request.top_k
            )
        else:
            sources = sources[:request.top_k]

        web_results = []
        is_weak_local = not sources or (sources and sources[0].similarity_score < 0.40)
        if (request.use_web or is_weak_local) and request.text_query:
            web_results = self.web_search.search_text(request.text_query, max_results=4)

        # Send initial event with retrieved sources and web results
        meta_event = {
            "type": "sources",
            "sources": [s.model_dump() for s in sources],
            "web_results": web_results
        }
        yield f"data: {json.dumps(meta_event)}\n\n"

        # Stream answer tokens from generator
        query_label = request.text_query or "[Visual similarity search]"
        async for delta in self.generator.generate_answer_stream(query_label, sources, web_results):
            token_event = {"type": "delta", "content": delta}
            yield f"data: {json.dumps(token_event)}\n\n"

        latency_ms = int((time.time() - start_time) * 1000)
        done_event = {"type": "done", "latency_ms": latency_ms}
        yield f"data: {json.dumps(done_event)}\n\n"

    def _record_analytics_sync(self, query_text, has_image, results_count, tokens_used, cost_usd, latency_ms):
        """Asynchronously log analytics without blocking response."""
        import asyncio
        async def _log():
            try:
                async with AsyncSessionLocal() as session:
                    record = QueryAnalytics(
                        query_text=query_text,
                        query_has_image=1 if has_image else 0,
                        results_count=results_count,
                        tokens_used=tokens_used,
                        cost_usd=int(cost_usd * 100000),
                        latency_ms=latency_ms
                    )
                    session.add(record)
                    await session.commit()
            except Exception as e:
                logger.warning(f"Failed to log query analytics: {e}")

        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(_log())
        except Exception:
            pass

rag_pipeline = MultimodalRAGPipeline()
