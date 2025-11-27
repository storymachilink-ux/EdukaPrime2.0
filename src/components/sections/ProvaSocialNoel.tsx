import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export const ProvaSocialNoel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const photos = [
    '/Natal/foto02.webp',
    '/Natal/foto04.webp',
    '/Natal/foto05.webp',
    '/Natal/foto06.webp'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % photos.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);

  const handleScrollToKit = () => {
    const kitSection = document.getElementById('kit-completo-noel');
    if (kitSection) {
      kitSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-12 md:py-16 px-4 bg-[#F5F5F5]">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a4d2e]">
            Veja por Dentro
          </h2>
          <p className="text-base md:text-lg font-semibold text-[#333]">
            Mais de 3.100 famílias já transformaram o Natal com o EdukaPapers
          </p>
          <p className="text-2xl">⭐⭐⭐⭐⭐</p>
          <p className="text-sm md:text-base text-[#333]">
            Personagens, cenários 3D e guias práticos que as crianças conseguem seguir.
          </p>
        </div>

        {/* Carrossel */}
        <div className="relative mx-auto" style={{ width: '88%' }}>
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={photos[currentSlide]}
              alt={`Criação ${currentSlide + 1}`}
              className="w-full h-auto object-cover"
            />

            {/* Navigation */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10"
            >
              <ChevronLeft className="w-6 h-6 text-[#1a4d2e]" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10"
            >
              <ChevronRight className="w-6 h-6 text-[#1a4d2e]" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide ? 'w-8 bg-[#1a4d2e]' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Botão CTA */}
        <div className="flex justify-center">
          <button
            onClick={handleScrollToKit}
            className="bg-[#db143c] hover:bg-[#A01F1F] text-white font-black text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 w-full max-w-sm"
          >
            ADQUIRIR HOJE MESMO
          </button>
        </div>

        {/* Seta para baixo */}
        <div className="flex justify-center pt-8">
          <ChevronDown className="w-8 h-8 text-[#145C44] animate-bounce" />
        </div>
      </div>
    </section>
  );
};
