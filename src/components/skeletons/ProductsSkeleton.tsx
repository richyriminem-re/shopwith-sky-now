import { Skeleton } from '@/components/ui/skeleton';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

interface ProductsSkeletonProps {
  viewMode?: 'grid-2' | 'grid-3';
}

const ProductsSkeleton = ({ viewMode = 'grid-2' }: ProductsSkeletonProps) => {
  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-3':
        return 'responsive-products-grid-3';
      default:
        return 'responsive-products-grid';
    }
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 mb-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-6 h-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
            <Skeleton className="h-8 w-32 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
          </div>
        </div>
        <Skeleton className="h-4 w-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        </Skeleton>
      </div>

      {/* Category Chips */}
      <div className="px-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
          ))}
        </div>
      </div>

      {/* Active Filters Skeleton */}
      <div className="px-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
          ))}
        </div>
      </div>

      {/* Filters & Sort Bar */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Skeleton className="h-10 w-20 sm:w-24 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          </Skeleton>
          
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
            <div className="flex gap-1">
              <Skeleton className="w-10 h-10 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
              </Skeleton>
              <Skeleton className="w-10 h-10 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
              </Skeleton>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 mb-4">
        <Skeleton className="h-4 w-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        </Skeleton>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-20">
        <div className={getGridClasses()}>
          {[...Array(viewMode === 'grid-3' ? 9 : 8)].map((_, i) => (
            <div key={i} className="animate-in" style={{ animationDelay: `${i * 50}ms` }}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsSkeleton;