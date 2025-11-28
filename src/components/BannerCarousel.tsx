import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Banner {
  src: string;
  alt: string;
  navigationPath: string;
}

const banners: Banner[] = [
  {
    src: '/4Banners-Area-Inicio.png',
    alt: 'Banner Especial Natal',
    navigationPath: '/natal',
  },
  {
    src: '/2Banners-Area-Inicio.webp',
    alt: 'Produto 1',
    navigationPath: '/',
  },
  {
    src: '/3Banners-Area-Inicio.webp',
    alt: 'Produto 2',
    navigationPath: '/paper',
  },
  {
    src: '/1Banners-Area-Inicio.webp',
    alt: 'Produto 3',
    navigationPath: '/principal',
  },
];

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleViewContent = () => {
    navigate(banners[currentIndex].navigationPath);
  };

  return (
    <div className="w-full mt-12">
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Banner Container */}
        <div className="relative aspect-[16/9] md:aspect-[20/9] w-full overflow-hidden">
          {/* Banner Image */}
          <img
            src={banners[currentIndex].src}
            alt={banners[currentIndex].alt}
            className="w-full h-full object-cover transition-opacity duration-500"
          />

          {/* View Content Button (Center) */}
          <button
            onClick={handleViewContent}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-white hover:bg-gray-100 text-[#0F2741] px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Eye className="w-5 h-5" />
            Ver conteúdo
          </button>

          {/* Left Navigation Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#0F2741] rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Navigation Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#0F2741] rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            aria-label="Avançar"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Indicators Below Image */}
        <div className="flex items-center justify-center gap-6 bg-white px-4 py-4">
          {/* Back Button (Left) */}
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F2741] font-semibold transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          {/* Indicator Dots (Center) */}
          <div className="flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? 'w-8 h-2 bg-[#0F2741]'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para banner ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next Button (Right) */}
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F2741] font-semibold transition-all active:scale-95"
          >
            Avançar
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
