"""User profile routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserProfile
from schemas import UserProfileUpdate, UserProfileResponse, UserResponse
from security import get_current_user
import json

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user information."""
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user profile."""
    user_id = int(current_user["user_id"])
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        # Create default profile
        profile = UserProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile."""
    user_id = int(current_user["user_id"])
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
    
    # Update fields
    for field, value in profile_data.dict(exclude_unset=True).items():
        if field == "skills" and value:
            setattr(profile, field, json.dumps(value))
        else:
            setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/me", response_model=UserResponse)
def update_user(
    user_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user information."""
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update allowed fields
    allowed_fields = ["full_name", "phone", "bio", "profile_picture_url"]
    for field in allowed_fields:
        if field in user_data:
            setattr(user, field, user_data[field])
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/account")
def delete_account(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete user account."""
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "Account deleted successfully"}
