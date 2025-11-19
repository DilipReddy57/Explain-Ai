# ExplainAI Studio Backend

## Setup

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Add your API keys (Google Gemini, OpenAI, or Emergent)

3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Structure

- `app/main.py`: Entry point
- `app/routers`: API routes
- `app/services`: Business logic (PDF, LLM, Images)
- `app/models.py`: Data models
- `app/database.py`: Database connection
