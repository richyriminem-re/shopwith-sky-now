import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Download, MessageCircle, User, Mail, Phone, MapPin, FileText, ShoppingCart } from 'lucide-react';
import { useCartStore, useCheckoutStore } from '@/lib/store';
import { products } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { calcShippingCost, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { WhatsAppOrderGenerator } from '@/components/whatsapp/WhatsAppOrderGenerator';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageWithNavigation from '@/components/PageWithNavigation';
import BackButton from '@/components/ui/BackButton';
import { generateOrderReference } from '@/components/order/EnhancedOrderReference';
import { ErrorBoundaryWithRetry } from '@/components/order/ErrorBoundaryWithRetry';

interface OrderData {
  name: string;
  email: string;
  phone: string;
  houseNumber: string;
  street: string;
  state: string;
  offRoad?: string;
  notes?: string;
  shippingOption: string;
}

const OrderPreview = () => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { items, clearCart } = useCartStore();
  const { resetPromos } = useCheckoutStore();

  // Get order data from navigation state
  const orderData = location.state as OrderData;

  useEffect(() => {
    // Redirect if no order data or cart is empty
    if (!orderData || items.length === 0) {
      toast({
        title: "Invalid Order",
        description: "Please complete the checkout form first.",
        variant: "destructive"
      });
      navigate('/checkout-hybrid');
    }
  }, [orderData, items.length, navigate, toast]);

  // Calculate pricing
  const subtotal = items.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    const variant = product?.variants.find(v => v.id === item.variantId);
    return total + (variant?.price || 0) * item.qty;
  }, 0);

  const shipping = calcShippingCost(subtotal, (orderData?.shippingOption as 'standard' | 'express') || 'standard');
  const total = subtotal + shipping;

  // Generate stable order reference (only changes when cart contents change)
  const orderReference = useMemo(() => {
    // Create a stable key based on cart contents and order data
    const cartKey = items.map(item => `${item.productId}-${item.variantId}-${item.qty}`).join('|');
    const orderKey = orderData ? `${orderData.name}-${orderData.email}-${orderData.phone}` : '';
    const stableKey = `${cartKey}:${orderKey}`;
    
    // Try to get existing reference from sessionStorage first
    const sessionKey = `order-ref-${btoa(stableKey).slice(0, 12)}`;
    const existingRef = sessionStorage.getItem(sessionKey);
    
    if (existingRef) {
      return existingRef;
    }
    
    // Generate new reference and store it
    const newRef = generateOrderReference();
    sessionStorage.setItem(sessionKey, newRef);
    return newRef;
  }, [items, orderData]);

  // Format address for display
  const formatAddress = () => {
    if (!orderData) return 'Enter your delivery address';
    
    const { houseNumber, street, offRoad, state } = orderData;
    const addressParts = [];
    
    if (houseNumber) addressParts.push(houseNumber);
    if (street) addressParts.push(street);
    if (offRoad) addressParts.push(`Off ${offRoad}`);
    
    let formattedAddress = addressParts.join(', ');
    
    if (state) {
      const stateParts = state.split(', ');
      if (stateParts.length === 2) {
        const [stateName, capital] = stateParts;
        const stateInfo = `${capital}, ${stateName}`;
        formattedAddress += formattedAddress ? `. ${stateInfo}.` : `${stateInfo}.`;
      } else {
        formattedAddress += formattedAddress ? `. ${state}.` : `${state}.`;
      }
    }
    
    return formattedAddress || 'Enter your delivery address';
  };

  // Format phone for display
  const formatPhoneForDisplay = (phone?: string) => {
    if (!phone) return 'Enter your phone number';
    return phone;
  };

  // WhatsApp Order Generator
  const { sendToWhatsApp } = WhatsAppOrderGenerator({
    items,
    subtotal,
    shipping,
    discount: 0,
    total,
    shippingOption: orderData?.shippingOption || 'standard',
    customerInfo: {
      name: orderData?.name,
      phone: orderData?.phone,
      address: formatAddress(),
    }
  });

  const generateOrderImage = async () => {
    if (!receiptRef.current) return;

    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff',
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Order-${orderReference}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({
            title: "Receipt Downloaded",
            description: "Your order receipt has been saved to your device.",
          });
        }
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate receipt image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleContinueToWhatsApp = async () => {
    setIsRedirecting(true);
    
    try {
      // Save order to localStorage for tracking
      const orderRecord = {
        reference: orderReference,
        items,
        subtotal,
        shipping,
        total,
        customerInfo: {
          name: orderData?.name,
          email: orderData?.email,
          phone: orderData?.phone,
          address: formatAddress(),
        },
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem('pending-whatsapp-order', JSON.stringify(orderRecord));
      
      // Redirect to WhatsApp
      sendToWhatsApp();
      
      // Clear cart and reset promos after successful WhatsApp redirect
      setTimeout(() => {
        clearCart();
        resetPromos();
      }, 1000);

      toast({
        title: "Redirecting to WhatsApp",
        description: "Complete your order with the seller. Your receipt is ready for sharing!",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  if (!orderData) {
    return null; // Loading or redirecting
  }

  return (
    <ErrorBoundaryWithRetry
      fallbackTitle="Order Preview Error"
      fallbackDescription="Unable to display your order preview. Please try again or return to checkout."
      onRetry={() => window.location.reload()}
    >
      <PageWithNavigation fallbackRoute="/checkout-hybrid">
        <SEOHead 
          title="Order Receipt - Shop With Sky"
          description="Your order receipt and confirmation details for Shop With Sky"
          keywords="order receipt, order confirmation, shop with sky"
          type="website"
        />
        
        <div className="pb-20 min-h-screen bg-background">
          {/* Header with Back Button */}
          <div className="px-3 sm:px-4 pt-6 pb-4 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-start mb-6">
              <BackButton 
                fallback="/checkout-hybrid"
                text="Back to Edit"
                breadcrumbHints={['Checkout', 'Order Preview']}
                variant="default"
                size="default"
              />
            </div>
          </div>

          {/* Order Receipt */}
          <div className="px-3 sm:px-4 w-full max-w-2xl mx-auto">
            <div 
              ref={receiptRef}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Header Section */}
              <div className="text-center py-8 px-6 border-b border-border bg-gradient-to-b from-background to-muted/20">
                {/* Logo */}
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src="/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png" 
                    alt="Shop with Sky Logo" 
                    className="h-14 sm:h-18 w-auto object-contain"
                  />
                </div>
                
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">Order Receipt</h1>
                
                {/* Order Reference Card */}
                <div className="bg-card border border-primary/30 rounded-xl p-4 mb-6 shadow-sm max-w-sm mx-auto">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Order Reference</div>
                  <div className="text-lg font-bold text-primary tracking-wider">{orderReference}</div>
                </div>
                
                {/* Generated On */}
                <p className="text-sm text-muted-foreground mb-6">
                  Generated on {new Date().toLocaleDateString('en-NG', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                
                {/* Enhanced Status */}
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-amber-50 border border-amber-200 shadow-sm">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-3 animate-pulse shadow-sm"></div>
                  <span className="text-sm font-semibold text-amber-700">Pending Confirmation</span>
                </div>
              </div>

              {/* Body Section - Complete Order Summary */}
              <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                {/* Customer Information Section */}
                <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User size={20} className="text-primary" />
                    Customer Details
                  </h3>
                  
                  <div className="grid gap-4 text-base">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Full Name</div>
                      <div className="text-foreground font-medium">
                        {orderData?.name || 'No name provided'}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Email Address</div>
                      <div className="text-foreground break-words">
                        {orderData?.email || 'No email provided'}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Phone Number</div>
                      <div className="text-foreground font-medium">
                        {formatPhoneForDisplay(orderData?.phone)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Delivery Address</div>
                      <div className="text-foreground leading-relaxed">
                        {formatAddress()}
                      </div>
                    </div>
                    
                    {orderData?.notes && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Special Instructions</div>
                        <div className="text-foreground leading-relaxed">
                          {orderData.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />

                {/* Cart Items Section */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ShoppingCart size={20} className="text-primary" />
                    Order Items ({items.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {items.map((item) => {
                      const product = products.find(p => p.id === item.productId);
                      const variant = product?.variants.find(v => v.id === item.variantId);
                      
                      return (
                        <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 sm:gap-6 items-start p-3 rounded-lg border border-border/50 bg-background/50">
                          <img 
                            src={product?.images?.[0]} 
                            alt={product?.title || 'Product'}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 border border-border"
                          />
                          <div className="flex-1 min-w-0 space-y-2">
                            <h4 className="font-semibold text-base sm:text-lg text-foreground leading-tight">{product?.title}</h4>
                            <div className="space-y-1">
                              {variant?.color && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Color:</span> {variant.color}
                                </div>
                              )}
                              {variant?.size && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Size:</span> {variant.size}
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Quantity:</span> {item.qty}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg text-foreground">
                              {formatCurrency((variant?.price || 0) * item.qty)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(variant?.price || 0)} each
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Pricing Summary */}
                <div className="bg-muted/30 rounded-lg p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-base gap-4">
                      <span className="text-muted-foreground">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                      <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-base gap-4">
                      <span className="text-muted-foreground">
                        {subtotal >= FREE_SHIPPING_THRESHOLD 
                          ? '🎉 Free Shipping' 
                          : `${orderData?.shippingOption === 'express' ? 'Express' : 'Standard'} Shipping`
                        }
                      </span>
                      <span className="font-semibold text-foreground">
                        {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                      </span>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center text-xl font-bold gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <span className="text-foreground">Total Amount</span>
                      <span className="text-primary text-2xl">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="px-6 sm:px-8 pb-8 text-center bg-gradient-to-t from-muted/30 to-transparent border-t border-border/50">
                <div className="py-6">
                  <p className="text-base font-medium text-foreground mb-2">
                    Thank You For Shopping With Sky
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We value your trust and look forward to serving you again.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-3 sm:px-4 w-full max-w-2xl mx-auto mt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={generateOrderImage}
                disabled={isGeneratingImage}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {isGeneratingImage ? (
                  "Generating..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleContinueToWhatsApp}
                disabled={isRedirecting}
                size="lg"
                className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90"
              >
                {isRedirecting ? (
                  "Redirecting..."
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Continue to WhatsApp
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </PageWithNavigation>
    </ErrorBoundaryWithRetry>
  );
};

export default OrderPreview;