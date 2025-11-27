import { X, Lock } from 'lucide-react';
import { Plan } from '../../lib/planService';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  availablePlans: Plan[];
}

export function AccessDeniedModal({
  isOpen,
  onClose,
  itemTitle,
  availablePlans
}: AccessDeniedModalProps) {
  if (!isOpen || availablePlans.length === 0) return null;

  // Ordenar planos por preço (mais barato primeiro)
  const sortedPlans = [...availablePlans].sort((a, b) => {
    if (a.price === 0) return 1;
    if (b.price === 0) return -1;
    return a.price - b.price;
  });

  // Se houver múltiplos planos, mostrar apenas os 3 mais baratos
  const plansToShow = sortedPlans.slice(0, 3);

  // Determinar layout: 1 botão vs múltiplos botões
  const isSinglePlan = availablePlans.length === 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6" />
            <h2 className="text-xl font-bold">Acesso Restrito</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {/* Imagem do Plano */}
          {plansToShow[0]?.modal_image_url && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={plansToShow[0].modal_image_url}
                alt="Acesso Restrito"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Título e Mensagem */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{itemTitle}</h3>
          <p className="text-gray-600 mb-6">
            {plansToShow[0]?.modal_text ||
              'Este conteúdo está disponível apenas para membros de planos pagos. Faça upgrade para ter acesso completo.'}
          </p>

          {/* Mostrar Planos Disponíveis */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Disponível em:
            </p>
            <div className="space-y-2">
              {plansToShow.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {plan.icon} {plan.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      R$ {plan.price.toFixed(2)} /{' '}
                      {plan.payment_type === 'mensal' ? 'mês' : 'único'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          {isSinglePlan ? (
            // Layout: 1 Botão
            <div className="space-y-2">
              <a
                href={plansToShow[0].checkout_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all text-center block"
              >
                {plansToShow[0].modal_button_text || 'Obter Acesso'}
              </a>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Não agora
              </button>
            </div>
          ) : (
            // Layout: 3 Botões (um por plano)
            <div className="grid grid-cols-1 gap-2">
              {plansToShow.map((plan) => (
                <a
                  key={plan.id}
                  href={plan.checkout_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all text-center block"
                >
                  {plan.modal_button_text || `Obter ${plan.name}`}
                </a>
              ))}
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Fechar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t text-center text-xs text-gray-600">
          Precisa de ajuda? <a href="/suporte" className="text-blue-600 font-semibold hover:underline">Contate o suporte</a>
        </div>
      </div>
    </div>
  );
}
