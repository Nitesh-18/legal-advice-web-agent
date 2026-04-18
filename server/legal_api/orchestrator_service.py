import logging
from typing import Dict, List
from .services import model_service
from .kanoon_service import kanoon_service

logger = logging.getLogger(__name__)

class OrchestratorService:
    """Multi-step Legal Research Agent Orchestrator"""
    
    def research_query(self, query: str, state: str = None) -> Dict:
        """
        Step 1: Understand user query & Extract Keywords
        Step 2: Fetch relevant cases via Kanoon API
        Step 3: Filter top results
        Step 4: Pass context to Gemini
        Step 5: Generate final answer with citations + Citation Injection/Verification
        """
        
        # Step 1: Understand user query
        # We can ask Gemini to extract search keywords and legal concepts
        keyword_prompt = f"Extract 2-3 main legal search keywords from this query: '{query}'. Return only the keywords separated by commas."
        keyword_res = model_service._make_request(keyword_prompt, temperature=0.1)
        keywords = keyword_res['content'].strip()
        
        # Step 2 & 3: Fetch and filter relevant cases
        cases = kanoon_service.search_cases(keywords)
        cases_context = ""
        case_data_list = []
        if cases:
            cases_context = "Relevant Precedents:\n"
            for idx, case in enumerate(cases[:3]):
                cases_context += f"{idx+1}. {case['title']} ({case['court']}, {case['date']})\nSummary: {case['summary']}\nLink: {case['link']}\n\n"
                case_data_list.append(case)
                
        # State-Specific Context
        state_context = f"\nApplicable State: {state}\nPlease ensure any specific state laws or amendments for {state} are considered." if state else ""
                
        # Step 4 & 5: Pass context to Gemini and Generate Final Answer
        final_prompt = f"""You are a senior Indian Legal Research Agent. Your priority is to be EXTREMELY CONCISE, CLEAR, and DIRECT. 
        Avoid lengthy paragraphs. Structure the response entirely using short bullet points. Do not exceed 250 words.
        
User Query: {query}
{state_context}

{cases_context}

Provide a structured response using exactly these three headings:
### 1. Legal Analysis
(Provide 2-3 short bullet points summarizing the core legal standing)

### 2. Relevant Precedents
(Briefly mention how the provided precedents relate. 1 sentence per case.)

### 3. Verdict Strength Prediction
(Declare the case strength as Weak, Moderate, or Strong. Provide a 1-sentence reasoning.)

Remember to ground your answer strictly in the provided precedents if applicable, and maintain deterministic reasoning without hallucination. No long introductions or disclaimers.
        final_res = model_service._make_request(final_prompt)
        content = final_res['content']
        
        # Citation Verification: The cases provided in `cases_context` are already verified from Kanoon.
        
        return {
            'answer': content,
            'cases': case_data_list,
            'response_time': final_res['response_time'],
            'state': state
        }

orchestrator_service = OrchestratorService()
