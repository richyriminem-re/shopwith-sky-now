/**
 * Utility functions for pricing calculations and formatting
 */

/**
 * Round number to 2 decimal places for consistent price storage
 */
export const roundTo2 = (value: number): number => {
  return Math.round(value * 100) / 100;
};

/**
 * Calculate sale price from regular price and discount percentage
 */
export const calculateSalePrice = (regularPrice: number, discountPercentage: number): number => {
  const validRegularPrice = Math.max(0, regularPrice);
  const validDiscountPercentage = Math.max(0, Math.min(99, discountPercentage));
  
  const salePrice = validRegularPrice * (1 - validDiscountPercentage / 100);
  return roundTo2(salePrice);
};

/**
 * Calculate discount percentage from regular and sale price
 */
export const calculateDiscountFromPrices = (regularPrice: number, salePrice: number): number => {
  if (regularPrice <= 0 || salePrice < 0 || salePrice >= regularPrice) {
    return 0;
  }
  
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

/**
 * Validate discount percentage (1-99 range)
 */
export const isValidDiscountPercentage = (percentage: number): boolean => {
  return percentage >= 1 && percentage <= 99;
};

/**
 * Validate sale price against regular price
 */
export const isValidSalePrice = (salePrice: number, regularPrice: number): boolean => {
  return salePrice > 0 && salePrice < regularPrice;
};

/**
 * Format a number as Nigerian Naira currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate discount percentage between two prices
 */
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Calculate the final price after applying a discount
 */
export function applyDiscount(price: number, discountPercentage: number): number {
  return price * (1 - discountPercentage / 100);
}

/**
 * Calculate price range from variants
 */
export function getPriceRange(variants: Array<{ price: number }>): { min: number; max: number } {
  if (!variants || variants.length === 0) {
    return { min: 0, max: 0 };
  }
  
  const prices = variants.map(v => v.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Format price range as string
 */
export function formatPriceRange(variants: Array<{ price: number }>): string {
  const { min, max } = getPriceRange(variants);
  
  if (min === max) {
    return formatCurrency(min);
  }
  
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

/**
 * Calculate savings amount and percentage
 */
export function calculateSavings(originalPrice: number, salePrice: number): {
  amount: number;
  percentage: number;
  formatted: string;
} {
  const amount = originalPrice - salePrice;
  const percentage = calculateDiscountPercentage(originalPrice, salePrice);
  
  return {
    amount,
    percentage,
    formatted: `Save ${formatCurrency(amount)} (${percentage}%)`,
  };
}

/**
 * Validate price input
 */
export function validatePrice(price: string | number): {
  isValid: boolean;
  value: number;
  error?: string;
} {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return {
      isValid: false,
      value: 0,
      error: 'Price must be a valid number',
    };
  }
  
  if (numericPrice < 0) {
    return {
      isValid: false,
      value: numericPrice,
      error: 'Price cannot be negative',
    };
  }
  
  if (numericPrice > 10000000) {
    return {
      isValid: false,
      value: numericPrice,
      error: 'Price cannot exceed ₦10,000,000',
    };
  }
  
  return {
    isValid: true,
    value: numericPrice,
  };
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(sellingPrice: number, costPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

/**
 * Calculate markup percentage
 */
export function calculateMarkup(sellingPrice: number, costPrice: number): number {
  if (costPrice <= 0) return 0;
  return ((sellingPrice - costPrice) / costPrice) * 100;
}

/**
 * Bulk price adjustment utilities
 */
export const BulkPriceOperations = {
  increase: (price: number, value: number, type: 'percentage' | 'fixed'): number => {
    if (type === 'percentage') {
      return price * (1 + value / 100);
    }
    return price + value;
  },
  
  decrease: (price: number, value: number, type: 'percentage' | 'fixed'): number => {
    if (type === 'percentage') {
      return Math.max(0, price * (1 - value / 100));
    }
    return Math.max(0, price - value);
  },
  
  set: (price: number, value: number): number => {
    return Math.max(0, value);
  },
};

/**
 * Price tier utilities for volume pricing
 */
export function calculateTierPrice(basePrice: number, quantity: number, tiers?: Array<{ min: number; discount: number }>): number {
  if (!tiers || tiers.length === 0) return basePrice;
  
  // Find the applicable tier
  const applicableTier = tiers
    .filter(tier => quantity >= tier.min)
    .sort((a, b) => b.min - a.min)[0];
  
  if (!applicableTier) return basePrice;
  
  return applyDiscount(basePrice, applicableTier.discount);
}

/**
 * Tax calculation utilities
 */
export function calculateTax(price: number, taxRate: number): {
  taxAmount: number;
  totalWithTax: number;
  priceBeforeTax: number;
} {
  const taxAmount = price * (taxRate / 100);
  
  return {
    taxAmount,
    totalWithTax: price + taxAmount,
    priceBeforeTax: price,
  };
}

/**
 * Currency conversion (placeholder for future implementation)
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRate?: number
): number {
  // Placeholder implementation - in a real app, you'd fetch current exchange rates
  if (fromCurrency === toCurrency) return amount;
  
  // Default to NGN as base currency
  if (fromCurrency === 'NGN' && toCurrency === 'USD') {
    return amount / (exchangeRate || 1500); // Approximate rate
  }
  
  if (fromCurrency === 'USD' && toCurrency === 'NGN') {
    return amount * (exchangeRate || 1500);
  }
  
  return amount; // Fallback to original amount
}

/**
 * Common discount presets for quick application
 */
export const DISCOUNT_PRESETS = [
  { label: '10% Off', value: 10 },
  { label: '20% Off', value: 20 },
  { label: '30% Off', value: 30 },
  { label: '50% Off', value: 50 },
] as const;