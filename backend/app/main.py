#here we will initialise the app, create the database connection and add the routes
from contextlib import asynccontextmanager
from app.db.database import db
from fastapi import FastAPI
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.json import CustomJSONEncoder
from fastapi.encoders import jsonable_encoder

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for the FastAPI application.
    Runs database initialization when the app starts.
    """
    db.connect()
    yield
    db.close()



# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    json_encoder=CustomJSONEncoder
)

# Configure CORS middleware with WebSocket support
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



# Health check endpoint
@app.get("/health")
def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy"} 