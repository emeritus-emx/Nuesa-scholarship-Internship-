# NUESA Scholars & Intent - Backend API

A secured, production-ready FastAPI backend for the NUESA scholarship and internship platform.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Password hashing with bcrypt
  - User role management (admin/regular user)

- **Database**
  - SQLAlchemy ORM with SQLite (development) or PostgreSQL (production)
  - Comprehensive models for users, opportunities, applications, ratings

- **Security**
  - CORS protection
  - TrustedHost middleware
  - Input validation with Pydantic
  - Rate limiting support
  - Secure password requirements

- **API Features**
  - User registration and login
  - User profile management
  - Opportunity CRUD operations
  - Application tracking
  - Save/bookmark opportunities
  - Opportunity ratings and reviews
  - Search and filter capabilities
  - Pagination support
  - Comprehensive error handling
  - API documentation with Swagger UI

## 📋 Prerequisites

- Python 3.9+
- pip or poetry

## ⚙️ Installation

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Change SECRET_KEY to a secure random string in production
```

## 🏃 Running the Server

### Development

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger UI Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Health Check**: http://localhost:8000/health

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/me` - Update user info
- `DELETE /api/users/account` - Delete account

### Opportunities
- `GET /api/opportunities` - List opportunities (paginated)
- `GET /api/opportunities/featured` - Get featured opportunities
- `GET /api/opportunities/search` - Search opportunities
- `GET /api/opportunities/{id}` - Get opportunity details
- `POST /api/opportunities` - Create opportunity (admin)
- `PUT /api/opportunities/{id}` - Update opportunity (admin)
- `DELETE /api/opportunities/{id}` - Delete opportunity (admin)
- `POST /api/opportunities/{id}/save` - Save opportunity
- `DELETE /api/opportunities/{id}/save` - Unsave opportunity
- `GET /api/opportunities/user/saved` - Get saved opportunities

### Applications
- `POST /api/applications` - Create draft application
- `GET /api/applications` - List user applications
- `GET /api/applications/{id}` - Get application details
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete draft application
- `POST /api/applications/{id}/submit` - Submit application
- `POST /api/applications/{id}/withdraw` - Withdraw application

## 🔐 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one digit
- At least one special character (!@#$%^&*)

### JWT Tokens
- Access tokens expire in 60 minutes (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens include user ID, email, and admin status

### CORS Configuration
Configure allowed origins in `.env`:

```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

### Database
- SQLite for development (auto-created)
- PostgreSQL recommended for production

```
# Development
DATABASE_URL=sqlite:///./nuesa.db

# Production with PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/nuesa_db
```

## 📖 Database Models

### User
- Email, password, full name, phone, bio
- Profile picture, verification status
- Admin flag, active status

### UserProfile
- GPA, university, major, year of study
- Skills, experience, location preferences
- Extended profile information

### Opportunity
- Title, description, type (scholarship/internship/grant/fellowship)
- Organization, amount, deadline
- Eligibility criteria, requirements, location
- View count, application count, rating
- Featured flag, active status

### Application
- User, opportunity, status
- Custom responses, resume, cover letter
- Submission date, feedback

### Sponsorship
- Organization details
- Sponsorship amount, duration
- Requirements, contact info

## 🧪 Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=.
```

## 📝 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## 🔧 Configuration

All settings are in `config.py` and can be overridden with environment variables in `.env`:

```python
SECRET_KEY              # JWT secret key
ALGORITHM               # JWT algorithm (HS256)
ACCESS_TOKEN_EXPIRE_MINUTES  # Access token lifetime
REFRESH_TOKEN_EXPIRE_DAYS    # Refresh token lifetime
DATABASE_URL            # Database connection string
CORS_ORIGINS            # Comma-separated CORS origins
RATE_LIMIT_ENABLED      # Enable/disable rate limiting
DEFAULT_PAGE_SIZE       # Default pagination size
MAX_PAGE_SIZE           # Maximum pagination size
```

## 🚨 Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `409` - Conflict
- `500` - Server error

Errors include detailed messages:

```json
{
  "detail": "Error description"
}
```

## 📦 Project Structure

```
backend/
├── main.py              # Main FastAPI application
├── config.py            # Configuration settings
├── database.py          # Database setup
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── security.py          # Authentication & authorization
├── requirements.txt     # Python dependencies
├── .env.example         # Example environment config
└── routes/
    ├── __init__.py
    ├── auth.py          # Authentication routes
    ├── users.py         # User routes
    ├── opportunities.py # Opportunity routes
    └── applications.py  # Application routes
```

## 🛠️ Development Tips

### Create Admin User

```python
from database import SessionLocal, init_db
from models import User
from security import hash_password

init_db()
db = SessionLocal()

admin = User(
    email="admin@example.com",
    full_name="Admin User",
    hashed_password=hash_password("SecurePassword123!"),
    is_admin=True,
    is_verified=True
)
db.add(admin)
db.commit()
```

### Generate Secure Secret Key

```python
import secrets
print(secrets.token_urlsafe(32))
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [JWT Documentation](https://jwt.io/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

## 📄 License

This project is part of the NUESA Scholars & Intent platform.

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and add appropriate error handling.

---

**Last Updated**: December 2025
