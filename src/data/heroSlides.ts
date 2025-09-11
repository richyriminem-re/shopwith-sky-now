/**
 * Static Hero Slides Data
 * Replaces admin-managed hero carousel with static content
 */

export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  webpUrl?: string;
  altText: string;
  linkUrl?: string;
  linkText?: string;
  linkTarget?: '_self' | '_blank';
  isActive: boolean;
  order: number;
  ctaPosition?: 'bottom-left' | 'bottom-right' | 'center';
  ctaSize?: 'sm' | 'default' | 'lg';
}

export const staticHeroSlides: HeroSlide[] = [
  {
    id: 'hero-1',
    title: 'Summer Collection',
    description: 'Discover our latest summer fashion trends',
    imageUrl: '/src/assets/hero-1.jpg',
    webpUrl: '/src/assets/hero-1.webp',
    altText: 'Summer fashion collection featuring stylish clothing and accessories',
    linkUrl: '/product?category=womens-fashion',
    linkText: 'Shop Summer',
    linkTarget: '_self',
    isActive: true,
    order: 1,
    ctaPosition: 'bottom-left',
    ctaSize: 'default'
  },
  {
    id: 'hero-2',
    title: 'Men\'s Premium Collection',
    description: 'Elevate your style with our premium men\'s collection',
    imageUrl: '/src/assets/hero-2.jpg',
    webpUrl: '/src/assets/hero-2.webp',
    altText: 'Premium men\'s clothing and accessories collection',
    linkUrl: '/product?category=mens-fashion',
    linkText: 'Shop Men\'s',
    linkTarget: '_self',
    isActive: true,
    order: 2,
    ctaPosition: 'bottom-right',
    ctaSize: 'default'
  },
  {
    id: 'hero-3',
    title: 'Designer Bags & Shoes',
    description: 'Complete your look with our luxury accessories',
    imageUrl: '/src/assets/hero-3.jpg',
    altText: 'Designer handbags and premium footwear collection',
    linkUrl: '/product?category=bags-shoes',
    linkText: 'Shop Accessories',
    linkTarget: '_self',
    isActive: true,
    order: 3,
    ctaPosition: 'center',
    ctaSize: 'lg'
  },
  {
    id: 'hero-4',
    title: 'Beauty & Fragrance',
    description: 'Discover premium beauty products and fragrances',
    imageUrl: '/src/assets/hero-4.jpg',
    webpUrl: '/src/assets/hero-4.webp',
    altText: 'Beauty products and luxury fragrances collection',
    linkUrl: '/product?category=beauty-fragrance',
    linkText: 'Shop Beauty',
    linkTarget: '_self',
    isActive: true,
    order: 4,
    ctaPosition: 'bottom-left',
    ctaSize: 'default'
  },
  {
    id: 'hero-5',
    title: 'New Arrivals',
    description: 'Be the first to shop our latest arrivals',
    imageUrl: '/src/assets/hero-5.jpg',
    webpUrl: '/src/assets/hero-5.webp',
    altText: 'Latest fashion arrivals and trending styles',
    linkUrl: '/product?sort=newest',
    linkText: 'Shop New',
    linkTarget: '_self',
    isActive: true,
    order: 5,
    ctaPosition: 'bottom-right',
    ctaSize: 'default'
  }
];

/**
 * Get active hero slides in display order
 */
export const getActiveHeroSlides = (): HeroSlide[] => {
  return staticHeroSlides
    .filter(slide => slide.isActive)
    .sort((a, b) => a.order - b.order);
};