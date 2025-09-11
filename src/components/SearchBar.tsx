import { Search } from 'lucide-react';
import { useFilterStore } from '@/lib/filterManager';
import { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ 
  placeholder = "Search soft essentials…", 
  onSearch 
}: SearchBarProps) => {
  const { searchQuery, setSearchQuery } = useFilterStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchQuery(localQuery);
      onSearch?.(localQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [localQuery, setSearchQuery, onSearch]);

  return (
    <div className="neu-input flex items-center gap-2 px-3 py-2">
      <Search size={18} className="text-neu-muted" />
      <input
        id="search-bar"
        name="search"
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-neu-primary placeholder:text-neu-muted focus:outline-none"
        aria-label="Search products"
      />
    </div>
  );
};

export default SearchBar;