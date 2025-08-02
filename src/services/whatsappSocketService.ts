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
  private maxReconnectAttempts = 5;
  private baseUrl: string;
  private listeners: Map<string, Set<Function>> = new Map();

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

        this.socket = io(this.baseUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true,
        });

        this.socket.on('connect', () => {
          console.log('WhatsApp socket connected');
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WhatsApp socket disconnected:', reason);
          this.emit('disconnected', reason);
        });

        this.socket.on('connect_error', (error) => {
          console.error('WhatsApp socket connection error:', error);
          this.emit('error', error.message || 'Connection failed');
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.emit('reconnecting', this.reconnectAttempts);
            setTimeout(() => this.connect(), Math.pow(2, this.reconnectAttempts) * 1000);
          } else {
            reject(new Error('Max reconnection attempts reached'));
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

        logSecurityEvent('WhatsApp socket connection initiated', { baseUrl: this.baseUrl });
      } catch (error) {
        console.error('Failed to initialize WhatsApp socket:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
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