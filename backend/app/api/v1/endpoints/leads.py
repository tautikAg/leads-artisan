from typing import Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, status, Response
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

router = APIRouter()

@router.get(
    "/",
    response_model=LeadPaginatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Get all leads",
    description="Retrieve leads with pagination, sorting, and search capabilities"
)
async def get_leads(
    response: Response,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: SortField = Query(SortField.created_at, description="Sort field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    search: Optional[str] = Query(None, min_length=1, description="Search term")
) -> LeadPaginatedResponse:
    """Get paginated leads with optional filtering and sorting"""
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
        
        if not items:
            response.status_code = status.HTTP_204_NO_CONTENT
            
        return LeadPaginatedResponse(
            items=items,
            total=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"Error fetching leads: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching leads"
        )

@router.post(
    "/",
    response_model=Lead,
    status_code=status.HTTP_201_CREATED,
    summary="Create lead",
    description="Create a new lead with initial stage"
)
async def create_lead(lead_data: LeadCreate) -> Lead:
    """Create a new lead"""
    try:
        created_lead = await lead.create(lead_data)
        return created_lead
        
    except DuplicateLeadException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating lead: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating lead"
        )

@router.get(
    "/{lead_id}",
    response_model=Lead,
    status_code=status.HTTP_200_OK,
    summary="Get lead",
    description="Get a specific lead by ID"
)
async def get_lead(lead_id: str, response: Response) -> Lead:
    """Get a specific lead by ID"""
    try:
        db_lead = await lead.get(lead_id)
        if not db_lead:
            raise LeadNotFoundException(lead_id)
        return db_lead
        
    except LeadNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error fetching lead {lead_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching lead {lead_id}"
        )

@router.put(
    "/{lead_id}",
    response_model=Lead,
    status_code=status.HTTP_200_OK,
    summary="Update lead",
    description="Update an existing lead"
)
async def update_lead(lead_id: str, lead_in: dict) -> Lead:
    """Update a lead"""
    try:
        updated_lead = await lead.update(id=lead_id, update_data=lead_in)
        if not updated_lead:
            raise LeadNotFoundException(lead_id)
        return updated_lead
        
    except LeadNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except InvalidStageTransitionException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating lead {lead_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating lead {lead_id}"
        )

@router.delete(
    "/{lead_id}",
    response_model=Lead,
    status_code=status.HTTP_200_OK,
    summary="Delete lead",
    description="Delete a lead by ID"
)
async def delete_lead(lead_id: str) -> Lead:
    """Delete a lead"""
    try:
        deleted_lead = await lead.delete(lead_id=lead_id)
        if not deleted_lead:
            raise LeadNotFoundException(lead_id)
        return deleted_lead
        
    except LeadNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error deleting lead {lead_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting lead {lead_id}"
        ) 