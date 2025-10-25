import { formatCurrency, formatDate } from '@/lib/utils';
import { forwardRef, useState, useEffect } from 'react';
import { Watermark } from '@/components/ui/Watermark';
import { getShippingMethods } from '@/lib/shipping';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface OrderSummaryMiniProps {
  subtotal: number;
  shipping: number;
  total: number;
  discount?: number;
  appliedPromoCodes?: string[];
  orderReference?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  };
  items?: Array<{
    productId: string;
    variantId: string;
    qty: number;
    title?: string;
    price?: number;
    color?: string;
    size?: string;
    image?: string;
  }>;
  shippingOption?: string;
  className?: string;
}

export const OrderSummaryMini = forwardRef<HTMLDivElement, OrderSummaryMiniProps>(({
  subtotal,
  shipping,
  total,
  discount = 0,
  appliedPromoCodes = [],
  orderReference,
  customerInfo,
  items = [],
  shippingOption = 'standard',
  className = ""
}, ref) => {
  const currentDate = new Date();
  const { settings } = useSiteSettings();
  const [shippingMethodName, setShippingMethodName] = useState('Standard Shipping');
  const [shippingMethodDelivery, setShippingMethodDelivery] = useState('');
  
  const receiptLogoUrl = settings.receipt_logo_url;

  useEffect(() => {
    const loadShippingMethod = async () => {
      const methods = await getShippingMethods();
      const selectedMethod = methods.find(
        m => m.name.toLowerCase().replace(/\s+/g, '-') === shippingOption
      );
      if (selectedMethod) {
        setShippingMethodName(selectedMethod.name);
        setShippingMethodDelivery(selectedMethod.estimated_delivery);
      }
    };
    loadShippingMethod();
  }, [shippingOption]);

  return (
    <div ref={ref} className={`neu-surface border border-border rounded-xl overflow-hidden shadow-lg bg-card relative ${className}`}>
      <Watermark />
      {/* Receipt Header */}
      {orderReference && (
        <div className="text-center py-6 px-4 border-b border-border bg-gradient-to-b from-background to-muted/20 relative z-10">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={receiptLogoUrl}
              alt="" 
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Order Receipt</h2>
          
          <div className="bg-card border border-primary/30 rounded-lg p-3 mb-4 shadow-sm max-w-xs mx-auto">
            <div className="text-xs font-medium text-muted-foreground mb-1">Order Reference</div>
            <div className="text-sm font-bold text-primary tracking-wider">{orderReference}</div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Generated on {formatDate(currentDate)}
          </p>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-4 relative z-10">
        {/* Customer Information */}
        {customerInfo && (
          <>
            <div className="space-y-3">
              <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span>Customer Details</span>
              </h3>
              
              <div className="space-y-2 text-xs sm:text-sm">
                {customerInfo.name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-right flex-1 ml-2">{customerInfo.name}</span>
                  </div>
                )}
                {customerInfo.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-right flex-1 ml-2 break-words">{customerInfo.email}</span>
                  </div>
                )}
                {customerInfo.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-right flex-1 ml-2">{customerInfo.phone}</span>
                  </div>
                )}
                {customerInfo.address && (
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="text-right flex-1 ml-2 leading-relaxed">{customerInfo.address}</span>
                  </div>
                )}
                {customerInfo.notes && (
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Notes:</span>
                    <span className="text-right flex-1 ml-2 leading-relaxed">{customerInfo.notes}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-border my-4"></div>
          </>
        )}

        {/* Order Items */}
        {items.length > 0 && (
          <>
            <div className="space-y-3">
              <h3 className="font-semibold text-sm sm:text-base">
                Order Items ({items.length})
              </h3>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.title || 'Product'}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm">{item.title}</h4>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {item.color && <p>Color: {item.color}</p>}
                        {item.size && <p>Size: {item.size}</p>}
                        <p>Qty: {item.qty}</p>
                      </div>
                    </div>
                    <p className="font-medium text-xs sm:text-sm flex-shrink-0">
                      {formatCurrency((item.price || 0) * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-border my-4"></div>
          </>
        )}

        {/* Order Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm sm:text-base">Order Summary</h3>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium" aria-live="polite">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-muted-foreground">
                  {shipping === 0 ? '🎉 Free Shipping' : shippingMethodName}
                </span>
                {shippingMethodDelivery && shipping > 0 && (
                  <span className="text-xs text-muted-foreground/70">{shippingMethodDelivery}</span>
                )}
              </div>
              <span className="font-medium" aria-live="polite">
                {shipping === 0 ? 'Free' : formatCurrency(shipping)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-primary">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium" aria-live="polite">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between items-center font-semibold text-sm sm:text-base">
              <span>Total</span>
              <span className="text-primary" aria-live="polite">{formatCurrency(total)}</span>
            </div>
          </div>
          
          {/* Applied Promo Codes */}
          {appliedPromoCodes.length > 0 && (
            <div className="pt-2 border-t border-border">
              <h4 className="text-xs text-muted-foreground mb-2">Applied Codes:</h4>
              <div className="flex flex-wrap gap-1">
                {appliedPromoCodes.map((code) => (
                  <span 
                    key={code}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Receipt Footer */}
        {orderReference && (
          <div className="border-t border-border pt-4 mt-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Thank You For Shopping With Us<br />
              We value your trust and look forward to serving you again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

OrderSummaryMini.displayName = 'OrderSummaryMini';