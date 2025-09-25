/**
 * Supabase Products API
 * 
 * Real CRUD operations for products using Supabase.
 * Replaces the mock API with actual database operations.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Product, PrimaryCategory, Subcategory } from '@/types';

// Generate new ID
const generateId = () => crypto.randomUUID();

export interface CreateProductData {
  title: string;
  brand?: string;
  description: string;
  images: string[];
  primaryCategory: PrimaryCategory;
  subcategory: Subcategory;
  variants: {
    color: string;
    size: string;
    price: number;
    comparePrice?: number;
    stock: number;
  }[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface DatabaseProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  primary_category: string;
  subcategory: string;
  brand: string | null;
  tags: string[] | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseVariant {
  id: string;
  product_id: string;
  sku: string;
  color: string | null;
  size: string | null;
  price: number;
  compare_price: number | null;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number | null;
  created_at: string;
}

// Convert database product to frontend Product type
const convertToProduct = (
  dbProduct: DatabaseProduct,
  variants: DatabaseVariant[],
  images: DatabaseImage[]
): Product => {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    handle: dbProduct.handle,
    description: dbProduct.description || '',
    primaryCategory: dbProduct.primary_category as PrimaryCategory,
    subcategory: dbProduct.subcategory as Subcategory,
    images: images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(img => img.image_url),
    brand: dbProduct.brand || undefined,
    tags: dbProduct.tags || [],
    variants: variants.map(v => ({
      id: v.id,
      sku: v.sku,
      color: v.color || undefined,
      size: v.size || undefined,
      price: Number(v.price),
      comparePrice: v.compare_price ? Number(v.compare_price) : undefined,
      stock: v.stock,
    })),
    featured: dbProduct.featured || false,
  };
};

export const supabaseProductsAPI = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw new Error('Failed to fetch products');
    }

    if (!products || products.length === 0) {
      return [];
    }

    // Get all variants and images for these products
    const productIds = products.map(p => p.id);

    const [variantsResult, imagesResult] = await Promise.all([
      supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds),
      supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('sort_order', { ascending: true })
    ]);

    if (variantsResult.error) {
      console.error('Error fetching variants:', variantsResult.error);
      throw new Error('Failed to fetch product variants');
    }

    if (imagesResult.error) {
      console.error('Error fetching images:', imagesResult.error);
      throw new Error('Failed to fetch product images');
    }

    const variants = variantsResult.data || [];
    const images = imagesResult.data || [];

    return products.map(product => {
      const productVariants = variants.filter(v => v.product_id === product.id);
      const productImages = images.filter(i => i.product_id === product.id);
      return convertToProduct(product, productVariants, productImages);
    });
  },

  // Get product by ID
  async getProduct(id: string): Promise<Product | null> {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) {
      if (productError.code === 'PGRST116') {
        return null; // Product not found
      }
      console.error('Error fetching product:', productError);
      throw new Error('Failed to fetch product');
    }

    // Get variants and images
    const [variantsResult, imagesResult] = await Promise.all([
      supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id),
      supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('sort_order', { ascending: true })
    ]);

    if (variantsResult.error) {
      console.error('Error fetching variants:', variantsResult.error);
      throw new Error('Failed to fetch product variants');
    }

    if (imagesResult.error) {
      console.error('Error fetching images:', imagesResult.error);
      throw new Error('Failed to fetch product images');
    }

    return convertToProduct(product, variantsResult.data || [], imagesResult.data || []);
  },

  // Create new product
  async createProduct(data: CreateProductData): Promise<Product> {
    const handle = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Start transaction by creating the product first
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        title: data.title,
        handle: handle,
        description: data.description,
        primary_category: data.primaryCategory,
        subcategory: data.subcategory,
        brand: data.brand || null,
        tags: [],
        featured: false,
      })
      .select()
      .single();

    if (productError) {
      console.error('Error creating product:', productError);
      throw new Error('Failed to create product');
    }

    const productId = product.id;

    // Create variants
    const variantInserts = data.variants.map(v => ({
      product_id: productId,
      sku: `${handle}-${v.color.toLowerCase()}-${v.size.toLowerCase()}`,
      color: v.color,
      size: v.size,
      price: v.price,
      compare_price: v.comparePrice || null,
      stock: v.stock,
    }));

    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .insert(variantInserts)
      .select();

    if (variantsError) {
      console.error('Error creating variants:', variantsError);
      // Cleanup: delete the product if variants failed
      await supabase.from('products').delete().eq('id', productId);
      throw new Error('Failed to create product variants');
    }

    // Create images
    if (data.images.length > 0) {
      const imageInserts = data.images.map((url, index) => ({
        product_id: productId,
        image_url: url,
        alt_text: `${data.title} image ${index + 1}`,
        sort_order: index,
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageInserts);

      if (imagesError) {
        console.error('Error creating images:', imagesError);
        // Continue anyway, images are not critical
      }
    }

    // Fetch the complete product
    const createdProduct = await this.getProduct(productId);
    if (!createdProduct) {
      throw new Error('Failed to fetch created product');
    }

    return createdProduct;
  },

  // Update product
  async updateProduct(data: UpdateProductData): Promise<Product> {
    const { id, ...updateData } = data;
    
    const handle = updateData.title ? 
      updateData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 
      undefined;

    // Update the product
    const productUpdate: any = {};
    if (updateData.title) productUpdate.title = updateData.title;
    if (handle) productUpdate.handle = handle;
    if (updateData.description) productUpdate.description = updateData.description;
    if (updateData.primaryCategory) productUpdate.primary_category = updateData.primaryCategory;
    if (updateData.subcategory) productUpdate.subcategory = updateData.subcategory;
    if (updateData.brand !== undefined) productUpdate.brand = updateData.brand || null;

    if (Object.keys(productUpdate).length > 0) {
      const { error: productError } = await supabase
        .from('products')
        .update(productUpdate)
        .eq('id', id);

      if (productError) {
        console.error('Error updating product:', productError);
        throw new Error('Failed to update product');
      }
    }

    // Update variants if provided
    if (updateData.variants) {
      // Delete existing variants
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', id);

      // Insert new variants
      const variantInserts = updateData.variants.map(v => ({
        product_id: id,
        sku: `${handle || 'product'}-${v.color.toLowerCase()}-${v.size.toLowerCase()}`,
        color: v.color,
        size: v.size,
        price: v.price,
        compare_price: v.comparePrice || null,
        stock: v.stock,
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantInserts);

      if (variantsError) {
        console.error('Error updating variants:', variantsError);
        throw new Error('Failed to update product variants');
      }
    }

    // Update images if provided
    if (updateData.images) {
      // Delete existing images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);

      // Insert new images
      if (updateData.images.length > 0) {
        const imageInserts = updateData.images.map((url, index) => ({
          product_id: id,
          image_url: url,
          alt_text: `${updateData.title || 'Product'} image ${index + 1}`,
          sort_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) {
          console.error('Error updating images:', imagesError);
          // Continue anyway, images are not critical
        }
      }
    }

    // Fetch the updated product
    const updatedProduct = await this.getProduct(id);
    if (!updatedProduct) {
      throw new Error('Failed to fetch updated product');
    }

    return updatedProduct;
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    if (!query.trim()) {
      return this.getProducts();
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .or(`title.ilike.%${query}%,brand.ilike.%${query}%,primary_category.ilike.%${query}%,subcategory.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error searching products:', productsError);
      throw new Error('Failed to search products');
    }

    if (!products || products.length === 0) {
      return [];
    }

    // Get variants and images for search results
    const productIds = products.map(p => p.id);

    const [variantsResult, imagesResult] = await Promise.all([
      supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds),
      supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('sort_order', { ascending: true })
    ]);

    if (variantsResult.error) {
      console.error('Error fetching variants:', variantsResult.error);
      throw new Error('Failed to fetch product variants');
    }

    if (imagesResult.error) {
      console.error('Error fetching images:', imagesResult.error);
      throw new Error('Failed to fetch product images');
    }

    const variants = variantsResult.data || [];
    const images = imagesResult.data || [];

    return products.map(product => {
      const productVariants = variants.filter(v => v.product_id === product.id);
      const productImages = images.filter(i => i.product_id === product.id);
      return convertToProduct(product, productVariants, productImages);
    });
  }
};