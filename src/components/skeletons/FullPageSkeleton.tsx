import HeaderSkeleton from './HeaderSkeleton';
import HomeSkeleton from './HomeSkeleton';
import ProductsSkeleton from './ProductsSkeleton';
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton';
import LoginSkeleton from './LoginSkeleton';
import CartSkeleton from './CartSkeleton';
import { CheckoutSkeleton } from '@/components/checkout/CheckoutSkeleton';

export type ContentType = 
  | 'home' 
  | 'products' 
  | 'product-detail' 
  | 'login' 
  | 'cart' 
  | 'checkout'
  | 'generic';

interface FullPageSkeletonProps {
  includeHeader?: boolean;
  contentType?: ContentType;
  viewMode?: 'grid-2' | 'grid-3';
  className?: string;
}

const FullPageSkeleton = ({ 
  includeHeader = true, 
  contentType = 'generic',
  viewMode = 'grid-2',
  className = ""
}: FullPageSkeletonProps) => {
  
  const renderContentSkeleton = () => {
    switch (contentType) {
      case 'home':
        return <HomeSkeleton />;
      case 'products':
        return <ProductsSkeleton viewMode={viewMode} />;
      case 'product-detail':
        return <ProductDetailSkeleton />;
      case 'login':
        return <LoginSkeleton />;
      case 'cart':
        return <CartSkeleton />;
      case 'checkout':
        return <CheckoutSkeleton />;
      case 'generic':
      default:
        return (
          <div className="space-y-4 p-6">
            <div className="space-y-3">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        );
    }
  };

  // For login and checkout pages that don't include header
  if (!includeHeader) {
    return (
      <div className={`min-h-screen fixed inset-0 z-[60] bg-background ${className}`}>
        {renderContentSkeleton()}
      </div>
    );
  }

  // For pages with header
  return (
    <div className={`min-h-screen fixed inset-0 z-[60] bg-neu ${className}`}>
      {/* Skip to content link skeleton */}
      <div className="absolute -top-40 left-6 z-[100] bg-muted px-4 py-2 rounded-md opacity-0">
        <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
      </div>

      <HeaderSkeleton />
      
      <main 
        className="relative pt-2"
        role="main"
        aria-label="Loading content"
      >
        {renderContentSkeleton()}
      </main>
    </div>
  );
};

export default FullPageSkeleton;