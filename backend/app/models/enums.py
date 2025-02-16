from enum import Enum
from typing import List

class Stage(str, Enum):
    """
    Lead stage enum used across the application.
    Defines all possible stages in the sales pipeline.
    """
    NEW_LEAD = "New Lead"
    INITIAL_CONTACT = "Initial Contact"
    MEETING_SCHEDULED = "Meeting Scheduled"
    PROPOSAL_SENT = "Proposal Sent"
    NEGOTIATION = "Negotiation"
    CLOSED_WON = "Closed Won"

    @classmethod
    def list(cls) -> List[str]:
        """Returns list of stage values"""
        return [stage.value for stage in cls]

    @classmethod
    def calculate_progress(cls, current_stage: str) -> int:
        """Calculate progress percentage for a given stage"""
        stages = cls.list()
        current_index = stages.index(current_stage)
        total_stages = len(stages) - 1
        return round((current_index / total_stages) * 100)


class SortField(str, Enum):
    """Enum for lead sorting fields"""
    NAME = "name"
    COMPANY = "company"
    CURRENT_STAGE = "current_stage"
    LAST_CONTACTED = "last_contacted"
    CREATED_AT = "created_at"


class EngagementStatus(str, Enum):
    """Enum for lead engagement status"""
    ENGAGED = "Engaged"
    NOT_ENGAGED = "Not Engaged" 