import { logSecurityEvent } from '@/utils/security';

export interface SendMessageRequest {
  to: string;
  message: string;
}

export interface SendMessageResponse {
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
}

class WhatsAppApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_WHATSAPP_API_BASE || 'https://baileys-whatsapp-bot-zip.onrender.com';
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      logSecurityEvent('WhatsApp message sent via API', { 
        to: request.to.substring(0, 7) + '...', // Log partial number for privacy
        status: result.status 
      });

      return result;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      
      logSecurityEvent('WhatsApp message send failed', { 
        to: request.to.substring(0, 7) + '...', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getConnectionStatus(): Promise<{ connected: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      
      if (!response.ok) {
        return { connected: false };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get WhatsApp connection status:', error);
      return { connected: false };
    }
  }
}

export const whatsappApiClient = new WhatsAppApiClient();