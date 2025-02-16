import { useEffect, useCallback, useRef } from 'react';
import { showToast } from '../utils/toast';
import { WebSocketMessage } from '../types/websocket';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const isInitialConnection = useRef(true);
  
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return wsRef.current;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      reconnectAttempt.current = 0;
      
      if (isInitialConnection.current) {
        showToast.success('Connected to real-time updates');
        isInitialConnection.current = false;
      }
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('Parsed WebSocket message:', message);
        
        switch (message.type) {
          case 'lead_created':
            console.log('Lead created message received:', message.data);
            showToast.success(message.data.message);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            break;
            
          case 'lead_updated':
            console.log('Lead updated message received:', message.data);
            showToast.info(message.data.message);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            break;
            
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error, event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      wsRef.current = null;

      const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempt.current), 30000);
      reconnectAttempt.current++;
      console.log(`Attempting to reconnect in ${backoffTime}ms`);

      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          console.log('Attempting reconnection...');
          connect();
        }
      }, backoffTime);
    };

    return ws;
  }, [queryClient]);

  // Handle visibility change to reconnect when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wsRef.current) {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect]);

  useEffect(() => {
    try {
      connect();
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
} 