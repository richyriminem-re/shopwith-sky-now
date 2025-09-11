import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useNavigationMonitor } from '@/utils/navigationMonitor';

import { useFilterStore } from '@/lib/filterManager';
import type { FilterState } from '@/types';

const ActiveFilters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startNavigationTiming } = useNavigationMonitor();
  const { filters, updateFilters, clearFilters, searchQuery, setSearchQuery } = useFilterStore();

  const removeFilter = (filterType: keyof FilterState, value?: string) => {
    try {
      const newFilters = { ...filters };
      
      if (filterType === 'subcategories' && value) {
        newFilters.subcategories = newFilters.subcategories?.filter(s => s !== value) || [];
        if (newFilters.subcategories.length === 0) {
          delete newFilters.subcategories;
        }
      } else if (filterType === 'sizes' && value) {
        newFilters.sizes = newFilters.sizes?.filter(s => s !== value) || [];
        if (newFilters.sizes.length === 0) {
          delete newFilters.sizes;
        }
      } else if (filterType === 'colors' && value) {
        newFilters.colors = newFilters.colors?.filter(c => c !== value) || [];
        if (newFilters.colors.length === 0) {
          delete newFilters.colors;
        }
      } else if (filterType === 'priceRange') {
        delete newFilters.priceRange;
      } else if (filterType === 'showDeals') {
        delete newFilters.showDeals;
      } else if (filterType === 'primaryCategory') {
        delete newFilters.primaryCategory;
      }
      
      // Force update with complete filter replacement
      updateFilters(newFilters);
    } catch (error) {
      console.error('Error removing filter:', error);
      // Fallback: force a complete re-render
      setTimeout(() => updateFilters({ ...filters }), 0);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `₦${(price / 1000).toFixed(0)}K`;
    return `₦${price}`;
  };

  const getSubcategoryLabel = (subcategory: string) => {
    const labelMapping: Record<string, string> = {
      'mens-shoes': "Men's Shoes",
      'womens-shoes': "Women's Shoes",
      'bags': 'Bags & Handbags',
      'travel-bags': 'Backpacks & Travel',
      'mens-tops': 'Tops',
      'mens-bottoms': 'Bottoms',
      'mens-outerwear': 'Outerwear',
      'mens-accessories': 'Accessories',
      'womens-tops': 'Tops & Blouses',
      'womens-dresses': 'Dresses & Gowns',
      'womens-bottoms': 'Bottoms',
      'womens-outerwear': 'Outerwear',
      'womens-accessories': 'Accessories',
      'perfumes': 'Perfumes',
      'body-sprays': 'Body Sprays',
      'skincare': 'Skincare',
      'makeup': 'Makeup'
    };
    return labelMapping[subcategory] || subcategory;
  };

  const clearAllFilters = () => {
    try {
      // Clear search query first
      setSearchQuery('');
      // Then clear all filters
      clearFilters();
    } catch (error) {
      console.error('Error clearing filters:', error);
      // Use React Router navigation instead of page reload
      startNavigationTiming();
      navigate(location.pathname, { replace: true });
    }
  };

  const getActiveFilters = () => {
    const activeFilters: Array<{ type: 'search' | keyof FilterState; label: string; value?: string }> = [];
    
    if (searchQuery) {
      activeFilters.push({ type: 'search', label: `"${searchQuery}"` });
    }

    if (filters.primaryCategory) {
      const categoryLabels = {
        'bags-shoes': 'Bags & Shoes',
        'mens-fashion': "Men's Fashion", 
        'womens-fashion': "Women's Fashion",
        'beauty-fragrance': 'Beauty & Fragrance'
      };
      activeFilters.push({ type: 'primaryCategory', label: categoryLabels[filters.primaryCategory] || filters.primaryCategory });
    }
    
    if (filters.showDeals) {
      activeFilters.push({ type: 'showDeals', label: 'Deals & Discounts' });
    }
    
    if (filters.subcategories?.length) {
      filters.subcategories.forEach(subcategory => {
        activeFilters.push({ type: 'subcategories', label: getSubcategoryLabel(subcategory), value: subcategory });
      });
    }
    
    if (filters.sizes?.length) {
      filters.sizes.forEach(size => {
        activeFilters.push({ type: 'sizes', label: `Size ${size}`, value: size });
      });
    }
    
    if (filters.colors?.length) {
      filters.colors.forEach(color => {
        activeFilters.push({ type: 'colors', label: color, value: color });
      });
    }
    
    if (filters.priceRange) {
      activeFilters.push({ 
        type: 'priceRange', 
        label: `${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}` 
      });
    }
    
    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-foreground">Active filters:</span>
        {activeFilters.map((filter, index) => (
          <button
            key={`${filter.type}-${filter.value || filter.label}-${index}`}
            onClick={() => {
              if (filter.type === 'search') {
                setSearchQuery('');
              } else {
                removeFilter(filter.type as keyof FilterState, filter.value);
              }
            }}
            className="neu-chip flex items-center gap-1 text-xs active"
          >
            {filter.label}
            <X size={12} />
          </button>
        ))}
        <button
          onClick={clearAllFilters}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default ActiveFilters;