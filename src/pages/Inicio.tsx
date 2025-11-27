import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuroraBackground } from '../components/ui/aurora-background';

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <AuroraBackground>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Conteúdo centralizado */}
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo */}
          <img src="/logohorizontal.webp" alt="EdukaPrime" className="h-12 mx-auto mb-8" />

          {/* Faixa Post-it com o título */}
          <div className="relative inline-block my-8">
            <div className="relative bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-2xl px-8 py-6 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
              {/* Detalhes dos cantos */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>

              {/* Texto destacado */}
              <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#9A6A00] relative z-10">
                Conheça nossos produtos educativos!
              </span>
            </div>
          </div>

          {/* Texto de descrição */}
          <p className="text-lg md:text-xl text-gray-700 max-w-xl mx-auto mt-8 px-4">
            Toque no produto desejado abaixo e descubra atividades infantis criativas, educativas e prontas para imprimir!
          </p>

          {/* Seta animada para baixo */}
          <div className="mt-6 flex justify-center">
            <svg
              className="w-8 h-8 text-gray-700 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>

          {/* Banner Especial Natal - Primeiro */}
          <div className="w-full mt-12 px-4">
            <div
              onClick={() => navigate('/natal')}
              className="cursor-pointer hover:transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src="/4Banners-Area-Inicio.png"
                alt="Banner Especial Natal"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 px-4">
            {/* Banner 1 */}
            <div
              onClick={() => navigate('/')}
              className="cursor-pointer hover:transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src="/2Banners-Area-Inicio.webp"
                alt="Produto 1"
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            {/* Banner 2 */}
            <div
              onClick={() => navigate('/paper')}
              className="cursor-pointer hover:transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src="/3Banners-Area-Inicio.webp"
                alt="Produto 2"
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            {/* Banner 3 */}
            <div
              onClick={() => navigate('/principal')}
              className="cursor-pointer hover:transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src="/1Banners-Area-Inicio.webp"
                alt="Produto 3"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Rodapé com botão de suporte */}
          <div className="mt-16 pb-8 flex justify-center">
            <a
              href="https://api.whatsapp.com/send/?phone=%2B556793091209&text=O%E2%81%AC%E2%81%AD%E2%81%AC%E2%81%AD%E2%81%AC%E2%81%AD%E2%81%AC%E2%81%ADiee+tenho+d%C3%BAvidas+sobre+a+plataforma+Eduka+Prime+&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#25D366] to-[#20BA5A] hover:from-[#20BA5A] hover:to-[#1ea952] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <img src="/whats.webp" alt="WhatsApp" className="h-6 w-6" />
              Suporte WhatsApp
            </a>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
