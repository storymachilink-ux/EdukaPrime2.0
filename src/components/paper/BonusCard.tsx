import React from 'react';

interface BonusProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  pdfUrl: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  ageRange: string;
  theme: string;
}

interface BonusCardProps {
  product: BonusProduct;
  onAcquire: () => void;
  userPlan?: string;
  onUpsellClick?: () => void;
  isSpecial?: boolean;
}

export default function BonusCard({ product, onAcquire, userPlan = 'completo', onUpsellClick, isSpecial = false }: BonusCardProps) {
  const isBasicPlan = userPlan === 'basico';
  const isNatalBasicPlan = userPlan === 'natal-basico';
  const isNatalCompletoPlan = userPlan === 'natal-completo';

  // Produto Stranger Things (bonus-1) - Bloqueado para Natal
  const isStrangerThingsProduct = product.id === 'bonus-1';

  // Verificar acesso ao produto especial
  let hasSpecialAccess = true;
  if ((isNatalBasicPlan || isNatalCompletoPlan) && isStrangerThingsProduct) {
    hasSpecialAccess = false; // Stranger Things bloqueado para Natal
  }

  const difficultyColor = {
    fácil: 'bg-green-100 text-green-700 border-green-300',
    médio: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    difícil: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
      {/* Imagem 1:1 (Quadrada) */}
      <div className="relative aspect-square bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center p-3">
        <div className="relative overflow-hidden rounded-lg border-3 border-orange-300 w-full h-full">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 md:p-5">
        {/* Tema e Dificuldade */}
        <div className="flex gap-2 mb-3">
          <span className="text-xs md:text-sm px-3 py-1 bg-orange-100 text-orange-700 border border-orange-300 rounded-full font-semibold">
            {product.theme}
          </span>
          <span className={`text-xs md:text-sm px-3 py-1 border rounded-full font-semibold capitalize ${difficultyColor[product.difficulty]}`}>
            {product.difficulty}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Faixa Etária */}
        <div className="text-sm text-gray-700 font-medium mb-4 flex items-center gap-2">
          <span>👶</span>
          {product.ageRange}
        </div>

        {/* Botão */}
        {isBasicPlan ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpsellClick?.();
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200"
          >
            Quero Acesso Total
          </button>
        ) : isSpecial ? (
          hasSpecialAccess ? (
            <a
              href={product.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200 inline-block text-center"
            >
              Acessar Drive
            </a>
          ) : (
            <a
              href="https://www.ggcheckout.com/checkout/v2/VjFSoOx4y3pkyLJVproe"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-orange-600 to-yellow-500 text-white font-bold py-2 px-4 rounded-xl hover:from-orange-700 hover:to-yellow-600 transition-all duration-200 inline-block text-center"
            >
              Adquirir Material
            </a>
          )
        ) : (
          <a
            href="https://www.ggcheckout.com/checkout/v2/VjFSoOx4y3pkyLJVproe"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-orange-600 to-yellow-500 text-white font-bold py-2 px-4 rounded-xl hover:from-orange-700 hover:to-yellow-600 transition-all duration-200 inline-block text-center"
          >
            Adquirir Material
          </a>
        )}
      </div>
    </div>
  );
}
