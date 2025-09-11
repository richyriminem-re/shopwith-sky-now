import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { useAppStore } from '@/lib/store';
import { calculateDiscountPercentage, isOnSale } from '@/lib/utils';
import LazyImage from './LazyImage';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  const { wishlist, toggleWishlist } = useAppStore();
  const isWished = wishlist.includes(product.id);
  
  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));
  
  // Enhanced price display with responsive formatting
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };
  
  // Check if any variant is on sale
  const hasVariantOnSale = product.variants.some(v => isOnSale(v.comparePrice, v.price));
  const variantOnSale = product.variants.find(v => isOnSale(v.comparePrice, v.price));
  
  // Calculate price display for current price
  const currentPriceDisplay = minPrice === maxPrice 
    ? formatPrice(minPrice)
    : formatPrice(minPrice);

  // Calculate savings if on sale
  const savingsAmount = hasVariantOnSale && variantOnSale?.comparePrice 
    ? variantOnSale.comparePrice - variantOnSale.price 
    : 0;

  return (
    <article className={`product-card-enhanced ${className}`}>
      {/* Image Container */}
      <div className="product-image-wrapper">
        <Link to={`/product/${product.handle}`} className="block">
          <div className="product-card-image aspect-[4/5] relative">
            <LazyImage 
              src={product.images[0]} 
              alt={`${product.title} - ${product.brand || 'Shop With Sky'}`}
              className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 374px) 150px, (max-width: 640px) 180px, (max-width: 768px) 200px, (max-width: 1024px) 220px, 250px"
            />
            {hasVariantOnSale && variantOnSale && (
              <div className="product-card-sale-badge">
                {calculateDiscountPercentage(variantOnSale.comparePrice!, variantOnSale.price)}% OFF
              </div>
            )}
          </div>
        </Link>
        
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`product-card-wishlist neu-pressable ${
            isWished 
              ? 'active text-red-500' 
              : 'text-muted-foreground hover:text-red-500'
          }`}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart 
            size={14} 
            fill={isWished ? 'currentColor' : 'none'}
            className="sm:w-4 sm:h-4" 
          />
        </button>
      </div>

      {/* Content Container */}
      <div className="product-content-wrapper">
        <Link to={`/product/${product.handle}`} className="block">
          <div className="product-text-box">
            <div className="product-info-section">
              {product.brand && (
                <p className="product-card-brand">
                  {product.brand}
                </p>
              )}
              
              <h3 className="product-card-title">
                {product.title}
              </h3>
              
              <div className="product-price-section">
                <div className={`product-price-container ${hasVariantOnSale ? 'on-sale' : ''}`}>
                  <span className="product-card-price">
                    {currentPriceDisplay}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;