#here we will initialise the app, create the database connection and add the routes
from contextlib import asynccontextmanager
from app.db.database import db
from fastapi import FastAPI, WebSocket
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.websocket import ws_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for the FastAPI application.
    Runs database initialization when the app starts.
    """
    db.connect()
    yield



# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Update CORS middleware with WebSocket support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    db.close()

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except Exception:
        ws_manager.disconnect(websocket)

# Health check endpoint
@app.get("/health")
def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy"} 