import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TimerAccessGate from '../components/ui/timer-access';

/**
 * Landing Page Upuniverso - Página de upsell
 * Sem cabeçalho e rodapé - apenas logo, texto, vídeo e botões
 */
export default function Upuniverso() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [showDownsellModal, setShowDownsellModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos em segundos
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

  // Carregar scripts do Wistia apenas quando necessário
  useEffect(() => {
    if (!shouldLoadVideo) return;

    const playerScriptSrc = 'https://fast.wistia.com/player.js';
    const embedScriptSrc = 'https://fast.wistia.com/embed/c0guqarmjm.js';

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

  // Tocar som ao abrir o modal
  useEffect(() => {
    if (showDownsellModal) {
      const audio = new Audio('/sounds/click.mp3');
      audio.play().catch((err) => console.log('Erro ao tocar som:', err));
    }
  }, [showDownsellModal]);

  // Countdown do modal
  useEffect(() => {
    if (!showDownsellModal) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowDownsellModal(false);
          return 900;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showDownsellModal]);

  // Formatar tempo para MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBuyNow = () => {
    window.open('https://checkout.edukaprime.com.br/VCCL1O8SCGA4', '_blank');
  };

  const handleDecline = () => {
    setShowDownsellModal(true);
  };

  const handleCloseModal = () => {
    setShowDownsellModal(false);
  };

  const handleActivateDiscount = () => {
    window.open('https://checkout.edukaprime.com.br/VCCL1O8SCGFN', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fa3f6b] overflow-hidden flex flex-col items-center justify-start pt-8">
      <style>{`
        @keyframes softBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .bounce-soft {
          animation: softBounce 2s ease-in-out infinite;
        }
      `}</style>
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/logohorizontal.webp"
          alt="Logo Edukaprime"
          className="h-16 md:h-20 object-contain"
        />
      </div>

      {/* Container principal com card */}
      <div className="w-full max-w-2xl px-4">
        {/* Faixa de texto com estilo post-it */}
        <div className="relative inline-block w-full mb-8 flex justify-center">
          <div className="relative bg-[#FFE5E5] border-2 border-[#fa3f6b] rounded-2xl px-6 py-4 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
            {/* Detalhes dos cantos */}
            <div className="absolute top-0 left-0 w-3 h-3 bg-[#fa3f6b] rounded-full transform -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-[#fa3f6b] rounded-full transform translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#fa3f6b] rounded-full transform -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#fa3f6b] rounded-full transform translate-x-1 translate-y-1"></div>

            {/* Texto destacado */}
            <p className="text-lg md:text-xl lg:text-2xl relative z-10 text-center leading-relaxed">
              <span className="text-[#001f3f]">Seja Bem-vindo, preparamos algo </span><strong className="text-[#fa3f6b]">exclusivo para você</strong>
            </p>
          </div>
        </div>

        {/* Texto discreto abaixo do post-it */}
        <p className="text-center text-sm md:text-base text-[#fff89e] mb-8 px-4">
          <strong className="text-[#fff89e]">Clique em Start</strong> e aguarde alguns segundos seu acesso personalizado está sendo ativado.
        </p>

        {/* Timer Access Gate Component */}
        <div className="mb-8">
          <TimerAccessGate />
        </div>

        {/* Card com vídeo - cor #fff89e */}
        <div id="video-container" className="bg-[#fff89e] rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
          {/* Vídeo Wistia */}
          <div ref={videoContainerRef} className="relative w-full flex justify-center">
            <style>{`
              wistia-player[media-id='c0guqarmjm']:not(:defined) {
                background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/c0guqarmjm/swatch');
                display: block;
                filter: blur(5px);
                padding-top: 177.78%;
              }
            `}</style>
            <div className="relative w-full bg-white shadow-lg rounded-xl overflow-hidden">
              {/* Aspect ratio story 9:16 (vertical) */}
              <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
                <div className="absolute inset-0">
                  {shouldLoadVideo ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: '<wistia-player media-id="c0guqarmjm" aspect="0.5625" style="width: 100%; height: 100%;"></wistia-player>'
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

          {/* Botões */}
          <div className="flex flex-col gap-4 mt-8">
            {/* Mini CTA Verde */}
            <p className="text-center text-green-600 font-semibold text-sm">
              Adquira o combo Universo Criativo com um valor especial
            </p>

            {/* Preço anterior com risco */}
            <p className="text-center text-gray-600 text-sm">
              De <span className="line-through font-bold">R$ 115,00</span>
            </p>

            <button
              onClick={handleBuyNow}
              className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg border-2 border-green-300 bounce-soft"
            >
              Adquirir por R$ 39,99
            </button>
            <button
              onClick={handleDecline}
              className="w-full bg-white text-[#fa3f6b] font-bold py-3 px-6 rounded-lg border-2 border-[#fa3f6b] hover:bg-gray-50 transition-colors duration-300 text-lg"
            >
              Não quero a oferta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Downsell - Novo Design */}
      {showDownsellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <style>{`
            @keyframes pulse-button {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            @keyframes shimmer {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            .animate-pulse-button {
              animation: pulse-button 2s ease-in-out 1s;
            }
            .animate-shimmer {
              animation: shimmer 2s ease-in-out infinite;
            }
          `}</style>
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl my-auto">
            {/* Botão fechar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
            >
              ✕
            </button>

            {/* Conteúdo do Modal */}
            <div className="p-6 text-center space-y-5">
              {/* Topo - Estrela em Círculo */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-5xl animate-shimmer">
                  ⭐
                </div>
              </div>

              {/* Título Principal */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  🌟 Espera rapidinho…
                </h2>
                <p className="text-lg font-semibold text-gray-900">
                  presente especial pra você!
                </p>
              </div>

              {/* Subtítulo */}
              <p className="text-sm text-gray-500">
                Oportunidade única para adquirir o <span className="font-bold" style={{ color: '#001f3f' }}>Combo Universo Criativo</span> <span style={{ color: '#22c55e' }}>+200 atividades papercraft</span> para o ano inteiro
              </p>

              {/* Box da Oferta - Amarelo Pastel */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 space-y-4">
                {/* Timer */}
                <div className="text-sm text-gray-600 font-medium">
                  🕒 Seu desconto expira em <span className="text-lg font-bold text-red-500">{formatTime(timeLeft)}</span>
                </div>

                {/* Mini Badges - 3 itens */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-lg mb-1">🧩</div>
                    <div className="font-semibold text-gray-700">Habilidades motoras</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-lg mb-1">🎯</div>
                    <div className="font-semibold text-gray-700">Foco e disciplina</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-lg mb-1">🎭</div>
                    <div className="font-semibold text-gray-700">Imaginação ativa</div>
                  </div>
                </div>
              </div>

              {/* Box de Preço - Amarelo Ouro */}
              <div className="bg-amber-100 rounded-xl p-4 space-y-1">
                <div className="text-3xl font-black" style={{ color: '#FF3030' }}>
                  78% OFF
                </div>
                <div className="text-xl font-bold text-gray-900">
                  Hoje R$ 24,99
                </div>
                <div className="text-xs text-gray-600">
                  De R$ 115 → por R$ 24,99 hoje
                </div>
              </div>

              {/* Botão Principal CTA */}
              <button
                onClick={handleActivateDiscount}
                className="w-full py-4 px-6 rounded-xl text-white font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse-button"
                style={{ backgroundColor: '#05b44e' }}
              >
                💛 Comprar Combo Universo Criativo
              </button>

              {/* Subtexto de Confiança */}
              <div className="text-xs text-gray-600 flex justify-center gap-3">
                <span>🔒 Pagamento seguro</span>
                <span>⚡ Acesso imediato</span>
                <span>♾️ Sem mensalidade</span>
              </div>

              {/* Mini Depoimento */}
              <div className="bg-purple-50 rounded-lg p-4 border-l-4" style={{ borderColor: '#5034ff' }}>
                <p className="text-xs text-gray-700 italic mb-3">
                  "Todo dia monto um com minha filha, ela ama e sempre fica horas concetrada acho lindo ver eles montadinhos depois"
                </p>
                <div className="flex items-center gap-2">
                  <img
                    src="/mariana.webp"
                    alt="Mariana"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="text-xs font-semibold text-gray-700">
                    ⭐⭐⭐⭐⭐<br />Mariana Klein
                  </div>
                </div>
              </div>

              {/* Botão Secundário */}
              <button
                onClick={handleCloseModal}
                className="w-full py-2 px-4 rounded-lg text-gray-600 font-medium text-sm transition-colors hover:bg-gray-100"
              >
                ❌ Ainda não, prefiro perder o desconto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
