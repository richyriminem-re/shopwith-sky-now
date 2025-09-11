/**
 * Custom React Query Hooks for API Integration
 * 
 * These hooks provide a clean interface for data fetching with
 * built-in caching, loading states, and error handling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/services/api';
import type { ProductsQuery, LoginCredentials, RegisterData, AddToCartRequest, CreateOrderRequest, UpdateProfileRequest } from '@/services/types';
import type { Product, CartItem, Order } from '@/types';

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

// =============================================================================
// PRODUCT HOOKS
// =============================================================================

/**
 * Hook to fetch all products with optional filtering
 */
export const useProducts = (query: ProductsQuery = {}) => {
  return useQuery({
    queryKey: [...queryKeys.products, query],
    queryFn: () => api.getProducts(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => api.getProductById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a single product by handle/slug
 */
export const useProductByHandle = (handle: string) => {
  return useQuery({
    queryKey: queryKeys.productByHandle(handle),
    queryFn: async () => {
      try {
        const result = await api.getProductByHandle(handle);
        if (import.meta.env.DEV) console.log('API result for handle:', handle, result);
        return result;
      } catch (error) {
        console.error('Error fetching product by handle:', handle, error);
        throw error;
      }
    },
    enabled: !!handle && handle.length > 0,
    retry: (failureCount, error) => {
      if (import.meta.env.DEV) console.log('Query retry attempt:', failureCount, error);
      return failureCount < 2;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    throwOnError: false, // Prevent throwing errors that could crash the component
  });
};

/**
 * Hook to fetch featured products
 */
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: queryKeys.featuredProducts,
    queryFn: () => api.getFeaturedProducts(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook for product search
 */
export const useProductSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: [...queryKeys.products, 'search', searchQuery],
    queryFn: () => api.searchProducts(searchQuery),
    enabled: searchQuery.length > 2, // Only search with 3+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// =============================================================================
// AUTHENTICATION HOOKS
// =============================================================================

/**
 * Hook for user login
 */
export const useLogin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => api.loginUser(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user, data.user);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => api.registerUser(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user, data.user);
      toast({
        title: "Account created!",
        description: "Welcome to our store. Your account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.logoutUser(),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    },
  });
};

/**
 * Hook to fetch current user
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => api.getCurrentUser(),
    retry: false, // Don't retry if user is not authenticated
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// =============================================================================
// CART HOOKS
// =============================================================================

/**
 * Hook to fetch user cart (when using server-side cart)
 */
export const useCart = () => {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => api.getCart(),
    staleTime: 0, // Always fresh
  });
};

/**
 * Hook to add item to cart
 */
export const useAddToCart = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: AddToCartRequest) => api.addToCart(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add to cart",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to remove item from cart
 */
export const useRemoveFromCart = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => api.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove item",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

// =============================================================================
// ORDER HOOKS
// =============================================================================

/**
 * Hook to create a new order
 */
export const useCreateOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) => api.createOrder(orderData),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id} has been created.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Order failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to fetch user orders
 */
export const useOrders = () => {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => api.getOrders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single order
 */
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => api.getOrderById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// =============================================================================
// USER PROFILE HOOKS
// =============================================================================

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => api.updateUserProfile(data),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user, user);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

// =============================================================================
// WISHLIST HOOKS
// =============================================================================

/**
 * Hook to fetch user wishlist (when using server-side wishlist)
 */
export const useWishlist = () => {
  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: () => api.getWishlist(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to add item to wishlist
 */
export const useAddToWishlist = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => api.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add to wishlist",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to remove item from wishlist
 */
export const useRemoveFromWishlist = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => api.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove from wishlist",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};