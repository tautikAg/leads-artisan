import { Lead } from '../types/lead'

type NotificationType = 'create' | 'update' | 'delete'

interface WebSocketMessage {
  type: NotificationType
  lead: Lead
  userId: string
  isRemote: boolean
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private userId: string
  private messageHandlers: ((message: WebSocketMessage) => void)[] = []

  constructor() {
    this.userId = this.generateUserId()
    this.connect()
  }

  private generateUserId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private connect() {
    try {
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1'}/ws/${this.userId}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          // Only process messages from other users
          if (message.userId !== this.userId) {
            this.messageHandlers.forEach(handler => handler(message))
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket connection closed. Attempting to reconnect in 5 seconds...')
        // Increase reconnection delay to prevent rapid reconnection attempts
        setTimeout(() => this.connect(), 5000)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket connection error:', error)
      }

      this.ws.onopen = () => {
        console.log('WebSocket connection established')
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      // Attempt to reconnect after error
      setTimeout(() => this.connect(), 5000)
    }
  }

  public subscribe(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
    }
  }

  public getUserId(): string {
    return this.userId
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService() 