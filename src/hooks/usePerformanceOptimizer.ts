/**
 * Performance Optimization Hook
 * 
 * Provides real-time performance monitoring and optimization
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { requestIdleCallbackPolyfill } from '@/utils/compatibility';
import { asyncLocalStorage } from '@/utils/asyncStorage';

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  routeChangeTime: number;
  cacheHitRate: number;
}

// Performance tracking
const performanceMetrics = {
  pageViews: new Map<string, number>(),
  loadTimes: new Map<string, number[]>(),
  renderTimes: new Map<string, number[]>(),
};

export const usePerformanceOptimizer = () => {
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());

  // Track route changes
  useEffect(() => {
    const routeChangeStart = Date.now();
    
    // Track page view
    const currentPath = location.pathname;
    const views = performanceMetrics.pageViews.get(currentPath) || 0;
    performanceMetrics.pageViews.set(currentPath, views + 1);

    // Measure route change time
    const routeChangeTime = routeChangeStart - startTimeRef.current;
    startTimeRef.current = routeChangeStart;

    // Store metrics asynchronously
    requestIdleCallbackPolyfill(() => {
      const loadTimes = performanceMetrics.loadTimes.get(currentPath) || [];
      loadTimes.push(routeChangeTime);
      if (loadTimes.length > 10) loadTimes.shift(); // Keep last 10 measurements
      performanceMetrics.loadTimes.set(currentPath, loadTimes);

      // Save to storage for analytics
      asyncLocalStorage.setItem(
        'performance-metrics',
        JSON.stringify({
          pageViews: Array.from(performanceMetrics.pageViews.entries()),
          loadTimes: Array.from(performanceMetrics.loadTimes.entries()),
        }),
        { priority: 'low' }
      );
    });
  }, [location.pathname]);

  // Track render performance
  useEffect(() => {
    renderStartRef.current = Date.now();
    
    // Use setTimeout to measure after render
    setTimeout(() => {
      const renderTime = Date.now() - renderStartRef.current;
      const currentPath = location.pathname;
      
      requestIdleCallbackPolyfill(() => {
        const renderTimes = performanceMetrics.renderTimes.get(currentPath) || [];
        renderTimes.push(renderTime);
        if (renderTimes.length > 10) renderTimes.shift();
        performanceMetrics.renderTimes.set(currentPath, renderTimes);
      });
    }, 0);
  });

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const currentPath = location.pathname;
    const loadTimes = performanceMetrics.loadTimes.get(currentPath) || [];
    const renderTimes = performanceMetrics.renderTimes.get(currentPath) || [];
    
    const suggestions: string[] = [];
    
    // Analyze load times
    const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    if (avgLoadTime > 300) {
      suggestions.push('Consider implementing route-level code splitting');
    }
    if (avgLoadTime > 500) {
      suggestions.push('Optimize bundle size or implement lazy loading');
    }

    // Analyze render times
    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    if (avgRenderTime > 100) {
      suggestions.push('Consider using React.memo for expensive components');
    }
    if (avgRenderTime > 200) {
      suggestions.push('Implement virtualization for large lists');
    }

    return suggestions;
  }, [location.pathname]);

  // Get performance metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    const currentPath = location.pathname;
    const loadTimes = performanceMetrics.loadTimes.get(currentPath) || [];
    const renderTimes = performanceMetrics.renderTimes.get(currentPath) || [];
    
    return {
      pageLoadTime: loadTimes.length > 0 ? 
        loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0,
      renderTime: renderTimes.length > 0 ? 
        renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0,
      routeChangeTime: Date.now() - startTimeRef.current,
      cacheHitRate: 0.85, // Placeholder - would be calculated from actual cache metrics
    };
  }, [location.pathname]);

  // Monitor likely routes (analytics only)
  const preloadLikelyRoutes = useCallback(() => {
    // Only track route patterns for analytics, no actual preloading
    const currentPath = location.pathname;
    
    // Track route analytics only in development
    if (import.meta.env.DEV) {
      console.log(`Route analytics: ${currentPath}`);
    }
    
    // Let Vite handle all preloading automatically
  }, [location.pathname]);

  // Optimize images in viewport
  const optimizeViewportImages = useCallback(() => {
    requestIdleCallbackPolyfill(() => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src && !img.src) {
                img.src = img.dataset.src;
                observer.unobserve(img);
              }
            }
          });
        },
        { rootMargin: '200px' }
      );

      images.forEach((img) => observer.observe(img));
    });
  }, []);

  // Initialize optimizations
  useEffect(() => {
    preloadLikelyRoutes();
    optimizeViewportImages();
  }, [preloadLikelyRoutes, optimizeViewportImages]);

  return {
    getMetrics,
    getOptimizationSuggestions,
    preloadLikelyRoutes,
    optimizeViewportImages,
  };
};