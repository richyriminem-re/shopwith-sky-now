/**
 * Enhanced Checkout Page with Advanced Form Persistence
 * Demonstrates the new encryption and recovery features
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Check, Shield, Save } from 'lucide-react';
import { useCartStore, useCheckoutStore, useOrderStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import SEOHead from '@/components/SEOHead';
import PageWithNavigation from '@/components/PageWithNavigation';
import BackButton from '@/components/ui/BackButton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhoneInput } from '@/components/checkout/PhoneInput';
import { CitySelect } from '@/components/checkout/CitySelect';
import { FormRecoveryDialog } from '@/components/forms/FormRecoveryDialog';
import { EnhancedFormInput } from '@/components/forms/EnhancedFormInput';
import { formatCurrency } from '@/lib/utils';

// Enhanced address schema
const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+234\d{10}$/, 'Please enter a valid Nigerian phone number'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'State/City is required'),
  street: z.string().min(1, 'Street address is required'),
  apartment: z.string().optional(),
  zipCode: z.string().optional(),
  cardNumber: z.string().optional(),
  cvv: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof addressSchema>;

const CheckoutEnhanced = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotal, clearCart } = useCartStore();
  const { resetPromos } = useCheckoutStore();

  // Navigation guard - redirect to cart if no items
  useNavigationGuard({ 
    requiresCart: true, 
    redirectTo: '/cart' 
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: 'Nigeria',
      city: '',
      street: '',
      apartment: '',
      zipCode: '',
      cardNumber: '',
      cvv: '',
      expiryDate: '',
      notes: '',
    }
  });

  // Enhanced form persistence with encryption
  const {
    clearSavedData,
    restoreData,
    isRecoveryAvailable,
    savedMetadata,
    fieldStates,
    getFieldIndicator,
    forceSave
  } = useFormPersistence({
    storageKey: 'checkout-form',
    watch: [],
    form,
    enabled: true,
    formType: 'Checkout Form',
    autoCleanup: true,
    expirationHours: 24,
    onDataFound: () => setShowRecoveryDialog(true),
    encryptSensitiveFields: true
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  const subtotal = items.reduce((sum, item) => sum + (item.qty * 1500000), 0); // Mock calculation in Naira
  const tax = subtotal * 0.075; // 7.5% VAT (Nigerian rate)
  const shipping = subtotal > 112500 ? 0 : 8985; // Free shipping over ₦112,500
  const total = subtotal + tax + shipping;

  const handleRecoverData = async () => {
    const success = await restoreData();
    if (success) {
      toast({
        title: "Form data restored",
        description: "Your previously saved information has been restored.",
      });
    }
    setShowRecoveryDialog(false);
  };

  const handleDiscardData = () => {
    clearSavedData();
    setShowRecoveryDialog(false);
    toast({
      title: "Data discarded",
      description: "Saved form data has been removed.",
    });
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear saved data and reset promos after successful submission
      clearSavedData();
      clearCart();
      resetPromos();
      
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      
      navigate('/order-confirmation');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldState = (fieldName: keyof CheckoutFormData) => {
    return getFieldIndicator(fieldName);
  };

  return (
    <PageWithNavigation fallbackRoute="/cart">
      <SEOHead 
        title="Secure Checkout - Enhanced Form Persistence Demo"
        description="Experience our advanced form persistence with encryption and recovery features"
      />

      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <BackButton 
              fallback="/cart" 
              text="Back to Cart"
              breadcrumbHints={['Cart', 'Enhanced Checkout']} 
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Order Summary
                  <Badge variant="secondary">{items.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex justify-between">
                    <span>Item × {item.qty}</span>
                    <span>{formatCurrency(1500000 * item.qty)}</span>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Checkout Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Secure Checkout
                  {savedMetadata && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Save className="h-3 w-3" />
                      {savedMetadata.secureFields} encrypted fields
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Personal Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => {
                            const fieldState = getFieldState('firstName');
                            return (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <EnhancedFormInput
                                    {...field}
                                    fieldName="firstName"
                                    hasSavedData={fieldState?.hasSavedData}
                                    securityLevel={fieldState?.securityLevel}
                                    lastSaved={fieldState?.lastSaved}
                                    placeholder="John"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => {
                            const fieldState = getFieldState('lastName');
                            return (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <EnhancedFormInput
                                    {...field}
                                    fieldName="lastName"
                                    hasSavedData={fieldState?.hasSavedData}
                                    securityLevel={fieldState?.securityLevel}
                                    lastSaved={fieldState?.lastSaved}
                                    placeholder="Doe"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => {
                          const fieldState = getFieldState('email');
                          return (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <EnhancedFormInput
                                  {...field}
                                  fieldName="email"
                                  type="email"
                                  hasSavedData={fieldState?.hasSavedData}
                                  securityLevel={fieldState?.securityLevel}
                                  lastSaved={fieldState?.lastSaved}
                                  placeholder="john@example.com"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <PhoneInput
                                value={field.value}
                                onChange={field.onChange}
                                error={form.formState.errors.phone?.message}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Shipping Address</h3>
                      
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => {
                          const fieldState = getFieldState('street');
                          return (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <EnhancedFormInput
                                  {...field}
                                  fieldName="street"
                                  hasSavedData={fieldState?.hasSavedData}
                                  securityLevel={fieldState?.securityLevel}
                                  lastSaved={fieldState?.lastSaved}
                                  placeholder="123 Main Street"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/City</FormLabel>
                            <FormControl>
                              <CitySelect value={field.value} onChange={field.onChange} />
                            </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => {
                            const fieldState = getFieldState('zipCode');
                            return (
                              <FormItem>
                                <FormLabel>Postal Code (Optional)</FormLabel>
                                <FormControl>
                                  <EnhancedFormInput
                                    {...field}
                                    fieldName="zipCode"
                                    hasSavedData={fieldState?.hasSavedData}
                                    securityLevel={fieldState?.securityLevel}
                                    lastSaved={fieldState?.lastSaved}
                                    placeholder="123456"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                    </div>

                    {/* Payment Information (Demo - Don't use in production) */}
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        Payment Information
                        <Badge variant="destructive" className="text-xs">
                          Demo Only
                        </Badge>
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => {
                          const fieldState = getFieldState('cardNumber');
                          return (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <EnhancedFormInput
                                  {...field}
                                  fieldName="cardNumber"
                                  hasSavedData={fieldState?.hasSavedData}
                                  securityLevel={fieldState?.securityLevel}
                                  lastSaved={fieldState?.lastSaved}
                                  placeholder="1234 5678 9012 3456"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <EnhancedFormInput
                                  {...field}
                                  fieldName="expiryDate"
                                  placeholder="MM/YY"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cvv"
                          render={({ field }) => {
                            const fieldState = getFieldState('cvv');
                            return (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <EnhancedFormInput
                                    {...field}
                                    fieldName="cvv"
                                    hasSavedData={fieldState?.hasSavedData}
                                    securityLevel={fieldState?.securityLevel}
                                    lastSaved={fieldState?.lastSaved}
                                    placeholder="123"
                                    maxLength={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => {
                        const fieldState = getFieldState('notes');
                        return (
                          <FormItem>
                            <FormLabel>Order Notes (Optional)</FormLabel>
                            <FormControl>
                              <EnhancedFormInput
                                {...field}
                                fieldName="notes"
                                hasSavedData={fieldState?.hasSavedData}
                                securityLevel={fieldState?.securityLevel}
                                lastSaved={fieldState?.lastSaved}
                                placeholder="Special delivery instructions..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => forceSave()}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Progress
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Processing...' : `Place Order - ${formatCurrency(total)}`}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recovery Dialog */}
      {savedMetadata && (
        <FormRecoveryDialog
          isOpen={showRecoveryDialog}
          onClose={() => setShowRecoveryDialog(false)}
          onRecover={handleRecoverData}
          onDiscard={handleDiscardData}
          savedData={{
            timestamp: savedMetadata.timestamp,
            fieldCount: savedMetadata.fieldCount,
            secureFields: savedMetadata.secureFields,
            formType: savedMetadata.formType
          }}
        />
      )}
    </PageWithNavigation>
  );
};

export default CheckoutEnhanced;