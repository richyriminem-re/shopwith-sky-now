import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductByHandle } from '@/hooks/useApi';
import { useCartStore, useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { useProductDetailPreloading } from '@/hooks/useDeepPagePreloading';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ConsolidatedProductInfo } from '@/components/product/ConsolidatedProductInfo';
import { CompactPurchasePanel } from '@/components/product/CompactPurchasePanel';
import { Button } from '@/components/ui/button';

import SEOHead from '@/components/SEOHead';
import ProductSEO from '@/components/ProductSEO';
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton';
import PageWithNavigation from '@/components/PageWithNavigation';
import { formatCurrency } from '@/lib/utils';
import type { Variant } from '@/types';

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const { wishlist, toggleWishlist, addToRecentlyViewed } = useAppStore();
  const isMobile = useIsMobile();

  console.log('ProductDetail rendering, handle:', handle);
  
  // Defensive programming: ensure handle exists and is valid
  const validHandle = handle && handle.trim() !== '' ? handle : null;
  
  const { data: product, isLoading, error } = useProductByHandle(validHandle || '');
  
  console.log('Product fetch results:', { product, isLoading, error, handle: validHandle });

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantityError, setQuantityError] = useState<string | null>(null);

  // Preload remaining images after the first one loads
  const { preloadImages } = useImagePreloader();
  
  useEffect(() => {
    if (product?.images && product.images.length > 1) {
      preloadImages(product.images.slice(1));
    }
  }, [product?.images, preloadImages]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Deep page preloading for likely parent routes
  useProductDetailPreloading();

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      addToRecentlyViewed(product.id);
    }
  }, [product, addToRecentlyViewed]);

  // Clamp quantity when variant changes and show user feedback
  useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.stock) {
      const newQuantity = Math.max(1, selectedVariant.stock);
      setQuantity(newQuantity);
      if (selectedVariant.stock > 0) {
        setQuantityError(`Quantity reduced to ${newQuantity} (maximum available)`);
        const timer = setTimeout(() => setQuantityError(null), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setQuantityError(null);
    }
  }, [selectedVariant, quantity]);

  // Memoized availability calculations for better performance
  const { availableSizes, availableColors, availableSizeVariants, availableColorVariants } = useMemo(() => {
    if (!product) return { 
      availableSizes: [], 
      availableColors: [], 
      availableSizeVariants: new Set<string>(), 
      availableColorVariants: new Set<string>() 
    };
    
    const inStockVariants = product.variants.filter(v => v.stock > 0);
    const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
    const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
    const availableSizeSet = new Set(inStockVariants.map(v => v.size).filter(Boolean));
    const availableColorSet = new Set(inStockVariants.map(v => v.color).filter(Boolean));
    
    return {
      availableSizes: sizes,
      availableColors: colors,
      availableSizeVariants: availableSizeSet,
      availableColorVariants: availableColorSet
    };
  }, [product]);

  // Early return if no valid handle - AFTER all hooks
  if (!validHandle) {
    console.error('No valid handle provided to ProductDetail');
    return (
      <>
        <SEOHead 
          title="Product Not Found - Shop With Sky"
          description="The requested product could not be found."
          type="website"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="neu-surface p-8 text-center">
            <p className="text-neu-muted">Invalid product URL</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    console.error('Error in ProductDetail:', error);
    return (
      <>
        <SEOHead 
          title="Error Loading Product - Shop With Sky"
          description="There was an error loading the product."
          type="website"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="neu-surface p-8 text-center">
            <p className="text-neu-muted">Error loading product. Please try again.</p>
            <button 
              onClick={() => navigate('/', { replace: true })} 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <>
        <SEOHead 
          title="Product Not Found - Shop With Sky"
          description="The requested product could not be found."
          type="website"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="neu-surface p-8 text-center">
            <p className="text-neu-muted">Product not found</p>
            <button 
              onClick={() => navigate('/product')} 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              View All Products
            </button>
          </div>
        </div>
      </>
    );
  }

  const isWished = product ? wishlist.includes(product.id) : false;

  const handleVariantChange = (attribute: 'size' | 'color', value: string) => {
    if (!product.variants.length) return;
    
    // Try to find exact match first (both size and color)
    let newVariant = product.variants.find(v => {
      if (attribute === 'size') {
        return v.size === value && (!selectedVariant?.color || v.color === selectedVariant.color);
      } else {
        return v.color === value && (!selectedVariant?.size || v.size === selectedVariant.size);
      }
    });
    
    // Fallback: find any variant with the selected attribute
    if (!newVariant) {
      newVariant = product.variants.find(v => 
        attribute === 'size' ? v.size === value : v.color === value
      );
    }
    
    if (newVariant) {
      setSelectedVariant(newVariant);
    }
  };

  const handleAddToCart = (): boolean => {
    if (!selectedVariant) return false;
    
    if (selectedVariant.stock < quantity) {
      toast({
        title: "Not enough stock",
        description: `Only ${selectedVariant.stock} items available`,
        variant: "destructive",
      });
      return false;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      qty: quantity,
    });

    toast({
      title: "Added. Your cart feels fuller.",
      description: `${product.title} added to cart`,
    });
    return true;
  };

  const handleBuyNow = () => {
    if (handleAddToCart()) {
      navigate('/cart');
    }
  };

  // Generate dynamic SEO content
  const productTitle = `${product.title} - Shop With Sky`;
  const productDescription = `${product.description.substring(0, 150)}${product.description.length > 150 ? '...' : ''}`;
  const productImage = product.images[0];

  return (
    <PageWithNavigation fallbackRoute="/product">
      <SEOHead 
        title={productTitle}
        description={productDescription}
        keywords={`${product.title}, ${product.brand || ''}, ${product.primaryCategory}, ${product.subcategory}, fashion, shopping`}
        image={productImage}
        type="product"
      />
      <ProductSEO product={product} selectedVariant={selectedVariant} />
      
      <main className="pb-16 sm:pb-20 pb-safe">
        {/* Responsive Layout - Stacked on mobile, two-column on desktop */}
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {/* Image Gallery - Full width on mobile, 7 columns on desktop */}
            <div className="md:col-span-7">
              <div className="mb-4">
                <ImageGallery
                  images={product.images}
                  title={product.title}
                  currentIndex={currentImageIndex}
                  onIndexChange={setCurrentImageIndex}
                />
              </div>
            </div>

            {/* Product Info & Actions - Full width on mobile, 5 columns on desktop */}
            <div className="md:col-span-5">
              <div className="space-y-4 sm:space-y-6 md:sticky md:top-8">
                {/* Consolidated Product Info + Variants */}
                <div className="neu-surface p-4 sm:p-5 lg:p-6">
                  <ConsolidatedProductInfo
                    product={product}
                    selectedVariant={selectedVariant}
                    isWished={isWished}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                    availableSizes={availableSizes}
                    availableColors={availableColors}
                    selectedSize={selectedVariant?.size}
                    selectedColor={selectedVariant?.color}
                    onSizeChange={(size) => handleVariantChange('size', size)}
                    onColorChange={(color) => handleVariantChange('color', color)}
                    stock={selectedVariant?.stock}
                    availableSizeVariants={availableSizeVariants}
                    availableColorVariants={availableColorVariants}
                  />
                </div>

                {/* Quantity Error Message */}
                {quantityError && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                    <p className="text-sm text-orange-800">{quantityError}</p>
                  </div>
                )}

                {/* Compact Purchase Panel */}
                <div className="neu-surface p-4 sm:p-5 lg:p-6">
                  <CompactPurchasePanel
                    selectedVariant={selectedVariant}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWithNavigation>
  );
};

export default ProductDetail;