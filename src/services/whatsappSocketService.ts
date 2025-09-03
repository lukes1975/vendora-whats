import { io, Socket } from 'socket.io-client';

export interface WhatsAppSocketEvents {
  'connection-status': (data: { connected: boolean; qr?: string }) => void;
  'message-received': (data: { from: string; message: string }) => void;
  'qr-updated': (data: { qr: string }) => void;
}

export class WhatsAppSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io('/whatsapp', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('WhatsApp socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WhatsApp socket disconnected');
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WhatsApp socket connection error:', error);
      this.handleReconnect();
    });

    return this.socket;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect WhatsApp socket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const whatsappSocketService = new WhatsAppSocketService();