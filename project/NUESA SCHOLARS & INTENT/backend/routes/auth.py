"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models import User
from schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from security import hash_password, verify_password, create_access_token, create_refresh_token
from config import get_settings
import logging

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()

# Logger for auth events
logger = logging.getLogger("nuesa.auth")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        phone=user_data.phone
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return tokens."""
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        logger.warning("Login failed for unknown email: %s", credentials.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        logger.warning("Login failed for email (bad password): %s", credentials.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "is_admin": user.is_admin}
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    logger.info("Login successful for user id=%s email=%s", user.id, user.email)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    from security import verify_token
    
    try:
        payload = verify_token(refresh_token)
        user_id = payload["user_id"]
        
        # Verify user still exists
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "is_admin": user.is_admin}
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
