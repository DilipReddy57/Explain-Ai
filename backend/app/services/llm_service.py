import os
import logging
import json
import re
import uuid
from typing import Dict, List, Optional
from ..models import Chunk
from .image_service import generate_concept_diagram, generate_architecture_diagram
from ..utils import clean_text_format

# Try importing google.generativeai
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# Try importing emergentintegrations
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    HAS_EMERGENT = True
except ImportError:
    HAS_EMERGENT = False

class LLMService:
    def __init__(self):
        self.google_key = os.environ.get('GOOGLE_API_KEY')
        self.emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        self.openai_key = os.environ.get('OPENAI_API_KEY')
        
        if self.google_key and HAS_GENAI:
            genai.configure(api_key=self.google_key)
            self.provider = "google"
            logging.info("Using Google Gemini provider")
        elif self.emergent_key and HAS_EMERGENT:
            self.provider = "emergent"
            logging.info("Using Emergent Integrations provider")
        else:
            self.provider = "none"
            logging.warning("No LLM provider configured")

    async def generate_text(self, prompt: str, system_message: str = "", model: str = "gemini-1.5-pro-latest") -> str:
        if self.provider == "google":
            try:
                # Use Gemini
                model_name = "gemini-1.5-pro" # Default to 1.5 Pro
                if "gemini" in model:
                    model_name = model
                
                generation_config = {
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 64,
                    "max_output_tokens": 8192,
                }
                
                gemini_model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config=generation_config,
                    system_instruction=system_message
                )
                
                response = gemini_model.generate_content(prompt)
                return response.text
            except Exception as e:
                logging.error(f"Google GenAI error: {e}")
                # Fallback or re-raise
                raise

        elif self.provider == "emergent":
            try:
                chat = LlmChat(
                    api_key=self.emergent_key,
                    session_id=f"session_{uuid.uuid4()}",
                    system_message=system_message
                ).with_model("openai", "gpt-4o-mini") # Default fallback in emergent
                
                response = await chat.send_message(UserMessage(text=prompt))
                return response
            except Exception as e:
                logging.error(f"Emergent LLM error: {e}")
                raise
        
        else:
            raise ValueError("No LLM provider available")

    async def generate_multi_level_explanations(self, paper_text: str, chunks: List[Chunk], paper_title: str) -> Dict:
        """Generate comprehensive analysis with visuals"""
        
        context_text = "\n\n".join([c.text for c in chunks[:15]])[:4000]
        
        # 1. Key Points
        key_points_prompt = f"""Analyze this research paper and extract key information.
Paper excerpt:
{context_text}

Provide a JSON response with these exact fields: problem, main_idea, approach, results, limitations.
Make the text natural and conversational, without markdown formatting or special characters.
Example: {{"problem": "Natural text here", "main_idea": "Clear explanation", ...}}"""

        key_points_response = await self.generate_text(
            key_points_prompt, 
            system_message="You are an AI research analyst. Provide clear, natural explanations without markdown formatting."
        )
        
        key_points_data = self._parse_json(key_points_response)
        if not key_points_data:
             key_points_data = {
                "problem": "The paper addresses challenges in the field.",
                "main_idea": key_points_response[:200],
                "approach": "The researchers developed a novel methodology.",
                "results": "Experiments showed promising outcomes.",
                "limitations": "Further research is needed."
            }

        # Clean formatting
        for key in key_points_data:
            if isinstance(key_points_data[key], str):
                key_points_data[key] = clean_text_format(key_points_data[key])

        # 2. Visual Concepts
        concepts_prompt = f"""From this research paper, identify 3-4 key concepts that would benefit from visual diagrams.
Paper context:
Main Idea: {key_points_data.get('main_idea', '')}
Approach: {key_points_data.get('approach', '')}

Return JSON array: [{{"concept": "Concept name", "description": "Brief explanation in 20 words"}}]
Use simple, natural language without formatting."""

        concepts_response = await self.generate_text(
            concepts_prompt,
            system_message="You are a visual learning expert. Identify key concepts that need visual explanation."
        )
        
        concepts_data = self._parse_json(concepts_response)
        visual_concepts = []
        if isinstance(concepts_data, list):
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

        # 3. Architecture Diagram
        architecture_img = generate_architecture_diagram(key_points_data.get('approach', 'System workflow'))

        # 4. Explanations
        explanations = {}
        levels = [
            ("kid", "Explain this like telling a story to a 10-year-old. Use everyday examples and simple words. No technical jargon. Make it fun and relatable."),
            ("student", "Explain this to an undergraduate student. Include technical terms but explain them clearly. Use analogies when helpful."),
            ("researcher", "Provide a technical explanation for researchers. Include methodology details and research implications.")
        ]

        for level, instruction in levels:
            prompt = f"""Explain this research paper naturally:
Problem: {key_points_data.get('problem', '')}
Main Idea: {key_points_data.get('main_idea', '')}
Approach: {key_points_data.get('approach', '')}
Results: {key_points_data.get('results', '')}

Write 2-3 paragraphs in a conversational, natural style. No formatting symbols."""
            
            response = await self.generate_text(prompt, system_message=f"{instruction} Write naturally without markdown formatting.")
            explanations[f"{level}_explanation"] = clean_text_format(response)

        # 5. Podcast Script
        podcast_prompt = f"""Create a 2-minute podcast script about this research paper.
Title: {paper_title}
Key Points:
Problem: {key_points_data.get('problem', '')}
Solution: {key_points_data.get('main_idea', '')}
Results: {key_points_data.get('results', '')}

Write as natural speech with pauses, transitions, and conversational tone. No formatting."""
        
        podcast_script = await self.generate_text(
            podcast_prompt,
            system_message="You are a podcast host. Write naturally as you would speak, with enthusiasm and clarity."
        )
        podcast_script = clean_text_format(podcast_script)

        # 6. PPT Slides
        ppt_prompt = f"""Create a 5-slide presentation outline:
Paper: {paper_title}
Problem: {key_points_data.get('problem', '')}
Solution: {key_points_data.get('main_idea', '')}
Approach: {key_points_data.get('approach', '')}
Results: {key_points_data.get('results', '')}

Return JSON: [{{"slide": 1, "title": "...", "points": ["point1", "point2", "point3"], "visual_note": "..."}}]
Keep points brief and clear."""

        ppt_response = await self.generate_text(
            ppt_prompt,
            system_message="Create clear presentation slides with concise points."
        )
        ppt_data = self._parse_json(ppt_response)
        if isinstance(ppt_data, list):
            for slide in ppt_data:
                slide['title'] = clean_text_format(slide.get('title', ''))
                if 'points' in slide:
                    slide['points'] = [clean_text_format(p) for p in slide['points']]
                if 'visual_note' in slide:
                    slide['visual_note'] = clean_text_format(slide['visual_note'])
        else:
            ppt_data = []

        # 7. Glossary
        glossary_prompt = f"""Extract 5-7 technical terms and define them simply:
{context_text[:2000]}

Return JSON: [{{"term": "...", "definition": "Simple explanation in one sentence"}}]"""

        glossary_response = await self.generate_text(
            glossary_prompt,
            system_message="Explain technical terms simply and clearly."
        )
        glossary_data = self._parse_json(glossary_response)
        if isinstance(glossary_data, list):
            for term in glossary_data:
                term['term'] = clean_text_format(term.get('term', ''))
                term['definition'] = clean_text_format(term.get('definition', ''))
        else:
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

    def _parse_json(self, text: str):
        try:
            # Try to find JSON object
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            # Try to find JSON array
            json_array_match = re.search(r'\[.*\]', text, re.DOTALL)
            if json_array_match:
                return json.loads(json_array_match.group())
            return None
        except:
            return None

llm_service = LLMService()
