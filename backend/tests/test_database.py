import pytest
from motor.motor_asyncio import AsyncIOMotorDatabase

@pytest.mark.asyncio
async def test_database_connection(test_db):
    """Test database connection is established"""
    assert isinstance(test_db, AsyncIOMotorDatabase)
    result = await test_db.command('ping')
    assert result['ok'] == 1

@pytest.mark.asyncio
async def test_get_database():
    """Test get_database function returns database instance"""
    from app.db.database import get_database
    db = get_database()
    assert isinstance(db, AsyncIOMotorDatabase) 