import { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import type { Product, Variant } from '@/types';

interface CartItemProps {
  productId: string;
  variantId: string;
  qty: number;
  product?: Product;
  variant?: Variant;
}

const CartItem = ({ productId, variantId, qty, product, variant }: CartItemProps) => {
  const { removeItem, updateQuantity } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle missing product or variant gracefully
  if (!product || !variant) {
    return (
      <div className="neu-surface p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <p className="text-neu-muted text-sm">Product unavailable</p>
          <button
            onClick={() => removeItem(productId, variantId)}
            className="neu-pressable p-2 text-red-500 rounded-lg"
            aria-label="Remove unavailable item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (newQty: number) => {
    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
      updateQuantity(productId, variantId, newQty);
    } finally {
      setIsUpdating(false);
    }
  };

  const isOutOfStock = qty > variant.stock;
  const canDecrease = qty > 1;
  const canIncrease = qty < variant.stock;

  return (
    <div className={`neu-surface p-3 sm:p-4 rounded-xl ${isUpdating ? 'opacity-70' : ''}`}>
      <div className="flex gap-3 sm:gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 neu-surface rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={product.images[0]} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base line-clamp-2 break-words">
            {product.title}
          </h3>
          <div className="text-xs sm:text-sm text-muted-foreground mb-2 break-words">
            {variant.size && `Size: ${variant.size}`}
            {variant.size && variant.color && ' • '}
            {variant.color && `Color: ${variant.color}`}
          </div>
          <p className="font-semibold text-foreground text-sm sm:text-base">
            {formatCurrency(variant.price)}
          </p>
          {isOutOfStock && (
            <p className="text-xs text-destructive mt-1">Out of stock</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 sm:mt-4 gap-3">
        <div className="flex items-center neu-surface rounded-lg">
          <button
            onClick={() => handleQuantityChange(qty - 1)}
            className="neu-pressable p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50"
            disabled={!canDecrease || isUpdating}
            aria-label="Decrease quantity"
          >
            <Minus size={16} className="sm:w-4 sm:h-4" />
          </button>
          <span className="px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base min-w-[3rem] text-center">
            {qty}
          </span>
          <button
            onClick={() => handleQuantityChange(qty + 1)}
            className="neu-pressable p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50"
            disabled={!canIncrease || isUpdating}
            aria-label="Increase quantity"
          >
            <Plus size={16} className="sm:w-4 sm:h-4" />
          </button>
        </div>

        <button
          onClick={() => removeItem(productId, variantId)}
          className="neu-pressable p-2 sm:p-3 text-destructive min-w-[44px] min-h-[44px] flex items-center justify-center"
          disabled={isUpdating}
          aria-label="Remove item from cart"
        >
          <Trash2 size={16} className="sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;