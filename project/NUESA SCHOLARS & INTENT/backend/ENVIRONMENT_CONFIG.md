# NUESA Backend Environment Configuration

## Overview

This guide explains how to properly configure your NUESA backend using environment variables.

## Setup Instructions

### 1. Initial Setup

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your actual values
nano .env  # or use your favorite editor
```

### 2. Critical Settings

These settings MUST be configured before running in production:

#### SECRET_KEY (CRITICAL!)
Generate a secure random string:

```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -hex 32
```

Then add to `.env`:
```
SECRET_KEY=your-generated-secret-key-here
```

#### DATABASE_URL
Development (SQLite - auto-created):
```
DATABASE_URL=sqlite:///./nuesa.db
```

Production (PostgreSQL - recommended):
```
DATABASE_URL=postgresql://username:password@localhost:5432/nuesa_db
```

MySQL alternative:
```
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/nuesa_db
```

#### CORS_ORIGINS
Set to your frontend URL(s):

Development:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
```

Production:
```
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Optional Settings

#### Email Configuration
For email notifications:

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use app password, not main password
```

For Gmail, generate an app password:
1. Go to myaccount.google.com
2. Enable 2-factor authentication
3. Generate app password for Mail
4. Use the generated password in SMTP_PASSWORD

#### Google Gemini API
For AI-powered features:

```
GEMINI_API_KEY=your-api-key-from-google-ai
```

Get your key from: https://ai.google.dev/

#### Rate Limiting
Control API rate limits:

```
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD_SECONDS=60
```

## Complete Example .env File

```ini
# ============================================================
# NUESA Backend Configuration
# ============================================================

# SECURITY - CHANGE THESE IN PRODUCTION!
SECRET_KEY=your-secret-key-generated-with-secrets-module
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# DATABASE
DATABASE_URL=sqlite:///./nuesa.db

# CORS - Add your frontend URLs
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000

# EMAIL (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# GEMINI API (Optional)
GEMINI_API_KEY=

# RATE LIMITING
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD_SECONDS=60

# PAGINATION
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# API
API_TITLE=NUESA Scholars & Intent API
API_VERSION=1.0.0
```

## Environment-Specific Configurations

### Development (.env)
```
SECRET_KEY=dev-secret-key-insecure-for-testing-only
DATABASE_URL=sqlite:///./nuesa.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
RATE_LIMIT_ENABLED=false
```

### Staging (.env.staging)
```
SECRET_KEY=your-staging-secret-key
DATABASE_URL=postgresql://user:pass@staging-db.com:5432/nuesa
CORS_ORIGINS=https://staging.yourdomain.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=200
```

### Production (.env.production)
```
SECRET_KEY=your-production-secret-key-ultra-secure
DATABASE_URL=postgresql://user:pass@prod-db.com:5432/nuesa
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
```

## Security Best Practices

### ✅ DO

- [ ] Use a strong, random SECRET_KEY
- [ ] Store sensitive data in .env files
- [ ] Use different keys for different environments
- [ ] Rotate keys regularly
- [ ] Use HTTPS in production
- [ ] Use strong database passwords
- [ ] Limit CORS origins to known domains
- [ ] Use environment variables for all secrets
- [ ] Add .env to .gitignore (never commit it!)

### ❌ DON'T

- Don't commit .env files to version control
- Don't use the same SECRET_KEY in multiple environments
- Don't use weak or predictable keys
- Don't hardcode secrets in code
- Don't share .env files in unencrypted channels
- Don't use default/example values in production
- Don't allow wildcard CORS origins in production
- Don't expose .env file in error messages

## Loading Environment Variables

The backend automatically loads from `.env` file using pydantic-settings:

```python
# In config.py
class Settings(BaseSettings):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default-value")
    # ...
    
    class Config:
        env_file = ".env"
```

## Verifying Configuration

### Check if .env is loaded:
```bash
python -c "from config import get_settings; s = get_settings(); print(f'Database: {s.DATABASE_URL}')"
```

### Check specific setting:
```bash
python -c "from config import get_settings; print(get_settings().SECRET_KEY[:10] + '...')"
```

## Docker Environment Variables

If running in Docker, pass environment variables:

```bash
docker run -e SECRET_KEY=your-key \
           -e DATABASE_URL=postgresql://... \
           -e CORS_ORIGINS=https://yourdomain.com \
           nuesa-backend
```

Or in docker-compose.yml:
```yaml
services:
  backend:
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - CORS_ORIGINS=${CORS_ORIGINS}
```

## Troubleshooting

### Settings not loading?
```bash
# Check if .env file exists
ls -la .env

# Check file format (no quotes needed)
cat .env

# Make sure you're in the right directory
pwd
```

### "KeyError: SECRET_KEY"?
Make sure SECRET_KEY is set in .env or environment:
```bash
export SECRET_KEY=your-key-here
python main.py
```

### Database connection error?
Verify DATABASE_URL format:
```
# SQLite
sqlite:///./nuesa.db

# PostgreSQL
postgresql://user:password@host:port/database

# Check connection
python -c "from database import engine; print(engine.url)"
```

### CORS errors?
Verify CORS_ORIGINS includes your frontend:
```bash
# Check current setting
python -c "from config import get_settings; print(get_settings().CORS_ORIGINS)"

# Should include your frontend URL, e.g.:
# http://localhost:5173 for Vite
# http://localhost:3000 for Next.js
```

## Additional Resources

- [Pydantic Settings Documentation](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [Python-dotenv](https://github.com/theskumar/python-dotenv)
- [12-Factor App Configuration](https://12factor.net/config)

---

**Last Updated**: December 2025
