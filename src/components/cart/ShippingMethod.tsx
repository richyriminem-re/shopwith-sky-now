import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { getShippingMethods, getFreeShippingThreshold, type ShippingMethod as ShippingMethodType } from '@/lib/shipping';

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
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodType[]>([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(100000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShippingData = async () => {
      try {
        const [methods, threshold] = await Promise.all([
          getShippingMethods(),
          getFreeShippingThreshold()
        ]);
        setShippingMethods(methods);
        setFreeShippingThreshold(threshold);
      } catch (error) {
        console.error('Error loading shipping data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadShippingData();
  }, []);

  const isEligibleForFreeShipping = subtotal >= freeShippingThreshold;

  // Auto-select first shipping method when loaded if no valid selection
  useEffect(() => {
    if (shippingMethods.length > 0 && !loading) {
      const validMethodIds = shippingMethods.map(m => m.name.toLowerCase().replace(/\s+/g, '-'));
      const hasValidSelection = validMethodIds.includes(shippingOption) || shippingOption === 'free';
      
      if (!hasValidSelection) {
        // Select first method by default
        const firstMethodId = shippingMethods[0].name.toLowerCase().replace(/\s+/g, '-');
        onShippingChange(firstMethodId);
      }
    }
  }, [shippingMethods, loading, shippingOption, onShippingChange]);

  // Auto-select free shipping when eligible, or revert when not eligible
  useEffect(() => {
    if (isEligibleForFreeShipping && shippingOption !== 'free') {
      onShippingChange('free');
    } else if (!isEligibleForFreeShipping && shippingOption === 'free' && shippingMethods.length > 0) {
      // Revert to first paid shipping method when no longer eligible
      const firstMethodId = shippingMethods[0].name.toLowerCase().replace(/\s+/g, '-');
      onShippingChange(firstMethodId);
    }
  }, [isEligibleForFreeShipping, shippingOption, shippingMethods, onShippingChange]);

  if (loading) {
    return (
      <div className="neu-surface p-3 sm:p-4 rounded-xl">
        <h3 className="font-semibold mb-3 text-sm sm:text-base">Shipping Method</h3>
        <div className="text-sm text-muted-foreground">Loading shipping options...</div>
      </div>
    );
  }

  return (
    <div className="neu-surface p-3 sm:p-4 rounded-xl">
      <h3 className="font-semibold mb-3 text-sm sm:text-base">Shipping Method</h3>
      
      {isEligibleForFreeShipping ? (
        <div className="space-y-3">
          <div className="neu-pressable flex items-center justify-between p-3 rounded-lg ring-2 ring-primary bg-primary/5">
            <div>
              <div className="font-medium text-sm sm:text-base text-primary">🎉 Free Shipping</div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {shippingMethods[0]?.estimated_delivery || '5-7 business days'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm sm:text-base text-primary">Free</span>
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            🎉 Congratulations! You've unlocked free shipping by spending over {formatCurrency(freeShippingThreshold)}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shippingMethods.map((method) => {
            const cost = subtotal >= freeShippingThreshold ? 0 : method.cost;
            const methodId = method.name.toLowerCase().replace(/\s+/g, '-');
            
            return (
              <label 
                key={method.id}
                className={`neu-pressable flex items-center justify-between p-3 cursor-pointer rounded-lg transition-all ${
                  shippingOption === methodId ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-sm sm:text-base">{method.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{method.estimated_delivery}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm sm:text-base">
                    {cost === 0 ? 'Free' : formatCurrency(cost)}
                  </span>
                  <input
                    type="radio"
                    name="shipping"
                    value={methodId}
                    checked={shippingOption === methodId}
                    onChange={(e) => onShippingChange(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-border focus:ring-primary"
                  />
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShippingMethod;