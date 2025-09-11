import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
}

const SEOHead = ({ 
  title = "Shop With Sky - Premium Fashion & Lifestyle",
  description = "Discover the latest trends and timeless pieces at Shop With Sky. Quality fashion for women, men, and accessories with fast shipping and easy returns.",
  keywords = "fashion, clothing, women, men, accessories, online shopping, premium fashion, style, trends",
  image = "/api/placeholder/1200/630",
  type = "website"
}: SEOHeadProps) => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph meta tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', canonical, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Shop With Sky', true);

    // Twitter meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // Add structured data for homepage
    if (location.pathname === '/') {
      let structuredData = document.querySelector('#structured-data') as HTMLScriptElement;
      if (!structuredData) {
        structuredData = document.createElement('script');
        structuredData.id = 'structured-data';
        structuredData.type = 'application/ld+json';
        document.head.appendChild(structuredData);
      }

      // Enhanced structured data with multiple schemas
      const structuredDataArray = [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Shop With Sky",
          "description": description,
          "url": canonical,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${window.location.origin}/product?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "sameAs": [
            "https://facebook.com/shopwithsky",
            "https://instagram.com/shopwithsky", 
            "https://twitter.com/shopwithsky"
          ]
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Shop With Sky",
          "description": "Premium fashion and lifestyle brand offering curated collections for women, men, and accessories.",
          "url": canonical,
          "logo": `${window.location.origin}/logo.png`,
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
        },
        {
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Shop With Sky Online Store",
          "description": "Shop the latest fashion trends and timeless pieces online.",
          "url": canonical,
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Shop With Sky Product Catalog",
            "itemListElement": [
              {
                "@type": "OfferCatalog",
                "name": "Women's Fashion",
                "description": "Elegant dresses, stylish tops, and comfortable basics"
              },
              {
                "@type": "OfferCatalog", 
                "name": "Men's Fashion",
                "description": "Modern essentials, casual wear, and premium pieces"
              },
              {
                "@type": "OfferCatalog",
                "name": "Accessories",
                "description": "Complete your look with bags, jewelry, and lifestyle accessories"
              }
            ]
          }
        }
      ];

      structuredData.textContent = JSON.stringify(structuredDataArray);
    }
  }, [title, description, keywords, image, type, canonical, location.pathname]);

  return null;
};

export default SEOHead;