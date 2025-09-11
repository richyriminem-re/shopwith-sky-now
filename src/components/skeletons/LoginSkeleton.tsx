import { Skeleton } from '@/components/ui/skeleton';

const LoginSkeleton = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Subtle Background Element */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-primary/3 to-transparent rounded-full translate-x-40 translate-y-40"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <Skeleton className="w-10 h-10 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        </Skeleton>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 relative z-10 flex items-center">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo/Icon */}
          <div className="text-center mb-6">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
            <Skeleton className="h-8 w-48 mx-auto mb-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
            <Skeleton className="h-4 w-56 mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
          </div>

          {/* Form */}
          <div className="neu-card p-4 mb-4 shadow-xl">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
                <Skeleton className="h-11 w-full rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
                <Skeleton className="h-11 w-full rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
              </div>
              
              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Skeleton className="h-3 w-24 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </Skeleton>
              </div>
              
              {/* Submit Button */}
              <Skeleton className="h-11 w-full rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
              </Skeleton>
            </div>
          </div>

          {/* Toggle Mode */}
          <div className="text-center mb-4">
            <Skeleton className="h-4 w-40 mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            </Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSkeleton;