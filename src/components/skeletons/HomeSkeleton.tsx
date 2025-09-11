import { Skeleton } from '@/components/ui/skeleton';
import CategoryCardSkeleton from '@/components/CategoryCardSkeleton';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

const HomeSkeleton = () => {
  return (
    <div className="pb-6">
      {/* Breadcrumb Skeleton */}
      <div className="px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 pb-2">
        <Skeleton className="h-4 w-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        </Skeleton>
      </div>

      {/* Hero Carousel Skeleton */}
      <section className="mb-6 xs:mb-7 sm:mb-8 animate-fade-in">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] neu-surface mx-3 xs:mx-4 sm:mx-6 rounded-xl overflow-hidden">
          <Skeleton className="w-full h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          </Skeleton>
          
          {/* Hero content overlay skeleton */}
          <div className="absolute inset-0 flex flex-col justify-center items-start p-6 sm:p-8 lg:p-12">
            <Skeleton className="h-8 sm:h-12 w-2/3 mb-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </Skeleton>
            <Skeleton className="h-4 sm:h-6 w-1/2 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </Skeleton>
            <Skeleton className="h-10 sm:h-12 w-32 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </Skeleton>
          </div>
        </div>
      </section>

      <div className="pt-2">
        {/* Categories Section Skeleton */}
        <section className="px-3 xs:px-4 sm:px-6 mb-8 xs:mb-10 sm:mb-12 animate-fade-in">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
            <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
            <div className="flex items-center gap-1">
              <Skeleton className="w-4 h-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
              </Skeleton>
              <Skeleton className="h-4 w-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
              </Skeleton>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-in" style={{ animationDelay: `${i * 75}ms` }}>
                <CategoryCardSkeleton />
              </div>
            ))}
          </div>
        </section>

        {/* Editor's Picks Section Skeleton */}
        <section className="mb-8 xs:mb-10 sm:mb-12 animate-fade-in">
          <div className="px-3 xs:px-4 sm:px-6 mb-4 xs:mb-5 sm:mb-6">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 sm:gap-4">
              <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 sm:gap-3">
                <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="w-3 h-3 sm:w-4 sm:h-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                  </Skeleton>
                  <Skeleton className="h-3 sm:h-4 w-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                  </Skeleton>
                </div>
              </div>
              <Skeleton className="h-4 w-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
              </Skeleton>
            </div>
          </div>
          
          <div className="px-3 xs:px-4 sm:px-6">
            <div className="flex gap-1 xs:gap-2 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[45%] xs:w-[45%] sm:w-[30%] md:w-[30%] lg:w-[22%] xl:w-[18%]">
                  <div className="animate-in" style={{ animationDelay: `${i * 75}ms` }}>
                    <ProductCardSkeleton variant="featured" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals Section Skeleton */}
        <section className="px-3 xs:px-4 sm:px-6 mb-8 xs:mb-10 sm:mb-12 animate-fade-in">
          <div className="mb-4 xs:mb-5 sm:mb-6">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 sm:gap-4">
              <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 sm:gap-3">
                <Skeleton className="h-6 sm:h-8 w-28 sm:w-36 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="w-3 h-3 sm:w-4 sm:h-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                  </Skeleton>
                  <Skeleton className="h-3 sm:h-4 w-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                  </Skeleton>
                </div>
              </div>
              <Skeleton className="h-4 w-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
              </Skeleton>
            </div>
          </div>
          <div className="responsive-products-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-in" style={{ animationDelay: `${i * 75}ms` }}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeSkeleton;