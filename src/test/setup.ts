import { beforeEach, vi } from 'vitest';

// Mock environment variables
beforeEach(() => {
  vi.stubEnv('VITE_WHATSAPP_API_BASE', 'https://test-api.example.com');
  vi.stubEnv('VITE_WHATSAPP_API_KEY', 'test-api-key');
  vi.stubEnv('VITE_WHATSAPP_IMPORTER_BASE', 'https://test-importer.example.com');
  vi.stubEnv('VITE_WHATSAPP_IMPORTER_KEY', 'test-importer-key');
  vi.stubEnv('NODE_ENV', 'test');
});

// Mock crypto.randomUUID for tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 15),
  },
});

// Mock fetch for tests
global.fetch = vi.fn();