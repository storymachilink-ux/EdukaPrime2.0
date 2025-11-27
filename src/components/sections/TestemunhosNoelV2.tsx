import React, { useState } from 'react';

export const TestemunhosNoelV2: React.FC = () => {
  const testimonies = [
    {
      image: '/Natal/kid02.webp',
      name: 'Ana',
      quote: '"Nunca vi meu filho tão orgulhoso ao terminar algo!"'
    },
    {
      image: '/Natal/kid03.webp',
      name: 'Prof. Camila',
      quote: '"Meus alunos vibraram! Fizemos exposição!"'
    },
    {
      image: '/Natal/kid05.webp',
      name: 'Júlia',
      quote: '"Sem telas, sem bagunça. Pura criatividade!"'
    },
    {
      image: '/Natal/kid06.webp',
      name: 'Marina',
      quote: '"Horas de diversão garantidas! Super recomendo!"'
    }
  ];

  return (
    <section className="py-12 md:py-16 px-4 bg-[#FEFCE8]">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-[#1a4d2e] mb-2">
            💬 Famílias apaixonadas
          </h2>
          <p className="text-2xl">⭐⭐⭐⭐⭐</p>
          <p className="text-base md:text-lg font-bold text-[#333] mt-2">
            Mais de 3.100 famílias encantadas
          </p>
        </div>

        {/* Grid 2x2 com imagens e depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonies.map((test, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border-2 border-[#FFD700] shadow-md">
              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src={test.image}
                  alt={test.name}
                  className="w-full h-64 object-cover"
                />
              </div>
              <p className="text-base md:text-lg text-[#FFD700] font-bold mb-2">"{test.quote}"</p>
              <p className="text-sm md:text-base font-bold text-[#1a4d2e]">— {test.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
