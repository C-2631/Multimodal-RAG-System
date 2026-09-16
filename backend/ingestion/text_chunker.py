from typing import List, Dict, Any
from backend.config import settings
from backend.utils.logger import logger

class TextChunker:
    """Splits text into chunks using sliding window with token/word overlap."""

    def __init__(self, chunk_size: int = settings.MAX_CHUNK_SIZE, overlap: int = settings.CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str, page_number: int = 1) -> List[Dict[str, Any]]:
        """
        Split a document page's text into overlapping chunks.
        Returns a list of dicts: [{'page_number': int, 'chunk_index': int, 'content': str, 'token_count': int}]
        """
        if not text or not text.strip():
            return []

        words = text.split()
        if not words:
            return []

        chunks = []
        start = 0
        chunk_index = 0
        step = max(1, self.chunk_size - self.overlap)

        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk_words = words[start:end]
            chunk_content = " ".join(chunk_words)

            chunks.append({
                "page_number": page_number,
                "chunk_index": chunk_index,
                "content": chunk_content,
                "token_count": len(chunk_words)
            })

            chunk_index += 1
            if end >= len(words):
                break
            start += step

        return chunks

text_chunker = TextChunker()
