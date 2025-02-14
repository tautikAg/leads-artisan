from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.crud.lead import lead
from app.models.lead import Lead, LeadCreate, LeadUpdate

router = APIRouter()

@router.get("/", response_model=List[Lead])
def get_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at", regex="^(name|email|company|created_at|last_contacted)$"),
    sort_desc: bool = Query(True),
    search: Optional[str] = Query(None, min_length=1)
) -> List[Lead]:
    """
    Get all leads with pagination, sorting, and search capabilities
    """
    return lead.get_multi(
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        sort_desc=sort_desc,
        search=search
    )

@router.post("/", response_model=Lead)
def create_lead(lead_in: LeadCreate) -> Lead:
    """Create a new lead"""
    db_lead = lead.get_by_email(email=lead_in.email)
    if db_lead:
        raise HTTPException(
            status_code=400,
            detail="A lead with this email already exists."
        )
    return lead.create(obj_in=lead_in)

@router.get("/{lead_id}", response_model=Lead)
def get_lead(lead_id: str) -> Lead:
    """Get a specific lead by ID"""
    db_lead = lead.get(lead_id=lead_id)
    if not db_lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )
    return db_lead

@router.put("/{lead_id}", response_model=Lead)
def update_lead(lead_id: str, lead_in: LeadUpdate) -> Lead:
    """Update an existing lead"""
    db_lead = lead.update(lead_id=lead_id, obj_in=lead_in)
    if not db_lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )
    return db_lead

@router.delete("/{lead_id}", response_model=Lead)
def delete_lead(lead_id: str) -> Lead:
    """Delete a lead"""
    db_lead = lead.delete(lead_id=lead_id)
    if not db_lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )
    return db_lead 