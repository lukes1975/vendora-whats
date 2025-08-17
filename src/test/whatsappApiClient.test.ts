import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { whatsappApiClient } from '@/services/whatsappApiClient';

describe('WhatsAppApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendMessage', () => {
    it('should reject invalid E.164 phone numbers', async () => {
      const result = await whatsappApiClient.sendMessage({
        to: 'invalid-phone',
        message: 'Test message',
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Invalid recipient format');
      expect(result.correlationId).toBeDefined();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should accept valid E.164 phone numbers', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ status: 'sent', messageId: 'msg-123' }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await whatsappApiClient.sendMessage({
        to: '+1234567890',
        message: 'Test message',
      });

      expect(global.fetch).toHaveBeenCalled();
      expect(result.status).toBe('sent');
      expect(result.messageId).toBe('msg-123');
      expect(result.correlationId).toBeDefined();
    });

    it('should set Authorization header when API key is available', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ status: 'sent' }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await whatsappApiClient.sendMessage({
        to: '+1234567890',
        message: 'Test message',
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers.Authorization).toBe('Bearer test-api-key');
    });

    it('should abort request on timeout', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 100);
      });
      (global.fetch as any).mockReturnValueOnce(timeoutPromise);

      const result = await whatsappApiClient.sendMessage({
        to: '+1234567890',
        message: 'Test message',
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Request timeout');
    });

    it('should use provided idempotency key', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ status: 'sent' }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const idempotencyKey = 'custom-key-123';
      await whatsappApiClient.sendMessage({
        to: '+1234567890',
        message: 'Test message',
        idempotencyKey,
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers['Idempotency-Key']).toBe(idempotencyKey);
    });

    it('should generate idempotency key if not provided', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ status: 'sent' }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await whatsappApiClient.sendMessage({
        to: '+1234567890',
        message: 'Test message',
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers['Idempotency-Key']).toMatch(/^test-uuid-/);
    });
  });

  describe('getConnectionStatus', () => {
    it('should return connected true for successful response', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ connected: true }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await whatsappApiClient.getConnectionStatus();
      expect(result.status).toBe('connected');
    });

    it('should return connected false for failed response', async () => {
      const mockResponse = {
        ok: false,
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await whatsappApiClient.getConnectionStatus();
      expect(result.status).toBe('unknown');
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await whatsappApiClient.getConnectionStatus();
      expect(result.status).toBe('unknown');
    });
  });
});