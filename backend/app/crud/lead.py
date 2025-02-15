from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from app.models.lead import Lead, LeadCreate, LeadUpdate, LeadStage, StageChange
from app.db.database import get_database

class CRUDLead:
    """
    Async CRUD operations for Lead model using MongoDB
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

    def get_collection(self) -> AsyncIOMotorCollection:
        db = get_database()
        return db[self.collection_name]

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
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "created_at",
        sort_desc: bool = True,
        search: Optional[str] = None
    ) -> List[Lead]:
        """Get multiple leads with sorting and filtering"""
        collection = self.get_collection()
        filter_query = {}
        
        # Add search filter if provided
        if search:
            filter_query = {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}},
                    {"company": {"$regex": search, "$options": "i"}}
                ]
            }

        # Handle special sort cases
        sort_field = {
            "name": "name",
            "company": "company",
            "current_stage": "current_stage",
            "last_contacted": "last_contacted",
            "created_at": "created_at"
        }.get(sort_by, "created_at")

        # Create cursor with sort
        cursor = collection.find(filter_query)
        cursor = cursor.sort(sort_field, -1 if sort_desc else 1)
        cursor = cursor.skip(skip).limit(limit)
        
        leads_data = await cursor.to_list(length=limit)
        return [Lead(**self._convert_id(lead)) for lead in leads_data]

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
        collection = self.get_collection()
        
        # Convert the model to dict
        lead_dict = lead_data.dict(exclude_none=True)
        
        # Generate stage history based on current_stage
        stage_history = self._generate_stage_history(lead_data.current_stage)
        
        # Update lead data with timestamps and stage history
        lead_dict.update({
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "stage_updated_at": stage_history[-1]["changed_at"] if stage_history else datetime.utcnow(),
            "stage_history": stage_history
        })
        
        # Insert into database
        result = await collection.insert_one(lead_dict)
        created_lead = await collection.find_one({"_id": result.inserted_id})
        created_lead["id"] = str(created_lead.pop("_id"))
        
        return Lead(**created_lead)

    async def update(self, id: str, update_data: Dict[str, Any]) -> Optional[Lead]:
        collection = self.get_collection()
        
        # Remove None values from update_data
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Add updated_at timestamp
        update_data["updated_at"] = datetime.utcnow()

        # Handle stage changes if current_stage is being updated
        if "current_stage" in update_data:
            current_lead = await self.get(id)
            if current_lead and current_lead.current_stage != update_data["current_stage"]:
                # Get current stage history
                stage_history = current_lead.stage_history
                curr_idx = self.STAGES.index(current_lead.current_stage)
                new_idx = self.STAGES.index(update_data["current_stage"])

                # If moving backwards
                if new_idx < curr_idx:
                    # Find the first occurrence of the target stage in history
                    target_stage_idx = None
                    for i, stage in enumerate(stage_history):
                        if stage["to_stage"] == update_data["current_stage"]:
                            target_stage_idx = i
                            break
                    
                    if target_stage_idx is not None:
                        # Keep only the history up to the target stage
                        stage_history = stage_history[:target_stage_idx + 1]
                    else:
                        # If target stage not found in history (shouldn't happen normally)
                        # Generate history up to the target stage
                        stage_history = self._generate_stage_history(update_data["current_stage"])
                else:
                    # Moving forward - add intermediate stages
                    for i in range(curr_idx + 1, new_idx):
                        intermediate_change = {
                            "from_stage": self.STAGES[i-1],
                            "to_stage": self.STAGES[i],
                            "changed_at": None,
                            "notes": f"Intermediate stage between {current_lead.current_stage} and {update_data['current_stage']}"
                        }
                        stage_history.append(intermediate_change)

                    # Add the new stage change
                    stage_change = {
                        "from_stage": current_lead.current_stage,
                        "to_stage": update_data["current_stage"],
                        "changed_at": datetime.utcnow(),
                        "notes": f"Updated from {current_lead.current_stage} to {update_data['current_stage']}"
                    }
                    stage_history.append(stage_change)
                
                update_data["stage_history"] = stage_history
                update_data["stage_updated_at"] = datetime.utcnow()

        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            result["id"] = str(result.pop("_id"))
            return Lead(**result)
        return None

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