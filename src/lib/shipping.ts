import { supabase } from '@/integrations/supabase/client';

export const STANDARD_SHIPPING = 800; // ₦800
export const EXPRESS_SHIPPING = 1500; // ₦1,500  
export let FREE_SHIPPING_THRESHOLD = 100000; // ₦100,000

// Delivery timeframes
export const STANDARD_DELIVERY = '5-7 business days';
export const EXPRESS_DELIVERY = '2-3 business days';

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  estimated_delivery: string;
  is_active: boolean;
}

let cachedShippingMethods: ShippingMethod[] | null = null;
let cachedFreeShippingThreshold: number | null = null;

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  if (cachedShippingMethods) return cachedShippingMethods;
  
  const { data, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  
  if (error) {
    console.error('Error fetching shipping methods:', error);
    return [];
  }
  
  cachedShippingMethods = data || [];
  return cachedShippingMethods;
}

export async function getFreeShippingThreshold(): Promise<number> {
  if (cachedFreeShippingThreshold !== null) return cachedFreeShippingThreshold;
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'free_shipping_threshold')
    .maybeSingle();
  
  if (error || !data) {
    console.error('Error fetching free shipping threshold:', error);
    return FREE_SHIPPING_THRESHOLD;
  }
  
  const threshold = parseFloat(data.setting_value) || FREE_SHIPPING_THRESHOLD;
  cachedFreeShippingThreshold = threshold;
  FREE_SHIPPING_THRESHOLD = threshold; // Update the exported constant
  return threshold;
}

export function clearShippingCache() {
  cachedShippingMethods = null;
  cachedFreeShippingThreshold = null;
}

export const calcShippingCost = (subtotal: number, method: 'standard' | 'express', threshold = FREE_SHIPPING_THRESHOLD) => {
  if (subtotal >= threshold) return 0;
  return method === 'express' ? EXPRESS_SHIPPING : STANDARD_SHIPPING;
};

export const getEstimatedDelivery = (method: 'standard' | 'express') => {
  return method === 'express' ? EXPRESS_DELIVERY : STANDARD_DELIVERY;
};