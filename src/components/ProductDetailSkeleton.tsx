import { Skeleton } from '@/components/ui/skeleton';

const ProductDetailSkeleton = () => {
  return (
    <div className="pb-16 sm:pb-20 pb-safe">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Image Gallery Skeleton - Full width on mobile, 7 columns on desktop */}
          <div className="md:col-span-7">
            <div className="aspect-[3/4] sm:aspect-square neu-surface rounded-xl overflow-hidden mb-2 sm:mb-4 relative">
              <Skeleton className="w-full h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </Skeleton>
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </Skeleton>
              ))}
            </div>
          </div>

          {/* Product Info & Actions Skeleton - Full width on mobile, 5 columns on desktop */}
          <div className="md:col-span-5">
            <div className="space-y-4 sm:space-y-6 md:sticky md:top-8">
              {/* Product Info Skeleton */}
              <div className="neu-surface p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                {/* Brand & Title */}
                <div className="space-y-2 sm:space-y-3">
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </Skeleton>
                  <Skeleton className="h-6 sm:h-9 w-3/4 sm:w-4/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </Skeleton>
                </div>
                
                {/* Price */}
                <Skeleton className="h-8 sm:h-12 w-1/2 sm:w-2/3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </Skeleton>
                
                {/* Color Selection */}
                <div className="space-y-2 sm:space-y-3">
                  <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </Skeleton>
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      </Skeleton>
                    ))}
                  </div>
                </div>
                
                {/* Size Selection */}
                <div className="space-y-2 sm:space-y-3">
                  <Skeleton className="h-4 sm:h-5 w-8 sm:w-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </Skeleton>
                  <div className="flex gap-2 flex-wrap">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="px-3 py-1.5 sm:px-4 sm:py-2 h-7 sm:h-10 w-12 sm:w-16 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      </Skeleton>
                    ))}
                  </div>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-3 sm:h-4 w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </Skeleton>
                  <Skeleton className="h-3 sm:h-4 w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </Skeleton>
                  <Skeleton className="h-3 sm:h-4 w-2/3 sm:w-3/4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </Skeleton>
                </div>
              </div>

              {/* Purchase Panel Skeleton */}
              <div className="neu-surface p-4 sm:p-5 lg:p-6 space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <Skeleton className="h-10 sm:h-12 w-20 sm:w-24 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </Skeleton>
                  <Skeleton className="h-10 sm:h-12 flex-1 min-w-[120px] rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </Skeleton>
                </div>
                <Skeleton className="h-10 sm:h-12 w-full rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </Skeleton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;