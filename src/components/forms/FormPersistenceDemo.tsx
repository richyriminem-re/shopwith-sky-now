/**
 * Form Persistence Demo Component
 * Showcases the enhanced form persistence features
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Save, RotateCcw, Trash2, Info } from 'lucide-react';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormRecoveryDialog } from './FormRecoveryDialog';
import { EnhancedFormInput } from './EnhancedFormInput';
import { useToast } from '@/hooks/use-toast';

const demoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  cardNumber: z.string().optional(),
  cvv: z.string().optional(),
  notes: z.string().optional(),
});

type DemoFormData = z.infer<typeof demoSchema>;

export const FormPersistenceDemo: React.FC = () => {
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      cardNumber: '',
      cvv: '',
      notes: '',
    }
  });

  const {
    clearSavedData,
    restoreData,
    forceSave,
    isRecoveryAvailable,
    savedMetadata,
    fieldStates,
    getFieldIndicator
  } = useFormPersistence({
    storageKey: 'demo-form',
    watch: [],
    form,
    enabled: true,
    formType: 'Demo Form',
    autoCleanup: false,
    expirationHours: 1,
    onDataFound: () => setShowRecoveryDialog(true),
    encryptSensitiveFields: true
  });

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

  const onSubmit = (data: DemoFormData) => {
    console.log('Form submitted:', data);
    clearSavedData();
    toast({
      title: "Form submitted successfully!",
      description: "Saved data has been cleared.",
    });
  };

  const getFieldState = (fieldName: keyof DemoFormData) => {
    return getFieldIndicator(fieldName);
  };

  const secureFieldCount = Object.values(fieldStates).filter(
    state => state.securityLevel !== 'none'
  ).length;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Enhanced Form Persistence Demo
            {savedMetadata && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Save className="h-3 w-3" />
                {savedMetadata.secureFields} encrypted
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This demo showcases encrypted form persistence. Sensitive fields (address, phone, payment info) 
              are encrypted, while basic fields use standard storage. Form data auto-saves every 500ms.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <FormLabel>Email (Medium Security)</FormLabel>
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
                render={({ field }) => {
                  const fieldState = getFieldState('phone');
                  return (
                    <FormItem>
                      <FormLabel>Phone (Medium Security)</FormLabel>
                      <FormControl>
                        <EnhancedFormInput
                          {...field}
                          fieldName="phone"
                          hasSavedData={fieldState?.hasSavedData}
                          securityLevel={fieldState?.securityLevel}
                          lastSaved={fieldState?.lastSaved}
                          placeholder="+1234567890"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => {
                  const fieldState = getFieldState('address');
                  return (
                    <FormItem>
                      <FormLabel>Address (Medium Security)</FormLabel>
                      <FormControl>
                        <EnhancedFormInput
                          {...field}
                          fieldName="address"
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
                  render={({ field }) => {
                    const fieldState = getFieldState('city');
                    return (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <EnhancedFormInput
                            {...field}
                            fieldName="city"
                            hasSavedData={fieldState?.hasSavedData}
                            securityLevel={fieldState?.securityLevel}
                            lastSaved={fieldState?.lastSaved}
                            placeholder="New York"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => {
                    const fieldState = getFieldState('zipCode');
                    return (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <EnhancedFormInput
                            {...field}
                            fieldName="zipCode"
                            hasSavedData={fieldState?.hasSavedData}
                            securityLevel={fieldState?.securityLevel}
                            lastSaved={fieldState?.lastSaved}
                            placeholder="12345"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  High Security Fields (Demo Only)
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => {
                      const fieldState = getFieldState('cardNumber');
                      return (
                        <FormItem>
                          <FormLabel>Card Number (High Security)</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => {
                      const fieldState = getFieldState('cvv');
                      return (
                        <FormItem>
                          <FormLabel>CVV (High Security)</FormLabel>
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

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => {
                  const fieldState = getFieldState('notes');
                  return (
                    <FormItem>
                      <FormLabel>Notes (Low Security)</FormLabel>
                      <FormControl>
                        <EnhancedFormInput
                          {...field}
                          fieldName="notes"
                          hasSavedData={fieldState?.hasSavedData}
                          securityLevel={fieldState?.securityLevel}
                          lastSaved={fieldState?.lastSaved}
                          placeholder="Additional notes..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => forceSave()}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Force Save
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => clearSavedData()}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Data
                </Button>

                <Button type="submit" className="flex-1">
                  Submit Form
                </Button>
              </div>
            </form>
          </Form>

          {savedMetadata && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>Fields saved: <strong>{savedMetadata.fieldCount}</strong></div>
                <div>Encrypted fields: <strong>{savedMetadata.secureFields}</strong></div>
                <div>Form type: <strong>{savedMetadata.formType}</strong></div>
                <div>Last saved: <strong>{new Date(savedMetadata.timestamp).toLocaleTimeString()}</strong></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};