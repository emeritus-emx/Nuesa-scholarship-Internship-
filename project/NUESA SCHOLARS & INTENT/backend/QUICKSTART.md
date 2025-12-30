# NUESA Backend Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
# Copy example configuration
cp .env.example .env

# Edit .env and update:
# - SECRET_KEY: Change to a secure random string
# - DATABASE_URL: Keep as is for SQLite (dev) or set PostgreSQL URL for production
# - CORS_ORIGINS: Add your frontend URL (e.g., http://localhost:5173)
```

To generate a secure SECRET_KEY:

```python
import secrets
print(secrets.token_urlsafe(32))
```

### Step 3: Initialize Database with Sample Data

```bash
python seed.py
```

This creates:
- Admin account: `admin@nuesa.com` / `AdminPassword123!`
- 2 sample students
- 4 scholarship/internship opportunities
- 2 sponsorship programs

### Step 4: Start the Server

```bash
python main.py
```

Server runs at: `http://localhost:8000`

### Step 5: Explore the API

Open your browser and visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **API Status**: http://localhost:8000/health

## 📝 Quick API Examples

### Register New User

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d {
    "email": "user@example.com",
    "full_name": "John Student",
    "password": "SecurePassword123!",
    "phone": "+1234567890"
  }
```

### Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d {
    "email": "admin@nuesa.com",
    "password": "AdminPassword123!"
  }
```

Response includes `access_token` and `refresh_token`

### Get Current User (Requires Token)

```bash
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### List Opportunities

```bash
curl "http://localhost:8000/api/opportunities?page=1&page_size=10"
```

### Get Featured Opportunities

```bash
curl "http://localhost:8000/api/opportunities/featured?limit=5"
```

### Search Opportunities

```bash
curl "http://localhost:8000/api/opportunities/search?keyword=scholarship&opportunity_type=scholarship"
```

### Create Application (Requires Auth)

```bash
curl -X POST "http://localhost:8000/api/applications" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "opportunity_id": 1,
    "cover_letter": "I am interested in this opportunity...",
    "resume_url": "https://example.com/resume.pdf"
  }
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire in 60 minutes. Use the refresh token endpoint to get a new access token:

```bash
curl -X POST "http://localhost:8000/api/auth/refresh?refresh_token=YOUR_REFRESH_TOKEN"
```

## 📚 Main Routes Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/users/me` | ✅ | Get current user |
| GET | `/api/users/profile` | ✅ | Get user profile |
| PUT | `/api/users/profile` | ✅ | Update profile |
| GET | `/api/opportunities` | ❌ | List opportunities |
| GET | `/api/opportunities/{id}` | ❌ | Get opportunity |
| POST | `/api/opportunities` | ✅ Admin | Create opportunity |
| GET | `/api/opportunities/search` | ❌ | Search opportunities |
| POST | `/api/applications` | ✅ | Create application |
| GET | `/api/applications` | ✅ | List user applications |
| POST | `/api/applications/{id}/submit` | ✅ | Submit application |

## 🗄️ Database

### SQLite (Development)
- File-based database: `nuesa.db`
- Auto-created on first run
- Perfect for development and testing

### PostgreSQL (Production)
Set DATABASE_URL in `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/nuesa_db
```

## 🛠️ Useful Commands

### View API Documentation

```bash
# Swagger UI
open http://localhost:8000/api/docs

# ReDoc
open http://localhost:8000/api/redoc
```

### Reset Database

```bash
rm nuesa.db  # Delete SQLite file
python seed.py  # Recreate with sample data
```

### Create Admin Account

```python
python -c "
from database import SessionLocal, init_db
from models import User
from security import hash_password

init_db()
db = SessionLocal()
admin = User(
    email='newemail@example.com',
    full_name='Admin Name',
    hashed_password=hash_password('SecurePassword123!'),
    is_admin=True,
    is_verified=True
)
db.add(admin)
db.commit()
print('Admin user created!')
"
```

### Run Tests

```bash
pytest
pytest -v  # Verbose
pytest --cov=.  # With coverage
```

## 🔗 Connecting Frontend

Update your frontend API client to point to the backend:

```javascript
// services/apiService.ts
const API_BASE_URL = 'http://localhost:8000/api';

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Change port
python main.py --port 8001

# Or kill process using port 8000
lsof -ti:8000 | xargs kill -9
```

### Database Issues

```bash
# Reset database
rm nuesa.db
python seed.py
```

### Token Issues

- Tokens expire in 60 minutes
- Use `/api/auth/refresh` with refresh token to get new access token
- Refresh tokens last 7 days

### CORS Errors

Check `.env` CORS_ORIGINS includes your frontend URL:

```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 📖 Full Documentation

See `README.md` for comprehensive documentation.

---

**Need Help?**
- Check API docs at http://localhost:8000/api/docs
- Review backend/README.md for detailed information
- Check specific route files in backend/routes/
