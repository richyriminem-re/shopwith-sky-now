/**
 * Test setup and configuration
 */
import { beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock service worker
const mockServiceWorker = {
  register: vi.fn().mockResolvedValue({
    installing: null,
    waiting: null,
    active: { postMessage: vi.fn() },
    addEventListener: vi.fn(),
    update: vi.fn(),
  }),
  ready: Promise.resolve({
    active: { postMessage: vi.fn() },
    installing: null,
    waiting: null,
    addEventListener: vi.fn(),
  }),
  addEventListener: vi.fn(),
  controller: { postMessage: vi.fn() },
  getRegistration: vi.fn().mockResolvedValue(null),
};

Object.defineProperty(global.navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true
});

// Mock navigation online status
Object.defineProperty(global.navigator, 'onLine', {
  value: true,
  writable: true
});

// Mock caches API for PWA tests
global.caches = {
  open: vi.fn().mockResolvedValue({
    match: vi.fn(),
    add: vi.fn(),
    addAll: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
  }),
  match: vi.fn(),
  has: vi.fn(),
  delete: vi.fn(),
  keys: vi.fn().mockResolvedValue([]),
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: localStorageMock
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  (global.navigator as any).onLine = true;
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllTimers();
});