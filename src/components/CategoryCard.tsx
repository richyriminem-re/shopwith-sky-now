import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchProductsFromSupabase } from '@/services/supabaseProducts';
import LazyImage from '@/components/LazyImage';
import { Sparkles, TrendingUp, Percent } from 'lucide-react';
import type { Product } from '@/types';

interface CategoryCardProps {
  name: string;
  path: string;
  gradient: string;
  description: string;
  promotionalText?: string;
}

const CategoryCard = ({ name, path, gradient, description, promotionalText }: CategoryCardProps) => {
  const [itemCount, setItemCount] = useState<number>(0);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Map category names to product primaryCategory values
  const categoryMappings: Record<string, string> = {
    'Bags & Shoes': 'bags-shoes',
    "Men's Fashion": 'mens-fashion', 
    "Women's Fashion": 'womens-fashion',
    'Beauty & Fragrance': 'beauty-fragrance'
  };
  
  const primaryCategory = categoryMappings[name] || name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        const products = await fetchProductsFromSupabase({ 
          category: primaryCategory as any 
        });
        setItemCount(products.length);
        setFeaturedProduct(products.find(p => p.featured) || products[0] || null);
      } catch (error) {
        console.error('Error loading category data:', error);
        setItemCount(0);
        setFeaturedProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [primaryCategory]);

  // Get promotional icon based on text
  const getPromotionalIcon = () => {
    if (!promotionalText) return null;
    
    if (promotionalText.includes('New')) return <Sparkles size={12} />;
    if (promotionalText.includes('Trending')) return <TrendingUp size={12} />;
    if (promotionalText.includes('%') || promotionalText.includes('Off')) return <Percent size={12} />;
    return <Sparkles size={12} />;
  };

  return (
    <Link to={path} className="group block animate-fade-in">
      <div className="neu-card overflow-hidden group-hover:scale-[1.02] transition-all duration-300">
        {/* Image Section */}
        <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradient} overflow-hidden`}>
          {featuredProduct ? (
            <>
              <LazyImage
                src={featuredProduct.images[0]}
                alt={`${name} category - ${featuredProduct.title}`}
                className="w-full h-full"
                aspectRatio="4/3"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fallbackSrc="/placeholder.svg"
              />
              
              {/* Enhanced Gradient Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Lifestyle Context Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />
            </>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <div className="text-center text-white/80">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {getPromotionalIcon()}
                </div>
                <p className="text-sm font-medium">{name}</p>
              </div>
            </div>
          )}
          
          {/* Enhanced Promotional Badge */}
          {promotionalText && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-1">
              {getPromotionalIcon()}
              {promotionalText}
            </div>
          )}
          
          {/* Enhanced Item Count with Better Visibility - Always Show */}
          <div className="absolute bottom-3 right-3 bg-card text-card-foreground text-xs font-semibold px-3 py-1.5 rounded-full border border-border shadow-lg z-10">
            {itemCount || 0} items
          </div>
          
        </div>
        
        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-bold text-neu-primary text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {name}
          </h3>
          <p className="text-neu-muted text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {description}
          </p>
          
          {/* CTA */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-primary font-medium text-sm group-hover:underline">
              Shop Now
            </span>
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;