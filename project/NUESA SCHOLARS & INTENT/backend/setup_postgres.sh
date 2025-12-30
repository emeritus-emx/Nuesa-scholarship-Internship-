#!/bin/bash

# NUESA Backend PostgreSQL Setup Script
# This script sets up PostgreSQL for local development

echo "=========================================="
echo "NUESA Backend - PostgreSQL Setup"
echo "=========================================="

# Step 1: Ensure PostgreSQL is installed and running
echo ""
echo "[1/4] Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found. Installing..."
    sudo apt update
    sudo apt install postgresql postgresql-contrib -y
else
    echo "✓ PostgreSQL is installed"
fi

# Step 2: Start PostgreSQL service
echo ""
echo "[2/4] Starting PostgreSQL service..."
sudo service postgresql start
sleep 2

# Step 3: Create database and user
echo ""
echo "[3/4] Creating database and user..."
sudo -u postgres psql << EOF
-- Create user
CREATE ROLE nuesa_user WITH LOGIN PASSWORD 'nuesa_password_123';

-- Create database
CREATE DATABASE nuesa_db OWNER nuesa_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nuesa_db TO nuesa_user;

-- Alter role defaults
ALTER ROLE nuesa_user SET client_encoding TO 'utf8';
ALTER ROLE nuesa_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE nuesa_user SET default_transaction_deferrable TO on;
ALTER ROLE nuesa_user SET default_transaction_read_only TO off;

-- Verify
SELECT datname FROM pg_database WHERE datname = 'nuesa_db';
EOF

echo "✓ Database and user created"

# Step 4: Create .env file
echo ""
echo "[4/4] Creating .env file..."
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# NUESA Backend Configuration

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production

# Database (PostgreSQL)
DATABASE_URL=postgresql://nuesa_user:nuesa_password_123@localhost:5432/nuesa_db

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
EOF
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "=========================================="
echo "PostgreSQL Setup Complete!"
echo "=========================================="
echo ""
echo "Connection Details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: nuesa_db"
echo "  Username: nuesa_user"
echo "  Password: nuesa_password_123"
echo ""
echo "Next steps:"
echo "  1. Install Python dependencies: pip install -r requirements.txt"
echo "  2. Initialize database: python -c \"from database import init_db; init_db()\""
echo "  3. Run backend: python main.py"
echo ""
