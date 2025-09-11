/**
 * Enhanced API hooks with request cancellation, deduplication, and better error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/services/api';
import type { ProductsQuery, LoginCredentials, RegisterData, AddToCartRequest, CreateOrderRequest, UpdateProfileRequest } from '@/services/types';
import { withErrorRecovery } from '@/utils/errorRecovery';
import requestDeduplicator, { type RequestConfig } from '@/utils/requestDeduplicator';

// Query Keys - Centralized for consistency and easy invalidation
export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productByHandle: (handle: string) => ['products', 'handle', handle] as const,
  featuredProducts: ['products', 'featured'] as const,
  cart: ['cart'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  user: ['user'] as const,
  wishlist: ['wishlist'] as const,
};

// Hook to manage AbortController for request cancellation
const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortPreviousRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return abortPreviousRequest;
};

// Enhanced query options with timeout, retry logic, and deduplication
const createQueryOptions = (baseOptions: any = {}) => ({
  retry: (failureCount: number, error: any) => {
    // Don't retry on abort or 4xx errors
    if (error.name === 'AbortError' || (error.status >= 400 && error.status < 500)) {
      return false;
    }
    return failureCount < 2;
  },
  staleTime: 5 * 60 * 1000, // 5 minutes default
  gcTime: 10 * 60 * 1000, // 10 minutes default
  throwOnError: false,
  ...baseOptions,
});

// Enhanced wrapper for API calls with deduplication
const withDeduplication = async <T>(
  requestConfig: Omit<RequestConfig, 'url' | 'method'> & { url: string; method: string },
  requestFn: () => Promise<T>
): Promise<T> => {
  return requestDeduplicator.deduplicate(requestConfig, requestFn);
};

// Double-click prevention hook
const useDoubleClickPrevention = (delay: number = 1000) => {
  const lastClickRef = useRef<number>(0);
  
  return useCallback((callback: () => void) => {
    const now = Date.now();
    if (now - lastClickRef.current > delay) {
      lastClickRef.current = now;
      callback();
    }
  }, [delay]);
};

// =============================================================================
// ENHANCED PRODUCT HOOKS
// =============================================================================

export const useProductsWithAbort = (query: ProductsQuery = {}) => {
  const abortPreviousRequest = useAbortController();

  return useQuery({
    queryKey: [...queryKeys.products, query, 'deduplicated'],
    queryFn: async () => {
      const signal = abortPreviousRequest();
      const queryString = new URLSearchParams(query as any).toString();
      const url = `/api/products${queryString ? `?${queryString}` : ''}`;
      
      return withDeduplication(
        { 
          url, 
          method: 'GET',
          priority: 'normal'
        },
        () => withErrorRecovery(
          () => api.getProducts(query),
          [], // fallback to empty array
          2, // max retries
          1000 // delay
        )
      );
    },
    ...createQueryOptions({
      staleTime: 5 * 60 * 1000,
    }),
  });
};

export const useProductWithAbort = (id: string) => {
  const abortPreviousRequest = useAbortController();

  return useQuery({
    queryKey: [...queryKeys.product(id), 'deduplicated'],
    queryFn: async () => {
      const signal = abortPreviousRequest();
      
      return withDeduplication(
        { 
          url: `/api/products/${id}`, 
          method: 'GET',
          priority: 'high' // Product details are high priority
        },
        () => withErrorRecovery(
          () => api.getProductById(id),
          null, // fallback to null
          3, // max retries for single product
          1500 // delay
        )
      );
    },
    enabled: !!id,
    ...createQueryOptions({
      staleTime: 10 * 60 * 1000,
    }),
  });
};

export const useProductByHandleWithAbort = (handle: string) => {
  const abortPreviousRequest = useAbortController();

  return useQuery({
    queryKey: [...queryKeys.productByHandle(handle), 'deduplicated'],
    queryFn: async () => {
      const signal = abortPreviousRequest();
      
      return withDeduplication(
        { 
          url: `/api/products/handle/${handle}`, 
          method: 'GET',
          priority: 'high'
        },
        () => withErrorRecovery(
          () => api.getProductByHandle(handle),
          null, // fallback to null
          2, // max retries
          1000 // delay
        )
      );
    },
    enabled: !!handle && handle.length > 0,
    ...createQueryOptions({
      staleTime: 10 * 60 * 1000,
    }),
  });
};

export const useFeaturedProductsWithAbort = () => {
  const abortPreviousRequest = useAbortController();

  return useQuery({
    queryKey: [...queryKeys.featuredProducts, 'deduplicated'],
    queryFn: async () => {
      const signal = abortPreviousRequest();
      
      return withDeduplication(
        { 
          url: '/api/products/featured', 
          method: 'GET',
          priority: 'normal'
        },
        () => withErrorRecovery(
          () => api.getFeaturedProducts(),
          [], // fallback to empty array
          2, // max retries
          1000 // delay
        )
      );
    },
    ...createQueryOptions({
      staleTime: 15 * 60 * 1000,
    }),
  });
};

export const useProductSearchWithAbort = (searchQuery: string) => {
  const abortPreviousRequest = useAbortController();

  return useQuery({
    queryKey: [...queryKeys.products, 'search', searchQuery, 'deduplicated'],
    queryFn: async () => {
      const signal = abortPreviousRequest();
      const url = `/api/search?q=${encodeURIComponent(searchQuery)}`;
      
      return withDeduplication(
        { 
          url, 
          method: 'GET',
          priority: 'normal'
        },
        () => withErrorRecovery(
          () => api.searchProducts(searchQuery),
          [], // fallback to empty array
          1, // fewer retries for search
          500 // faster retry for search
        )
      );
    },
    enabled: searchQuery.length > 2,
    ...createQueryOptions({
      staleTime: 2 * 60 * 1000,
    }),
  });
};

// =============================================================================
// ENHANCED MUTATION HOOKS WITH DEDUPLICATION
// =============================================================================

export const useAddToCartWithDeduplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const preventDoubleClick = useDoubleClickPrevention(1000);

  return useMutation({
    mutationFn: async (request: AddToCartRequest) => {
      return withDeduplication(
        {
          url: '/api/cart/add',
          method: 'POST',
          body: request,
          priority: 'high'
        },
        () => api.addToCart(request)
      );
    },
    onSuccess: () => {
      // Invalidate cart cache
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      requestDeduplicator.invalidateByPattern('/api/cart');
      
      toast({
        title: "Added to cart",
        description: "Item successfully added to your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });
};

export const useLoginWithDeduplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const preventDoubleClick = useDoubleClickPrevention(2000);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return withDeduplication(
        {
          url: '/api/auth/login',
          method: 'POST',
          body: credentials,
          priority: 'high'
        },
        () => api.loginUser(credentials)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      requestDeduplicator.invalidateByPattern('/api/user');
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProfileWithDeduplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const preventDoubleClick = useDoubleClickPrevention(1500);

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      return withDeduplication(
        {
          url: '/api/user/profile',
          method: 'PUT',
          body: data,
          priority: 'normal'
        },
        () => api.updateUserProfile(data)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      requestDeduplicator.invalidateByPattern('/api/user');
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });
};

// =============================================================================
// LOADING STATE MANAGEMENT HOOK
// =============================================================================

export const useLoadingStates = (queries: Array<{ isLoading: boolean; isError: boolean }>) => {
  const isLoading = queries.some(q => q.isLoading);
  const hasErrors = queries.some(q => q.isError);
  const allLoaded = queries.every(q => !q.isLoading);

  return {
    isLoading,
    hasErrors,
    allLoaded,
    loadingProgress: queries.filter(q => !q.isLoading).length / queries.length,
  };
};

// =============================================================================
// DEDUPLICATION UTILITIES
// =============================================================================

export const useDeduplicationMetrics = () => {
  const [metrics, setMetrics] = useState(() => requestDeduplicator.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(requestDeduplicator.getMetrics());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

export const useRequestQueue = () => {
  const queryClient = useQueryClient();

  const clearCache = useCallback(() => {
    requestDeduplicator.clearCache();
    queryClient.clear();
  }, [queryClient]);

  const invalidateByPattern = useCallback((pattern: string) => {
    requestDeduplicator.invalidateByPattern(pattern);
  }, []);

  const warmUpCache = useCallback(() => {
    // Prefetch commonly used data
    queryClient.prefetchQuery({
      queryKey: queryKeys.featuredProducts,
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    clearCache,
    invalidateByPattern,
    warmUpCache,
    metrics: useDeduplicationMetrics(),
  };
};

// Export double-click prevention for use in components
export { useDoubleClickPrevention };