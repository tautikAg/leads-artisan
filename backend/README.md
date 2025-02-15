# Leads API

A FastAPI-based REST API for managing leads with PostgreSQL database integration.

## Features

- CRUD operations for leads management
- Async database operations with SQLModel
- Pagination, sorting, and search capabilities
- Input validation using Pydantic
- OpenAPI documentation
- Health check endpoint
- CORS middleware support

## Tech Stack

- FastAPI: Modern web framework for building APIs
- SQLModel: SQL database interaction with type annotations
- PostgreSQL: Database backend
- Pydantic: Data validation using Python type annotations
- Uvicorn: ASGI server implementation

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── leads.py      # API endpoints
│   ├── core/
│   │   └── config.py            # Configuration settings
│   ├── crud/
│   │   └── lead.py             # Database operations
│   ├── db/
│   │   └── database.py         # Database connection
│   ├── models/
│   │   └── lead.py            # SQLModel models
│   └── main.py                # Application entry point
└── requirements.txt           # Project dependencies
```

## Prerequisites

- Python 3.12+
- Virtual environment (recommended)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv env
# On Windows:
env\Scripts\activate
# On Unix/MacOS:
source env/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
MONGODB_DATABASE=leads_db
DEBUG=True
```

## Running the Application

1. Start the server:
```bash
uvicorn app.main:app --reload
```

2. Access the API:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing the API

### Using Swagger UI

1. Open http://localhost:8000/docs in your browser
2. Interactive documentation where you can:
   - See all available endpoints
   - Try out requests directly from the browser
   - View request/response schemas
   - Authorize requests (when auth is implemented)

### Using cURL

1. Create a lead:
```bash
curl -X POST http://localhost:8000/api/v1/leads/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Example Corp",
    "status": "Not Engaged",
    "engaged": false
  }'
```

2. Get all leads:
```bash
# Basic fetch
curl http://localhost:8000/api/v1/leads/

# With pagination and sorting
curl "http://localhost:8000/api/v1/leads/?skip=0&limit=10&sort_by=name&sort_desc=false"

# With search
curl "http://localhost:8000/api/v1/leads/?search=john"
```

3. Get a specific lead:
```bash
curl http://localhost:8000/api/v1/leads/1
```

4. Update a lead:
```bash
curl -X PUT http://localhost:8000/api/v1/leads/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "status": "Engaged",
    "engaged": true
  }'
```

5. Delete a lead:
```bash
curl -X DELETE http://localhost:8000/api/v1/leads/1
```

6. Health check:
```bash
curl http://localhost:8000/health
```

### Using Python requests

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Create a lead
response = requests.post(
    f"{BASE_URL}/leads/",
    json={
        "name": "Jane Doe",
        "email": "jane@example.com",
        "company": "Tech Corp"
    }
)
print(response.json())

# Get leads with search
response = requests.get(
    f"{BASE_URL}/leads/",
    params={
        "search": "jane",
        "sort_by": "created_at",
        "sort_desc": "true"
    }
)
print(response.json())
```

### Using HTTPie (Alternative to cURL)

```bash
# Install HTTPie
brew install httpie

# Create a lead
http POST :8000/api/v1/leads/ \
  name="Alice Smith" \
  email=alice@example.com \
  company="Dev Corp"

# Get leads with filters
http :8000/api/v1/leads/ \
  skip==0 \
  limit==10 \
  sort_by==name \
  search=="alice"
```

### Response Examples

1. Successful lead creation:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Corp",
  "status": "Not Engaged",
  "engaged": false,
  "last_contacted": null,
  "created_at": "2024-02-14T10:30:00Z",
  "updated_at": "2024-02-14T10:30:00Z"
}
```

2. Error response (duplicate email):
```json
{
  "detail": "A lead with this email already exists."
}
```

### API Documentation

1. **Swagger UI** (http://localhost:8000/docs):
   - Interactive API documentation
   - Try out requests directly in the browser
   - View request/response schemas
   - Download OpenAPI specification

2. **ReDoc** (http://localhost:8000/redoc):
   - Alternative documentation UI
   - Better for reading and understanding the API
   - Cleaner interface for sharing with others

3. **OpenAPI JSON** (http://localhost:8000/api/v1/openapi.json):
   - Raw OpenAPI specification
   - Use for generating client code
   - Import into API tools like Postman

## API Endpoints

### Leads

- `GET /api/v1/leads`
  - Get leads with pagination and filters
  - Query Parameters:
    - `skip`: Number of records to skip (default: 0)
    - `limit`: Maximum records to return (default: 10)
    - `sort_by`: Field to sort by (name, email, company, created_at, last_contacted)
    - `sort_desc`: Sort in descending order (default: true)
    - `search`: Search term for filtering

- `POST /api/v1/leads`
  - Create a new lead
  - Required fields: name, email, company
  - Optional fields: status, engaged, last_contacted

- `GET /api/v1/leads/{id}`
  - Get a specific lead by ID

- `PUT /api/v1/leads/{id}`
  - Update an existing lead
  - All fields are optional

- `DELETE /api/v1/leads/{id}`
  - Delete a lead

### Health Check

- `GET /health`
  - Check API health status

## Data Models

### Lead

```python
{
    "name": str,          # Required, 1-100 chars
    "email": str,         # Required, unique, valid email
    "company": str,       # Required, 1-100 chars
    "status": str,        # Optional, default: "Not Engaged"
    "engaged": bool,      # Optional, default: false
    "last_contacted": datetime,  # Optional
    "created_at": datetime,      # Auto-generated
    "updated_at": datetime       # Auto-updated
}
```

## Error Handling

The API returns standard HTTP status codes:

- 200: Success
- 400: Bad Request (e.g., validation error)
- 404: Not Found
- 422: Unprocessable Entity (invalid input)
- 500: Internal Server Error

## Development

### Code Style

- Type hints are used throughout the codebase
- Documentation strings for all public functions and classes
- Async/await for database operations
- Pydantic models for request/response validation

### Testing

Run tests using pytest:
```bash
pytest
```

### Database Migrations

The database schema is automatically created on startup through SQLModel.

## Security Considerations

1. In production:
   - Replace `allow_origins=["*"]` with specific origins
   - Use strong passwords
   - Enable SSL/TLS
   - Implement authentication
   - Set appropriate rate limits

2. Environment variables:
   - Never commit `.env` file
   - Use secrets management in production

## Troubleshooting

1. Port Already in Use:
```bash
# Use different port
uvicorn app.main:app --port 8001 --reload
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license information here]
```

This README includes:
1. Complete setup instructions
2. Project structure explanation
3. API endpoint documentation
4. Data models
5. Development guidelines
6. Security considerations
7. Troubleshooting guide
8. Contributing guidelines

Would you like me to expand on any section?
