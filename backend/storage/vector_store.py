import os
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest_models
from backend.config import settings
from backend.utils.logger import logger

class VectorStore:
    """Wrapper around Qdrant for multimodal vector indexing and search."""

    def __init__(self):
        self.text_collection = settings.QDRANT_TEXT_COLLECTION
        self.image_collection = settings.QDRANT_IMAGE_COLLECTION
        self.dim = settings.EMBEDDING_DIM

        # Initialize client: network mode if QDRANT_URL is provided, else local embedded disk mode
        if settings.QDRANT_URL and settings.QDRANT_URL.strip():
            url = settings.QDRANT_URL.strip()
            api_key = settings.QDRANT_API_KEY.strip() if settings.QDRANT_API_KEY else None
            logger.info(f"Connecting to Qdrant server at {url}")
            self.client = QdrantClient(
                url=url,
                api_key=api_key
            )
        else:
            storage_path = os.path.abspath(settings.QDRANT_STORAGE_PATH)
            logger.info(f"Using local embedded Qdrant storage at {storage_path}")
            self.client = QdrantClient(path=storage_path)

        self.ensure_collections()

    def ensure_collections(self):
        """Create collections for text chunks and images if they do not exist."""
        existing_collections = [c.name for c in self.client.get_collections().collections]

        for col_name in [self.text_collection, self.image_collection]:
            if col_name not in existing_collections:
                logger.info(f"Creating Qdrant collection '{col_name}' (dim={self.dim}, distance=Cosine)...")
                self.client.create_collection(
                    collection_name=col_name,
                    vectors_config=rest_models.VectorParams(
                        size=self.dim,
                        distance=rest_models.Distance.COSINE
                    )
                )
            else:
                logger.info(f"Qdrant collection '{col_name}' already exists.")

    def upsert_vectors(
        self,
        collection_name: str,
        ids: List[str],
        vectors: List[List[float]],
        payloads: List[Dict[str, Any]]
    ):
        """Insert or update vectors with payloads in the specified collection."""
        points = [
            rest_models.PointStruct(
                id=point_id,
                vector=vector,
                payload=payload
            )
            for point_id, vector, payload in zip(ids, vectors, payloads)
        ]
        self.client.upsert(
            collection_name=collection_name,
            points=points
        )
        logger.info(f"Upserted {len(points)} vectors into '{collection_name}'")

    def search(
        self,
        collection_name: str,
        query_vector: List[float],
        top_k: int = 5,
        filter_document_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search nearest neighbors in the given collection."""
        query_filter = None
        if filter_document_id:
            query_filter = rest_models.Filter(
                must=[
                    rest_models.FieldCondition(
                        key="document_id",
                        match=rest_models.MatchValue(value=filter_document_id)
                    )
                ]
            )

        # Modern Qdrant API: query_points
        results = self.client.query_points(
            collection_name=collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=top_k,
            with_payload=True
        )

        formatted = []
        for hit in results.points:
            formatted.append({
                "id": str(hit.id),
                "score": float(hit.score),
                "payload": hit.payload or {}
            })
        return formatted

    def delete_document_vectors(self, document_id: str):
        """Delete all text and image vectors associated with a document_id."""
        for col_name in [self.text_collection, self.image_collection]:
            try:
                self.client.delete(
                    collection_name=col_name,
                    points_selector=rest_models.FilterSelector(
                        filter=rest_models.Filter(
                            must=[
                                rest_models.FieldCondition(
                                    key="document_id",
                                    match=rest_models.MatchValue(value=document_id)
                                )
                            ]
                        )
                    )
                )
                logger.info(f"Deleted vectors for doc '{document_id}' from '{col_name}'")
            except Exception as e:
                logger.warning(f"Error deleting vectors from '{col_name}' for doc '{document_id}': {e}")

    def health(self) -> str:
        """Check if Qdrant is responsive."""
        try:
            _ = self.client.get_collections()
            return "healthy"
        except Exception as e:
            logger.error(f"Qdrant health check failed: {e}")
            return f"unhealthy: {e}"

vector_store = VectorStore()
