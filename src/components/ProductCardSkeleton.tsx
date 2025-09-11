import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardSkeletonProps {
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

const ProductCardSkeleton = ({ className = "", variant = 'default' }: ProductCardSkeletonProps) => {
  const baseClasses = "neu-card overflow-hidden";
  const shimmerClasses = "absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent";
  
  if (variant === 'compact') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="relative aspect-square">
          <Skeleton className="w-full h-full relative overflow-hidden">
            <div className={`${shimmerClasses} animate-shimmer`} />
          </Skeleton>
        </div>
        <div className="p-2 space-y-1">
          <Skeleton className="h-3 w-2/3 relative overflow-hidden">
            <div className={`${shimmerClasses} animate-shimmer`} />
          </Skeleton>
          <Skeleton className="h-4 w-1/2 relative overflow-hidden">
            <div className={`${shimmerClasses} animate-shimmer`} />
          </Skeleton>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="relative aspect-[3/4]">
          <Skeleton className="w-full h-full relative overflow-hidden">
            <div className={`${shimmerClasses} animate-shimmer`} />
          </Skeleton>
          <div className="absolute top-3 right-3">
            <Skeleton className="w-9 h-9 rounded-full relative overflow-hidden">
              <div className={`${shimmerClasses} animate-shimmer`} />
            </Skeleton>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-4/5 relative overflow-hidden">
            <div className={`${shimmerClasses} animate-shimmer`} />
          </Skeleton>
          <Skeleton className="h-6 w-2/3 relative overflow-hidden">
            <div className={`${shimmerClasses} animate-shimmer`} />
          </Skeleton>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-4 h-4 relative overflow-hidden">
                  <div className={`${shimmerClasses} animate-shimmer`} />
                </Skeleton>
              ))}
            </div>
            <Skeleton className="h-4 w-10 relative overflow-hidden">
              <div className={`${shimmerClasses} animate-shimmer`} />
            </Skeleton>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="relative aspect-[4/5]">
        <Skeleton className="w-full h-full relative overflow-hidden">
          <div className={`${shimmerClasses} animate-shimmer`} />
        </Skeleton>
        <div className="absolute top-3 right-3">
          <Skeleton className="w-8 h-8 rounded-full relative overflow-hidden">
            <div className={`${shimmerClasses} animate-shimmer`} />
          </Skeleton>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4 relative overflow-hidden">
          <div className={`${shimmerClasses} animate-shimmer`} />
        </Skeleton>
        <Skeleton className="h-5 w-1/2 relative overflow-hidden">
          <div className={`${shimmerClasses} animate-shimmer`} />
        </Skeleton>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-3 h-3 relative overflow-hidden">
                <div className={`${shimmerClasses} animate-shimmer`} />
              </Skeleton>
            ))}
          </div>
          <Skeleton className="h-3 w-8 relative overflow-hidden">
            <div className={`${shimmerClasses} animate-shimmer`} />
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;