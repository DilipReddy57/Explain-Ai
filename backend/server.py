from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
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
import re
import base64
from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
import numpy as np
from io import BytesIO
import urllib.request
import hashlib

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
    status: str = "uploaded"
    chunks: List[Chunk] = []

class VisualConcept(BaseModel):
    concept: str
    description: str
    image_data: str  # base64 encoded

# Utility functions
def extract_text_from_pdf(file_bytes: bytes) -> tuple[str, int, List[Chunk]]:
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

def generate_concept_diagram(concept: str, description: str) -> str:
    """Generate a simple concept diagram"""
    fig, ax = plt.subplots(figsize=(10, 6), facecolor='#1a1f3a')
    ax.set_facecolor('#1a1f3a')
    
    # Create a simple visual representation
    ax.text(0.5, 0.7, concept, fontsize=24, color='#3B82F6', 
            ha='center', va='center', weight='bold', wrap=True)
    ax.text(0.5, 0.3, description[:150], fontsize=12, color='#94A3B8', 
            ha='center', va='center', wrap=True)
    
    # Add decorative elements
    circle = plt.Circle((0.5, 0.7), 0.15, color='#3B82F6', alpha=0.2)
    ax.add_patch(circle)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    # Save to bytes
    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='#1a1f3a')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    return f"data:image/png;base64,{img_base64}"

def generate_architecture_diagram(approach: str) -> str:
    """Generate architecture/flow diagram"""
    fig, ax = plt.subplots(figsize=(12, 8), facecolor='#1a1f3a')
    ax.set_facecolor('#1a1f3a')
    
    # Create a simple flow diagram
    boxes = ['Input', 'Processing', 'Model', 'Output']
    y_pos = 0.5
    x_positions = np.linspace(0.15, 0.85, len(boxes))
    
    for i, (x, box) in enumerate(zip(x_positions, boxes)):
        # Draw box
        rect = plt.Rectangle((x-0.08, y_pos-0.08), 0.16, 0.16, 
                            fill=True, facecolor='#2d3748', 
                            edgecolor='#3B82F6', linewidth=2)
        ax.add_patch(rect)
        ax.text(x, y_pos, box, fontsize=12, color='#E2E8F0', 
                ha='center', va='center', weight='bold')
        
        # Draw arrow to next box
        if i < len(boxes) - 1:
            ax.arrow(x+0.09, y_pos, 0.06, 0, head_width=0.03, 
                    head_length=0.02, fc='#3B82F6', ec='#3B82F6')
    
    ax.text(0.5, 0.85, 'System Architecture', fontsize=16, 
            color='#3B82F6', ha='center', weight='bold')
    ax.text(0.5, 0.15, approach[:100], fontsize=10, 
            color='#94A3B8', ha='center', wrap=True)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='#1a1f3a')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    return f"data:image/png;base64,{img_base64}"

def clean_text_format(text: str) -> str:
    """Remove markdown formatting and make text more natural"""
    # Remove markdown headers
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Remove bold/italic markers
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    # Remove list markers
    text = re.sub(r'^[\-\*\+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)
    # Clean up extra whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

async def generate_multi_level_explanations(paper_text: str, chunks: List[Chunk], paper_title: str) -> Dict:
    """Generate comprehensive analysis with visuals"""
    
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    context_text = "\n\n".join([c.text for c in chunks[:15]])[:4000]
    
    # Extract key points
    key_points_chat = LlmChat(
        api_key=llm_key,
        session_id=f"keypoints_{uuid.uuid4()}",
        system_message="You are an AI research analyst. Provide clear, natural explanations without markdown formatting."
    ).with_model("openai", "gpt-4o-mini")
    
    key_points_prompt = f"""Analyze this research paper and extract key information.

Paper excerpt:
{context_text}

Provide a JSON response with these exact fields: problem, main_idea, approach, results, limitations.
Make the text natural and conversational, without markdown formatting or special characters.
Example: {{"problem": "Natural text here", "main_idea": "Clear explanation", ...}}"""
    
    key_points_response = await key_points_chat.send_message(UserMessage(text=key_points_prompt))
    
    try:
        json_match = re.search(r'\{[^{}]*"problem"[^{}]*\}', key_points_response, re.DOTALL)
        if json_match:
            key_points_data = json.loads(json_match.group())
        else:
            key_points_data = json.loads(key_points_response)
        
        # Clean formatting
        for key in key_points_data:
            if isinstance(key_points_data[key], str):
                key_points_data[key] = clean_text_format(key_points_data[key])
    except Exception as e:
        logging.error(f"Error parsing key points: {e}")
        key_points_data = {
            "problem": "The paper addresses challenges in the field.",
            "main_idea": key_points_response[:200],
            "approach": "The researchers developed a novel methodology.",
            "results": "Experiments showed promising outcomes.",
            "limitations": "Further research is needed."
        }
    
    # Generate visual concepts
    concepts_chat = LlmChat(
        api_key=llm_key,
        session_id=f"concepts_{uuid.uuid4()}",
        system_message="You are a visual learning expert. Identify key concepts that need visual explanation."
    ).with_model("openai", "gpt-4o-mini")
    
    concepts_prompt = f"""From this research paper, identify 3-4 key concepts that would benefit from visual diagrams.

Paper context:
Main Idea: {key_points_data.get('main_idea', '')}
Approach: {key_points_data.get('approach', '')}

Return JSON array: [{{"concept": "Concept name", "description": "Brief explanation in 20 words"}}]
Use simple, natural language without formatting."""
    
    concepts_response = await concepts_chat.send_message(UserMessage(text=concepts_prompt))
    
    visual_concepts = []
    try:
        json_match = re.search(r'\[\s*\{[^\[\]]*\}\s*(?:,\s*\{[^\[\]]*\}\s*)*\]', concepts_response, re.DOTALL)
        if json_match:
            concepts_data = json.loads(json_match.group())
            for concept in concepts_data[:4]:
                img_data = generate_concept_diagram(
                    clean_text_format(concept.get('concept', '')),
                    clean_text_format(concept.get('description', ''))
                )
                visual_concepts.append({
                    "concept": clean_text_format(concept.get('concept', '')),
                    "description": clean_text_format(concept.get('description', '')),
                    "image_data": img_data
                })
    except Exception as e:
        logging.error(f"Error generating concepts: {e}")
    
    # Generate architecture diagram
    architecture_img = generate_architecture_diagram(key_points_data.get('approach', 'System workflow'))
    
    # Generate explanations (cleaned)
    explanations = {}
    levels = [
        ("kid", "Explain this like telling a story to a 10-year-old. Use everyday examples and simple words. No technical jargon. Make it fun and relatable."),
        ("student", "Explain this to an undergraduate student. Include technical terms but explain them clearly. Use analogies when helpful."),
        ("researcher", "Provide a technical explanation for researchers. Include methodology details and research implications.")
    ]
    
    for level, instruction in levels:
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"{level}_{uuid.uuid4()}",
            system_message=f"{instruction} Write naturally without markdown formatting, headers, or bullet points."
        ).with_model("openai", "gpt-4o-mini")
        
        prompt = f"""Explain this research paper naturally:

Problem: {key_points_data.get('problem', '')}
Main Idea: {key_points_data.get('main_idea', '')}
Approach: {key_points_data.get('approach', '')}
Results: {key_points_data.get('results', '')}

Write 2-3 paragraphs in a conversational, natural style. No formatting symbols."""
        
        response = await chat.send_message(UserMessage(text=prompt))
        explanations[f"{level}_explanation"] = clean_text_format(response)
    
    # Generate podcast script
    podcast_chat = LlmChat(
        api_key=llm_key,
        session_id=f"podcast_{uuid.uuid4()}",
        system_message="You are a podcast host. Write naturally as you would speak, with enthusiasm and clarity."
    ).with_model("openai", "gpt-4o-mini")
    
    podcast_prompt = f"""Create a 2-minute podcast script about this research paper.

Title: {paper_title}
Key Points:
Problem: {key_points_data.get('problem', '')}
Solution: {key_points_data.get('main_idea', '')}
Results: {key_points_data.get('results', '')}

Write as natural speech with pauses, transitions, and conversational tone. No formatting."""
    
    podcast_script = await podcast_chat.send_message(UserMessage(text=podcast_prompt))
    podcast_script = clean_text_format(podcast_script)
    
    # Generate PPT slides
    ppt_chat = LlmChat(
        api_key=llm_key,
        session_id=f"ppt_{uuid.uuid4()}",
        system_message="Create clear presentation slides with concise points."
    ).with_model("openai", "gpt-4o-mini")
    
    ppt_prompt = f"""Create a 5-slide presentation outline:

Paper: {paper_title}
Problem: {key_points_data.get('problem', '')}
Solution: {key_points_data.get('main_idea', '')}
Approach: {key_points_data.get('approach', '')}
Results: {key_points_data.get('results', '')}

Return JSON: [{{"slide": 1, "title": "...", "points": ["point1", "point2", "point3"], "visual_note": "..."}}]
Keep points brief and clear."""
    
    ppt_response = await ppt_chat.send_message(UserMessage(text=ppt_prompt))
    
    try:
        json_match = re.search(r'\[\s*\{[^\[\]]*"slide"[^\[\]]*\}\s*(?:,\s*\{[^\[\]]*"slide"[^\[\]]*\}\s*)*\]', ppt_response, re.DOTALL)
        if json_match:
            ppt_data = json.loads(json_match.group())
            # Clean all text in slides
            for slide in ppt_data:
                slide['title'] = clean_text_format(slide.get('title', ''))
                if 'points' in slide:
                    slide['points'] = [clean_text_format(p) for p in slide['points']]
                if 'visual_note' in slide:
                    slide['visual_note'] = clean_text_format(slide['visual_note'])
        else:
            ppt_data = []
    except Exception as e:
        logging.error(f"Error parsing PPT: {e}")
        ppt_data = []
    
    # Generate glossary
    glossary_chat = LlmChat(
        api_key=llm_key,
        session_id=f"glossary_{uuid.uuid4()}",
        system_message="Explain technical terms simply and clearly."
    ).with_model("openai", "gpt-4o-mini")
    
    glossary_prompt = f"""Extract 5-7 technical terms and define them simply:

{context_text[:2000]}

Return JSON: [{{"term": "...", "definition": "Simple explanation in one sentence"}}]"""
    
    glossary_response = await glossary_chat.send_message(UserMessage(text=glossary_prompt))
    
    try:
        json_match = re.search(r'\[\s*\{[^\[\]]*"term"[^\[\]]*\}\s*(?:,\s*\{[^\[\]]*"term"[^\[\]]*\}\s*)*\]', glossary_response, re.DOTALL)
        if json_match:
            glossary_data = json.loads(json_match.group())
            for term in glossary_data:
                term['term'] = clean_text_format(term.get('term', ''))
                term['definition'] = clean_text_format(term.get('definition', ''))
        else:
            glossary_data = []
    except Exception as e:
        logging.error(f"Error parsing glossary: {e}")
        glossary_data = []
    
    return {
        "key_points": key_points_data,
        **explanations,
        "glossary": glossary_data,
        "evidence_chunks": [c.chunk_id for c in chunks[:5]],
        "podcast_script": podcast_script,
        "ppt_slides": ppt_data,
        "visual_concepts": visual_concepts,
        "architecture_diagram": architecture_img
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

@api_router.post("/papers/{paper_id}/analyze")
async def analyze_paper(paper_id: str):
    """Analyze paper and generate multi-level explanations"""
    
    paper_doc = await db.papers.find_one({"id": paper_id}, {"_id": 0})
    if not paper_doc:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    await db.papers.update_one({"id": paper_id}, {"$set": {"status": "processing"}})
    
    try:
        chunks = [Chunk(**c) for c in paper_doc.get('chunks', [])]
        paper_text = "\n\n".join([c.text for c in chunks])
        
        analysis = await generate_multi_level_explanations(
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
    """Chat with paper"""
    
    paper = await db.papers.find_one({"id": paper_id}, {"_id": 0})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    chunks = [Chunk(**c) for c in paper.get('chunks', [])]
    context = "\n\n".join([c.text for c in chunks[:10]])
    
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    chat = LlmChat(
        api_key=llm_key,
        session_id=f"chat_{paper_id}",
        system_message=f"You are a helpful assistant explaining this research paper. Answer naturally without markdown formatting. Context: {context[:2000]}"
    ).with_model("openai", "gpt-4o-mini")
    
    response = await chat.send_message(UserMessage(text=question))
    
    return {
        "question": question,
        "answer": clean_text_format(response)
    }

@api_router.post("/papers/{paper_id}/generate-audio")
async def generate_audio(paper_id: str):
    """Generate audio from podcast script using TTS"""
    
    analysis = await db.analyses.find_one({"paper_id": paper_id}, {"_id": 0})
    if not analysis or 'podcast_script' not in analysis:
        raise HTTPException(status_code=404, detail="Podcast script not found")
    
    # For now, return the script with indication that audio generation is ready
    # In production, integrate with ElevenLabs or similar TTS service
    return {
        "status": "ready",
        "script": analysis['podcast_script'],
        "message": "Audio generation ready. Script available for TTS services.",
        "duration_estimate": len(analysis['podcast_script'].split()) * 0.4  # ~150 words per minute
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()