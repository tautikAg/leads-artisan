import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.models.lead import Lead, LeadCreate
from datetime import datetime, UTC
from app.core.logging import logger

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
async def test_db():
    """Create a test database connection"""
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        db = client[settings.TEST_MONGODB_DATABASE]
        
        # Clear database before each test
        await db.leads.delete_many({})
        
        # Test connection
        await client.admin.command('ping')
        logger.info("Connected to test database")
        
        yield db
        
        # Cleanup after test
        await db.leads.delete_many({})
        client.close()
        logger.info("Cleaned up test database")
        
    except Exception as e:
        logger.error(f"Test database setup failed: {e}")
        raise

@pytest.fixture
async def crud(test_db):
    """Create a CRUDLead instance with test database"""
    from app.crud.lead import CRUDLead
    
    class TestCRUDLead(CRUDLead):
        def __init__(self, test_db):
            self.db = test_db
            self.collection_name = "leads"

        def get_collection(self):
            return self.db[self.collection_name]

    return TestCRUDLead(test_db)

@pytest.fixture
def sample_lead_data():
    """Sample lead data for tests"""
    return {
        "name": "Test Lead",
        "email": "test@example.com",
        "company": "Test Company",
        "current_stage": "New Lead",
        "status": "Not Engaged",
        "engaged": False,
        "last_contacted": datetime.now(UTC).isoformat()
    }

@pytest.fixture
def sample_lead_create(sample_lead_data):
    """Sample LeadCreate model for tests"""
    return LeadCreate(**sample_lead_data) 