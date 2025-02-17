import pytest
from app.models.lead import Lead, LeadCreate, LeadUpdate
from app.models.enums import Stage, EngagementStatus
from datetime import datetime, UTC
from pydantic import ValidationError

def test_lead_create_model(sample_lead_data):
    """Test LeadCreate model validation"""
    lead = LeadCreate(**sample_lead_data)
    assert lead.name == sample_lead_data["name"]
    assert lead.email == sample_lead_data["email"]
    
    # Test invalid email
    with pytest.raises(ValidationError):
        LeadCreate(**{**sample_lead_data, "email": "invalid-email"})
    
    # Test name length validation
    with pytest.raises(ValidationError):
        LeadCreate(**{**sample_lead_data, "name": "a" * 101})

def test_lead_stage_validation():
    """Test stage validation"""
    lead_data = {
        "name": "Test Lead",
        "email": "test@example.com",
        "company": "Test Co",
        "current_stage": "Invalid Stage",  # Invalid stage
        "status": "Not Engaged",
        "engaged": False,
        "last_contacted": datetime.now(UTC).isoformat()
    }
    
    # The stage should be one of the enum values
    valid_stages = [stage.value for stage in Stage]
    assert "Invalid Stage" not in valid_stages
    
    with pytest.raises(ValidationError) as exc_info:
        LeadCreate(**lead_data)
    assert "current_stage" in str(exc_info.value)  # Verify error is about stage 