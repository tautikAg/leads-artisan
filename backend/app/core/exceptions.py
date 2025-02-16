from fastapi import HTTPException, status
from typing import Any, Dict, Optional

class BaseAPIException(HTTPException):
    """Base exception class for API errors"""
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class LeadNotFoundException(BaseAPIException):
    def __init__(self, lead_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found"
        )

class DuplicateLeadException(BaseAPIException):
    def __init__(self, email: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Lead with email {email} already exists"
        )

class InvalidStageTransitionException(BaseAPIException):
    def __init__(self, from_stage: str, to_stage: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stage transition from {from_stage} to {to_stage}"
        ) 