import React from 'react';
import BonusCard from './BonusCard';

interface BonusSectionProps {
  userPlan?: string;
  onUpsellClick?: () => void;
}

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  pdfUrl: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  ageRange: string;
  theme: string;
  isSpecial?: boolean;
}

/**
 * Seção de Bônus do EdukaBoo
 * Exibe conteúdo exclusivo e bônus especiais
 */
export default function BonusSection({ userPlan = 'completo', onUpsellClick = () => {} }: BonusSectionProps) {
  const handleAcquire = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  // Dados de exemplo dos bônus
  const bonusItems: Product[] = [
    {
      id: 'bonus-1',
      title: 'Turma Stranger Things',
      description: 'Personagens icônicos de Stranger Things em papercrafts exclusivos',
      image: '/paperlogin/stranger.png',
      pdfUrl: 'https://drive.google.com/drive/folders/1ONJ9yqCdGGyvmIjX1cL_rfZ1qP-2lfXo?usp=sharing',
      difficulty: 'médio',
      ageRange: '8-12 anos',
      theme: 'Série',
      isSpecial: true
    },
    {
      id: 'bonus-2',
      title: 'Turma Bob Esponja',
      description: 'Personagens divertidos de Bob Esponja em forma de papercrafts coloridos',
      image: '/paperlogin/bobesponja.png',
      pdfUrl: 'https://drive.google.com/drive/folders/1FjgGiFowpJ2tZPXbkVKIhhZpRZPun5fm?usp=sharing',
      difficulty: 'fácil',
      ageRange: '4-9 anos',
      theme: 'Desenho Animado'
    },
    {
      id: 'bonus-3',
      title: 'Turma Hora de Aventura',
      description: 'Aventureiros do mundo mágico de Hora de Aventura em papercrafts criativos',
      image: '/paperlogin/hora-aventura.png',
      pdfUrl: 'https://drive.google.com/drive/folders/1FjgGiFowpJ2tZPXbkVKIhhZpRZPun5fm?usp=sharing',
      difficulty: 'médio',
      ageRange: '6-11 anos',
      theme: 'Série Animada'
    },
    {
      id: 'bonus-4',
      title: 'Turma Disney',
      description: 'Personagens encantados do universo Disney em papercrafts mágicos',
      image: '/paperlogin/mickey.png',
      pdfUrl: 'https://drive.google.com/drive/folders/1FjgGiFowpJ2tZPXbkVKIhhZpRZPun5fm?usp=sharing',
      difficulty: 'fácil',
      ageRange: '4-10 anos',
      theme: 'Filmes'
    }
  ];

  return (
    <div>
      {/* Título e Descrição */}
      <div className="mb-12">
        <div className="relative inline-block mb-6">
          <div className="relative bg-orange-100 border-2 border-orange-500 rounded-2xl px-6 py-3 shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
            <div className="absolute top-0 left-0 w-3 h-3 bg-orange-500 rounded-full transform -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full transform translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-orange-500 rounded-full transform -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-orange-500 rounded-full transform translate-x-1 translate-y-1"></div>

            <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-900">
              🎁 Bônus Exclusivos do <span className="text-orange-700 font-extrabold">EdukaBoo!</span>
            </span>
          </div>
        </div>

        <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl">
          Acesse conteúdos <span className="font-semibold text-orange-600">exclusivos e especiais</span> que complementam sua experiência com papercrafts. Turmas temáticas, personagens favoritos e muito mais para <span className="font-semibold text-orange-600">enriquecer o aprendizado e a diversão!</span>
        </p>
      </div>

      {/* Grid de Bônus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {bonusItems.map((item) => (
          <BonusCard
            key={item.id}
            product={item}
            userPlan={userPlan}
            onAcquire={() => handleAcquire(item.pdfUrl)}
            onUpsellClick={onUpsellClick}
            isSpecial={item.isSpecial}
          />
        ))}
      </div>

      {/* Banner com link */}
      <div className="mt-12">
        <a href="https://www.ggcheckout.com/checkout/v2/hBUh7oMIyxUmWHEBM9Cm"
           target="_blank"
           rel="noopener noreferrer"
           className="block rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <img src="/2Banners-Area-Inicio.webp" alt="Banner EdukaBoo" className="w-full h-auto" />
        </a>
      </div>
    </div>
  );
}
