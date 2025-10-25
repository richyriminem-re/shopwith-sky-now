import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Check, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore, useCheckoutStore, useOrderStore } from '@/lib/store';
import { products } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useNavigationGuard, useUnsavedChangesGuard } from '@/hooks/useNavigationGuard';
import { useCheckoutPreloading } from '@/hooks/useDeepPagePreloading';
import { formatCurrency } from '@/lib/utils';
import SEOHead from '@/components/SEOHead';
import PageWithNavigation from '@/components/PageWithNavigation';
import BackButton from '@/components/ui/BackButton';
import { getShippingMethods, getFreeShippingThreshold, getEstimatedDelivery, STANDARD_SHIPPING, EXPRESS_SHIPPING } from '@/lib/shipping';
import { useShippingSettings } from '@/hooks/useShippingSettings';
import { usePromoSettings } from '@/hooks/usePromoSettings';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/checkout/PhoneInput';
import { CitySelect } from '@/components/checkout/CitySelect';
import ShippingMethodComponent from '@/components/cart/ShippingMethod';
import { OrderSummaryMini } from '@/components/checkout/OrderSummaryMini';
import { useSiteSettings } from '@/hooks/useSiteSettings';

import { CheckoutErrorBoundary } from '@/components/checkout/ErrorBoundary';
import type { Address, ShippingMethod } from '@/types';

// Address validation schema with shipping method validation
const addressSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+234\d{10}$/, 'Please enter a valid Nigerian phone number'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'State/City is required'),
  line1: z.string().min(1, 'Address is required'),
  postal: z.string().optional(),
});

// Shipping validation function
const validateShipping = (shippingOption: ShippingMethod | null): boolean => {
  return shippingOption === 'standard' || shippingOption === 'express';
};

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(100000);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const { settings, loading: settingsLoading } = useSiteSettings();

  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotal, updateQuantity, removeItem, clearCart } = useCartStore();
  const { 
    currentStep, 
    address, 
    shippingOption, 
    setCurrentStep, 
    setAddress, 
    setShippingOption,
    resetCheckout,
    startNewCheckout
  } = useCheckoutStore();
  const { setLastOrder } = useOrderStore();
  
  // Load shipping and promo settings from database
  useShippingSettings();
  usePromoSettings();

  // Fetch shipping methods and threshold
  useEffect(() => {
    const loadShippingData = async () => {
      const [methods, threshold] = await Promise.all([
        getShippingMethods(),
        getFreeShippingThreshold()
      ]);
      setShippingMethods(methods);
      setFreeShippingThreshold(threshold);
    };
    loadShippingData();
  }, []);

  // Deep page preloading for likely parent and fallback routes
  useCheckoutPreloading();

  // Navigation guard - redirect to cart if no items
  useNavigationGuard({
    requiresCart: true, 
    redirectTo: '/cart' 
  });

  // Scroll to top and initialize checkout on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    // Initialize checkout step without resetting shipping option
    if (items.length > 0) {
      setCurrentStep('address');
    }
  }, []); // Only run once on mount

  // Form setup
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: address?.name || '',
      email: address?.email || '',
      phone: address?.phone || '',
      country: address?.country || 'Nigeria',
      city: address?.city || '',
      line1: address?.line1 || '',
      postal: address?.postal || '',
    },
  });

  // Form persistence with unsaved changes guard
  const { clearSavedData } = useFormPersistence({
    storageKey: 'checkout-form-draft',
    watch: Object.keys(form.getValues()),
    form,
    enabled: currentStep === 'address'
  });

  // Guard against unsaved changes
  const formHasChanges = form.formState.isDirty;
  useUnsavedChangesGuard(
    formHasChanges && currentStep === 'address',
    'You have unsaved address information. Are you sure you want to leave?'
  );

  // Centralized pricing calculations using Nigerian shipping
  const pricing = useMemo(() => {
    const subtotal = items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      const variant = product?.variants.find(v => v.id === item.variantId);
      return total + (variant?.price || 0) * item.qty;
    }, 0);
    
    // Calculate shipping based on selected method from database
    let shipping = 0;
    if (subtotal >= freeShippingThreshold) {
      shipping = 0;
    } else {
      const selectedMethod = shippingMethods.find(
        m => m.name.toLowerCase().replace(/\s+/g, '-') === shippingOption
      );
      shipping = selectedMethod ? selectedMethod.cost : 0;
    }
    const total = subtotal + shipping;
    
    return { subtotal, shipping, total };
  }, [items, shippingOption, freeShippingThreshold, shippingMethods]);
  
  const { subtotal, shipping: shippingCost, total } = pricing;

  const steps = [
    { id: 'address' as const, label: 'Address', completed: currentStep === 'review' },
    { id: 'review' as const, label: 'Review', completed: false },
  ];

  // Handle step navigation
  const handleNext = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Prevent double submission
    if (isLoading) return;
    
    if (currentStep === 'address') {
      setIsLoading(true);
      setFormErrors([]);
      
      try {
        const isValid = await form.trigger();
        if (!isValid) {
          setFormErrors(['Please fill in all required fields correctly.']);
          setIsLoading(false);
          return;
        }

        // Validate shipping method selection
        if (!validateShipping(shippingOption)) {
          setFormErrors(['Please select a shipping method.']);
          setIsLoading(false);
          return;
        }

        const formData = form.getValues();
        setAddress(formData);
        setCurrentStep('review');
      } catch (error) {
        console.error('Form validation error:', error);
        setFormErrors(['An error occurred while validating the form.']);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePlaceOrder = async () => {
    // Prevent double submission
    if (isLoading) return;
    
    if (import.meta.env.DEV) console.log('🚀 Starting order placement process');
    setIsLoading(true);
    
    try {
      if (import.meta.env.DEV) console.log('✅ Order placement - validating address:', address);
      
      // Validate address is complete
      if (!address.name || !address.email || !address.phone || !address.line1 || !address.city) {
        console.error('❌ Address validation failed:', { address });
        throw new Error('Missing required address information');
      }

      // Validate shipping method
      if (!validateShipping(shippingOption)) {
        throw new Error('Please select a valid shipping method');
      }

      console.log('✅ Address validation passed');

      // Generate order with collision-resistant ID
      const timestamp = Date.now().toString();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const orderId = `SE-${timestamp.slice(-6)}-${randomSuffix.toUpperCase()}`;
      
      console.log('✅ Generated order ID:', orderId);
      
      // Recompute totals for safety using Nigerian calculations
      const subtotal = items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === item.variantId);
        return total + (variant?.price || 0) * item.qty;
      }, 0);
      
      // Calculate shipping based on selected method from database
      let shipping = 0;
      if (subtotal >= freeShippingThreshold) {
        shipping = 0;
      } else {
        const selectedMethod = shippingMethods.find(
          m => m.name.toLowerCase().replace(/\s+/g, '-') === shippingOption
        );
        shipping = selectedMethod ? selectedMethod.cost : 0;
      }
      
      const finalPricing = { subtotal, shipping, total: subtotal + shipping };
      
      if (import.meta.env.DEV) console.log('✅ Calculated pricing:', finalPricing);
      
      const order = {
        id: orderId,
        items: [...items],
        total: finalPricing.total,
        shippingMethod: shippingOption,
        status: 'processing' as const,
        address: address as Address,
        createdAt: new Date().toISOString(),
        statusUpdatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'pending' as const,
            timestamp: new Date().toISOString(),
            note: 'Order placed successfully'
          },
          {
            status: 'processing' as const,
            timestamp: new Date().toISOString(),
            note: 'Payment confirmed, order processing'
          }
        ]
      };

      if (import.meta.env.DEV) console.log('✅ Created order object:', order);

      if (import.meta.env.DEV) console.log('🔄 Updating store with order...');
      setLastOrder(order);
      
      if (import.meta.env.DEV) console.log('🔄 Clearing cart...');
      clearCart();
      
      if (import.meta.env.DEV) console.log('🔄 Resetting checkout...');
      resetCheckout();
      
      if (import.meta.env.DEV) console.log('🔄 Clearing saved form data...');
      clearSavedData(); // Clear form persistence
      
      if (import.meta.env.DEV) console.log('✅ Store updates complete, showing success toast');
      
      toast({
        title: "Order placed successfully!",
        description: `Order #${orderId} has been confirmed.`,
      });
      
      console.log('🔄 Navigating to order confirmation page...');
      
      // Enhanced navigation with multiple fallbacks
      try {
        navigate('/order-confirmation', { replace: true });
        console.log('✅ Navigation initiated successfully');
        
        // Fallback navigation after a delay
        setTimeout(() => {
          if (window.location.pathname !== '/order-confirmation') {
            console.warn('⚠️ Navigation fallback triggered');
            navigate('/order-confirmation', { replace: true });
          }
        }, 1000);
        
      } catch (navError) {
        if (import.meta.env.DEV) console.error('❌ React Router navigation failed:', navError);
        if (import.meta.env.DEV) console.log('🔄 Using fallback navigation...');
        navigate('/order-confirmation', { replace: true });
      }
      
    } catch (error) {
      console.error('❌ Order placement error:', error);
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      if (import.meta.env.DEV) console.log('🏁 Order placement process completed');
    }
  };

  // Handle quantity updates with stock validation
  const handleQuantityChange = (productId: string, variantId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(productId, variantId);
      return;
    }

    // Check stock availability
    const product = products.find(p => p.id === productId);
    const variant = product?.variants.find(v => v.id === variantId);
    
    if (variant && newQty > variant.stock) {
      toast({
        title: "Not enough stock",
        description: `Only ${variant.stock} items available`,
        variant: "destructive"
      });
      updateQuantity(productId, variantId, variant.stock);
    } else {
      updateQuantity(productId, variantId, newQty);
    }
  };

  // Early return if no items - navigation guard handles redirect
  if (items.length === 0) {
    return null; // Don't render anything while redirecting
  };

  return (
    <PageWithNavigation fallbackRoute="/cart">
      <SEOHead 
        title="Secure Checkout - Shop With Sky"
        description="Complete your purchase securely. Multiple payment options available with fast shipping across Nigeria."
        keywords="secure checkout, payment, delivery, shop with sky, online shopping"
        type="website"
      />
      
      <CheckoutErrorBoundary>
      <div className="pb-20 min-h-screen">
        {/* Page Heading */}
        <div className="px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 pt-3 xs:pt-4 sm:pt-6 pb-2 xs:pb-3 sm:pb-4 w-full max-w-7xl mx-auto">
          <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 xs:gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-start xs:justify-between mb-2 xs:mb-3 sm:mb-4">
                <BackButton 
                  fallback="/cart"
                  text="Back"
                  breadcrumbHints={['Cart', 'Checkout']}
                  variant="default"
                  size="default"
                  onError={(error) => {
                    console.error('Navigation error in checkout:', error);
                  }}
                />
              </div>
            </div>
            <div className="flex-shrink-0 self-center xs:self-start order-first xs:order-last">
              {!settingsLoading && settings.checkout_logo_url && (
                <img 
                  src={settings.checkout_logo_url} 
                  alt={settings.site_name || "Logo"} 
                  className="h-8 xs:h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[120px] xs:max-w-[140px] sm:max-w-[160px] md:max-w-[180px] object-contain mx-auto xs:mx-0"
                />
              )}
            </div>
          </div>
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center break-words leading-tight mt-2 xs:mt-0 w-full">
            Checkout
          </h1>
        </div>

        {/* Steps Progress */}
        <div className="px-3 sm:px-4 lg:px-6 mb-4 sm:mb-6">
          <div className="neu-surface p-3 sm:p-4 rounded-xl">
            <div className="flex items-center justify-center sm:justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col sm:flex-row items-center">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 ${
                      step.completed 
                        ? 'neu-button-primary' 
                        : step.id === currentStep 
                          ? 'neu-pressable active' 
                          : 'neu-surface'
                    }`}>
                      {step.completed ? <Check size={14} className="sm:w-4 sm:h-4" /> : index + 1}
                    </div>
                    <span className="mt-1 sm:mt-0 sm:ml-2 text-xs sm:text-sm font-medium text-center sm:text-left">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-4 sm:w-8 h-0.5 bg-border mx-2 sm:mx-3 hidden sm:block" />
                  )}
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-4 bg-border mx-2 sm:hidden" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Step Content */}
      <div className="px-3 sm:px-4 lg:px-6 mb-4 sm:mb-6">
        {currentStep === 'address' && (
          <div className="neu-surface p-3 sm:p-4 lg:p-6 rounded-xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Shipping Address</h2>
            <Form {...form}>
              <form onSubmit={handleNext} className="space-y-3 sm:space-y-4" id="address-form">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name"
                          className="neu-input"
                          style={{ textTransform: 'capitalize' }}
                          {...field}
                          onBlur={(e) => {
                            const value = e.target.value.trim();
                            const words = value.split(/\s+/).filter(Boolean);
                            const capitalized = words.map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            ).join(' ');
                            field.onChange(capitalized);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter your email"
                          className="neu-input"
                          {...field}
                          onBlur={(e) => field.onChange(e.target.value.trim().toLowerCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.phone?.message}
                    />
                  )}
                />

                {/* Country - Fixed to Nigeria */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <div>
                          <div className="neu-input bg-muted text-muted-foreground px-3 py-2 rounded-md">
                            Nigeria
                          </div>
                          <input type="hidden" {...field} value="Nigeria" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State/City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <CitySelect
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.city?.message}
                    />
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Street address, building number"
                          className="neu-input"
                          {...field}
                          onBlur={(e) => field.onChange(e.target.value.trim())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {/* Postal Code (Optional) */}
                <FormField
                  control={form.control}
                  name="postal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Postal code"
                          className="neu-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </form>
            </Form>
            
            {/* Shipping Method Selection */}
            <div className="mt-4 sm:mt-6">
              <ShippingMethodComponent
                shippingOption={shippingOption}
                onShippingChange={setShippingOption}
                subtotal={subtotal}
              />
            </div>

            {/* Real-time Order Summary */}
            <div className="mt-4 sm:mt-6">
              <OrderSummaryMini
                subtotal={subtotal}
                shipping={shippingCost}
                total={total}
              />
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Cart Items */}
            <div className="neu-surface p-3 sm:p-4 lg:p-6 rounded-xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Order Items</h2>
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  const variant = product?.variants.find(v => v.id === item.variantId);
                  
                  if (!product || !variant) return null;

                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-lg border">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-lg flex-shrink-0 self-center sm:self-auto"
                      />
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <h3 className="font-medium text-sm sm:text-base line-clamp-2 sm:truncate">{product.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {variant.color && `${variant.color} • `}{variant.size}
                        </p>
                      </div>
                       <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-2 sm:gap-3">
                         <div className="flex items-center gap-2 sm:order-2">
                           <div className="flex items-center neu-surface rounded-lg px-3 py-1.5">
                             <span className="text-sm text-muted-foreground mr-2">Qty:</span>
                             <span className="font-medium">{item.qty}</span>
                           </div>
                         </div>
                        <div className="flex items-center gap-2 sm:order-1">
                          <div className="font-semibold text-sm sm:text-base">{formatCurrency(variant.price * item.qty)}</div>
                          <button 
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="text-destructive hover:text-destructive/80 p-1.5 sm:p-2 touch-manipulation"
                            aria-label="Remove item"
                            title="Remove item"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="neu-surface p-3 sm:p-4 lg:p-6 rounded-xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Order Summary</h2>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium" aria-live="polite">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium" aria-live="polite">
                    {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                  </span>
                </div>
                <div className="border-t pt-2 sm:pt-3 flex justify-between items-center text-base sm:text-lg font-semibold">
                  <span>Total</span>
                  <span aria-live="polite">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Method & Address */}
            <div className="neu-surface p-3 sm:p-4 lg:p-6 rounded-xl">
              <h3 className="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Shipping Details</h3>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Method:</span>{' '}
                  <span className="break-words">
                    {shippingOption === 'express' ? `Express Shipping (${getEstimatedDelivery('express')})` : `Standard Shipping (${getEstimatedDelivery('standard')})`}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Address:</span>
                  <div className="mt-1 sm:mt-2 leading-relaxed">
                    <div className="break-words">{address.name}</div>
                    <div className="break-words">{address.line1}</div>
                    <div className="break-words">{address.city}{address.postal && `, ${address.postal}`}</div>
                    <div className="break-words">{address.country}</div>
                    <div className="font-medium break-all mt-1">{address.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-3 sm:px-4 lg:px-6 space-y-3 sm:space-y-4">
        {/* Form Errors */}
        {formErrors.length > 0 && (
          <div 
            className="neu-surface p-3 sm:p-4 rounded-lg border-l-4 border-destructive"
            role="alert"
            aria-live="polite"
          >
            <div className="text-destructive text-sm sm:text-base">
              {formErrors.map((error, index) => (
                <p key={index} className="break-words">{error}</p>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'review' ? (
          <button 
            onClick={handlePlaceOrder}
            disabled={isLoading}
            aria-busy={isLoading}
            className="neu-button-primary w-full h-12 sm:h-14 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            <span className="break-words text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing Order...
                </div>
              ) : (
                `Place Order - ${formatCurrency(total)}`
              )}
            </span>
          </button>
        ) : (
          <button 
            type="submit"
            form="address-form"
            disabled={isLoading}
            className="neu-button-primary w-full h-12 sm:h-14 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        )}
      </div>
      </div>
      </CheckoutErrorBoundary>
    </PageWithNavigation>
  );
};

export default Checkout;