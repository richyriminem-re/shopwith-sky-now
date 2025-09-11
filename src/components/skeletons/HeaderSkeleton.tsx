import { Skeleton } from '@/components/ui/skeleton';

const HeaderSkeleton = () => {
  return (
    <header className="neu-floating sticky top-0 z-50 w-full px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between w-full mb-2">
        {/* Hamburger Menu and Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Skeleton className="w-[44px] h-[44px] rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          </Skeleton>
          <Skeleton className="h-10 w-24 md:h-12 md:w-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          </Skeleton>
        </div>

        {/* Essential Icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Skeleton className="w-[44px] h-[44px] rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          </Skeleton>
          
          <span className="hidden md:inline-flex">
            <Skeleton className="w-[44px] h-[44px] rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
          </span>
          
          <Skeleton className="w-[44px] h-[44px] rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          </Skeleton>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="w-full">
        <Skeleton className="w-full h-10 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        </Skeleton>
      </div>
    </header>
  );
};

export default HeaderSkeleton;