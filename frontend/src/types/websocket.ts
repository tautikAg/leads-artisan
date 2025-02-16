import { Lead } from './lead';

export interface WebSocketMessage<T = Lead> {
  type: WebSocketMessageType;
  data: {
    lead: T;
    message: string;
    timestamp: string;
  };
}

export type WebSocketMessageType = 'lead_created' | 'lead_updated'; 