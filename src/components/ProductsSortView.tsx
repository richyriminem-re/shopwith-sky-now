import { useState } from 'react';
import { SortAsc, Grid2X2, Grid3X3, Check, X } from 'lucide-react';
import { useFilterStore } from '@/lib/filterManager';
import type { SortOption } from '@/types';

interface ProductsSortViewProps {
  viewMode: 'grid-2' | 'grid-3';
  onViewModeChange: (mode: 'grid-2' | 'grid-3') => void;
}

const ProductsSortView = ({ viewMode, onViewModeChange }: ProductsSortViewProps) => {
  const { sort, setSort } = useFilterStore();
  const [showSortModal, setShowSortModal] = useState(false);

  const sortOptions: { value: SortOption; label: string; description: string }[] = [
    { value: 'relevance', label: 'Best Match', description: 'Most relevant to your search' },
    { value: 'newest', label: 'Newest First', description: 'Latest arrivals' },
    { value: 'price-low', label: 'Price: Low to High', description: 'Lowest price first' },
    { value: 'price-high', label: 'Price: High to Low', description: 'Highest price first' },
  ];

  const viewOptions = [
    { value: 'grid-2' as const, icon: Grid2X2, label: '2 Columns' },
    { value: 'grid-3' as const, icon: Grid3X3, label: '3 Columns' },
  ];

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setShowSortModal(false);
  };

  const getCurrentSortLabel = () => {
    return sortOptions.find(option => option.value === sort)?.label || 'Best Match';
  };

  return (
    <>
      <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4">
        {/* Sort Button */}
        <button
          onClick={() => setShowSortModal(true)}
          className="neu-pressable flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 flex-1 sm:flex-initial min-w-0 text-xs sm:text-sm"
        >
          <SortAsc size={14} className="text-muted-foreground flex-shrink-0 sm:w-4 sm:h-4" />
          <span className="font-medium truncate">{getCurrentSortLabel()}</span>
        </button>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => onViewModeChange(option.value)}
                className={`neu-icon-button p-1.5 sm:p-2 ${
                  viewMode === option.value ? 'active' : ''
                }`}
                title={option.label}
              >
                <Icon size={14} className="sm:w-4 sm:h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setShowSortModal(false)}>
          <div 
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 neu-modal p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Sort By</h2>
              <button
                onClick={() => setShowSortModal(false)}
                className="neu-icon-button"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className="w-full neu-pressable p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                    {sort === option.value && (
                      <Check size={16} className="text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsSortView;