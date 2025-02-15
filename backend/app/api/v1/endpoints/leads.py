from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.crud.lead import lead
from app.models.lead import Lead, LeadCreate, LeadUpdate, LeadPaginatedResponse
import math

router = APIRouter()

@router.get("/", response_model=LeadPaginatedResponse)
async def get_leads(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    sort_by: str = Query("created_at", regex="^(name|email|company|created_at|last_contacted)$"),
    sort_desc: bool = Query(True),
    search: Optional[str] = Query(None, min_length=1)
) -> LeadPaginatedResponse:
    """
    Get all leads with pagination, sorting, and search capabilities
    """
    try:
        skip = (page - 1) * page_size
        
        # Get paginated results
        items = await lead.get_multi(
            skip=skip,
            limit=page_size,
            sort_by=sort_by,
            sort_desc=sort_desc,
            search=search
        )
        
        # Get total count for pagination
        total_count = await lead.get_count(search)
        total_pages = math.ceil(total_count / page_size)
        
        return LeadPaginatedResponse(
            items=items,
            total=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Lead)
async def create_lead(lead_in: LeadCreate) -> Lead:
    """Create a new lead"""
    try:
        db_lead = await lead.get_by_email(email=lead_in.email)
        if db_lead:
            raise HTTPException(
                status_code=400,
                detail="A lead with this email already exists."
            )
        return await lead.create(obj_in=lead_in)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
async def update_lead(lead_id: str, lead_in: LeadUpdate) -> Lead:
    """Update an existing lead"""
    try:
        updated_lead = await lead.update(lead_id=lead_id, obj_in=lead_in)
        if not updated_lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found"
            )
        return updated_lead
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{lead_id}", response_model=Lead)
async def delete_lead(lead_id: str) -> Lead:
    """Delete a lead"""
    try:
        deleted_lead = await lead.delete(lead_id=lead_id)
        if not deleted_lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found"
            )
        return deleted_lead
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 