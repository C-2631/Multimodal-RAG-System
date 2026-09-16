from typing import List, Optional, Union
import numpy as np
from PIL import Image

from backend.config import settings
from backend.core.embedder import embedder
from backend.storage.vector_store import vector_store
from backend.models.schemas import SourceItem
from backend.utils.logger import logger

class MultimodalRetriever:
    """Retrieves text chunks and images based on text, image, or multimodal queries."""

    def __init__(self):
        self.vector_store = vector_store
        self.embedder = embedder

    def compute_query_vector(
        self,
        text_query: Optional[str] = None,
        image_query: Optional[Union[Image.Image, str, bytes]] = None
    ) -> List[float]:
        """Compute the query embedding. If both text and image are present, combine them."""
        text_vec = None
        img_vec = None

        if text_query and text_query.strip():
            text_vec = np.array(self.embedder.embed_text(text_query.strip()))

        if image_query:
            img_vec = np.array(self.embedder.embed_image(image_query))

        if text_vec is not None and img_vec is not None:
            # Multi-modal fusion: average the two normalized vectors and re-normalize
            combined = (text_vec + img_vec) / 2.0
            norm = np.linalg.norm(combined)
            if norm > 0:
                combined = combined / norm
            return combined.tolist()
        elif text_vec is not None:
            return text_vec.tolist()
        elif img_vec is not None:
            return img_vec.tolist()
        else:
            raise ValueError("At least one of text_query or image_query must be provided.")

    def search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        search_mode: str = "all",
        filter_document_id: Optional[str] = None
    ) -> List[SourceItem]:
        """Search vector collections and return standardized SourceItem objects."""
        sources: List[SourceItem] = []

        # 1. Search text chunks if mode is 'all' or 'text'
        if search_mode in ["all", "text"]:
            text_results = self.vector_store.search(
                collection_name=settings.QDRANT_TEXT_COLLECTION,
                query_vector=query_vector,
                top_k=top_k,
                filter_document_id=filter_document_id
            )
            for res in text_results:
                payload = res["payload"]
                sources.append(
                    SourceItem(
                        type="text",
                        content=payload.get("content", ""),
                        similarity_score=round(res["score"], 4),
                        document_id=payload.get("document_id", ""),
                        document_name=payload.get("doc_filename", "Unknown Document"),
                        page_number=payload.get("page_number", 1),
                        image_url=None
                    )
                )

        # 2. Search images if mode is 'all' or 'image'
        if search_mode in ["all", "image"]:
            image_results = self.vector_store.search(
                collection_name=settings.QDRANT_IMAGE_COLLECTION,
                query_vector=query_vector,
                top_k=top_k,
                filter_document_id=filter_document_id
            )
            for res in image_results:
                payload = res["payload"]
                sources.append(
                    SourceItem(
                        type="image",
                        content=payload.get("caption", "Extracted diagram / image"),
                        similarity_score=round(res["score"], 4),
                        document_id=payload.get("document_id", ""),
                        document_name=payload.get("doc_filename", "Unknown Document"),
                        page_number=payload.get("page_number", 1),
                        image_url=payload.get("image_url", "")
                    )
                )

        # 3. Sort all retrieved items descending by similarity score
        sources.sort(key=lambda s: s.similarity_score, reverse=True)

        # Return top_k overall
        return sources[:top_k]

retriever = MultimodalRetriever()
