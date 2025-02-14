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
        "last_contacted": datetime.now()
    },
    {
        "name": "Aria Frost",
        "email": "aria.frost@prism.com",
        "company": "Prism Tech Pvt. Ltd.",
        "status": "Not Engaged",
        "engaged": False,
        "last_contacted": datetime.now()
    },
    {
        "name": "Noah Chen",
        "email": "noah.chen@apex.com",
        "company": "Apex Technologies",
        "status": "Not Engaged",
        "engaged": False,
        "last_contacted": datetime.now() - timedelta(days=5)
    },
    {
        "name": "Zara West",
        "email": "zara.west@cube.com",
        "company": "Cube",
        "status": "Not Engaged",
        "engaged": False,
        "last_contacted": datetime.now() - timedelta(days=5)
    },
    {
        "name": "Felix Gray",
        "email": "felix.gray@nova.com",
        "company": "Nova Corporation",
        "status": "Not Engaged",
        "engaged": False,
        "last_contacted": datetime.now() - timedelta(days=7)
    },
    {
        "name": "Milo Park",
        "email": "milo.park@echo.com",
        "company": "Echo",
        "status": "Engaged",
        "engaged": True,
        "last_contacted": datetime.now() - timedelta(days=7)
    },
    {
        "name": "Ruby Shaw",
        "email": "ruby.shaw@wave.com",
        "company": "Wave Technologies",
        "status": "Not Engaged",
        "engaged": False,
        "last_contacted": datetime.now() - timedelta(days=10)
    },
    {
        "name": "Leo Walsh",
        "email": "leo.walsh@peak.com",
        "company": "Peak Systems",
        "status": "Engaged",
        "engaged": True,
        "last_contacted": datetime.now() - timedelta(days=10)
    },
    {
        "name": "Iris Cole",
        "email": "iris.cole@drift.com",
        "company": "Drift Analytics",
        "status": "Engaged",
        "engaged": True,
        "last_contacted": datetime.now() - timedelta(days=10)
    },
    {
        "name": "Finn Hayes",
        "email": "finn.hayes@core.com",
        "company": "Core Innovations",
        "status": "Engaged",
        "engaged": True,
        "last_contacted": datetime.now() - timedelta(days=10)
    }
]

def seed_data():
    """Seed the database with sample data."""
    crud_lead = lead  # Get the CRUD instance
    
    for lead_data in SAMPLE_LEADS:
        # Check if lead already exists
        existing_lead = crud_lead.get_by_email(email=lead_data["email"])
        if not existing_lead:
            lead_in = LeadCreate(**lead_data)
            crud_lead.create(obj_in=lead_in)
    
    print(f"Successfully seeded {len(SAMPLE_LEADS)} leads")

def main():
    """Main function to run the seeding process."""
    try:
        seed_data()
    except Exception as e:
        print(f"Error seeding data: {e}")
        raise

if __name__ == "__main__":
    main() 