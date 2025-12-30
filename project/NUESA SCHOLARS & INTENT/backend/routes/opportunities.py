"""Opportunities routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from database import get_db
from models import Opportunity, Application, SavedOpportunities
from schemas import (
    OpportunityCreate, OpportunityUpdate, OpportunityResponse, 
    OpportunityDetailResponse, OpportunitySearch
)
from security import get_current_user, get_optional_user, require_admin
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


@router.get("", response_model=List[OpportunityResponse])
def list_opportunities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    opportunity_type: Optional[str] = None,
    organization: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """List all opportunities with pagination and filters."""
    query = db.query(Opportunity).filter(Opportunity.is_active == True)
    
    # Apply filters
    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type == opportunity_type)
    if organization:
        query = query.filter(Opportunity.organization.ilike(f"%{organization}%"))
    
    # Apply pagination
    total = query.count()
    opportunities = query.order_by(Opportunity.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return opportunities


@router.get("/featured", response_model=List[OpportunityResponse])
def get_featured_opportunities(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get featured opportunities."""
    opportunities = db.query(Opportunity).filter(
        and_(Opportunity.is_featured == True, Opportunity.is_active == True)
    ).order_by(Opportunity.created_at.desc()).limit(limit).all()
    
    return opportunities


@router.get("/search", response_model=List[OpportunityResponse])
def search_opportunities(
    keyword: Optional[str] = None,
    opportunity_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Search opportunities by keyword and type."""
    query = db.query(Opportunity).filter(Opportunity.is_active == True)
    
    if keyword:
        query = query.filter(
            or_(
                Opportunity.title.ilike(f"%{keyword}%"),
                Opportunity.description.ilike(f"%{keyword}%"),
                Opportunity.organization.ilike(f"%{keyword}%")
            )
        )
    
    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type == opportunity_type)
    
    return query.order_by(Opportunity.created_at.desc()).all()


@router.get("/{opportunity_id}", response_model=OpportunityDetailResponse)
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get opportunity details."""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    # Increment view count
    opportunity.view_count += 1
    db.commit()
    
    return opportunity


@router.post("", response_model=OpportunityDetailResponse, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    opportunity_data: OpportunityCreate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new opportunity (admin only)."""
    new_opportunity = Opportunity(**opportunity_data.dict())
    db.add(new_opportunity)
    db.commit()
    db.refresh(new_opportunity)
    return new_opportunity


@router.put("/{opportunity_id}", response_model=OpportunityDetailResponse)
def update_opportunity(
    opportunity_id: int,
    opportunity_data: OpportunityUpdate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update opportunity (admin only)."""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    # Update fields
    for field, value in opportunity_data.dict(exclude_unset=True).items():
        setattr(opportunity, field, value)
    
    db.commit()
    db.refresh(opportunity)
    return opportunity


@router.delete("/{opportunity_id}")
def delete_opportunity(
    opportunity_id: int,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete opportunity (admin only)."""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    db.delete(opportunity)
    db.commit()
    return {"message": "Opportunity deleted successfully"}


@router.post("/{opportunity_id}/save")
def save_opportunity(
    opportunity_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save an opportunity."""
    user_id = int(current_user["user_id"])
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    # Check if already saved
    existing = db.query(SavedOpportunities).filter(
        and_(
            SavedOpportunities.user_id == user_id,
            SavedOpportunities.opportunity_id == opportunity_id
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Opportunity already saved"
        )
    
    saved = SavedOpportunities(user_id=user_id, opportunity_id=opportunity_id)
    db.add(saved)
    db.commit()
    
    return {"message": "Opportunity saved successfully"}


@router.delete("/{opportunity_id}/save")
def unsave_opportunity(
    opportunity_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unsave an opportunity."""
    user_id = int(current_user["user_id"])
    
    saved = db.query(SavedOpportunities).filter(
        and_(
            SavedOpportunities.user_id == user_id,
            SavedOpportunities.opportunity_id == opportunity_id
        )
    ).first()
    
    if not saved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved opportunity not found"
        )
    
    db.delete(saved)
    db.commit()
    
    return {"message": "Opportunity removed from saved"}


@router.get("/user/saved", response_model=List[OpportunityResponse])
def get_saved_opportunities(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's saved opportunities."""
    user_id = int(current_user["user_id"])
    
    opportunities = db.query(Opportunity).join(
        SavedOpportunities,
        Opportunity.id == SavedOpportunities.opportunity_id
    ).filter(SavedOpportunities.user_id == user_id).all()
    
    return opportunities
