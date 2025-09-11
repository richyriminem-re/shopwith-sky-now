/**
 * API Service Types
 * 
 * Type definitions for API requests and responses.
 * These match the expected backend API contract.
 */

import type { Product, CartItem, Order, Address, FilterState, SortOption } from '@/types';

// Base API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Product API Types
export interface ProductsQuery {
  page?: number;
  limit?: number;
  category?: string;
  subcategories?: string[];
  sizes?: string[];
  colors?: string[];
  priceRange?: [number, number];
  search?: string;
  sort?: SortOption;
  showDeals?: boolean;
}

export interface ProductResponse extends ApiResponse<Product[]> {}
export interface SingleProductResponse extends ApiResponse<Product> {}

// Authentication API Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse extends ApiResponse<{
  user: User;
  token: string;
  refreshToken: string;
}> {}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

// Cart API Types
export interface CartResponse extends ApiResponse<{
  items: CartItem[];
  total: number;
  itemCount: number;
}> {}

export interface AddToCartRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order API Types
export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  promoCode?: string;
}

export interface OrderResponse extends ApiResponse<Order> {}
export interface OrdersResponse extends ApiResponse<Order[]> {}

// Wishlist API Types
export interface WishlistResponse extends ApiResponse<string[]> {}

// Profile API Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  addresses?: Address[];
}

export interface ProfileResponse extends ApiResponse<User> {}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}