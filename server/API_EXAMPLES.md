# API Testing Examples

Collection of curl commands to test the Legal Advice API endpoints.

## Prerequisites

Make sure the Django server is running:
```bash
python manage.py runserver
```

---

## 1. Health Check

Check if the model is online:

```bash
curl http://localhost:8000/api/model-health/
```

---

## 2. Analyze Case

Analyze a legal case description:

```bash
curl -X POST http://localhost:8000/api/analyze-case/ \
  -H "Content-Type: application/json" \
  -d '{
    "case_text": "I am a tenant in Mumbai. My landlord is refusing to return my security deposit of Rs. 50,000 even though I vacated the apartment 2 months ago and there was no damage. What are my legal options?"
  }'
```

---

## 3. Ask Legal Question

Ask a general legal question:

```bash
curl -X POST http://localhost:8000/api/ask-legal-question/ \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the fundamental rights under the Indian Constitution?"
  }'
```

---

## 4. Explain Case Reasoning

Explain why a precedent case is relevant:

```bash
curl -X POST http://localhost:8000/api/explain-reasoning/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_case": "My employer terminated me without any notice or reason",
    "precedent_case": "Rajesh Kumar vs ABC Corporation - Court ruled that termination without notice violates employment contract terms"
  }'
```

---

## 5. Query Statistics

Get API usage statistics:

```bash
curl http://localhost:8000/api/stats/
```

---

## Testing with Python

```python
import requests

# Test case analysis
response = requests.post(
    'http://localhost:8000/api/analyze-case/',
    json={
        'case_text': 'My landlord refuses to return my security deposit'
    }
)
print(response.json())

# Test general question
response = requests.post(
    'http://localhost:8000/api/ask-legal-question/',
    json={
        'question': 'What is Section 498A of IPC?'
    }
)
print(response.json())
```

---

## Testing with JavaScript (Next.js/React)

```javascript
// Analyze case
const analyzeCase = async (caseText) => {
  const response = await fetch('http://localhost:8000/api/analyze-case/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ case_text: caseText }),
  });
  return await response.json();
};

// Ask question
const askQuestion = async (question) => {
  const response = await fetch('http://localhost:8000/api/ask-legal-question/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });
  return await response.json();
};
```

---

## Common Error Responses

### Model Unavailable (503)
```json
{
  "error": "Cannot connect to the AI model server. Please ensure the model is running."
}
```

**Solution:** Check if your Colab/HF Spaces is running and MODEL_API_URL is correct in .env

### Bad Request (400)
```json
{
  "error": "No question provided"
}
```

**Solution:** Ensure you're sending the required fields in the request body

### Server Error (500)
```json
{
  "error": "An unexpected error occurred"
}
```

**Solution:** Check Django logs for detailed error information
