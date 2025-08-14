import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { whatsappImporter, sendToWhatsappImporter } from '@/services/whatsappImporter';

describe('WhatsAppImporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('importCatalog', () => {
    it('should post to correct URL with auth header', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          imported_count: 5, 
          skipped: 1,
          success: true 
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const payload = { phone: '+1234567890' };
      const result = await whatsappImporter.importCatalog(payload);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe('https://test-importer.example.com/import');
      expect(fetchCall[1].headers.Authorization).toBe('Bearer test-importer-key');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(fetchCall[1].body)).toEqual(payload);
      
      expect(result.imported).toBe(5);
      expect(result.skipped).toBe(1);
      expect(result.errors).toBeUndefined();
    });

    it('should handle non-200 responses', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad request'),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const payload = { phone: '+1234567890' };
      
      await expect(whatsappImporter.importCatalog(payload)).rejects.toThrow('HTTP 400: Bad request');
    });

    it('should transform legacy response format', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          success: true,
          imported_count: 3,
          message: 'Import successful'
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await whatsappImporter.importCatalog({ phone: '+1234567890' });
      
      expect(result.imported).toBe(3);
      expect(result.skipped).toBe(0);
      expect(result.errors).toBeUndefined();
    });

    it('should handle import failures', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          success: false,
          message: 'Import failed due to invalid format'
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await whatsappImporter.importCatalog({ phone: '+1234567890' });
      
      expect(result.imported).toBe(0);
      expect(result.errors).toEqual(['Import failed due to invalid format']);
    });

    it('should timeout after 30 seconds', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 100);
      });
      (global.fetch as any).mockReturnValueOnce(timeoutPromise);

      await expect(whatsappImporter.importCatalog({ phone: '+1234567890' }))
        .rejects.toThrow('Import timeout');
    });
  });

  describe('sendToWhatsappImporter (legacy)', () => {
    it('should maintain backward compatibility', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          imported_count: 2,
          success: true 
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await sendToWhatsappImporter('+1234567890');
      
      expect(result.success).toBe(true);
      expect(result.imported_count).toBe(2);
      expect(result.message).toBe('Import completed successfully');
    });

    it('should handle legacy errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));

      const result = await sendToWhatsappImporter('+1234567890');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Network failure');
    });
  });
});