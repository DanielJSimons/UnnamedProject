# file: models.py  (SQLAlchemy 2.0 style – Python ≥3.9)
from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import (
    TIMESTAMP,
    CheckConstraint,
    BigInteger,
    Float,
    ForeignKey,
    Integer,
    Interval,
    Numeric,
    SmallInteger,
    String,
    Text,
    Column,
    DateTime,
    JSON,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector
from sqlalchemy.ext.declarative import declarative_base

# Connection URL loaded externally
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/videos",
)

Base = declarative_base()

# ───────────────────────────────────────────────────────────
#  CORE DIMENSION TABLES
# ───────────────────────────────────────────────────────────
class Video(Base):
    __tablename__ = "videos"

    video_id = Column(String, primary_key=True)
    published_at = Column(DateTime, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    channel_id = Column(String)
    channel_title = Column(String)
    duration = Column(Integer)  # Duration in seconds
    default_language = Column(String)
    category_id = Column(Integer)
    raw_snippet = Column(JSON)
    raw_content_details = Column(JSON)
    raw_status = Column(JSON)
    raw_player = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    thumbnails = relationship("Thumbnail", back_populates="video", cascade="all, delete-orphan")
    statistics = relationship("VideoStatistic", back_populates="video", uselist=False, cascade="all, delete-orphan")
    captions = relationship("Caption", back_populates="video", cascade="all, delete-orphan")


class VideoStatistic(Base):
    __tablename__ = "video_statistics"

    video_id = Column(String, ForeignKey('videos.video_id', ondelete='CASCADE'), primary_key=True)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    favorite_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    video = relationship("Video", back_populates="statistics")


class Thumbnail(Base):
    __tablename__ = "thumbnails"

    id = Column(Integer, primary_key=True)
    video_id = Column(String, ForeignKey('videos.video_id', ondelete='CASCADE'), nullable=False)
    quality = Column(String, nullable=False)  # default, medium, high, etc.
    url = Column(String, nullable=False)
    width = Column(Integer)
    height = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    video = relationship("Video", back_populates="thumbnails")


# ───────────────────────────────────────────────────────────
#  FACT TABLES (append-only, high cardinality)
# ───────────────────────────────────────────────────────────
class Caption(Base):
    __tablename__ = "captions"
    __table_args__ = (
        CheckConstraint("duration > 0", name="ck_caption_positive_duration"),
    )

    id = Column(Integer, primary_key=True)
    video_id = Column(String, ForeignKey('videos.video_id', ondelete='CASCADE'), nullable=False)
    start = Column(Float, nullable=False)  # Start time in seconds
    duration = Column(Float, nullable=False)  # Duration in seconds
    text = Column(Text, nullable=False)
    embedding = Column(JSON)  # For storing text embeddings
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    video = relationship("Video", back_populates="captions")
    entities:Mapped[List["EntitySentiment"]]= relationship(back_populates="caption")


class EntitySentiment(Base):
    __tablename__ = "entity_sentiments"

    entity_id:   Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    video_id:    Mapped[str]   = mapped_column(
        ForeignKey(Video.video_id, ondelete="CASCADE"), index=True
    )
    caption_id:  Mapped[Optional[int]] = mapped_column(
        ForeignKey(Caption.id, ondelete="SET NULL"), nullable=True
    )

    entity:    Mapped[str]   = mapped_column(Text, index=True)
    entity_type:Mapped[str] = mapped_column(String(16)) # e.g., PERSON, ORG
    sentence:  Mapped[str]   = mapped_column(Text)
    
    # MODIFICATION HERE: Increased length for sentiment
    sentiment: Mapped[str]   = mapped_column(String(20)) # Was String(12)
    
    class_idx: Mapped[int]   = mapped_column(SmallInteger)
    signed_value: Mapped[float] = mapped_column(Float) # This was int(cid-2) before, ensure float is okay or cast
    score:     Mapped[float]   = mapped_column(Float)
    exp_sent:  Mapped[float]   = mapped_column(Float)
    
    # MODIFICATIONS HERE: Allow NULLs for VAD scores
    valence:   Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    arousal:   Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    dominance: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    cont_score:Mapped[float]   = mapped_column(Float)
    start:     Mapped[Optional[float]] = mapped_column(Numeric(9, 2), nullable=True) # Ensure nullable if time_idx.get can return None
    duration:  Mapped[Optional[float]] = mapped_column(Numeric(9, 2), nullable=True) # Ensure nullable if time_idx.get can return None
    embedding: Mapped[List[float] | None] = mapped_column(Vector(1536), nullable=True)

    video:   Mapped["Video"] = relationship() # Add back_populates if you define the other side
    caption: Mapped[Optional[Caption]]  = relationship(back_populates="entities") # Make Optional if caption_id is nullable