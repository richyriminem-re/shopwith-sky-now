/**
 * Image Preloader Hook for Enhanced Caching
 * 
 * Preloads critical images and implements intelligent caching strategies
 */

import { useEffect, useCallback } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
  sizes?: string;
}

const imageCache = new Map<string, HTMLImageElement>();

export const useImagePreloader = () => {
  const preloadImage = useCallback((src: string, options: PreloadOptions = {}) => {
    // Check if already cached
    if (imageCache.has(src)) {
      return Promise.resolve(imageCache.get(src)!);
    }

    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      // Set properties before src to ensure they're applied
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }
      
      if (options.sizes) {
        img.sizes = options.sizes;
      }

      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`));
      };
      
      // Set src last to trigger loading
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (sources: string[], options: PreloadOptions = {}) => {
    const promises = sources.map(src => preloadImage(src, options));
    
    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }, [preloadImage]);

  const preloadCriticalImages = useCallback((sources: string[]) => {
    // Use high priority for above-the-fold images
    return preloadImages(sources, { priority: 'high' });
  }, [preloadImages]);

  const clearImageCache = useCallback(() => {
    imageCache.clear();
  }, []);

  return {
    preloadImage,
    preloadImages,
    preloadCriticalImages,
    clearImageCache,
    getCachedImage: (src: string) => imageCache.get(src),
    isCached: (src: string) => imageCache.has(src),
  };
};

// Utility for preloading hero images on app start
export const preloadHeroImages = () => {
  // Import hero images dynamically to get the correct paths
  const heroImagePromises = [
    import('@/assets/hero-1.jpg'),
    import('@/assets/hero-2.jpg'),
    import('@/assets/hero-4.jpg'), // Skip hero-3.jpg since it's missing
    import('@/assets/hero-5.jpg'),
  ];

  // Preload images with proper error handling
  heroImagePromises.forEach((promise, index) => {
    promise
      .then((module) => {
        const img = new Image();
        img.onload = () => { 
          if (import.meta.env.DEV) console.log(`Hero image ${index + 1} preloaded`); 
        };
        img.onerror = () => { 
          if (import.meta.env.DEV) console.warn(`Failed to preload hero image ${index + 1}`); 
        };
        img.src = module.default;
      })
      .catch((error) => {
        console.warn(`Failed to import hero image ${index + 1}:`, error);
      });
  });
};