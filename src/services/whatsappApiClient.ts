import { safeLog, validatePhoneNumber, generateUUID } from '@/utils/security';

export interface SendMessageRequest {
  to: string;
  message: string;
  idempotencyKey?: string;
}

export interface SendMessageResponse {
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
  correlationId?: string;
}

export interface ConnectionStatus {
  status: 'unknown' | 'connecting' | 'connected' | 'reconnecting' | 'logged_out';
  isConnected?: boolean;
  isConnecting?: boolean;
  lastConnected?: string;
  qrCode?: string;
  error?: string;
}

export interface QRCodeResponse {
  qr: string;
}

class WhatsAppApiClient {
  private baseUrl: string;
  private apiKey: string | null;
  private sessionId: string;
  private readonly timeout = 15000; // 15 seconds

  constructor() {
    // Normalize base URL (strip trailing slash)
    const rawBaseUrl = import.meta.env.VITE_WHATSAPP_API_BASE || 'https://baileys-whatsapp-bot-zip.onrender.com';
    this.baseUrl = rawBaseUrl.replace(/\/$/, '');
    
    this.apiKey = import.meta.env.VITE_WHATSAPP_API_KEY || null;
    this.sessionId = import.meta.env.VITE_WHATSAPP_SESSION_ID || 'dev_tenant';
    
    // Debug logging for environment variables
    console.log('🔧 WhatsApp API Client Config:', {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      sessionId: this.sessionId,
      apiKeyPreview: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'NOT_SET'
    });
    
    // In development, warn about missing API key but don't fail
    if (!this.apiKey) {
      console.error('❌ VITE_WHATSAPP_API_KEY is not set in environment variables');
      console.log('💡 To fix this issue:');
      console.log('1. Create a .env.local file in your project root');
      console.log('2. Add: VITE_WHATSAPP_API_KEY=your_baileys_backend_api_key');
      console.log('3. Make sure it matches the key in your Baileys backend .env file');
    }
  }

  /**
   * Health check to test backend connectivity
   */
  async testConnection(): Promise<{ success: boolean; error?: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await fetch(`${this.normalizeUrl('/health')}`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        return { 
          success: false, 
          error: `Backend responded with ${response.status}: ${response.statusText}`,
          latency 
        };
      }

      return { success: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          return { success: false, error: 'Backend connection timeout (5s)', latency };
        }
        return { success: false, error: error.message, latency };
      }
      
      return { success: false, error: 'Unknown connection error', latency };
    }
  }

  private normalizeUrl(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  private sanitizeErrorMessage(error: string): string {
    // Remove potentially sensitive information from error messages
    return error
      .replace(/api[_-]?key/gi, '[REDACTED]')
      .replace(/token/gi, '[REDACTED]')
      .replace(/\+\d{8,15}/g, '[PHONE_REDACTED]')
      .substring(0, 200); // Limit error message length
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const correlationId = generateUUID();
    
    // Check if API key is available
    if (!this.apiKey) {
      safeLog('WhatsApp message send failed - no API key configured', { 
        to: request.to 
      }, correlationId);
      
      return {
        status: 'failed',
        error: 'WhatsApp API key not configured',
        correlationId,
      };
    }
    
    // Validate phone number format before making network call
    if (!validatePhoneNumber(request.to)) {
      safeLog('WhatsApp message send failed - invalid phone format', { 
        to: request.to,
        error: 'Invalid recipient format' 
      }, correlationId);
      
      return {
        status: 'failed',
        error: 'Invalid recipient format',
        correlationId,
      };
    }

    // Generate idempotency key if not provided
    const idempotencyKey = request.idempotencyKey || generateUUID();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      };

      // Add API key header (x-api-key instead of Authorization)
      headers['x-api-key'] = this.apiKey;

      safeLog('WhatsApp message send attempt', {
        to: request.to,
        hasApiKey: !!this.apiKey,
        idempotencyKey 
      }, correlationId);

      const response = await fetch(this.normalizeUrl('/send'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: request.to,
          message: request.message,
        }),
        signal: controller.signal,
        mode: 'cors',
        keepalive: true,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const sanitizedError = this.sanitizeErrorMessage(errorText);
        throw new Error(`HTTP ${response.status}: ${sanitizedError}`);
      }

      const result = await response.json();
      
      safeLog('WhatsApp message sent successfully', { 
        to: request.to,
        status: result.status,
        messageId: result.messageId 
      }, correlationId);

      return {
        ...result,
        correlationId,
      };

    } catch (error) {
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const errorMessage = isAbortError 
        ? 'Request timeout' 
        : error instanceof Error ? this.sanitizeErrorMessage(error.message) : 'Unknown error';

      safeLog('WhatsApp message send failed', { 
        to: request.to,
        error: errorMessage,
        isTimeout: isAbortError 
      }, correlationId);

      return {
        status: 'failed',
        error: errorMessage,
        correlationId,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for status check

    try {
      const headers: Record<string, string> = {};
      
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await fetch(this.normalizeUrl(`/session/${this.sessionId}/status`), {
        signal: controller.signal,
        headers,
        mode: 'cors',
      });
      
      if (!response.ok) {
        return { status: 'unknown' };
      }

      const result = await response.json();
      return {
        status: result.status || 'unknown',
        isConnected: result.isConnected,
        isConnecting: result.isConnecting,
        lastConnected: result.lastConnected,
        qrCode: result.qrCode,
        error: result.error,
      };

    } catch (error) {
      safeLog('WhatsApp connection status check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return { status: 'unknown' };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getQRCode(): Promise<QRCodeResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const headers: Record<string, string> = {};
      
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await fetch(this.normalizeUrl(`/session/${this.sessionId}/qr`), {
        signal: controller.signal,
        headers,
        mode: 'cors',
      });
      
      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return { qr: result.qr };

    } catch (error) {
      safeLog('WhatsApp QR code fetch failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const whatsappApiClient = new WhatsAppApiClient();