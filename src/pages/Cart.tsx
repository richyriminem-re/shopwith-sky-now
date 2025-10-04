import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useCheckoutStore } from '@/lib/store';
import { useProducts } from '@/hooks/useApi';
import { FREE_SHIPPING_THRESHOLD, calcShippingCost } from '@/lib/shipping';
import { formatCurrency } from '@/lib/utils';
import { calculateTotalDiscount } from '@/utils/promo';
import { useCartSync } from '@/hooks/useCartSync';
import { useCheckoutSync } from '@/hooks/useCheckoutSync';
import { useNavigationMonitor } from '@/utils/navigationMonitor';

import CartHeader from '@/components/cart/CartHeader';
import CartItem from '@/components/cart/CartItem';
import ShippingMethod from '@/components/cart/ShippingMethod';
import PromoCode from '@/components/cart/PromoCode';
import CartSummary from '@/components/cart/CartSummary';
import MultiTabSyncIndicator from '@/components/MultiTabSyncIndicator';
import MultiTabConflictDialog from '@/components/MultiTabConflictDialog';
import SEOHead from '@/components/SEOHead';
import { WhatsAppOrderButton } from '@/components/whatsapp/WhatsAppOrderButton';
import { Button } from '@/components/ui/button';
import PageWithNavigation from '@/components/PageWithNavigation';
import { ShoppingCart } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { items, getTotal } = useCartStore();
  const { 
    shippingOption, 
    setShippingOption,
    appliedPromoCodes,
    addPromoCode,
    removePromoCode,
    resetPromos
  } = useCheckoutStore();
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const { startNavigationTiming } = useNavigationMonitor();
  
  // Multi-tab synchronization
  const cartSync = useCartSync({
    autoSync: true,
    conflictResolution: 'manual',
    onConflict: (conflict) => {
      setShowConflictDialog(true);
    }
  });

  // Checkout synchronization for promo codes, shipping, etc.
  const checkoutSync = useCheckoutSync({
    autoSync: true,
    conflictResolution: 'last-write-wins',
    onConflict: (conflict) => {
      console.log('Checkout conflict detected:', conflict);
    }
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch products from API
  const { data: productsData } = useProducts();
  const products = productsData || [];

  // Memoize cart items to avoid recalculation on each render
  const cartItems = useMemo(() => {
    return items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const variant = product?.variants.find(v => v.id === item.variantId);
      return { ...item, product, variant };
    }).filter(item => item.product && item.variant);
  }, [items, products]);

  // Centralized pricing calculations using Nigerian system
  const pricing = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.variant?.price || 0) * item.qty;
    }, 0);
    
    const shipping = calcShippingCost(subtotal, shippingOption);
    const total = subtotal + shipping;
    
    return {
      subtotal,
      shipping,
      total,
      itemCount: cartItems.reduce((total, item) => total + item.qty, 0)
    };
  }, [cartItems, shippingOption]);

  // Calculate dynamic discount based on applied promo codes
  const discount = calculateTotalDiscount(appliedPromoCodes, pricing.subtotal, pricing.shipping);
  const total = Math.max(0, pricing.total - discount);

  const handleApplyCode = (code: string) => {
    addPromoCode(code);
  };

  const handleRemoveCode = (code: string) => {
    removePromoCode(code);
  };

  const handleCheckout = async () => {
    // Prevent duplicate checkouts across tabs
    const canProceed = await cartSync.preventDuplicateCheckout();
    if (canProceed) {
      startNavigationTiming();
      navigate('/checkout');
    }
  };

  const handleResolveConflict = (conflictId: string, strategy: string) => {
    const resolved = cartSync.resolveConflict(conflictId, strategy);
    if (resolved) {
      setShowConflictDialog(false);
    }
  };

  const handleResolveAllConflicts = (strategy: string) => {
    cartSync.clearConflicts();
    setShowConflictDialog(false);
  };

  // Reset promo codes when cart becomes empty
  useEffect(() => {
    if (items.length === 0 && appliedPromoCodes.length > 0) {
      resetPromos();
    }
  }, [items.length, appliedPromoCodes.length, resetPromos]);

  if (items.length === 0) {
    return (
      <>
        <SEOHead 
          title="Shopping Cart - Shop With Sky"
          description="Review your selected items and proceed to secure checkout. Free shipping on orders over ₦50,000."
          keywords="shopping cart, checkout, online shopping, shop with sky"
          type="website"
        />
        
        <div className="pb-20 min-h-screen">
        <div className="px-2 sm:px-4">
          <div className="neu-surface p-6 sm:p-8 text-center rounded-xl">
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">Your cart is empty</p>
            <button 
              onClick={() => {
                startNavigationTiming();
                navigate('/product');
              }}
              className="neu-pressable w-full sm:w-auto min-h-[44px] px-6 font-medium"
            >
              Start Shopping
            </button>
          </div>
        </div>
        </div>
      </>
    );
  }

  return (
    <PageWithNavigation fallbackRoute="/product">
      <SEOHead 
        title="Shopping Cart - Shop With Sky"
        description="Review your selected items and proceed to secure checkout. Free shipping on orders over ₦50,000."
        keywords="shopping cart, checkout, online shopping, shop with sky"
        type="website"
      />
      
      <main className="pb-20 min-h-screen">
      
      {/* Cart Header */}
      <CartHeader
        syncStatus={cartSync.syncStatus.syncStatus}
        isLeader={cartSync.syncStatus.isLeader}
        activeTabs={cartSync.syncStatus.activeTabs}
        conflictCount={cartSync.syncStatus.conflicts.length}
        onForceSync={() => cartSync.forceSync()}
        onResolveConflicts={() => setShowConflictDialog(true)}
      />
      
      {/* Cart Items */}
      <div className="px-2 sm:px-4 space-y-3 sm:space-y-4 mb-6">
        {cartItems.map(({ productId, variantId, qty, product, variant }) => (
          <CartItem
            key={`${productId}-${variantId}`}
            productId={productId}
            variantId={variantId}
            qty={qty}
            product={product}
            variant={variant}
          />
        ))}
      </div>

      {/* Shipping Method */}
      <div className="px-2 sm:px-4 mb-4 sm:mb-6">
        <ShippingMethod
          shippingOption={shippingOption}
          onShippingChange={setShippingOption}
          subtotal={pricing.subtotal}
        />
      </div>

      {/* Promo Code */}
      <div className="px-2 sm:px-4 mb-4 sm:mb-6">
        <PromoCode
          onApplyCode={handleApplyCode}
          onRemoveCode={handleRemoveCode}
          subtotal={pricing.subtotal}
          shipping={pricing.shipping}
          appliedCodes={appliedPromoCodes}
        />
      </div>

      {/* Order Summary */}
      <div className="px-2 sm:px-4 mb-4 sm:mb-6">
        <CartSummary
          subtotal={pricing.subtotal}
          shipping={pricing.shipping}
          discount={discount}
          total={total}
          shippingOption={shippingOption}
          freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
        />
      </div>

      {/* Checkout Option */}
      <div className="px-2 sm:px-4 pb-4 sm:pb-6">
        <div className="text-center">
          <Button 
            onClick={() => {
              startNavigationTiming();
              navigate('/checkout-hybrid');
            }}
            className="w-full min-h-[48px] sm:min-h-[52px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Proceed to Checkout
          </Button>
        </div>
      </div>

      {/* Multi-tab conflict resolution dialog */}
      <MultiTabConflictDialog
        conflicts={cartSync.syncStatus.conflicts}
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        onResolve={handleResolveConflict}
        onResolveAll={handleResolveAllConflicts}
      />
      </main>
    </PageWithNavigation>
  );
};

export default Cart;