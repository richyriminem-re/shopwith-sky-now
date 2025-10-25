import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import html2canvas from 'html2canvas';
import { ArrowLeft, ShoppingCart, MessageCircle, CreditCard, User, Mail, Phone, MapPin, FileText, Download, Lock, Edit, Save, CheckCircle } from 'lucide-react';
import { useCartStore, useCheckoutStore, useOrderStore } from '@/lib/store';
import { useProducts } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';
import { getShippingMethods, getFreeShippingThreshold } from '@/lib/shipping';
import { calculateTotalDiscount } from '@/utils/promo';
import { generateOrderReference } from '@/components/order/EnhancedOrderReference';
import { useShippingSettings } from '@/hooks/useShippingSettings';
import { usePromoSettings } from '@/hooks/usePromoSettings';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { OrderSummaryMini } from '@/components/checkout/OrderSummaryMini';
import { WhatsAppOrderGenerator } from '@/components/whatsapp/WhatsAppOrderGenerator';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PhoneInput } from '@/components/checkout/PhoneInput';
import { SearchableStateSelect } from '@/components/checkout/SearchableStateSelect';
import PageWithNavigation from '@/components/PageWithNavigation';
import BackButton from '@/components/ui/BackButton';

// Enhanced form schema for hybrid checkout
const checkoutSchema = z.object({
  name: z.string().min(1, 'Full name is required').trim().refine(
    (val) => !val.endsWith('.') && !val.endsWith(' '), 
    { message: 'Name cannot end with a period or space' }
  ),
  email: z.string().email('Please enter a valid email address').trim(),
  phone: z.string().min(10, 'Please enter a valid phone number').trim().refine(
    (val) => !val.endsWith('.') && !val.endsWith(' '), 
    { message: 'Phone number cannot end with a period or space' }
  ),
  houseNumber: z.string().min(1, 'House number is required').trim().refine(
    (val) => !val.endsWith('.') && !val.endsWith(' '), 
    { message: 'House number cannot end with a period or space' }
  ),
  street: z.string().min(1, 'Street name is required').trim().refine(
    (val) => !val.endsWith('.') && !val.endsWith(' '), 
    { message: 'Street name cannot end with a period or space' }
  ),
  state: z.string().min(1, 'State is required'),
  offRoad: z.string().min(1, 'Off Road / Landmark is required').trim().refine(
    (val) => !val.endsWith('.') && !val.endsWith(' '), 
    { message: 'Off Road / Landmark cannot end with a period or space' }
  ),
  notes: z.string().optional().transform(val => val?.trim()).refine(
    (val) => !val || (!val.endsWith('.') && !val.endsWith(' ')), 
    { message: 'Notes cannot end with a period or space' }
  ),
});

type FormData = z.infer<typeof checkoutSchema>;


const CheckoutHybrid = () => {
  const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'traditional' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [hasDownloadedReceipt, setHasDownloadedReceipt] = useState(false);
  const [isInformationSaved, setIsInformationSaved] = useState(false);
  const [savedInformation, setSavedInformation] = useState<FormData | null>(null);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(100000);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { settings, loading: settingsLoading } = useSiteSettings();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, clearCart } = useCartStore();
  const { shippingOption, appliedPromoCodes, resetPromos } = useCheckoutStore();
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

  // Navigation guard - redirect to cart if no items
  useNavigationGuard({ 
    requiresCart: true, 
    redirectTo: '/cart' 
  });

  // Fetch products from API
  const { data: productsData } = useProducts();
  const products = productsData || [];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      houseNumber: '',
      street: '',
      state: '',
      offRoad: '',
      notes: '',
    },
  });

  // Load saved information on component mount
  useEffect(() => {
    const loadSavedInformation = () => {
      try {
        const savedData = localStorage.getItem('checkout-saved-info');
        if (!savedData) return;

        const parsedData = JSON.parse(savedData) as FormData;
        
        // Validate the loaded data against current schema
        const validationResult = checkoutSchema.safeParse(parsedData);
        
        if (validationResult.success) {
          const validatedData = validationResult.data;
          
          // Restore form values
          form.reset(validatedData);
          
          // Update state
          setSavedInformation(validatedData);
          setIsInformationSaved(true);
          
          toast({
            title: "Information Restored",
            description: "Your saved information has been loaded successfully.",
          });
        } else {
          // Data doesn't match current schema - clear invalid data
          localStorage.removeItem('checkout-saved-info');
          console.warn('Saved checkout data is invalid or outdated, clearing:', validationResult.error);
          
          toast({
            title: "Information Updated",
            description: "Saved information was outdated and has been cleared.",
            variant: "destructive",
          });
        }
      } catch (error) {
        // Handle corrupted localStorage data
        localStorage.removeItem('checkout-saved-info');
        console.error('Failed to load saved checkout information:', error);
        
        toast({
          title: "Loading Error",
          description: "Could not load saved information. Please re-enter your details.",
          variant: "destructive",
        });
      }
    };

    loadSavedInformation();
  }, []); // Run once on component mount

  // Calculate pricing
  const subtotal = items.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    const variant = product?.variants.find(v => v.id === item.variantId);
    return total + (variant?.price || 0) * item.qty;
  }, 0);
  
  // Calculate shipping based on selected method from database
  const shipping = useMemo(() => {
    if (subtotal >= freeShippingThreshold) {
      return 0;
    }
    const selectedMethod = shippingMethods.find(
      m => m.name.toLowerCase().replace(/\s+/g, '-') === shippingOption
    );
    return selectedMethod ? selectedMethod.cost : 0;
  }, [subtotal, freeShippingThreshold, shippingMethods, shippingOption]);
  
  const discount = calculateTotalDiscount(appliedPromoCodes, subtotal, shipping);
  const total = Math.max(0, subtotal + shipping - discount);

  // Generate stable order reference (only changes when cart contents change)
  const orderReference = useMemo(() => {
    const cartKey = items.map(item => `${item.productId}-${item.variantId}-${item.qty}`).join('|');
    const sessionKey = `order-ref-${btoa(cartKey).slice(0, 12)}`;
    const existingRef = sessionStorage.getItem(sessionKey);
    
    if (existingRef) {
      return existingRef;
    }
    
    const newRef = generateOrderReference();
    sessionStorage.setItem(sessionKey, newRef);
    return newRef;
  }, [items]);

  // Check receipt download status on component mount and when orderReference changes
  const receiptStorageKey = `receipt-downloaded-${orderReference}`;
  
  // Update receipt download status from localStorage
  useEffect(() => {
    const downloaded = localStorage.getItem(receiptStorageKey) === 'true';
    setHasDownloadedReceipt(downloaded);
  }, [receiptStorageKey]);

  // Watch form fields for real-time updates
  const watchedFields = form.watch(['name', 'email', 'phone', 'houseNumber', 'street', 'state', 'offRoad', 'notes']);
  const [name, email, phone, houseNumber, street, state, offRoad, notes] = watchedFields;

  // Format address for display
  const formatAddress = () => {
    if (!houseNumber && !street && !offRoad && !state) {
      return 'Enter your delivery address';
    }
    
    const addressParts = [];
    if (houseNumber) addressParts.push(houseNumber);
    if (street) addressParts.push(street);
    if (offRoad) addressParts.push(`Off ${offRoad}`);
    
    let formattedAddress = addressParts.join(', ');
    
    if (state) {
      // Parse state to extract capital and state name
      // Format: "State Name, Capital City" -> we want "Capital City, State Name"
      const stateParts = state.split(', ');
      if (stateParts.length === 2) {
        const [stateName, capital] = stateParts;
        const stateInfo = `${capital}, ${stateName}`;
        formattedAddress += formattedAddress ? `. ${stateInfo}.` : `${stateInfo}.`;
      } else {
        formattedAddress += formattedAddress ? `. ${state}.` : `${state}.`;
      }
    }
    
    return formattedAddress;
  };

  // Format phone number for display in order summary
  const formatPhoneForDisplay = (phoneValue: string) => {
    if (!phoneValue) return 'Enter your phone number';
    
    // If already formatted with +234, return as is
    if (phoneValue.startsWith('+234')) {
      return phoneValue;
    }
    
    // Handle local format (remove leading 0 and add +234)
    const cleanDigits = phoneValue.replace(/\D/g, '').replace(/^0+/, '');
    return cleanDigits ? `+234${cleanDigits}` : 'Enter your phone number';
  };

  // WhatsApp Order Generator
  const { sendToWhatsApp } = WhatsAppOrderGenerator({
    items,
    subtotal,
    shipping,
    discount,
    total,
    shippingOption: shippingOption || 'standard',
    appliedPromoCodes,
    orderReference,
    customerInfo: {
      name,
      phone,
      address: formatAddress(),
    },
    whatsappNumber: settings.whatsapp_business_number || "2348112698594",
    whatsappMessage: settings.whatsapp_order_message || "Hi Shop With Sky 👋 I've placed an order. Please see my receipt and guide me on the payment process."
  });

  const handleWhatsAppOrder = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Create proper Order object
      const order: Order = {
        id: orderReference,
        items,
        total,
        status: 'pending',
        address: {
          name: data.name,
          line1: `${data.houseNumber}, ${data.street}`,
          city: `${data.offRoad}, ${data.state}`,
          country: 'Nigeria',
          phone: data.phone,
          email: data.email,
        },
        shippingMethod: shippingOption,
        createdAt: new Date().toISOString(),
        statusUpdatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Order placed via WhatsApp checkout',
          }
        ],
        paymentStatus: 'pending',
      };

      // Save order to store (this automatically adds to history)
      setLastOrder(order);
      
      // Save order to localStorage for WhatsApp tracking
      const orderRecord = {
        reference: orderReference,
        items,
        subtotal,
        shipping,
        discount,
        total,
        appliedPromoCodes,
        customerInfo: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: formatAddress(),
        },
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem('pending-whatsapp-order', JSON.stringify(orderRecord));
      
      // Clear cart and reset checkout state
      clearCart();
      resetPromos();
      
      // Redirect to WhatsApp
      sendToWhatsApp();

      toast({
        title: "Order Saved & Redirecting to WhatsApp",
        description: "Your order has been saved and you're being redirected to WhatsApp to complete payment.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraditionalCheckout = () => {
    navigate('/checkout');
  };

  const onSubmit = async (data: FormData) => {
    if (selectedMethod === 'whatsapp') {
      await handleWhatsAppOrder(data);
    } else {
      handleTraditionalCheckout();
    }
  };

  const handleDownloadReceiptClick = async (e?: React.MouseEvent) => {
    // Prevent any form submission or event bubbling
    e?.preventDefault();
    e?.stopPropagation();
    
    // Validate all required fields first
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Complete Required Fields",
        description: "Please fill in all required fields before downloading the receipt.",
        variant: "destructive"
      });
      return;
    }
    
    generateReceiptImage();
  };

  const handleSaveInformation = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Please correct errors",
        description: "Fix the form errors before saving your information.",
        variant: "destructive"
      });
      return;
    }

    const currentData = form.getValues();
    setSavedInformation(currentData);
    setIsInformationSaved(true);
    
    // Save to localStorage for persistence
    localStorage.setItem('checkout-saved-info', JSON.stringify(currentData));
    
    toast({
      title: "Information Saved",
      description: "Your information has been saved and locked. You can edit it anytime.",
    });
  };

  const handleEditInformation = () => {
    setIsInformationSaved(false);
    setSavedInformation(null);
    localStorage.removeItem('checkout-saved-info');
    
    toast({
      title: "Information Unlocked",
      description: "You can now edit your information.",
    });
  };

  const generateReceiptImage = async () => {
    if (!receiptRef.current) return;

    setIsGeneratingReceipt(true);
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
          link.download = `Receipt-${orderReference}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Mark receipt as downloaded and automatically select WhatsApp
          setHasDownloadedReceipt(true);
          setSelectedMethod('whatsapp');
          localStorage.setItem(receiptStorageKey, 'true');

          toast({
            title: "Receipt Downloaded",
            description: "Your order receipt has been saved. You can now proceed with WhatsApp checkout.",
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
      setIsGeneratingReceipt(false);
    }
  };

  if (items.length === 0) {
    return null; // Navigation guard handles redirect
  }

  return (
    <PageWithNavigation fallbackRoute="/cart">
      <SEOHead 
        title="Choose Checkout Method - Shop With Sky"
        description="Complete your order via WhatsApp or traditional checkout. Fast, secure, and convenient options available."
        keywords="checkout, whatsapp order, payment options, shop with sky"
        type="website"
      />
      
      <div className="pb-20 min-h-screen overflow-x-hidden">
        {/* Header */}
        <div className="px-3 sm:px-4 pt-6 pb-4 w-full max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-6">
            <BackButton 
              fallback="/cart"
              text="Back to Cart"
              breadcrumbHints={['Cart', 'Hybrid Checkout']}
              variant="default"
              size="default"
            />
            
            {!settingsLoading && settings.checkout_logo_url && (
              <img 
                src={settings.checkout_logo_url}
                alt="Shop with Sky Logo" 
                className="h-6 sm:h-8 md:h-10 w-auto object-contain max-w-[100px] sm:max-w-[120px] flex-shrink-0"
              />
            )}
          </div>
          
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center text-balance px-2">
            Complete Your Order
          </h1>
          <p className="text-muted-foreground text-center mt-2 text-sm sm:text-base px-2">
            Choose your preferred checkout method
          </p>
        </div>

        <div className="px-3 sm:px-4 w-full max-w-6xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Checkout Form */}
            <Card className="neu-surface border-0 w-full min-w-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Your Information</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Enter your full name"
                                className={`neu-input capitalize w-full ${isInformationSaved ? 'bg-muted/50 pr-10 sm:pr-12' : ''}`}
                                disabled={isInformationSaved}
                                onChange={(e) => {
                                  const capitalizedValue = e.target.value
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                    .join(' ');
                                  field.onChange(capitalizedValue);
                                }}
                                onBlur={(e) => {
                                  const trimmedValue = e.target.value.replace(/[.\s]+$/, '');
                                  if (trimmedValue !== e.target.value) {
                                    field.onChange(trimmedValue);
                                  }
                                  field.onBlur();
                                }}
                                value={field.value}
                                name={field.name}
                                ref={field.ref}
                              />
                              {isInformationSaved && (
                                <Lock className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-20" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="email"
                                placeholder="Enter your email"
                                className={`neu-input w-full ${isInformationSaved ? 'bg-muted/50 pr-10 sm:pr-12' : ''}`}
                                disabled={isInformationSaved}
                                {...field}
                                onBlur={(e) => {
                                  const trimmedValue = e.target.value.replace(/\s+$/, '');
                                  if (trimmedValue !== e.target.value) {
                                    field.onChange(trimmedValue);
                                  }
                                  field.onBlur();
                                }}
                              />
                              {isInformationSaved && (
                                <Lock className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-20" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                     <FormField
                       control={form.control}
                       name="phone"
                       render={({ field }) => (
                         <div className="relative">
                           <PhoneInput
                             value={field.value}
                             onChange={field.onChange}
                             error={form.formState.errors.phone?.message}
                             disabled={isInformationSaved}
                           />
                           {isInformationSaved && (
                              <Lock className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-20" />
                           )}
                         </div>
                       )}
                     />

                    <div className="space-y-4">
                      <h3 className="font-medium text-sm">Delivery Address *</h3>
                      
                         <FormField
                           control={form.control}
                           name="state"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>State *</FormLabel>
                               <FormControl>
                                 <div className="relative">
                                   <SearchableStateSelect
                                     value={field.value}
                                     onChange={field.onChange}
                                     placeholder="Select Your State..."
                                     error={form.formState.errors.state?.message}
                                     disabled={isInformationSaved}
                                   />
                                   {isInformationSaved && (
                                     <Lock className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-20" />
                                   )}
                                 </div>
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                      />

                      <FormField
                        control={form.control}
                        name="houseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>House Number *</FormLabel>
                             <FormControl>
                               <div className="relative">
                                 <Input 
                                   placeholder="e.g., 15, 27B, Block 3"
                                    className={`neu-input w-full ${isInformationSaved ? 'bg-muted/50 pr-10 sm:pr-12' : ''}`}
                                   disabled={isInformationSaved}
                                   {...field}
                                    onChange={(e) => {
                                      // Allow alphanumeric and common address characters like /, -, #, ,
                                      const value = e.target.value.replace(/[^a-zA-Z0-9\s/#,-]/g, '');
                                      field.onChange(value);
                                    }}
                                   onBlur={(e) => {
                                     const trimmedValue = e.target.value.replace(/[.\s]+$/, '');
                                     if (trimmedValue !== e.target.value) {
                                       field.onChange(trimmedValue);
                                     }
                                     field.onBlur();
                                   }}
                                 />
                                 {isInformationSaved && (
                                    <Lock className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-20" />
                                 )}
                               </div>
                             </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Name *</FormLabel>
                             <FormControl>
                               <div className="relative">
                                 <Input 
                                   placeholder="e.g., Allen Avenue, Victoria Street"
                                    className={`neu-input w-full ${isInformationSaved ? 'bg-muted/50 pr-10 sm:pr-12' : ''}`}
                                   disabled={isInformationSaved}
                                   onChange={(e) => {
                                     const capitalizedValue = e.target.value
                                       .split(' ')
                                       .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                       .join(' ');
                                     field.onChange(capitalizedValue);
                                   }}
                                   onBlur={(e) => {
                                     const trimmedValue = e.target.value.replace(/[.\s]+$/, '');
                                     if (trimmedValue !== e.target.value) {
                                       field.onChange(trimmedValue);
                                     }
                                     field.onBlur();
                                   }}
                                   value={field.value}
                                   name={field.name}
                                   ref={field.ref}
                                 />
                                 {isInformationSaved && (
                                    <Lock className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-20" />
                                 )}
                               </div>
                             </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="offRoad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Off Road / Landmark *</FormLabel>
                             <FormControl>
                               <div className="relative">
                                 <Input 
                                   placeholder="e.g., Opebi Road, opposite GTBank"
                                   className={`neu-input w-full ${isInformationSaved ? 'bg-muted/50 pr-10 sm:pr-12' : ''}`}
                                   disabled={isInformationSaved}
                                   onChange={(e) => {
                                     const capitalizedValue = e.target.value
                                       .split(' ')
                                       .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                       .join(' ');
                                     field.onChange(capitalizedValue);
                                   }}
                                   onBlur={(e) => {
                                     const trimmedValue = e.target.value.replace(/[.\s]+$/, '');
                                     if (trimmedValue !== e.target.value) {
                                       field.onChange(trimmedValue);
                                     }
                                     field.onBlur();
                                   }}
                                   value={field.value}
                                   name={field.name}
                                   ref={field.ref}
                                 />
                                 {isInformationSaved && (
                                   <Lock className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-20" />
                                 )}
                               </div>
                             </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea 
                                placeholder="Any special delivery instructions?"
                                className={`neu-input w-full resize-none ${isInformationSaved ? 'bg-muted/50 pr-10 sm:pr-12' : ''}`}
                                rows={2}
                                disabled={isInformationSaved}
                                {...field}
                                onBlur={(e) => {
                                  const trimmedValue = e.target.value.replace(/[.\s]+$/, '');
                                  if (trimmedValue !== e.target.value) {
                                    field.onChange(trimmedValue);
                                  }
                                  field.onBlur();
                                }}
                              />
                              {isInformationSaved && (
                                <Lock className="absolute right-2 sm:right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-20" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                     />

                    {/* Save/Edit Information Buttons */}
                    <div className="pt-4 border-t">
                      {!isInformationSaved ? (
                        <div className="space-y-2">
                            <Button
                              type="button"
                              variant="default"
                              onClick={handleSaveInformation}
                              className="w-full flex items-center gap-2"
                              disabled={!form.formState.isValid || isLoading}
                            >
                              <Lock className="h-4 w-4" />
                              Save Information
                            </Button>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-amber-700 font-medium">
                              📥 Kindly save your information first, then proceed to the Order Receipt
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Information Saved Successfully
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleEditInformation}
                            className="w-full flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Information
                          </Button>
                        </div>
                      )}
                    </div>

                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Enhanced Order Summary with Receipt Design */}
            <div className="space-y-4">
              <OrderSummaryMini
                ref={receiptRef}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                discount={discount}
                appliedPromoCodes={appliedPromoCodes}
                orderReference={orderReference}
                shippingOption={shippingOption || 'standard'}
                customerInfo={{
                  name,
                  email,
                  phone: formatPhoneForDisplay(phone),
                  address: formatAddress(),
                  notes,
                }}
                items={items.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  const variant = product?.variants.find(v => v.id === item.variantId);
                  
                  return {
                    productId: item.productId,
                    variantId: item.variantId,
                    qty: item.qty,
                    title: product?.title,
                    price: variant?.price,
                    color: variant?.color,
                    size: variant?.size,
                    image: product?.images?.[0],
                  };
                })}
                className="w-full"
              />
              
              {/* Download Receipt Button */}
              <Button
                type="button"
                onClick={handleDownloadReceiptClick}
                disabled={isGeneratingReceipt || !form.formState.isValid || !isInformationSaved}
                variant={hasDownloadedReceipt ? "default" : "outline"}
                className={`w-full ${hasDownloadedReceipt ? 'bg-green-600 hover:bg-green-700' : ''}`}
                size="sm"
              >
                {isGeneratingReceipt ? (
                  "Generating Receipt..."
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {hasDownloadedReceipt ? "Download Receipt Again" : "Download Receipt"}
                  </>
                )}
              </Button>
              
              {!hasDownloadedReceipt && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-amber-700 font-medium">
                    {!isInformationSaved
                      ? "📥 Please save your information first to download receipt"
                      : !form.formState.isValid 
                        ? "📝 Complete all required fields to download receipt"
                        : "📥 Please download your receipt first to proceed with WhatsApp checkout"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Checkout Method Selection */}
            <Card className="neu-surface border-0 w-full min-w-0">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-base sm:text-lg">Choose Checkout Method</h3>
                  
                   {/* WhatsApp Option */}
                   <Card 
                     className={`transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                       !hasDownloadedReceipt 
                         ? 'opacity-50 cursor-not-allowed' 
                         : selectedMethod === 'whatsapp' 
                           ? 'ring-2 ring-[#25D366] bg-[#25D366]/5 cursor-pointer hover:scale-[1.01]' 
                           : 'hover:shadow-md cursor-pointer hover:scale-[1.01]'
                     }`}
                     onClick={() => hasDownloadedReceipt && setSelectedMethod('whatsapp')}
                     onKeyDown={(e) => {
                       if (hasDownloadedReceipt && (e.key === 'Enter' || e.key === ' ')) {
                         e.preventDefault();
                         setSelectedMethod('whatsapp');
                       }
                     }}
                     tabIndex={hasDownloadedReceipt ? 0 : -1}
                     role="button"
                     aria-label={hasDownloadedReceipt ? "Select WhatsApp checkout method" : "Download receipt first to enable WhatsApp checkout"}
                     aria-disabled={!hasDownloadedReceipt}
                   >
                     <CardContent className="p-3 sm:p-4 min-h-[64px] text-wrap break-words whitespace-normal">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                         <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full">
                           <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                             hasDownloadedReceipt ? 'bg-[#25D366]/20' : 'bg-gray-200'
                           }`}>
                             <i className={`fa-brands fa-whatsapp text-sm sm:text-lg ${
                               hasDownloadedReceipt ? 'text-[#25D366]' : 'text-gray-400'
                             }`} />
                           </div>
                           <div className="min-w-0 flex-1">
                             <h4 className={`font-semibold text-sm sm:text-base text-balance ${
                               hasDownloadedReceipt ? '' : 'text-gray-500'
                             }`}>
                               Complete via WhatsApp
                             </h4>
                             <p className={`text-xs sm:text-sm leading-snug ${
                               hasDownloadedReceipt ? 'text-muted-foreground' : 'text-gray-400'
                             }`}>
                               {hasDownloadedReceipt 
                                 ? 'Fast, personal service with instant support'
                                 : 'Download receipt first to enable this option'
                               }
                             </p>
                           </div>
                         </div>
                         {hasDownloadedReceipt ? (
                           <Badge 
                             variant="secondary" 
                             className="bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 text-[10px] sm:text-xs whitespace-nowrap self-start sm:self-auto"
                           >
                             Recommended
                           </Badge>
                         ) : (
                           <Badge 
                             variant="secondary" 
                             className="bg-gray-100 text-gray-500 border-gray-200 text-[10px] sm:text-xs whitespace-nowrap self-start sm:self-auto"
                           >
                             Locked
                           </Badge>
                         )}
                       </div>
                     </CardContent>
                   </Card>


                   {/* Submit Button */}
                    <Button
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={selectedMethod !== 'whatsapp' || isLoading || !hasDownloadedReceipt || !form.formState.isValid}
                      className="w-full min-h-[44px] sm:min-h-[48px] text-sm sm:text-base font-semibold"
                    >
                     {isLoading ? (
                       "Processing..."
                     ) : !hasDownloadedReceipt ? (
                       "Download receipt first"
                     ) : selectedMethod === 'whatsapp' ? (
                       <>
                         <i className="fa-brands fa-whatsapp mr-2 text-sm sm:text-base flex-shrink-0" />
                         <span className="truncate">Continue with WhatsApp</span>
                       </>
                     ) : (
                       "Select WhatsApp checkout"
                     )}
                   </Button>

                  {selectedMethod === 'whatsapp' && (
                    <p className="text-xs text-muted-foreground text-center mt-2 px-2">
                      You'll be redirected to WhatsApp to complete your order. Please share your receipt with the seller for faster processing.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWithNavigation>
  );
};

export default CheckoutHybrid;