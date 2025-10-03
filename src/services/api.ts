/**
 * Centralized API Service Layer
 * 
 * This service provides a centralized interface for all backend API calls.
 * It includes mock data fallbacks and is designed to easily connect to
 * real backend endpoints when ready.
 * 
 * Expected Backend Endpoints:
 * - GET    /api/products              - Get all products with filtering/pagination
 * - GET    /api/products/:id          - Get single product by ID
 * - GET    /api/products/handle/:handle - Get product by handle/slug
 * - GET    /api/categories             - Get product categories
 * - POST   /api/auth/login             - User login
 * - POST   /api/auth/register          - User registration
 * - POST   /api/auth/logout            - User logout
 * - GET    /api/auth/me                - Get current user
 * - GET    /api/cart                   - Get user cart
 * - POST   /api/cart/items             - Add item to cart
 * - PUT    /api/cart/items/:id         - Update cart item quantity
 * - DELETE /api/cart/items/:id         - Remove item from cart
 * - DELETE /api/cart                   - Clear entire cart
 * - POST   /api/orders                 - Create new order
 * - GET    /api/orders                 - Get user orders
 * - GET    /api/orders/:id             - Get single order
 * - GET    /api/user/profile           - Get user profile
 * - PUT    /api/user/profile           - Update user profile
 * - GET    /api/wishlist               - Get user wishlist
 * - POST   /api/wishlist/:productId    - Add to wishlist
 * - DELETE /api/wishlist/:productId    - Remove from wishlist
 */

import config from '@/lib/config';
import { products } from '@/lib/products';
import { circuitBreakerRegistry, CircuitBreakerError, CircuitState } from '@/utils/circuitBreaker';
import type {
  ProductsQuery,
  ProductResponse,
  SingleProductResponse,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CreateOrderRequest,
  OrderResponse,
  OrdersResponse,
  WishlistResponse,
  UpdateProfileRequest,
  ProfileResponse,
  ApiError,
} from './types';
import type { Product, CartItem, Order } from '@/types';

// API Client Configuration
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  private createTimeoutSignal(timeoutMs: number): AbortSignal {
    // Use native AbortSignal.timeout if available (Safari 17.4+)
    if (typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(timeoutMs);
    }
    
    // Polyfill for older browsers
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: this.createTimeoutSignal(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          code: 'TIMEOUT_ERROR',
          message: 'Request timed out',
        } as ApiError;
      }
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return this.request<T>(url.pathname + url.search, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// Circuit Breaker Integration Helpers
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Simple in-memory cache for fallback data
class FallbackCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttlMs: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMs,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const fallbackCache = new FallbackCache();

/**
 * Execute API call with circuit breaker protection
 */
async function executeWithCircuitBreaker<T>(
  endpoint: string,
  operation: () => Promise<T>,
  fallback?: () => Promise<T> | T,
  cacheKey?: string
): Promise<T> {
  const circuitBreaker = circuitBreakerRegistry.getCircuitBreaker(endpoint);
  
  try {
    const result = await circuitBreaker.execute(operation, fallback);
    
    // Cache successful results for fallback use
    if (cacheKey && result !== null && result !== undefined) {
      fallbackCache.set(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    // If circuit breaker fails and no fallback provided, try cache
    if (!fallback && cacheKey) {
      const cachedData = fallbackCache.get<T>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached data for ${endpoint} due to circuit breaker failure`);
        return cachedData;
      }
    }
    
    throw error;
  }
}

/**
 * Create fallback for product operations
 */
function createProductFallback(mockData: Product[]): () => Product[] {
  return () => {
    console.warn('Using emergency product fallback data');
    return mockData.slice(0, 20); // Return subset to prevent overwhelming UI
  };
}

/**
 * Create fallback for empty responses
 */
function createEmptyFallback<T>(defaultValue: T): () => T {
  return () => {
    console.warn('Using empty fallback response');
    return defaultValue;
  };
}

/**
 * Enhanced error handling for API responses
 */
function enhanceApiError(error: any, endpoint: string): ApiError {
  // Circuit breaker errors
  if (error instanceof CircuitBreakerError) {
    return {
      code: 'SERVICE_UNAVAILABLE',
      message: `${endpoint} service is temporarily unavailable. Please try again later.`,
      details: { circuitName: error.circuitName }
    };
  }
  
  // Network errors
  if (error?.code === 'TIMEOUT_ERROR') {
    return {
      code: 'TIMEOUT_ERROR', 
      message: 'Request timed out. Please check your connection and try again.',
      details: { endpoint }
    };
  }
  
  // Server errors (5xx) - these should trigger circuit breaker
  if (error?.status >= 500) {
    return {
      code: 'SERVER_ERROR',
      message: 'Server is experiencing issues. Please try again in a moment.',
      details: { status: error.status, endpoint }
    };
  }
  
  // Client errors (4xx) - these should NOT trigger circuit breaker
  if (error?.status >= 400 && error?.status < 500) {
    return error; // Return as-is, these are client issues
  }
  
  return error || {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: { endpoint }
  };
}

// Mock data helpers (will be removed when backend is ready)
const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

const createMockResponse = <T>(data: T, delay: boolean = true) => {
  const response = { success: true, data, message: 'Success' };
  return delay ? mockDelay().then(() => response) : Promise.resolve(response);
};

// =============================================================================
// PRODUCT API FUNCTIONS
// =============================================================================

/**
 * Get all products with optional filtering and pagination
 * Backend endpoint: GET /api/products
 */
export const getProducts = async (query: ProductsQuery = {}): Promise<Product[]> => {
  const cacheKey = `products:${JSON.stringify(query)}`;
  
  const operation = async (): Promise<Product[]> => {
    if (config.features.useMockData) {
      // Using Supabase instead of mock data
      const { fetchProductsFromSupabase } = await import('./supabaseProducts');
      return await fetchProductsFromSupabase(query);
    }

    // Real API call (when backend is ready)
    const response = await apiClient.get<ProductResponse>('/products', query);
    return response.data;
  };

  try {
    return await executeWithCircuitBreaker(
      'products',
      operation,
      createProductFallback(products),
      cacheKey
    );
  } catch (error) {
    throw enhanceApiError(error, 'products');
  }
};

/**
 * Get a single product by ID
 * Backend endpoint: GET /api/products/:id
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const cacheKey = `product:${id}`;
  
  const operation = async (): Promise<Product | null> => {
    if (config.features.useMockData) {
      // Using Supabase instead of mock data
      const { fetchProductByIdFromSupabase } = await import('./supabaseProducts');
      return await fetchProductByIdFromSupabase(id);
    }

    const response = await apiClient.get<SingleProductResponse>(`/products/${id}`);
    return response.data;
  };

  const fallback = (): Product | null => {
    const product = products.find(p => p.id === id);
    if (product) {
      console.warn(`Using fallback product data for ID: ${id}`);
      return product;
    }
    return null;
  };

  try {
    return await executeWithCircuitBreaker('products', operation, fallback, cacheKey);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

/**
 * Get a single product by handle/slug
 * Backend endpoint: GET /api/products/handle/:handle
 */
export const getProductByHandle = async (handle: string): Promise<Product | null> => {
  if (import.meta.env.DEV) console.log('getProductByHandle called with handle:', handle);
  
  if (!handle || handle.trim() === '') {
    if (import.meta.env.DEV) console.log('Invalid handle provided');
    return null;
  }

  const cacheKey = `product-handle:${handle}`;
  
  const operation = async (): Promise<Product | null> => {
    if (config.features.useMockData) {
      try {
        if (import.meta.env.DEV) console.log('Using Supabase, searching for handle:', handle);
        // Using Supabase instead of mock data
        const { fetchProductByHandleFromSupabase } = await import('./supabaseProducts');
        const product = await fetchProductByHandleFromSupabase(handle);
        if (import.meta.env.DEV) console.log('Found product:', product ? product.title : 'not found');
        return product;
      } catch (error) {
        console.error('Error fetching from Supabase:', error);
        return null;
      }
    }

    const response = await apiClient.get<SingleProductResponse>(`/products/handle/${handle}`);
    return response.data;
  };

  const fallback = (): Product | null => {
    const product = products.find(p => p.handle === handle);
    if (product) {
      console.warn(`Using fallback product data for handle: ${handle}`);
      return product;
    }
    return null;
  };

  try {
    return await executeWithCircuitBreaker('products', operation, fallback, cacheKey);
  } catch (error) {
    console.error('Error fetching product from API:', error);
    return null;
  }
};

/**
 * Search products by query
 * Backend endpoint: GET /api/products?search=query
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    return await executeWithCircuitBreaker(
      'search',
      () => getProducts({ search: query }),
      createProductFallback(products.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )),
      `search:${query}`
    );
  } catch (error) {
    throw enhanceApiError(error, 'search');
  }
};

/**
 * Get featured products
 * Backend endpoint: GET /api/products?featured=true
 */
export const getFeaturedProducts = async (): Promise<Product[]> => {
  const operation = async (): Promise<Product[]> => {
    if (config.features.useMockData) {
      // Using Supabase instead of mock data
      const { fetchFeaturedProductsFromSupabase } = await import('./supabaseProducts');
      return await fetchFeaturedProductsFromSupabase();
    }

    const response = await apiClient.get<ProductResponse>('/products', { featured: true });
    return response.data;
  };

  try {
    return await executeWithCircuitBreaker(
      'products',
      operation,
      () => products.filter(p => p.featured).slice(0, 8),
      'featured-products'
    );
  } catch (error) {
    throw enhanceApiError(error, 'products');
  }
};

// =============================================================================
// AUTHENTICATION API FUNCTIONS
// =============================================================================

/**
 * Login user
 * Backend endpoint: POST /api/auth/login
 */
export const loginUser = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  const operation = async (): Promise<{ user: User; token: string }> => {
    if (config.features.useMockData) {
      // TODO: Replace with real API call
      await mockDelay(1000);
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        firstName: 'John',
        lastName: 'Doe',
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('auth_token', mockToken);
      
      return { user: mockUser, token: mockToken };
    }

    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('auth_token', response.data.token);
    return response.data;
  };

  try {
    return await executeWithCircuitBreaker('auth', operation);
  } catch (error) {
    throw enhanceApiError(error, 'auth');
  }
};

/**
 * Register new user
 * Backend endpoint: POST /api/auth/register
 */
export const registerUser = async (data: RegisterData): Promise<{ user: User; token: string }> => {
  if (config.features.useMockData) {
    // TODO: Replace with real API call
    await mockDelay(1000);
    
    const mockUser: User = {
      id: '1',
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const mockToken = 'mock_jwt_token_' + Date.now();
    localStorage.setItem('auth_token', mockToken);
    
    return { user: mockUser, token: mockToken };
  }

  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  localStorage.setItem('auth_token', response.data.token);
  return response.data;
};

/**
 * Logout user
 * Backend endpoint: POST /api/auth/logout
 */
export const logoutUser = async (): Promise<void> => {
  if (config.features.useMockData) {
    // TODO: Replace with real API call
    await mockDelay(300);
    localStorage.removeItem('auth_token');
    return;
  }

  await apiClient.post('/auth/logout');
  localStorage.removeItem('auth_token');
};

/**
 * Get current user
 * Backend endpoint: GET /api/auth/me
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (config.features.useMockData) {
    // TODO: Replace with real API call
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    const mockUser: User = {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const response = await createMockResponse(mockUser);
    return response.data;
  }

  try {
    const response = await apiClient.get<ProfileResponse>('/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
};

// =============================================================================
// CART API FUNCTIONS
// =============================================================================

/**
 * Get user cart
 * Backend endpoint: GET /api/cart
 */
export const getCart = async (): Promise<{ items: CartItem[]; total: number; itemCount: number }> => {
  const operation = async () => {
    if (config.features.useMockData) {
      // TODO: Replace with real API call
      // For now, we'll return empty cart as the frontend manages cart locally
      const response = await createMockResponse({ items: [], total: 0, itemCount: 0 });
      return response.data;
    }

    const response = await apiClient.get<CartResponse>('/cart');
    return response.data;
  };

  try {
    return await executeWithCircuitBreaker(
      'cart',
      operation,
      createEmptyFallback({ items: [], total: 0, itemCount: 0 }),
      'cart:items'
    );
  } catch (error) {
    throw enhanceApiError(error, 'cart');
  }
};

/**
 * Add item to cart
 * Backend endpoint: POST /api/cart/items
 */
export const addToCart = async (item: AddToCartRequest): Promise<CartItem[]> => {
  const operation = async (): Promise<CartItem[]> => {
    if (config.features.useMockData) {
      await mockDelay(300);
      return [];
    }
    const response = await apiClient.post<CartResponse>('/cart/items', item);
    return response.data.items;
  };

  try {
    return await executeWithCircuitBreaker('cart', operation, createEmptyFallback<CartItem[]>([]));
  } catch (error) {
    throw enhanceApiError(error, 'cart');
  }
};

export const updateCartItem = async (itemId: string, data: UpdateCartItemRequest): Promise<CartItem[]> => {
  const operation = async (): Promise<CartItem[]> => {
    if (config.features.useMockData) {
      await mockDelay(300);
      return [];
    }
    const response = await apiClient.put<CartResponse>(`/cart/items/${itemId}`, data);
    return response.data.items;
  };

  try {
    return await executeWithCircuitBreaker('cart', operation, createEmptyFallback<CartItem[]>([]));
  } catch (error) {
    throw enhanceApiError(error, 'cart');
  }
};

export const removeFromCart = async (itemId: string): Promise<CartItem[]> => {
  const operation = async (): Promise<CartItem[]> => {
    if (config.features.useMockData) {
      await mockDelay(300);
      return [];
    }
    const response = await apiClient.delete<CartResponse>(`/cart/items/${itemId}`);
    return response.data.items;
  };

  try {
    return await executeWithCircuitBreaker('cart', operation, createEmptyFallback<CartItem[]>([]));
  } catch (error) {
    throw enhanceApiError(error, 'cart');
  }
};

/**
 * Clear entire cart
 * Backend endpoint: DELETE /api/cart
 */
export const clearCart = async (): Promise<void> => {
  if (config.features.useMockData) {
    // TODO: Replace with real API call
    await mockDelay(300);
    return;
  }

  await apiClient.delete('/cart');
};

// =============================================================================
// ORDER API FUNCTIONS
// =============================================================================

/**
 * Create new order
 * Backend endpoint: POST /api/orders
 */
export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  const operation = async (): Promise<Order> => {
    if (config.features.useMockData) {
      // TODO: Replace with real API call
      await mockDelay(1500);
      
      const mockOrder: Order = {
        id: 'order_' + Date.now(),
        items: orderData.items,
        total: orderData.items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          const variant = product?.variants.find(v => v.id === item.variantId);
          return sum + (variant?.price || 0) * item.qty;
        }, 0),
        status: 'pending',
        address: orderData.shippingAddress,
        createdAt: new Date().toISOString(),
        statusUpdatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Order placed successfully'
          }
        ]
      };
      
      const response = await createMockResponse(mockOrder, false);
      return response.data;
    }

    const response = await apiClient.post<OrderResponse>('/orders', orderData);
    return response.data;
  };

  // No fallback for order creation - this is a critical operation
  // If it fails, we want the user to know and retry
  try {
    return await executeWithCircuitBreaker('orders', operation);
  } catch (error) {
    throw enhanceApiError(error, 'orders');
  }
};

/**
 * Get user orders
 * Backend endpoint: GET /api/orders
 */
export const getOrders = async (): Promise<Order[]> => {
  const operation = async (): Promise<Order[]> => {
    if (config.features.useMockData) {
      // TODO: Replace with real API call
      const response = await createMockResponse([]);
      return response.data;
    }

    const response = await apiClient.get<OrdersResponse>('/orders');
    return response.data;
  };

  try {
    return await executeWithCircuitBreaker(
      'orders',
      operation,
      createEmptyFallback<Order[]>([]),
      'orders:list'
    );
  } catch (error) {
    throw enhanceApiError(error, 'orders');
  }
};

/**
 * Get single order by ID
 * Backend endpoint: GET /api/orders/:id
 */
export const getOrderById = async (id: string): Promise<Order | null> => {
  if (config.features.useMockData) {
    // TODO: Replace with real API call
    const response = await createMockResponse(null);
    return response.data;
  }

  try {
    const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

// =============================================================================
// USER PROFILE API FUNCTIONS  
// =============================================================================

/**
 * Get user profile
 * Backend endpoint: GET /api/user/profile
 */
export const getUserProfile = async (): Promise<User | null> => {
  return getCurrentUser();
};

/**
 * Update user profile
 * Backend endpoint: PUT /api/user/profile
 */
export const updateUserProfile = async (data: UpdateProfileRequest): Promise<User> => {
  if (config.features.useMockData) {
    // TODO: Replace with real API call
    await mockDelay(500);
    
    const mockUser: User = {
      id: '1',
      email: 'john.doe@example.com',
      firstName: data.firstName || 'John',
      lastName: data.lastName || 'Doe', 
      addresses: data.addresses || [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const response = await createMockResponse(mockUser, false);
    return response.data;
  }

  const response = await apiClient.put<ProfileResponse>('/user/profile', data);
  return response.data;
};

// =============================================================================
// WISHLIST API FUNCTIONS
// =============================================================================

/**
 * Get user wishlist  
 * Backend endpoint: GET /api/wishlist
 */
export const getWishlist = async (): Promise<string[]> => {
  if (config.features.useMockData) {
    // TODO: Replace with real API call
    // Frontend manages wishlist locally for now
    const response = await createMockResponse([]);
    return response.data;
  }

  const response = await apiClient.get<WishlistResponse>('/wishlist');
  return response.data;
};

/**
 * Add product to wishlist
 * Backend endpoint: POST /api/wishlist/:productId
 */
export const addToWishlist = async (productId: string): Promise<string[]> => {
  if (config.features.useMockData) {
    // TODO: Replace with real API call
    await mockDelay(300);
    return [];
  }

  const response = await apiClient.post<WishlistResponse>(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Remove product from wishlist
 * Backend endpoint: DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = async (productId: string): Promise<string[]> => {
  if (config.features.useMockData) {
    // TODO: Replace with real API call
    await mockDelay(300);
    return [];
  }

  const response = await apiClient.delete<WishlistResponse>(`/wishlist/${productId}`);
  return response.data;
};

// Export the API client for advanced usage
export { apiClient };