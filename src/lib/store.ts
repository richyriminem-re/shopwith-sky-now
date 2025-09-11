import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, FilterState, SortOption, Product, Address, Order, ShippingMethod, OrderStatus } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, qty: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: (products: Product[]) => number;
}

interface AppStore {
  wishlist: string[];
  recentlyViewed: string[];
  toggleWishlist: (productId: string) => void;
  addToRecentlyViewed: (productId: string) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'wishlist' | 'alert';
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getUnreadCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingIndex = state.items.findIndex(
          i => i.productId === item.productId && i.variantId === item.variantId
        );
        
        if (existingIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingIndex].qty += item.qty;
          return { items: newItems };
        }
        
        return { items: [...state.items, item] };
      }),
      removeItem: (productId, variantId) => set((state) => ({
        items: state.items.filter(
          item => !(item.productId === productId && item.variantId === variantId)
        )
      })),
      updateQuantity: (productId, variantId, qty) => set((state) => {
        if (qty <= 0) {
          return {
            items: state.items.filter(
              item => !(item.productId === productId && item.variantId === variantId)
            )
          };
        }
        
        const newItems = state.items.map(item => 
          item.productId === productId && item.variantId === variantId
            ? { ...item, qty }
            : item
        );
        return { items: newItems };
      }),
      clearCart: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((total, item) => total + item.qty, 0),
      getTotal: (products) => {
        const items = get().items;
        return items.reduce((total, item) => {
          const product = products.find(p => p.id === item.productId);
          const variant = product?.variants.find(v => v.id === item.variantId);
          return total + (variant?.price || 0) * item.qty;
        }, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);


export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      wishlist: [],
      recentlyViewed: [],
      toggleWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.includes(productId)
          ? state.wishlist.filter(id => id !== productId)
          : [...state.wishlist, productId]
      })),
      addToRecentlyViewed: (productId) => set((state) => {
        const filtered = state.recentlyViewed.filter(id => id !== productId);
        return {
          recentlyViewed: [productId, ...filtered].slice(0, 10)
        };
      }),
    }),
    {
      name: 'app-storage',
    }
  )
);

// Checkout store
type CheckoutStep = 'address' | 'review';

interface CheckoutStore {
  currentStep: CheckoutStep;
  address: Partial<Address>;
  shippingOption: ShippingMethod;
  appliedPromoCodes: string[];
  setCurrentStep: (step: CheckoutStep) => void;
  setAddress: (address: Partial<Address>) => void;
  setShippingOption: (option: ShippingMethod) => void;
  addPromoCode: (code: string) => void;
  removePromoCode: (code: string) => void;
  resetPromos: () => void;
  resetCheckout: () => void;
  startNewCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      currentStep: 'address',
      address: {},
      shippingOption: 'standard',
      appliedPromoCodes: [],
      setCurrentStep: (currentStep) => set({ currentStep }),
      setAddress: (address) => set((state) => ({ address: { ...state.address, ...address } })),
      setShippingOption: (shippingOption) => set({ shippingOption }),
      addPromoCode: (code) => set((state) => ({
        appliedPromoCodes: [...state.appliedPromoCodes, code.toUpperCase()]
      })),
      removePromoCode: (code) => set((state) => ({
        appliedPromoCodes: state.appliedPromoCodes.filter(c => c !== code.toUpperCase())
      })),
      resetPromos: () => set({ appliedPromoCodes: [] }),
      resetCheckout: () => set({ 
        currentStep: 'address', 
        address: {}, 
        shippingOption: 'standard',
        appliedPromoCodes: []
      }),
      startNewCheckout: () => set({ 
        currentStep: 'address', 
        address: {}, 
        shippingOption: 'standard',
        appliedPromoCodes: []
      }),
    }),
    {
      name: 'checkout-storage',
    }
  )
);

// Order store
interface OrderStore {
  lastOrder: Order | null;
  orderHistory: Order[];
  setLastOrder: (order: Order) => void;
  addToHistory: (order: Order) => void;
  getOrderHistory: () => Order[];
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      lastOrder: null,
      orderHistory: [],
      setLastOrder: (order) => set((state) => {
        // Add to history when setting last order
        const newHistory = [order, ...state.orderHistory.filter(o => o.id !== order.id)].slice(0, 50);
        return { lastOrder: order, orderHistory: newHistory };
      }),
      addToHistory: (order) => set((state) => {
        const newHistory = [order, ...state.orderHistory.filter(o => o.id !== order.id)].slice(0, 50);
        return { orderHistory: newHistory };
      }),
      getOrderHistory: () => get().orderHistory,
    }),
    {
      name: 'order-storage',
    }
  )
);

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
          },
          ...state.notifications
        ]
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearAllNotifications: () => set({ notifications: [] }),
      getUnreadCount: () => get().notifications.filter(n => !n.read).length,
    }),
    {
      name: 'notification-storage',
    }
  )
);