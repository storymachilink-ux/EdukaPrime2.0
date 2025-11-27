import React, { useState } from 'react';
import OfferPopup from './OfferPopup';
import OfferPopup2 from './OfferPopup2';

interface InitioSectionProps {
  userPlan?: string;
  onNavigateToPapers?: () => void;
  onNavigateToBonus?: () => void;
  onNavigateToVideos?: () => void;
}

/**
 * Seção de Início do EdukaBoo
 * Página de boas-vindas com mensagem principal e descrição
 */
export default function InitioSection({
  userPlan = 'completo',
  onNavigateToPapers,
  onNavigateToBonus,
  onNavigateToVideos
}: InitioSectionProps) {
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [showOfferPopup2, setShowOfferPopup2] = useState(false);

  const handleAcquire = () => {
    // Redirecionar para checkout
    window.open('https://www.ggcheckout.com/checkout/v2/hBUh7oMIyxUmWHEBM9Cm', '_blank');
    setShowOfferPopup(false);
  };

  const handleAcquire2 = () => {
    // Redirecionar para checkout
    window.open('https://www.ggcheckout.com/checkout/v2/hBUh7oMIyxUmWHEBM9Cm', '_blank');
    setShowOfferPopup2(false);
  };

  return (
    <div className="space-y-12">
      {/* Título Principal */}
      <div className="mb-12">
        <div className="relative inline-block mb-6">
          <div className="relative bg-blue-100 border-2 border-blue-600 rounded-2xl px-6 py-3 shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
            <div className="absolute top-0 left-0 w-3 h-3 bg-blue-600 rounded-full transform -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full transform translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-blue-600 rounded-full transform -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 rounded-full transform translate-x-1 translate-y-1"></div>

            <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900">
              Seja muito bem-vindo a <span className="text-blue-700 font-extrabold">EdukaPrime</span>
            </span>
          </div>
        </div>

        {/* Descrição Principal */}
        <div className="bg-white rounded-2xl border-2 border-purple-200 p-8 md:p-10 shadow-lg">
          <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-6">
            Você acaba de acessar um novo nível de materiais lúdicos e pedagógicos! ✨
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Criados para <span className="font-bold text-purple-600">pais e professores que prezam por excelência</span>,
            <span className="font-bold text-purple-600"> materiais prontos que economizam tempo</span> e transformam momentos simples em experiências de aprendizagem inesquecíveis,
            com conteúdos desenvolvidos junto a <span className="font-bold text-purple-600">parceiros do mundo todo</span>.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg font-semibold">
            Clique no banner e <span className="font-bold text-purple-600">veja tudo o que preparamos</span> para você
          </p>
        </div>
      </div>

      {/* Banners Responsivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner 1 */}
        <div className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
             onClick={() => setShowOfferPopup(true)}>
          <img src="/1Banners-Area-Inicio.webp" alt="Banner 1" className="w-full h-auto rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200" />
        </div>

        {/* Banner 2 */}
        <div className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
             onClick={() => setShowOfferPopup2(true)}>
          <img src="/2Banners-Area-Inicio.webp" alt="Banner 2" className="w-full h-auto rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200" />
        </div>
      </div>

      {/* Cards informativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Papers */}
        <div
          onClick={onNavigateToPapers}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-300 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer transform hover:scale-105 transition-transform duration-200"
        >
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-purple-900 mb-3">Papers</h3>
          <p className="text-purple-800">
            Explore nossos papercrafts temáticos com guias passo a passo para criar personagens e decorações incríveis.
          </p>
        </div>

        {/* Card Bônus */}
        <div
          onClick={onNavigateToBonus}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-300 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer transform hover:scale-105 transition-transform duration-200"
        >
          <div className="text-4xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-orange-900 mb-3">Bônus</h3>
          <p className="text-orange-800">
            Acesse conteúdos exclusivos e especiais que complementam sua experiência com turmas temáticas.
          </p>
        </div>

        {/* Card Vídeos */}
        <div
          onClick={onNavigateToVideos}
          className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-300 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer transform hover:scale-105 transition-transform duration-200"
        >
          <div className="text-4xl mb-4">🎥</div>
          <h3 className="text-xl font-bold text-pink-900 mb-3">Vídeos</h3>
          <p className="text-pink-800">
            Acompanhe tutoriais em vídeo para aprender técnicas e truques para criar seus papercrafts.
          </p>
        </div>
      </div>

      {/* Offer Popup 1 */}
      <OfferPopup
        isOpen={showOfferPopup}
        onClose={() => setShowOfferPopup(false)}
        onAcquire={handleAcquire}
      />

      {/* Offer Popup 2 */}
      <OfferPopup2
        isOpen={showOfferPopup2}
        onClose={() => setShowOfferPopup2(false)}
        onAcquire={handleAcquire2}
      />
    </div>
  );
}
