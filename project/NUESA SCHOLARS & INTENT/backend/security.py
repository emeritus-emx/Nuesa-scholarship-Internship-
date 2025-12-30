"""Security utilities for authentication and authorization."""
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
import bcrypt
from functools import wraps
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from config import get_settings

settings = get_settings()
security = HTTPBearer()


class HTTPAuthCredentials(BaseModel):
    """HTTP Authentication Credentials."""
    scheme: str
    credentials: str


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return {"user_id": user_id, "payload": payload}
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> dict:
    """Get the current authenticated user from JWT token."""
    token = credentials.credentials
    return verify_token(token)


async def get_optional_user(credentials: Optional[HTTPAuthCredentials] = Depends(security)) -> Optional[dict]:
    """Optionally get the current user if token is provided."""
    if credentials is None:
        return None
    token = credentials.credentials
    try:
        return verify_token(token)
    except HTTPException:
        return None


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency to require admin role."""
    if not current_user.get("payload", {}).get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
