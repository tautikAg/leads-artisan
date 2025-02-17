from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from app.models.lead import Lead, LeadCreate, LeadUpdate, StageChange
from app.core.exceptions import LeadNotFoundException, DuplicateLeadException
from app.db.database import get_database
from app.core.logging import logger
from app.models.enums import Stage, EngagementStatus

class CRUDLead:
    """
    Async CRUD operations for Lead model using MongoDB
    Implements repository pattern for lead management
    """
    def __init__(self):
        self.collection_name = "leads"
        self.db = get_database()

    def get_collection(self) -> AsyncIOMotorCollection:
        return self.db[self.collection_name]

    async def get(self, id: str) -> Optional[Lead]:
        """Get a lead by ID"""
        try:
            collection = self.get_collection()
            lead_dict = await collection.find_one({"_id": ObjectId(id)})
            if not lead_dict:
                raise LeadNotFoundException(id)
            return Lead(**self._convert_id(lead_dict))
        except LeadNotFoundException:
            raise
        except Exception as e:
            logger.error(f"Error getting lead: {str(e)}")
            raise

    async def get_by_email(self, email: str) -> Optional[Lead]:
        """Get a single lead by email"""
        collection = self.get_collection()
        lead_dict = await collection.find_one({"email": email})
        if lead_dict:
            lead_dict["id"] = str(lead_dict.pop("_id"))
            return Lead(**lead_dict)
        return None

    async def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "created_at",
        sort_desc: bool = True,
        search: Optional[str] = None
    ) -> List[Lead]:
        """
        Get multiple leads with filtering, sorting and pagination
        """
        try:
            collection = self.get_collection()
            
            # Build query
            filter_query = {}
            if search:
                filter_query = {
                    "$or": [
                        {"name": {"$regex": search, "$options": "i"}},
                        {"email": {"$regex": search, "$options": "i"}},
                        {"company": {"$regex": search, "$options": "i"}}
                    ]
                }

            # Build sort query
            sort_direction = -1 if sort_desc else 1
            
            cursor = collection.find(filter_query)
            cursor = cursor.sort(sort_by, sort_direction)
            cursor = cursor.skip(skip).limit(limit)
            
            leads = []
            async for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                leads.append(Lead(**doc))
                
            return leads
            
        except Exception as e:
            logger.error(f"Error fetching leads: {str(e)}")
            raise

    def _generate_stage_history(self, current_stage: str, base_time: datetime = None) -> List[Dict[str, Any]]:
        """Generate stage history for a lead based on current stage"""
        history = []
        if not base_time:
            base_time = datetime.utcnow()

        stages = Stage.list()
        current_index = stages.index(current_stage)

        for i in range(current_index + 1):
            history.append({
                "from_stage": stages[i-1] if i > 0 else None,
                "to_stage": stages[i],
                "changed_at": (base_time - timedelta(days=current_index - i)).isoformat(),
            })

        return history

    async def create(self, lead_data: LeadCreate) -> Lead:
        """Create a new lead with proper stage history"""
        try:
            # Check for duplicate email
            existing = await self.get_by_email(lead_data.email)
            if existing:
                raise DuplicateLeadException(lead_data.email)

            collection = self.get_collection()
            
            # Prepare lead data
            lead_dict = lead_data.dict(exclude_none=True)
            lead_dict.update({
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "stage_history": self._generate_stage_history(lead_data.current_stage)
            })
            
            # Insert and return created lead
            result = await collection.insert_one(lead_dict)
            created_lead = await collection.find_one({"_id": result.inserted_id})
            created_lead["id"] = str(created_lead.pop("_id"))
            
            return Lead(**created_lead)
            
        except Exception as e:
            logger.error(f"Error creating lead: {str(e)}")
            raise

    async def update(self, id: str, update_data: Dict[str, Any]) -> Lead:
        """Update a lead with stage history management"""
        try:
            collection = self.get_collection()
            
            # Get current lead state
            current_lead = await self.get(id)
            if not current_lead:
                raise LeadNotFoundException(id)

            # Create a clean update dictionary
            update_dict = {}
            
            # Copy basic fields
            for key, value in update_data.items():
                if value is not None and key not in ['stage_history', 'current_stage', 'engaged']:
                    update_dict[key] = value

            # Handle stage transitions
            if "current_stage" in update_data:
                stage_history = self._handle_stage_transition(
                    current_lead,
                    update_data["current_stage"]
                )
                update_dict["stage_history"] = stage_history
                update_dict["current_stage"] = update_data["current_stage"]

            # Handle engagement status
            if "engaged" in update_data:
                update_dict["engaged"] = update_data["engaged"]
                update_dict["status"] = "Engaged" if update_data["engaged"] else "Not Engaged"

            # Update timestamps
            update_dict["updated_at"] = datetime.utcnow()
            
            # Perform update with the prepared dictionary
            result = await collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": update_dict},
                return_document=True
            )
            
            if result:
                return Lead(**self._convert_id(result))
            
            raise LeadNotFoundException(id)
            
        except Exception as e:
            logger.error(f"Error updating lead {id}: {str(e)}")
            raise

    def _handle_stage_transition(self, current_lead: Lead, new_stage: str) -> List[Dict]:
        stage_history = current_lead.stage_history or []
        
        if new_stage != current_lead.current_stage:
            stage_history.append({
                "from_stage": current_lead.current_stage,
                "to_stage": new_stage,
                "changed_at": datetime.utcnow().isoformat(),
            })
        
        return stage_history

    async def delete(self, lead_id: str) -> Optional[Lead]:
        """Delete a lead"""
        collection = self.get_collection()
        lead_data = await collection.find_one_and_delete(
            {"_id": ObjectId(lead_id)}
        )
        if lead_data:
            return Lead(**self._convert_id(lead_data))
        return None

    async def get_count(self, search: Optional[str] = None) -> int:
        """Get total count of leads, optionally filtered by search"""
        collection = self.get_collection()
        filter_query = {}
        if search:
            filter_query = {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}},
                    {"company": {"$regex": search, "$options": "i"}}
                ]
            }
        return await collection.count_documents(filter_query)

    def _convert_id(self, lead_data: dict) -> dict:
        """Helper method to convert MongoDB _id to string id"""
        if lead_data and "_id" in lead_data:
            lead_data["id"] = str(lead_data.pop("_id"))
        return lead_data

# Create a global instance
lead = CRUDLead() 