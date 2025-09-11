import { Skeleton } from '@/components/ui/skeleton';

const CartSkeleton = () => {
  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <Skeleton className="h-8 w-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        </Skeleton>
      </div>

      {/* Cart Items */}
      <div className="px-4 space-y-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="neu-card p-4">
            <div className="flex gap-4">
              {/* Product Image */}
              <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
              </Skeleton>
              
              {/* Product Info */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
                <Skeleton className="h-4 w-1/2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                  </Skeleton>
                  <Skeleton className="h-8 w-24 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                  </Skeleton>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Section */}
      <div className="px-4 mb-6">
        <div className="neu-card p-4">
          <Skeleton className="h-5 w-24 mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          </Skeleton>
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
            <Skeleton className="h-10 w-20 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
          </div>
        </div>
      </div>

      {/* Shipping Method */}
      <div className="px-4 mb-6">
        <div className="neu-card p-4">
          <Skeleton className="h-5 w-32 mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          </Skeleton>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 neu-surface rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                  </Skeleton>
                  <div>
                    <Skeleton className="h-4 w-24 mb-1 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                    </Skeleton>
                    <Skeleton className="h-3 w-16 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                    </Skeleton>
                  </div>
                </div>
                <Skeleton className="h-4 w-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-4 mb-6">
        <div className="neu-card p-4">
          <Skeleton className="h-5 w-28 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          </Skeleton>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
                <Skeleton className="h-4 w-16 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="px-4">
        <Skeleton className="h-12 w-full rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        </Skeleton>
      </div>
    </div>
  );
};

export default CartSkeleton;