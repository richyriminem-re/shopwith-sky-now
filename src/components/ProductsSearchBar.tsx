/**
 * Enhanced Products Search Bar
 * Integrates with the new filter system and provides advanced search functionality
 */

import SearchInput from '@/components/SearchInput';
import { useFilterStore } from '@/lib/filterManager';

interface ProductsSearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

const ProductsSearchBar = ({ 
  placeholder = "Search products...", 
  className = "",
  onSearch 
}: ProductsSearchBarProps) => {
  const { searchQuery, setSearchQuery, trackFilterUsage } = useFilterStore();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
    
    // Track search analytics
    if (query.trim()) {
      trackFilterUsage('search', query.trim(), 0);
    }
  };

  return (
    <SearchInput
      placeholder={placeholder}
      className={className}
      onSearch={handleSearch}
      showSuggestions={true}
      debounceMs={300}
    />
  );
};

export default ProductsSearchBar;