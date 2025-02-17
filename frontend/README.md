# Leads Artisan Frontend

A modern React application for managing sales leads with real-time updates, built with TypeScript, Vite, and Tailwind CSS.

## Features

### Lead Management
- **Pipeline View**: Visual representation of lead stages
- **Stage Progression**: 
  - Drag-and-drop lead stage updates
  - Stage history timeline
  - Automated stage transition tracking
- **Lead Details**:
  - Comprehensive lead information
  - Contact details
  - Company information
  - Engagement status
  - Last contacted date

### Real-time Features
- **WebSocket Integration**:
  - Instant lead updates
  - Real-time stage changes
  - Live engagement status
  - Automatic reconnection
- **Collaborative Updates**:
  - Multi-user synchronization
  - Instant notification of changes
  - Conflict resolution

### Data Management
- **Advanced Filtering**:
  - Multi-criteria search
  - Stage-based filtering
  - Engagement status filtering
  - Date range filtering
- **Sorting Options**:
  - Sort by any field
  - Multiple sort directions
  - Persistent sort preferences
- **Export Capabilities**:
  - CSV export
  - Custom field selection
  - Filtered data export

### UI/UX Features
- **Responsive Design**:
  - Mobile-first approach
  - Adaptive layouts
  - Touch-friendly interactions
- **Interactive Components**:
  - Slide-out details panel
  - Modal dialogs
  - Toast notifications
  - Loading states
- **Form Handling**:
  - Real-time validation
  - Error messaging
  - Auto-save functionality
  - Field-level updates

## Technical Stack

### Core Technologies
- React 18
- TypeScript
- Vite
- Tailwind CSS

### State Management
- React Context
- Custom Hooks
- WebSocket State Sync

### API Integration
- Axios for HTTP requests
- WebSocket for real-time
- Error handling
- Request caching

## Project Structure

```
frontend/src/
├── api/                    # API integration layer
│   ├── axios.ts           # Axios instance & interceptors
│   └── leads.ts           # Lead-related API calls
│
├── assets/                 # Static assets
│   ├── icons/             # SVG icons
│   │   ├── downloadIcon.svg
│   │   └── ...
│   └── styles/            # Global styles
│       └── index.css
│
├── components/            # React components
│   ├── common/           # Shared/reusable components
│   │   ├── BaseModal.tsx        # Base modal component
│   │   ├── ConfirmDialog.tsx    # Confirmation dialogs
│   │   ├── FormInput.tsx        # Form input component
│   │   ├── Input.tsx            # Basic input component
│   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   ├── ModalFooter.tsx      # Modal footer actions
│   │   ├── SearchInput.tsx      # Search input with functionality
│   │   ├── Select.tsx           # Custom select component
│   │   └── Sheet.tsx            # Slide-out panel component
│   │
│   ├── form/             # Form-related components
│   │   ├── EngagementStatusButtons.tsx  # Engagement toggle
│   │   ├── LeadFormFields.tsx           # Lead form fields
│   │   └── StageSelector.tsx            # Stage selection
│   │
│   ├── list/             # List view components
│   │   ├── ExportMenu.tsx           # Export functionality
│   │   ├── FilterSortDropdown.tsx   # Filtering & sorting
│   │   ├── LeadDetailsSheet.tsx     # Lead details panel
│   │   ├── LeadItem.tsx             # Individual lead item
│   │   └── LeadTable.tsx            # Lead list table
│   │
│   ├── modals/           # Modal components
│   │   ├── AddLeadModal.tsx     # New lead creation
│   │   └── EditLeadModal.tsx    # Lead editing
│   │
│   ├── progress/         # Progress tracking components
│   │   ├── StageProgress.tsx       # Stage progress bar
│   │   ├── StageProgressBar.tsx    # Progress visualization
│   │   └── StageStep.tsx           # Individual stage step
│   │
│   └── timeline/         # Timeline components
│       └── StageHistoryTimeline.tsx # Stage history
│
├── constants/            # Application constants
│   ├── leads.ts         # Lead-related constants
│   └── stages.ts        # Stage definitions
│
├── hooks/               # Custom React hooks
│   ├── useEngagementStatus.ts    # Engagement state management
│   ├── useLeadForm.ts            # Lead form state
│   ├── useLeads.ts               # Lead data management
│   ├── useStageHistory.ts        # Stage history tracking
│   └── useWebSocket.ts           # WebSocket connection
│
├── pages/               # Page components
│   ├── Leads.tsx           # Main leads page
│   └── LeadsPage.tsx       # New leads page implementation
│
├── services/            # Business logic services
│   ├── leadService.ts       # Lead management service
│   ├── exportService.ts     # Data export service
│   └── websocketService.ts  # WebSocket service
│
├── types/               # TypeScript type definitions
│   ├── common.ts           # Shared types
│   ├── lead.ts            # Lead-related types
│   └── websocket.ts       # WebSocket types
│
├── utils/               # Utility functions
│   ├── date.ts            # Date formatting
│   ├── export.ts          # Export helpers
│   └── validation.ts      # Form validation
│
├── App.tsx             # Root component
└── main.tsx            # Application entry point
```

Key Features by Directory:

### Components
- **common/**: Reusable UI components
- **form/**: Form-specific components
- **list/**: List and table components
- **modals/**: Modal dialogs
- **progress/**: Progress tracking
- **timeline/**: Timeline visualization

### Hooks
- Lead management
- Form state
- WebSocket integration
- Stage tracking
- Engagement status

### Services
- API integration
- WebSocket management
- Data export
- Business logic

### Types
- Type definitions for:
  - Leads
  - Forms
  - API responses
  - WebSocket events

### Pages
- Main application pages
- Route components

### Utils
- Helper functions
- Date formatting
- Validation logic
- Export utilities

This structure follows:
1. Feature-based organization
2. Clear separation of concerns
3. Reusable component patterns
4. Scalable architecture


## Key Components

### Lead Management
- `LeadTable`: Main leads display
- `LeadDetailsSheet`: Detailed view
- `StageProgress`: Pipeline visualization
- `StageHistoryTimeline`: Stage tracking

### Form Components
- `LeadFormFields`: Lead data form
- `StageSelector`: Stage selection
- `EngagementStatusButtons`: Engagement toggle

### Common Components
- `BaseModal`: Modal dialog base
- `ConfirmDialog`: Confirmations
- `SearchInput`: Search functionality
- `Sheet`: Slide-out panel

## Setup & Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Running backend service

### Installation
```bash
# Install dependencies
npm install

# Configure environment
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/api/v1 

# Start development server
npm run dev
```

### Environment Configuration
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Integration with Backend

### API Endpoints
- `GET /api/v1/leads`: List leads
- `POST /api/v1/leads`: Create lead
- `PUT /api/v1/leads/{id}`: Update lead
- `DELETE /api/v1/leads/{id}`: Delete lead
- `WS /api/v1/ws`: WebSocket connection

### Data Models
```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  current_stage: LeadStage;
  status: string;
  engaged: boolean;
  last_contacted: string;
  stage_history: StageHistoryItem[];
}
```