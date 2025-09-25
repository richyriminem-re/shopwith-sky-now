import { useState, useEffect } from 'react';
import { LoadingErrorBoundary } from '@/components/LoadingErrorBoundary';
import { LoadingStateManager } from '@/components/LoadingStateManager';
import { Filter, Tag, Grid3x3, ShoppingBag, Crown, Flower2, Droplets } from 'lucide-react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import ProductsFilters from '@/components/ProductsFilters';
import ProductsSortView from '@/components/ProductsSortView';

import ActiveFilters from '@/components/ActiveFilters';
import { useProducts } from '@/hooks/useApi';
import { useFilterStore } from '@/lib/filterManager';
import { useFilterSync } from '@/hooks/useFilterSync';
import SEOHead from '@/components/SEOHead';
import CategorySEO from '@/components/CategorySEO';
import { generateSEOTitle, generateSEODescription, generateCategoryKeywords, generateOGImage } from '@/utils/seoUtils';
import type { Product, SortOption, FilterState, PrimaryCategory, Subcategory } from '@/types';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { filters, sort, searchQuery, setFilters, updateFilters, setSort, clearFilters, getActiveFilterCount } = useFilterStore();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid-2' | 'grid-3'>('grid-2');

  // Handle URL synchronization automatically  
  useFilterSync();

  // Initialize search query from URL on mount
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam && searchParam !== searchQuery) {
      // Don't trigger filter update, just sync the display
      useFilterStore.setState({ searchQuery: searchParam });
    }
  }, []); // Only run on mount

  const isValidPrimaryCategory = (value: string): value is PrimaryCategory => {
    return ['bags-shoes', 'mens-fashion', 'womens-fashion', 'beauty-fragrance'].includes(value);
  };

  const isValidSubcategory = (value: string): value is Subcategory => {
    const validSubcategories = [
      'mens-shoes', 'womens-shoes', 'bags', 'travel-bags',
      'mens-tops', 'mens-bottoms', 'mens-outerwear', 'mens-accessories',
      'womens-tops', 'womens-dresses', 'womens-bottoms', 'womens-outerwear', 'womens-accessories',
      'perfumes', 'body-sprays', 'skincare', 'makeup'
    ];
    return validSubcategories.includes(value);
  };

  const isValidSortOption = (value: string): value is SortOption => {
    return ['relevance', 'newest', 'price-low', 'price-high'].includes(value);
  };

  // Fetch products using React Query with current filters
  const { data: products = [], isLoading, error } = useProducts({
    search: searchQuery || undefined,
    category: filters.primaryCategory,
    subcategories: filters.subcategories,
    sizes: filters.sizes,
    colors: filters.colors,
    priceRange: filters.priceRange,
    sort,
    showDeals: filters.showDeals,
  });

  const primaryCategoryChips = [
    { 
      id: 'all', 
      label: 'All Items', 
      icon: Grid3x3,
      filters: {} 
    },
    { 
      id: 'bags-shoes', 
      label: 'Bags & Shoes', 
      icon: ShoppingBag,
      filters: { primaryCategory: 'bags-shoes' as const } 
    },
    { 
      id: 'mens-fashion', 
      label: "Men's Fashion", 
      icon: Crown,
      filters: { primaryCategory: 'mens-fashion' as const } 
    },
    { 
      id: 'womens-fashion', 
      label: "Women's Fashion", 
      icon: Flower2,
      filters: { primaryCategory: 'womens-fashion' as const } 
    },
    { 
      id: 'beauty-fragrance', 
      label: 'Beauty & Fragrance', 
      icon: Droplets,
      filters: { primaryCategory: 'beauty-fragrance' as const } 
    },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  // Products are filtered on the server-side via React Query

  const handleChipClick = (chipId: string) => {
    const chip = primaryCategoryChips.find(c => c.id === chipId);
    if (!chip) return;
    
    // Handle filters correctly - preserve existing filters except primary category
    if (chip.id === 'all') {
      clearFilters();
    } else if (chip.filters.primaryCategory) {
      setFilters({ 
        ...filters, 
        primaryCategory: chip.filters.primaryCategory,
        subcategories: [] // Clear subcategories when changing primary category
      });
    }
    
    // Update URL preserving existing parameters
    const newSearchParams = new URLSearchParams(searchParams);
    if (chip.id !== 'all' && chip.filters.primaryCategory) {
      newSearchParams.set('primary', chip.filters.primaryCategory);
      newSearchParams.delete('category'); // Remove old category param
    } else {
      newSearchParams.delete('primary');
      newSearchParams.delete('category');
    }
    if (sort !== 'relevance') {
      newSearchParams.set('sort', sort);
    } else {
      newSearchParams.delete('sort');
    }
    setSearchParams(newSearchParams);
  };

  const isChipActive = (chip: typeof primaryCategoryChips[0]) => {
    const currentPrimaryCategory = filters.primaryCategory;
    
    // For "All Items" chip, active when no primary category is selected
    if (chip.id === 'all') {
      return !currentPrimaryCategory;
    }
    
    // For other chips, check if primary category matches
    return currentPrimaryCategory === chip.filters.primaryCategory;
  };

  // Remove manual getActiveFilterCount since it's now in the store
  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-3':
        return 'responsive-products-grid-3';
      default:
        return 'responsive-products-grid';
    }
  };

  // Generate SEO content based on current filters
  const categoryLabel = filters.primaryCategory ? 
    primaryCategoryChips.find(chip => chip.filters.primaryCategory === filters.primaryCategory)?.label : 
    null;
  
  const seoTitle = generateSEOTitle(
    categoryLabel ? `${categoryLabel} Products` : 
    searchQuery ? `Search Results for "${searchQuery}"` : 
    'Products'
  );
  
  const seoDescription = generateSEODescription(
    categoryLabel ? 
      `Discover our premium ${categoryLabel.toLowerCase()} collection at Shop With Sky. Quality pieces with luxury and affordability.` :
    searchQuery ? 
      `Search results for "${searchQuery}" - Find the perfect products at Shop With Sky.` :
      'Browse our complete collection of premium fashion and lifestyle products at Shop With Sky.',
    160
  );
  
  const seoKeywords = generateCategoryKeywords(filters.primaryCategory);

  return (
    <>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={generateOGImage()}
        type="website"
      />
      <CategorySEO 
        category={categoryLabel || undefined}
        products={products}
        totalProducts={products.length}
      />
      <LoadingErrorBoundary>
      <LoadingStateManager
        isLoading={isLoading}
        hasError={!!error}
        skeleton={
          <div className="pb-6">
            <div className="px-4 pt-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div>
                  <div className="h-6 bg-muted rounded w-32 animate-pulse mb-2" />
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-48 animate-pulse" />
            </div>
            <div className="px-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded-full w-20 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="px-4 pb-20">
              <div className={getGridClasses()}>
                {[...Array(viewMode === 'grid-3' ? 9 : 8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        }
        onRetry={() => navigate('/', { replace: true })}
      >
        <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag size={24} className="text-primary" />
              Shop Products
            </h1>
          </div>
        <p className="text-muted-foreground">Discover our curated selection</p>
      </div>


      {/* Primary Category Tabs */}
      <div className="px-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {primaryCategoryChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.id}
                onClick={() => handleChipClick(chip.id)}
                className={`neu-chip whitespace-nowrap flex items-center gap-1.5 ${
                  isChipActive(chip) ? 'active' : ''
                }`}
              >
                <Icon size={14} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filters */}
      <ActiveFilters />

      {/* Filters & Sort Bar */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
            <button 
              onClick={() => setShowFilters(true)}
              className="neu-pressable flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 relative text-sm sm:text-base"
            >
              <Filter size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Filters</span>
              <span className="inline xs:hidden sm:hidden">Filter</span>
              {getActiveFilterCount() > 0 && (
                <span className="neu-chip text-xs bg-primary text-primary px-1.5 py-0.5 ml-1">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          
          <ProductsSortView 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {products.length} {products.length === 1 ? 'item' : 'items'} found
            {searchQuery && (
              <span> for "{searchQuery}"</span>
            )}
          </p>
          {isLoading && (
            <div className="text-xs text-muted-foreground">Loading...</div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-20">
        {error ? (
          <div className="neu-surface p-8 text-center">
            <p className="text-destructive mb-2">Error loading products</p>
            <p className="text-sm text-muted-foreground mb-4">
              Please try again or refresh the page
            </p>
            <button 
              onClick={() => navigate('/', { replace: true })} 
              className="neu-button px-4 py-2 text-sm"
            >
              Go Home
            </button>
          </div>
        ) : isLoading ? (
          <div className={getGridClasses()}>
            {[...Array(viewMode === 'grid-3' ? 9 : 8)].map((_, i) => (
              <div key={i} className="animate-in" style={{ animationDelay: `${i * 50}ms` }}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={getGridClasses()}>
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="neu-surface p-8 text-center">
            <p className="text-muted-foreground mb-2">No products found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || getActiveFilterCount() > 0 
                ? 'Try adjusting your search or filters' 
                : 'Check back later for new products'
              }
            </p>
          </div>
        )}
      </div>

        {/* Filter Modal */}
        <ProductsFilters 
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />
      </div>
      </LoadingStateManager>
      </LoadingErrorBoundary>
    </>
  );
};

export default Products;
