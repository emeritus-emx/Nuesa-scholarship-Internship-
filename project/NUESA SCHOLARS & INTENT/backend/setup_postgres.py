#!/usr/bin/env python3
"""
NUESA Backend PostgreSQL Setup Script
Initializes PostgreSQL database and creates .env file
"""

import os
import subprocess
import sys
from pathlib import Path

# Configuration
DB_NAME = "nuesa_db"
DB_USER = "nuesa_user"
DB_PASSWORD = "nuesa_password_123"
DB_HOST = "localhost"
DB_PORT = 5432

def run_command(cmd, shell=False):
    """Run a shell command and return success status."""
    try:
        result = subprocess.run(cmd, shell=shell, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def create_env_file():
    """Create .env file with PostgreSQL configuration."""
    env_path = Path(".env")
    
    if env_path.exists():
        print("✓ .env file already exists")
        return True
    
    env_content = f"""# NUESA Backend Configuration

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production

# Database (PostgreSQL)
DATABASE_URL=postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000

# API
API_TITLE=NUESA Scholars & Intent API
API_VERSION=1.0.0

# Token
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Gemini API (optional)
GEMINI_API_KEY=

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD_SECONDS=60

# Logging
LOG_LEVEL=INFO
"""
    
    try:
        with open(env_path, "w") as f:
            f.write(env_content)
        print("✓ .env file created")
        return True
    except Exception as e:
        print(f"✗ Failed to create .env: {e}")
        return False

def setup_postgres():
    """Set up PostgreSQL database and user."""
    print("=" * 50)
    print("NUESA Backend - PostgreSQL Setup")
    print("=" * 50)
    
    # Check if PostgreSQL is running
    print("\n[1/3] Checking PostgreSQL...")
    success, stdout, stderr = run_command(
        ["sudo", "service", "postgresql", "status"],
        shell=False
    )
    
    if not success:
        print("⚠ PostgreSQL service might not be running")
        print("  Attempting to start...")
        run_command(["sudo", "service", "postgresql", "start"], shell=False)
        print("  Started PostgreSQL")
    else:
        print("✓ PostgreSQL is running")
    
    # Create database and user
    print("\n[2/3] Setting up database and user...")
    
    sql_commands = f"""
-- Drop user/database if they exist (ignore errors)
DROP DATABASE IF EXISTS {DB_NAME};
DROP ROLE IF EXISTS {DB_USER};

-- Create role
CREATE ROLE {DB_USER} WITH LOGIN PASSWORD '{DB_PASSWORD}';

-- Create database
CREATE DATABASE {DB_NAME} OWNER {DB_USER};

-- Grant privileges
ALTER ROLE {DB_USER} SET client_encoding TO 'utf8';
ALTER ROLE {DB_USER} SET default_transaction_isolation TO 'read committed';
ALTER ROLE {DB_USER} SET default_transaction_deferrable TO on;
ALTER ROLE {DB_USER} SET default_transaction_read_only TO off;

-- Verify
\\c {DB_NAME}
SELECT datname FROM pg_database WHERE datname = '{DB_NAME}';
"""
    
    # Try to run SQL commands
    try:
        result = subprocess.run(
            ["sudo", "-u", "postgres", "psql"],
            input=sql_commands,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print("✓ Database and user created")
        else:
            print("⚠ PostgreSQL setup returned non-zero, but continuing...")
            if result.stderr:
                print(f"  Details: {result.stderr[:200]}")
    except Exception as e:
        print(f"✗ Error setting up PostgreSQL: {e}")
        print("  You may need to run manually or check PostgreSQL installation")
    
    # Create .env file
    print("\n[3/3] Creating .env file...")
    if create_env_file():
        print("\n" + "=" * 50)
        print("Setup Complete!")
        print("=" * 50)
        print(f"\nConnection Details:")
        print(f"  Host: {DB_HOST}")
        print(f"  Port: {DB_PORT}")
        print(f"  Database: {DB_NAME}")
        print(f"  Username: {DB_USER}")
        print(f"  Password: {DB_PASSWORD}")
        print(f"\nNext steps:")
        print(f"  1. pip install -r requirements.txt")
        print(f"  2. python -c \"from database import init_db; init_db()\"")
        print(f"  3. python main.py")
        return True
    else:
        return False

if __name__ == "__main__":
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    success = setup_postgres()
    sys.exit(0 if success else 1)
