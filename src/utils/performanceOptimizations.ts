/**
 * Performance Optimization Utilities
 * 
 * Collection of utilities for improving application performance
 */

import React from 'react';
import { requestIdleCallbackPolyfill, createSafePerformanceObserver } from './compatibility';
import { createSoftRefresh } from './softRefresh';

// Resource hints for better loading performance
export const addResourceHints = () => {
  // Only add preconnect hints that aren't already in HTML
  const preconnectDomains = [
    // Note: fonts.googleapis.com and fonts.gstatic.com are already in HTML
  ];

  preconnectDomains.forEach(domain => {
    // Check if preconnect already exists
    const existing = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    }
  });
};

// Lazy load components with React.lazy wrapper
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFn);
  
  return (props: React.ComponentProps<T>) => 
    React.createElement(React.Suspense, 
      { 
        fallback: fallback 
          ? React.createElement(fallback) 
          : React.createElement('div', { 
              className: 'flex items-center justify-center p-8' 
            }, 'Loading...') 
      },
      React.createElement(LazyComponent, props)
    );
};

// Optimize bundle loading
export const loadChunkWhenIdle = (chunkName: string) => {
  requestIdleCallbackPolyfill(() => {
    import(`@/components/${chunkName}`);
  });
};

// Critical CSS loading - Let Vite handle CSS optimization
export const loadCriticalCSS = () => {
  // Vite handles CSS optimization and critical CSS extraction automatically
  // Manual CSS injection can cause MIME type conflicts
  
  // Remove dev console log for production builds
};

// Performance monitoring
export const measurePerformance = () => {
  const observer = createSafePerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const entryData = entry as any; // Type assertion for web vitals
      
      // Send to analytics in production, log in development
      if (import.meta.env.DEV) {
        console.log(`${entry.name}: ${entryData.value || entry.duration}`);
      }
      
      // You could send this data to analytics
      // analytics.track('web_vital', {
      //   name: entry.name,
      //   value: entryData.value || entry.duration,
      //   id: entryData.id || entry.entryType,
      // });
    });
  });

  if (observer) {
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    } catch (error) {
      console.warn('Failed to observe performance entries:', error);
    }
  }
};

// Image optimization utilities
export const optimizeImageLoading = () => {
  // Add intersection observer for images not yet loaded
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  // Observe all images with data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

// Service Worker registration and update handling
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, refresh to update
               if (confirm('New content available! Refresh to update?')) {
                 // Use soft refresh instead of hard reload
                 const softRefresh = createSoftRefresh((path, options) => {
                   window.history.replaceState(null, '', path);
                 });
                 softRefresh({ clearCaches: true, reason: 'sw_update' });
               }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Enhanced bundle preloading - Let Vite handle this automatically
export const preloadCriticalAssets = () => {
  // Vite already handles optimal preloading through build configuration
  // Manual preloading of source files can cause 404s in production
  
  // Add critical resource preconnects
  if (typeof document !== 'undefined') {
    addResourceHints();
  }
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  if (import.meta.env.PROD) {
    // Only run essential optimizations in production
    measurePerformance();
    optimizeImageLoading();
  } else {
    // Full optimization suite for development
    addResourceHints();
    measurePerformance();
    optimizeImageLoading();
  }
};