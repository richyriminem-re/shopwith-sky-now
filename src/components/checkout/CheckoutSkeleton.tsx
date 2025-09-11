import { Skeleton } from '@/components/ui/skeleton';

export const CheckoutSkeleton = () => {
  return (
    <div className="pb-20">
      {/* Steps Progress Skeleton */}
      <div className="px-4 mb-6">
        <div className="neu-surface p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="ml-2 h-4 w-16 hidden sm:block" />
              <div className="w-8 h-0.5 bg-border mx-2" />
            </div>
            <div className="flex items-center">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="ml-2 h-4 w-16 hidden sm:block" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="px-4 mb-6">
        <div className="neu-surface p-4 rounded-xl">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="px-4">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
};