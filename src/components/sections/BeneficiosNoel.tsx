import React from 'react';
import { ChevronDown } from 'lucide-react';

export const BeneficiosNoel: React.FC = () => {
  const handleScrollToPlanos = () => {
    const receberSection = document.getElementById('o-que-vai-receber');
    if (receberSection) {
      receberSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Texto descritivo - Faixa Post-it */}
        <div className="flex justify-center">
          <div className="relative inline-block my-2">
            <div className="relative bg-[#FFE5E5] border-2 border-[#db143c] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
              {/* Detalhes dos cantos */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#db143c] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#db143c] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#db143c] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#db143c] rounded-full transform translate-x-1 translate-y-1"></div>

              {/* Texto destacado */}
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#991B1B] relative z-10 text-center">
                Com passo a passo fácil e guia de cortes prático.
              </span>
            </div>
          </div>
        </div>

        {/* GIF Movement */}
        <div className="rounded-xl overflow-hidden shadow-lg" style={{ width: '88%', margin: '0 auto' }}>
          <img
            src="/Natal/2gif-montagem.gif"
            alt="Gif montagem movimento"
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-[#00C853] shadow-sm">
            <p className="text-base md:text-lg font-semibold text-[#333]">
              ✅ Crie momentos de aprendizado e diversão em casa ou na escola
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-[#00C853] shadow-sm">
            <p className="text-base md:text-lg font-semibold text-[#333]">
              ✅ Imprima quantas vezes quiser e aproveite com a família ou com a turma
            </p>
          </div>
        </div>

        {/* Botão CTA */}
        <div className="flex justify-center">
          <button
            onClick={handleScrollToPlanos}
            className="bg-[#db143c] hover:bg-[#A01F1F] text-white font-black text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 w-full max-w-sm"
          >
            QUERO UM NATAL CRIATIVO!
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
