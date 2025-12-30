"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class OpportunityTypeEnum(str, Enum):
    """Types of opportunities."""
    SCHOLARSHIP = "scholarship"
    INTERNSHIP = "internship"
    GRANT = "grant"
    FELLOWSHIP = "fellowship"


class ApplicationStatusEnum(str, Enum):
    """Application statuses."""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


# ============== Auth Schemas ==============
class UserRegister(BaseModel):
    """User registration request."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=100)
    phone: Optional[str] = None

    @validator('password')
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """User response."""
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    bio: Optional[str]
    profile_picture_url: Optional[str]
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============== User Profile Schemas ==============
class UserProfileUpdate(BaseModel):
    """Update user profile."""
    gpa: Optional[float] = Field(None, ge=0, le=4.0)
    university: Optional[str]
    major: Optional[str]
    year_of_study: Optional[str]
    skills: Optional[List[str]]
    country: Optional[str]
    state: Optional[str]


class UserProfileResponse(BaseModel):
    """User profile response."""
    id: int
    gpa: Optional[float]
    university: Optional[str]
    major: Optional[str]
    year_of_study: Optional[str]
    skills: Optional[List[str]]
    country: Optional[str]
    state: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Opportunity Schemas ==============
class OpportunityCreate(BaseModel):
    """Create opportunity request."""
    title: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=20)
    opportunity_type: OpportunityTypeEnum
    organization: str
    amount: Optional[float] = None
    deadline: datetime
    eligibility_criteria: str
    requirements: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    application_url: Optional[str] = None


class OpportunityUpdate(BaseModel):
    """Update opportunity request."""
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    deadline: Optional[datetime] = None
    eligibility_criteria: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class OpportunityResponse(BaseModel):
    """Opportunity response."""
    id: int
    title: str
    description: str
    opportunity_type: OpportunityTypeEnum
    organization: str
    amount: Optional[float]
    deadline: datetime
    location: Optional[str]
    duration: Optional[str]
    is_featured: bool
    is_active: bool
    view_count: int
    application_count: int
    rating: float
    created_at: datetime

    class Config:
        from_attributes = True


class OpportunityDetailResponse(OpportunityResponse):
    """Detailed opportunity response."""
    eligibility_criteria: str
    requirements: Optional[str]
    organization_logo: Optional[str]
    application_url: Optional[str]


# ============== Application Schemas ==============
class ApplicationCreate(BaseModel):
    """Create application request."""
    opportunity_id: int
    response_data: Optional[dict] = None
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Update application request."""
    response_data: Optional[dict] = None
    cover_letter: Optional[str] = None
    status: Optional[ApplicationStatusEnum] = None


class ApplicationResponse(BaseModel):
    """Application response."""
    id: int
    user_id: int
    opportunity_id: int
    status: ApplicationStatusEnum
    submitted_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationDetailResponse(ApplicationResponse):
    """Detailed application response."""
    response_data: Optional[dict]
    cover_letter: Optional[str]
    resume_url: Optional[str]
    feedback: Optional[str]


# ============== Rating Schemas ==============
class RatingCreate(BaseModel):
    """Create rating request."""
    opportunity_id: int
    rating: float = Field(..., ge=1, le=5)
    review: Optional[str] = None


class RatingResponse(BaseModel):
    """Rating response."""
    id: int
    opportunity_id: int
    rating: float
    review: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Pagination Schemas ==============
class PaginationParams(BaseModel):
    """Pagination parameters."""
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class PaginatedResponse(BaseModel):
    """Paginated response."""
    total: int
    page: int
    page_size: int
    total_pages: int
    data: List[dict]


# ============== Search Schemas ==============
class OpportunitySearch(BaseModel):
    """Search opportunities request."""
    keyword: Optional[str] = None
    opportunity_type: Optional[OpportunityTypeEnum] = None
    organization: Optional[str] = None
    country: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


# ============== Notification Schemas ==============
class NotificationResponse(BaseModel):
    """Notification response."""
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    related_opportunity_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Sponsorship Schemas ==============
class SponsorshipResponse(BaseModel):
    """Sponsorship response."""
    id: int
    title: str
    organization: str
    description: str
    amount: Optional[float]
    duration: Optional[str]
    contact_email: Optional[str]
    website: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
