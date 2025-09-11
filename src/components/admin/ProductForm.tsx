import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { PRIMARY_CATEGORIES, SUBCATEGORIES_BY_PRIMARY } from '@/data/categories';
import type { Product } from '@/types';
import { VariantEditor } from './VariantEditor';
import { ImageUploader } from './ImageUploader';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { FormRecoveryDialog } from '@/components/forms/FormRecoveryDialog';
import { useToast } from '@/hooks/use-toast';

const productFormSchema = z.object({
  title: z.string().min(1, 'Product name is required'),
  brand: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  primaryCategory: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  variants: z.array(z.object({
    color: z.string().min(1, 'Color is required'),
    size: z.string().min(1, 'Size is required'),
    price: z.number().min(0, 'Price must be positive'),
    comparePrice: z.number().optional(),
    stock: z.number().min(0, 'Stock must be non-negative'),
  })).min(1, 'At least one variant is required'),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [isBasicOpen, setIsBasicOpen] = React.useState(true);
  const [isImagesOpen, setIsImagesOpen] = React.useState(true);
  const [isVariantsOpen, setIsVariantsOpen] = React.useState(true);
  const [showRecoveryDialog, setShowRecoveryDialog] = React.useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? {
      title: product.title,
      brand: product.brand || '',
      description: product.description,
      images: product.images,
      primaryCategory: product.primaryCategory,
      subcategory: product.subcategory,
      variants: product.variants.map(v => ({
        color: v.color || '',
        size: v.size || '',
        price: v.price,
        comparePrice: v.comparePrice,
        stock: v.stock,
      })),
    } : {
      title: '',
      brand: '',
      description: '',
      images: [],
      primaryCategory: '',
      subcategory: '',
      variants: [{
        color: '',
        size: '',
        price: 0,
        stock: 0,
      }],
    },
  });

  // Form persistence with auto-save and recovery
  const {
    restoreData,
    clearSavedData,
    isRecoveryAvailable,
    savedMetadata,
    forceSave
  } = useFormPersistence({
    storageKey: product ? `product-edit-${product.id}` : 'product-create',
    watch: ['title', 'brand', 'description', 'images', 'primaryCategory', 'subcategory', 'variants'],
    form,
    enabled: true,
    formType: product ? 'Product Edit' : 'Product Creation',
    autoCleanup: true,
    expirationHours: 24,
    encryptSensitiveFields: false,
    onDataFound: () => {
      setShowRecoveryDialog(true);
    }
  });

  const selectedCategory = form.watch('primaryCategory');
  const subcategoriesForSelected = selectedCategory ? SUBCATEGORIES_BY_PRIMARY[selectedCategory as keyof typeof SUBCATEGORIES_BY_PRIMARY] : [];

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
      // Clear saved data on successful submission
      clearSavedData();
      toast({
        title: 'Success',
        description: `Product ${product ? 'updated' : 'created'} successfully!`,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRecoverData = async () => {
    const success = await restoreData();
    if (success) {
      setShowRecoveryDialog(false);
      toast({
        title: 'Data Restored',
        description: 'Your previous form data has been recovered.',
      });
    }
  };

  const handleDiscardData = () => {
    clearSavedData();
    setShowRecoveryDialog(false);
    toast({
      title: 'Data Discarded',
      description: 'Previous form data has been cleared.',
    });
  };

  const handleForceSave = async () => {
    await forceSave();
    toast({
      title: 'Progress Saved',
      description: 'Your form progress has been saved.',
    });
  };

  return (
    <div className="space-y-4">
      {/* Recovery Dialog */}
      {savedMetadata && (
        <FormRecoveryDialog
          isOpen={showRecoveryDialog}
          onClose={() => setShowRecoveryDialog(false)}
          onRecover={handleRecoverData}
          onDiscard={handleDiscardData}
          savedData={savedMetadata}
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Basic Information */}
          <Collapsible open={isBasicOpen} onOpenChange={setIsBasicOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="hover:bg-muted/50 cursor-pointer">
                  <CardTitle className="flex items-center justify-between text-lg">
                    Basic Information
                    <ChevronDown className={`h-4 w-4 transition-transform ${isBasicOpen ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brand name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRIMARY_CATEGORIES.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subcategory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subcategoriesForSelected.map((sub) => (
                                <SelectItem key={sub.value} value={sub.value}>
                                  {sub.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter product description" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Images */}
          <Collapsible open={isImagesOpen} onOpenChange={setIsImagesOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="hover:bg-muted/50 cursor-pointer">
                  <CardTitle className="flex items-center justify-between text-lg">
                    Product Images
                    <ChevronDown className={`h-4 w-4 transition-transform ${isImagesOpen ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images *</FormLabel>
                        <FormControl>
                          <ImageUploader
                            images={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Variants */}
          <Collapsible open={isVariantsOpen} onOpenChange={setIsVariantsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="hover:bg-muted/50 cursor-pointer">
                  <CardTitle className="flex items-center justify-between text-lg">
                    Variants & Pricing
                    <ChevronDown className={`h-4 w-4 transition-transform ${isVariantsOpen ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="variants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Variants *</FormLabel>
                        <FormControl>
                          <VariantEditor
                            variants={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none tap-target-md"
            >
              {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleForceSave}
              disabled={isLoading}
              className="flex items-center gap-2 tap-target-md"
            >
              <Save className="h-4 w-4" />
              Save Progress
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 sm:flex-none tap-target-md"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};