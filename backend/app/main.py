from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load env
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

from .routers import papers
from .database import client

app = FastAPI(title="ExplainAI Studio API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(papers.router, prefix="/api")

@app.get("/api/")
async def root():
    return {"message": "ExplainAI Studio API"}

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
