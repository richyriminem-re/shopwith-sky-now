import { formatCurrency } from '@/lib/utils';
import { STANDARD_DELIVERY, EXPRESS_DELIVERY, calcShippingCost, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

interface ShippingMethodProps {
  shippingOption: string;
  onShippingChange: (option: string) => void;
  subtotal: number;
}

const ShippingMethod = ({ 
  shippingOption, 
  onShippingChange, 
  subtotal
}: ShippingMethodProps) => {
  const isEligibleForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const standardCost = calcShippingCost(subtotal, 'standard');
  const expressCost = calcShippingCost(subtotal, 'express');

  // Auto-select free shipping when eligible
  if (isEligibleForFreeShipping && shippingOption !== 'free') {
    onShippingChange('free');
  }

  return (
    <div className="neu-surface p-3 sm:p-4 rounded-xl">
      <h3 className="font-semibold mb-3 text-sm sm:text-base">Shipping Method</h3>
      
      {isEligibleForFreeShipping ? (
        <div className="space-y-3">
          <div className="neu-pressable flex items-center justify-between p-3 rounded-lg ring-2 ring-primary bg-primary/5">
            <div>
              <div className="font-medium text-sm sm:text-base text-primary">🎉 Free Shipping</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{STANDARD_DELIVERY}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm sm:text-base text-primary">Free</span>
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            🎉 Congratulations! You've unlocked free shipping by spending over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <label className={`neu-pressable flex items-center justify-between p-3 cursor-pointer rounded-lg transition-all ${
            shippingOption === 'standard' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}>
            <div>
              <div className="font-medium text-sm sm:text-base">Standard Shipping</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{STANDARD_DELIVERY}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm sm:text-base">
                {standardCost === 0 ? 'Free' : formatCurrency(standardCost)}
              </span>
              <input
                type="radio"
                name="shipping"
                value="standard"
                checked={shippingOption === 'standard'}
                onChange={(e) => onShippingChange(e.target.value)}
                className="w-4 h-4 text-primary bg-background border-border focus:ring-primary"
              />
            </div>
          </label>
          
          <label className={`neu-pressable flex items-center justify-between p-3 cursor-pointer rounded-lg transition-all ${
            shippingOption === 'express' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}>
            <div>
              <div className="font-medium text-sm sm:text-base">Express Shipping</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{EXPRESS_DELIVERY}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm sm:text-base">
                {expressCost === 0 ? 'Free' : formatCurrency(expressCost)}
              </span>
              <input
                type="radio"
                name="shipping"
                value="express"
                checked={shippingOption === 'express'}
                onChange={(e) => onShippingChange(e.target.value)}
                className="w-4 h-4 text-primary bg-background border-border focus:ring-primary"
              />
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default ShippingMethod;