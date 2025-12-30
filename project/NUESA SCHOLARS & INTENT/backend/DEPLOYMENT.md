# NUESA Backend Deployment Guide

Complete guide for deploying your NUESA backend to production environments.

## Quick Deployment Summary

| Platform | Time | Cost | Difficulty |
|----------|------|------|-----------|
| Heroku | 5 min | Free-$7/month | ⭐ Easy |
| Railway | 10 min | $5/month | ⭐ Easy |
| PythonAnywhere | 10 min | Free-$5/month | ⭐ Easy |
| AWS | 15 min | $5-20/month | ⭐⭐ Medium |
| DigitalOcean | 10 min | $5-12/month | ⭐⭐ Medium |
| Render | 5 min | Free-$7/month | ⭐ Easy |

## Option 1: Render (Recommended - Easiest)

### Step 1: Prepare Your Repository

```bash
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port 8000" > Procfile

# Create runtime.txt (optional)
echo "python-3.11.0" > runtime.txt

# Push to GitHub
git add Procfile runtime.txt
git commit -m "Add deployment files"
git push origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +"
4. Select "Web Service"
5. Connect your GitHub repository
6. Configure:
   - **Name**: nuesa-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`
7. Add environment variables:
   - `SECRET_KEY`: Your secure key
   - `DATABASE_URL`: PostgreSQL connection
   - `CORS_ORIGINS`: Your domain
8. Click "Deploy"

**Your backend is now live!**

## Option 2: Railway

### Step 1: Install Railway CLI

```bash
# macOS
brew install railway

# Windows
choco install railway

# Or use npm
npm i -g @railway/cli
```

### Step 2: Deploy

```bash
cd backend
railway init
railway up
```

### Step 3: Configure Environment Variables

```bash
railway variables set SECRET_KEY=your-secret-key
railway variables set DATABASE_URL=postgresql://...
railway variables set CORS_ORIGINS=https://yourdomain.com
```

## Option 3: Heroku

### Prerequisites
- Heroku CLI installed
- Heroku account

### Step 1: Create Procfile

```bash
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile
```

### Step 2: Initialize Heroku App

```bash
heroku login
heroku create your-app-name-backend
```

### Step 3: Set Environment Variables

```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DATABASE_URL=postgresql://...
heroku config:set CORS_ORIGINS=https://yourdomain.com
```

### Step 4: Deploy

```bash
git push heroku main
```

### Step 5: View Logs

```bash
heroku logs --tail
```

## Option 4: AWS EC2

### Prerequisites
- AWS account
- EC2 instance (t2.micro free tier eligible)

### Step 1: Launch EC2 Instance

1. Go to AWS Console
2. Launch new t2.micro instance
3. Use Ubuntu 22.04 LTS AMI
4. Create security group allowing ports 22, 80, 443, 8000
5. Download key pair (.pem file)

### Step 2: Connect and Setup

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update
sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv postgresql postgresql-contrib -y

# Clone your repository
git clone your-repo-url nuesa-backend
cd nuesa-backend/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
nano .env
# Add your configuration

# Test run
uvicorn main:app --reload
```

### Step 3: Setup Production Server (Gunicorn + Nginx)

```bash
# Install gunicorn
pip install gunicorn

# Create systemd service
sudo nano /etc/systemd/system/nuesa-backend.service
```

Add:
```ini
[Unit]
Description=NUESA Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/nuesa-backend/backend
ExecStart=/home/ubuntu/nuesa-backend/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
# Start service
sudo systemctl start nuesa-backend
sudo systemctl enable nuesa-backend

# Check status
sudo systemctl status nuesa-backend
```

### Step 4: Setup Nginx

```bash
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/nuesa-backend
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nuesa-backend /etc/nginx/sites-enabled/

# Test Nginx
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 5: Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Option 5: DigitalOcean

### Step 1: Create App

1. Go to DigitalOcean
2. Click "Apps" → "Create App"
3. Connect GitHub repository
4. Select `backend` directory as root

### Step 2: Configure App

In the app specification:
```yaml
services:
- name: api
  github:
    repo: your-username/your-repo
    branch: main
  build_command: pip install -r requirements.txt
  run_command: uvicorn main:app --host 0.0.0.0 --port 8080
  envs:
  - key: SECRET_KEY
    value: your-secret-key
  - key: DATABASE_URL
    value: postgresql://...
  - key: CORS_ORIGINS
    value: https://yourdomain.com
```

### Step 3: Deploy

Click "Deploy" and wait for completion.

## Post-Deployment Checklist

### Security
- [ ] Update SECRET_KEY to production value
- [ ] Enable HTTPS/SSL
- [ ] Set strong database password
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable logging and monitoring
- [ ] Regular security updates

### Performance
- [ ] Set up database backups
- [ ] Configure CDN for static files
- [ ] Enable caching headers
- [ ] Monitor response times
- [ ] Set up alerts for errors
- [ ] Load testing

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Enable access logs
- [ ] Monitor database performance
- [ ] Set up uptime monitoring
- [ ] Create alerts for issues

### Database
- [ ] Backup strategy set up
- [ ] Connection pooling configured
- [ ] Indexes optimized
- [ ] Regular maintenance scheduled

## Environment-Specific Variables

### Development
```
DEBUG=true
ENVIRONMENT=development
DATABASE_URL=sqlite:///./nuesa.db
RATE_LIMIT_ENABLED=false
```

### Staging
```
DEBUG=false
ENVIRONMENT=staging
DATABASE_URL=postgresql://...
RATE_LIMIT_ENABLED=true
```

### Production
```
DEBUG=false
ENVIRONMENT=production
DATABASE_URL=postgresql://...
RATE_LIMIT_ENABLED=true
CORS_ORIGINS=https://yourdomain.com
```

## Database Setup

### PostgreSQL on Render/Railway

Both platforms provide PostgreSQL automatically. Your `DATABASE_URL` will be provided in the dashboard.

### Self-Hosted PostgreSQL

```bash
# Create database
createdb nuesa_db

# Create user
createuser -P nuesa_user
# Enter password when prompted

# Connect and setup
psql -U nuesa_user -d nuesa_db -c "ALTER ROLE nuesa_user WITH SUPERUSER;"

# Get connection string
DATABASE_URL=postgresql://nuesa_user:password@localhost:5432/nuesa_db
```

## Migration & Backup Strategy

### Initial Migration
```bash
# Run migrations (Alembic - optional)
alembic upgrade head

# Or with SQLAlchemy
python -c "from database import init_db; init_db()"
```

### Regular Backups
```bash
# PostgreSQL backup
pg_dump -U nuesa_user -d nuesa_db > backup.sql

# Restore from backup
psql -U nuesa_user -d nuesa_db < backup.sql
```

## Troubleshooting Deployment

### 500 Errors
1. Check server logs: `heroku logs --tail` or platform-specific logs
2. Verify environment variables are set
3. Check database connection
4. Verify SECRET_KEY is set

### Database Connection Issues
```bash
# Test connection
python -c "from database import engine; engine.connect()"

# Check DATABASE_URL format
echo $DATABASE_URL
```

### CORS Errors
1. Verify CORS_ORIGINS includes your frontend domain
2. Remove trailing slashes: `https://yourdomain.com` not `https://yourdomain.com/`
3. Include protocol: `https://` or `http://`

### Performance Issues
1. Enable database connection pooling
2. Increase worker count
3. Add caching
4. Optimize database queries

## Scaling

### Horizontal Scaling
- Add more servers/dynos behind load balancer
- Use managed database (PostgreSQL)
- Consider CDN for static files

### Vertical Scaling
- Increase instance size
- Upgrade database tier
- Add more memory/CPU

## Cost Optimization

1. **Free tier during development**
   - Render: Free tier available
   - Railway: $5/month minimum
   - Heroku: Paid only ($7/month+)

2. **Budget tier for production**
   - Render: $7/month
   - Railway: $10-15/month
   - AWS: $5-15/month
   - DigitalOcean: $5-12/month

3. **Money-saving tips**
   - Use free database tier during development
   - Combine database and app on same provider
   - Use auto-scaling during peak hours
   - Monitor resource usage

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}?key=${{ secrets.RENDER_API_KEY }}
```

## Support & Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Heroku Docs](https://devcenter.heroku.com/)
- [AWS EC2 Docs](https://docs.aws.amazon.com/ec2/)

---

**Recommended for Production**: Render or Railway (easiest, most reliable)
**Recommended for Learning**: PythonAnywhere or Heroku
**Recommended for Scale**: AWS or DigitalOcean

---

**Last Updated**: December 2025
