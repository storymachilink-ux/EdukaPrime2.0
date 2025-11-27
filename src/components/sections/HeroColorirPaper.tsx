import React, { useEffect, useRef, useState } from 'react';
import { SubscribeButton } from '../ui/subscribe-button';

interface HeroProps {
  onLoginClick?: () => void;
}

export const HeroColorirPaper: React.FC<HeroProps> = ({ onLoginClick }) => {
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
    const embedScriptSrc = 'https://fast.wistia.com/embed/uvqwsom5q9.js';

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
    <section id="inicio" className="px-4 py-14 md:py-20 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Container laranja com o texto */}
        <div className="bg-[#FFE8D4] rounded-2xl p-8 md:p-12 mb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6 text-center lg:text-left">
              {/* Faixa Post-it - ROXO PARA PAPER */}
              <div className="relative inline-block my-2">
                <div className="relative bg-[#E8D5F2] border-2 border-[#8B5CF6] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                  {/* Detalhes dos cantos */}
                  <div className="absolute top-0 left-0 w-3 h-3 bg-[#8B5CF6] rounded-full transform -translate-x-1 -translate-y-1"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#8B5CF6] rounded-full transform translate-x-1 -translate-y-1"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#8B5CF6] rounded-full transform -translate-x-1 translate-y-1"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#8B5CF6] rounded-full transform translate-x-1 translate-y-1"></div>

                  {/* Texto destacado - ROXO */}
                  <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#6D28D9] relative z-10">
                    👻 Monte, aprenda e decore com o <span className="text-[#8B5CF6] font-extrabold">EdukaBoo!</span>
                  </span>
                </div>
              </div>

              {/* PAPEL - EDUKABOO DESCRIÇÃO */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl text-ink leading-tight mt-2 text-center lg:text-left">
                Um combo completo de <span className="text-[#8B5CF6] font-extrabold">Papercrafts temáticos e atividades recreativas</span>, com personagens icônicos do <span className="text-[#FF9D2A]" style={{WebkitTextStroke: '0.5px rgba(0,0,0,0.2)'}}>Halloween e curiosidades</span> divertidas sobre cada um. Perfeito para ensinar cultura pop, <span className="text-[#8B5CF6] font-extrabold">estimular a paciência é o foco</span> em desenvolver a <span className="text-[#8B5CF6] font-extrabold">confiança</span> das crianças, <span className="text-[#8B5CF6] font-extrabold">ao criarem algo com as próprias mãos</span>!
              </h2>

              {/* Texto com mais destaque */}
              <p className="text-lg md:text-xl lg:text-2xl text-ink leading-relaxed max-w-xl mx-auto text-center lg:text-left mt-4">
                Cada montagem vira uma nova descoberta, <span className="text-[#8B5CF6] font-extrabold">fácil de fazer</span>, mas com um toque especial de qualidade e <span className="text-[#8B5CF6] font-extrabold">imaginação que cria memórias pra vida toda</span>. ✂️
              </p>

              {/* PAPEL - Público Alvo */}
              <p className="text-lg text-body leading-relaxed max-w-xl mx-auto text-center lg:text-left">
                📚 Ideal para crianças de 4 a 12 anos — formato digital (PDF pronto para imprimir e montar).
              </p>
            </div>

            {/* Vídeo formato story ao lado do texto em desktop */}
            <div ref={videoContainerRef} className="relative w-full max-w-sm mx-auto lg:mx-0 space-y-4">
              <style>{`
                wistia-player[media-id='uvqwsom5q9']:not(:defined) {
                  background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/uvqwsom5q9/swatch');
                  display: block;
                  filter: blur(5px);
                  padding-top: 177.78%;
                }
              `}</style>
              <div className="relative w-full bg-white dark:bg-white border-2 border-[#8B5CF6] shadow-xl rounded-2xl overflow-hidden">
                {/* Aspect ratio story 9:16 (vertical) */}
                <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
                  <div className="absolute inset-0">
                    {shouldLoadVideo ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: '<wistia-player media-id="uvqwsom5q9" aspect="0.5625"></wistia-player>'
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
          </div>
        </div>
      </div>
    </section>
  );
};
