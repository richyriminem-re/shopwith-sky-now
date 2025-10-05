import { useEffect } from 'react';
import { getPromoCodes, clearPromoCache } from '@/utils/promo';

export function usePromoSettings() {
  useEffect(() => {
    // Load promo codes on mount
    getPromoCodes().catch(console.error);

    // Clear cache when component unmounts
    return () => {
      clearPromoCache();
    };
  }, []);
}
