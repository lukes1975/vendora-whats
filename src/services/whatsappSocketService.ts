import { io, Socket } from 'socket.io-client';
import { safeLog, generateUUID } from '@/utils/security';

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WhatsAppConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  qrCode?: string;
  error?: string;
  lastConnected?: Date;
}

export interface WhatsAppSocketEvents {
  connect: () => void;
  connect_error: (error: any) => void;
  connected: () => void;
  disconnected: () => void;
  qr: (qrCode: string) => void;
  error: (error: string) => void;
  reconnecting: () => void;
  'msg-received': (message: Omit<WhatsAppMessage, 'id'>) => void;
}

class WhatsAppSocketService {
  private socket: Socket | null = null;
  private baseUrl: string;
  private apiKey: string | null;
  private listeners: Map<keyof WhatsAppSocketEvents, Set<(...args: any[]) => void>> = new Map();
  private correlationId: string;

  constructor() {
    // Normalize base URL (strip trailing slash)
    const rawBaseUrl = import.meta.env.VITE_WHATSAPP_API_BASE || 'https://baileys-whatsapp-bot-zip.onrender.com';
    this.baseUrl = rawBaseUrl.replace(/\/$/, '');
    this.apiKey = import.meta.env.VITE_WHATSAPP_API_KEY || null;
    this.correlationId = generateUUID();
  }

  async connect(): Promise<void> {
    // If already connected, resolve immediately (idempotent)
    if (this.socket?.connected) {
      safeLog('WhatsApp socket already connected', {}, this.correlationId);
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      try {
        safeLog('WhatsApp socket creating new instance', { 
          baseUrl: this.baseUrl,
          hasApiKey: !!this.apiKey 
        }, this.correlationId);

        const socketOptions: any = {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
        };

        // Add authentication if API key is available
        if (this.apiKey) {
          socketOptions.auth = { token: this.apiKey };
        }

        this.socket = io(this.baseUrl, socketOptions);

        // CRITICAL: Only resolve when socket actually connects
        this.socket.on('connect', () => {
          safeLog('WhatsApp socket connected - resolving promise', {}, this.correlationId);
          this.emit('connect');
          this.emit('connected');
          resolve(); // Only resolve here when socket is actually connected
        });

        this.socket.on('connect_error', (err) => {
          const errorMessage = err.message || 'Connection failed';
          safeLog('WhatsApp socket connection error', { error: errorMessage }, this.correlationId);
          this.emit('connect_error', err);
          this.emit('error', errorMessage);
          reject(err); // Reject immediately on connection error
        });

        this.socket.on('disconnect', (reason) => {
          safeLog('WhatsApp socket disconnected', { reason }, this.correlationId);
          this.emit('disconnected');
        });

        this.socket.on('reconnect_attempt', () => {
          safeLog('WhatsApp socket reconnect attempt', {}, this.correlationId);
          this.emit('reconnecting');
        });

        this.socket.on('reconnect_failed', () => {
          const error = 'Failed to reconnect after maximum attempts';
          safeLog('WhatsApp socket reconnect failed', { error }, this.correlationId);
          this.emit('error', error);
        });

        // WhatsApp-specific events
        this.socket.on('qr', (qrCode: string) => {
          safeLog('WhatsApp QR code received', {}, this.correlationId);
          this.emit('qr', qrCode);
        });

        this.socket.on('message', (message: Omit<WhatsAppMessage, 'id'>) => {
          safeLog('WhatsApp message received', { 
            from: message.from,
            type: message.type 
          }, this.correlationId);
          this.emit('msg-received', message);
        });

        // Safe timeout fallback - reject if no connection within 10 seconds
        setTimeout(() => {
          if (!this.socket?.connected) {
            const err = new Error('Socket connect timeout - failed to establish connection within 10 seconds');
            safeLog('WhatsApp socket connection timeout', { error: err.message }, this.correlationId);
            this.emit('connect_error', err);
            reject(err);
          }
        }, 10000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
        safeLog('WhatsApp socket connection setup failed', { error: errorMessage }, this.correlationId);
        reject(new Error(errorMessage));
      }
    });
  }

  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      const onConnect = () => {
        clearTimeout(timeout);
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
        resolve();
      };

      const onError = (error: Error) => {
        clearTimeout(timeout);
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
        reject(error);
      };

      this.socket?.on('connect', onConnect);
      this.socket?.on('connect_error', onError);
    });
  }

  disconnect(): void {
    if (this.socket) {
      safeLog('WhatsApp socket disconnecting', {}, this.correlationId);
      
      // Remove all listeners to prevent memory leaks
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      
      // Clear local listeners
      this.listeners.clear();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  refreshQR(): void {
    if (this.socket?.connected) {
      safeLog('WhatsApp QR refresh requested', {}, this.correlationId);
      this.socket.emit('refresh-qr');
    } else {
      safeLog('WhatsApp QR refresh failed - not connected', {}, this.correlationId);
    }
  }

  // Event management methods
  on<K extends keyof WhatsAppSocketEvents>(
    event: K,
    callback: WhatsAppSocketEvents[K]
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off<K extends keyof WhatsAppSocketEvents>(
    event: K,
    callback: WhatsAppSocketEvents[K]
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit<K extends keyof WhatsAppSocketEvents>(
    event: K,
    ...args: Parameters<WhatsAppSocketEvents[K]>
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          safeLog('WhatsApp socket event handler error', { 
            event,
            error: error instanceof Error ? error.message : 'Unknown error' 
          }, this.correlationId);
        }
      });
    }
  }
}

export const whatsappSocketService = new WhatsAppSocketService();