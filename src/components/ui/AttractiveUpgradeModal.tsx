import React from 'react';
import { X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AttractiveUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttractiveUpgradeModal: React.FC<AttractiveUpgradeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRedirect = () => {
    onClose();
    navigate('/planos');
  };

  return (
    <>
      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-scale-in relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Ícone em círculo */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-[#0F2741] mb-2">
              Desbloqueie este conteúdo
            </h2>

            {/* Descrição */}
            <p className="text-gray-600 text-sm leading-relaxed">
              Para acessar esta atividade, você precisa adquirir um plano. Vá para a área de <strong>Planos</strong> no seu dashboard e escolha o upgrade que melhor se encaixa no seu curso!
            </p>
          </div>

          {/* Botão primário */}
          <button
            onClick={handleRedirect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 mb-3"
          >
            Ir para Planos
          </button>

          {/* Botão secundário */}
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
};