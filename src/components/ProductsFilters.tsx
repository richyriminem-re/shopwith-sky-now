import { useState, useEffect } from 'react';
import { X, Sliders, Check, ChevronDown } from 'lucide-react';
import { useFilterStore } from '@/lib/filterManager';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { FilterState, Subcategory } from '@/types';
import { isValidSubcategoryForPrimary } from '@/utils/filterValidation';

interface ProductsFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  availableSizes?: string[];
  availableColors?: string[];
}

const ProductsFilters = ({ 
  isOpen, 
  onClose, 
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  availableColors = ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Brown', 'Pink', 'Purple', 'Yellow', 'Orange']
}: ProductsFiltersProps) => {
  const { filters, setFilters } = useFilterStore();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Bags & Shoes']));
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');

  // Sync local filters with global filters when they change externally
  useEffect(() => {
    setLocalFilters(filters);
    // Sync text inputs with current price range
    const currentRange = filters.priceRange || [0, 500000];
    setMinPriceInput(currentRange[0].toString());
    setMaxPriceInput(currentRange[1].toString());
  }, [filters]);

  const handlePriceChange = (value: number[]) => {
    setLocalFilters(prev => ({ ...prev, priceRange: [value[0], value[1]] }));
    // Sync text inputs when slider changes
    setMinPriceInput(value[0].toString());
    setMaxPriceInput(value[1].toString());
  };

  const handleMinPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    setMinPriceInput(value);
    
    const numValue = parseInt(value) || 0;
    const currentMax = localFilters.priceRange?.[1] || 500000;
    
    if (numValue <= currentMax && numValue <= 500000) {
      setLocalFilters(prev => ({ ...prev, priceRange: [numValue, currentMax] }));
    }
  };

  const handleMaxPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    setMaxPriceInput(value);
    
    const numValue = parseInt(value) || 500000;
    const currentMin = localFilters.priceRange?.[0] || 0;
    
    if (numValue >= currentMin && numValue <= 500000) {
      setLocalFilters(prev => ({ ...prev, priceRange: [currentMin, numValue] }));
    }
  };

  const handlePriceInputBlur = () => {
    // Validate and correct the inputs on blur
    const minVal = parseInt(minPriceInput) || 0;
    const maxVal = parseInt(maxPriceInput) || 500000;
    
    let correctedMin = Math.max(0, Math.min(minVal, 500000));
    let correctedMax = Math.max(0, Math.min(maxVal, 500000));
    
    // Ensure min <= max
    if (correctedMin > correctedMax) {
      correctedMax = correctedMin;
    }
    
    setMinPriceInput(correctedMin.toString());
    setMaxPriceInput(correctedMax.toString());
    setLocalFilters(prev => ({ ...prev, priceRange: [correctedMin, correctedMax] }));
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    setLocalFilters(prev => ({
      ...prev,
      subcategories: prev.subcategories?.includes(subcategory as Subcategory)
        ? prev.subcategories.filter(s => s !== subcategory)
        : [...(prev.subcategories || []), subcategory as Subcategory]
    }));
  };

  const handleSizeToggle = (size: string) => {
    setLocalFilters(prev => ({
      ...prev,
      sizes: prev.sizes?.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...(prev.sizes || []), size]
    }));
  };

  const handleColorToggle = (color: string) => {
    setLocalFilters(prev => ({
      ...prev,
      colors: prev.colors?.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...(prev.colors || []), color]
    }));
  };

  const handleApplyFilters = () => {
    const selectedSubs = localFilters.subcategories || [];
    const primary = localFilters.primaryCategory;

    if (primary && selectedSubs.length > 0) {
      const hasIncompatible = selectedSubs.some(sub => !isValidSubcategoryForPrimary(sub as Subcategory, primary));
      if (hasIncompatible) {
        // Filter out incompatible subcategories instead of removing primaryCategory
        const compatibleSubs = selectedSubs.filter(sub => isValidSubcategoryForPrimary(sub as Subcategory, primary));
        const updatedFilters = { 
          ...localFilters, 
          subcategories: compatibleSubs.length > 0 ? compatibleSubs : undefined 
        };
        setFilters(updatedFilters);
        onClose();
        return;
      }
    }

    setFilters(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    setLocalFilters({});
    setFilters({});
  };

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      
      // Toggle the clicked category independently
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      
      return newSet;
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.subcategories?.length) count += localFilters.subcategories.length;
    if (localFilters.sizes?.length) count += localFilters.sizes.length;
    if (localFilters.colors?.length) count += localFilters.colors.length;
    if (localFilters.priceRange) count += 1;
    if (localFilters.showDeals) count += 1;
    return count;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `₦${(price / 1000).toFixed(0)}K`;
    return `₦${price}`;
  };

  const getAvailableSubcategories = () => {
    return [
      {
        groupLabel: 'Bags & Shoes',
        subcategories: [
          { value: 'mens-shoes', label: "Men's Shoes" },
          { value: 'womens-shoes', label: "Women's Shoes" },
          { value: 'bags', label: 'Bags & Handbags' },
          { value: 'travel-bags', label: 'Backpacks & Travel' }
        ]
      },
      {
        groupLabel: "Men's Fashion",
        subcategories: [
          { value: 'mens-tops', label: 'Tops' },
          { value: 'mens-bottoms', label: 'Bottoms' },
          { value: 'mens-outerwear', label: 'Outerwear' },
          { value: 'mens-accessories', label: 'Accessories' }
        ]
      },
      {
        groupLabel: "Women's Fashion",
        subcategories: [
          { value: 'womens-tops', label: 'Tops & Blouses' },
          { value: 'womens-dresses', label: 'Dresses & Gowns' },
          { value: 'womens-bottoms', label: 'Bottoms' },
          { value: 'womens-outerwear', label: 'Outerwear' },
          { value: 'womens-accessories', label: 'Accessories' }
        ]
      },
      {
        groupLabel: 'Beauty & Fragrance',
        subcategories: [
          { value: 'perfumes', label: 'Perfumes' },
          { value: 'body-sprays', label: 'Body Sprays' },
          { value: 'skincare', label: 'Skincare' },
          { value: 'makeup', label: 'Makeup' }
        ]
      }
    ];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose}>
      <div 
        className="fixed inset-x-0 bottom-0 bg-background border-t border-border rounded-t-lg p-4 max-h-[90vh] overflow-hidden animate-slide-in-right z-[60]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="neu-icon-button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pb-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            
            {/* Left Column - Price Range & Categories */}
            <div className="space-y-4">
              <div className="neu-surface p-3">
                <h3 className="font-medium text-foreground mb-3 text-sm">Price Range</h3>
                <div className="px-1">
                  <Slider
                    value={localFilters.priceRange || [0, 500000]}
                    onValueChange={handlePriceChange}
                    max={500000}
                    step={1000}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mb-3">
                    <span>{formatPrice(localFilters.priceRange?.[0] || 0)}</span>
                    <span>{formatPrice(localFilters.priceRange?.[1] || 500000)}</span>
                  </div>
                  
                  {/* Price Input Boxes */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Price</label>
                      <Input
                        type="text"
                        placeholder="0"
                        value={minPriceInput}
                        onChange={handleMinPriceInput}
                        onBlur={handlePriceInputBlur}
                        className="text-xs h-9 border-2 border-border/60 hover:border-border focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Price</label>
                      <Input
                        type="text"
                        placeholder="500000"
                        value={maxPriceInput}
                        onChange={handleMaxPriceInput}
                        onBlur={handlePriceInputBlur}
                        className="text-xs h-9 border-2 border-border/60 hover:border-border focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="neu-surface p-3">
                <h3 className="font-medium text-foreground mb-3 text-sm">Categories</h3>
                <div className="space-y-2">
                  {getAvailableSubcategories().map((group) => (
                    <Collapsible
                      key={group.groupLabel}
                      open={expandedCategories.has(group.groupLabel)}
                      onOpenChange={() => toggleCategoryExpansion(group.groupLabel)}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/50 transition-colors">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {group.groupLabel}
                        </span>
                        <ChevronDown 
                          size={14} 
                          className={`transition-transform ${
                            expandedCategories.has(group.groupLabel) ? 'rotate-180' : ''
                          }`} 
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1.5 pt-1">
                        <div className="grid grid-cols-1 gap-1.5 pl-2">
                          {group.subcategories.map((subcategory) => (
                            <div key={subcategory.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`subcategory-${subcategory.value}`}
                                checked={localFilters.subcategories?.includes(subcategory.value as Subcategory) || false}
                                onCheckedChange={() => handleSubcategoryToggle(subcategory.value)}
                                className="h-3 w-3"
                              />
                              <label
                                htmlFor={`subcategory-${subcategory.value}`}
                                className="text-xs font-medium text-foreground cursor-pointer flex-1"
                              >
                                {subcategory.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sizes & Colors */}
            <div className="space-y-4">
              {/* Sizes */}
              <div className="neu-surface p-3">
                <h3 className="font-medium text-foreground mb-3 text-sm">Sizes</h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`neu-chip text-xs py-1.5 px-2 ${
                        localFilters.sizes?.includes(size) ? 'active' : ''
                      }`}
                    >
                      {size}
                      {localFilters.sizes?.includes(size) && (
                        <Check size={10} className="ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="neu-surface p-3">
                <h3 className="font-medium text-foreground mb-3 text-sm">Colors</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={`neu-chip text-xs py-1.5 px-2 ${
                        localFilters.colors?.includes(color) ? 'active' : ''
                      }`}
                    >
                      {color}
                      {localFilters.colors?.includes(color) && (
                        <Check size={10} className="ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="flex-1 text-sm py-2"
            disabled={getActiveFilterCount() === 0}
          >
            Clear All
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="flex-1 neu-button-enhanced text-sm py-2"
          >
            Apply Filters ({getActiveFilterCount()})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductsFilters;