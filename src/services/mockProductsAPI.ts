/**
 * Mock Products API
 * 
 * Simulates backend CRUD operations for products.
 * Ready to be replaced with Supabase integration.
 */

import type { Product, PrimaryCategory, Subcategory } from '@/types';
import { products as initialProducts } from '@/lib/products';

// Simulate API delay
const API_DELAY = 300;

// Mock storage - in production this would be Supabase
let mockProducts: Product[] = [...initialProducts];

// Generate new ID
const generateId = () => Math.random().toString(36).substr(2, 9);

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

export const mockProductsAPI = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
    return [...mockProducts];
  },

  // Get product by ID
  async getProduct(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
    return mockProducts.find(p => p.id === id) || null;
  },

  // Create new product
  async createProduct(data: CreateProductData): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
    
    const newProduct: Product = {
      id: generateId(),
      handle: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: data.title,
      brand: data.brand,
      description: data.description,
      images: data.images,
      primaryCategory: data.primaryCategory,
      subcategory: data.subcategory,
      variants: data.variants.map(v => ({
        id: generateId(),
        sku: `${data.title.toLowerCase().replace(/\s+/g, '-')}-${v.color.toLowerCase()}-${v.size.toLowerCase()}`,
        color: v.color,
        size: v.size,
        price: v.price,
        comparePrice: v.comparePrice,
        stock: v.stock,
      })),
      tags: [],
    };

    mockProducts = [newProduct, ...mockProducts];
    return newProduct;
  },

  // Update product
  async updateProduct(data: UpdateProductData): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
    
    const index = mockProducts.findIndex(p => p.id === data.id);
    if (index === -1) {
      throw new Error('Product not found');
    }

    const updatedProduct: Product = {
      ...mockProducts[index],
      ...data,
      handle: data.title ? 
        data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 
        mockProducts[index].handle,
      variants: data.variants ? 
        data.variants.map(v => ({
          id: generateId(),
          sku: `${(data.title || mockProducts[index].title).toLowerCase().replace(/\s+/g, '-')}-${v.color.toLowerCase()}-${v.size.toLowerCase()}`,
          color: v.color,
          size: v.size,
          price: v.price,
          comparePrice: v.comparePrice,
          stock: v.stock,
        })) : 
        mockProducts[index].variants,
    };

    mockProducts[index] = updatedProduct;
    return updatedProduct;
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
    
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }

    mockProducts = mockProducts.filter(p => p.id !== id);
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
    
    if (!query.trim()) return [...mockProducts];
    
    const lowerQuery = query.toLowerCase();
    return mockProducts.filter(product =>
      product.title.toLowerCase().includes(lowerQuery) ||
      product.brand?.toLowerCase().includes(lowerQuery) ||
      product.primaryCategory.toLowerCase().includes(lowerQuery) ||
      product.subcategory.toLowerCase().includes(lowerQuery)
    );
  }
};