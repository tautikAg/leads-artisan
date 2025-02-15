from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from app.models.lead import Lead, LeadCreate, LeadUpdate, StageChange
from app.db.database import get_database

class CRUDLead:
    """
    Async CRUD operations for Lead model using MongoDB
    """
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
        """Get multiple leads with simple filtering"""
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

        # Simple find with sort and limit
        cursor = collection.find(filter_query)
        cursor = cursor.sort(sort_by, -1 if sort_desc else 1)
        cursor = cursor.skip(skip).limit(limit)
        
        leads_data = await cursor.to_list(length=limit)
        return [Lead(**self._convert_id(lead)) for lead in leads_data]

    async def create(self, lead_data: LeadCreate) -> Lead:
        """Create a new lead"""
        collection = self.get_collection()
        # Convert the model to dict and add timestamps
        lead_dict = lead_data.dict(exclude_none=True)
        lead_dict.update({
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "stage_updated_at": datetime.utcnow(),
            "stage_history": [{
                "from_stage": None,
                "to_stage": lead_data.current_stage,
                "changed_at": datetime.utcnow()
            }]
        })
        
        # Insert into database
        result = await collection.insert_one(lead_dict)
        
        # Fetch the created document
        created_lead = await collection.find_one({"_id": result.inserted_id})
        
        # Convert ObjectId to string for the id field
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
                stage_change = {
                    "from_stage": current_lead.current_stage,
                    "to_stage": update_data["current_stage"],
                    "changed_at": datetime.utcnow()
                }
                update_data["stage_updated_at"] = datetime.utcnow()
                update_data.setdefault("stage_history", []).append(stage_change)
        
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