import type { CartItem, Address } from '@/types';

/**
 * Error recovery utilities for handling corrupted or invalid state
 */

// Type guards for validation
export const isValidCartItem = (item: any): item is CartItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.productId === 'string' &&
    typeof item.variantId === 'string' &&
    typeof item.qty === 'number' &&
    item.qty > 0
  );
};

export const isValidAddress = (address: any): address is Address => {
  return (
    typeof address === 'object' &&
    address !== null &&
    typeof address.name === 'string' &&
    typeof address.email === 'string' &&
    typeof address.phone === 'string' &&
    typeof address.line1 === 'string' &&
    typeof address.city === 'string' &&
    typeof address.country === 'string'
  );
};

export const isValidCartState = (state: any): state is CartItem[] => {
  return Array.isArray(state) && state.every(isValidCartItem);
};

/**
 * Recovery functions for specific data types
 */
export const recoverCartItems = (corruptedItems: any): CartItem[] => {
  try {
    if (!Array.isArray(corruptedItems)) {
      console.warn('Cart items is not an array, returning empty cart');
      return [];
    }

    const validItems = corruptedItems.filter(isValidCartItem);
    
    if (validItems.length !== corruptedItems.length) {
      console.warn(`Recovered ${validItems.length} out of ${corruptedItems.length} cart items`);
    }

    return validItems;
  } catch (error) {
    console.error('Failed to recover cart items:', error);
    return [];
  }
};

export const recoverAddress = (corruptedAddress: any): Partial<Address> => {
  try {
    if (!corruptedAddress || typeof corruptedAddress !== 'object') {
      return {};
    }

    const recovered: Partial<Address> = {};
    
    // Safely extract known fields
    if (typeof corruptedAddress.name === 'string') recovered.name = corruptedAddress.name;
    if (typeof corruptedAddress.email === 'string') recovered.email = corruptedAddress.email;
    if (typeof corruptedAddress.phone === 'string') recovered.phone = corruptedAddress.phone;
    if (typeof corruptedAddress.line1 === 'string') recovered.line1 = corruptedAddress.line1;
    if (typeof corruptedAddress.city === 'string') recovered.city = corruptedAddress.city;
    if (typeof corruptedAddress.country === 'string') recovered.country = corruptedAddress.country;
    if (typeof corruptedAddress.postal === 'string') recovered.postal = corruptedAddress.postal;

    return recovered;
  } catch (error) {
    console.error('Failed to recover address:', error);
    return {};
  }
};

/**
 * Generic error recovery with retry mechanism
 */
export const withErrorRecovery = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, delayMs * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  console.error('All recovery attempts failed, using fallback:', lastError!);
  return fallback;
};

/**
 * Session recovery utility
 */
export const recoverSession = (): {
  isAuthenticated: boolean;
  shouldRedirect: boolean;
  redirectTo?: string;
} => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return { isAuthenticated: false, shouldRedirect: false };
    }

    // Basic token validation (check if it's expired, malformed, etc.)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3 && !token.startsWith('mock_')) {
        // Invalid JWT format
        localStorage.removeItem('auth_token');
        return { 
          isAuthenticated: false, 
          shouldRedirect: true,
          redirectTo: '/login' 
        };
      }
    } catch {
      // Token parsing failed
      localStorage.removeItem('auth_token');
      return { 
        isAuthenticated: false, 
        shouldRedirect: true,
        redirectTo: '/login' 
      };
    }

    return { isAuthenticated: true, shouldRedirect: false };
  } catch (error) {
    console.error('Session recovery failed:', error);
    return { isAuthenticated: false, shouldRedirect: false };
  }
};

/**
 * Inventory validation utility
 */
export const validateInventory = async (
  items: CartItem[],
  products: any[]
): Promise<{
  validItems: CartItem[];
  invalidItems: CartItem[];
  warnings: string[];
}> => {
  const validItems: CartItem[] = [];
  const invalidItems: CartItem[] = [];
  const warnings: string[] = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    const variant = product?.variants.find(v => v.id === item.variantId);

    if (!product) {
      invalidItems.push(item);
      warnings.push(`Product ${item.productId} no longer exists`);
      continue;
    }

    if (!variant) {
      invalidItems.push(item);
      warnings.push(`Variant ${item.variantId} for ${product.title} no longer exists`);
      continue;
    }

    if (variant.stock < item.qty) {
      // Adjust quantity to available stock
      validItems.push({ ...item, qty: variant.stock });
      warnings.push(`${product.title} quantity adjusted to ${variant.stock} (available stock)`);
      continue;
    }

    validItems.push(item);
  }

  return { validItems, invalidItems, warnings };
};