import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship

def get_utc_now():
    return datetime.now(timezone.utc)

Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'pdf', 'image'
    file_path = Column(String(500), nullable=False)
    status = Column(String(50), default="pending")  # 'pending', 'indexing', 'indexed', 'failed'
    page_count = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)
    image_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    text_chunks = relationship("TextChunk", back_populates="document", cascade="all, delete-orphan")
    images = relationship("ImageRecord", back_populates="document", cascade="all, delete-orphan")


class TextChunk(Base):
    __tablename__ = "text_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, default=1)
    chunk_index = Column(Integer, default=0)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    qdrant_id = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    document = relationship("Document", back_populates="text_chunks")


class ImageRecord(Base):
    __tablename__ = "images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, default=1)
    image_path = Column(String(500), nullable=False)
    caption = Column(Text, nullable=True)
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    qdrant_id = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    document = relationship("Document", back_populates="images")


class QueryAnalytics(Base):
    __tablename__ = "query_analytics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    query_text = Column(Text, nullable=True)
    query_has_image = Column(Integer, default=0)
    results_count = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    cost_usd = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)
