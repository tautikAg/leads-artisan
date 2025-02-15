from datetime import datetime
from typing import Optional, List, Generic, TypeVar
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class LeadBase(BaseModel):
    """
    Base Lead model with common attributes
    Used as parent class for other Lead models
    """
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=100,
        description="Name of the lead"
    )
    email: EmailStr = Field(
        ..., 
        description="Email address of the lead"
    )
    company: str = Field(
        ..., 
        min_length=1, 
        max_length=100,
        description="Company name of the lead"
    )
    status: str = Field(
        default="Not Engaged", 
        max_length=50,
        description="Current status of the lead"
    )
    engaged: bool = Field(
        default=False,
        description="Whether the lead is currently engaged"
    )
    last_contacted: Optional[datetime] = None

class Lead(LeadBase):
    """
    Complete Lead model including database fields
    Used for responses and database operations
    """
    id: str = Field(description="MongoDB ObjectId as string")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LeadCreate(LeadBase):
    """
    Model for creating new leads
    Inherits all fields from LeadBase
    """
    pass

class LeadUpdate(BaseModel):
    """
    Model for updating existing leads
    All fields are optional
    """
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    company: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    engaged: Optional[bool] = None
    last_contacted: Optional[datetime] = None

# Add this new model for paginated response
T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response model
    """
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int

class LeadPaginatedResponse(PaginatedResponse[Lead]):
    """
    Paginated response specifically for leads
    """
    pass 