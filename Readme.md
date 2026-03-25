# ⚖️ Legal Advice Web Agent

AI-powered legal analysis platform for Indian law cases. Get instant insights, case analysis, and legal guidance based on Indian Constitution, IPC, and relevant acts.

---

## 🌟 Features

- **AI-Powered Analysis** - Google Gemini 2.5 Flash model for legal insights
- **Case Analysis** - Detailed analysis with applicable laws and precedents
- **Chat Interface** - Follow-up questions with context-aware responses
- **Chat History** - Local storage of up to 50 conversation sessions
- **Markdown Formatting** - Properly formatted legal responses with headings, lists, and tables
- **Mobile Responsive** - Works seamlessly on all devices
- **Real-time Suggestions** - Context-aware follow-up question suggestions

---

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** 18.x or higher - [Download](https://nodejs.org/)
- **Python** 3.9 or higher - [Download](https://www.python.org/downloads/)
- **pip** (comes with Python)
- **npm** (comes with Node.js)

You'll also need:
- **Google Gemini API Key** (Free) - [Get it here](https://ai.google.dev/)

---

## 🚀 Quick Start Guide

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd legal-advice-web-agent
```

---

### Step 2: Backend Setup (Django)

#### 2.1 Navigate to Backend Directory

```bash
cd server
```

#### 2.2 Create Virtual Environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

#### 2.3 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Django 5.0.1
- Django REST Framework
- Django CORS Headers
- Google Generative AI (Gemini)
- Other required packages

#### 2.4 Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

**Edit `.env` file** and add your configuration:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Google Gemini API Configuration (REQUIRED)
GOOGLE_API_KEY=AIza_your_actual_api_key_here

# CORS Settings (Your Next.js frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database (SQLite by default)
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3
```

**⚠️ IMPORTANT:** Replace `AIza_your_actual_api_key_here` with your real Google Gemini API key!

#### 2.5 Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 2.6 Create Admin User (Optional)

```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

#### 2.7 Start Django Server

```bash
python manage.py runserver
```

**✅ Backend is now running on:** `http://localhost:8000`

**Keep this terminal open!** The backend needs to stay running.

---

### Step 3: Frontend Setup (Next.js)

Open a **NEW terminal window** (keep Django running in the first one).

#### 3.1 Navigate to Frontend Directory

```bash
cd client
```

#### 3.2 Install Node Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- Tailwind CSS
- React Markdown
- Radix UI components
- Other required packages

#### 3.3 Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

**Edit `.env.local` file:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 3.4 Start Next.js Development Server

```bash
npm run dev
```

**✅ Frontend is now running on:** `http://localhost:3000`

---

### Step 4: Access the Application

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the Legal Advice Web Agent homepage
4. Enter a legal case description and click "Analyze Case"

---

## 🔑 Getting Google Gemini API Key

### Step-by-Step:

1. Visit [https://ai.google.dev/](https://ai.google.dev/)
2. Click **"Get API key in Google AI Studio"**
3. Sign in with your Google account
4. Click **"Create API Key"**
5. Copy the key (it starts with `AIza...`)
6. Paste it into `server/.env` as `GOOGLE_API_KEY`

### Important Notes:

- The free tier is generous (60 requests/minute)
- No credit card required
- Keep your API key secret
- Don't commit `.env` files to Git

---

## 📂 Project Structure

```
legal-advice-web-agent/
│
├── server/                      # Django Backend
│   ├── legal_project/           # Main Django project
│   │   ├── settings.py         # Configuration
│   │   ├── urls.py             # Main URL routing
│   │   └── wsgi.py             # WSGI application
│   │
│   ├── legal_api/              # API Application
│   │   ├── models.py           # Database models
│   │   ├── views.py            # API endpoints
│   │   ├── services.py         # Gemini API integration
│   │   ├── urls.py             # API URL routing
│   │   └── admin.py            # Admin configuration
│   │
│   ├── requirements.txt        # Python dependencies
│   ├── manage.py              # Django management script
│   ├── .env                   # Environment variables (CREATE THIS)
│   └── .env.example           # Environment template
│
├── client/                     # Next.js Frontend
│   ├── app/                   # Next.js pages (App Router)
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   └── chat/
│   │       └── page.tsx      # Chat interface
│   │
│   ├── components/            # React components
│   │   ├── HeroSection.tsx   # Landing section
│   │   ├── ChatSidebar.tsx   # Chat history sidebar
│   │   ├── MarkdownRenderer.tsx  # Markdown display
│   │   └── ui/               # UI components
│   │
│   ├── lib/                  # Utilities
│   │   ├── api.ts           # API client functions
│   │   ├── chatStorage.ts   # LocalStorage management
│   │   └── utils.ts         # Helper functions
│   │
│   ├── package.json          # Node dependencies
│   ├── .env.local           # Environment variables (CREATE THIS)
│   └── .env.example         # Environment template
│
└── README.md                 # This file
```

---

## 🛠️ Detailed Configuration

### Backend Configuration (server/.env)

```env
# ===========================================
# Django Core Settings
# ===========================================
SECRET_KEY=your-django-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# ===========================================
# Google Gemini API (REQUIRED)
# ===========================================
# Get your free API key from: https://ai.google.dev/
GOOGLE_API_KEY=AIza_your_actual_key_here

# ===========================================
# CORS Settings
# ===========================================
# Add your frontend URLs (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ===========================================
# Database Configuration
# ===========================================
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3

# For PostgreSQL in production:
# DATABASE_ENGINE=django.db.backends.postgresql
# DATABASE_NAME=legal_db
# DATABASE_USER=postgres
# DATABASE_PASSWORD=your_password
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
```

### Frontend Configuration (client/.env.local)

```env
# ===========================================
# API Configuration
# ===========================================
# Django backend URL (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production, change to your deployed backend URL:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🧪 Testing the Application

### Test 1: Backend Health Check

**Using curl:**
```bash
curl http://localhost:8000/api/model-health/
```

**Expected Response:**
```json
{
  "status": "online",
  "model_info": {
    "model": "gemini-2.5-flash",
    "provider": "Google Gemini",
    "response_time": 1.5
  }
}
```

### Test 2: Ask a Legal Question (Backend)

```bash
curl -X POST http://localhost:8000/api/ask-legal-question/ \
  -H "Content-Type: application/json" \
  -d '{"question": "What are tenant rights in India?"}'
```

### Test 3: Frontend Interface

1. Open browser: **http://localhost:3000**
2. Enter a case: *"My landlord refuses to return my security deposit"*
3. Click **"Analyze Case"**
4. You should be redirected to `/chat` with AI analysis
5. Try asking follow-up questions

### Sample Test Cases

**Tenant Rights:**
```
My landlord is refusing to return my security deposit of Rs. 50,000 
despite giving proper notice and leaving the apartment in good condition.
```

**Employment Issue:**
```
I was terminated from my job without any notice after 3 years of service. 
They are also refusing to pay my last month's salary.
```

**Property Dispute:**
```
My neighbor is constructing a wall that blocks sunlight to my property. 
What legal action can I take?
```

---

## 📝 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### 1. Model Health Check
```http
GET /api/model-health/
```

**Response:**
```json
{
  "status": "online",
  "model_info": {
    "model": "gemini-2.5-flash",
    "provider": "Google Gemini"
  }
}
```

---

#### 2. Analyze Case
```http
POST /api/analyze-case/
Content-Type: application/json

{
  "case_text": "Description of your legal situation..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "Detailed legal analysis...",
  "case_text": "Original case text...",
  "response_time": 8.5
}
```

**Token Limit:** 8192 tokens (detailed analysis)

---

#### 3. Ask Legal Question
```http
POST /api/ask-legal-question/
Content-Type: application/json

{
  "question": "What are fundamental rights in India?"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Detailed answer...",
  "question": "Original question...",
  "response_time": 5.2
}
```

**Token Limit:** 6144 tokens

---

#### 4. Explain Case Reasoning
```http
POST /api/explain-reasoning/
Content-Type: application/json

{
  "user_case": "My situation...",
  "precedent_case": "Previous court case details..."
}
```

**Response:**
```json
{
  "success": true,
  "explanation": "How this precedent applies...",
  "response_time": 4.1
}
```

**Token Limit:** 4096 tokens

---

#### 5. Query Statistics
```http
GET /api/stats/
```

**Response:**
```json
{
  "total_queries": 145,
  "successful_queries": 142,
  "failed_queries": 3,
  "average_response_time": 6.8,
  "success_rate": 97.93
}
```

---

## 🐛 Troubleshooting Guide

### Django Backend Issues

#### Issue: Port 8000 already in use

**Solution:**
```bash
# Use a different port
python manage.py runserver 8001

# Update frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

#### Issue: "ModuleNotFoundError"

**Solution:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

#### Issue: Database errors

**Solution:**
```bash
# Delete database and start fresh
rm db.sqlite3
rm -rf legal_api/migrations/

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

---

#### Issue: "Invalid API key" or "Model not found"

**Solution:**
1. Check `.env` file has correct API key
2. Verify key starts with `AIza`
3. No extra spaces or quotes around the key
4. Test key directly:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

### Next.js Frontend Issues

#### Issue: Port 3000 already in use

**Solution:**
```bash
npm run dev -- -p 3001
```

---

#### Issue: "Module not found" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

#### Issue: Environment variables not loading

**Solution:**
1. File must be named `.env.local` (not `.env`)
2. No quotes around values
3. Restart dev server after changes:
```bash
# Ctrl+C to stop
npm run dev
```

---

#### Issue: "Failed to fetch" or CORS errors

**Solution:**
1. Check Django is running: `http://localhost:8000/api/model-health/`
2. Verify `CORS_ALLOWED_ORIGINS` in `server/.env` includes `http://localhost:3000`
3. Restart Django after changing CORS settings
4. Check browser console for exact error

---

### API/Integration Issues

#### Issue: Response getting cut off mid-sentence

**Solution:**
Already fixed! Token limits are set to:
- Case analysis: 8192 tokens
- General questions: 6144 tokens
- Reasoning: 4096 tokens

If still truncated, increase in `server/legal_api/services.py`.

---

#### Issue: Chat history not saving

**Solution:**
1. Check browser localStorage isn't disabled
2. Try in different browser
3. Clear browser cache
4. Check browser console for errors

---

#### Issue: Markdown not rendering properly

**Solution:**
```bash
# Ensure packages are installed
cd client
npm install react-markdown remark-gfm rehype-raw rehype-sanitize
```

---

## 🎯 Feature Deep Dive

### Case Analysis Feature

When you submit a case, the AI provides:

1. **Case Type Classification**
   - Criminal, Civil, Family, Corporate, Property, or Labor

2. **Legal Issues Identified**
   - All relevant legal problems in your situation

3. **Applicable Laws**
   - Specific sections, acts, articles
   - Landmark Supreme Court/High Court judgments

4. **Potential Outcomes**
   - Best case scenario
   - Worst case scenario
   - Most likely outcome

5. **Recommended Next Steps**
   - Immediate actions
   - Documents to gather
   - Which court/authority to approach
   - Time limitations

6. **Important Warnings**
   - Critical points to be aware of

### Chat Interface Features

- **Context Awareness**: AI remembers your initial case
- **Follow-up Questions**: Ask for clarification or more details
- **Suggested Questions**: Quick access to common follow-ups
- **Real-time Responses**: Streaming-like experience with loading states
- **Markdown Formatting**: 
  - Bold, italic, headings
  - Numbered and bulleted lists
  - Code blocks and quotes
  - Tables for comparisons

### Chat History Management

- **Automatic Saving**: Every conversation saved locally
- **Session Resume**: Continue previous conversations
- **Delete Chats**: Remove unwanted history
- **50 Chat Limit**: Keeps most recent sessions
- **Timestamps**: Know when each chat occurred
- **Message Count**: See conversation length

---

## 🔒 Security & Privacy

### Data Storage

- **No User Accounts**: Completely stateless
- **Local Storage Only**: Chat history stored in your browser
- **No Server-Side Storage**: Conversations not saved on backend
- **API Keys**: Stored securely in environment variables

### Query Logging

The backend logs queries for analytics:
- Question/case text
- AI response
- Response time
- Timestamp
- IP address (for rate limiting)

**Note:** This is stored in the local SQLite database only for monitoring and improvement purposes.

### Production Security Checklist

Before deploying to production:

- [ ] Set `DEBUG=False` in Django
- [ ] Use strong `SECRET_KEY`
- [ ] Enable HTTPS
- [ ] Restrict `ALLOWED_HOSTS`
- [ ] Restrict `CORS_ALLOWED_ORIGINS`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Add API key rotation
- [ ] Implement user authentication (if needed)

---

## 🚢 Production Deployment

### Backend (Django)

**Option 1: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add environment variables in Railway dashboard
# Deploy
railway up
```

**Option 2: Heroku**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set GOOGLE_API_KEY=your_key
heroku config:set SECRET_KEY=your_secret

# Deploy
git push heroku main
```

**Option 3: DigitalOcean App Platform**
1. Connect GitHub repository
2. Select `server` directory
3. Add environment variables
4. Deploy

### Frontend (Next.js)

**Option 1: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from client directory
cd client
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
```

**Option 2: Netlify**
1. Connect GitHub repository
2. Set build directory: `client`
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables

**Option 3: Cloudflare Pages**
1. Connect GitHub repository
2. Framework preset: Next.js
3. Build command: `npm run build`
4. Build output: `.next`

---

## 📊 Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.9+ | Programming language |
| Django | 5.0.1 | Web framework |
| Django REST Framework | 3.14.0 | API framework |
| Google Gemini API | 2.5 Flash | AI model |
| SQLite | 3.x | Database (dev) |
| PostgreSQL | 13+ | Database (prod) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Next.js | 14 | React framework |
| React | 18 | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3.x | Styling |
| React Markdown | 9+ | Markdown rendering |
| Radix UI | Latest | UI components |

### AI Model

- **Google Gemini 2.5 Flash**
- **Free Tier**: 60 requests/minute
- **Token Limits**: Up to 65,536 output tokens
- **Multilingual**: Supports multiple languages including Hindi
- **Context Window**: 1M input tokens

---

## 📄 Important Disclaimers

### Legal Disclaimer

**⚠️ THIS APPLICATION PROVIDES AI-GENERATED INFORMATION ONLY**

- This application is for **informational purposes only**
- It does **NOT constitute legal advice**
- It does **NOT create an attorney-client relationship**
- Always consult with a **licensed advocate** for formal legal representation
- The AI may make mistakes or provide outdated information
- Do not rely solely on this information for legal decisions

### AI Limitations

- Responses are generated by AI and may contain errors
- Legal information may be outdated (training data cutoff)
- Not all scenarios can be perfectly analyzed
- Regional variations in laws may not be fully covered
- Precedents mentioned should be verified independently

### Data Usage

- Your queries are logged for analytics
- No personal information is required or stored
- Chat history is stored locally in your browser only
- We do not share data with third parties

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test all API endpoints
- Update documentation for new features
- Check both light and dark themes

---

## 📧 Support & Contact

### Common Issues

Most issues can be resolved by:
1. Checking the Troubleshooting section above
2. Reviewing console logs (Django terminal and browser console)
3. Verifying environment variables are set correctly
4. Ensuring both servers are running

### Getting Help

If you encounter issues:
1. Check if issue exists in GitHub Issues
2. Provide detailed error messages
3. Include steps to reproduce
4. Share relevant console logs

---

## 📅 Version History

### v1.0.0 (March 2026)
- Initial release
- Google Gemini 2.5 Flash integration
- Case analysis feature
- Chat interface with history
- Markdown rendering
- Responsive design
- LocalStorage persistence

---

## 🙏 Acknowledgments

- **Google Gemini** for providing free AI API
- **Anthropic Claude** for development assistance
- **Next.js Team** for excellent framework
- **Django Team** for robust backend framework
- **Indian Legal Community** for knowledge and precedents

---

## 📜 License

This project is for educational and informational purposes only.

**MIT License** - Feel free to use, modify, and distribute with attribution.

---

## 🎓 Learning Resources

### Django
- [Official Django Docs](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)

### Google Gemini
- [Gemini API Docs](https://ai.google.dev/docs)
- [Gemini Quickstart](https://ai.google.dev/tutorials/python_quickstart)

### Indian Law
- [Indian Kanoon](https://indiankanoon.org/)
- [Bare Acts](https://legislative.gov.in/)

---

**Made with ❤️ for Indian Legal Tech**

**Current Version:** v1.0.0  
**Last Updated:** March 2026  
**Status:** ✅ Production Ready