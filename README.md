# Leads Artisan

A modern, full-stack sales lead management platform featuring real-time updates, stage tracking, and comprehensive lead management capabilities. Built with React, TypeScript, and FastAPI.

## Live Deployments

- **Frontend**: [https://leads-artisan.vercel.app/](https://leads-artisan.vercel.app/)
- **Backend Health Check**: [https://leads-artisan-backend.fly.dev/health](https://leads-artisan-backend.fly.dev/health)

## Core Features

### Lead Management
- Complete CRUD operations for leads
- Visual pipeline view with drag-and-drop stage updates
- Comprehensive lead information tracking
- Stage history timeline
- Engagement status monitoring

### Real-time Capabilities
- WebSocket integration for instant updates
- Multi-user synchronization
- Automatic reconnection handling
- Live engagement status updates

### Advanced Data Management
- Multi-criteria search and filtering
- Stage-based and engagement status filtering
- Date range filtering
- Custom field export to CSV
- Efficient pagination

### Modern UI/UX
- Responsive, mobile-first design
- Interactive components (slide-out panels, modals)
- Real-time form validation
- Toast notifications
- Loading states

## Technical Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- WebSocket for real-time updates

### Backend
- FastAPI
- MongoDB with Motor
- WebSocket integration
- Pydantic for data validation
- pytest for testing

## Project Structure

The project follows a modern, scalable architecture with clear separation of concerns:

### Frontend Directory Structure
```
frontend/src/
├── api/                # API integration
├── components/         # React components
├── hooks/             # Custom React hooks
├── services/          # Business logic
├── types/             # TypeScript definitions
└── utils/             # Helper functions
```

### Backend Directory Structure
```
backend/
├── app/
│   ├── api/           # API endpoints
│   ├── core/          # Core configuration
│   ├── crud/          # Database operations
│   ├── models/        # Data models
│   └── websocket/     # WebSocket handling
└── tests/             # Test suite
```

## Setup & Development

### Frontend Setup
```bash
# Install dependencies
npm install

# Configure environment
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/api/v1 

# Start development server
npm run dev
```

### Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create .env file with:
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=leads_db
DEBUG=True

# Run the application
uvicorn app.main:app --reload
```

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints
- `GET /api/v1/leads`: List leads
- `POST /api/v1/leads`: Create lead
- `PUT /api/v1/leads/{id}`: Update lead
- `DELETE /api/v1/leads/{id}`: Delete lead
- `WS /api/v1/ws`: WebSocket connection

## Testing

### Backend Testing
```bash
pytest
```

