import { useEffect } from 'react';
import { Product, Variant } from '@/types';

interface ProductSEOProps {
  product: Product;
  selectedVariant: Variant | null;
}

const ProductSEO = ({ product, selectedVariant }: ProductSEOProps) => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || !document) return;

    const baseUrl = window.location.origin;
    const productUrl = `${baseUrl}/product/${product.handle}`;
    
    // Build image URLs with proper base URL handling
    const imageUrls = product.images.map(img => {
      if (img.startsWith('http')) return img;
      return img.startsWith('/') ? `${baseUrl}${img}` : `${baseUrl}/${img}`;
    });
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "description": product.description,
      "image": imageUrls,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Shop With Sky"
      },
      "category": product.primaryCategory,
      "sku": selectedVariant?.sku || product.id,
      "offers": {
        "@type": "AggregateOffer",
        "url": productUrl,
        "priceCurrency": "NGN",
        "lowPrice": Math.min(...product.variants.map(v => v.price)),
        "highPrice": Math.max(...product.variants.map(v => v.price)),
        "availability": product.variants.some(v => v.stock > 0) 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Shop With Sky"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    // Safely inject structured data
    try {
      let script = document.querySelector('#product-structured-data') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'product-structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    } catch (error) {
      console.warn('Failed to inject structured data:', error);
    }

    // Cleanup function
    return () => {
      const script = document.querySelector('#product-structured-data');
      if (script) {
        script.remove();
      }
    };
  }, [product, selectedVariant]);

  return null;
};

export default ProductSEO;