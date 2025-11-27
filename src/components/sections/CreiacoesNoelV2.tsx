import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CreiacoesNoelV2: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const photos = [
    '/Natal/foto03.webp',
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

  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-[#1a4d2e] mb-2">
            🌟 O que seu pequeno vai criar
          </h2>
          <div className="text-3xl">⭐</div>
        </div>

        {/* Grid 2x2 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#FFE8D4] to-[#FFCFB3] rounded-xl p-6 text-center border-2 border-[#db143c] flex flex-col items-center justify-center min-h-[140px]">
            <div className="text-4xl mb-2">🎅</div>
            <p className="font-bold text-[#333] text-sm md:text-base">Papai Noel</p>
          </div>

          <div className="bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] rounded-xl p-6 text-center border-2 border-[#0284C7] flex flex-col items-center justify-center min-h-[140px]">
            <div className="text-4xl mb-2">☃️</div>
            <p className="font-bold text-[#333] text-sm md:text-base">Boneco de Neve</p>
          </div>

          <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-6 text-center border-2 border-[#F59E0B] flex flex-col items-center justify-center min-h-[140px]">
            <div className="text-4xl mb-2">🦌</div>
            <p className="font-bold text-[#333] text-sm md:text-base">Renas</p>
          </div>

          <div className="bg-gradient-to-br from-[#E0FEE0] to-[#BBFBBB] rounded-xl p-6 text-center border-2 border-[#22C55E] flex flex-col items-center justify-center min-h-[140px]">
            <div className="text-4xl mb-2">🏠</div>
            <p className="font-bold text-[#333] text-sm md:text-base">Casinhas 3D</p>
          </div>
        </div>

        {/* Emotional Text */}
        <div className="bg-[#1a4d2e] rounded-xl p-6 text-center text-white">
          <p className="text-base md:text-lg leading-relaxed">
            Cenários 3D, personagens e mini decorações para trazer o clima natalino pra dentro da sua casa ou sala de aula
            <span className="text-[#FFD700] font-bold"> 🎄✨</span>
          </p>
        </div>

        {/* Photo Carousel */}
        <div className="relative mx-auto" style={{ width: '88%' }}>
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={photos[currentSlide]}
              alt={`Criação ${currentSlide + 1}`}
              className="w-full h-auto object-cover rounded-xl"
            />

            {/* Navigation */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6 text-[#1a4d2e]" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
              aria-label="Próximo"
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
                  aria-label={`Ir para foto ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
