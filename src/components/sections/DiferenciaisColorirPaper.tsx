import React from 'react';

export const DiferenciaisColorirPaper: React.FC = () => {
  // Função para scroll suave até a seção de planos
  const handleScrollToPlanos = () => {
    const planosSection = document.getElementById('planos');
    if (planosSection) {
      planosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="beneficios" className="py-16 md:py-24 bg-[#F8FBFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          {/* TEXTO PERSONALIZADO EDUKABOO */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-ink mb-8 leading-relaxed">
            <span className="text-[#8B5CF6] font-extrabold">Uma experiência criativa que une aprendizado e diversão!</span> Com <span className="text-[#8B5CF6] font-extrabold">passo a passo fácil</span> e <span className="text-[#8B5CF6] font-extrabold">guia de cortes prático</span>, as crianças desenvolvem <span className="text-[#8B5CF6] font-extrabold">autonomia e confiança</span> enquanto montam <span className="text-[#8B5CF6] font-extrabold">personagens incríveis do Halloween</span>.
          </h2>

          {/* Imagem EdukaBoo Head */}
          <div className="max-w-5xl mx-auto mb-8">
            <img
              src="/boo/gif-HeadSecao-01.gif"
              alt="EdukaBoo Personagens"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>

          {/* Botão CTA - MOVIDO PARA AQUI */}
          <div className="flex justify-center">
            <button
              onClick={handleScrollToPlanos}
              className="bg-gradient-to-r from-[#FF9D2A] to-[#FF6B2C] hover:from-[#FFB347] hover:to-[#FF8C42] text-white font-bold text-lg py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              QUERO O COMBO COMPLETO DE HALLOWEEN 🎃
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
