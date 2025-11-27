import React from 'react';

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackPopup({ isOpen, onClose }: FeedbackPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 z-10"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="p-4 sm:p-5 md:p-6 text-center">
            {/* Image */}
            <div className="mb-4 flex justify-center">
              <img
                src="/paperlogin/compartilha.webp"
                alt="Compartilha"
                className="h-32 sm:h-40 md:h-48 w-auto rounded-2xl"
                style={{ border: '3px solid rgb(236, 72, 153)' }}
              />
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-4 font-semibold">
              Quer acompanhar novidades, receber materiais extras e compartilhar as criações do seu pequeno? 💛✂️
            </p>

            {/* Main List */}
            <div className="mb-4 text-left bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-3 space-y-1">
              <p className="text-xs md:text-sm text-gray-700">
                <span className="font-bold">• Mostrar suas montagens</span> ✨
              </p>
              <p className="text-xs md:text-sm text-gray-700">
                <span className="font-bold">• Ver ideias de outras famílias e professores</span> 🎄
              </p>
              <p className="text-xs md:text-sm text-gray-700">
                <span className="font-bold">• Pedir novos papercrafts e atividades</span> 🧸
              </p>
              <p className="text-xs md:text-sm text-gray-700">
                <span className="font-bold">• Receber conteúdos e materiais auxiliares</span> 📎
              </p>
              <p className="text-xs md:text-sm text-gray-700">
                <span className="font-bold">• Ficar por dentro das coleções novas</span> 🎁
              </p>
            </div>

            {/* CTA Text */}
            <p className="text-xs sm:text-sm md:text-base text-gray-800 font-semibold mb-3">
              Vem fazer parte da nossa comunidade criativa! 💬✨
            </p>

            {/* Button */}
            <a
              href="https://chat.whatsapp.com/CbTZePmg2Hc4h9IaenobpC"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 sm:py-2.5 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-200 inline-block text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              👉 Entre no nosso grupo exclusivo no WhatsApp!
            </a>

            {/* Footer text */}
            <p className="text-xs text-gray-500 mt-4">
              Clique fora ou no X para fechar
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
