"""Configuration settings for the NUESA backend."""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from datetime import timedelta


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    API_TITLE: str = "NUESA Scholars & Intent API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Secured backend for NUESA scholarship and internship platform"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://yourdomain.com",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    
    # Database (PostgreSQL Server)
    # Format: postgresql://username:password@host:port/database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/nuesa_db"
    )
    
    # Email Configuration (optional)
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    
    # Google Gemini API (optional)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD_SECONDS: int = 60
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
