from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from ..core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

    def connect(self):
        """Create database connection."""
        self.client = AsyncIOMotorClient(settings.MONGODB_URI)
        self.db = self.client[settings.MONGODB_DATABASE]
        print("Connected to MongoDB")

    def close(self):
        """Close database connection."""
        if self.client:
            self.client.close()
            print("Closed MongoDB connection")

# Create a global instance
db = Database()
db.connect()

def get_database() -> AsyncIOMotorDatabase:
    return db.db

def init_db():
    """
    Initialize database connection
    """
    try:
        db.client.admin.command('ping')
        print("Successfully connected to the MongoDB database")
    except Exception as e:
        print(f"Error connecting to the MongoDB database: {e}")
        raise
