import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import { ProductPreview } from './ProductPreview';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Smartphone, Monitor } from 'lucide-react';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import type { Product } from '@/types';
import type { CreateProductData } from '@/services/mockProductsAPI';

interface ProductCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSubmit: (data: CreateProductData) => Promise<void>;
  isLoading?: boolean;
}

export const ProductCreateEditModal: React.FC<ProductCreateEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  isLoading = false
}) => {
  const { isMobile } = useResponsiveDesign();
  const [showPreview, setShowPreview] = React.useState(false);
  const [formData, setFormData] = React.useState<CreateProductData>({
    title: '',
    brand: '',
    description: '',
    images: [],
    primaryCategory: 'bags-shoes',
    subcategory: 'bags',
    variants: [{
      color: '',
      size: '',
      price: 0,
      stock: 0,
    }],
  });

  const handleFormSubmit = async (data: CreateProductData) => {
    setFormData(data);
    await onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {product ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
            
            {/* Mobile View Toggle */}
            {isMobile && (
              <div className="flex items-center gap-2">
                <Button
                  variant={!showPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Form
                </Button>
                <Button
                  variant={showPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            )}
          </div>
          
          {!isMobile && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span>Desktop Layout: Form + Live Preview</span>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isMobile ? (
            /* Mobile: Toggle between form and preview */
            <div className="h-full overflow-y-auto p-6">
              {!showPreview ? (
                <ProductForm
                  product={product}
                  onSubmit={handleFormSubmit}
                  onCancel={onClose}
                  isLoading={isLoading}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Live Preview</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Smartphone className="h-4 w-4" />
                      <span>Mobile View</span>
                    </div>
                  </div>
                  <ProductPreview productData={formData} />
                </div>
              )}
            </div>
          ) : (
            /* Desktop: Side by side */
            <div className="flex h-full">
              {/* Form Section */}
              <div className="flex-1 border-r overflow-y-auto p-6">
                <ProductForm
                  product={product}
                  onSubmit={handleFormSubmit}
                  onCancel={onClose}
                  isLoading={isLoading}
                />
              </div>
              
              {/* Preview Section */}
              <div className="w-96 bg-muted/20 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Live Preview</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>Product Page</span>
                    </div>
                  </div>
                  <div className="border rounded-lg bg-background p-4">
                    <ProductPreview productData={formData} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};