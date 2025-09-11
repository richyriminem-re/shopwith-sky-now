export type Variant = {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  price: number; // naira - current selling price
  comparePrice?: number; // naira - original/compare-at price for showing crossed-out old price
  stock: number;
};

export type PrimaryCategory = 'bags-shoes' | 'mens-fashion' | 'womens-fashion' | 'beauty-fragrance';

export type BagsShoesSubcategory = 'mens-shoes' | 'womens-shoes' | 'bags' | 'travel-bags';
export type MensFashionSubcategory = 'mens-tops' | 'mens-bottoms' | 'mens-outerwear' | 'mens-accessories';
export type WomensFashionSubcategory = 'womens-tops' | 'womens-dresses' | 'womens-bottoms' | 'womens-outerwear' | 'womens-accessories';
export type BeautyFragranceSubcategory = 'perfumes' | 'body-sprays' | 'skincare' | 'makeup';

export type Subcategory = BagsShoesSubcategory | MensFashionSubcategory | WomensFashionSubcategory | BeautyFragranceSubcategory;

export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  primaryCategory: PrimaryCategory;
  subcategory: Subcategory;
  images: string[];
  brand?: string;
  tags?: string[];
  variants: Variant[];
  featured?: boolean;
};

export type CartItem = { 
  productId: string; 
  variantId: string; 
  qty: number;
};

export type Address = { 
  name: string; 
  line1: string; 
  city: string; 
  country: string; 
  phone?: string; 
  postal?: string;
  email: string;
};

export type ShippingMethod = 'standard' | 'express';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type OrderStatusChange = {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
};

export type RefundInfo = {
  amount: number; // naira
  reason: string;
  processedAt: string;
  refundId: string;
};

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  address: Address;
  shippingMethod?: ShippingMethod;
  createdAt: string;
  statusUpdatedAt: string;
  statusHistory: OrderStatusChange[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  refundInfo?: RefundInfo;
  paymentStatus?: PaymentStatus;
};

// Status transition validation
export type StatusTransition = {
  from: OrderStatus;
  to: OrderStatus[];
};

export const validStatusTransitions: StatusTransition[] = [
  { from: 'pending', to: ['processing', 'cancelled'] },
  { from: 'processing', to: ['shipped', 'cancelled'] },
  { from: 'shipped', to: ['delivered', 'cancelled'] },
  { from: 'delivered', to: ['refunded'] },
  { from: 'cancelled', to: ['refunded'] },
  { from: 'refunded', to: [] }
];

export type FilterState = {
  primaryCategory?: PrimaryCategory;
  subcategories?: Subcategory[];
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  priceRange?: [number, number];
  showDeals?: boolean;
  searchQuery?: string;
};

// Filter validation result
export interface FilterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Filter history entry
export interface FilterHistoryEntry {
  id: string;
  filters: FilterState;
  sort: SortOption;
  timestamp: string;
  resultCount?: number;
}

// Filter analytics data
export interface FilterAnalytics {
  filterId: string;
  filterType: string;
  filterValue: string;
  timestamp: string;
  sessionId: string;
  resultCount: number;
}

// URL parameter mapping
export interface FilterUrlParams {
  primary?: PrimaryCategory;
  category?: Subcategory;
  subcategories?: string;
  brands?: string;
  sizes?: string;
  colors?: string;
  minPrice?: string;
  maxPrice?: string;
  deals?: string;
  sort?: SortOption;
  search?: string;
}

export type SortOption = 'relevance' | 'newest' | 'price-low' | 'price-high';