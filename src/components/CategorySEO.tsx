import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface CategorySEOProps {
  category?: string;
  products?: any[];
  totalProducts?: number;
}

const CategorySEO = ({ category, products = [], totalProducts }: CategorySEOProps) => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || !document || !products.length) return;

    const baseUrl = window.location.origin;
    const currentUrl = `${baseUrl}${location.pathname}${location.search}`;
    
    // Create ItemList structured data for category pages
    const itemListData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": category ? `${category} Products` : "All Products",
      "description": `Browse our curated collection of ${category || 'premium'} products at Shop With Sky.`,
      "url": currentUrl,
      "numberOfItems": totalProducts || products.length,
      "itemListElement": products.slice(0, 20).map((product, index) => ({ // Limit to first 20 for performance
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "@id": `${baseUrl}/product/${product.handle}`,
          "name": product.title,
          "description": product.description,
          "image": product.images?.[0] ? (
            product.images[0].startsWith('http') 
              ? product.images[0] 
              : `${baseUrl}${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}`
          ) : undefined,
          "brand": {
            "@type": "Brand",
            "name": product.brand || "Shop With Sky"
          },
          "category": product.primaryCategory,
          "offers": {
            "@type": "AggregateOffer",
            "url": `${baseUrl}/product/${product.handle}`,
            "priceCurrency": "NGN",
            "lowPrice": Math.min(...product.variants.map((v: any) => v.price)),
            "highPrice": Math.max(...product.variants.map((v: any) => v.price)),
            "availability": product.variants.some((v: any) => v.stock > 0) 
              ? "https://schema.org/InStock" 
              : "https://schema.org/OutOfStock"
          }
        }
      }))
    };

    // Create BreadcrumbList for category navigation
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem", 
          "position": 2,
          "name": "Products",
          "item": `${baseUrl}/product`
        }
      ]
    };

    // Add category breadcrumb if exists
    if (category) {
      breadcrumbData.itemListElement.push({
        "@type": "ListItem",
        "position": 3,
        "name": category,
        "item": currentUrl
      });
    }

    // Combine both schemas
    const combinedStructuredData = [itemListData, breadcrumbData];

    try {
      let script = document.querySelector('#category-structured-data') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'category-structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(combinedStructuredData);
    } catch (error) {
      console.warn('Failed to inject category structured data:', error);
    }

    return () => {
      const script = document.querySelector('#category-structured-data');
      if (script) {
        script.remove();
      }
    };
  }, [category, products, totalProducts, location.pathname, location.search]);

  return null;
};

export default CategorySEO;