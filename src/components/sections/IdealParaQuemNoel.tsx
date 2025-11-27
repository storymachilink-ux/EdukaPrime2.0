import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const IdealParaQuemNoel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const photos = [
    '/Natal/kid06.webp',
    '/Natal/kid05.webp',
    '/Natal/kid02.webp'
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
        <h2 className="text-2xl md:text-3xl font-black text-[#1a4d2e] text-center">
          Ideal Para Quem?
        </h2>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#FFE8D4] to-[#FFCFB3] rounded-lg p-6 border-l-4 border-[#db143c] flex items-start gap-4">
            <img
              src="/b01.webp"
              alt="Pais e mães"
              className="w-12 h-12 flex-shrink-0 object-cover"
            />
            <p className="text-base md:text-lg font-semibold text-[#333]">
              Pais e mães que querem momentos sem telas e com criatividade.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] rounded-lg p-6 border-l-4 border-[#0284C7] flex items-start gap-4">
            <img
              src="/be05.webp"
              alt="Professoras"
              className="w-12 h-12 flex-shrink-0 object-cover"
            />
            <p className="text-base md:text-lg font-semibold text-[#333]">
              Professoras que buscam atividades prontas, lúdicas e pedagógicas.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-lg p-6 border-l-4 border-[#009944] flex items-start gap-4">
            <img
              src="/bncc.webp"
              alt="Famílias"
              className="w-12 h-12 flex-shrink-0 object-cover"
            />
            <p className="text-base md:text-lg font-semibold text-[#333]">
              Famílias que desejam decorar a casa com o que as crianças fizeram.
            </p>
          </div>
        </div>

        {/* Carrossel */}
        <div className="relative mx-auto" style={{ width: '88%' }}>
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={photos[currentSlide]}
              alt={`Crianças felizes ${currentSlide + 1}`}
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
      </div>
    </section>
  );
};
