# Leads Artisan Backend

A robust FastAPI-based backend service for managing sales leads with real-time updates and stage tracking.

## Features

### Core Functionality
- **Lead Management**: Complete CRUD operations for leads
- **Stage Tracking**: Automated tracking of lead progression through sales stages
- **Real-time Updates**: WebSocket integration for instant lead updates
- **Search & Filtering**: Advanced lead search with multiple criteria
- **Pagination**: Efficient handling of large datasets
- **Engagement Tracking**: Monitor lead engagement status

### Technical Features
- Async MongoDB integration with Motor
- Real-time WebSocket notifications
- Comprehensive error handling
- Type-safe data models with Pydantic
- Automated test suite with pytest
- Logging system for debugging and monitoring

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── api.py           # API router configuration
│   │       └── endpoints/
│   │           ├── leads.py     # Lead endpoints
│   │           └── websocket.py # WebSocket handlers
│   ├── core/
│   │   ├── config.py           # Application configuration
│   │   ├── exceptions.py       # Custom exceptions
│   │   ├── json.py            # JSON handlers
│   │   └── logging.py         # Logging configuration
│   ├── crud/
│   │   └── lead.py            # Lead CRUD operations
│   ├── db/
│   │   └── database.py        # Database connection management
│   ├── models/
│   │   ├── enums.py           # Enumerations (stages, status)
│   │   └── lead.py            # Lead Pydantic models
│   ├── websocket/
│   │   └── connection.py      # WebSocket connection manager
│   └── main.py                # Application entry point
├── tests/                     # Test suite
└── requirements.txt           # Dependencies
```

## Key Components

### Models
- **Lead**: Core data model with fields for tracking lead information
- **Stage**: Enumeration of sales pipeline stages
- **EngagementStatus**: Lead engagement tracking

### Database
- MongoDB integration using Motor for async operations
- Efficient indexing for email and search fields
- Automatic ID conversion between MongoDB and API

### API Endpoints
- `POST /api/v1/leads/`: Create new lead
- `GET /api/v1/leads/`: List leads with filtering
- `GET /api/v1/leads/{id}`: Get lead details
- `PUT /api/v1/leads/{id}`: Update lead
- `DELETE /api/v1/leads/{id}`: Delete lead
- `WS /api/v1/ws`: WebSocket for real-time updates

### CRUD Operations
The `CRUDLead` class implements:
- Create with duplicate email checking
- Read with optional filtering and pagination
- Update with stage transition tracking
- Delete with proper cleanup

## Testing

Comprehensive test suite covering:
- CRUD operations
- Stage transitions
- WebSocket functionality
- API endpoints
- Data validation
- Error handling

Run tests with:
```bash
pytest
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=leads_db
DEBUG=True
```

3. Run the application:
```bash
uvicorn app.main:app --reload
```

## Development Approach

### Repository Pattern
- Clear separation of database operations
- Consistent error handling
- Type-safe data models

### Async First
- Async/await throughout the codebase
- Non-blocking database operations
- WebSocket for real-time updates

### Error Handling
- Custom exceptions for business logic
- Proper error propagation
- Detailed error logging

### Testing Strategy
- Fixture-based test setup
- Isolated test database
- Comprehensive coverage

## API Documentation

Access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

```