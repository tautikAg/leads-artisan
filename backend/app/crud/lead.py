from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from app.models.lead import Lead, LeadCreate, LeadUpdate, LeadStage, StageChange
from app.core.exceptions import LeadNotFoundException, DuplicateLeadException
from app.db.database import get_database
from app.core.logging import logger
from app.core.websocket import ws_manager

class CRUDLead:
    """
    Async CRUD operations for Lead model using MongoDB
    Implements repository pattern for lead management
    """
    # Define stages in order of progression
    STAGES: List[LeadStage] = [
        "New Lead",
        "Initial Contact",
        "Meeting Scheduled",
        "Proposal Sent",
        "Negotiation",
        "Closed Won",
        "Closed Lost"
    ]

    def __init__(self):
        self.collection_name = "leads"
        self.db = get_database()

    def get_collection(self) -> AsyncIOMotorCollection:
        return self.db[self.collection_name]

    async def get(self, id: str) -> Optional[Lead]:
        collection = self.get_collection()
        lead_dict = await collection.find_one({"_id": ObjectId(id)})
        if lead_dict:
            lead_dict["id"] = str(lead_dict.pop("_id"))
            return Lead(**lead_dict)
        return None

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

    def _generate_stage_history(self, current_stage: LeadStage, base_time: datetime = None) -> List[Dict[str, Any]]:
        """
        Generate stage history up to the current stage
        If base_time is None, we'll mark intermediate stages with None timestamps
        """
        current_index = self.STAGES.index(current_stage)
        stage_history = []

        # Generate history for all stages up to current_stage
        for i in range(current_index + 1):
            stage_change = {
                "from_stage": self.STAGES[i-1] if i > 0 else None,
                "to_stage": self.STAGES[i],
                "changed_at": (base_time + timedelta(days=i*3)) if base_time else (
                    datetime.utcnow() if i == current_index else None  # Only set time for current stage
                ),
                "notes": (
                    f"Current stage: {self.STAGES[i]}" if i == current_index
                    else f"Previous stage: {self.STAGES[i]}"
                )
            }
            stage_history.append(stage_change)

        return stage_history

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
            
            # Create Lead model instance for proper attribute access
            lead_model = Lead(**created_lead)
            
            logger.info(f"Broadcasting lead creation: {lead_model.dict()}")
            await ws_manager.broadcast_update(
                "lead_created",
                {
                    "lead": lead_model.dict(),
                    "message": f"New lead created: {lead_model.name}"
                }
            )
            
            return lead_model
            
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

            # Handle stage transitions
            if "current_stage" in update_data:
                stage_history = self._handle_stage_transition(
                    current_lead,
                    update_data["current_stage"]
                )
                update_data["stage_history"] = stage_history

            # Update timestamps
            update_data["updated_at"] = datetime.utcnow()
            
            # Perform update
            result = await collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": update_data},
                return_document=True
            )
            
            if result:
                result["id"] = str(result.pop("_id"))
                updated_lead = Lead(**result)
                
                logger.info(f"Broadcasting lead update: {updated_lead.dict()}")
                await ws_manager.broadcast_update(
                    "lead_updated",
                    {
                        "lead": updated_lead.dict(),
                        "message": f"Lead updated: {updated_lead.name}"
                    }
                )
                return updated_lead
            
            raise LeadNotFoundException(id)
            
        except Exception as e:
            logger.error(f"Error updating lead {id}: {str(e)}")
            raise

    def _handle_stage_transition(
        self,
        current_lead: Lead,
        new_stage: LeadStage
    ) -> List[Dict[str, Any]]:
        """Handle stage transition logic and history updates"""
        curr_idx = self.STAGES.index(current_lead.current_stage)
        new_idx = self.STAGES.index(new_stage)
        
        # If same stage, don't modify history
        if curr_idx == new_idx:
            return current_lead.stage_history

        # When moving backwards, we need to preserve the original progression
        # up to the new stage, and add the backward transition
        if new_idx < curr_idx:
            # Find the last occurrence of the target stage in history
            target_stage_history = []
            found_target = False
            
            for stage in current_lead.stage_history:
                stage_idx = self.STAGES.index(stage["to_stage"])
                
                # Keep all stages up to where we first reached the target stage
                if stage_idx <= new_idx or not found_target:
                    target_stage_history.append(stage)
                    
                # Mark when we've found our target stage
                if stage["to_stage"] == new_stage:
                    found_target = True
            
            # Add the backward transition
            target_stage_history.append({
                "from_stage": current_lead.current_stage,
                "to_stage": new_stage,
                "changed_at": datetime.utcnow(),
                "notes": f"Updated from {current_lead.current_stage} to {new_stage}"
            })
            
            return target_stage_history

        # Moving forwards
        base_history = current_lead.stage_history.copy()
        
        # Add any missing intermediate stages
        if new_idx > curr_idx:
            for i in range(curr_idx + 1, new_idx):
                intermediate_stage = self.STAGES[i]
                base_history.append({
                    "from_stage": self.STAGES[i-1],
                    "to_stage": intermediate_stage,
                    "changed_at": datetime.utcnow(),
                    "notes": f"Intermediate stage between {current_lead.current_stage} and {new_stage}"
                })
            
            # Add the final transition
            base_history.append({
                "from_stage": current_lead.current_stage,
                "to_stage": new_stage,
                "changed_at": datetime.utcnow(),
                "notes": f"Updated from {current_lead.current_stage} to {new_stage}"
            })

        return base_history

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