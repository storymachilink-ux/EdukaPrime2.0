import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: { src: string; alt: string }[];
}

export const FeatureCarousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ images, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(Math.floor(images.length / 2));

    const handleNext = React.useCallback(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const handlePrev = React.useCallback(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    React.useEffect(() => {
      const timer = setInterval(() => {
        handleNext();
      }, 4000);
      return () => clearInterval(timer);
    }, [handleNext]);

    return (
      <div
        ref={ref}
        className={cn('relative w-full py-12 px-4', className)}
        {...props}
      >
        {/* Main Showcase Section */}
        <div className="relative w-full h-[350px] md:h-[450px] flex items-center justify-center">
          {/* Carousel Wrapper */}
          <div className="relative w-full h-full flex items-center justify-center [perspective:1000px]">
            {images.map((image, index) => {
              const offset = index - currentIndex;
              const total = images.length;
              let pos = (offset + total) % total;
              if (pos > Math.floor(total / 2)) {
                pos = pos - total;
              }

              const isCenter = pos === 0;
              const isAdjacent = Math.abs(pos) === 1;

              return (
                <div
                  key={index}
                  className={cn(
                    'absolute w-48 h-64 md:w-72 md:h-[400px] transition-all duration-500 ease-in-out',
                    'flex items-center justify-center'
                  )}
                  style={{
                    transform: `
                      translateX(${pos * 45}%)
                      scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7})
                      rotateY(${pos * -10}deg)
                    `,
                    zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                    opacity: isCenter ? 1 : isAdjacent ? 0.4 : 0,
                    filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                    visibility: Math.abs(pos) > 1 ? 'hidden' : 'visible',
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="object-cover w-full h-full rounded-3xl border-4 border-white shadow-2xl"
                  />
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <button
            className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-20 bg-white/80 hover:bg-white border-2 border-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
            onClick={handlePrev}
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-5 w-5 text-black" />
          </button>
          <button
            className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-20 bg-white/80 hover:bg-white border-2 border-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
            onClick={handleNext}
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Ir para imagem ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }
);

FeatureCarousel.displayName = 'FeatureCarousel';
