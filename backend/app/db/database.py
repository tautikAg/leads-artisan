from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from ..core.config import settings
from ..core.logging import logger

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

    def connect(self):
        """Create database connection."""
        try:
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000
            )
            self.db = self.client[settings.MONGODB_DATABASE]
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    def close(self):
        """Close database connection."""
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection")

# Create a global instance
db = Database()

def get_database() -> AsyncIOMotorDatabase:
    if db.db is None:
        db.connect()
    return db.db

def init_db():
    """Initialize database connection"""
    try:
        if db.db is None:
            db.connect()
        # Test the connection
        db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
