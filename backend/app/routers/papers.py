from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
from datetime import datetime, timezone
import uuid
import logging
import os

from ..models import Paper, Chunk
from ..database import get_db
from ..services.pdf_service import extract_text_from_pdf
from ..services.llm_service import llm_service, clean_text_format

router = APIRouter(prefix="/papers", tags=["papers"])

@router.post("/upload")
async def upload_paper(file: UploadFile = File(...), db=Depends(get_db)):
    """Upload a PDF paper"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_bytes = await file.read()
    
    try:
        full_text, total_pages, chunks = extract_text_from_pdf(file_bytes)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        title_lines = [line.strip() for line in full_text.split('\n')[:10] if line.strip()]
        title = title_lines[0] if title_lines else file.filename
        
        paper = Paper(
            title=title[:200],
            filename=file.filename,
            total_pages=total_pages,
            status="uploaded",
            chunks=[c.model_dump() for c in chunks]
        )
        
        doc = paper.model_dump()
        doc['upload_date'] = doc['upload_date'].isoformat()
        
        await db.papers.insert_one(doc)
        
        return {
            "id": paper.id,
            "title": paper.title,
            "filename": paper.filename,
            "total_pages": total_pages,
            "chunks_count": len(chunks),
            "status": "uploaded"
        }
    
    except Exception as e:
        logging.error(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.post("/{paper_id}/analyze")
async def analyze_paper(paper_id: str, db=Depends(get_db)):
    """Analyze paper and generate multi-level explanations"""
    
    paper_doc = await db.papers.find_one({"id": paper_id}, {"_id": 0})
    if not paper_doc:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    await db.papers.update_one({"id": paper_id}, {"$set": {"status": "processing"}})
    
    try:
        chunks = [Chunk(**c) for c in paper_doc.get('chunks', [])]
        paper_text = "\n\n".join([c.text for c in chunks])
        
        analysis = await llm_service.generate_multi_level_explanations(
            paper_text, 
            chunks,
            paper_doc.get('title', 'Research Paper')
        )
        
        analysis_doc = {
            "id": str(uuid.uuid4()),
            "paper_id": paper_id,
            **analysis,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.analyses.insert_one(analysis_doc)
        await db.papers.update_one({"id": paper_id}, {"$set": {"status": "ready"}})
        
        return {
            "paper_id": paper_id,
            "analysis_id": analysis_doc["id"],
            "status": "ready",
            **analysis
        }
    
    except Exception as e:
        logging.error(f"Error analyzing paper: {e}")
        await db.papers.update_one({"id": paper_id}, {"$set": {"status": "error"}})
        raise HTTPException(status_code=500, detail=f"Error analyzing paper: {str(e)}")

@router.get("")
async def get_papers(db=Depends(get_db)):
    """Get all papers"""
    papers = await db.papers.find({}, {"_id": 0, "chunks": 0}).to_list(100)
    return papers

@router.get("/{paper_id}")
async def get_paper(paper_id: str, db=Depends(get_db)):
    """Get paper details"""
    paper = await db.papers.find_one({"id": paper_id}, {"_id": 0})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper

@router.get("/{paper_id}/analysis")
async def get_paper_analysis(paper_id: str, db=Depends(get_db)):
    """Get paper analysis"""
    analysis = await db.analyses.find_one({"paper_id": paper_id}, {"_id": 0})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@router.post("/{paper_id}/chat")
async def chat_with_paper(paper_id: str, question: str, db=Depends(get_db)):
    """Chat with paper"""
    
    paper = await db.papers.find_one({"id": paper_id}, {"_id": 0})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    chunks = [Chunk(**c) for c in paper.get('chunks', [])]
    context = "\n\n".join([c.text for c in chunks[:10]])
    
    response = await llm_service.generate_text(
        question,
        system_message=f"You are a helpful assistant explaining this research paper. Answer naturally without markdown formatting. Context: {context[:2000]}"
    )
    
    return {
        "question": question,
        "answer": clean_text_format(response)
    }

@router.post("/{paper_id}/generate-audio")
async def generate_audio(paper_id: str, db=Depends(get_db)):
    """Generate audio from podcast script using TTS"""
    
    analysis = await db.analyses.find_one({"paper_id": paper_id}, {"_id": 0})
    if not analysis or 'podcast_script' not in analysis:
        raise HTTPException(status_code=404, detail="Podcast script not found")
    
    # For now, return the script with indication that audio generation is ready
    return {
        "status": "ready",
        "script": analysis['podcast_script'],
        "message": "Audio generation ready. Script available for TTS services.",
        "duration_estimate": len(analysis['podcast_script'].split()) * 0.4  # ~150 words per minute
    }
