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
  connected: boolean;
}

class WhatsAppApiClient {
  private baseUrl: string;
  private apiKey: string | null;
  private readonly timeout = 15000; // 15 seconds

  constructor() {
    // Normalize base URL (strip trailing slash)
    const rawBaseUrl = import.meta.env.VITE_WHATSAPP_API_BASE || 'https://baileys-whatsapp-bot-zip.onrender.com';
    this.baseUrl = rawBaseUrl.replace(/\/$/, '');
    
    this.apiKey = import.meta.env.VITE_WHATSAPP_API_KEY || null;
    
    // Fail fast in non-development if API key is missing
    if (!this.apiKey && import.meta.env.NODE_ENV !== 'development') {
      throw new Error('VITE_WHATSAPP_API_KEY is required for WhatsApp integration');
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

      // Add authorization header if API key is available
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

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
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.normalizeUrl('/status'), {
        signal: controller.signal,
        headers,
        mode: 'cors',
      });
      
      if (!response.ok) {
        return { connected: false };
      }

      const result = await response.json();
      return { connected: result.connected || false };

    } catch (error) {
      safeLog('WhatsApp connection status check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return { connected: false };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const whatsappApiClient = new WhatsAppApiClient();