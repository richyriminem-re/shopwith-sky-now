import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export interface VariantData {
  sku: string;
  price: number;
  compare_price?: number;
  stock: number;
  size?: string;
  color?: string;
}

interface VariantEditorProps {
  variant: VariantData;
  index: number;
  onChange: (variant: VariantData) => void;
  onRemove: () => void;
  canRemove: boolean;
  brandSuggestion?: string;
  categorySuggestion?: string;
}

export function VariantEditor({
  variant,
  index,
  onChange,
  onRemove,
  canRemove,
  brandSuggestion,
  categorySuggestion,
}: VariantEditorProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const handleChange = (field: keyof VariantData, value: any) => {
    onChange({ ...variant, [field]: value });
  };

  const generateSKU = () => {
    const brand = brandSuggestion?.toUpperCase().slice(0, 3) || "PRD";
    const category = categorySuggestion?.toUpperCase().slice(0, 3) || "CTG";
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${brand}-${category}-${random}`;
  };

  const discount =
    variant.compare_price && variant.price
      ? Math.round(
          ((variant.compare_price - variant.price) / variant.compare_price) *
            100
        )
      : 0;

  const stockStatus =
    variant.stock === 0
      ? { label: "Out of Stock", color: "destructive" as const }
      : variant.stock < 10
      ? { label: "Low Stock", color: "default" as const }
      : { label: "In Stock", color: "secondary" as const };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium flex-1"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span>Variant {index + 1}</span>
          {!isExpanded && variant.sku && (
            <span className="text-muted-foreground">- {variant.sku}</span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <Badge variant={stockStatus.color}>{stockStatus.label}</Badge>
          {discount > 0 && (
            <Badge variant="default" className="bg-green-500">
              -{discount}%
            </Badge>
          )}
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="space-y-2">
              <Label>SKU *</Label>
              <div className="flex gap-2">
                <Input
                  value={variant.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="e.g., BRD-CAT-001"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleChange("sku", generateSKU())}
                  className="shrink-0"
                >
                  Auto
                </Button>
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label>Stock Quantity *</Label>
              <Input
                type="number"
                min="0"
                value={variant.stock}
                onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>Price (₦) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={variant.price}
                onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            {/* Compare Price */}
            <div className="space-y-2">
              <Label>Compare Price (₦)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={variant.compare_price || ""}
                onChange={(e) =>
                  handleChange(
                    "compare_price",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="Original price"
              />
              {discount > 0 && (
                <p className="text-xs text-green-600">
                  Discount: {discount}% off
                </p>
              )}
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label>Size (Optional)</Label>
              <Input
                value={variant.size || ""}
                onChange={(e) => handleChange("size", e.target.value || undefined)}
                placeholder="e.g., M, 42, One Size"
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color (Optional)</Label>
              <Input
                value={variant.color || ""}
                onChange={(e) => handleChange("color", e.target.value || undefined)}
                placeholder="e.g., Black, Navy"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
