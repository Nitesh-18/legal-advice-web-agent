"""
Service layer for Google Gemini API integration - Indian Legal Advisor
Using REST API (more compatible)
"""

import requests
import time
from django.conf import settings
from typing import Dict, Optional
import logging
import json

logger = logging.getLogger(__name__)


class ModelAPIError(Exception):
    """Custom exception for model API errors"""
    pass


class LegalModelService:
    """Service class to interact with Google Gemini API for Indian legal advice"""
    
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model = "gemini-2.5-flash"  # This model EXISTS in your list
        
        # System instruction for Indian legal context
        self.system_instruction = """You are an expert legal advisor specializing in Indian law. You have deep knowledge of:

    - The Indian Constitution and all fundamental rights
    - Indian Penal Code (IPC) and Criminal Procedure Code (CrPC)
    - Civil laws including Contract Act, Property laws, Rent Control Acts
    - Family laws including Hindu Marriage Act, Muslim Personal Law, Special Marriage Act
    - Labor laws including Industrial Disputes Act, Payment of Wages Act
    - Consumer Protection Act
    - Indian Evidence Act
    - Specific Relief Act
    - Limitation Act

    IMPORTANT GUIDELINES:
    1. Always cite specific sections, acts, and articles when applicable
    2. Reference relevant Supreme Court and High Court precedents when known
    3. Distinguish between different case types: Criminal, Civil, Family, Corporate, Property, Labor
    4. Provide practical, actionable advice
    5. Mention the appropriate court jurisdiction (District, High Court, Supreme Court)
    6. Indicate time limitations if applicable under Limitation Act
    7. If the query is ambiguous, ask clarifying questions
    8. Always remind users to consult with a licensed advocate for formal legal representation

    CASE TYPE CLASSIFICATION:
    - Criminal: IPC violations, FIR, bail, defamation, harassment, assault
    - Civil: Property disputes, contract breaches, recovery suits, injunctions
    - Family: Divorce, custody, maintenance, succession, adoption
    - Corporate: Company disputes, shareholder rights, contracts
    - Property: Title disputes, tenant rights, eviction, registration
    - Labor: Termination, wages, industrial disputes, provident fund

    Provide responses in clear, professional language suitable for common citizens."""
    
    def _make_request(self, user_message: str, temperature: float = 0.7, max_tokens: int = 8192) -> Dict:
        """
        Make request to Gemini API using REST
        
        Args:
            user_message: The user's question or prompt
            temperature: Creativity level (0.0 to 1.0)
        
        Returns:
            Response dictionary with content and metadata
        """
        try:
            start_time = time.time()
            
            # Combine system instruction with user message
            full_prompt = f"{self.system_instruction}\n\n{user_message}"
            
            # API endpoint
            url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
            
            # Request payload
            payload = {
                "contents": [{
                    "parts": [{
                        "text": full_prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens,
                },
                "safetySettings": [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_NONE"
                    }
                ]
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            logger.info(f"Sending request to Gemini API: {self.model}")
            
            # Make request
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            
            elapsed_time = time.time() - start_time
            
            # Check for errors
            if response.status_code != 200:
                logger.error(f"Gemini API returned status {response.status_code}")
                logger.error(f"Response: {response.text}")
                
                error_data = response.json() if response.text else {}
                error_message = error_data.get('error', {}).get('message', 'Unknown error')
                raise ModelAPIError(f"Gemini API error: {error_message}")
            
            # Parse response
            data = response.json()
            logger.info(f"Gemini API response received in {elapsed_time:.2f}s")
            
            # Debug: Log the response structure
            logger.debug(f"Response structure: {json.dumps(data, indent=2)[:500]}")
            
            # Extract text from response with better error handling
            try:
                # Check if we have candidates
                if 'candidates' not in data or not data['candidates']:
                    logger.error("No candidates in response")
                    logger.error(f"Full response: {json.dumps(data, indent=2)}")
                    
                    # Check for prompt feedback (safety filters)
                    if 'promptFeedback' in data:
                        feedback = data['promptFeedback']
                        if 'blockReason' in feedback:
                            raise ModelAPIError(
                                f"Content was blocked by safety filters: {feedback.get('blockReason')}. "
                                f"Please rephrase your query."
                            )
                    
                    raise ModelAPIError("No response generated. The query may have been filtered or invalid.")
                
                candidate = data['candidates'][0]
                
                # Check finish reason
                finish_reason = candidate.get('finishReason', '')
                if finish_reason and finish_reason not in ['STOP', 'MAX_TOKENS']:
                    logger.warning(f"Unusual finish reason: {finish_reason}")
                    if finish_reason == 'SAFETY':
                        raise ModelAPIError(
                            "Response was blocked by safety filters. Please rephrase your query."
                        )
                
                # Extract content
                if 'content' not in candidate:
                    logger.error(f"No content in candidate: {json.dumps(candidate, indent=2)}")
                    raise ModelAPIError("Invalid response structure: missing content")
                
                content = candidate['content']
                
                if 'parts' not in content or not content['parts']:
                    logger.error(f"No parts in content: {json.dumps(content, indent=2)}")
                    raise ModelAPIError("Invalid response structure: missing parts")
                
                parts = content['parts']
                
                # Get text from first part
                if 'text' not in parts[0]:
                    logger.error(f"No text in part: {json.dumps(parts[0], indent=2)}")
                    raise ModelAPIError("Invalid response structure: missing text")
                
                response_text = parts[0]['text']
                
                if not response_text or not response_text.strip():
                    raise ModelAPIError("Empty response received from AI model")
                
                logger.info(f"Successfully extracted response: {len(response_text)} characters")
                
                return {
                    'content': response_text,
                    'response_time': elapsed_time,
                    'model': self.model
                }
                
            except KeyError as e:
                logger.error(f"KeyError while parsing response: {e}")
                logger.error(f"Response data: {json.dumps(data, indent=2)[:1000]}")
                raise ModelAPIError(f"Invalid response format from Gemini API: missing {str(e)}")
            
            except IndexError as e:
                logger.error(f"IndexError while parsing response: {e}")
                logger.error(f"Response data: {json.dumps(data, indent=2)[:1000]}")
                raise ModelAPIError("Invalid response format from Gemini API: empty arrays")
        
        except requests.exceptions.Timeout:
            logger.error("Gemini API request timed out")
            raise ModelAPIError("Request timed out. The AI model is taking too long to respond. Please try again.")
        
        except requests.exceptions.ConnectionError:
            logger.error("Could not connect to Gemini API")
            raise ModelAPIError("Could not connect to Google Gemini. Please check your internet connection.")
        
        except ModelAPIError:
            raise
        
        except Exception as e:
            logger.error(f"Unexpected error in Gemini API call: {e}")
            logger.exception(e)
            raise ModelAPIError(f"An unexpected error occurred: {str(e)}")
        
    def check_health(self) -> Dict:
        """Check if Gemini API is available"""
        try:
            # Simple test message
            result = self._make_request("Hello")
            
            return {
                'status': 'online',
                'details': {
                    'model': self.model,
                    'provider': 'Google Gemini',
                    'response_time': result['response_time']
                }
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                'status': 'offline',
                'error': str(e)
            }
    
    def analyze_case(self, case_text: str) -> Dict:
        """
        Analyze a legal case with detailed insights
        
        Args:
            case_text: The case description
        """
        prompt = f"""A user has presented the following legal situation. Analyze it thoroughly:

**Case Description:**
{case_text}

**Please provide:**

1. **Case Type Classification**: Identify if this is Criminal, Civil, Family, Corporate, Property, or Labor related

2. **Legal Issues Identified**: List all legal issues present in this situation

3. **Applicable Laws**: 
   - Cite specific sections, articles, or acts that apply
   - Reference any landmark judgments if relevant

4. **Potential Outcomes**: 
   - Best case scenario
   - Worst case scenario
   - Most likely outcome

5. **Recommended Next Steps**:
   - Immediate actions to take
   - Documents to gather
   - Which court/authority to approach
   - Time limitations under Limitation Act if applicable

6. **Important Warnings**: Any critical points the user should be aware of

Format your response clearly with headers."""

        result = self._make_request(prompt)
        
        return {
            'analysis': result['content'],
            'case_text': case_text,
            'response_time': result['response_time']
        }
    
    def ask_question(self, question: str) -> Dict:
        """
        Answer a general legal question
        
        Args:
            question: The legal question
        """
        prompt = f"""A user has asked the following legal question about Indian law:

**Question:** {question}

**Please provide:**
1. A clear, direct answer
2. Relevant legal provisions (sections, acts, articles)
3. Any important Supreme Court or High Court precedents
4. Practical guidance
5. Any important caveats or warnings

Keep the response informative but accessible to a common citizen."""

        result = self._make_request(prompt)
        
        return {
            'answer': result['content'],
            'question': question,
            'response_time': result['response_time']
        }
    
    def explain_reasoning(self, user_case: str, precedent_case: str) -> Dict:
        """
        Explain why a precedent case is relevant
        
        Args:
            user_case: User's situation
            precedent_case: The precedent case details
        """
        prompt = f"""A user wants to understand how a precedent case applies to their situation.

**User's Situation:**
{user_case}

**Precedent Case:**
{precedent_case}

**Please explain:**
1. Legal similarities between the cases
2. Key principles from the precedent that apply here
3. How this precedent might influence the outcome
4. Any important differences to note
5. The binding nature of this precedent (Supreme Court vs High Court)"""

        result = self._make_request(prompt)
        
        return {
            'explanation': result['content'],
            'response_time': result['response_time']
        }
    
    def classify_case_type(self, case_text: str) -> Dict:
        """
        Classify a case into legal categories
        
        Args:
            case_text: The case description
        """
        prompt = f"""Classify the following legal situation into one or more of these categories:
- Criminal
- Civil  
- Family
- Corporate
- Property
- Labor

**Case:** {case_text}

Identify the primary type and any secondary types. Explain your reasoning briefly."""

        result = self._make_request(prompt, temperature=0.3)  # Lower temperature for classification
        
        return {
            'classification': result['content'],
            'response_time': result['response_time']
        }


# Singleton instance
model_service = LegalModelService()