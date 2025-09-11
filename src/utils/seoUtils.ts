/**
 * SEO Utility Functions
 * 
 * Helper functions for generating SEO-optimized content
 */

import type { Product } from '@/types';

// Generate SEO-friendly titles with brand consistency
export const generateSEOTitle = (pageTitle: string, includeStore = true): string => {
  const storeTitle = "Shop With Sky";
  const separator = " - ";
  
  if (!includeStore) return pageTitle;
  
  // Prevent duplicate store name
  if (pageTitle.includes(storeTitle)) return pageTitle;
  
  return `${pageTitle}${separator}${storeTitle}`;
};

// Generate SEO descriptions with optimal length
export const generateSEODescription = (content: string, maxLength = 160): string => {
  if (content.length <= maxLength) return content;
  
  // Find the last complete sentence within the limit
  const truncated = content.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSentence > maxLength - 50) {
    return content.substring(0, lastSentence + 1);
  }
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

// Generate product-specific keywords
export const generateProductKeywords = (product: Product): string => {
  const keywords: string[] = [
    product.title.toLowerCase(),
    product.primaryCategory,
    product.subcategory || '',
    product.brand || '',
    'fashion',
    'shopping',
    'online store',
    'nigeria',
    'buy online'
  ];
  
  // Add variant-specific keywords
  const variants = product.variants || [];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  
  keywords.push(...colors, ...sizes);
  
  // Add category-specific keywords
  if (product.primaryCategory === 'mens-fashion') {
    keywords.push('men', 'mens clothing', 'menswear');
  } else if (product.primaryCategory === 'womens-fashion') {
    keywords.push('women', 'womens clothing', 'womenswear');
  } else if (product.primaryCategory === 'beauty-fragrance') {
    keywords.push('beauty', 'cosmetics', 'fragrance', 'perfume');
  } else if (product.primaryCategory === 'bags-shoes') {
    keywords.push('accessories', 'footwear', 'handbags');
  }
  
  return keywords
    .filter(Boolean)
    .filter(keyword => keyword.length > 2)
    .slice(0, 15) // Limit to 15 keywords
    .join(', ');
};

// Generate category-specific keywords
export const generateCategoryKeywords = (category?: string): string => {
  const baseKeywords = ['fashion', 'shopping', 'online store', 'nigeria', 'buy online'];
  
  if (!category) return baseKeywords.join(', ');
  
  const categoryKeywords: { [key: string]: string[] } = {
    'mens-fashion': ['men', 'mens clothing', 'menswear', 'male fashion'],
    'womens-fashion': ['women', 'womens clothing', 'womenswear', 'female fashion'],
    'beauty-fragrance': ['beauty', 'cosmetics', 'fragrance', 'perfume', 'skincare'],
    'bags-shoes': ['accessories', 'footwear', 'handbags', 'shoes', 'bags']
  };
  
  const specific = categoryKeywords[category] || [];
  return [...baseKeywords, ...specific, category.replace('-', ' ')].join(', ');
};

// Generate Open Graph image URL with fallback
export const generateOGImage = (imagePath?: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  if (!imagePath) {
    return `${baseUrl}/api/placeholder/1200/630`; // Fallback OG image
  }
  
  // Handle already complete URLs
  if (imagePath.startsWith('http')) return imagePath;
  
  // Handle relative paths
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

// Generate canonical URL
export const generateCanonicalURL = (path?: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  if (!path) {
    return typeof window !== 'undefined' ? window.location.href : baseUrl;
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Generate structured data for organization
export const generateOrganizationSchema = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Shop With Sky",
    "description": "Premium fashion and lifestyle brand offering curated collections for women, men, and accessories with luxury and affordability.",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+234-801-234-5678",
      "contactType": "customer service",
      "email": "help@shopwithsky.com",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://facebook.com/shopwithsky",
      "https://instagram.com/shopwithsky", 
      "https://twitter.com/shopwithsky"
    ]
  };
};

// Generate website schema
export const generateWebsiteSchema = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Shop With Sky",
    "description": "Discover the latest trends and timeless pieces at Shop With Sky. Quality fashion for women, men, and accessories with fast shipping and easy returns.",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/product?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};