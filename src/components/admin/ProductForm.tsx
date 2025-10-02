import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { VariantEditor, VariantData } from "./VariantEditor";
import { TagInput } from "./TagInput";
import { PrimaryCategory, Subcategory } from "@/types";
import { useState, useEffect } from "react";

const productFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  handle: z
    .string()
    .min(3)
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      "Handle must be URL-safe (lowercase, numbers, hyphens only)"
    ),
  description: z.string().min(10, "Description must be at least 10 characters"),
  primary_category: z.enum([
    "bags-shoes",
    "mens-fashion",
    "womens-fashion",
    "beauty-fragrance",
  ]),
  subcategory: z.string().min(1, "Subcategory is required"),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seo_title: z.string().max(60, "SEO title must be 60 characters or less").optional(),
  seo_description: z.string().max(160, "SEO description must be 160 characters or less").optional(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: {
    product: ProductFormData;
    images: Array<{ url: string; alt_text?: string; sort_order: number }>;
    variants: VariantData[];
  }) => Promise<void>;
  onCancel: () => void;
}

const subcategoryMap: Record<PrimaryCategory, Subcategory[]> = {
  "bags-shoes": ["mens-shoes", "womens-shoes", "bags", "travel-bags"],
  "mens-fashion": [
    "mens-tops",
    "mens-bottoms",
    "mens-outerwear",
    "mens-accessories",
  ],
  "womens-fashion": [
    "womens-tops",
    "womens-dresses",
    "womens-bottoms",
    "womens-outerwear",
    "womens-accessories",
  ],
  "beauty-fragrance": ["perfumes", "body-sprays", "skincare", "makeup"],
};

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [images, setImages] = useState<Array<{ url: string; alt_text?: string; sort_order: number }>>(
    initialData?.images || []
  );
  const [variants, setVariants] = useState<VariantData[]>(
    initialData?.variants || [
      {
        sku: "",
        price: 0,
        stock: 0,
      },
    ]
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      is_featured: false,
      is_active: true,
    },
  });

  const title = watch("title");
  const primaryCategory = watch("primary_category");
  const brand = watch("brand");
  const isFeatured = watch("is_featured");
  const isActive = watch("is_active");
  const seoTitle = watch("seo_title");
  const seoDescription = watch("seo_description");

  // Auto-generate handle from title
  useEffect(() => {
    if (title && !initialData) {
      const handle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("handle", handle);
    }
  }, [title, setValue, initialData]);

  // Reset subcategory when primary category changes
  useEffect(() => {
    if (primaryCategory && !initialData) {
      setValue("subcategory", "");
    }
  }, [primaryCategory, setValue, initialData]);

  const availableSubcategories = primaryCategory
    ? subcategoryMap[primaryCategory as PrimaryCategory]
    : [];

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: "",
        price: 0,
        stock: 0,
      },
    ]);
  };

  const updateVariant = (index: number, variant: VariantData) => {
    const newVariants = [...variants];
    newVariants[index] = variant;
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    // Validation
    if (images.length === 0) {
      alert("Please add at least one image");
      return;
    }

    if (variants.length === 0 || variants.some(v => !v.sku || v.price <= 0)) {
      alert("Please add at least one valid variant with SKU and price");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        product: { ...data, tags },
        images,
        variants,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold">Basic Information</h3>

        <div className="space-y-2">
          <Label>Product Title *</Label>
          <Input
            {...register("title")}
            placeholder="e.g., Classic Leather Backpack"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Product Handle *</Label>
          <Input
            {...register("handle")}
            placeholder="classic-leather-backpack"
          />
          {errors.handle && (
            <p className="text-sm text-destructive">{errors.handle.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            URL-safe identifier (auto-generated from title)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Description *</Label>
          <Textarea
            {...register("description")}
            placeholder="Detailed product description..."
            rows={5}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Brand</Label>
          <Input {...register("brand")} placeholder="e.g., Nike" />
        </div>

        <TagInput tags={tags} onChange={setTags} />
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="font-semibold">Categories</h3>

        <div className="space-y-2">
          <Label>Primary Category *</Label>
          <Select
            value={primaryCategory}
            onValueChange={(value) => setValue("primary_category", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bags-shoes">Bags & Shoes</SelectItem>
              <SelectItem value="mens-fashion">Men's Fashion</SelectItem>
              <SelectItem value="womens-fashion">Women's Fashion</SelectItem>
              <SelectItem value="beauty-fragrance">Beauty & Fragrance</SelectItem>
            </SelectContent>
          </Select>
          {errors.primary_category && (
            <p className="text-sm text-destructive">
              {errors.primary_category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Subcategory *</Label>
          <Select
            value={watch("subcategory")}
            onValueChange={(value) => setValue("subcategory", value)}
            disabled={!primaryCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {availableSubcategories.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subcategory && (
            <p className="text-sm text-destructive">{errors.subcategory.message}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Images */}
      <ImageUploader images={images} onChange={setImages} />

      <Separator />

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Product Variants</h3>
          <Button type="button" onClick={addVariant} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Variant
          </Button>
        </div>

        <div className="space-y-3">
          {variants.map((variant, index) => (
            <VariantEditor
              key={index}
              variant={variant}
              index={index}
              onChange={(v) => updateVariant(index, v)}
              onRemove={() => removeVariant(index)}
              canRemove={variants.length > 1}
              brandSuggestion={brand}
              categorySuggestion={primaryCategory}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* SEO & Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold">SEO & Settings</h3>

        <div className="space-y-2">
          <Label>SEO Title</Label>
          <Input
            {...register("seo_title")}
            placeholder="Optimized title for search engines"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">
            {seoTitle?.length || 0}/60 characters
          </p>
          {errors.seo_title && (
            <p className="text-sm text-destructive">{errors.seo_title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>SEO Description</Label>
          <Textarea
            {...register("seo_description")}
            placeholder="Optimized description for search engines"
            maxLength={160}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {seoDescription?.length || 0}/160 characters
          </p>
          {errors.seo_description && (
            <p className="text-sm text-destructive">
              {errors.seo_description.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Featured Product</Label>
            <p className="text-xs text-muted-foreground">
              Show on homepage and featured sections
            </p>
          </div>
          <Switch
            checked={isFeatured}
            onCheckedChange={(checked) => setValue("is_featured", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Active Status</Label>
            <p className="text-xs text-muted-foreground">
              Product is visible to customers
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
