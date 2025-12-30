"""Applications routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Application, Opportunity, ApplicationStatus
from schemas import ApplicationCreate, ApplicationUpdate, ApplicationResponse, ApplicationDetailResponse
from security import get_current_user, require_admin
from typing import List

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_data: ApplicationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update a draft application."""
    user_id = int(current_user["user_id"])
    
    # Check if opportunity exists
    opportunity = db.query(Opportunity).filter(Opportunity.id == app_data.opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    # Check if application already exists
    existing_app = db.query(Application).filter(
        Application.user_id == user_id,
        Application.opportunity_id == app_data.opportunity_id
    ).first()
    
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this opportunity"
        )
    
    # Create new application
    new_app = Application(
        user_id=user_id,
        opportunity_id=app_data.opportunity_id,
        response_data=app_data.response_data,
        cover_letter=app_data.cover_letter,
        resume_url=app_data.resume_url
    )
    
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    return new_app


@router.get("", response_model=List[ApplicationResponse])
def list_user_applications(
    status_filter: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's applications."""
    user_id = int(current_user["user_id"])
    
    query = db.query(Application).filter(Application.user_id == user_id)
    
    if status_filter:
        query = query.filter(Application.status == status_filter)
    
    total = query.count()
    applications = query.order_by(Application.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return applications


@router.get("/{application_id}", response_model=ApplicationDetailResponse)
def get_application(
    application_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get application details."""
    user_id = int(current_user["user_id"])
    application = db.query(Application).filter(
        Application.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check authorization
    if application.user_id != user_id and not current_user.get("payload", {}).get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this application"
        )
    
    return application


@router.put("/{application_id}", response_model=ApplicationDetailResponse)
def update_application(
    application_id: int,
    app_data: ApplicationUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application."""
    user_id = int(current_user["user_id"])
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check authorization
    if application.user_id != user_id and not current_user.get("payload", {}).get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this application"
        )
    
    # Update fields
    for field, value in app_data.dict(exclude_unset=True).items():
        if field == "status" and value:
            # Only admins can change status
            if not current_user.get("payload", {}).get("is_admin"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admins can change application status"
                )
            setattr(application, field, value)
        elif field != "status":
            setattr(application, field, value)
    
    # If submitting, update submitted_at
    if app_data.status == ApplicationStatus.SUBMITTED:
        from datetime import datetime
        application.submitted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(application)
    return application


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete application (only draft applications)."""
    user_id = int(current_user["user_id"])
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check authorization
    if application.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this application"
        )
    
    # Only allow deleting draft applications
    if application.status != ApplicationStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete submitted applications"
        )
    
    db.delete(application)
    db.commit()
    
    return {"message": "Application deleted successfully"}


@router.post("/{application_id}/submit")
def submit_application(
    application_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a draft application."""
    user_id = int(current_user["user_id"])
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check authorization
    if application.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if application.status != ApplicationStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application is not in draft status"
        )
    
    from datetime import datetime
    application.status = ApplicationStatus.SUBMITTED
    application.submitted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(application)
    
    return {"message": "Application submitted successfully"}


@router.post("/{application_id}/withdraw")
def withdraw_application(
    application_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Withdraw a submitted application."""
    user_id = int(current_user["user_id"])
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check authorization
    if application.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if application.status not in [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot withdraw this application"
        )
    
    application.status = ApplicationStatus.WITHDRAWN
    db.commit()
    db.refresh(application)
    
    return {"message": "Application withdrawn successfully"}
