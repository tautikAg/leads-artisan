from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """
    Application settings/configuration
    Loads values from environment variables or uses defaults
    """
    # API information
    PROJECT_NAME: str = "Leads API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    
    # MongoDB configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI")  # MongoDB connection string
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "leads_db")  # Database name

    model_config = {
        "case_sensitive": True,
        "env_file": ".env"
    }

# Create global settings instance
settings = Settings() 