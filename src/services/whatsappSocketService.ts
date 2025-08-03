import { io, Socket } from 'socket.io-client';
import { logSecurityEvent } from '@/utils/security';

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
  qrCode: string | null;
  error: string | null;
  lastConnected: number | null;
}

export interface WhatsAppSocketEvents {
  qr: (qrCode: string) => void;
  connected: () => void;
  'msg-received': (data: { from: string; message: string; timestamp?: number }) => void;
  disconnected: (reason: string) => void;
  error: (error: string) => void;
  reconnecting: (attempt: number) => void;
}

class WhatsAppSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Reduced from 5 to fail faster
  private baseUrl: string;
  private listeners: Map<string, Set<Function>> = new Map();
  private connectionTimeout: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  constructor() {
    this.baseUrl = import.meta.env.VITE_WHATSAPP_API_BASE || 'https://baileys-whatsapp-bot-zip.onrender.com';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket?.connected) {
          resolve();
          return;
        }

        this.isManualDisconnect = false;
        
        // Clear any existing timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }

        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (this.socket && !this.socket.connected) {
            this.socket.disconnect();
            this.emit('error', 'Connection timeout - WhatsApp server may be unavailable');
            reject(new Error('Connection timeout'));
          }
        }, 15000); // 15 second timeout

        this.socket = io(this.baseUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true,
          autoConnect: true,
        });

        this.socket.on('connect', () => {
          console.log('WhatsApp socket connected to:', this.baseUrl);
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WhatsApp socket disconnected:', reason);
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          if (!this.isManualDisconnect) {
            this.emit('disconnected', reason);
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('WhatsApp socket connection error:', error);
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          const errorMsg = error?.message || 'Connection failed';
          this.emit('error', errorMsg);
          
          if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isManualDisconnect) {
            this.reconnectAttempts++;
            this.emit('reconnecting', this.reconnectAttempts);
            
            // Exponential backoff with jitter
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000, 10000);
            setTimeout(() => {
              if (!this.isManualDisconnect) {
                this.connect().catch(() => {
                  // Ignore errors in retry attempts
                });
              }
            }, delay);
          } else {
            reject(new Error(`Connection failed after ${this.maxReconnectAttempts} attempts: ${errorMsg}`));
          }
        });

        this.socket.on('qr', (qrCode: string) => {
          console.log('QR code received');
          this.emit('qr', qrCode);
        });

        this.socket.on('msg-received', (data: { from: string; message: string; timestamp?: number }) => {
          console.log('Message received:', data);
          this.emit('msg-received', data);
        });

        logSecurityEvent('WhatsApp socket connection initiated', { 
          baseUrl: this.baseUrl,
          attempt: this.reconnectAttempts + 1 
        });
        
      } catch (error) {
        console.error('Failed to initialize WhatsApp socket:', error);
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManualDisconnect = true;
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.reconnectAttempts = 0;
    this.listeners.clear();
  }

  on<K extends keyof WhatsAppSocketEvents>(event: K, callback: WhatsAppSocketEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off<K extends keyof WhatsAppSocketEvents>(event: K, callback: WhatsAppSocketEvents[K]): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit<K extends keyof WhatsAppSocketEvents>(event: K, ...args: Parameters<WhatsAppSocketEvents[K]>): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        (callback as any)(...args);
      } catch (error) {
        console.error(`Error in WhatsApp socket event handler for ${event}:`, error);
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  refreshQR(): void {
    if (this.socket?.connected) {
      this.socket.emit('refresh-qr');
    }
  }
}

export const whatsappSocketService = new WhatsAppSocketService();