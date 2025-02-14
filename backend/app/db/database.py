from pymongo import MongoClient
from pymongo.server_api import ServerApi
from app.core.config import settings


def get_database():
    """
    Get the database connection
    """
    client = MongoClient(settings.MONGODB_URI, server_api=ServerApi("1"))
    return client[settings.MONGODB_DATABASE]


def init_db():
    """
    Initialize the database
    test the connection to the database
    Raise an exception if the connection fails
    """
    try:
        client = MongoClient(settings.MONGODB_URI, server_api=ServerApi("1"))
        client.admin.command('ping')
        print("Successfully connected to the MongoDB database")
    except Exception as e:
        print(f"Error connecting to the MongoDB database: {e}")
        raise e
