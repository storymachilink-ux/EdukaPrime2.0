import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    const embedScriptSrc = 'https://fast.wistia.com/embed/0cm8grrgcf.js';

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

  // Countdown do modal com inicialização a 10 minutos (600 segundos)
  useEffect(() => {
    if (!showDownsellModal) return;

    // Reinicia o timer a cada vez que o modal abre
    if (timeLeft === 900) {
      setTimeLeft(600); // 10 minutos em segundos
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowDownsellModal(false);
          return 600;
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

  const handleRejectOffer = () => {
    navigate('/login');
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
        {/* BLOCO DE ORIENTAÇÃO ANTES DO UPSELL */}
        <div className="max-w-2xl mx-auto mb-6 px-4">
          <div className="bg-yellow-100 rounded-3xl p-5 md:p-5 shadow-lg border-2 border-yellow-300">
            {/* Label */}
            <span className="inline-block text-xs font-bold uppercase tracking-wider bg-white px-3 py-1 rounded-full mb-2 text-pink-500">
              Antes de continuar…
            </span>

            {/* Título */}
            <h2 className="text-lg md:text-xl font-bold text-blue-900 mb-2">
              Parabéns por adquirir um produto <span className="text-yellow-600">EdukaPrime!</span>
            </h2>

            {/* Texto principal */}
            <p className="text-sm md:text-base text-gray-700 mb-3">
              Preparamos uma oferta exclusiva para você. Mas fique tranquilo:
              se não tiver interesse, é só recusar e depois acessar seu produto normalmente.
            </p>

            {/* Seção de Passos */}
            <div className="mb-3">
              <h3 className="text-sm font-bold text-blue-900 mb-2">🔑 Como acessar seu produto</h3>
              <ol className="text-xs md:text-sm text-gray-700 space-y-1 ml-4">
                <li>
                  Após <strong>aceitar ou recusar a oferta</strong>, você será direcionado para
                  nossa <strong>área de login</strong>.
                </li>
                <li>
                  <strong>Crie sua conta com o mesmo e-mail da compra.</strong><br />
                  Se você usou um <strong>Gmail</strong>, clique em
                  <strong> "Continuar com Google"</strong>.
                </li>
                <li>
                  Pronto! Seu produto será <strong>liberado automaticamente</strong>
                  na sua área de membros.
                </li>
              </ol>
            </div>

            {/* Nota importante */}
            <p className="text-xs md:text-sm text-gray-700">
              💛 Importante: recusar a oferta <strong>não bloqueia</strong> seu acesso.
              Você continua com seu produto garantido.
            </p>
          </div>
        </div>

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


        {/* Card com vídeo - cor #fff89e */}
        <div id="video-container" className="bg-[#fff89e] rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
          {/* Vídeo Wistia */}
          <div ref={videoContainerRef} className="relative w-full flex justify-center">
            <style>{`
              wistia-player[media-id='0cm8grrgcf']:not(:defined) {
                background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/0cm8grrgcf/swatch');
                display: block;
                filter: blur(5px);
                padding-top: 133.33%;
              }
            `}</style>
            <div className="relative w-full bg-white shadow-lg rounded-xl overflow-hidden">
              {/* Aspect ratio 0.75 (vertical) */}
              <div className="relative w-full" style={{ paddingTop: '133.33%' }}>
                <div className="absolute inset-0">
                  {shouldLoadVideo ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: '<wistia-player media-id="0cm8grrgcf" aspect="0.75" style="width: 100%; height: 100%;"></wistia-player>'
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

        {/* Botão de Suporte WhatsApp - Rodapé */}
        <div className="w-full mt-6 text-center">
          <a
            href="https://api.whatsapp.com/send/?phone=%2B556793091209&text=O%E2%81%AC%E2%81%AD%E2%81%AC%E2%81%AD%E2%81%AC%E2%81%AD%E2%81%AC%E2%81%ADiee+tenho+d%C3%BAvidas+sobre+a+plataforma+Eduka+Prime+&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-[#25D366] to-[#20BA5A] hover:from-[#20BA5A] hover:to-[#1ea952] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
          >
            <img src="/whats.webp" alt="WhatsApp" className="h-6 w-6" />
            Suporte WhatsApp
          </a>
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
              {/* Topo - Timer Circular de 10 Minutos */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  {/* Círculo de Fundo */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Círculo de Background */}
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    {/* Círculo Animado (Progress) */}
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="8"
                      strokeDasharray={`${Math.PI * 2 * 54}`}
                      strokeDashoffset={`${Math.PI * 2 * 54 * (1 - timeLeft / 600)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>

                  {/* Texto do Timer no Centro */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">minutos</div>
                  </div>
                </div>
              </div>

              {/* Subtítulo */}
              <p className="text-sm text-gray-500">
                Oportunidade única para adquirir o <span className="font-bold" style={{ color: '#001f3f' }}>Combo Universo Criativo</span> <span style={{ color: '#22c55e' }}>+200 atividades papercraft</span> para o ano inteiro
              </p>

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

              {/* Aviso - Única Oportunidade */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600 font-semibold text-center">
                  ⚠️ Esse produto não pode ser adquirido depois, única oportunidade de comprar
                </p>
              </div>

              {/* Botão Rejeitar Oferta - Grande e Destacado */}
              <button
                onClick={handleRejectOffer}
                className="w-full py-4 px-6 rounded-xl text-gray-700 font-bold text-base transition-colors duration-300 bg-gray-200 hover:bg-gray-300 border-2 border-gray-400"
              >
                ❌ Rejeitar OFERTA, quero acessar meu produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
