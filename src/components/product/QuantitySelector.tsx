import { Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity: number;
  disabled?: boolean;
}

export const QuantitySelector = ({
  quantity,
  onQuantityChange,
  maxQuantity,
  disabled = false
}: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const getRecommendationBadge = () => {
    if (quantity === 2) return "Popular choice";
    if (quantity >= 3) return "Great value";
    return null;
  };

  const recommendationText = getRecommendationBadge();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neu-primary">Quantity</h3>
        {recommendationText && (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            {recommendationText}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center neu-surface rounded-lg overflow-hidden">
          <button
            onClick={handleDecrease}
            disabled={disabled || quantity <= 1}
            className="neu-pressable p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-neu-accent active:scale-95"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          
          <div className="px-6 py-3 font-bold text-lg min-w-[60px] text-center bg-neu-bg">
            {quantity}
          </div>
          
          <button
            onClick={handleIncrease}
            disabled={disabled || quantity >= maxQuantity}
            className="neu-pressable p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-neu-accent active:scale-95"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="text-sm text-neu-muted">
          <span className="font-medium">{maxQuantity}</span> available
        </div>
      </div>

      {/* Bulk pricing hint */}
      {quantity >= 2 && (
        <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
          💡 You're saving more with multiple items!
        </div>
      )}
    </div>
  );
};