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
        <div className="relative w-full overflow-hidden bg-gray-50">
          {/* Banner Image */}
          <img
            src={banners[currentIndex].src}
            alt={banners[currentIndex].alt}
            className="w-full h-auto object-contain transition-opacity duration-500"
          />
        </div>

        {/* Navigation Controls Below Image */}
        <div className="flex items-center justify-center gap-4 bg-white px-4 py-4">
          {/* Left Navigation Button */}
          <button
            onClick={handlePrev}
            className="flex items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F2741] font-semibold transition-all active:scale-95"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* View Content Button (Center) - Green */}
          <button
            onClick={handleViewContent}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Eye className="w-5 h-5" />
            <span>Ver conteúdo</span>
          </button>

          {/* Right Navigation Button */}
          <button
            onClick={handleNext}
            className="flex items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F2741] font-semibold transition-all active:scale-95"
            aria-label="Avançar"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
