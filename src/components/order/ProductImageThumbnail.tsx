import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductImageThumbnailProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductImageThumbnail = ({ 
  src, 
  alt, 
  className,
  size = 'md'
}: ProductImageThumbnailProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  if (imageError || !src) {
    return (
      <div 
        className={cn(
          "rounded-lg bg-muted/30 border border-border/30 flex items-center justify-center",
          "animate-fade-in",
          sizeClasses[size],
          className
        )}
        style={{ boxShadow: 'var(--shadow-elevation-1)' }}
      >
        <div className="text-muted-foreground text-xs font-medium">
          {size === 'sm' ? 'IMG' : 'IMAGE'}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/10",
        sizeClasses[size],
        className
      )}
      style={{ boxShadow: 'var(--shadow-elevation-1)' }}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
      )}
      
      <img
        src={src}
        alt={alt || 'Product image'}
        className={cn(
          "w-full h-full object-cover transition-all duration-300",
          imageLoaded ? 'opacity-100 animate-fade-in' : 'opacity-0'
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
};