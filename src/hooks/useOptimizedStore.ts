/**
 * Optimized Store Hooks with Selective Subscriptions
 */

import { useCallback, useMemo } from 'react';
import { useCartStore, useAppStore, useCheckoutStore, useOrderStore } from '@/lib/store';
import { useFilterStore } from '@/lib/filterManager';
import { useShallow } from 'zustand/shallow';

// Optimized cart store hook with selective subscriptions
export const useOptimizedCartStore = <T>(
  selector: (state: ReturnType<typeof useCartStore.getState>) => T
) => {
  return useCartStore(useShallow(selector));
};

// Common cart selectors
export const useCartItems = () => useOptimizedCartStore(state => state.items);
export const useCartCount = () => useOptimizedCartStore(state => state.getItemCount());
export const useCartActions = () => useOptimizedCartStore(state => ({
  addItem: state.addItem,
  removeItem: state.removeItem,
  updateQuantity: state.updateQuantity,
  clearCart: state.clearCart,
  getTotal: state.getTotal
}));

// Optimized app store with selective subscriptions
export const useOptimizedAppStore = <T>(
  selector: (state: ReturnType<typeof useAppStore.getState>) => T
) => {
  return useAppStore(useShallow(selector));
};

// Common app selectors
export const useWishlist = () => useOptimizedAppStore(state => state.wishlist);
export const useRecentlyViewed = () => useOptimizedAppStore(state => state.recentlyViewed);
export const useAppActions = () => useOptimizedAppStore(state => ({
  toggleWishlist: state.toggleWishlist,
  addToRecentlyViewed: state.addToRecentlyViewed
}));

// Optimized filter store
export const useOptimizedFilterStore = <T>(
  selector: (state: ReturnType<typeof useFilterStore.getState>) => T
) => {
  return useFilterStore(useShallow(selector));
};

// Common filter selectors
export const useFilters = () => useOptimizedFilterStore(state => state.filters);
export const useSort = () => useOptimizedFilterStore(state => state.sort);
export const useSearchQuery = () => useOptimizedFilterStore(state => state.searchQuery);
export const useFilterActions = () => useOptimizedFilterStore(state => ({
  setFilters: state.setFilters,
  updateFilters: state.updateFilters,
  setSort: state.setSort,
  setSearchQuery: state.setSearchQuery,
  clearFilters: state.clearFilters
}));

// Optimized checkout store
export const useOptimizedCheckoutStore = <T>(
  selector: (state: ReturnType<typeof useCheckoutStore.getState>) => T
) => {
  return useCheckoutStore(useShallow(selector));
};

// Common checkout selectors
export const useCheckoutStep = () => useOptimizedCheckoutStore(state => state.currentStep);
export const useCheckoutAddress = () => useOptimizedCheckoutStore(state => state.address);
export const useCheckoutActions = () => useOptimizedCheckoutStore(state => ({
  setCurrentStep: state.setCurrentStep,
  setAddress: state.setAddress,
  setShippingOption: state.setShippingOption,
  resetCheckout: state.resetCheckout
}));

// Optimized order store
export const useOptimizedOrderStore = <T>(
  selector: (state: ReturnType<typeof useOrderStore.getState>) => T
) => {
  return useOrderStore(useShallow(selector));
};

// Common order selectors
export const useOrderHistory = () => useOptimizedOrderStore(state => state.orderHistory);
export const useLastOrder = () => useOptimizedOrderStore(state => state.lastOrder);
export const useOrderActions = () => useOptimizedOrderStore(state => ({
  setLastOrder: state.setLastOrder,
  addToHistory: state.addToHistory,
  getOrderHistory: state.getOrderHistory
}));

// Performance-optimized computed values
export const useCartTotal = () => {
  const { getTotal } = useCartActions();
  return useOptimizedCartStore(
    useCallback((state) => {
      // Use the existing getTotal method from store
      return state.getTotal;
    }, [])
  );
};

// Generic optimized store hook for complex selectors with proper reactivity
export const useOptimizedStore = <T>(
  selector: (state: {
    cart: ReturnType<typeof useCartStore.getState>;
    app: ReturnType<typeof useAppStore.getState>;
    filter: ReturnType<typeof useFilterStore.getState>;
    checkout: ReturnType<typeof useCheckoutStore.getState>;
    order: ReturnType<typeof useOrderStore.getState>;
  }) => T
) => {
  // Use actual store subscriptions for reactivity
  const cart = useCartStore();
  const app = useAppStore();
  const filter = useFilterStore();
  const checkout = useCheckoutStore();
  const order = useOrderStore();
  
  return useMemo(() => selector({ cart, app, filter, checkout, order }), [selector, cart, app, filter, checkout, order]);
};