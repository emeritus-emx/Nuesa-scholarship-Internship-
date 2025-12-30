"""Database initialization and session management."""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from config import get_settings
from models import Base

settings = get_settings()

# Create database engine
# PostgreSQL connection with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=10,           # Number of connections to keep in pool
    max_overflow=20,        # Max overflow connections beyond pool_size
    pool_pre_ping=True,     # Verify connection before using (prevents stale connections)
    pool_recycle=3600       # Recycle connections every hour
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize the database by creating all tables."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    """Get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
