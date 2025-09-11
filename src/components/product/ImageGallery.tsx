import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImageGalleryProps {
  images: string[];
  title: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const ImageGallery = ({ images, title, currentIndex, onIndexChange }: ImageGalleryProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isMobile = useIsMobile();

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleImageClick();
    } else if (e.key === 'Escape' && isFullscreen) {
      e.preventDefault();
      setIsFullscreen(false);
      setIsZoomed(false);
    }
  };

  const handleImageClick = () => {
    if (isFullscreen) {
      setIsZoomed(!isZoomed);
    } else {
      setIsFullscreen(true);
    }
  };

  return (
    <>
      {/* Main Image Container */}
      <div className="relative group" data-product-images>
        <div 
          className="aspect-square neu-surface rounded-xl overflow-hidden mb-2 sm:mb-4 relative focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="img"
          aria-label={`${title} - Image ${currentIndex + 1} of ${images.length}`}
        >
          <img 
            ref={imageRef}
            src={images[currentIndex]}
            alt={`${title} - View ${currentIndex + 1}`}
            className="w-full h-full object-cover object-center cursor-pointer transition-transform duration-300 hover:scale-105"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleImageClick}
            loading="lazy"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 neu-surface p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-primary"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                aria-label="Previous image"
              >
                <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 neu-surface p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-primary"
                onClick={handleNext}
                disabled={currentIndex === images.length - 1}
                aria-label="Next image"
              >
                <ChevronRight size={16} className="sm:w-5 sm:h-5" />
              </Button>
            </>
          )}

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 neu-surface p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 size={16} />
          </Button>

          {/* Thumbnail Navigation Overlay */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 rounded-b-xl">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => onIndexChange(index)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 border-2 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${
                      index === currentIndex 
                        ? 'border-white shadow-lg scale-105' 
                        : 'border-white/30 hover:border-white/60 hover:scale-105'
                    }`}
                    aria-label={`View image ${index + 1} of ${images.length}`}
                    aria-pressed={index === currentIndex}
                  >
                    <img 
                      src={image} 
                      alt={`${title} view ${index + 1}`} 
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-screen max-h-screen w-screen h-screen p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-16 right-4 z-10 bg-black/50 text-white hover:bg-black/70 border border-white/20 shadow-lg"
              onClick={() => setIsFullscreen(false)}
            >
              <X size={24} />
            </Button>

            <img
              src={images[currentIndex]}
              alt={title}
              className={`max-w-full max-h-full object-contain cursor-pointer transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              onClick={handleImageClick}
            />

            {/* Fullscreen Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  onClick={handleNext}
                  disabled={currentIndex === images.length - 1}
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            )}

            {/* Fullscreen Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onIndexChange(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};