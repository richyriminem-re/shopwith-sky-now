import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Autoplay from 'embla-carousel-autoplay';
import LazyImage from '@/components/LazyImage';
import { ExternalLink, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface HeroSlide {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  webp_url: string | null;
  alt_text: string | null;
  link_url: string | null;
  link_text: string | null;
  link_target: string;
  cta_position: string | null;
  cta_size: string;
  is_active: boolean;
  display_order: number;
}

interface CTAButtonProps {
  slide: HeroSlide;
  onClick: (e: React.MouseEvent) => void;
}

const CTAButton = ({ slide, onClick }: CTAButtonProps) => {
  if (!slide.link_text || !slide.link_url) return null;

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={cn(
        "absolute z-10 transition-all duration-300",
        "neu-pressable bg-background/90 backdrop-blur-sm",
        "hover:bg-background/95 hover:scale-105",
        "text-foreground border border-border/20",
        // Position based on slide configuration or default to bottom-center
        slide.cta_position === 'bottom-left' && "bottom-4 left-4",
        slide.cta_position === 'bottom-right' && "bottom-4 right-4", 
        slide.cta_position === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        !slide.cta_position && "bottom-4 left-1/2 -translate-x-1/2"
      )}
      size={(slide.cta_size as "default" | "sm" | "lg" | "icon" | null) || "default"}
    >
      {slide.link_text}
      {slide.link_target === '_blank' && <ExternalLink className="ml-2 h-4 w-4" />}
    </Button>
  );
};

const HeroCarousel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const slideRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const impressionTracked = useRef<Set<string>>(new Set());
  const [activeSlides, setActiveSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch hero slides from database
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setActiveSlides(data || []);
      } catch (error) {
        console.error('Error fetching hero slides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Handle slide click
  const handleSlideClick = useCallback((slide: HeroSlide) => {
    if (!slide.link_url) return;
    
    if (slide.link_target === '_blank') {
      window.open(slide.link_url, '_blank', 'noopener,noreferrer');
    } else {
      // Use React Router for internal navigation
      try {
        navigate(slide.link_url);
      } catch (error) {
        console.error('Navigation failed:', error);
        // Fallback only for external URLs
        if (slide.link_url.startsWith('http')) {
          window.open(slide.link_url, '_self');
        }
      }
    }
  }, [navigate]);

  // Carousel controls
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const togglePlayPause = () => {
    if (!api) return;
    
    const autoplayPlugin = api.plugins().autoplay;
    if (autoplayPlugin) {
      if (isPlaying) {
        autoplayPlugin.stop();
      } else {
        autoplayPlugin.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Loading and no slides state
  if (loading) {
    return (
      <section className="w-full max-w-full overflow-hidden" aria-label="Loading hero slides">
        <div className="neu-surface p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  if (activeSlides.length === 0) {
    return (
      <section className="w-full max-w-full overflow-hidden" aria-label="No hero slides available">
        <div className="neu-surface p-8 text-center">
          <p className="text-muted-foreground">No active slides available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-full overflow-hidden relative" aria-label="Featured Products Carousel">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: activeSlides.length > 1,
          containScroll: "trimSnaps",
          slidesToScroll: 1,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full max-w-full"
      >
        <CarouselContent className="-ml-1 xs:-ml-2 sm:-ml-3 md:-ml-4">
          {activeSlides.map((slide, index) => (
            <CarouselItem 
              key={slide.id} 
              className="pl-1 xs:pl-2 sm:pl-3 md:pl-4 basis-[95%] xs:basis-[90%] sm:basis-[85%] md:basis-[80%] lg:basis-[75%] xl:basis-[70%]"
            >
              <div 
                ref={(el) => {
                  if (el) slideRefs.current.set(slide.id, el);
                }}
                data-slide-id={slide.id}
                className="relative rounded-lg xs:rounded-xl overflow-hidden mx-0.5 xs:mx-1 sm:mx-2 touch-manipulation cursor-pointer group"
                onClick={() => handleSlideClick(slide)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSlideClick(slide);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View ${slide.title} - ${slide.description}`}
              >
                <LazyImage
                  src={slide.image_url}
                  webpSrc={slide.webp_url || undefined}
                  alt={slide.alt_text || `${slide.title} - ${slide.description}`}
                  priority={index === 0}
                  aspectRatio="16/9"
                  className="w-full h-[180px] xs:h-[220px] sm:h-[280px] md:h-[360px] lg:h-[440px] xl:h-[480px] object-cover object-center transition-all duration-500 group-hover:scale-110"
                  sizes="(max-width: 375px) 95vw, (max-width: 640px) 90vw, (max-width: 768px) 85vw, (max-width: 1024px) 80vw, (max-width: 1280px) 75vw, 70vw"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation arrows */}
        {activeSlides.length > 1 && (
          <div className="hidden sm:block">
            <CarouselPrevious className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:scale-110 w-8 h-8 md:w-10 md:h-10 transition-all duration-300 shadow-lg" />
            <CarouselNext className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:scale-110 w-8 h-8 md:w-10 md:h-10 transition-all duration-300 shadow-lg" />
          </div>
        )}

        {/* Slide indicators */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === current 
                    ? "bg-white w-6" 
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </section>
  );
};

export default HeroCarousel;