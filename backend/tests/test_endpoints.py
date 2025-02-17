import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

@pytest.fixture
def client():
    return TestClient(app)

def test_create_lead(client, sample_lead_data):
    """Test lead creation endpoint"""
    # Ensure all required fields are present
    required_data = {
        "name": sample_lead_data["name"],
        "email": sample_lead_data["email"],
        "company": sample_lead_data["company"],
        "current_stage": sample_lead_data["current_stage"],
        "status": sample_lead_data["status"],
        "engaged": sample_lead_data["engaged"],
        "last_contacted": sample_lead_data["last_contacted"]
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/leads/",
        json=required_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == required_data["email"]

@pytest.mark.asyncio
async def test_get_leads(client, crud, sample_lead_create):
    """Test get leads endpoint"""
    # Create a test lead first
    await crud.create(sample_lead_create)
    
    response = client.get(f"{settings.API_V1_STR}/leads/")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0 