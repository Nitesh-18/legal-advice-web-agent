# Legal Advice Web Agent - Django Backend

Complete Django REST API backend for the Legal Advice Web Agent application, integrating with InLegalLLaMA model.

## 🚀 Features

- **Case Analysis API** - Analyze legal situations with AI-powered insights
- **General Legal Q&A** - Ask any legal question related to Indian law
- **Case Reasoning** - Explain relevance of precedent cases
- **Health Monitoring** - Check model availability
- **Query Logging** - Track all queries and responses for analytics
- **Admin Dashboard** - Manage queries and case examples

## 📋 Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)
- InLegalLLaMA model running on Colab or HuggingFace Spaces

## 🛠️ Installation & Setup

### Step 1: Extract the ZIP file

```bash
unzip legal_backend.zip
cd legal_backend
```

### Step 2: Create Virtual Environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and update the following:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Model API - IMPORTANT: Update this!
MODEL_API_URL=https://your-ngrok-url.ngrok-free.app

# CORS - Your Next.js frontend URL
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Important:** Replace `MODEL_API_URL` with your actual Colab ngrok URL or HuggingFace Spaces URL.

### Step 5: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 6: Create Admin User (Optional)

```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

### Step 7: Start the Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

## 📡 API Endpoints

### 1. Analyze Case
Analyze a legal case description with detailed insights.

**Endpoint:** `POST /api/analyze-case/`

**Request Body:**
```json
{
  "case_text": "My landlord is refusing to return my security deposit after I vacated the apartment..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "Based on the situation described...",
  "case_text": "...",
  "response_time": 2.45
}
```

### 2. Ask Legal Question
Ask any general legal question.

**Endpoint:** `POST /api/ask-legal-question/`

**Request Body:**
```json
{
  "question": "What are the tenant rights under Indian law?"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Under Indian law, tenants have several rights...",
  "question": "...",
  "response_time": 1.89
}
```

### 3. Explain Case Reasoning
Explain why a precedent case is relevant.

**Endpoint:** `POST /api/explain-reasoning/`

**Request Body:**
```json
{
  "user_case": "My employer terminated me without notice...",
  "precedent_case": "Rajesh Kumar vs State of Maharashtra - Employment dispute..."
}
```

**Response:**
```json
{
  "success": true,
  "explanation": "This precedent case is relevant because...",
  "response_time": 2.12
}
```

### 4. Model Health Check
Check if the AI model is online.

**Endpoint:** `GET /api/model-health/`

**Response:**
```json
{
  "status": "online",
  "model_info": {
    "gpu": true
  }
}
```

### 5. Query Statistics
Get statistics about API usage.

**Endpoint:** `GET /api/stats/`

**Response:**
```json
{
  "total_queries": 145,
  "successful_queries": 142,
  "failed_queries": 3,
  "average_response_time": 2.34,
  "success_rate": 97.93
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | - |
| `DEBUG` | Debug mode | True |
| `ALLOWED_HOSTS` | Allowed hosts | localhost,127.0.0.1 |
| `MODEL_API_URL` | Model API endpoint | - |
| `CORS_ALLOWED_ORIGINS` | Frontend URLs | http://localhost:3000 |

### CORS Configuration

If your Next.js frontend runs on a different port or domain, update `CORS_ALLOWED_ORIGINS` in `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

## 🧪 Testing the API

### Using cURL

```bash
# Test case analysis
curl -X POST http://localhost:8000/api/analyze-case/ \
  -H "Content-Type: application/json" \
  -d '{"case_text": "Test case description"}'

# Check model health
curl http://localhost:8000/api/model-health/
```

### Using Python

```python
import requests

# Analyze a case
response = requests.post(
    'http://localhost:8000/api/analyze-case/',
    json={'case_text': 'My landlord refuses to return deposit'}
)
print(response.json())
```

## 🎯 Connecting to Your Model

### Option 1: Google Colab with ngrok

1. Run your Colab notebook with the Flask API
2. Copy the ngrok URL (e.g., `https://abc123.ngrok-free.app`)
3. Update `MODEL_API_URL` in `.env`
4. Restart Django server

### Option 2: HuggingFace Spaces

1. Deploy your model to HF Spaces
2. Copy the Space URL (e.g., `https://username-space.hf.space`)
3. Update `MODEL_API_URL` in `.env`
4. Restart Django server

## 🗄️ Database

By default, the project uses SQLite (`db.sqlite3`). For production, consider PostgreSQL or MySQL.

### Switching to PostgreSQL

1. Install psycopg2:
```bash
pip install psycopg2-binary
```

2. Update `.env`:
```env
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=legal_db
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

## 🔐 Admin Dashboard

Access the Django admin at: `http://localhost:8000/admin/`

Features:
- View all queries and responses
- Monitor errors and performance
- Manage case examples
- User management

## 📊 Monitoring & Logging

All queries are automatically logged to the database with:
- Query type and content
- Response and response time
- Error information (if any)
- IP address and timestamp

View logs through:
1. Django Admin (`/admin/legal_api/legalquery/`)
2. Stats API (`/api/stats/`)

## 🚨 Troubleshooting

### "Cannot connect to AI model server"

**Solution:** Ensure your Colab/HF Spaces is running and the URL in `.env` is correct.

```bash
# Test the model URL directly
curl https://your-model-url/health
```

### CORS Errors

**Solution:** Add your frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Database Errors

**Solution:** Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Port Already in Use

**Solution:** Run on a different port:

```bash
python manage.py runserver 8001
```

## 📦 Deployment

### For Production

1. Set `DEBUG=False` in `.env`
2. Set a strong `SECRET_KEY`
3. Update `ALLOWED_HOSTS` with your domain
4. Use a production database (PostgreSQL)
5. Configure static files serving
6. Use gunicorn or uwsgi

Example with gunicorn:
```bash
gunicorn legal_project.wsgi:application --bind 0.0.0.0:8000
```

## 🤝 Integrating with Next.js Frontend

Update your Next.js API configuration:

```typescript
// lib/api.ts
const API_BASE_URL = 'http://localhost:8000';

export async function analyzeCase(caseText: string) {
  const response = await fetch(`${API_BASE_URL}/api/analyze-case/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ case_text: caseText }),
  });
  return response.json();
}
```

## 📝 License

This project is provided as-is for your legal advice application.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify your model is running
3. Check Django logs for errors
4. Ensure all environment variables are set

---

**Made with ❤️ for the Legal Advice Web Agent**
