from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.core.config import settings

_client: Optional[AsyncIOMotorClient] = None

def get_database():
    """
    Get database instance
    """
    global _client
    if not _client:
        _client = AsyncIOMotorClient(settings.MONGODB_URI)
    return _client[settings.MONGODB_DATABASE]

def close_database():
    """
    Close database connection
    """
    global _client
    if _client:
        _client.close()
        _client = None

def init_db():
    """
    Initialize database connection
    """
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        client.admin.command('ping')
        print("Successfully connected to the MongoDB database")
    except Exception as e:
        print(f"Error connecting to the MongoDB database: {e}")
        raise
