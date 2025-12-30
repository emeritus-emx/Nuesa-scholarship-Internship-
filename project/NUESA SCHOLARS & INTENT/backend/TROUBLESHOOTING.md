# NUESA Backend Troubleshooting Guide

Common issues and solutions for the NUESA backend.

## Installation Issues

### Issue: `pip install` fails

**Solution 1: Check Python version**
```bash
python --version  # Should be 3.9+
python3 --version  # Try python3 if python doesn't work
```

**Solution 2: Use virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Solution 3: Update pip**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: Module not found errors

```bash
# Reinstall all dependencies
pip install --force-reinstall -r requirements.txt

# Or use cached packages
pip install --no-cache-dir -r requirements.txt
```

## Database Issues

### Issue: "database.db is locked"

```bash
# Delete the database file
rm nuesa.db

# Reinitialize
python seed.py
```

### Issue: SQLAlchemy engine errors

**Check database URL format:**
```
✅ sqlite:///./nuesa.db
✅ postgresql://user:pass@localhost/dbname
❌ postgresql://user:pass@localhost:5432/dbname  (missing port syntax)
```

**Test connection:**
```python
python -c "from database import engine; conn = engine.connect(); print('✅ Connected!')"
```

### Issue: "No module named 'psycopg2'"

PostgreSQL adapter missing:

```bash
pip install psycopg2-binary
```

Or use:
```bash
pip install psycopg2
```

### Issue: "FATAL: role 'username' does not exist"

Create the PostgreSQL user:
```bash
psql -U postgres
CREATE ROLE nuesa_user WITH LOGIN PASSWORD 'your_password';
ALTER ROLE nuesa_user CREATEDB;
```

## Runtime Issues

### Issue: Port 8000 already in use

**Option 1: Use different port**
```bash
python main.py --port 8001
# Or
uvicorn main:app --port 8001
```

**Option 2: Kill process on port 8000**
```bash
# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Option 3: Stop using service**
```bash
# If running as service
sudo systemctl stop nuesa-backend
```

### Issue: "ModuleNotFoundError: No module named 'main'"

**Solution:**
```bash
# Make sure you're in the backend directory
cd backend

# Check if main.py exists
ls main.py

# Run from correct location
python main.py

# Or specify module path
python -m main
```

### Issue: Server crashes on startup

**Check for syntax errors:**
```bash
python -m py_compile main.py
python -m py_compile config.py
```

**Get more detailed error:**
```bash
python main.py 2>&1 | head -50
```

**Check error logs:**
```bash
# If running with systemd
sudo journalctl -u nuesa-backend -n 50

# If running with supervisor
tail -f /var/log/nuesa-backend.log
```

## Authentication Issues

### Issue: "Invalid token" errors

**Causes & Solutions:**

1. **Token expired** (60 minutes default)
   ```
   Use refresh token to get new access token
   POST /api/auth/refresh?refresh_token=YOUR_REFRESH_TOKEN
   ```

2. **Wrong SECRET_KEY**
   ```
   Verify SECRET_KEY in .env matches when tokens were issued
   ```

3. **Malformed token header**
   ```
   ✅ Authorization: Bearer token_here
   ❌ Authorization: token_here  (missing "Bearer")
   ❌ Authorization: Bearer  (missing actual token)
   ```

### Issue: "Invalid email or password"

```bash
# Check if user exists
python -c "
from database import SessionLocal
from models import User
db = SessionLocal()
user = db.query(User).filter(User.email=='admin@nuesa.com').first()
print(f'User exists: {user is not None}')
"

# Test password
python -c "
from security import verify_password, hash_password
stored_hash = '<hash_from_db>'
test_password = 'TestPassword123!'
print(f'Password matches: {verify_password(test_password, stored_hash)}')
"
```

### Issue: "Token has expired"

**Solution:**
```bash
# Use refresh endpoint
curl -X POST "http://localhost:8000/api/auth/refresh?refresh_token=YOUR_REFRESH_TOKEN"

# Or login again
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## API Issues

### Issue: CORS errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. **Check CORS_ORIGINS in .env**
   ```
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   # (No trailing slashes!)
   ```

2. **Restart server after changing**
   ```bash
   # Stop server (Ctrl+C)
   # Restart
   python main.py
   ```

3. **Check frontend URL format**
   ```
   ✅ http://localhost:5173
   ❌ http://localhost:5173/
   ❌ localhost:5173 (missing protocol)
   ```

### Issue: 404 Not Found on valid endpoint

**Check:**
```bash
# 1. Endpoint path spelling
curl http://localhost:8000/api/users/me  # ✅ correct
curl http://localhost:8000/api/user/me   # ❌ wrong

# 2. Server is running
curl http://localhost:8000/health

# 3. Correct base URL
# API should be at /api prefix
curl http://localhost:8000/api/opportunities
```

### Issue: 401 Unauthorized without token error

```bash
# 1. Check if endpoint requires auth
# Protected endpoints: /users/, /applications/

# 2. Include token if endpoint is protected
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/users/me

# 3. Get new token if expired
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Issue: 422 Validation Error

**Check request body format:**
```bash
# ❌ Wrong
{
  "email": "user@example.com",
  "fullName": "John"  # Should be full_name
}

# ✅ Correct
{
  "email": "user@example.com",
  "full_name": "John"
}
```

**Check field requirements:**
```bash
# See API docs at http://localhost:8000/api/docs
# for exact field requirements
```

## Performance Issues

### Issue: Slow API responses

**Optimization steps:**

1. **Check database size**
   ```bash
   # For SQLite
   ls -lh nuesa.db
   
   # For PostgreSQL
   psql -U user -d nuesa_db -c "SELECT pg_database.datname, 
   pg_size_pretty(pg_database_size(pg_database.datname)) 
   FROM pg_database;"
   ```

2. **Add database indexes** (in models.py)
   ```python
   email = Column(String, index=True)  # Add index=True
   ```

3. **Limit query results**
   ```bash
   # Use pagination
   /api/opportunities?page=1&page_size=20
   ```

4. **Enable pagination in large datasets**
   ```python
   # Don't select all rows at once
   query.limit(page_size).offset((page-1)*page_size)
   ```

### Issue: High memory usage

```bash
# Check current usage
ps aux | grep python

# Limit database connections
# In config.py, add connection pooling
```

## Development Issues

### Issue: Changes not reflected after editing files

**Solution: Enable auto-reload**
```bash
# Using --reload flag
uvicorn main:app --reload

# Or use the convenience script
python main.py
```

**If still not working:**
```bash
# 1. Stop server (Ctrl+C)
# 2. Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# 3. Restart
python main.py
```

### Issue: Import errors with relative paths

**Solution: Add to path or use absolute imports**
```python
# Instead of
from models import User

# Use
from backend.models import User

# Or run from backend directory
cd backend
python main.py
```

## Testing Issues

### Issue: Tests fail with "database is locked"

```bash
# Clean up test database
rm test.db

# Run tests again
pytest

# Or use in-memory database for tests
TEST_DATABASE_URL=sqlite:///:memory:
```

### Issue: "No tests collected"

```bash
# Check test file naming
# Must be test_*.py or *_test.py

# Specify test file
pytest test_examples.py

# Run with verbose
pytest -v
```

## Logging & Debugging

### Enable Debug Logging

```bash
# Set log level in .env
LOG_LEVEL=DEBUG

# Or run with debug
python main.py --debug
```

### View Server Logs

```bash
# Real-time logs
tail -f logs/app.log

# Last 50 lines
tail -50 logs/app.log

# Search for errors
grep ERROR logs/app.log
```

### Add Debug Prints

```python
# In your route
import logging
logger = logging.getLogger(__name__)

logger.debug(f"User ID: {user_id}")
logger.error(f"Error: {str(e)}")
```

## Common Error Messages

### "ValueError: malformed node or string"

**Cause:** Invalid data format
```bash
# Check JSON syntax if sending requests
# Check string format in database
```

### "IntegrityError: UNIQUE constraint failed"

**Cause:** Duplicate entry
```bash
# Check for duplicate email
SELECT * FROM users WHERE email='duplicate@example.com';

# Clear duplicates if needed
DELETE FROM users WHERE id IN (SELECT id FROM users WHERE email='duplicate@example.com' OFFSET 1);
```

### "OperationalError: no such table"

**Cause:** Database not initialized
```bash
# Run initialization
python -c "from database import init_db; init_db()"

# Or
python seed.py
```

## Getting Help

### Check Log Files
```bash
# Application logs
tail -f logs/app.log

# System logs (if using systemd)
journalctl -u nuesa-backend -f
```

### Enable Verbose Output
```bash
# With uvicorn
uvicorn main:app --log-level debug

# With Python logging
python -u main.py 2>&1 | tee debug.log
```

### Run Diagnostic Script

```python
# Create diagnosis.py
from database import engine, SessionLocal
from models import User, Opportunity
import logging

logging.basicConfig(level=logging.DEBUG)

# Test database
try:
    with engine.connect() as conn:
        print("✅ Database connected")
except Exception as e:
    print(f"❌ Database error: {e}")

# Test models
db = SessionLocal()
users = db.query(User).count()
opportunities = db.query(Opportunity).count()
print(f"✅ Users: {users}, Opportunities: {opportunities}")
db.close()
```

## Quick Reset

If everything is broken:

```bash
# Stop server
# Ctrl+C

# Backup your data (if needed)
cp nuesa.db nuesa.db.backup

# Delete database
rm nuesa.db

# Clear cache
find . -type d -name __pycache__ -exec rm -r {} +

# Reinstall dependencies
pip install -r requirements.txt

# Reinitialize
python seed.py

# Start fresh
python main.py
```

---

**Still stuck?** Check the full README.md or QUICKSTART.md for more details.

**Last Updated:** December 2025
