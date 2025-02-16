from fastapi import APIRouter
from app.api.v1.endpoints import leads, websocket

api_router = APIRouter()

# Include the leads router with prefix and tags
api_router.include_router(
    leads.router,
    prefix="/leads",
    tags=["leads"]
)

api_router.include_router(websocket.router, tags=["websocket"]) 