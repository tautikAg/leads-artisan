from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
from datetime import datetime
from app.core.logging import logger

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
    async def connect(self, websocket: WebSocket):
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            logger.info(f"New WebSocket connection. Total connections: {len(self.active_connections)}")
        except Exception as e:
            logger.error(f"Error accepting WebSocket connection: {str(e)}")
            raise
        
    def disconnect(self, websocket: WebSocket):
        try:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Remaining connections: {len(self.active_connections)}")
        except ValueError:
            pass
        
    async def broadcast_update(self, message_type: str, data: Dict[str, Any]):
        message = {
            "type": message_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Broadcasting message: {message}")
        logger.info(f"Active connections: {len(self.active_connections)}")
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
                logger.info("Message sent successfully to a connection")
            except WebSocketDisconnect:
                logger.warning("Connection disconnected during broadcast")
                disconnected.append(connection)
            except Exception as e:
                logger.error(f"Error broadcasting message: {str(e)}")
                disconnected.append(connection)
                
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

ws_manager = WebSocketManager() 