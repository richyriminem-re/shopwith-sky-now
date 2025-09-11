import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Order, OrderStatus } from '@/types';

// Admin user interface
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  avatar?: string;
  lastLogin: string;
}

// Admin metrics interface
export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  dailySales: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ product: Product; sold: number; revenue: number }>;
  recentOrders: Order[];
}

// Admin store interface
interface AdminStore {
  // Authentication state
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  
  // UI state
  sidebarCollapsed: boolean;
  currentView: string;
  
  // Data state
  metrics: AdminMetrics | null;
  orders: Order[];
  products: Product[];
  
  // Loading states
  isLoadingMetrics: boolean;
  isLoadingOrders: boolean;
  isLoadingProducts: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentView: (view: string) => void;
  
  // Data actions
  loadMetrics: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadProducts: () => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

// Mock admin user for demo
const mockAdminUser: AdminUser = {
  id: 'admin-1',
  email: 'admin@shop.com',
  name: 'Shop Admin',
  role: 'admin',
  lastLogin: new Date().toISOString(),
};

// Mock metrics generator
const generateMockMetrics = (): AdminMetrics => {
  const now = new Date();
  const dailySales = [];
  
  // Generate last 30 days of sales data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dailySales.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 50) + 10,
    });
  }
  
  // Mock top products with realistic data
  const mockTopProducts = [
    { 
      product: { 
        id: '1', 
        title: 'Wireless Earbuds Pro', 
        handle: 'wireless-earbuds-pro',
        description: 'Premium wireless earbuds',
        primaryCategory: 'mens-fashion' as const,
        subcategory: 'mens-accessories' as const,
        images: [],
        variants: []
      }, 
      sold: 245, 
      revenue: 12250 
    },
    { 
      product: { 
        id: '2', 
        title: 'Smart Fitness Watch', 
        handle: 'smart-fitness-watch',
        description: 'Advanced fitness tracking watch',
        primaryCategory: 'mens-fashion' as const,
        subcategory: 'mens-accessories' as const,
        images: [],
        variants: []
      }, 
      sold: 189, 
      revenue: 37800 
    },
    { 
      product: { 
        id: '3', 
        title: 'Premium Phone Case', 
        handle: 'premium-phone-case',
        description: 'Protective phone case',
        primaryCategory: 'mens-fashion' as const,
        subcategory: 'mens-accessories' as const,
        images: [],
        variants: []
      }, 
      sold: 156, 
      revenue: 4680 
    },
    { 
      product: { 
        id: '4', 
        title: 'Adjustable Laptop Stand', 
        handle: 'adjustable-laptop-stand',
        description: 'Ergonomic laptop stand',
        primaryCategory: 'mens-fashion' as const,
        subcategory: 'mens-accessories' as const,
        images: [],
        variants: []
      }, 
      sold: 134, 
      revenue: 8040 
    },
    { 
      product: { 
        id: '5', 
        title: 'Portable Bluetooth Speaker', 
        handle: 'portable-bluetooth-speaker',
        description: 'High-quality portable speaker',
        primaryCategory: 'mens-fashion' as const,
        subcategory: 'mens-accessories' as const,
        images: [],
        variants: []
      }, 
      sold: 89, 
      revenue: 7120 
    }
  ];
  
  return {
    totalRevenue: 125000,
    totalOrders: 2847,
    totalProducts: 156,
    totalCustomers: 1890,
    dailySales,
    topProducts: mockTopProducts,
    recentOrders: [], // Will be populated with actual orders
  };
};

// Create admin store
export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      currentUser: null,
      sidebarCollapsed: false,
      currentView: 'dashboard',
      metrics: null,
      orders: [],
      products: [],
      isLoadingMetrics: false,
      isLoadingOrders: false,
      isLoadingProducts: false,

      // Authentication actions
      login: async (email: string, password: string) => {
        // Mock authentication - in real app, this would call an API
        if (email === 'admin@shop.com' && password === 'admin123') {
          set({ 
            isAuthenticated: true, 
            currentUser: { ...mockAdminUser, lastLogin: new Date().toISOString() }
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: null,
          metrics: null,
          orders: [],
          products: [],
        });
      },

      // UI actions
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      setCurrentView: (view: string) => {
        set({ currentView: view });
      },

      // Data loading actions
      loadMetrics: async () => {
        set({ isLoadingMetrics: true });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          const metrics = generateMockMetrics();
          set({ metrics, isLoadingMetrics: false });
        } catch (error) {
          console.error('Failed to load metrics:', error);
          set({ isLoadingMetrics: false });
        }
      },

      loadOrders: async () => {
        set({ isLoadingOrders: true });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          // In real app, load from API
          set({ orders: [], isLoadingOrders: false });
        } catch (error) {
          console.error('Failed to load orders:', error);
          set({ isLoadingOrders: false });
        }
      },

      loadProducts: async () => {
        set({ isLoadingProducts: true });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          // In real app, load from API
          set({ products: [], isLoadingProducts: false });
        } catch (error) {
          console.error('Failed to load products:', error);
          set({ isLoadingProducts: false });
        }
      },

      updateProduct: async (product: Product) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          set((state) => ({
            products: state.products.map(p => p.id === product.id ? product : p)
          }));
        } catch (error) {
          console.error('Failed to update product:', error);
          throw error;
        }
      },

      deleteProduct: async (productId: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          set((state) => ({
            products: state.products.filter(p => p.id !== productId)
          }));
        } catch (error) {
          console.error('Failed to delete product:', error);
          throw error;
        }
      },

      updateOrderStatus: async (orderId: string, status: OrderStatus) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          set((state) => ({
            orders: state.orders.map(order => 
              order.id === orderId ? { ...order, status } : order
            )
          }));
        } catch (error) {
          console.error('Failed to update order status:', error);
          throw error;
        }
      },
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        sidebarCollapsed: state.sidebarCollapsed,
        currentView: state.currentView,
      }),
    }
  )
);