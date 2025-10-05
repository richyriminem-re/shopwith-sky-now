import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export interface PromoCode {
  type: 'percentage' | 'shipping' | 'fixed';
  value: number;
  description: string;
  minSubtotal?: number;
  maxDiscount?: number;
}

export interface DbPromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  description: string | null;
  min_order_amount: number | null;
  max_discount: number | null;
  expiry_date: string | null;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
}

let cachedPromoCodes: Record<string, PromoCode> | null = null;

export async function getPromoCodes(): Promise<Record<string, PromoCode>> {
  if (cachedPromoCodes) return cachedPromoCodes;
  
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching promo codes:', error);
    return {};
  }
  
  const promoCodes: Record<string, PromoCode> = {};
  
  data?.forEach((promo: DbPromoCode) => {
    // Check if promo is expired
    if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
      return;
    }
    
    // Check if usage limit is reached
    if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
      return;
    }
    
    promoCodes[promo.code] = {
      type: promo.discount_type as 'percentage' | 'shipping' | 'fixed',
      value: promo.discount_type === 'percentage' ? promo.discount_value / 100 : promo.discount_value,
      description: promo.description || '',
      minSubtotal: promo.min_order_amount || undefined,
      maxDiscount: promo.max_discount || undefined,
    };
  });
  
  cachedPromoCodes = promoCodes;
  return promoCodes;
}

export function clearPromoCache() {
  cachedPromoCodes = null;
}

export const PROMO_CODES: Record<string, PromoCode> = {
  'WELCOME10': { 
    type: 'percentage', 
    value: 0.1, 
    description: '10% off your order',
    maxDiscount: 50000
  },
  'FREESHIP': { 
    type: 'shipping', 
    value: 1, 
    description: 'Free shipping' 
  },
  'SAVE20': { 
    type: 'percentage', 
    value: 0.2, 
    description: '20% off your order',
    minSubtotal: 100000,
    maxDiscount: 100000
  },
} as const;

export interface PromoContext {
  subtotal: number;
  shipping: number;
  appliedCodes: string[];
}

export function calculatePromoDiscount(
  code: string, 
  context: PromoContext,
  promoCodes: Record<string, PromoCode> = cachedPromoCodes || PROMO_CODES
): { discount: number; error?: string } {
  const promoInfo = promoCodes[code.toUpperCase()];
  if (!promoInfo) {
    return { discount: 0, error: 'Invalid promo code' };
  }

  // Check minimum subtotal requirement
  if (promoInfo.minSubtotal && context.subtotal < promoInfo.minSubtotal) {
    return { 
      discount: 0, 
      error: `Minimum order of ${formatCurrency(promoInfo.minSubtotal)} required` 
    };
  }

  let discount = 0;
  
  switch (promoInfo.type) {
    case 'percentage':
      discount = Math.floor(context.subtotal * promoInfo.value);
      // Apply maximum discount limit
      if (promoInfo.maxDiscount) {
        discount = Math.min(discount, promoInfo.maxDiscount);
      }
      break;
    case 'shipping':
      discount = context.shipping;
      break;
    case 'fixed':
      discount = promoInfo.value;
      break;
    default:
      return { discount: 0, error: 'Invalid promo code type' };
  }

  return { discount: Math.max(0, discount) };
}

export function canApplyCode(
  code: string, 
  context: PromoContext,
  promoCodes: Record<string, PromoCode> = cachedPromoCodes || PROMO_CODES
): { canApply: boolean; error?: string } {
  const upperCode = code.toUpperCase();
  
  // Check if code exists
  if (!promoCodes[upperCode]) {
    return { canApply: false, error: 'Invalid promo code' };
  }

  // Check if already applied
  if (context.appliedCodes.includes(upperCode)) {
    return { canApply: false, error: 'Code already applied' };
  }

  const promoInfo = promoCodes[upperCode];

  // Stacking rules
  if (promoInfo.type === 'percentage') {
    // Only one percentage code allowed
    const hasPercentageCode = context.appliedCodes.some(
      appliedCode => promoCodes[appliedCode]?.type === 'percentage'
    );
    if (hasPercentageCode) {
      return { canApply: false, error: 'Only one percentage discount allowed' };
    }
  }

  if (promoInfo.type === 'shipping') {
    // FREESHIP only works when there's shipping cost
    if (context.shipping === 0) {
      return { canApply: false, error: 'Free shipping already applied' };
    }
    // Only one shipping code allowed
    const hasShippingCode = context.appliedCodes.some(
      appliedCode => promoCodes[appliedCode]?.type === 'shipping'
    );
    if (hasShippingCode) {
      return { canApply: false, error: 'Only one shipping discount allowed' };
    }
  }

  // Check minimum subtotal requirement
  if (promoInfo.minSubtotal && context.subtotal < promoInfo.minSubtotal) {
    return { 
      canApply: false, 
      error: `Minimum order of ${formatCurrency(promoInfo.minSubtotal)} required` 
    };
  }

  return { canApply: true };
}

export function calculateTotalDiscount(
  appliedCodes: string[], 
  subtotal: number, 
  shipping: number,
  promoCodes: Record<string, PromoCode> = cachedPromoCodes || PROMO_CODES
): number {
  const context: PromoContext = { subtotal, shipping, appliedCodes };
  
  return appliedCodes.reduce((totalDiscount, code) => {
    const { discount } = calculatePromoDiscount(code, {
      ...context,
      appliedCodes: appliedCodes.filter(c => c !== code)
    }, promoCodes);
    return totalDiscount + discount;
  }, 0);
}

export function getAvailableCodes(promoCodes: Record<string, PromoCode> = cachedPromoCodes || PROMO_CODES): string[] {
  return Object.keys(promoCodes);
}

export function getPromoDescription(code: string, promoCodes: Record<string, PromoCode> = cachedPromoCodes || PROMO_CODES): string | null {
  const promoInfo = promoCodes[code.toUpperCase()];
  return promoInfo?.description || null;
}