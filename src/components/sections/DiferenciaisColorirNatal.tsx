import React from 'react';

export const DiferenciaisColorirNatal: React.FC = () => {
  // Função para scroll suave até a seção de bônus
  const handleScrollToPlanos = () => {
    const bonusSection = document.getElementById('bonus-section');
    if (bonusSection) {
      bonusSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="beneficios" className="py-16 md:py-24 bg-[#F8FBFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          {/* TEXTO PERSONALIZADO EDUKABOO NATAL */}
          <div className="relative inline-block my-2">
            <div className="relative bg-[#E6F7EE] border-2 border-[#009944] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
              {/* Detalhes dos cantos */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#009944] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#009944] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#009944] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#009944] rounded-full transform translate-x-1 translate-y-1"></div>

              {/* Texto destacado - LARANJA */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#FF9D2A] relative z-10">
                Com <span className="font-extrabold">passo a passo fácil</span> e <span className="font-extrabold">guia de cortes prático</span>.
              </h2>
            </div>
          </div>

          {/* Imagem EdukaBoo Head */}
          <div className="max-w-5xl mx-auto mb-8">
            <img
              src="/Natal/2gif-montagem.gif"
              alt="EdukaBoo Personagens Natal"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>

          {/* Botão CTA - MOVIDO PARA AQUI */}
          <div className="flex justify-center">
            <style>
              {`
                @keyframes gentlePulse {
                  0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 10px 25px rgba(0, 153, 68, 0.3);
                  }
                  50% {
                    transform: scale(1.02);
                    box-shadow: 0 15px 35px rgba(0, 153, 68, 0.5);
                  }
                }
                .pulse-button {
                  animation: gentlePulse 3s ease-in-out infinite;
                }
              `}
            </style>
            <button
              onClick={handleScrollToPlanos}
              className="pulse-button bg-[#009944] hover:bg-[#007a34] text-white font-bold text-lg py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              QUERO ADQUIRIR HOJE →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
