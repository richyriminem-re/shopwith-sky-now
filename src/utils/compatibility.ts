/**
 * Browser Compatibility Utilities
 * 
 * Provides feature detection and polyfills for cross-browser compatibility
 */

// Feature detection
export const browserSupport = {
  intersectionObserver: typeof IntersectionObserver !== 'undefined',
  requestIdleCallback: typeof requestIdleCallback !== 'undefined',
  performanceObserver: typeof PerformanceObserver !== 'undefined',
  serviceWorker: 'serviceWorker' in navigator,
  abortSignalTimeout: typeof AbortSignal?.timeout === 'function',
  webp: false, // Will be set dynamically
};

// Polyfill for requestIdleCallback
export const requestIdleCallbackPolyfill = (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
  if (browserSupport.requestIdleCallback) {
    return requestIdleCallback(callback, options);
  }
  
  // Fallback using setTimeout
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining() {
        return Math.max(0, 50 - (Date.now() - start));
      },
    });
  }, 1);
};

// Polyfill for cancelIdleCallback
export const cancelIdleCallbackPolyfill = (id: number) => {
  if (browserSupport.requestIdleCallback && typeof cancelIdleCallback !== 'undefined') {
    return cancelIdleCallback(id);
  }
  return clearTimeout(id);
};

// Load IntersectionObserver polyfill conditionally
export const loadIntersectionObserverPolyfill = async () => {
  if (!browserSupport.intersectionObserver) {
    try {
      await import('intersection-observer');
      return true;
    } catch (error) {
      console.warn('Failed to load IntersectionObserver polyfill:', error);
      return false;
    }
  }
  return true;
};

// WebP support detection
export const detectWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      browserSupport.webp = webP.height === 2;
      resolve(browserSupport.webp);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Safe PerformanceObserver wrapper
export const createSafePerformanceObserver = (callback: PerformanceObserverCallback) => {
  if (!browserSupport.performanceObserver) {
    console.warn('PerformanceObserver not supported');
    return null;
  }
  
  try {
    return new PerformanceObserver(callback);
  } catch (error) {
    console.warn('Failed to create PerformanceObserver:', error);
    return null;
  }
};

// Initialize compatibility features
export const initializeCompatibility = async () => {
  // Load polyfills
  await loadIntersectionObserverPolyfill();
  await detectWebPSupport();
  
  if (import.meta.env.DEV) console.log('Browser compatibility initialized:', browserSupport);
};