/**
 * Enhanced Search Input Component
 * Provides debounced search functionality with clear button and loading states
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useFilterStore } from '@/lib/filterManager';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'category';
  icon?: React.ReactNode;
}

const SearchInput = ({ 
  placeholder = "Search products...", 
  className = "",
  debounceMs = 300,
  showSuggestions = true,
  onSearch,
  onFocus,
  onBlur
}: SearchInputProps) => {
  const { searchQuery, setSearchQuery } = useFilterStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Popular search suggestions (could be fetched from API)
  const popularSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'nike shoes', type: 'popular', icon: <TrendingUp size={14} /> },
    { id: '2', text: 'black dress', type: 'popular', icon: <TrendingUp size={14} /> },
    { id: '3', text: 'perfume', type: 'popular', icon: <TrendingUp size={14} /> },
    { id: '4', text: 'handbag', type: 'popular', icon: <TrendingUp size={14} /> },
  ];

  // Get recent searches from localStorage
  const getRecentSearches = useCallback((): SearchSuggestion[] => {
    try {
      const recent = localStorage.getItem('recent-searches');
      if (recent) {
        const searches = JSON.parse(recent);
        return searches.map((text: string, index: number) => ({
          id: `recent-${index}`,
          text,
          type: 'recent' as const,
          icon: <Clock size={14} />
        }));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
    return [];
  }, []);

  // Save search to recent searches
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim() || query.length < 2) return;

    try {
      const recent = getRecentSearches().map(s => s.text);
      const updated = [query, ...recent.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }, [getRecentSearches]);

  // Update suggestions based on input and focus state
  useEffect(() => {
    if (!showSuggestions || !isFocused) {
      setSuggestions([]);
      return;
    }

    const recent = getRecentSearches();
    
    if (!localQuery.trim()) {
      // Show recent and popular when no query
      setSuggestions([...recent.slice(0, 3), ...popularSuggestions.slice(0, 3)]);
    } else {
      // Filter suggestions based on query
      const query = localQuery.toLowerCase();
      const filtered = [
        ...recent.filter(s => s.text.toLowerCase().includes(query)),
        ...popularSuggestions.filter(s => s.text.toLowerCase().includes(query))
      ].slice(0, 5);
      
      setSuggestions(filtered);
    }
  }, [localQuery, isFocused, showSuggestions, getRecentSearches]);

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (localQuery !== searchQuery) {
      setIsDebouncing(true);
      
      timeoutRef.current = setTimeout(() => {
        setSearchQuery(localQuery);
        onSearch?.(localQuery);
        setIsDebouncing(false);
        
        // Save to recent searches if query is substantial
        if (localQuery.trim().length >= 2) {
          saveRecentSearch(localQuery.trim());
        }
      }, debounceMs);
    } else {
      setIsDebouncing(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localQuery, searchQuery, setSearchQuery, onSearch, debounceMs, saveRecentSearch]);

  // Sync with external search query changes
  useEffect(() => {
    if (searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay blur to allow suggestion clicks
    setTimeout(() => {
      setIsFocused(false);
      onBlur?.();
    }, 150);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setLocalQuery(suggestion.text);
    setSearchQuery(suggestion.text);
    onSearch?.(suggestion.text);
    saveRecentSearch(suggestion.text);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      setIsFocused(false);
      inputRef.current?.blur();
      if (localQuery.trim()) {
        saveRecentSearch(localQuery.trim());
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="neu-input flex items-center gap-2 px-2 py-1.5">
        <Search 
          size={14} 
          className="text-neu-muted" 
        />
        
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-neu-primary placeholder:text-neu-muted focus:outline-none text-sm"
          aria-label="Search products"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />

        {/* Loading Indicator */}
        {isDebouncing && (
          <div className="w-3 h-3 border-2 border-neu-primary border-t-transparent rounded-full animate-spin" />
        )}

        {/* Clear Button */}
        {localQuery && !isDebouncing && (
          <button
            onClick={handleClear}
            className="text-neu-muted hover:text-neu-primary transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && isFocused && suggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 neu-surface border border-border rounded-lg overflow-hidden z-50"
          role="listbox"
          aria-label="Search suggestions"
        >
          <div className="py-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-accent text-sm flex items-center gap-2 transition-colors"
                role="option"
                aria-selected="false"
              >
                <span className="text-muted-foreground flex-shrink-0">
                  {suggestion.icon}
                </span>
                <span className="flex-1 text-foreground">
                  {suggestion.text}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {suggestion.type}
                </span>
              </button>
            ))}
          </div>

          {/* Clear Recent Searches */}
          {suggestions.some(s => s.type === 'recent') && (
            <div className="border-t border-border px-4 py-2">
              <button
                onClick={() => {
                  localStorage.removeItem('recent-searches');
                  setSuggestions(suggestions.filter(s => s.type !== 'recent'));
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear recent searches
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;