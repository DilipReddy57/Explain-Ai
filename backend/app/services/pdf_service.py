import io
import logging
import pdfplumber
from typing import List, Tuple
from ..models import Chunk

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int, List[Chunk]]:
    """Extract text from PDF and create chunks"""
    chunks = []
    full_text = ""
    
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            total_pages = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ""
                full_text += text + "\n\n"
                
                if text.strip():
                    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
                    for idx, para in enumerate(paragraphs):
                        if len(para) > 100:
                            chunk = Chunk(
                                chunk_id=f"chunk_{page_num}_{idx}",
                                text=para,
                                page_number=page_num,
                                section="main"
                            )
                            chunks.append(chunk)
        
        return full_text, total_pages, chunks
    except Exception as e:
        logging.error(f"Error extracting text from PDF: {e}")
        raise
