import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Heart } from 'lucide-react';
import { useCartStore, useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Product, Variant } from '@/types';

interface StickyAddToCartProps {
  product: Product;
  selectedVariant: Variant | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  className?: string;
}

const StickyAddToCart = ({ 
  product, 
  selectedVariant, 
  quantity, 
  onQuantityChange, 
  className = "" 
}: StickyAddToCartProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { addItem } = useCartStore();
  const { toggleWishlist, wishlist } = useAppStore();
  const { toast } = useToast();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Check if IntersectionObserver is supported
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      // Fallback: Use scroll listener
      const handleScroll = () => {
        const scrollY = window.scrollY;
        setIsVisible(scrollY > 300); // Show after scrolling 300px
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const productImages = document.querySelector('[data-product-images]');
    
    if (productImages) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(!entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      
      observerRef.current.observe(productImages);
    } else {
      // Fallback if element not found: show after delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    if (selectedVariant.stock < quantity) {
      toast({
        title: "Not enough stock",
        description: `Only ${selectedVariant.stock} items available`,
        variant: "destructive",
      });
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      qty: quantity
    });

    toast({
      title: "Added. Your cart feels fuller.",
      description: `${product.title} added to cart`,
    });
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxStock = selectedVariant?.stock || 0;
    const clampedQuantity = Math.max(1, Math.min(newQuantity, maxStock));
    onQuantityChange(clampedQuantity);
  };

  const isInWishlist = wishlist.includes(product.id);
  const displayPrice = selectedVariant ? formatCurrency(selectedVariant.price) : formatCurrency(0);
  const isDisabled = !selectedVariant || selectedVariant.stock === 0;

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-300 pb-safe ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    } ${className}`}>
      <div className="neu-floating bg-background/95 backdrop-blur-md border-t border-neu-border">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Product Info */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden neu-surface flex-shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-neu-primary text-xs truncate break-words">
                  {product.title}
                </h3>
                <p className="text-primary font-bold text-base break-words">
                  {displayPrice}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {/* Quantity Selector */}
              <div className="flex items-center neu-surface rounded-lg flex-shrink-0">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={isDisabled || quantity <= 1}
                  className="p-1.5 hover:bg-neu-accent rounded-l-lg transition-colors disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-2 py-1.5 min-w-[2rem] text-center font-semibold text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={isDisabled || quantity >= (selectedVariant?.stock || 0)}
                  className="p-1.5 hover:bg-neu-accent rounded-r-lg transition-colors disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWishlistToggle}
                className="neu-surface p-2 flex-shrink-0"
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart 
                  size={16} 
                  className={`transition-colors ${
                    isInWishlist 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-neu-muted hover:text-red-500'
                  }`}
                />
              </Button>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={isDisabled}
                className="neu-button-enhanced px-3 sm:px-4 py-2 text-xs min-h-[40px] font-semibold disabled:opacity-50 flex-shrink-0"
                aria-label="Add to cart"
              >
                <ShoppingCart size={16} className="mr-1" />
                <span className="hidden xs:inline">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyAddToCart;