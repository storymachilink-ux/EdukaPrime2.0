import React from 'react';

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  ageRange: string;
  theme: string;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  userPlan?: string;
  onDetailsClick?: () => void;
  onUpsellClick?: () => void;
}

export default function ProductCard({ product, onClick, userPlan = 'completo', onDetailsClick, onUpsellClick }: ProductCardProps) {
  const isBasicPlan = userPlan === 'basico';
  const isFreeProduct = product.id === '1'; // Turma EdukaBoo é liberada para plano básico
  const canAccess = !isBasicPlan || isFreeProduct;

  const difficultyColor = {
    fácil: 'bg-green-100 text-green-700 border-green-300',
    médio: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    difícil: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div
      onClick={() => {
        if (canAccess && onDetailsClick) {
          onDetailsClick();
        }
      }}
      className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 ${canAccess && 'cursor-pointer'} transform hover:-translate-y-2 group`}
    >
      {/* Imagem 1:1 (Quadrada) */}
      <div className="relative aspect-square bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center p-3">
        <div className="relative overflow-hidden rounded-lg border-3 border-purple-300 w-full h-full">
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
          <span className="text-xs md:text-sm px-3 py-1 bg-purple-100 text-purple-700 border border-purple-300 rounded-full font-semibold">
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
        {isBasicPlan && !isFreeProduct ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpsellClick?.();
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200"
          >
            Quero Acesso Total
          </button>
        ) : isBasicPlan && isFreeProduct ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetailsClick?.();
            }}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200"
          >
            Ver Detalhes
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetailsClick?.();
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-2 px-4 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-200"
          >
            Ver Detalhes
          </button>
        )}
      </div>
    </div>
  );
}
