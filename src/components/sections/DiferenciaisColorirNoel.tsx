import React from 'react';

export const DiferenciaisColorirNoel: React.FC = () => {
  const handleScrollToPlanos = () => {
    const planosSection = document.getElementById('planos');
    if (planosSection) {
      planosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="beneficios" className="py-8 md:py-12 bg-[#F8FBFF]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Section Title */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-[#009944] mb-4">
            🌟 A brincadeira vira criação real
          </h2>

          <p className="text-base md:text-lg text-[#333] font-semibold mb-3">
            Cada recorte, cada dobrinha é <span className="text-[#db143c]">aprendizado + amor</span>
          </p>

          {/* Development Areas */}
          <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-[#009944] space-y-3 mb-6">
            <p className="font-bold text-[#333] text-lg">Desenvolve:</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3">
                <span className="text-xl">🧠</span>
                <span className="font-semibold text-[#333]">Criatividade</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🎯</span>
                <span className="font-semibold text-[#333]">Foco</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">✋</span>
                <span className="font-semibold text-[#333]">Coordenação</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">⏳</span>
                <span className="font-semibold text-[#333]">Paciência</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">💪</span>
                <span className="font-semibold text-[#333]">Autoestima</span>
              </div>
            </div>
          </div>

          {/* Emotional Message */}
          <div className="bg-[#FFE8D4] rounded-xl p-4 md:p-6 border-2 border-[#db143c]">
            <p className="text-base md:text-lg font-bold text-[#db143c]">
              "Fui eu que fiz!" — e o coração da mãe derrete 🥹❤️
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img
            src="/Natal/kid01.webp"
            alt="Criança montando papercraft"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={handleScrollToPlanos}
            className="w-full bg-[#FF9D2A] hover:bg-[#E68A1F] text-white font-black text-base md:text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            👉 QUERO O MATERIAL
          </button>
        </div>
      </div>
    </section>
  );
};
