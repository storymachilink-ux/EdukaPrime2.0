import React, { useEffect, useRef, useState } from 'react';

interface HeroProps {
  onLoginClick?: () => void;
}

export const HeroColorirNatal: React.FC<HeroProps> = ({ onLoginClick }) => {
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

  // Carregar scripts do VTurb SmartPlayer apenas quando necessário
  useEffect(() => {
    if (!shouldLoadVideo) return;

    const playerScriptSrc = 'https://scripts.converteai.net/724c5a0d-b090-4c32-902f-782b3ead311a/players/691cb6488e05537f6925540e/v4/player.js';

    // Verificar se o script do player já existe
    let playerScript = document.querySelector(`script[src="${playerScriptSrc}"]`) as HTMLScriptElement;
    if (!playerScript) {
      playerScript = document.createElement('script');
      playerScript.src = playerScriptSrc;
      playerScript.async = true;
      playerScript.defer = true;
      document.head.appendChild(playerScript);
    }

  }, [shouldLoadVideo]);

  return (
    <section id="inicio" className="px-4 py-14 md:py-20 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Container laranja com o texto */}
        <div className="bg-[#FFE8D4] rounded-2xl p-8 md:p-12 mb-12">
          <div className="space-y-6 text-center lg:text-left">
            {/* Imagem Avaliações */}
            <div className="max-w-[150px] mx-auto mb-6">
              <img
                src="/Natal/avaliacoes.webp"
                alt="Avaliações"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* Faixa Post-it - VERMELHO PARA NATAL */}
            <div className="relative inline-block my-2">
              <div className="relative bg-[#FFE5E5] border-2 border-[#db143c] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                {/* Detalhes dos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#db143c] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#db143c] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#db143c] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#db143c] rounded-full transform translate-x-1 translate-y-1"></div>

                {/* Texto destacado - VERMELHO */}
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#991B1B] relative z-10 text-justify">
                  Monte, aprenda e decore com nossa <span className="text-[#db143c] font-extrabold">coleção de Natal</span> 🎅🏻
                </span>
              </div>
            </div>

            {/* Vídeo VTurb SmartPlayer */}
            <div ref={videoContainerRef} className="relative w-full max-w-sm mx-auto mt-6 flex justify-center">
              <div className="relative w-full bg-white dark:bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
                  <div className="absolute inset-0">
                    {shouldLoadVideo ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: '<vturb-smartplayer id="vid-691cb6488e05537f6925540e" style="display: block; margin: 0 auto; width: 100%; max-width: 400px;"></vturb-smartplayer>'
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


            {/* NATAL - Público Alvo */}
            <p className="text-lg text-body leading-relaxed max-w-xl mx-auto text-justify">
              📚 Para crianças de 4 a 12 anos — material digital pronto para imprimir em casa e transformar o Natal em criatividade pura ✨
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
