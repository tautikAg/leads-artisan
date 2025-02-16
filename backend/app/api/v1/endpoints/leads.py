from typing import Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.crud.lead import lead
from app.models.lead import (
    Lead, 
    LeadCreate, 
    LeadUpdate, 
    LeadPaginatedResponse,
    SortField
)
from app.core.exceptions import (
    LeadNotFoundException,
    DuplicateLeadException,
    InvalidStageTransitionException
)
from app.core.logging import logger
import math
from ....crud.lead import CRUDLead

router = APIRouter()
lead_crud = CRUDLead()

@router.get(
    "/",
    response_model=LeadPaginatedResponse,
    summary="Get all leads",
    description="Retrieve leads with pagination, sorting, and search capabilities"
)
async def get_leads(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: SortField = Query(SortField.created_at, description="Sort field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    search: Optional[str] = Query(None, min_length=1, description="Search term")
) -> LeadPaginatedResponse:
    """
    Get paginated leads with optional filtering and sorting
    """
    try:
        skip = (page - 1) * page_size
        
        items = await lead.get_multi(
            skip=skip,
            limit=page_size,
            sort_by=sort_by.value,
            sort_desc=sort_desc,
            search=search
        )
        
        total_count = await lead.get_count(search)
        total_pages = (total_count + page_size - 1) // page_size
        
        return LeadPaginatedResponse(
            items=items,
            total=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"Error fetching leads: {str(e)}")
        raise

@router.post(
    "/",
    response_model=Lead,
    status_code=status.HTTP_201_CREATED,
    summary="Create lead",
    description="Create a new lead with initial stage"
)
async def create_lead(lead_data: LeadCreate) -> Lead:
    """
    Create a new lead
    """
    try:
        return await lead.create(lead_data)
    except DuplicateLeadException:
        raise
    except Exception as e:
        logger.error(f"Error creating lead: {str(e)}")
        raise

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
async def update_lead(
    lead_id: str,
    lead_in: dict  # Change this to accept raw dict instead of LeadUpdate
) -> Any:
    """
    Update a lead.
    """
    try:
        # Print debug information
        print("Updating lead:", lead_id)
        print("Update data:", lead_in)
        
        # Update the lead
        updated_lead = await lead.update(id=lead_id, update_data=lead_in)
        
        if not updated_lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        return updated_lead
    except Exception as e:
        print("Error updating lead:", str(e))  # Debug print
        raise HTTPException(
            status_code=500,
            detail=f"Error updating lead: {str(e)}"
        )

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