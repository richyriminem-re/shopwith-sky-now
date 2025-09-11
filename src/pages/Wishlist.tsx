import { useEffect } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore, useCartStore } from '@/lib/store';
import { useAccountPagePreloading } from '@/hooks/useDeepPagePreloading';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LoadingErrorBoundary } from '@/components/LoadingErrorBoundary';

const Wishlist = () => {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Deep page preloading for account-related routes
  useAccountPagePreloading();

  const { wishlist, toggleWishlist } = useAppStore();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const wishlistProducts = products.filter(product => 
    wishlist.includes(product.id)
  );

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.variants.length > 0) {
      // Add the first available variant to cart
      const variant = product.variants.find(v => v.stock > 0);
      if (variant) {
        addItem({
          productId: product.id,
          variantId: variant.id,
          qty: 1
        });
        toast({
          title: "Added to cart",
          description: `${product.title} has been added to your cart.`,
        });
      }
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    toggleWishlist(productId);
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    });
  };

  if (wishlistProducts.length === 0) {
    return (
      <LoadingErrorBoundary>
        <div className="pb-20 pb-safe min-h-screen">
        {/* Header */}
        <header className="neu-surface mx-3 sm:mx-4 lg:mx-6 mt-2 sm:mt-4 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Heart size={20} className="text-primary flex-shrink-0 sm:w-6 sm:h-6" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              Wishlist
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Save items you love
          </p>
        </header>

        {/* Responsive Empty State */}
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="neu-surface p-6 sm:p-8 lg:p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 neu-surface rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Heart size={24} className="text-muted-foreground sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Start adding items you love by tapping the heart icon on products
            </p>
            <Link 
              to="/product" 
              className="neu-button-primary inline-block px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-xl min-h-[44px] transition-all hover:transform hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        </div>
        </div>
      </LoadingErrorBoundary>
    );
  }

  return (
    <LoadingErrorBoundary>
      <div className="pb-20 pb-safe min-h-screen">
      {/* Header */}
      <header className="neu-surface mx-3 sm:mx-4 lg:mx-6 mt-2 sm:mt-4 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <Heart size={20} className="text-primary flex-shrink-0 sm:w-6 sm:h-6" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground line-clamp-1">
            Wishlist
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
        </p>
      </header>

      {/* Responsive Wishlist Items Grid */}
      <div className="px-3 sm:px-4 lg:px-6 space-y-3 sm:space-y-4">
        {wishlistProducts.map((product) => (
          <div key={product.id} className="neu-surface p-3 sm:p-4 lg:p-5 rounded-xl">
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
              {/* Responsive Product Image */}
              <Link 
                to={`/product/${product.handle}`}
                className="flex-shrink-0 self-center xs:self-start"
              >
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-24 h-24 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg neu-card transition-transform hover:scale-105"
                  loading="lazy"
                />
              </Link>

              {/* Responsive Product Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <Link 
                  to={`/product/${product.handle}`}
                  className="block mb-2 sm:mb-3 group"
                >
                  <h3 className="font-semibold text-foreground text-sm sm:text-base lg:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </Link>

                {/* Responsive Price and Actions Row */}
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-2">
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-foreground order-2 xs:order-1">
                    ₦{Math.min(...product.variants.map(v => v.price)).toLocaleString()}
                  </div>
                  
                  {/* Responsive Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3 order-1 xs:order-2 justify-center xs:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                      className="neu-pressable border-0 min-h-[44px] min-w-[44px] px-3 sm:px-4 flex-shrink-0"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={16} className="sm:w-5 sm:h-5" />
                      <span className="sr-only sm:not-sr-only sm:ml-2 text-xs sm:text-sm">
                        Add to Cart
                      </span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="neu-pressable border-0 hover:text-destructive min-h-[44px] min-w-[44px] px-3 sm:px-4 flex-shrink-0"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} className="sm:w-5 sm:h-5" />
                      <span className="sr-only sm:not-sr-only sm:ml-2 text-xs sm:text-sm">
                        Remove
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </LoadingErrorBoundary>
  );
};

export default Wishlist;