import { useEffect } from 'react';
import { Check, Package, MapPin, Mail, Calendar, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/lib/store';
import { products } from '@/lib/products';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getEstimatedDelivery, calcShippingCost } from '@/lib/shipping';
import PageWithNavigation from '@/components/PageWithNavigation';

const OrderConfirmation = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    if (import.meta.env.DEV) console.log('🎉 Order Confirmation page mounted successfully!');
    if (import.meta.env.DEV) console.log('📦 Last order data:', lastOrder);
  }, []);

  const navigate = useNavigate();
  const { lastOrder } = useOrderStore();
  
  // Fallback data if no order found
  const orderNumber = lastOrder?.id || `SE${Date.now().toString().slice(-6)}`;
  const orderDate = lastOrder?.createdAt ? new Date(lastOrder.createdAt) : new Date();

  return (
    <PageWithNavigation fallbackRoute="/orders">
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 max-w-4xl">
        {/* Success Icon */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="neu-surface w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-500 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 px-4">Order placed successfully!</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Thank you for your purchase!</p>
        </div>

        {/* Order Details */}
        <div className="neu-surface p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Package size={18} className="text-muted-foreground sm:w-5 sm:h-5" />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-sm sm:text-base break-words">Order #{orderNumber}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Estimated delivery: {lastOrder?.shippingMethod ? getEstimatedDelivery(lastOrder.shippingMethod as 'standard' | 'express') : '3-5 business days'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar size={14} className="text-muted-foreground sm:w-4 sm:h-4" />
                <span className="text-muted-foreground">Order Date:</span>
              </div>
              <span className="font-medium break-words">{formatDate(orderDate)}</span>
            </div>
            
            {lastOrder?.address?.email && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mail size={14} className="text-muted-foreground sm:w-4 sm:h-4" />
                  <span className="text-muted-foreground">Confirmation sent to:</span>
                </div>
                <span className="font-medium break-all">{lastOrder.address.email}</span>
              </div>
            )}
            
            {lastOrder?.address?.phone && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-muted-foreground">Phone:</span>
                </div>
                <span className="font-medium">{lastOrder.address.phone}</span>
              </div>
            )}
            
            {lastOrder?.address && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin size={14} className="text-muted-foreground sm:w-4 sm:h-4 mt-0.5" />
                  <span className="text-muted-foreground">Shipping to:</span>
                </div>
                <div className="font-medium break-words leading-relaxed">
                  <div>{lastOrder.address.name}</div>
                  <div>{lastOrder.address.line1}</div>
                  <div>{lastOrder.address.city}, {lastOrder.address.postal}</div>
                  <div>{lastOrder.address.country}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {lastOrder?.items && lastOrder.items.length > 0 && (
          <div className="neu-surface p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Order Items</h3>
            <div className="space-y-3">
              {lastOrder.items.map((item) => {
                const product = products.find(p => p.id === item.productId);
                const variant = product?.variants.find(v => v.id === item.variantId);
                
                if (!product || !variant) return null;

                return (
                  <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg bg-muted/30">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm break-words line-clamp-2">{product.title}</h4>
                      <p className="text-xs text-muted-foreground break-words">
                        {variant.color && `${variant.color} • `}{variant.size} • Qty: {item.qty}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-medium text-xs sm:text-sm">{formatCurrency(variant.price * item.qty)}</div>
                    </div>
                  </div>
                );
              })}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold text-sm sm:text-base">
                  <span>Total</span>
                  <span>{formatCurrency(lastOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="neu-surface p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
          <h3 className="font-semibold mb-4 text-sm sm:text-base">What's Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div className="min-w-0">
                <p className="font-medium text-foreground text-xs sm:text-sm">Order Confirmation</p>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">You'll receive an email confirmation shortly with your order details.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div className="min-w-0">
                <p className="font-medium text-foreground text-xs sm:text-sm">Preparation</p>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">We'll prepare your items with care and attention to detail.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div className="min-w-0">
                <p className="font-medium text-foreground text-xs sm:text-sm">Shipping</p>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">You'll receive tracking information once your order ships.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <button 
            onClick={() => navigate('/product')}
            className="neu-button-primary w-full py-3 sm:py-4 text-sm sm:text-base font-medium touch-manipulation"
          >
            Continue Shopping
          </button>
          
          <button 
            onClick={() => navigate('/orders')}
            className="neu-button w-full py-3 sm:py-4 text-sm sm:text-base font-medium touch-manipulation"
          >
            View Orders
          </button>
        </div>

        {/* Support */}
        <div className="text-center mt-6 sm:mt-8 pt-6 border-t border-border">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 px-4">Need help with your order?</p>
          <button 
            onClick={() => navigate('/contact')}
            className="text-xs sm:text-sm font-medium hover:underline touch-manipulation py-2"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
    </PageWithNavigation>
  );
};

export default OrderConfirmation;