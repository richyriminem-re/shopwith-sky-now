import { useEffect } from 'react';
import { getFreeShippingThreshold, getShippingMethods, clearShippingCache } from '@/lib/shipping';

export function useShippingSettings() {
  useEffect(() => {
    // Load settings on mount
    getFreeShippingThreshold().catch(console.error);
    getShippingMethods().catch(console.error);

    // Clear cache when component unmounts
    return () => {
      clearShippingCache();
    };
  }, []);
}
