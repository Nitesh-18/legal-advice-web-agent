# Project Structure

```
legal_backend/
│
├── manage.py                      # Django management script
├── requirements.txt               # Python dependencies
├── README.md                      # Main documentation
├── API_EXAMPLES.md               # API usage examples
├── .env.example                  # Environment variables template
├── .env                          # Your actual environment config (create this)
├── .gitignore                    # Git ignore rules
│
├── quickstart.sh                 # Linux/Mac setup script
├── quickstart.bat                # Windows setup script
├── test_api.py                   # API testing script
│
├── legal_project/                # Main Django project
│   ├── __init__.py
│   ├── settings.py               # ⚙️  Django settings & configuration
│   ├── urls.py                   # 🔗 Main URL routing
│   ├── wsgi.py                   # Production WSGI config
│   └── asgi.py                   # Async ASGI config
│
└── legal_api/                    # Main application
    ├── __init__.py
    ├── apps.py                   # App configuration
    ├── models.py                 # 📊 Database models (LegalQuery, CaseExample)
    ├── views.py                  # 🎯 API endpoints/views
    ├── urls.py                   # 🔗 App URL routing
    ├── admin.py                  # 👨‍💼 Django admin configuration
    ├── services.py               # 🤖 Model API integration service
    └── migrations/               # Database migrations
        └── __init__.py
```

## Key Files Explained

### Configuration Files

**`requirements.txt`**
- Lists all Python dependencies
- Install with: `pip install -r requirements.txt`

**`.env.example`**
- Template for environment variables
- Copy to `.env` and update with your values

**`.env`** (you need to create this)
- Your actual configuration
- Contains API URLs, secrets, etc.
- **Never commit this file to git!**

### Django Project Files

**`legal_project/settings.py`**
- Main Django configuration
- Database settings
- CORS configuration
- Installed apps
- **Important:** Configure MODEL_API_URL here via .env

**`legal_project/urls.py`**
- Main URL routing
- Routes `/api/` to legal_api app

### Application Files

**`legal_api/models.py`**
- Database models:
  - `LegalQuery`: Stores all queries and responses
  - `CaseExample`: Stores precedent cases

**`legal_api/views.py`**
- API endpoint handlers:
  - `analyze_case`: Analyze legal cases
  - `ask_legal_question`: General Q&A
  - `explain_case_reasoning`: Explain precedents
  - `model_health`: Check model status
  - `query_stats`: Get usage statistics

**`legal_api/services.py`**
- `LegalModelService`: Handles communication with InLegalLLaMA
- Error handling and retry logic
- Request/response management

**`legal_api/urls.py`**
- Routes for the legal_api app
- Maps URLs to views

**`legal_api/admin.py`**
- Django admin interface configuration
- Manage queries and cases through web UI

## Database Schema

### LegalQuery
Stores all API queries for analytics

| Field | Type | Description |
|-------|------|-------------|
| query_type | CharField | Type: case_analysis, general_question, reasoning |
| question | TextField | The user's question/case text |
| response | TextField | AI model's response |
| response_time | FloatField | Time taken in seconds |
| created_at | DateTimeField | Timestamp |
| ip_address | GenericIPAddressField | Client IP |
| error_occurred | BooleanField | Did an error occur |
| error_message | TextField | Error details if any |

### CaseExample
Stores precedent cases for Case Explorer

| Field | Type | Description |
|-------|------|-------------|
| title | CharField | Case title |
| case_type | CharField | criminal, civil, family, corporate |
| description | TextField | Case description |
| outcome | TextField | Case outcome |
| relevance_score | IntegerField | Relevance score (0-100) |
| citation | CharField | Legal citation |
| court | CharField | Court name |
| year | IntegerField | Year of judgment |

## API Flow

```
Client (Next.js) → Django Views → Services → InLegalLLaMA API
                          ↓
                    Database (logs)
```

1. **Client** sends request to Django API
2. **View** validates request data
3. **Service** calls InLegalLLaMA model
4. **Response** is returned to client
5. **Query** is logged to database

## Setup Workflow

```
1. Extract ZIP
2. Create virtual environment
3. Install dependencies (requirements.txt)
4. Copy .env.example to .env
5. Configure MODEL_API_URL in .env
6. Run migrations
7. Create admin user (optional)
8. Start server
```

## Development vs Production

### Development (Current Setup)
- DEBUG=True
- SQLite database
- Django dev server
- CORS allows localhost:3000

### Production (When Deploying)
- DEBUG=False
- PostgreSQL/MySQL database
- Gunicorn + Nginx
- CORS allows your domain
- Use environment variables for secrets
- HTTPS enabled

## Next Steps

1. ✅ Extract and setup project
2. ✅ Configure .env with MODEL_API_URL
3. ✅ Run migrations
4. ✅ Test with curl/test_api.py
5. ✅ Connect Next.js frontend
6. ✅ Deploy to production server
