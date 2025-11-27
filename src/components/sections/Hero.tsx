import React, { useEffect, useRef, useState } from 'react';
import { SubscribeButton } from '../ui/subscribe-button';
import { LoginButton } from '../ui/login-button';
import { AuroraBackground } from '../ui/aurora-background';
import { SparklesText } from '../ui/sparkles-text';

interface HeroProps {
  onLoginClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLoginClick }) => {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Lazy load do vídeo usando Intersection Observer
  useEffect(() => {
    if (!videoContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            observer.disconnect(); // Parar de observar após carregar
          }
        });
      },
      {
        rootMargin: '200px', // Começar a carregar 200px antes de entrar na viewport
      }
    );

    observer.observe(videoContainerRef.current);

    return () => observer.disconnect();
  }, []);

  // Carregar scripts do Wistia apenas quando necessário
  useEffect(() => {
    if (!shouldLoadVideo) return;

    const playerScriptSrc = 'https://fast.wistia.com/player.js';
    const embedScriptSrc = 'https://fast.wistia.com/embed/78docpnbgg.js';

    // Verificar se o script do player já existe
    let playerScript = document.querySelector(`script[src="${playerScriptSrc}"]`) as HTMLScriptElement;
    if (!playerScript) {
      playerScript = document.createElement('script');
      playerScript.src = playerScriptSrc;
      playerScript.async = true;
      playerScript.defer = true;
      document.head.appendChild(playerScript);
    }

    // Verificar se o script do embed já existe
    let embedScript = document.querySelector(`script[src="${embedScriptSrc}"]`) as HTMLScriptElement;
    if (!embedScript) {
      embedScript = document.createElement('script');
      embedScript.src = embedScriptSrc;
      embedScript.async = true;
      embedScript.defer = true;
      embedScript.type = 'module';
      document.head.appendChild(embedScript);
    }
  }, [shouldLoadVideo]);

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
                  Ensinar com qualidade não precisa ser cansativo.
                </span>
              </div>
            </div>
            
            <SparklesText
              text="Economize horas de preparo com atividades prontas, bonitas e alinhadas à BNCC."
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink leading-tight mt-2"
              colors={{
                first: "#FF6B2C",
                second: "#7A6AF5"
              }}
              sparklesCount={6}
            />
            
            <p className="text-lg text-body leading-relaxed max-w-xl mx-auto lg:mx-0">
              Olá, professor(a)!<br />
              Finalmente você pode se despreocupar.<br />
              Chega de passar <strong>horas elaborando atividades</strong> e planejando cada detalhe sozinha.<br />
              Nós criamos um acervo completo pra facilitar seu dia, <strong>economizar seu tempo e transformar suas aulas</strong> em algo leve e inspirador.
            </p>

            {/* Mini botões de disciplinas */}
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 max-w-xl mx-auto lg:mx-0 mt-6">
              {['Português', 'Matemática', 'Ciências', 'História', 'Geografia', 'Arte', 'Educação Física', 'Inglês'].map((disciplina, index) => (
                <button
                  key={disciplina}
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

          {/* Vídeo formato story ao lado do texto em desktop */}
          <div ref={videoContainerRef} className="relative w-full max-w-sm mx-auto lg:mx-0 space-y-4">
            <style>{`
              wistia-player[media-id='78docpnbgg']:not(:defined) {
                background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/78docpnbgg/swatch');
                display: block;
                filter: blur(5px);
                padding-top: 177.78%;
              }
            `}</style>
            <div className="relative w-full bg-white dark:bg-white border-2 border-[#FFE3A0] shadow-xl rounded-2xl overflow-hidden">
              {/* Aspect ratio story 9:16 (vertical) */}
              <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
                <div className="absolute inset-0">
                  {shouldLoadVideo ? (
                    <wistia-player media-id="78docpnbgg" aspect="0.5625" className="w-full h-full"></wistia-player>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-gray-400 text-sm">Carregando vídeo...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão abaixo do vídeo */}
            <div className="flex justify-center">
              <SubscribeButton />
            </div>
          </div>
        </div>
        </div>
      </AuroraBackground>
    </section>
  );
};