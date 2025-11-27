import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ConteudosComplementaresNoel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const bonuses = [
    {
      image: '/Natal/bonus01.webp',
      title: 'Nascimento de Jesus'
    },
    {
      image: '/Natal/bonus02.webp',
      title: 'Trem do Noel'
    },
    {
      image: '/Natal/bonus03.webp',
      title: 'Caixinhas presentes'
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bonuses.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bonuses.length) % bonuses.length);

  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Title and Description */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-[#db143c]">
            🎁 Conteúdos Extras Exclusivos
          </h2>
          <p className="text-base md:text-lg text-[#333] leading-relaxed">
            Esses materiais foram criados para deixar o Natal ainda mais completo, lúdico e especial
            <span className="text-[#FFD700] font-bold"> 🎅🏻✨</span>
          </p>
        </div>

        {/* Horizontal Slider */}
        <div className="relative">
          <div className="flex overflow-hidden rounded-xl">
            {bonuses.map((bonus, idx) => (
              <div
                key={idx}
                className={`flex-shrink-0 w-full transition-opacity duration-500 ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              >
                <img
                  src={bonus.image}
                  alt={bonus.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
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
          <div className="flex justify-center gap-2 mt-4">
            {bonuses.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'w-8 bg-[#db143c]' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Support Text */}
        <div className="text-center bg-[#FFE8D4] rounded-xl p-6 border-2 border-[#db143c]">
          <p className="text-base md:text-lg font-semibold text-[#333]">
            Para brincar, montar, decorar e criar lembranças pra guardar para sempre
            <span className="text-2xl ml-2">📸</span>
          </p>
        </div>
      </div>
    </section>
  );
};
