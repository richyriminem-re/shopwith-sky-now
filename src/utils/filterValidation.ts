/**
 * Filter Validation Utilities
 * Comprehensive validation logic for filter states and parameters
 */

import type { 
  FilterState, 
  FilterValidationResult, 
  FilterUrlParams,
  PrimaryCategory, 
  Subcategory, 
  SortOption 
} from '@/types';

// Default filter options
const DEFAULT_FILTER_OPTIONS = {
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  colors: ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Brown', 'Pink', 'Purple', 'Yellow', 'Orange'],
  brands: [], // Will be populated dynamically
  priceRange: [0, 500000] as [number, number],
};

// Type guards for validation
export const isValidPrimaryCategory = (value: string): value is PrimaryCategory => {
  return ['bags-shoes', 'mens-fashion', 'womens-fashion', 'beauty-fragrance'].includes(value);
};

export const isValidSubcategory = (value: string): value is Subcategory => {
  const validSubcategories = [
    'mens-shoes', 'womens-shoes', 'bags', 'travel-bags',
    'mens-tops', 'mens-bottoms', 'mens-outerwear', 'mens-accessories',
    'womens-tops', 'womens-dresses', 'womens-bottoms', 'womens-outerwear', 'womens-accessories',
    'perfumes', 'body-sprays', 'skincare', 'makeup'
  ];
  return validSubcategories.includes(value);
};

export const isValidSortOption = (value: string): value is SortOption => {
  return ['relevance', 'newest', 'price-low', 'price-high'].includes(value);
};

// Subcategory validation against primary category
export const isValidSubcategoryForPrimary = (subcategory: Subcategory, primary: PrimaryCategory): boolean => {
  const categoryMap = {
    'bags-shoes': ['mens-shoes', 'womens-shoes', 'bags', 'travel-bags'],
    'mens-fashion': ['mens-tops', 'mens-bottoms', 'mens-outerwear', 'mens-accessories'],
    'womens-fashion': ['womens-tops', 'womens-dresses', 'womens-bottoms', 'womens-outerwear', 'womens-accessories'],
    'beauty-fragrance': ['perfumes', 'body-sprays', 'skincare', 'makeup']
  };
  
  return categoryMap[primary]?.includes(subcategory) || false;
};

// Price range validation
export const isValidPriceRange = (range: [number, number]): boolean => {
  const [min, max] = range;
  return min >= 0 && max > min && max <= 10000000; // 10M max
};

// Search query validation
export const isValidSearchQuery = (query: string): boolean => {
  return query.length <= 100 && !/[<>{}]/.test(query); // Basic XSS prevention
};

// Array validation helpers
export const validateStringArray = (arr: string[], validValues: string[]): string[] => {
  return arr.filter(item => validValues.includes(item));
};

// Comprehensive filter validation
export const validateFilters = (filters: FilterState): FilterValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate primary category
  if (filters.primaryCategory && !isValidPrimaryCategory(filters.primaryCategory)) {
    errors.push(`Invalid primary category: ${filters.primaryCategory}`);
  }

  // Validate subcategories
  if (filters.subcategories?.length) {
    const invalidSubcategories = filters.subcategories.filter(sub => !isValidSubcategory(sub));
    if (invalidSubcategories.length > 0) {
      errors.push(`Invalid subcategories: ${invalidSubcategories.join(', ')}`);
    }

    // Validate subcategories against primary category
    if (filters.primaryCategory) {
      const incompatibleSubs = filters.subcategories.filter(sub => 
        !isValidSubcategoryForPrimary(sub, filters.primaryCategory!)
      );
      if (incompatibleSubs.length > 0) {
        errors.push(`Subcategories incompatible with primary category: ${incompatibleSubs.join(', ')}`);
      }
    }
  }

  // Validate sizes
  if (filters.sizes?.length) {
    const invalidSizes = filters.sizes.filter(size => !DEFAULT_FILTER_OPTIONS.sizes.includes(size));
    if (invalidSizes.length > 0) {
      warnings.push(`Unknown sizes will be ignored: ${invalidSizes.join(', ')}`);
    }
  }

  // Validate colors
  if (filters.colors?.length) {
    const invalidColors = filters.colors.filter(color => !DEFAULT_FILTER_OPTIONS.colors.includes(color));
    if (invalidColors.length > 0) {
      warnings.push(`Unknown colors will be ignored: ${invalidColors.join(', ')}`);
    }
  }

  // Validate price range
  if (filters.priceRange && !isValidPriceRange(filters.priceRange)) {
    errors.push('Invalid price range');
  }

  // Validate search query
  if (filters.searchQuery && !isValidSearchQuery(filters.searchQuery)) {
    errors.push('Invalid search query');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Sanitize filters by removing invalid values
export const sanitizeFilters = (filters: FilterState): FilterState => {
  const sanitized: FilterState = {};

  // Sanitize primary category
  if (filters.primaryCategory && isValidPrimaryCategory(filters.primaryCategory)) {
    sanitized.primaryCategory = filters.primaryCategory;
  }

  // Sanitize subcategories
  if (filters.subcategories?.length) {
    const validSubs = filters.subcategories.filter(isValidSubcategory);
    if (sanitized.primaryCategory) {
      sanitized.subcategories = validSubs.filter(sub => 
        isValidSubcategoryForPrimary(sub, sanitized.primaryCategory!)
      );
    } else {
      sanitized.subcategories = validSubs;
    }
    if (sanitized.subcategories.length === 0) {
      delete sanitized.subcategories;
    }
  }

  // Sanitize sizes
  if (filters.sizes?.length) {
    sanitized.sizes = validateStringArray(filters.sizes, DEFAULT_FILTER_OPTIONS.sizes);
    if (sanitized.sizes.length === 0) {
      delete sanitized.sizes;
    }
  }

  // Sanitize colors
  if (filters.colors?.length) {
    sanitized.colors = validateStringArray(filters.colors, DEFAULT_FILTER_OPTIONS.colors);
    if (sanitized.colors.length === 0) {
      delete sanitized.colors;
    }
  }

  // Sanitize price range
  if (filters.priceRange && isValidPriceRange(filters.priceRange)) {
    sanitized.priceRange = filters.priceRange;
  }

  // Sanitize deals flag
  if (typeof filters.showDeals === 'boolean') {
    sanitized.showDeals = filters.showDeals;
  }

  // Sanitize search query
  if (filters.searchQuery && isValidSearchQuery(filters.searchQuery)) {
    sanitized.searchQuery = filters.searchQuery.trim();
  }

  return sanitized;
};

// URL parameter validation and conversion
export const parseUrlParams = (searchParams: URLSearchParams): Partial<FilterState> => {
  const filters: Partial<FilterState> = {};

  // Parse primary category
  const primary = searchParams.get('primary');
  if (primary && isValidPrimaryCategory(primary)) {
    filters.primaryCategory = primary;
  }

  // Parse single subcategory (legacy support)
  const category = searchParams.get('category');
  if (category && isValidSubcategory(category)) {
    filters.subcategories = [category];
  }

  // Parse multiple subcategories
  const subcategories = searchParams.get('subcategories');
  if (subcategories) {
    const subArray = subcategories.split(',').filter(isValidSubcategory);
    if (subArray.length > 0) {
      filters.subcategories = subArray;
    }
  }

  // Parse sizes
  const sizes = searchParams.get('sizes');
  if (sizes) {
    const sizeArray = sizes.split(',').filter(size => DEFAULT_FILTER_OPTIONS.sizes.includes(size));
    if (sizeArray.length > 0) {
      filters.sizes = sizeArray;
    }
  }

  // Parse colors
  const colors = searchParams.get('colors');
  if (colors) {
    const colorArray = colors.split(',').filter(color => DEFAULT_FILTER_OPTIONS.colors.includes(color));
    if (colorArray.length > 0) {
      filters.colors = colorArray;
    }
  }

  // Parse price range
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice && maxPrice) {
    const min = parseInt(minPrice, 10);
    const max = parseInt(maxPrice, 10);
    if (!isNaN(min) && !isNaN(max) && isValidPriceRange([min, max])) {
      filters.priceRange = [min, max];
    }
  }

  // Parse deals flag
  const deals = searchParams.get('deals');
  if (deals === 'true') {
    filters.showDeals = true;
  }

  // Parse search query
  const search = searchParams.get('search');
  if (search && isValidSearchQuery(search)) {
    filters.searchQuery = search.trim();
  }

  return sanitizeFilters(filters);
};

// Convert filters to URL parameters
export const filtersToUrlParams = (filters: FilterState, sort: SortOption): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.primaryCategory) {
    params.set('primary', filters.primaryCategory);
  }

  if (filters.subcategories?.length) {
    if (filters.subcategories.length === 1) {
      // Use legacy 'category' param for single subcategory
      params.set('category', filters.subcategories[0]);
    } else {
      // Use 'subcategories' param for multiple
      params.set('subcategories', filters.subcategories.join(','));
    }
  }

  if (filters.sizes?.length) {
    params.set('sizes', filters.sizes.join(','));
  }

  if (filters.colors?.length) {
    params.set('colors', filters.colors.join(','));
  }

  if (filters.priceRange) {
    params.set('minPrice', filters.priceRange[0].toString());
    params.set('maxPrice', filters.priceRange[1].toString());
  }

  if (filters.showDeals) {
    params.set('deals', 'true');
  }

  if (filters.searchQuery) {
    params.set('search', filters.searchQuery);
  }

  if (sort !== 'relevance') {
    params.set('sort', sort);
  }

  return params;
};

// Check if two filter states are equivalent
export const areFiltersEqual = (a: FilterState, b: FilterState): boolean => {
  const normalizeArray = (arr?: string[]) => arr?.sort().join(',') || '';
  const normalizePriceRange = (range?: [number, number]) => range?.join(',') || '';

  return (
    a.primaryCategory === b.primaryCategory &&
    normalizeArray(a.subcategories) === normalizeArray(b.subcategories) &&
    normalizeArray(a.sizes) === normalizeArray(b.sizes) &&
    normalizeArray(a.colors) === normalizeArray(b.colors) &&
    normalizePriceRange(a.priceRange) === normalizePriceRange(b.priceRange) &&
    a.showDeals === b.showDeals &&
    a.searchQuery === b.searchQuery
  );
};