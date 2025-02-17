import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = str(Path(__file__).resolve().parent.parent)
sys.path.append(backend_dir)

from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models.lead import LeadCreate
from app.models.enums import Stage
from app.crud.lead import lead

class LeadSeeder:
    """
    Lead seeder class to handle the seeding of lead data
    """
    
    # Define stages in order of progression
    STAGES: List[str] = [
        Stage.NEW_LEAD.value,
        Stage.INITIAL_CONTACT.value,
        Stage.MEETING_SCHEDULED.value,
        Stage.PROPOSAL_SENT.value,
        Stage.NEGOTIATION.value,
        Stage.CLOSED_WON.value,
    ]

    # Sample lead data
    SAMPLE_LEADS: List[Dict[str, Any]] = [
        {
            "name": "Aria Frost",
            "email": "aria.frost@prism.com",
            "company": "Prism Tech Pvt. Ltd.",
            "status": "Not Engaged",
            "engaged": False,
            "current_stage": "New Lead",
            "last_contacted": datetime.now()
        },
        {
            "name": "Noah Chen",
            "email": "noah.chen@apex.com",
            "company": "Apex Technologies",
            "status": "Not Engaged",
            "engaged": False,
            "current_stage": "Meeting Scheduled",
            "last_contacted": datetime.now() - timedelta(days=5)
        },
        {
            "name": "Zara West",
            "email": "zara.west@cube.com",
            "company": "Cube",
            "status": "Not Engaged",
            "engaged": False,
            "current_stage": "Initial Contact",
            "last_contacted": datetime.now() - timedelta(days=5)
        },
        {
            "name": "Felix Gray",
            "email": "felix.gray@nova.com",
            "company": "Nova Corporation",
            "status": "Not Engaged",
            "engaged": False,
            "current_stage": "Proposal Sent",
            "last_contacted": datetime.now() - timedelta(days=7)
        },
        {
            "name": "Milo Park",
            "email": "milo.park@echo.com",
            "company": "Echo",
            "status": "Engaged",
            "engaged": True,
            "current_stage": "Negotiation",
            "last_contacted": datetime.now() - timedelta(days=7)
        },
        {
            "name": "Ruby Shaw",
            "email": "ruby.shaw@wave.com",
            "company": "Wave Technologies",
            "status": "Not Engaged",
            "engaged": False,
            "current_stage": "New Lead",
            "last_contacted": datetime.now() - timedelta(days=10)
        },
        {
            "name": "Leo Walsh",
            "email": "leo.walsh@peak.com",
            "company": "Peak Systems",
            "status": "Engaged",
            "engaged": True,
            "current_stage": "Closed Won",
            "last_contacted": datetime.now() - timedelta(days=10)
        },
        {
            "name": "Iris Cole",
            "email": "iris.cole@drift.com",
            "company": "Drift Analytics",
            "status": "Engaged",
            "engaged": True,
            "current_stage": "Proposal Sent",
            "last_contacted": datetime.now() - timedelta(days=10)
        },
        {
            "name": "Finn Hayes",
            "email": "finn.hayes@core.com",
            "company": "Core Innovations",
            "status": "Engaged",
            "engaged": True,
            "current_stage": "Meeting Scheduled",
            "last_contacted": datetime.now() - timedelta(days=10)
        }
    ]

    @classmethod
    def _generate_stage_history(cls, current_stage: str) -> List[Dict[str, Any]]:
        """
        Generate stage history for a lead up to their current stage
        """
        current_index = cls.STAGES.index(current_stage)
        stage_history = []
        base_time = None  # Don't set base time for historical stages

        # For stages before the current stage, set changed_at to None
        for i in range(current_index + 1):
            stage_change = {
                "from_stage": cls.STAGES[i-1] if i > 0 else None,
                "to_stage": cls.STAGES[i],
                "changed_at": datetime.now() if i == current_index else None,  # Only set time for current stage
                "notes": (
                    f"Current stage: {cls.STAGES[i]}" if i == current_index
                    else f"Previous stage: {cls.STAGES[i]}"
                )
            }
            stage_history.append(stage_change)

        return stage_history

    @classmethod
    async def _create_lead(cls, lead_data: Dict[str, Any]) -> None:
        """
        Create a single lead with stage history
        """
        try:
            # Check if lead already exists
            existing_lead = await lead.get_by_email(email=lead_data["email"])
            if existing_lead:
                print(f"Lead with email {lead_data['email']} already exists, skipping...")
                return

            # Generate stage history
            stage_history = cls._generate_stage_history(lead_data["current_stage"])
            
            # Add stage history and updated timestamp
            lead_data.update({
                "stage_history": stage_history,
                "stage_updated_at": next(
                    (change["changed_at"] for change in reversed(stage_history) if change["changed_at"]),
                    datetime.now()
                )
            })

            # Create the lead
            lead_in = LeadCreate(**lead_data)
            created_lead = await lead.create(lead_in)
            print(f"Created lead: {created_lead.name} ({created_lead.email})")

        except Exception as e:
            print(f"Error creating lead {lead_data.get('email')}: {str(e)}")
            raise

    @classmethod
    async def seed(cls) -> None:
        """
        Main seeding method
        """
        print("Starting lead seeding process...")
        start_time = datetime.now()

        try:
            for lead_data in cls.SAMPLE_LEADS:
                await cls._create_lead(lead_data)

            elapsed_time = datetime.now() - start_time
            print(f"\nSeeding completed successfully!")
            print(f"Created {len(cls.SAMPLE_LEADS)} leads")
            print(f"Time taken: {elapsed_time.total_seconds():.2f} seconds")

        except Exception as e:
            print(f"\nSeeding failed!")
            print(f"Error: {str(e)}")
            raise

async def main():
    """
    Main function to run the seeding process
    """
    try:
        await LeadSeeder.seed()
    except Exception as e:
        print(f"Fatal error during seeding: {str(e)}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 