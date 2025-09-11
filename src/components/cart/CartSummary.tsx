import { formatCurrency } from '@/lib/utils';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingOption: string;
  freeShippingThreshold: number;
}

const CartSummary = ({ 
  subtotal, 
  shipping, 
  discount, 
  total, 
  shippingOption, 
  freeShippingThreshold 
}: CartSummaryProps) => {
  const isEligibleForFreeShipping = subtotal >= freeShippingThreshold;
  const amountForFreeShipping = freeShippingThreshold - subtotal;

  return (
    <div className="neu-surface p-3 sm:p-4 rounded-xl diagonal-watermark">
      <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Order Summary</h3>
      
      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-muted-foreground">
              Shipping ({shippingOption === 'express' ? 'Express 2-3 days' : 'Standard 5-7 days'})
            </span>
            {isEligibleForFreeShipping && (
              <span className="text-xs text-green-600 dark:text-green-400">Free shipping unlocked!</span>
            )}
          </div>
          <span className="font-medium">
            {shipping === 0 ? 'Free' : formatCurrency(shipping)}
          </span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        
        <div className="border-t border-border pt-2 sm:pt-3 flex justify-between items-center text-base sm:text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        
        {!isEligibleForFreeShipping && amountForFreeShipping > 0 && (
          <div className="text-xs sm:text-sm text-muted-foreground p-3 bg-card rounded-lg border border-primary/20 mt-3">
            💡 Spend {formatCurrency(amountForFreeShipping)} more for free standard shipping!
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSummary;