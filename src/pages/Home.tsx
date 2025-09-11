import { useEffect } from 'react';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import CategoryCard from '@/components/CategoryCard';
import CategoryCardSkeleton from '@/components/CategoryCardSkeleton';
import HeroCarousel from '@/components/HeroCarousel';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import PageWithNavigation from '@/components/PageWithNavigation';
import { LoadingErrorBoundary } from '@/components/LoadingErrorBoundary';
import { LoadingStateManager } from '@/components/LoadingStateManager';
import { useFeaturedProductsWithAbort, useProductsWithAbort, useLoadingStates } from '@/hooks/useApiWithAbort';
import { ChevronRight, Star, Sparkles } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const Home = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Fetch data using enhanced hooks with error recovery
  const featuredQuery = useFeaturedProductsWithAbort();
  const newArrivalsQuery = useProductsWithAbort({ 
    category: 'womens-fashion',
    limit: 6 
  });

  // Use enhanced loading state management
  const loadingStates = useLoadingStates([featuredQuery, newArrivalsQuery]);
  
  const featuredProducts = (featuredQuery.data as Product[]) || [];
  const newArrivalsData = (newArrivalsQuery.data as Product[]) || [];
  
  // Data is already limited by API calls, no need to slice

  const categories = [
    { 
      name: 'Bags & Shoes', 
      path: '/product?primary=bags-shoes',
      gradient: 'from-amber-400/20 to-orange-400/20',
      description: 'Discover our collection of premium bags, handbags, and footwear for every style.',
      promotionalText: 'New In'
    },
    { 
      name: "Men's Fashion", 
      path: '/product?primary=mens-fashion',
      gradient: 'from-blue-400/20 to-indigo-400/20',
      description: 'Modern essentials, casual wear, and premium pieces for the contemporary man.',
      promotionalText: 'Trending'
    },
    { 
      name: "Women's Fashion", 
      path: '/product?primary=womens-fashion',
      gradient: 'from-rose-400/20 to-pink-400/20',
      description: 'Elegant dresses, stylish tops, and comfortable basics for every occasion.',
      promotionalText: 'Up to 50% Off'
    },
    { 
      name: 'Beauty & Fragrance', 
      path: '/product?primary=beauty-fragrance',
      gradient: 'from-purple-400/20 to-pink-400/20',
      description: 'Luxurious perfumes, skincare, makeup, and body care essentials.',
      promotionalText: 'Gift Sets'
    },
  ];

  return (
    <PageWithNavigation fallbackRoute="/">
      <SEOHead 
        title="Shop With Sky - Premium Fashion & Lifestyle | Latest Trends"
        description="Discover the latest trends and timeless pieces at Shop With Sky. Shop premium fashion for women, men, and accessories with fast shipping and easy returns."
        keywords="fashion, clothing, women fashion, men fashion, accessories, online shopping, premium fashion, style, trends, latest fashion"
      />
      
      <div className="pb-6">
        {/* Breadcrumb Navigation */}
        <div className="px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 pb-2">
          <Breadcrumb />
        </div>

        {/* Hero Carousel */}
        <section className="mb-6 xs:mb-7 sm:mb-8 animate-fade-in">
          <HeroCarousel />
        </section>

        <div className="pt-2">

          {/* Categories */}
          <LoadingErrorBoundary>
            <section className="px-3 xs:px-4 sm:px-6 mb-8 xs:mb-10 sm:mb-12 animate-fade-in">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
                <h1 className="text-xl xs:text-2xl sm:text-2xl font-bold text-neu-primary">Shop by Category</h1>
                <div className="flex items-center gap-1 text-neu-muted">
                  <Sparkles size={14} className="xs:w-4 xs:h-4" />
                  <span className="text-xs xs:text-sm font-medium">Curated Collections</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                {loadingStates.isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="animate-in" style={{ animationDelay: `${i * 75}ms` }}>
                      <CategoryCardSkeleton />
                    </div>
                  ))
                ) : (
                  categories.map((category, i) => (
                    <div key={category.name} className="animate-in" style={{ animationDelay: `${i * 75}ms` }}>
                      <CategoryCard
                        name={category.name}
                        path={category.path}
                        gradient={category.gradient}
                        description={category.description}
                        promotionalText={category.promotionalText}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          </LoadingErrorBoundary>

          {/* Editor's Picks Carousel */}
          <LoadingErrorBoundary onRetry={() => featuredQuery.refetch()}>
            <section className="mb-8 xs:mb-10 sm:mb-12 animate-fade-in">
              <div className="px-3 xs:px-4 sm:px-6 mb-4 xs:mb-5 sm:mb-6">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 sm:gap-4">
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 sm:gap-3">
                    <h2 className="text-xl xs:text-2xl sm:text-2xl font-bold text-neu-primary">Editor's Picks</h2>
                    <div className="flex items-center gap-1.5 text-primary">
                      <Star size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" fill="currentColor" />
                      <span className="text-xs sm:text-sm font-medium">Handpicked</span>
                    </div>
                  </div>
                  <Link to="/product" className="flex items-center gap-1.5 text-neu-muted hover:text-neu-primary transition-colors self-start xs:self-center touch-target">
                    <span className="text-xs xs:text-sm font-medium">View all</span>
                    <ChevronRight size={14} className="xs:w-4 xs:h-4" />
                  </Link>
                </div>
              </div>
              
              <div className="px-3 xs:px-4 sm:px-6">
                <LoadingStateManager
                  isLoading={featuredQuery.isLoading}
                  hasError={featuredQuery.isError}
                  onRetry={() => featuredQuery.refetch()}
                  skeleton={
                    <Carousel className="w-full">
                      <CarouselContent className="-ml-1 xs:-ml-2">
                        {[...Array(6)].map((_, i) => (
                          <CarouselItem key={i} className="pl-1 xs:pl-2 basis-1/2 xs:basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                            <div className="animate-in" style={{ animationDelay: `${i * 75}ms` }}>
                              <ProductCardSkeleton variant="featured" />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-1 xs:left-2 w-8 h-8 xs:w-9 xs:h-9" />
                      <CarouselNext className="right-1 xs:right-2 w-8 h-8 xs:w-9 xs:h-9" />
                    </Carousel>
                  }
                >
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-1 xs:-ml-2">
                      {featuredProducts.map((product, i) => (
                        <CarouselItem key={product.id} className="pl-1 xs:pl-2 basis-1/2 xs:basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                          <div className="animate-in" style={{ animationDelay: `${i * 75}ms` }}>
                            <ProductCard product={product} />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-1 xs:left-2 w-8 h-8 xs:w-9 xs:h-9" />
                    <CarouselNext className="right-1 xs:right-2 w-8 h-8 xs:w-9 xs:h-9" />
                  </Carousel>
                </LoadingStateManager>
              </div>
            </section>
          </LoadingErrorBoundary>

          {/* New Arrivals */}
          <LoadingErrorBoundary onRetry={() => newArrivalsQuery.refetch()}>
            <section className="px-3 xs:px-4 sm:px-6 mb-8 xs:mb-10 sm:mb-12 animate-fade-in">
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 sm:gap-4">
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 sm:gap-3">
                    <h2 className="text-xl xs:text-2xl sm:text-2xl font-bold text-neu-primary">New Arrivals</h2>
                    <div className="flex items-center gap-1.5 text-primary">
                      <Sparkles size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" fill="currentColor" />
                      <span className="text-xs sm:text-sm font-medium">Fresh</span>
                    </div>
                  </div>
                  <Link to="/product?sort=newest" className="flex items-center gap-1.5 text-neu-muted hover:text-neu-primary transition-colors self-start xs:self-center touch-target">
                    <span className="text-xs xs:text-sm font-medium">View all</span>
                    <ChevronRight size={14} className="xs:w-4 xs:h-4" />
                  </Link>
                </div>
              </div>
              <LoadingStateManager
                isLoading={newArrivalsQuery.isLoading}
                hasError={newArrivalsQuery.isError}
                onRetry={() => newArrivalsQuery.refetch()}
                showProgress={true}
                loadingProgress={loadingStates.loadingProgress}
                skeleton={
                  <div className="responsive-products-grid">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-in" style={{ animationDelay: `${i * 75}ms` }}>
                        <ProductCardSkeleton />
                      </div>
                    ))}
                  </div>
                }
              >
                <div className="responsive-products-grid">
                  {newArrivalsData.map((product, i) => (
                    <div key={product.id} className="animate-in" style={{ animationDelay: `${i * 75}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </LoadingStateManager>
            </section>
          </LoadingErrorBoundary>

        </div>
      </div>
      
      <Footer />
    </PageWithNavigation>
  );
};

export default Home;