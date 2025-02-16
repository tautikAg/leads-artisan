from fastapi import WebSocket
from typing import Dict, Set
import json
from app.models.lead import Lead
from app.core.json import json_dumps

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def broadcast_lead_change(self, lead: Lead, change_type: str, user_id: str):
        message = {
            "type": change_type,
            "lead": lead.dict(),
            "userId": user_id,
            "isRemote": True
        }
        
        # Use custom JSON encoder for datetime objects
        json_message = json_dumps(message)
        
        # Broadcast to all connected clients
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_text(json_message)
            except Exception as e:
                print(f"Error sending to client {client_id}: {str(e)}")
                # Remove failed connection
                self.disconnect(client_id)

# Create a singleton instance
manager = ConnectionManager() 