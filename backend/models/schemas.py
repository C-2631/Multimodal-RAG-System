from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Health Schema
class HealthResponse(BaseModel):
    status: str = "ok"
    app_name: str
    version: str = "1.0.0"
    clip_model: str
    llm_provider: str
    llm_model: Optional[str] = None
    vector_db_status: str
    db_status: str
    audio_whisper_ready: bool = True
    web_search_ready: bool = True

# Document Schemas
class TextChunkResponse(BaseModel):
    id: str
    page_number: int
    chunk_index: int
    content: str
    token_count: int

class ImageRecordResponse(BaseModel):
    id: str
    page_number: int
    image_path: str
    image_url: str
    caption: Optional[str] = None
    width: int
    height: int

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    status: str
    page_count: int
    chunk_count: int
    image_count: int
    created_at: datetime
    error_message: Optional[str] = None

class DocumentDetailResponse(DocumentResponse):
    text_chunks: List[TextChunkResponse] = []
    images: List[ImageRecordResponse] = []

class DocumentStatusResponse(BaseModel):
    document_id: str
    status: str
    percent: int
    message: str
    chunk_count: int = 0
    image_count: int = 0

class UploadResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    status: str
    message: str

# Search / Retrieval Schemas
class SourceItem(BaseModel):
    type: Literal["text", "image"]
    content: str
    similarity_score: float
    document_id: str
    document_name: str
    page_number: int
    image_url: Optional[str] = None

class QueryRequest(BaseModel):
    text_query: Optional[str] = None
    image_base64: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=20)
    search_mode: Literal["all", "text", "image"] = "all"
    filter_document_id: Optional[str] = None
    stream: bool = False
    use_web: bool = False
    generate_audio: bool = False

class TextQueryRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=20)
    filter_document_id: Optional[str] = None
    stream: bool = False
    use_web: bool = False
    generate_audio: bool = False

class QueryResponse(BaseModel):
    query_text: Optional[str] = None
    has_query_image: bool = False
    answer: str
    sources: List[SourceItem] = []
    web_results: List[Dict[str, str]] = []
    audio_url: Optional[str] = None
    tokens_used: int = 0
    cost_usd: float = 0.0

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "en-US-JennyNeural"

# Stats and Collection Schemas
class CollectionInfo(BaseModel):
    name: str
    points_count: int
    vector_size: int
    status: str

class SystemStatsResponse(BaseModel):
    total_documents: int
    total_text_chunks: int
    total_images: int
    total_queries: int
    avg_latency_ms: float
    llm_provider: str
    llm_model: Optional[str] = None
