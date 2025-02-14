from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv


#load the environment variables
load_dotenv()

class Settings(BaseSettings):
    MONGODB_URI: str = os.getenv("MONGODB_URI") #mongodb connection string
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE","leads_db") #database name
    DEBUG: bool = False


    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()