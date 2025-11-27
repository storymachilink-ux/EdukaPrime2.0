import React, { useEffect } from 'react';
import { SubscribeButton } from '../ui/subscribe-button';
import { LoginButton } from '../ui/login-button';
import { AuroraBackground } from '../ui/aurora-background';
import { SparklesText } from '../ui/sparkles-text';

interface HeroProps {
  onLoginClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLoginClick }) => {
  useEffect(() => {
    // Carregar scripts do Wistia
    const playerScript = document.createElement('script');
    playerScript.src = 'https://fast.wistia.com/player.js';
    playerScript.async = true;
    document.head.appendChild(playerScript);

    const embedScript = document.createElement('script');
    embedScript.src = 'https://fast.wistia.com/embed/78docpnbgg.js';
    embedScript.async = true;
    embedScript.type = 'module';
    document.head.appendChild(embedScript);

    return () => {
      // Cleanup ao desmontar
      document.head.removeChild(playerScript);
      document.head.removeChild(embedScript);
    };
  }, []);

  return (
    <section id="inicio">
      <AuroraBackground className="px-4">
        <div className="max-w-6xl mx-auto py-14 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6 text-center lg:text-left">
            {/* Faixa Post-it */}
            <div className="relative inline-block my-2">
              <div className="relative bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                {/* Detalhes dos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>
                
                {/* Texto destacado */}
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#9A6A00] relative z-10">
                  VOCÊ NÃO PRECISA MAIS PERDER HORAS
                </span>
              </div>
            </div>
            
            <SparklesText
              text="Pra ensinar com qualidade"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink leading-tight mt-2"
              colors={{
                first: "#FF6B2C",
                second: "#7A6AF5"
              }}
              sparklesCount={10}
            />
            
            <p className="text-lg text-body leading-relaxed max-w-xl mx-auto lg:mx-0">
              Olá, Professor(a)!<br />
              Agora você pode se despreocupar!<br />
              Chega de gastar tempo e energia elaborando atividades<br />
              Nós criamos <strong>um material completo para você usar durante todo o ano!</strong><br />
              São mais de 8.000 materiais, repletos de atividades envolventes e desafiadoras <strong>para diversas áreas</strong>
            </p>

            {/* Mini botões de disciplinas */}
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 max-w-xl mx-auto lg:mx-0 mt-6">
              {['Português', 'Matemática', 'Ciências', 'História', 'Geografia', 'Arte', 'Educação Física', 'Inglês'].map((disciplina, index) => (
                <button
                  key={disciplina}
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    btn.classList.add('scale-90');
                    setTimeout(() => btn.classList.remove('scale-90'), 150);
                  }}
                  className="bg-gradient-to-r from-[#FFE3A0] to-[#FFF3D6] hover:from-[#F59E0B] hover:to-[#FBBF24] border-2 border-[#F59E0B] text-[#9A6A00] hover:text-white font-semibold text-xs md:text-sm py-2 px-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 animate-fadeInUp"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {disciplina}
                </button>
              ))}
            </div>

            <style jsx>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fadeInUp {
                animation: fadeInUp 0.6s ease-out;
              }
            `}</style>
          </div>

          <div className="relative">
            <style>{`
              wistia-player[media-id='78docpnbgg']:not(:defined) {
                background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/78docpnbgg/swatch');
                display: block;
                filter: blur(5px);
                padding-top: 177.78%;
              }
            `}</style>
            <div className="bg-surface border border-border shadow-card rounded-2xl overflow-hidden">
              <wistia-player media-id="78docpnbgg" aspect="0.5625"></wistia-player>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              <SubscribeButton />
              <LoginButton onClick={onLoginClick} />
            </div>
          </div>
        </div>
        </div>
      </AuroraBackground>
    </section>
  );
};