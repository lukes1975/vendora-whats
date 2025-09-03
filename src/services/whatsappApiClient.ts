// WhatsApp API Client Service
export interface ConnectionStatus {
  connected: boolean;
  qr?: string;
}

export interface TestConnectionResult {
  success: boolean;
  error?: string;
  latency?: number;
}

export interface QRCodeResponse {
  qr: string;
}

export class WhatsAppApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/whatsapp';
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get WhatsApp connection status:', error);
      return { connected: false };
    }
  }

  async testConnection(): Promise<TestConnectionResult> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        return { success: true, latency };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      console.error('Failed to test WhatsApp connection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed',
        latency 
      };
    }
  }

  async getQRCode(): Promise<QRCodeResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/qr`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get QR code:', error);
      return null;
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, message }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/disconnect`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to disconnect WhatsApp:', error);
      return false;
    }
  }
}

export const whatsappApiClient = new WhatsAppApiClient();