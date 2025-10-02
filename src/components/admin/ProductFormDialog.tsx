import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductForm } from "./ProductForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VariantData } from "./VariantEditor";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  productId,
  initialData,
  onSuccess,
}: ProductFormDialogProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleSubmit = async (data: {
    product: any;
    images: Array<{ url: string; alt_text?: string; sort_order: number }>;
    variants: VariantData[];
  }) => {
    try {
      if (productId) {
        // Update existing product
        const { error: productError } = await supabase
          .from("products")
          .update({
            title: data.product.title,
            handle: data.product.handle,
            description: data.product.description,
            primary_category: data.product.primary_category,
            subcategory: data.product.subcategory,
            brand: data.product.brand || null,
            tags: data.product.tags || [],
            seo_title: data.product.seo_title || null,
            seo_description: data.product.seo_description || null,
            featured: data.product.is_featured,
            is_active: data.product.is_active,
          })
          .eq("id", productId);

        if (productError) throw productError;

        // Delete existing images and variants
        await supabase.from("product_images").delete().eq("product_id", productId);
        await supabase.from("product_variants").delete().eq("product_id", productId);

        // Insert new images
        const { error: imagesError } = await supabase.from("product_images").insert(
          data.images.map((img) => ({
            product_id: productId,
            image_url: img.url,
            alt_text: img.alt_text || null,
            sort_order: img.sort_order,
          }))
        );

        if (imagesError) throw imagesError;

        // Insert new variants
        const { error: variantsError } = await supabase.from("product_variants").insert(
          data.variants.map((v) => ({
            product_id: productId,
            sku: v.sku,
            price: v.price,
            compare_price: v.compare_price || null,
            stock: v.stock,
            size: v.size || null,
            color: v.color || null,
          }))
        );

        if (variantsError) throw variantsError;

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const { data: newProduct, error: productError } = await supabase
          .from("products")
          .insert({
            title: data.product.title,
            handle: data.product.handle,
            description: data.product.description,
            primary_category: data.product.primary_category,
            subcategory: data.product.subcategory,
            brand: data.product.brand || null,
            tags: data.product.tags || [],
            seo_title: data.product.seo_title || null,
            seo_description: data.product.seo_description || null,
            featured: data.product.is_featured,
            is_active: data.product.is_active,
          })
          .select()
          .single();

        if (productError) throw productError;

        // Insert images
        const { error: imagesError } = await supabase.from("product_images").insert(
          data.images.map((img) => ({
            product_id: newProduct.id,
            image_url: img.url,
            alt_text: img.alt_text || null,
            sort_order: img.sort_order,
          }))
        );

        if (imagesError) throw imagesError;

        // Insert variants
        const { error: variantsError } = await supabase.from("product_variants").insert(
          data.variants.map((v) => ({
            product_id: newProduct.id,
            sku: v.sku,
            price: v.price,
            compare_price: v.compare_price || null,
            stock: v.stock,
            size: v.size || null,
            color: v.color || null,
          }))
        );

        if (variantsError) throw variantsError;

        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const content = (
    <ProductForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>
              {productId ? "Edit Product" : "Add New Product"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {productId ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
