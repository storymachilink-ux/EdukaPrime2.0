import React from 'react';
import { ChevronDown } from 'lucide-react';

export const OQueVaiReceberNoel: React.FC = () => {

  return (
    <section id="o-que-vai-receber" className="py-12 md:py-16 px-4 bg-[#145C44] scroll-mt-20">
      <style>{`
        @keyframes drop {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          35% {
            opacity: 0.4;
            transform: translateY(0);
          }
          70% {
            opacity: 0.1;
            transform: translateY(6px);
          }
          100% {
            opacity: 0;
            transform: translateY(10px);
          }
        }

        .chevron-below-bonus {
          text-align: center;
          font-size: 32px;
          color: #1a4d2e;
          letter-spacing: -4px;
          pointer-events: none;
          animation: drop 1.8s infinite ease-in-out;
          margin-top: -12px;
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-2xl md:text-3xl font-black text-white text-center">
          O que você vai receber
        </h2>

        {/* Imagem Produto */}
        <div>
          <img
            src="/Natal/produto-plat.webp"
            alt="Produto"
            className="w-full h-auto"
          />
        </div>

        <div className="space-y-4">
          {/* GIF Básico */}
          <div className="rounded-xl overflow-hidden shadow-lg border-2 border-white">
            <img
              src="/Natal/Gif-Basico.gif"
              alt="Kit Básico"
              className="w-full h-auto"
            />
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-[#145C44]"><span className="text-[#f8c630]">✅</span> Personagens clássicos</p>
            <p className="text-sm md:text-base text-[#333]">Papai Noel, Renas, Boneco de Neve e Duendes para recortar, montar e brincar.</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-[#145C44]"><span className="text-[#f8c630]">✅</span> Cenários & decorações 3D</p>
            <p className="text-sm md:text-base text-[#333]">Casinhas, árvores, vila de natal e mini-cenários que deixam tudo com clima natalino.</p>
          </div>

          {/* GIF Completo */}
          <div className="rounded-xl overflow-hidden shadow-lg border-2 border-white">
            <img
              src="/Natal/Gif-Completo.gif"
              alt="Kit Completo"
              className="w-full h-auto"
            />
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-[#145C44]"><span className="text-[#f8c630]">✅</span> Caixinhas & enfeites</p>
            <p className="text-sm md:text-base text-[#333]">Modelos prontos para decorar ou usar como pequenas lembrancinhas.</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-[#145C44]"><span className="text-[#f8c630]">✅</span> Guias passo a passo</p>
            <p className="text-sm md:text-base text-[#333]">Instruções ilustradas em versão colorida e para colorir — fáceis para qualquer criança montar.</p>
          </div>
        </div>

        {/* Seta para baixo */}
        <div className="flex justify-center pt-8">
          <ChevronDown className="w-8 h-8 text-white animate-bounce" />
        </div>
      </div>
    </section>
  );
};
