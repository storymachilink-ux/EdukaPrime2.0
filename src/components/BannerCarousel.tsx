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
        <div
          className="relative w-full overflow-hidden cursor-pointer bg-gray-50"
          onClick={handleViewContent}
        >
          {/* Banner Image */}
          <img
            src={banners[currentIndex].src}
            alt={banners[currentIndex].alt}
            className="w-full h-auto object-contain transition-opacity duration-500 hover:opacity-90"
          />

          {/* Left Navigation Button - Desktop Only */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#0F2741] rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Navigation Button - Desktop Only */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#0F2741] rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            aria-label="Avançar"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Controls Below Image */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 bg-white px-4 py-4">
          {/* Back Button (Left) */}
          <button
            onClick={handlePrev}
            className="flex items-center justify-center md:justify-start gap-2 flex-1 md:flex-none px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F2741] font-semibold transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden md:inline">Voltar</span>
          </button>

          {/* View Content Button (Center) - Green */}
          <button
            onClick={handleViewContent}
            className="flex items-center justify-center gap-2 flex-1 md:flex-none px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Eye className="w-5 h-5" />
            <span>Ver conteúdo</span>
          </button>

          {/* Next Button (Right) */}
          <button
            onClick={handleNext}
            className="flex items-center justify-center md:justify-end gap-2 flex-1 md:flex-none px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F2741] font-semibold transition-all active:scale-95"
          >
            <span className="hidden md:inline">Avançar</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2 bg-white px-4 pb-4">
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
      </div>
    </div>
  );
}
