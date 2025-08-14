import { safeLog, generateUUID } from '@/utils/security';

export interface WhatsAppImportResponse {
  success: boolean;
  message?: string;
  imported_count?: number;
}

export interface CatalogImportPayload {
  phone: string;
  [key: string]: any;
}

export interface CatalogImportResponse {
  imported: number;
  skipped: number;
  errors?: string[];
}

class WhatsAppImporter {
  private baseUrl: string;
  private apiKey: string | null;
  private readonly timeout = 30000; // 30 seconds for import operations

  constructor() {
    // Normalize base URL (strip trailing slash)
    const rawBaseUrl = import.meta.env.VITE_WHATSAPP_IMPORTER_BASE || 'https://vendora-whatsapp-importer.onrender.com';
    this.baseUrl = rawBaseUrl.replace(/\/$/, '');
    this.apiKey = import.meta.env.VITE_WHATSAPP_IMPORTER_KEY || null;
  }

  private normalizeUrl(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  private sanitizeError(error: string): string {
    return error
      .replace(/api[_-]?key/gi, '[REDACTED]')
      .replace(/token/gi, '[REDACTED]')
      .replace(/\+\d{8,15}/g, '[PHONE_REDACTED]')
      .substring(0, 300);
  }

  async importCatalog(payload: CatalogImportPayload): Promise<CatalogImportResponse> {
    const correlationId = generateUUID();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      safeLog('WhatsApp catalog import started', { 
        phone: payload.phone,
        hasApiKey: !!this.apiKey 
      }, correlationId);

      const response = await fetch(this.normalizeUrl('/import'), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        const sanitizedError = this.sanitizeError(errorText);
        throw new Error(`HTTP ${response.status}: ${sanitizedError}`);
      }

      const result = await response.json();
      
      // Transform legacy response format to new structured format
      const structuredResponse: CatalogImportResponse = {
        imported: result.imported_count || result.imported || 0,
        skipped: result.skipped || 0,
        errors: result.errors || (result.success ? undefined : [result.message || 'Import failed']),
      };

      safeLog('WhatsApp catalog import completed', { 
        phone: payload.phone,
        imported: structuredResponse.imported,
        skipped: structuredResponse.skipped,
        hasErrors: !!structuredResponse.errors?.length 
      }, correlationId);

      return structuredResponse;

    } catch (error) {
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const errorMessage = isAbortError 
        ? 'Import timeout' 
        : error instanceof Error ? this.sanitizeError(error.message) : 'Unknown import error';

      safeLog('WhatsApp catalog import failed', { 
        phone: payload.phone,
        error: errorMessage,
        isTimeout: isAbortError 
      }, correlationId);

      throw new Error(errorMessage);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Legacy function for backward compatibility
export async function sendToWhatsappImporter(phone: string): Promise<WhatsAppImportResponse> {
  try {
    const importer = new WhatsAppImporter();
    const result = await importer.importCatalog({ phone });
    
    return {
      success: !result.errors?.length,
      imported_count: result.imported,
      message: result.errors?.length ? result.errors[0] : 'Import completed successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import failed',
    };
  }
}

export const whatsappImporter = new WhatsAppImporter();