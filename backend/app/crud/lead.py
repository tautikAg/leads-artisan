from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models.lead import Lead, LeadCreate, LeadUpdate
from app.db.database import get_database

class CRUDLead:
    """
    Simplified CRUD operations for Lead model using MongoDB
    """
    def __init__(self):
        self.db = get_database()
        self.collection = self.db.leads

    def _convert_id(self, lead_data: dict) -> dict:
        """Helper method to convert MongoDB _id to string id"""
        if lead_data and "_id" in lead_data:
            lead_data["id"] = str(lead_data.pop("_id"))
        return lead_data

    def get(self, lead_id: str) -> Optional[Lead]:
        """Get a single lead by ID"""
        try:
            lead_data = self.collection.find_one({"_id": ObjectId(lead_id)})
            if lead_data:
                return Lead(**self._convert_id(lead_data))
        except Exception as e:
            print(f"Error fetching lead: {e}")
        return None

    def get_by_email(self, email: str) -> Optional[Lead]:
        """Get a single lead by email"""
        lead_data = self.collection.find_one({"email": email})
        if lead_data:
            return Lead(**self._convert_id(lead_data))
        return None

    def get_multi(
        self,
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "created_at",
        sort_desc: bool = True,
        search: Optional[str] = None
    ) -> List[Lead]:
        """Get multiple leads with simple filtering"""
        #TODO: Test the search functionality
        # Basic search filter
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
        leads_data = self.collection.find(
            filter_query,
            skip=skip,
            limit=limit
        ).sort(sort_by, -1 if sort_desc else 1)

        return [Lead(**self._convert_id(lead)) for lead in leads_data]

    def create(self, obj_in: LeadCreate) -> Lead:
        """Create a new lead"""
        lead_dict = obj_in.dict()
        lead_dict["created_at"] = datetime.utcnow()
        lead_dict["updated_at"] = lead_dict["created_at"]
        
        # Simple insert
        result = self.collection.insert_one(lead_dict)
        lead_dict["id"] = str(result.inserted_id)
        
        return Lead(**lead_dict)

    def update(self, lead_id: str, obj_in: LeadUpdate) -> Optional[Lead]:
        """Update an existing lead"""
        update_data = {
            k: v for k, v in obj_in.dict(exclude_unset=True).items()
            if v is not None
        }
        update_data["updated_at"] = datetime.utcnow()

        # Simple update
        lead_data = self.collection.find_one_and_update(
            {"_id": ObjectId(lead_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if lead_data:
            return Lead(**self._convert_id(lead_data))
        return None

    def delete(self, lead_id: str) -> Optional[Lead]:
        """Delete a lead"""
        lead_data = self.collection.find_one_and_delete(
            {"_id": ObjectId(lead_id)}
        )
        if lead_data:
            return Lead(**self._convert_id(lead_data))
        return None

# Global instance
lead = CRUDLead() 