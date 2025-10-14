from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import io
import pdfplumber
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
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
    status: str = "uploaded"  # uploaded, processing, ready, error
    chunks: List[Chunk] = []

class Explanation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    paper_id: str
    level: str  # kid, student, researcher
    content: str
    evidence: List[str] = []  # chunk_ids
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class KeyPoints(BaseModel):
    problem: str = ""
    main_idea: str = ""
    approach: str = ""
    results: str = ""
    limitations: str = ""
    sources: List[str] = []

class GlossaryTerm(BaseModel):
    term: str
    definition: str

class PaperAnalysis(BaseModel):
    paper_id: str
    key_points: KeyPoints
    kid_explanation: str
    student_explanation: str
    researcher_explanation: str
    glossary: List[GlossaryTerm]
    evidence_chunks: List[str]

# Utility functions
def extract_text_from_pdf(file_bytes: bytes) -> tuple[str, int, List[Chunk]]:
    """Extract text from PDF and create chunks"""
    chunks = []
    full_text = ""
    
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        total_pages = len(pdf.pages)
        
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ""
            full_text += text + "\n\n"
            
            # Create chunks per page (can be improved with semantic chunking)
            if text.strip():
                paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
                for idx, para in enumerate(paragraphs):
                    if len(para) > 100:  # Only meaningful paragraphs
                        chunk = Chunk(
                            chunk_id=f"chunk_{page_num}_{idx}",
                            text=para,
                            page_number=page_num,
                            section="main"
                        )
                        chunks.append(chunk)
    
    return full_text, total_pages, chunks

async def generate_multi_level_explanations(paper_text: str, chunks: List[Chunk]) -> Dict:
    """Generate multi-level explanations using LLM"""
    
    # Initialize LLM chat
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    
    # Prepare context (use first few chunks as context)
    context_text = "\n\n".join([c.text for c in chunks[:10]])  # First 10 chunks
    
    # Extract key points
    key_points_chat = LlmChat(
        api_key=llm_key,
        session_id=f"keypoints_{uuid.uuid4()}",
        system_message="You are an AI research paper analyst. Extract key information from the paper."
    ).with_model("openai", "gpt-4o-mini")
    
    key_points_prompt = f"""Analyze this AI/ML research paper excerpt and extract:
1. Problem: What problem does this paper address?
2. Main Idea: What is the core contribution?
3. Approach: What methods/techniques are used?
4. Results: What are the key findings?
5. Limitations: What are the stated limitations?

Paper excerpt:
{context_text[:3000]}

Provide a structured JSON response with these fields: problem, main_idea, approach, results, limitations."""
    
    key_points_response = await key_points_chat.send_message(UserMessage(text=key_points_prompt))
    
    try:
        # Try to parse JSON from response
        key_points_data = json.loads(key_points_response)
    except:
        # Fallback if not valid JSON
        key_points_data = {
            "problem": "Analysis in progress",
            "main_idea": key_points_response[:200],
            "approach": "",
            "results": "",
            "limitations": ""
        }
    
    # Generate Kid-level explanation
    kid_chat = LlmChat(
        api_key=llm_key,
        session_id=f"kid_{uuid.uuid4()}",
        system_message="You are a teacher explaining AI research to children. Use simple words and fun analogies."
    ).with_model("openai", "gpt-4o-mini")
    
    kid_prompt = f"""Explain this AI research paper to a 10-year-old kid using simple words and fun analogies:

Problem: {key_points_data.get('problem', '')}
Main Idea: {key_points_data.get('main_idea', '')}

Make it fun and easy to understand! Use analogies like toys, games, or everyday things."""
    
    kid_explanation = await kid_chat.send_message(UserMessage(text=kid_prompt))
    
    # Generate Student-level explanation
    student_chat = LlmChat(
        api_key=llm_key,
        session_id=f"student_{uuid.uuid4()}",
        system_message="You are a university professor explaining AI research to undergraduate students."
    ).with_model("openai", "gpt-4o-mini")
    
    student_prompt = f"""Explain this AI research paper to an undergraduate student with some ML background:

Problem: {key_points_data.get('problem', '')}
Main Idea: {key_points_data.get('main_idea', '')}
Approach: {key_points_data.get('approach', '')}
Results: {key_points_data.get('results', '')}

Provide technical details but keep it accessible. Include relevant ML concepts."""
    
    student_explanation = await student_chat.send_message(UserMessage(text=student_prompt))
    
    # Generate Researcher-level explanation
    researcher_chat = LlmChat(
        api_key=llm_key,
        session_id=f"researcher_{uuid.uuid4()}",
        system_message="You are an AI researcher providing technical analysis for peer researchers."
    ).with_model("openai", "gpt-4o-mini")
    
    researcher_prompt = f"""Provide a technical researcher-level analysis of this AI paper:

Problem: {key_points_data.get('problem', '')}
Main Idea: {key_points_data.get('main_idea', '')}
Approach: {key_points_data.get('approach', '')}
Results: {key_points_data.get('results', '')}
Limitations: {key_points_data.get('limitations', '')}

Include technical depth, methodological insights, and critical analysis."""
    
    researcher_explanation = await researcher_chat.send_message(UserMessage(text=researcher_prompt))
    
    # Generate glossary
    glossary_chat = LlmChat(
        api_key=llm_key,
        session_id=f"glossary_{uuid.uuid4()}",
        system_message="You are a technical writer creating a glossary of AI/ML terms."
    ).with_model("openai", "gpt-4o-mini")
    
    glossary_prompt = f"""Extract 5-8 important technical terms from this text and provide brief definitions:

{context_text[:2000]}

Return as JSON array: [{"term": "...", "definition": "..."}]"""
    
    glossary_response = await glossary_chat.send_message(UserMessage(text=glossary_prompt))
    
    try:
        glossary_data = json.loads(glossary_response)
    except:
        glossary_data = [{"term": "AI", "definition": "Artificial Intelligence"}]
    
    return {
        "key_points": key_points_data,
        "kid_explanation": kid_explanation,
        "student_explanation": student_explanation,
        "researcher_explanation": researcher_explanation,
        "glossary": glossary_data,
        "evidence_chunks": [c.chunk_id for c in chunks[:5]]
    }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "ExplainAI Studio API"}

@api_router.post("/papers/upload")
async def upload_paper(file: UploadFile = File(...)):
    """Upload a PDF paper"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Read file
    file_bytes = await file.read()
    
    # Extract text and create chunks
    try:
        full_text, total_pages, chunks = extract_text_from_pdf(file_bytes)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        # Extract title (first meaningful line)
        title_lines = [line.strip() for line in full_text.split('\n')[:10] if line.strip()]
        title = title_lines[0] if title_lines else file.filename
        
        # Create paper document
        paper = Paper(
            title=title[:200],  # Limit title length
            filename=file.filename,
            total_pages=total_pages,
            status="uploaded",
            chunks=[c.model_dump() for c in chunks]
        )
        
        # Save to database
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

@api_router.post("/papers/{paper_id}/analyze")
async def analyze_paper(paper_id: str):
    """Analyze paper and generate multi-level explanations"""
    
    # Get paper from database
    paper_doc = await db.papers.find_one({"id": paper_id}, {"_id": 0})
    if not paper_doc:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    # Update status to processing
    await db.papers.update_one({"id": paper_id}, {"$set": {"status": "processing"}})
    
    try:
        # Convert chunks back to Chunk objects
        chunks = [Chunk(**c) for c in paper_doc.get('chunks', [])]
        
        # Generate explanations
        paper_text = "\n\n".join([c.text for c in chunks])
        analysis = await generate_multi_level_explanations(paper_text, chunks)
        
        # Save analysis to database
        analysis_doc = {
            "id": str(uuid.uuid4()),
            "paper_id": paper_id,
            "key_points": analysis["key_points"],
            "kid_explanation": analysis["kid_explanation"],
            "student_explanation": analysis["student_explanation"],
            "researcher_explanation": analysis["researcher_explanation"],
            "glossary": analysis["glossary"],
            "evidence_chunks": analysis["evidence_chunks"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.analyses.insert_one(analysis_doc)
        
        # Update paper status
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

@api_router.get("/papers")
async def get_papers():
    """Get all papers"""
    papers = await db.papers.find({}, {"_id": 0, "chunks": 0}).to_list(100)
    return papers

@api_router.get("/papers/{paper_id}")
async def get_paper(paper_id: str):
    """Get paper details"""
    paper = await db.papers.find_one({"id": paper_id}, {"_id": 0})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper

@api_router.get("/papers/{paper_id}/analysis")
async def get_paper_analysis(paper_id: str):
    """Get paper analysis"""
    analysis = await db.analyses.find_one({"paper_id": paper_id}, {"_id": 0})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@api_router.post("/papers/{paper_id}/chat")
async def chat_with_paper(paper_id: str, question: str):
    """Chat with paper (Ask Paper feature)"""
    
    # Get paper chunks
    paper = await db.papers.find_one({"id": paper_id}, {"_id": 0})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    chunks = [Chunk(**c) for c in paper.get('chunks', [])]
    context = "\n\n".join([c.text for c in chunks[:10]])  # Use first 10 chunks
    
    # Use LLM to answer
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    chat = LlmChat(
        api_key=llm_key,
        session_id=f"chat_{paper_id}",
        system_message=f"You are an AI assistant helping users understand this research paper. Answer questions based on the paper content. Paper context: {context[:2000]}"
    ).with_model("openai", "gpt-4o-mini")
    
    response = await chat.send_message(UserMessage(text=question))
    
    return {
        "question": question,
        "answer": response
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()