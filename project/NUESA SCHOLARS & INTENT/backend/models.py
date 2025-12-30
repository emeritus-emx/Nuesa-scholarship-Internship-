"""Database models for NUESA platform."""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Table, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()


class OpportunityType(str, enum.Enum):
    """Types of opportunities."""
    SCHOLARSHIP = "scholarship"
    INTERNSHIP = "internship"
    GRANT = "grant"
    FELLOWSHIP = "fellowship"


class ApplicationStatus(str, enum.Enum):
    """Application statuses."""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class User(Base):
    """User model for authentication and profile."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("UserProfile", uselist=False, back_populates="user", cascade="all, delete-orphan")
    saved_opportunities = relationship(
        "Opportunity",
        secondary="saved_opportunities",
        back_populates="saved_by_users"
    )


class UserProfile(Base):
    """Extended user profile information."""
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    gpa = Column(Float, nullable=True)
    university = Column(String(255), nullable=True)
    major = Column(String(255), nullable=True)
    year_of_study = Column(String(50), nullable=True)
    skills = Column(Text, nullable=True)  # JSON string
    experience = Column(Text, nullable=True)  # JSON string
    country = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    preferences = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")


class Opportunity(Base):
    """Scholarship and internship opportunities."""
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text, nullable=False)
    opportunity_type = Column(Enum(OpportunityType), nullable=False, index=True)
    organization = Column(String(255), nullable=False)
    organization_logo = Column(String(500), nullable=True)
    amount = Column(Float, nullable=True)  # For scholarships/grants
    currency = Column(String(10), default="USD")
    deadline = Column(DateTime, nullable=False, index=True)
    eligibility_criteria = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    duration = Column(String(100), nullable=True)
    application_url = Column(String(500), nullable=True)
    is_featured = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True, index=True)
    view_count = Column(Integer, default=0)
    application_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")
    saved_by_users = relationship(
        "User",
        secondary="saved_opportunities",
        back_populates="saved_opportunities"
    )
    ratings = relationship("OpportunityRating", back_populates="opportunity", cascade="all, delete-orphan")


class Application(Base):
    """User applications for opportunities."""
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT, index=True)
    response_data = Column(Text, nullable=True)  # JSON string for custom questions
    resume_url = Column(String(500), nullable=True)
    cover_letter = Column(Text, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")


class OpportunityRating(Base):
    """Ratings for opportunities by users."""
    __tablename__ = "opportunity_ratings"

    id = Column(Integer, primary_key=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False)  # 1-5 scale
    review = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="ratings")


class SavedOpportunities(Base):
    """Association table for saved opportunities (many-to-many)."""
    __tablename__ = "saved_opportunities"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), primary_key=True)
    saved_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    """Notifications for users."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # new_opportunity, deadline_reminder, etc.
    is_read = Column(Boolean, default=False, index=True)
    related_opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)


class Sponsorship(Base):
    """Sponsorship opportunities offered by organizations."""
    __tablename__ = "sponsorships"

    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    organization = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=True)
    duration = Column(String(100), nullable=True)
    requirements = Column(Text, nullable=False)
    contact_email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
