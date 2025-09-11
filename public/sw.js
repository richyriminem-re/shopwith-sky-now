// Enhanced Service Worker for Shop With Sky PWA with Message Handling and Performance Monitoring
const CACHE_NAME = 'shop-with-sky-v1.0.1';
const OFFLINE_URL = '/offline';

// Performance and analytics storage
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineNavigations: 0,
  navigationSuccessRate: 0,
  averageResponseTime: 0,
  lastSync: Date.now()
};

// Offline analytics queue
let offlineAnalytics = [];

// Define what to cache
const STATIC_CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/lovable-uploads/62770804-21fb-474f-84a8-a4a3f25d70b2.png'
];

// Cache strategies for different types of requests
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: [
    /\.(js|css|png|jpg|jpeg|webp|svg|ico|woff|woff2)$/,
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/fonts\.gstatic\.com/,
    /^https:\/\/cdnjs\.cloudflare\.com/
  ],
  
  // Network first for API calls and dynamic content
  NETWORK_FIRST: [
    /\/api\//,
    /\/product\/.+/
  ],
  
  // Stale while revalidate for pages
  STALE_WHILE_REVALIDATE: [
    /\/product$/,
    /\/cart$/,
    /\/account$/
  ]
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (shouldCacheFirst(event.request)) {
    event.respondWith(cacheFirst(event.request));
  } else if (shouldNetworkFirst(event.request)) {
    event.respondWith(networkFirst(event.request));
  } else if (shouldStaleWhileRevalidate(event.request)) {
    event.respondWith(staleWhileRevalidate(event.request));
  } else {
    // Default to network first with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(event.request));
  }
});

// Cache first strategy with performance tracking
async function cacheFirst(request) {
  const startTime = performance.now();
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      const responseTime = performance.now() - startTime;
      updateAverageResponseTime(responseTime);
      trackAnalytics('cache_hit', { url: request.url, responseTime });
      return cachedResponse;
    }
    
    performanceMetrics.cacheMisses++;
    performanceMetrics.networkRequests++;
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    const responseTime = performance.now() - startTime;
    updateAverageResponseTime(responseTime);
    trackAnalytics('network_fetch', { url: request.url, responseTime, cached: true });
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    trackAnalytics('cache_error', { url: request.url, error: error.message });
    return new Response('Offline', { status: 503 });
  }
}

// Update average response time
function updateAverageResponseTime(responseTime) {
  const totalRequests = performanceMetrics.cacheHits + performanceMetrics.cacheMisses;
  performanceMetrics.averageResponseTime = 
    ((performanceMetrics.averageResponseTime * (totalRequests - 1)) + responseTime) / totalRequests;
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start fetch in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return fetchPromise;
}

// Network first with offline fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, checking cache:', error);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL);
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Helper functions to determine caching strategy
function shouldCacheFirst(request) {
  return CACHE_STRATEGIES.CACHE_FIRST.some(pattern => pattern.test(request.url));
}

function shouldNetworkFirst(request) {
  return CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => pattern.test(request.url));
}

function shouldStaleWhileRevalidate(request) {
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(pattern => pattern.test(request.url));
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle offline actions like form submissions
  }
});

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  if (event.data) {
    const notificationData = event.data.json();
    
    const options = {
      body: notificationData.body,
      icon: '/lovable-uploads/62770804-21fb-474f-84a8-a4a3f25d70b2.png',
      badge: '/lovable-uploads/62770804-21fb-474f-84a8-a4a3f25d70b2.png',
      vibrate: [200, 100, 200],
      data: notificationData.data || {},
      actions: notificationData.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(notificationData.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});

// Send messages to clients
function sendMessageToAllClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'NAVIGATION_REQUEST':
      handleNavigationRequest(data, event.source);
      break;
    
    case 'PERFORMANCE_REQUEST':
      sendPerformanceMetrics(event.source);
      break;
    
    case 'ANALYTICS_SYNC':
      syncOfflineAnalytics();
      break;
    
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'PRELOAD_ROUTES':
      preloadRoutes(data.routes);
      break;
    
    default:
      console.log('Unknown message type:', type);
  }
});

// Handle navigation requests from main thread
async function handleNavigationRequest(data, source) {
  const { route, isOffline, timestamp } = data;
  
  performanceMetrics.offlineNavigations++;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(route) || await cache.match('/');
    
    if (cachedResponse) {
      performanceMetrics.navigationSuccessRate = 
        ((performanceMetrics.navigationSuccessRate * (performanceMetrics.offlineNavigations - 1)) + 1) / 
        performanceMetrics.offlineNavigations;
      
      source.postMessage({
        type: 'NAVIGATION_RESPONSE',
        data: { success: true, route, fromCache: true }
      });
    } else {
      source.postMessage({
        type: 'NAVIGATION_RESPONSE',
        data: { success: false, route, reason: 'No cached version' }
      });
    }
  } catch (error) {
    source.postMessage({
      type: 'NAVIGATION_RESPONSE',
      data: { success: false, route, error: error.message }
    });
  }
}

// Send performance metrics to main thread
function sendPerformanceMetrics(source) {
  const metrics = {
    ...performanceMetrics,
    cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) || 0,
    timestamp: Date.now()
  };
  
  source.postMessage({
    type: 'PERFORMANCE_METRICS',
    data: metrics
  });
}

// Preload critical routes
async function preloadRoutes(routes) {
  const cache = await caches.open(CACHE_NAME);
  
  for (const route of routes) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
      }
    } catch (error) {
      console.warn('Failed to preload route:', route, error);
    }
  }
}

// Enhanced analytics tracking
function trackAnalytics(event, data) {
  offlineAnalytics.push({
    event,
    data,
    timestamp: Date.now(),
    url: self.location.origin
  });
  
  // Sync periodically if online
  if (navigator.onLine && offlineAnalytics.length > 10) {
    syncOfflineAnalytics();
  }
}

// Sync offline analytics when back online
async function syncOfflineAnalytics() {
  if (offlineAnalytics.length === 0) return;
  
  try {
    // In a real app, this would send to your analytics service
    sendMessageToAllClients({
      type: 'ANALYTICS_SYNC',
      data: { events: offlineAnalytics, synced: true }
    });
    
    offlineAnalytics = [];
    performanceMetrics.lastSync = Date.now();
  } catch (error) {
    console.warn('Analytics sync failed:', error);
  }
}