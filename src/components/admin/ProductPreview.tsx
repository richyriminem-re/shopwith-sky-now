import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Heart, Share, ShoppingCart } from 'lucide-react';
import { ImageGallery } from '@/components/product/ImageGallery';
import { QuantitySelector } from '@/components/product/QuantitySelector';
import type { Product } from '@/types';

interface ProductPreviewProps {
  productData: {
    title: string;
    brand?: string;
    description: string;
    images: string[];
    primaryCategory: string;
    subcategory: string;
    variants: {
      color: string;
      size: string;
      price: number;
      comparePrice?: number;
      stock: number;
    }[];
  };
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({ productData }) => {
  const [selectedVariant, setSelectedVariant] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);

  if (!productData.title) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Enter product details to see preview</p>
        </CardContent>
      </Card>
    );
  }

  const variant = productData.variants[selectedVariant] || productData.variants[0];
  const hasDiscount = variant?.comparePrice && variant.comparePrice > variant.price;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const availableColors = [...new Set(productData.variants.map(v => v.color).filter(Boolean))];
  const availableSizes = [...new Set(productData.variants.map(v => v.size).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Images */}
      {productData.images.length > 0 && (
        <div className="aspect-square w-full max-w-md mx-auto">
          <ImageGallery 
            images={productData.images} 
            title={productData.title}
            currentIndex={0}
            onIndexChange={() => {}}
          />
        </div>
      )}

      {/* Product Info */}
      <div className="space-y-4">
        {/* Brand & Category */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {productData.brand && (
            <Badge variant="outline">{productData.brand}</Badge>
          )}
          <Badge variant="secondary">
            {productData.primaryCategory.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold">{productData.title}</h1>

        {/* Rating (Mock) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-4 w-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">(0 reviews)</span>
        </div>

        {/* Price */}
        {variant && (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(variant.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(variant.comparePrice!)}
                </span>
                <Badge variant="destructive">
                  {Math.round(((variant.comparePrice! - variant.price) / variant.comparePrice!) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>
        )}

        {/* Color Selection */}
        {availableColors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Color</p>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => {
                const variantIndex = productData.variants.findIndex(v => v.color === color);
                const isSelected = selectedVariant === variantIndex;
                return (
                  <Button
                    key={color}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariant(variantIndex)}
                    disabled={!color}
                  >
                    {color || 'Not specified'}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {availableSizes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Size</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const variantIndex = productData.variants.findIndex(v => v.size === size);
                const isSelected = selectedVariant === variantIndex;
                return (
                  <Button
                    key={size}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariant(variantIndex)}
                    disabled={!size}
                  >
                    {size || 'Not specified'}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Status */}
        {variant && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Stock</span>
              <Badge variant={variant.stock > 0 ? "default" : "destructive"}>
                {variant.stock > 0 ? `${variant.stock} available` : 'Out of stock'}
              </Badge>
            </div>
          </div>
        )}

        {/* Quantity & Add to Cart */}
        {variant && variant.stock > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <QuantitySelector
                quantity={quantity}
                maxQuantity={variant.stock}
                onQuantityChange={setQuantity}
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 tap-target-md" disabled>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon" className="tap-target-md" disabled>
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="tap-target-md" disabled>
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Description */}
        {productData.description && (
          <div className="space-y-2">
            <h3 className="font-medium">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {productData.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};