import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Server settings
    APP_NAME: str = "Multimodal RAG System"
    APP_ENV: str = "development"
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "*"
    ]

    # Storage Paths
    UPLOAD_DIR: str = "./data/uploads"
    QDRANT_STORAGE_PATH: str = "./data/qdrant"
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/metadata.db"

    # Qdrant Vector DB
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_TEXT_COLLECTION: str = "text_chunks"
    QDRANT_IMAGE_COLLECTION: str = "images"

    # CLIP Model
    CLIP_MODEL_NAME: str = "openai/clip-vit-base-patch32"
    EMBEDDING_DIM: int = 512
    DEVICE: str = "cpu"

    # LLM Settings & Provider Selection (set: 'openrouter', 'openai', 'local')
    # Default: OpenRouter is used for all LLM, Vision, and STT tasks.
    LLM_PROVIDER: Optional[str] = None
    LLM_MODEL: Optional[str] = None

    # Groq API (kept for legacy compatibility, not used when LLM_PROVIDER=openrouter)
    GROQ_API_KEY: Optional[str] = None
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_VISION_MODEL: str = "llama-3.2-11b-vision-preview"

    # OpenRouter API — PRIMARY provider for text, vision, and audio transcription
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "nvidia/nemotron-3-ultra-550b-a55b:free"
    OPENROUTER_VISION_MODEL: str = "nex-agi/nex-n2.5-pro:free"
    OPENROUTER_WHISPER_MODEL: str = "openai/whisper-large-v3"  # For STT via OpenRouter

    # OpenAI API
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_VISION_MODEL: str = "gpt-4o-mini"

    # Anthropic / Gemini
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Processing & Search
    MAX_CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64
    TOP_K_RESULTS: int = 5
    RERANKING_ENABLED: bool = True

    # Google Search APIs (for live web, image & video search)
    # Get free key at: https://console.cloud.google.com → Enable "Custom Search JSON API"
    # Create CSE at: https://programmablesearch.google.com (set to search the entire web)
    GOOGLE_API_KEY: Optional[str] = None        # Google Cloud API key
    GOOGLE_CSE_ID: Optional[str] = None          # Custom Search Engine ID
    YOUTUBE_API_KEY: Optional[str] = None        # YouTube Data API v3 key (same Google key works)

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_effective_provider(self) -> str:
        """Returns the active LLM provider. Exclusively uses OpenRouter."""
        if self.OPENROUTER_API_KEY:
            return "openrouter"
        return "local"

settings = Settings()

# Ensure local data directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.QDRANT_STORAGE_PATH, exist_ok=True)
os.makedirs(os.path.dirname(settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "")), exist_ok=True)
