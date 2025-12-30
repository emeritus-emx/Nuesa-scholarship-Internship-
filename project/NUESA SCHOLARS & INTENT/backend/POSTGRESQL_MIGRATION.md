# PostgreSQL Migration Guide

## Overview
Your NUESA backend has been migrated from SQLite (local file storage) to PostgreSQL (server-based database). This guide walks you through setup and deployment.

---

## ✅ What Changed

| Aspect | Before (SQLite) | After (PostgreSQL) |
|--------|-----------------|-------------------|
| **Database Type** | File-based, local | Server-based, networked |
| **File** | `nuesa.db` | Remote PostgreSQL server |
| **Best For** | Development only | Development + Production |
| **Scalability** | Limited | Excellent |
| **Concurrency** | Limited | Excellent |
| **Backups** | Manual file copy | Professional tools |
| **Multi-server** | Not possible | Possible with replication |

---

## 🚀 Setup Instructions

### Step 1: Install PostgreSQL

**On Windows (using WSL):**
```bash
# Update package manager
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo service postgresql start

# Verify installation
psql --version
```

**On macOS:**
```bash
# Using Homebrew
brew install postgresql@15

# Start service
brew services start postgresql@15
```

**On Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo service postgresql start
```

### Step 2: Create Database and User

**Access PostgreSQL:**
```bash
# Connect as default postgres user
sudo -u postgres psql
```

**Create database and user:**
```sql
-- Create database
CREATE DATABASE nuesa_db;

-- Create user with password
CREATE USER nuesa_user WITH PASSWORD 'your-secure-password-here';

-- Grant privileges
ALTER ROLE nuesa_user SET client_encoding TO 'utf8';
ALTER ROLE nuesa_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE nuesa_user SET default_transaction_deferrable TO on;
ALTER ROLE nuesa_user SET default_transaction_read_only TO off;

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE nuesa_db TO nuesa_user;

-- Exit psql
\q
```

### Step 3: Update .env File

**Copy the example file:**
```bash
cp .env.example .env
```

**Edit `.env` with your PostgreSQL credentials:**
```env
# Database connection string
DATABASE_URL=postgresql://nuesa_user:your-secure-password-here@localhost:5432/nuesa_db

# Or break it down:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nuesa_db
DB_USER=nuesa_user
DB_PASSWORD=your-secure-password-here

# Update other settings as needed
SECRET_KEY=generate-a-new-secret-key
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Step 4: Install Required Dependencies

**Install PostgreSQL Python driver:**
```bash
pip install psycopg2-binary
# Or if using poetry:
poetry add psycopg2-binary
```

**Verify all dependencies:**
```bash
pip install -r requirements.txt
```

### Step 5: Initialize Database

**Create all tables:**
```bash
# From your backend directory
python -c "from database import init_db; init_db(); print('Database initialized!')"
```

**Or load sample data:**
```bash
# If you have a seed file
python seed.py
```

### Step 6: Start Backend

```bash
# Start the API server
python main.py
# Server will be at http://localhost:8000

# Or using Uvicorn directly:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🧪 Testing Connection

**Test database connectivity:**
```bash
# Connect to database
psql -h localhost -U nuesa_user -d nuesa_db

# List tables
\dt

# Check connections
SELECT datname, usename, state FROM pg_stat_activity WHERE datname = 'nuesa_db';

# Exit
\q
```

**Test API endpoints:**
```bash
# Health check
curl http://localhost:8000/api/health

# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "TestPassword123!"
  }'

# Check data was stored
psql -h localhost -U nuesa_user -d nuesa_db -c "SELECT * FROM users;"
```

---

## 📊 Connection Pooling

Your backend now uses **connection pooling** for better performance:

```python
# In database.py
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,           # Keep 10 connections ready
    max_overflow=20,        # Allow up to 20 additional connections
    pool_pre_ping=True,     # Test connection before use
    pool_recycle=3600       # Recycle connections every hour
)
```

This ensures:
- ✅ Better performance (reuse connections)
- ✅ Prevents stale connections
- ✅ Handles many concurrent requests

---

## 🔄 Migrating Data from SQLite

If you have existing data in SQLite:

**Export from SQLite:**
```bash
# Dump SQLite data
sqlite3 nuesa.db .dump > nuesa_export.sql
```

**Import to PostgreSQL:**
```bash
# Connect to PostgreSQL
psql -h localhost -U nuesa_user -d nuesa_db < nuesa_export.sql
```

**Alternative: Programmatic Migration:**
```python
# migration_script.py
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from models import Base, User, Opportunity, Application

# SQLite engine
sqlite_engine = create_engine('sqlite:///./nuesa.db')
sqlite_session = sessionmaker(bind=sqlite_engine)()

# PostgreSQL engine
postgres_engine = create_engine('postgresql://user:pass@localhost/nuesa_db')
postgres_session = sessionmaker(bind=postgres_engine)()

# Migrate users
for user in sqlite_session.query(User).all():
    postgres_session.add(user)
postgres_session.commit()

print("Migration complete!")
```

---

## 🔐 Production Setup

For production deployment:

### AWS RDS PostgreSQL
```env
# AWS RDS connection
DATABASE_URL=postgresql://admin:password@nuesa-db.xxxxx.us-east-1.rds.amazonaws.com:5432/nuesa_db
```

### DigitalOcean Managed Database
```env
# DigitalOcean connection
DATABASE_URL=postgresql://doadmin:password@db-postgresql-nyc1-xxxxx.db.ondigitalocean.com:25060/nuesa_db?sslmode=require
```

### Azure Database for PostgreSQL
```env
# Azure connection
DATABASE_URL=postgresql://admin@nuesa-server:password@nuesa-server.postgres.database.azure.com:5432/nuesa_db?sslmode=require
```

### Environment Variables (Production)
```bash
# Never hardcode credentials!
export DATABASE_URL="postgresql://user:pass@host:5432/db"
export SECRET_KEY="generate-strong-key"
export CORS_ORIGINS="https://yourdomain.com"
```

---

## 📈 Performance Tips

1. **Add Indexes** (automatic in code):
   ```python
   Column(String(255), index=True)  # Creates database index
   ```

2. **Connection Pooling** (already configured):
   - Reuses connections
   - Reduces overhead
   - Handles concurrency

3. **Query Optimization**:
   ```python
   # Use .options() for eager loading
   from sqlalchemy.orm import joinedload
   
   user = db.query(User).options(
       joinedload(User.applications),
       joinedload(User.profile)
   ).first()
   ```

4. **Database Maintenance**:
   ```sql
   -- Analyze query performance
   ANALYZE;
   
   -- Clean up dead rows
   VACUUM;
   
   -- Rebuild indexes
   REINDEX DATABASE nuesa_db;
   ```

---

## ⚠️ Common Issues & Solutions

### Issue: "psycopg2 not found"
```bash
pip install psycopg2-binary
```

### Issue: "Connection refused" on localhost:5432
```bash
# Start PostgreSQL
sudo service postgresql start

# Or verify it's running
sudo service postgresql status
```

### Issue: "Password authentication failed"
```bash
# Reset PostgreSQL password
sudo -u postgres psql -c "ALTER USER nuesa_user WITH PASSWORD 'new-password';"
```

### Issue: "Database does not exist"
```bash
# Create missing database
createdb -h localhost -U postgres nuesa_db

# And create user
sudo -u postgres psql -c "CREATE USER nuesa_user WITH PASSWORD 'password';"
```

### Issue: "Too many connections"
```python
# Increase pool_size in database.py
pool_size=20,
max_overflow=40,
```

---

## 🔍 Monitoring

**Check active connections:**
```sql
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

**Check slow queries:**
```sql
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

**Check database size:**
```sql
SELECT pg_size_pretty(pg_database_size('nuesa_db'));
```

---

## ✨ Benefits of PostgreSQL

✅ **Reliability** - ACID transactions ensure data integrity
✅ **Scalability** - Handles thousands of concurrent users
✅ **Security** - Row-level security, encryption, audit logging
✅ **Performance** - Indexing, query optimization, connection pooling
✅ **Features** - JSON support, arrays, full-text search, PostGIS
✅ **Compatibility** - Works with most hosting platforms
✅ **Cost** - Free and open-source
✅ **Community** - Large active community with great support

---

## 📚 Next Steps

1. ✅ Set up PostgreSQL locally for development
2. ✅ Test all API endpoints
3. ✅ Migrate any existing SQLite data
4. ✅ Set up production PostgreSQL (AWS RDS, DigitalOcean, etc.)
5. ✅ Configure backups
6. ✅ Monitor performance

---

**Your backend is now ready for production! 🚀**
