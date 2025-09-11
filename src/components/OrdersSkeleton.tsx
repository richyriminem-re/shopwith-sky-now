import { ArrowLeft, Package, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export const OrdersSkeleton = () => {
  return (
    <div className="min-h-screen w-full pb-20 overflow-x-hidden">
      {/* Header Skeleton */}
      <header className="w-full px-3 sm:px-4 lg:px-6 mb-4 sm:mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="neu-surface p-4 sm:p-6 rounded-xl">
            {/* Back Button */}
            <div className="mb-4">
              <Button 
                variant="ghost" 
                disabled
                className="flex items-center gap-2 text-muted-foreground min-h-[44px] px-3"
              >
                <ArrowLeft size={20} className="flex-shrink-0" />
                <span className="truncate">Back</span>
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Package size={24} className="text-neu-primary flex-shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold text-neu-primary">Orders</h1>
              </div>
            </div>
            
            {/* Search and Filter Skeleton */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neu-muted flex-shrink-0" />
                <Skeleton className="w-full h-12 rounded-lg" />
              </div>
              
              <div className="flex items-start gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Filter size={16} className="text-neu-muted flex-shrink-0 mt-2" />
                <div className="flex gap-2 min-w-max">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-20 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      </header>

      {/* Orders List Skeleton */}
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="neu-surface p-4 sm:p-6 rounded-xl">
              {/* Order Header Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                
                <div className="text-left sm:text-right flex-shrink-0">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>

              {/* Status Timeline Skeleton */}
              <div className="mb-4 overflow-x-auto">
                <div className="flex items-center gap-1 pb-2">
                  {Array.from({ length: 4 }).map((_, timelineIndex) => (
                    <div key={timelineIndex} className="flex items-center gap-1 flex-shrink-0">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      {timelineIndex < 3 && <Skeleton className="w-4 h-0.5" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items Skeleton */}
              <div className="space-y-2 mb-4">
                {Array.from({ length: 2 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between items-start gap-2">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-16 flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* Order Actions Skeleton */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-neu-accent">
                <Skeleton className="h-11 flex-1 rounded-lg" />
                <Skeleton className="h-11 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersSkeleton;