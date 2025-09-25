/**
 * Simple wrapper around SearchInput for consistency
 */

import SearchInput from '@/components/SearchInput';

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
  return (
    <SearchInput
      placeholder={placeholder}
      className={className}
      onSearch={onSearch}
      showSuggestions={true}
      debounceMs={300}
    />
  );
};

export default ProductsSearchBar;