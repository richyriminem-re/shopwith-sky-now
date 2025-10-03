/**
 * Supabase Products Service
 * 
 * Helper functions to fetch products from Supabase with proper joins,
 * filtering, sorting, and data transformation to match the Product type.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Product, Variant, PrimaryCategory, Subcategory, SortOption } from '@/types';
import type { ProductsQuery } from './types';

/**
 * Transform Supabase product data to match our Product type
 */
const transformSupabaseProduct = (supabaseProduct: any): Product => {
  // Extract and sort images
  const images = (supabaseProduct.product_images || [])
    .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((img: any) => img.image_url);

  // Transform variants
  const variants: Variant[] = (supabaseProduct.product_variants || []).map((v: any) => ({
    id: v.id,
    sku: v.sku,
    size: v.size || undefined,
    color: v.color || undefined,
    price: Number(v.price),
    comparePrice: v.compare_price ? Number(v.compare_price) : undefined,
    stock: v.stock,
  }));

  return {
    id: supabaseProduct.id,
    title: supabaseProduct.title,
    handle: supabaseProduct.handle,
    description: supabaseProduct.description || '',
    primaryCategory: supabaseProduct.primary_category as PrimaryCategory,
    subcategory: supabaseProduct.subcategory as Subcategory,
    images,
    brand: supabaseProduct.brand || undefined,
    tags: supabaseProduct.tags || undefined,
    variants,
    featured: supabaseProduct.featured || false,
  };
};

/**
 * Fetch products from Supabase with filtering and sorting
 */
export const fetchProductsFromSupabase = async (query: ProductsQuery = {}): Promise<Product[]> => {
  let supabaseQuery = supabase
    .from('products')
    .select(`
      *,
      product_images(image_url, alt_text, sort_order),
      product_variants(id, sku, color, size, price, compare_price, stock)
    `)
    .eq('is_active', true);

  // Apply category filter
  if (query.category) {
    supabaseQuery = supabaseQuery.eq('primary_category', query.category);
  }

  // Apply subcategories filter (OR logic)
  if (query.subcategories?.length) {
    supabaseQuery = supabaseQuery.in('subcategory', query.subcategories);
  }

  // Note: brands filter would need to be added to ProductsQuery type if needed

  // Apply search filter
  if (query.search) {
    const searchTerm = `%${query.search}%`;
    supabaseQuery = supabaseQuery.or(
      `title.ilike.${searchTerm},description.ilike.${searchTerm},brand.ilike.${searchTerm}`
    );
  }

  // Apply sorting
  switch (query.sort) {
    case 'newest':
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      break;
    case 'price-low':
    case 'price-high':
      // We'll sort after fetching since we need to look at variants
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      break;
    default:
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
  }

  const { data, error } = await supabaseQuery;

  if (error) {
    console.error('Error fetching products from Supabase:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  // Transform data
  let products = data.map(transformSupabaseProduct);

  // Apply client-side filters for variant-specific properties
  
  // Filter by sizes (check if any variant has the size)
  if (query.sizes?.length) {
    products = products.filter(product =>
      product.variants.some(variant =>
        variant.size && query.sizes!.includes(variant.size)
      )
    );
  }

  // Filter by colors (check if any variant has the color)
  if (query.colors?.length) {
    products = products.filter(product =>
      product.variants.some(variant =>
        variant.color && query.colors!.includes(variant.color)
      )
    );
  }

  // Filter by price range (check if any variant is in the range)
  if (query.priceRange) {
    const [minPrice, maxPrice] = query.priceRange;
    products = products.filter(product =>
      product.variants.some(variant =>
        variant.price >= minPrice && variant.price <= maxPrice
      )
    );
  }

  // Filter by deals (products with any variant having compare price)
  if (query.showDeals) {
    products = products.filter(product =>
      product.variants.some(variant =>
        variant.comparePrice && variant.comparePrice > variant.price
      )
    );
  }

  // Apply price sorting
  if (query.sort === 'price-low') {
    products.sort((a, b) => {
      const minPriceA = Math.min(...a.variants.map(v => v.price));
      const minPriceB = Math.min(...b.variants.map(v => v.price));
      return minPriceA - minPriceB;
    });
  } else if (query.sort === 'price-high') {
    products.sort((a, b) => {
      const maxPriceA = Math.max(...a.variants.map(v => v.price));
      const maxPriceB = Math.max(...b.variants.map(v => v.price));
      return maxPriceB - maxPriceA;
    });
  }

  return products;
};

/**
 * Fetch a single product by ID
 */
export const fetchProductByIdFromSupabase = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(image_url, alt_text, sort_order),
      product_variants(id, sku, color, size, price, compare_price, stock)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching product by ID from Supabase:', error);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return transformSupabaseProduct(data);
};

/**
 * Fetch a single product by handle
 */
export const fetchProductByHandleFromSupabase = async (handle: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(image_url, alt_text, sort_order),
      product_variants(id, sku, color, size, price, compare_price, stock)
    `)
    .eq('handle', handle)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product by handle from Supabase:', error);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return transformSupabaseProduct(data);
};

/**
 * Fetch featured products
 */
export const fetchFeaturedProductsFromSupabase = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(image_url, alt_text, sort_order),
      product_variants(id, sku, color, size, price, compare_price, stock)
    `)
    .eq('is_active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured products from Supabase:', error);
    throw new Error(`Failed to fetch featured products: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map(transformSupabaseProduct);
};

/**
 * Search products
 */
export const searchProductsFromSupabase = async (searchQuery: string): Promise<Product[]> => {
  return fetchProductsFromSupabase({ search: searchQuery });
};
