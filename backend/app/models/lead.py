from datetime import datetime
from typing import Optional, List, Generic, TypeVar, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from enum import Enum

# Define possible stages as Literal type
LeadStage = Literal[
    "New Lead",
    "Initial Contact",
    "Meeting Scheduled",
    "Proposal Sent",
    "Negotiation",
    "Closed Won",
    "Closed Lost"
]

# Add SortField enum
class SortField(str, Enum):
    """Enum for lead sorting fields"""
    name = "name"
    company = "company"
    current_stage = "current_stage"
    last_contacted = "last_contacted"
    created_at = "created_at"

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
    current_stage: LeadStage = Field(
        default="New Lead",
        description="Current stage of the lead in the pipeline"
    )
    stage_updated_at: Optional[datetime] = Field(
        default=None,
        description="When the current stage was last updated"
    )
    stage_history: List[dict] = Field(
        default_factory=list,
        description="History of stage changes with timestamps"
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
    
    # Add computed property for stage progress
    @property
    def stage_progress(self) -> dict:
        stages = ["New Lead", "Initial Contact", "Meeting Scheduled", 
                 "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"]
        current_index = stages.index(self.current_stage)
        total_stages = len(stages) - 1  # Exclude Closed Lost from progress
        return {
            "current_stage": self.current_stage,
            "current_index": current_index,
            "total_stages": total_stages,
            "progress_percentage": (current_index / total_stages) * 100 if current_index < total_stages else 100
        }

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
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    current_stage: Optional[LeadStage] = None
    engaged: Optional[bool] = None
    last_contacted: Optional[datetime] = None
    status: Optional[str] = None

class StageChange(BaseModel):
    """
    Model for recording stage changes
    """
    from_stage: LeadStage
    to_stage: LeadStage
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None

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