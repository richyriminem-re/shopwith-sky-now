import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Variant {
  color: string;
  size: string;
  price: number;
  comparePrice?: number;
  stock: number;
}

interface VariantEditorProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

export const VariantEditor: React.FC<VariantEditorProps> = ({
  variants,
  onChange
}) => {
  const addVariant = () => {
    onChange([
      ...variants,
      {
        color: '',
        size: '',
        price: 0,
        stock: 0,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      onChange(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = variants.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    );
    onChange(updated);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {variants.map((variant, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Variant {index + 1}</Badge>
                {variant.color && variant.size && (
                  <Badge variant="secondary">
                    {variant.color} / {variant.size}
                  </Badge>
                )}
              </div>
              {variants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`color-${index}`}>Color *</Label>
                <Input
                  id={`color-${index}`}
                  placeholder="e.g., Black"
                  value={variant.color}
                  onChange={(e) => updateVariant(index, 'color', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`size-${index}`}>Size *</Label>
                <Input
                  id={`size-${index}`}
                  placeholder="e.g., M, 42, One Size"
                  value={variant.size}
                  onChange={(e) => updateVariant(index, 'size', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`price-${index}`}>Price (₦) *</Label>
                <Input
                  id={`price-${index}`}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={variant.price || ''}
                  onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                />
                {variant.price > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(variant.price)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`stock-${index}`}>Stock *</Label>
                <Input
                  id={`stock-${index}`}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={variant.stock || ''}
                  onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="space-y-2">
                <Label htmlFor={`comparePrice-${index}`}>
                  Compare Price (₦) - Optional
                </Label>
                <Input
                  id={`comparePrice-${index}`}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Leave empty if no discount"
                  value={variant.comparePrice || ''}
                  onChange={(e) => updateVariant(index, 'comparePrice', parseFloat(e.target.value) || undefined)}
                />
                {variant.comparePrice && variant.comparePrice > variant.price && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      {formatPrice(variant.comparePrice)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(((variant.comparePrice - variant.price) / variant.comparePrice) * 100)}% OFF
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addVariant}
        className="w-full tap-target-md"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Variant
      </Button>

      {variants.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Total variants: {variants.length} | 
          Total stock: {variants.reduce((sum, v) => sum + v.stock, 0)} |
          Price range: {variants.length > 0 && formatPrice(Math.min(...variants.map(v => v.price)))} - {variants.length > 0 && formatPrice(Math.max(...variants.map(v => v.price)))}
        </div>
      )}
    </div>
  );
};