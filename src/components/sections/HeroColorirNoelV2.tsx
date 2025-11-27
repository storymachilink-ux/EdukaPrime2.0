import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Gift } from 'lucide-react';
import { AuroraHero } from '../ui/21st-text-effect';

interface HeroProps {
  onLoginClick?: () => void;
}

export const HeroColorirNoelV2: React.FC<HeroProps> = ({ onLoginClick }) => {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [priceFloating, setPriceFloating] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Lazy load do vídeo usando Intersection Observer
  useEffect(() => {
    if (!videoContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px',
      }
    );

    observer.observe(videoContainerRef.current);

    return () => observer.disconnect();
  }, []);

  // Ativar efeito flutuante do preço após 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setPriceFloating(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Carregar scripts do Wistia apenas quando necessário
  useEffect(() => {
    if (!shouldLoadVideo) return;

    const playerScriptSrc = 'https://fast.wistia.com/player.js';
    const embedScriptSrc = 'https://fast.wistia.com/embed/2g5xosa8l9.js';

    let playerScript = document.querySelector(`script[src="${playerScriptSrc}"]`) as HTMLScriptElement;
    if (!playerScript) {
      playerScript = document.createElement('script');
      playerScript.src = playerScriptSrc;
      playerScript.async = true;
      playerScript.defer = true;
      document.head.appendChild(playerScript);
    }

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
    <section className="pt-20 pb-12 md:pb-16 px-4 bg-[#0B2B20]">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 1) HERO / PROMESSA PRINCIPAL */}
        <div className="space-y-4 text-center">
          {/* Imagem Avaliações */}
          <div className="max-w-[150px] mx-auto mb-6">
            <img
              src="/Natal/avaliacoes.webp"
              alt="Avaliações"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          <style>{`
            @keyframes float-gentle-noel {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-10px);
              }
            }
            .float-button-noel {
              animation: float-gentle-noel 3s ease-in-out infinite;
            }
            @keyframes price-float-pulse {
              0%, 100% {
                transform: translateY(0px) scale(1);
                opacity: 1;
              }
              50% {
                transform: translateY(-12px) scale(1.05);
                opacity: 0.95;
              }
            }
            .price-floating-active {
              animation: price-float-pulse 2.5s ease-in-out infinite;
              transition: all 0.3s ease-out;
            }
          `}</style>

          <div className="mb-4 text-center">
            <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent">
              Mais de 60 personagens
            </span>
            <span className="text-2xl md:text-3xl text-white/85 font-semibold">
              {' '}e cenários de Natal para recortar e montar
            </span>
          </div>

          <p className="text-base md:text-lg text-white/85 font-semibold leading-relaxed">
            <span className="text-[#f8c630] font-bold">🎅✨</span><br />
            Papercrafts natalinos para crianças de 4 a 12 anos <span className="text-[#f8c630]">📦✂️</span>
          </p>

          <p className="text-base md:text-lg text-white/85 leading-relaxed">
            Crie memórias afetivas, longe das telas, com passo a passo fácil e artes exclusivas.<br />
            <span className={`text-[#f8c630] font-bold inline-block ${priceFloating ? 'price-floating-active' : ''}`}>
              Por apenas R$ 12,99
            </span>
          </p>
        </div>

        {/* Vídeo Wistia */}
        <div ref={videoContainerRef} className="relative w-full max-w-sm mx-auto flex justify-center">
          <style>{`
            wistia-player[media-id='2g5xosa8l9']:not(:defined) {
              background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/2g5xosa8l9/swatch');
              display: block;
              filter: blur(5px);
              padding-top: 177.78%;
            }
          `}</style>
          <div className="relative w-full bg-white dark:bg-white shadow-lg rounded-xl overflow-hidden border border-[#EEE]">
            {/* Aspect ratio story 9:16 (vertical) */}
            <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
              <div className="absolute inset-0">
                {shouldLoadVideo ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: '<wistia-player media-id="2g5xosa8l9" aspect="0.5625"></wistia-player>'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Carregando vídeo...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botão Quero Agora */}
        <div className="flex justify-center pt-8">
          <style>{`
            @keyframes gentle-bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-8px);
              }
            }
            .animate-gentle-bounce {
              animation: gentle-bounce 2s ease-in-out infinite;
            }
          `}</style>
          <button
            onClick={() => document.getElementById('bonus-exclusivos')?.scrollIntoView({ behavior: 'smooth' })}
            className="animate-gentle-bounce bg-white text-[#db143c] font-black text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
          >
            <Gift className="w-5 h-5" />
            QUERO AGORA!
          </button>
        </div>

        {/* Seta para baixo */}
        <div className="flex justify-center pt-8">
          <ChevronDown className="w-8 h-8 text-[#f8c630] animate-bounce" />
        </div>
      </div>
    </section>
  );
};
