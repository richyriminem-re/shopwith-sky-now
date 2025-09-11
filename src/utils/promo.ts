import { formatCurrency } from '@/lib/utils';

export interface PromoCode {
  type: 'percentage' | 'shipping' | 'fixed';
  value: number;
  description: string;
  minSubtotal?: number;
  maxDiscount?: number;
}

export const PROMO_CODES: Record<string, PromoCode> = {
  'WELCOME10': { 
    type: 'percentage', 
    value: 0.1, 
    description: '10% off your order',
    maxDiscount: 50000 // Max ₦50,000 discount
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
    minSubtotal: 100000, // Minimum ₦100,000 order
    maxDiscount: 100000 // Max ₦100,000 discount
  },
} as const;

export interface PromoContext {
  subtotal: number;
  shipping: number;
  appliedCodes: string[];
}

export function calculatePromoDiscount(
  code: string, 
  context: PromoContext
): { discount: number; error?: string } {
  const promoInfo = PROMO_CODES[code.toUpperCase()];
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
  context: PromoContext
): { canApply: boolean; error?: string } {
  const upperCode = code.toUpperCase();
  
  // Check if code exists
  if (!PROMO_CODES[upperCode]) {
    return { canApply: false, error: 'Invalid promo code' };
  }

  // Check if already applied
  if (context.appliedCodes.includes(upperCode)) {
    return { canApply: false, error: 'Code already applied' };
  }

  const promoInfo = PROMO_CODES[upperCode];

  // Stacking rules
  if (promoInfo.type === 'percentage') {
    // Only one percentage code allowed
    const hasPercentageCode = context.appliedCodes.some(
      appliedCode => PROMO_CODES[appliedCode]?.type === 'percentage'
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
      appliedCode => PROMO_CODES[appliedCode]?.type === 'shipping'
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
  shipping: number
): number {
  const context: PromoContext = { subtotal, shipping, appliedCodes };
  
  return appliedCodes.reduce((totalDiscount, code) => {
    const { discount } = calculatePromoDiscount(code, {
      ...context,
      appliedCodes: appliedCodes.filter(c => c !== code) // Exclude current code to avoid circular dependency
    });
    return totalDiscount + discount;
  }, 0);
}

export function getAvailableCodes(): string[] {
  return Object.keys(PROMO_CODES);
}

export function getPromoDescription(code: string): string | null {
  const promoInfo = PROMO_CODES[code.toUpperCase()];
  return promoInfo?.description || null;
}