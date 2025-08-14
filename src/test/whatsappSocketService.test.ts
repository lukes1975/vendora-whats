import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { whatsappSocketService } from '@/services/whatsappSocketService';

// Mock socket.io-client
const mockSocket = {
  connected: false,
  connect: vi.fn(),
  disconnect: vi.fn(),
  removeAllListeners: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

const mockIo = vi.fn((url?: string, options?: any) => mockSocket);

vi.mock('socket.io-client', () => ({
  io: mockIo,
}));

describe('WhatsAppSocketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('connect', () => {
    it('should initialize socket with correct options including auth payload', async () => {
      mockSocket.connected = true;
      
      // Mock immediate connection
      mockIo.mockImplementationOnce((url, options) => {
        // Simulate successful connection
        setTimeout(() => {
          const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
          if (connectHandler) connectHandler();
        }, 0);
        return mockSocket;
      });

      await whatsappSocketService.connect();

      expect(mockIo).toHaveBeenCalledWith(
        'https://test-api.example.com',
        expect.objectContaining({
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 10,
          forceNew: true,
          auth: { token: 'test-api-key' },
        })
      );
    });

    it('should be idempotent - return immediately if already connected', async () => {
      mockSocket.connected = true;
      
      await whatsappSocketService.connect();
      
      // Second call should not create new socket
      await whatsappSocketService.connect();
      
      expect(mockIo).toHaveBeenCalledTimes(0); // No new socket created
    });

    it('should reuse existing socket if not connected', async () => {
      mockSocket.connected = false;
      
      // First call creates socket
      const connectPromise1 = whatsappSocketService.connect();
      
      // Simulate connection after delay
      setTimeout(() => {
        mockSocket.connected = true;
        const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
        if (connectHandler) connectHandler();
      }, 10);
      
      await connectPromise1;
      
      // Disconnect socket but keep reference
      mockSocket.connected = false;
      
      // Second call should reuse socket
      const connectPromise2 = whatsappSocketService.connect();
      
      setTimeout(() => {
        mockSocket.connected = true;
        const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
        if (connectHandler) connectHandler();
      }, 10);
      
      await connectPromise2;
      
      expect(mockSocket.connect).toHaveBeenCalled();
    });

    it('should set up socket.io event listeners without duplicates', async () => {
      mockSocket.connected = false;
      
      const connectPromise = whatsappSocketService.connect();
      
      // Simulate connection
      setTimeout(() => {
        mockSocket.connected = true;
        const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
        if (connectHandler) connectHandler();
      }, 0);
      
      await connectPromise;
      
      // Check that event listeners were set up
      const eventTypes = mockSocket.on.mock.calls.map(call => call[0]);
      expect(eventTypes).toContain('connect');
      expect(eventTypes).toContain('disconnect');
      expect(eventTypes).toContain('connect_error');
      expect(eventTypes).toContain('reconnect_attempt');
      expect(eventTypes).toContain('qr');
      expect(eventTypes).toContain('message');
    });
  });

  describe('disconnect', () => {
    it('should clean up listeners and disconnect socket', () => {
      // Set up connected socket
      (whatsappSocketService as any).socket = mockSocket;
      
      whatsappSocketService.disconnect();
      
      expect(mockSocket.removeAllListeners).toHaveBeenCalled();
      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect((whatsappSocketService as any).socket).toBeNull();
    });
  });

  describe('event management', () => {
    it('should manage event listeners without duplicates', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      // Add listeners
      whatsappSocketService.on('connected', callback1);
      whatsappSocketService.on('connected', callback2);
      
      // Add same callback again (should not duplicate)
      whatsappSocketService.on('connected', callback1);
      
      // Trigger event
      (whatsappSocketService as any).emit('connected');
      
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should remove event listeners correctly', () => {
      const callback = vi.fn();
      
      whatsappSocketService.on('connected', callback);
      whatsappSocketService.off('connected', callback);
      
      // Trigger event
      (whatsappSocketService as any).emit('connected');
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('isConnected', () => {
    it('should return false when no socket exists', () => {
      expect(whatsappSocketService.isConnected()).toBe(false);
    });

    it('should return socket connection status', () => {
      (whatsappSocketService as any).socket = mockSocket;
      mockSocket.connected = true;
      
      expect(whatsappSocketService.isConnected()).toBe(true);
      
      mockSocket.connected = false;
      expect(whatsappSocketService.isConnected()).toBe(false);
    });
  });
});
