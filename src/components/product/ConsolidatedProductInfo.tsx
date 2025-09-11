import { Star, Shield, Truck, RotateCcw, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calculateDiscountPercentage, isOnSale, formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product, Variant } from '@/types';

interface ConsolidatedProductInfoProps {
  product: Product;
  selectedVariant: Variant | null;
  isWished: boolean;
  onToggleWishlist: () => void;
  availableSizes: string[];
  availableColors: string[];
  selectedSize?: string;
  selectedColor?: string;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  stock?: number;
  availableSizeVariants?: Set<string>;
  availableColorVariants?: Set<string>;
}

const colorMap: Record<string, string> = {
  'black': '#000000',
  'white': '#FFFFFF',
  'navy': '#1e3a8a',
  'blue': '#3b82f6',
  'red': '#dc2626',
  'green': '#16a34a',
  'yellow': '#eab308',
  'purple': '#9333ea',
  'pink': '#ec4899',
  'gray': '#6b7280',
  'brown': '#a3672a',
  'beige': '#d4c5a5',
  'nude': '#f5e6d3',
  'silver': '#c0c0c0',
  'gold': '#ffd700',
  'khaki': '#8b7355',
  'grey': '#6b7280',
};

export const ConsolidatedProductInfo = ({ 
  product, 
  selectedVariant, 
  isWished, 
  onToggleWishlist,
  availableSizes,
  availableColors,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
  stock = 0,
  availableSizeVariants = new Set(),
  availableColorVariants = new Set()
}: ConsolidatedProductInfoProps) => {
  const isMobile = useIsMobile();

  const getColorHex = (colorName: string): string => {
    return colorMap[colorName.toLowerCase()] || '#6b7280';
  };

  const isLowStock = stock > 0 && stock < 5;
  const isOutOfStock = stock === 0;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Header - Brand, Title, and Wishlist */}
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          {/* Brand */}
          {product.brand && (
            <span className="text-xs sm:text-sm font-medium text-neu-muted uppercase tracking-wide block">
              {product.brand}
            </span>
          )}
          
          {/* Title */}
          <h1 className={`text-lg sm:text-2xl lg:text-3xl font-bold text-neu-primary leading-tight break-words text-balance ${product.brand ? 'mt-1' : ''}`}>
            {product.title}
          </h1>
        </div>
        
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleWishlist}
          className={`neu-surface p-2 sm:p-2.5 lg:p-3 transition-all duration-200 hover:scale-110 ${
            isWished ? 'text-red-500' : 'text-neu-muted hover:text-red-500'
          } flex-shrink-0`}
        >
          <Heart 
            size={18} 
            className="sm:w-5 sm:h-5"
            fill={isWished ? 'currentColor' : 'none'}
          />
        </Button>
      </div>

      {/* Pricing */}
      {selectedVariant && (
        <div className="space-y-2 sm:space-y-3">
          {isOnSale(selectedVariant.comparePrice, selectedVariant.price) && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-red-500 text-white font-bold text-xs">
                SALE
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 text-xs">
                {calculateDiscountPercentage(selectedVariant.comparePrice!, selectedVariant.price)}% OFF
              </Badge>
            </div>
          )}
          
          <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neu-primary break-words">
              {formatCurrency(selectedVariant.price)}
            </span>
            {selectedVariant.comparePrice && (
              <span className="text-base sm:text-lg lg:text-xl text-muted-foreground line-through">
                {formatCurrency(selectedVariant.comparePrice)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {availableColors.length > 0 && (
        <div>
          <h3 className="font-semibold text-neu-primary text-sm sm:text-base mb-2 sm:mb-3">Color</h3>
          <div className="flex gap-2 flex-wrap">
            {availableColors.map((color) => {
              const colorHex = getColorHex(color);
              const isSelected = selectedColor === color;
              const isAvailable = availableColorVariants.has(color);
              
              return (
                <div key={color} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => isAvailable && onColorChange(color)}
                    disabled={!isAvailable}
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border-2 transition-all duration-200 ${
                      isAvailable 
                        ? 'hover:scale-110 hover:shadow-lg cursor-pointer' 
                        : 'opacity-40 cursor-not-allowed'
                    } ${
                      isSelected 
                        ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                        : 'border-neu-border hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: colorHex }}
                    aria-label={`${isAvailable ? 'Select' : 'Unavailable'} ${color} color`}
                    aria-pressed={isSelected}
                    aria-disabled={!isAvailable}
                  >
                    {/* White border for dark colors */}
                    {(['black', 'navy'].includes(color.toLowerCase())) && (
                      <div className="absolute inset-1 rounded-full border border-white/20" />
                    )}
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} bg-white rounded-full shadow-sm`} />
                      </div>
                    )}
                  </button>
                  
                  {!isMobile && (
                    <span className={`text-xs font-medium capitalize transition-colors ${
                      isSelected ? 'text-primary' : 'text-neu-muted'
                    }`}>
                      {color}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <div>
          <h3 className="font-semibold text-neu-primary text-sm sm:text-base mb-2 sm:mb-3">Size</h3>
          <div className="flex gap-2 flex-wrap">
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              const isAvailable = availableSizeVariants.has(size);
              
              return (
                <button
                  key={size}
                  onClick={() => isAvailable && onSizeChange(size)}
                  disabled={!isAvailable}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : isAvailable 
                        ? 'neu-surface hover:bg-neu-accent hover:shadow-md cursor-pointer'
                        : 'neu-surface opacity-40 cursor-not-allowed'
                  }`}
                  aria-pressed={isSelected}
                  aria-disabled={!isAvailable}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Status */}
      {isOutOfStock ? (
        <div className="flex items-center gap-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-xs sm:text-sm font-medium text-red-800 flex-1" aria-live="polite">
            Out of stock
          </div>
          <Badge variant="destructive" className="text-xs flex-shrink-0">
            Unavailable
          </Badge>
        </div>
      ) : isLowStock && (
        <div className="flex items-center gap-2 p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-xs sm:text-sm font-medium text-orange-800 flex-1" aria-live="polite">
            Only {stock} left in stock!
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs flex-shrink-0">
            Limited
          </Badge>
        </div>
      )}

      {/* Product Description - Responsive text clamping */}
      <div className="text-sm sm:text-base text-neu-muted">
        <p className="leading-relaxed line-clamp-2 sm:line-clamp-3 break-words">
          {product.description}
        </p>
      </div>

      {/* Trust Indicators - Responsive grid */}
      <div className="grid grid-cols-3 sm:grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:gap-3 lg:gap-0 p-2 sm:p-3 neu-surface rounded-lg">
          <div className="p-1 sm:p-2 lg:p-1 mx-auto sm:mx-0 lg:mx-auto mb-1 sm:mb-0 lg:mb-1 bg-primary/10 rounded-lg">
            <Truck size={14} className="sm:w-5 sm:h-5 lg:w-[14px] lg:h-[14px] text-primary" />
          </div>
          <div className="text-center sm:text-left lg:text-center">
            <div className="font-semibold text-xs sm:text-sm text-neu-primary">Free Delivery</div>
            <div className="text-xs text-neu-muted hidden sm:block lg:hidden">Orders over ₦100,000</div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:gap-3 lg:gap-0 p-2 sm:p-3 neu-surface rounded-lg">
          <div className="p-1 sm:p-2 lg:p-1 mx-auto sm:mx-0 lg:mx-auto mb-1 sm:mb-0 lg:mb-1 bg-green-100 rounded-lg">
            <RotateCcw size={14} className="sm:w-5 sm:h-5 lg:w-[14px] lg:h-[14px] text-green-600" />
          </div>
          <div className="text-center sm:text-left lg:text-center">
            <div className="font-semibold text-xs sm:text-sm text-neu-primary">Returns</div>
            <div className="text-xs text-neu-muted hidden sm:block lg:hidden">14-Days</div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:gap-3 lg:gap-0 p-2 sm:p-3 neu-surface rounded-lg">
          <div className="p-1 sm:p-2 lg:p-1 mx-auto sm:mx-0 lg:mx-auto mb-1 sm:mb-0 lg:mb-1 bg-blue-100 rounded-lg">
            <Shield size={14} className="sm:w-5 sm:h-5 lg:w-[14px] lg:h-[14px] text-blue-600" />
          </div>
          <div className="text-center sm:text-left lg:text-center">
            <div className="font-semibold text-xs sm:text-sm text-neu-primary">Authentic</div>
            <div className="text-xs text-neu-muted hidden sm:block lg:hidden">Genuine</div>
          </div>
        </div>
      </div>
    </div>
  );
};