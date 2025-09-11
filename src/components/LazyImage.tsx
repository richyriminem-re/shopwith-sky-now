import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  webpSrc?: string;
  avifSrc?: string;
  width?: number;
  height?: number;
  srcSet?: string;
  webpSrcSet?: string;
  avifSrcSet?: string;
}

const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  aspectRatio = "auto",
  sizes = "100vw",
  priority = false,
  fallbackSrc = "/placeholder.svg",
  onLoad,
  onError,
  webpSrc,
  avifSrc,
  width,
  height,
  srcSet,
  webpSrcSet,
  avifSrcSet
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [displayedSrc, setDisplayedSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setIsError(false);
    setDisplayedSrc(src);
    
    if (priority) {
      preloadCritical();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Increased for better UX
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (displayedSrc !== fallbackSrc) {
      setDisplayedSrc(fallbackSrc);
      setIsLoaded(false);
    } else {
      setIsError(true);
    }
    onError?.();
  };

  // Preload critical images
  const preloadCritical = () => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        aspectRatio,
        ...(width && height && { width: `${width}px`, height: `${height}px` })
      }}
    >
      {/* Loading Skeleton with proper dimensions */}
      {!isLoaded && !isError && (
        <Skeleton 
          className="absolute inset-0 w-full h-full animate-shimmer"
          style={{ 
            aspectRatio,
            ...(width && height && { width: `${width}px`, height: `${height}px` })
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </Skeleton>
      )}

      {/* Error Fallback */}
      {isError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
          style={{ 
            aspectRatio,
            ...(width && height && { width: `${width}px`, height: `${height}px` })
          }}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-card flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs">Image not available</p>
          </div>
        </div>
      )}

      {/* Optimized Picture Element */}
      {isInView && (
        <picture>
          {/* AVIF format - best compression */}
          {avifSrcSet && <source srcSet={avifSrcSet} sizes={sizes} type="image/avif" />}
          {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
          
          {/* WebP format - good compression */}
          {webpSrcSet && <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />}
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          
          {/* Fallback JPEG/PNG */}
          {srcSet && <source srcSet={srcSet} sizes={sizes} />}
          
          <img
            ref={imgRef}
            src={displayedSrc}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            {...(priority ? { fetchpriority: "high" as any } : {})}
          />
        </picture>
      )}
    </div>
  );
};

export default LazyImage;