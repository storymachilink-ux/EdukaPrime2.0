import React from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Desbloqueie este conteúdo
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Para acessar esta atividade, você precisa adquirir um plano. Vá para a área de <strong>Planos</strong> no seu dashboard e escolha o upgrade que melhor se encaixa no seu curso!
        </p>

        <button
          onClick={handleRedirect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Ir para Planos
        </button>
      </div>
    </div>
  );
};