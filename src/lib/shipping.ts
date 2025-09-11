export const STANDARD_SHIPPING = 800; // ₦800
export const EXPRESS_SHIPPING = 1500; // ₦1,500  
export const FREE_SHIPPING_THRESHOLD = 100000; // ₦100,000

// Delivery timeframes
export const STANDARD_DELIVERY = '5-7 business days';
export const EXPRESS_DELIVERY = '2-3 business days';

export const calcShippingCost = (subtotal: number, method: 'standard' | 'express') => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return method === 'express' ? EXPRESS_SHIPPING : STANDARD_SHIPPING;
};

export const getEstimatedDelivery = (method: 'standard' | 'express') => {
  return method === 'express' ? EXPRESS_DELIVERY : STANDARD_DELIVERY;
};