import React, { useEffect, useState } from 'react';

interface OfferPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAcquire: () => void;
}

/**
 * Pop-up de Oferta com Vídeo Wistia
 * Exibe oferta especial com vídeo promocional
 */
export default function OfferPopup({ isOpen, onClose, onAcquire }: OfferPopupProps) {
  const [showDiscountAlert, setShowDiscountAlert] = useState(false);
  useEffect(() => {
    if (isOpen) {
      // Carregar scripts do Wistia quando o popup abre
      const script1 = document.createElement('script');
      script1.src = 'https://fast.wistia.com/player.js';
      script1.async = true;
      document.body.appendChild(script1);

      const script2 = document.createElement('script');
      script2.src = 'https://fast.wistia.com/embed/78docpnbgg.js';
      script2.async = true;
      script2.type = 'module';
      document.body.appendChild(script2);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ pointerEvents: 'auto', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full sm:w-80 max-h-[calc(100vh-40px)] sm:max-h-[calc(100vh-120px)] relative flex flex-col">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Conteúdo Superior - Oferta (antes do vídeo) */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex-shrink-0">
          {/* Oferta */}
          <div className="text-center">
            <p className="text-green-600 font-bold text-xl sm:text-2xl">
              Por Apenas R$ 44,99
            </p>
          </div>
        </div>

        {/* Vídeo Wistia */}
        <div className="w-full flex-1 flex items-center justify-center overflow-hidden px-2 py-2 bg-white min-h-0">
          <style>{`
            wistia-player[media-id='78docpnbgg']:not(:defined) {
              background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/78docpnbgg/swatch');
              display: block;
              filter: blur(5px);
            }
            wistia-player {
              width: 100% !important;
              height: 100% !important;
              max-width: 220px !important;
              max-height: 400px !important;
            }
            @media (min-width: 640px) {
              wistia-player {
                max-width: 280px !important;
                max-height: 500px !important;
              }
            }
          `}</style>
          {/* @ts-ignore */}
          <wistia-player media-id="78docpnbgg" aspect="0.5625" style={{ width: 'auto', height: 'auto', maxWidth: '220px', maxHeight: '400px' }}></wistia-player>
        </div>

        {/* Botões - Abaixo do Vídeo */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 space-y-2 flex-shrink-0">
          <button
            onClick={() => window.open('https://checkout.edukaprime.com.br/VCCL1O8SCCGP', '_blank')}
            className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg text-xs sm:text-base"
          >
            Quero Acesso a Plataforma
          </button>
          <button
            onClick={() => setShowDiscountAlert(true)}
            className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-colors duration-200 text-xs sm:text-base"
          >
            Não quero
          </button>
        </div>

        {/* Alert de Desconto */}
        {showDiscountAlert && (
          (() => {
            // Tocar som ao abrir o alerta
            const audio = new Audio('/sounds/click.mp3');
            audio.play().catch(() => console.log('Som não disponível'));
            return (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full">
              <button
                onClick={() => setShowDiscountAlert(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>

              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold mb-4">
                  🔥 SUPER DESCONTO para novos membros
                </p>
                <div className="space-y-2 mb-6">
                  <p className="text-red-600 font-bold text-lg line-through">
                    de R$ 44,99
                  </p>
                  <p className="text-green-600 font-bold text-2xl sm:text-3xl">
                    você vai receber acesso por R$ 17,99
                  </p>
                </div>
              </div>

              <button
                onClick={() => window.open('https://checkout.edukaprime.com.br/VCCL1O8SCCGM', '_blank')}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg mb-3"
              >
                Aproveitar Oferta
              </button>
              <button
                onClick={() => setShowDiscountAlert(false)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
              >
                Fechar
              </button>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
