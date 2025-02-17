import pytest
from datetime import datetime, timedelta, UTC
from bson import ObjectId
from app.crud.lead import CRUDLead
from app.models.lead import LeadCreate, LeadUpdate
from app.core.exceptions import LeadNotFoundException, DuplicateLeadException
from app.models.enums import Stage

@pytest.mark.asyncio
class TestCRUDLead:
    """Test suite for CRUDLead operations"""

    @pytest.fixture(autouse=True)
    async def setup_test_db(self, test_db):
        """Clear database before each test"""
        # Clear before test
        await test_db.leads.delete_many({})
        yield
        # Clear after test
        await test_db.leads.delete_many({})

    @pytest.fixture
    def crud(self, test_db):
        """Create a test CRUD instance"""
        class TestCRUDLead(CRUDLead):
            def __init__(self, test_db):
                self.db = test_db
                self.collection_name = "leads"

            def get_collection(self):
                return self.db[self.collection_name]

        return TestCRUDLead(test_db)

    async def test_create_lead(self, crud, test_db, sample_lead_create):
        """Test lead creation with all its aspects"""
        # Test successful creation
        lead = await crud.create(sample_lead_create)
        
        assert lead.name == sample_lead_create.name
        assert lead.email == sample_lead_create.email
        assert lead.company == sample_lead_create.company
        assert lead.current_stage == Stage.NEW_LEAD.value
        assert lead.status == "Not Engaged"
        assert not lead.engaged
        
        # Verify stage history was created
        assert lead.stage_history
        assert len(lead.stage_history) == 1
        assert lead.stage_history[0]["to_stage"] == Stage.NEW_LEAD.value
        assert lead.stage_history[0]["from_stage"] is None
        
        # Test duplicate email
        with pytest.raises(DuplicateLeadException):
            await crud.create(sample_lead_create)

    async def test_get_lead(self, crud, test_db, sample_lead_create):
        """Test retrieving a single lead"""
        # Create test lead
        created = await crud.create(sample_lead_create)
        
        # Test successful retrieval
        lead = await crud.get(created.id)
        assert lead.id == created.id
        assert lead.email == created.email
        
        # Test non-existent lead
        non_existent_id = str(ObjectId())
        with pytest.raises(LeadNotFoundException):
            await crud.get(non_existent_id)

    async def test_get_by_email(self, crud, test_db, sample_lead_create):
        """Test retrieving a lead by email"""
        # Create test lead
        created = await crud.create(sample_lead_create)
        
        # Test successful retrieval
        lead = await crud.get_by_email(created.email)
        assert lead.id == created.id
        
        # Test non-existent email
        result = await crud.get_by_email("nonexistent@example.com")
        assert result is None

    async def test_get_multi(self, crud, test_db, sample_lead_create):
        """Test retrieving multiple leads with filtering and sorting"""
        # Create multiple test leads
        leads_data = [
            {**sample_lead_create.model_dump(), "email": f"test{i}@example.com",
             "name": f"Test {i}", "company": f"Company {i}"}
            for i in range(5)
        ]
        
        for lead_data in leads_data:
            await crud.create(LeadCreate(**lead_data))
        
        # Test pagination
        results = await crud.get_multi(skip=0, limit=2)
        assert len(results) == 2
        
        # Test sorting
        results = await crud.get_multi(sort_by="name", sort_desc=False)
        names = [lead.name for lead in results]
        assert names == sorted(names)
        
        # Test search
        results = await crud.get_multi(search="Test 1")
        assert len(results) == 1
        assert results[0].name == "Test 1"

    async def test_update_lead(self, crud, test_db, sample_lead_create):
        """Test updating a lead"""
        # Create test lead
        created = await crud.create(sample_lead_create)
        
        # Test basic update
        update_data = {
            "name": "Updated Name",
            "company": "Updated Company"
        }
        updated = await crud.update(created.id, update_data)
        assert updated.name == update_data["name"]
        assert updated.company == update_data["company"]
        
        # Test stage transition
        stage_update = {
            "current_stage": Stage.INITIAL_CONTACT.value
        }
        updated = await crud.update(created.id, stage_update)
        assert updated.current_stage == Stage.INITIAL_CONTACT.value
        assert len(updated.stage_history) == 2
        assert updated.stage_history[-1]["from_stage"] == Stage.NEW_LEAD.value
        assert updated.stage_history[-1]["to_stage"] == Stage.INITIAL_CONTACT.value
        
        # Test engagement status update
        engagement_update = {
            "engaged": True
        }
        updated = await crud.update(created.id, engagement_update)
        assert updated.engaged
        assert updated.status == "Engaged"
        
        # Test updating non-existent lead
        with pytest.raises(LeadNotFoundException):
            await crud.update(str(ObjectId()), update_data)

    async def test_delete_lead(self, crud, test_db, sample_lead_create):
        """Test lead deletion"""
        # Create test lead
        created = await crud.create(sample_lead_create)
        
        # Test successful deletion
        deleted = await crud.delete(created.id)
        assert deleted.id == created.id
        
        # Verify lead is deleted by expecting LeadNotFoundException
        with pytest.raises(LeadNotFoundException):
            await crud.get(created.id)
        
        # Test deleting non-existent lead
        result = await crud.delete(str(ObjectId()))
        assert result is None

    async def test_get_count(self, crud, test_db, sample_lead_create):
        """Test lead counting functionality"""
        # Create multiple test leads
        leads_data = [
            {**sample_lead_create.model_dump(), "email": f"test{i}@example.com",
             "name": f"Test {i}", "company": f"Company {i}"}
            for i in range(3)
        ]
        
        for lead_data in leads_data:
            await crud.create(LeadCreate(**lead_data))
        
        # Test total count
        total = await crud.get_count()
        assert total == 3
        
        # Test count with search
        count = await crud.get_count(search="Test 1")
        assert count == 1

    async def test_stage_history_generation(self, crud, test_db):
        """Test stage history generation logic"""
        base_time = datetime.utcnow()
        history = crud._generate_stage_history(Stage.MEETING_SCHEDULED.value, base_time)
        
        assert len(history) == 3  # NEW_LEAD -> INITIAL_CONTACT -> MEETING_SCHEDULED
        assert history[0]["from_stage"] is None
        assert history[0]["to_stage"] == Stage.NEW_LEAD.value
        assert history[-1]["to_stage"] == Stage.MEETING_SCHEDULED.value
        
        # Verify timestamps are properly spaced
        for i, entry in enumerate(history):
            entry_time = datetime.fromisoformat(entry["changed_at"].replace('Z', '+00:00'))
            expected_time = base_time - timedelta(days=len(history) - 1 - i)
            assert abs((entry_time - expected_time).total_seconds()) < 1

    async def test_stage_transition_handling(self, crud, test_db, sample_lead_create):
        """Test stage transition handling"""
        # Create initial lead
        lead = await crud.create(sample_lead_create)
        
        # Test stage transition
        new_stage = Stage.INITIAL_CONTACT.value
        history = crud._handle_stage_transition(lead, new_stage)
        
        assert len(history) == 2
        assert history[-1]["from_stage"] == Stage.NEW_LEAD.value
        assert history[-1]["to_stage"] == new_stage
        
        # Test no transition (same stage)
        lead.current_stage = new_stage  # Update lead's current stage
        lead.stage_history = history    # Update lead's history
        history = crud._handle_stage_transition(lead, new_stage)
        assert len(history) == 2  # No new entry added for same stage 