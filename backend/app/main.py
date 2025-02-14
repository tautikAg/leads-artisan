#here we will initialise the app, create the database connection and add the routes
from contextlib import asynccontextmanager
from app.db.database import init_db
from fastapi import FastAPI
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for the FastAPI application.
    Runs database initialization when the app starts.
    """
    init_db()  # Initialize MongoDB connection
    yield



# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)



# Health check endpoint
@app.get("/health")
def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy"} 