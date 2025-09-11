import { Skeleton } from '@/components/ui/skeleton';

const CategoryCardSkeleton = () => {
  return (
    <div className="neu-card overflow-hidden animate-pulse">
      {/* Image Section Skeleton */}
      <div className="relative aspect-[4/3]">
        <Skeleton className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </Skeleton>
        
        {/* Badge Skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-16 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </Skeleton>
        </div>
        
        {/* Item Count Skeleton */}
        <div className="absolute bottom-3 right-3">
          <Skeleton className="h-6 w-16 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </Skeleton>
        </div>
      </div>
      
      {/* Content Section Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-2/3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </Skeleton>
        
        {/* Description */}
        <Skeleton className="h-4 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </Skeleton>
        <Skeleton className="h-4 w-4/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </Skeleton>
        
        {/* CTA Section */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </Skeleton>
          <Skeleton className="w-6 h-6 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export default CategoryCardSkeleton;