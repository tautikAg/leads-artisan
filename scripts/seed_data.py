from datetime import datetime, timedelta
from backend.app.models.lead import LeadCreate
from backend.app.crud.lead import lead

SAMPLE_LEADS = [
    {
        "name": "Emma Blake",
        "email": "emma.blake@flux.com",
        "company": "Flux Technologies Ltd.",
        "status": "Not Engaged",
        "engaged": False,
        "current_stage": "Initial Contact",
        "last_contacted": datetime.now()
    },
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

async def seed_data():
    """Seed the database with sample leads including stage information."""
    for lead_data in SAMPLE_LEADS:
        # Check if lead already exists
        existing_lead = await lead.get_by_email(email=lead_data["email"])
        if not existing_lead:
            # Create stage history for more realistic data
            current_stage = lead_data["current_stage"]
            stages = ["New Lead", "Initial Contact", "Meeting Scheduled", 
                     "Proposal Sent", "Negotiation", "Closed Won"]
            current_index = stages.index(current_stage)
            
            # Generate stage history up to current stage
            stage_history = []
            base_time = datetime.now() - timedelta(days=30)  # Start from 30 days ago
            
            for i in range(current_index + 1):
                stage_change = {
                    "from_stage": stages[i-1] if i > 0 else None,
                    "to_stage": stages[i],
                    "changed_at": base_time + timedelta(days=i*3),  # 3 days between stages
                    "notes": f"Moved to {stages[i]}"
                }
                stage_history.append(stage_change)
            
            # Add stage history to lead data
            lead_data["stage_history"] = stage_history
            lead_data["stage_updated_at"] = stage_history[-1]["changed_at"] if stage_history else datetime.now()
            
            # Create the lead
            lead_in = LeadCreate(**lead_data)
            await lead.create(lead_in)
    
    print(f"Successfully seeded {len(SAMPLE_LEADS)} leads")

async def main():
    """Main function to run the seeding process."""
    try:
        await seed_data()
    except Exception as e:
        print(f"Error seeding data: {e}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 