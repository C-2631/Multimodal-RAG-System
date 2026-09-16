import re
from typing import List
from backend.models.schemas import SourceItem
from backend.utils.logger import logger

class MultimodalReranker:
    """
    Reranks retrieved multimodal sources using hybrid scoring:
    combines vector similarity score with keyword term frequency and modality weighting.
    """

    def __init__(self):
        pass

    def _compute_lexical_overlap(self, query: str, text: str) -> float:
        """Compute token overlap ratio between query and text content."""
        if not query or not text:
            return 0.0

        query_tokens = set(re.findall(r"\w+", query.lower()))
        if not query_tokens:
            return 0.0

        text_tokens = set(re.findall(r"\w+", text.lower()))
        overlap = query_tokens.intersection(text_tokens)
        return len(overlap) / len(query_tokens)

    def rerank(self, query: str, sources: List[SourceItem], top_k: int = 5) -> List[SourceItem]:
        """
        Rerank sources using a weighted blend:
        final_score = 0.75 * vector_similarity + 0.25 * lexical_overlap
        """
        if not sources:
            return []

        scored_sources = []
        for s in sources:
            lexical_score = self._compute_lexical_overlap(query, s.content)
            # Fused score
            fused_score = (0.75 * s.similarity_score) + (0.25 * lexical_score)

            # Boost exact phrase match if present
            if query and query.lower() in s.content.lower():
                fused_score = min(1.0, fused_score + 0.05)

            # Update similarity score with reranked value
            s_copy = s.model_copy()
            s_copy.similarity_score = round(fused_score, 4)
            scored_sources.append(s_copy)

        # Sort descending by fused score
        scored_sources.sort(key=lambda x: x.similarity_score, reverse=True)
        return scored_sources[:top_k]

reranker = MultimodalReranker()
