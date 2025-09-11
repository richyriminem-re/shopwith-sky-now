import { Plus, Minus, ShoppingBag, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Variant } from '@/types';

interface CompactPurchasePanelProps {
  selectedVariant: Variant | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
}

export const CompactPurchasePanel = ({
  selectedVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  disabled = false
}: CompactPurchasePanelProps) => {
  const isMobile = useIsMobile();

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      onQuantityChange(quantity + 1);
    }
  };

  const getRecommendationBadge = () => {
    if (quantity === 2) return "Popular choice";
    if (quantity >= 3) return "Great value";
    return null;
  };

  const recommendationText = getRecommendationBadge();
  const maxQuantity = selectedVariant?.stock || 0;

  return (
    <div className="space-y-4">
      {/* Quantity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-neu-primary text-sm sm:text-base">Quantity</h3>
          {recommendationText && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {recommendationText}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
          {/* Quantity Selector */}
          <div className="flex items-center neu-surface rounded-lg overflow-hidden">
            <button
              onClick={handleDecrease}
              disabled={disabled || quantity <= 1}
              className="neu-pressable p-2 sm:p-2.5 lg:p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-neu-accent active:scale-95"
              aria-label="Decrease quantity"
            >
              <Minus size={14} className="sm:w-4 sm:h-4" />
            </button>
            
            <div className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 font-bold text-base sm:text-lg min-w-[50px] sm:min-w-[60px] text-center bg-neu-bg">
              {quantity}
            </div>
            
            <button
              onClick={handleIncrease}
              disabled={disabled || quantity >= maxQuantity}
              className="neu-pressable p-2 sm:p-2.5 lg:p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-neu-accent active:scale-95"
              aria-label="Increase quantity"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
          
          {/* Stock Info */}
          <div className="text-xs sm:text-sm text-neu-muted flex-shrink-0">
            <span className="font-medium">{maxQuantity}</span> available
          </div>
        </div>

        {/* Bulk pricing hint */}
        {quantity >= 2 && (
          <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg p-2" aria-live="polite">
            💡 You're saving more with multiple items!
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 sm:space-y-3">
        <button
          onClick={onAddToCart}
          disabled={disabled}
          className="neu-button-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] h-12 sm:h-13 lg:h-14 text-base sm:text-lg font-semibold"
        >
          <ShoppingBag size={18} className="sm:w-5 sm:h-5 lg:w-[22px] lg:h-[22px]" />
          <span>Add to Cart</span>
        </button>
        
        <button
          onClick={onBuyNow}
          disabled={disabled}
          className="neu-button w-full flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] h-12 sm:h-13 lg:h-14 text-base sm:text-lg font-semibold"
        >
          <Zap size={18} className="sm:w-5 sm:h-5 lg:w-[22px] lg:h-[22px]" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};