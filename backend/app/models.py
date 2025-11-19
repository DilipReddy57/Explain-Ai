from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

class Chunk(BaseModel):
    chunk_id: str
    text: str
    page_number: int
    section: str = "main"

class Paper(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    filename: str
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_pages: int = 0
    status: str = "uploaded"
    chunks: List[Chunk] = []

class VisualConcept(BaseModel):
    concept: str
    description: str
    image_data: str  # base64 encoded
