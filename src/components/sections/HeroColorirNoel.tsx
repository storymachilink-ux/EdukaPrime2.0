import React, { useEffect, useRef, useState } from 'react';

interface HeroProps {
  onLoginClick?: () => void;
}

export const HeroColorirNoel: React.FC<HeroProps> = ({ onLoginClick }) => {
  return (
    <section id="inicio" className="px-4 py-8 md:py-12 bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header com promo */}
        <div className="text-center space-y-2">
          <p className="text-xs font-bold text-[#db143c] bg-red-50 py-1 px-3 rounded-full inline-block">
            📱 VERSÃO MOBILE — EdukaPapers Natal
          </p>
          <p className="text-sm font-bold text-[#FF9D2A]">
            🕒 Promoção acaba em: 12:13
          </p>
          <p className="text-xs text-green-600 font-semibold">
            Cupom automático aplicado
          </p>
        </div>

        {/* Main Headline */}
        <div className="bg-gradient-to-br from-[#FFE8D4] to-[#FFD4B3] rounded-2xl p-6 border-2 border-[#db143c]">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl md:text-3xl font-black text-[#db143c]">
              ✨ Transforme o Natal em magia com papel, tesoura e imaginação!
            </h1>

            <p className="text-base md:text-lg font-bold text-[#333]">
              Papercrafts natalinos para crianças (4 a 12 anos)<br />
              <span className="text-[#009944]">Imprima ou receba em casa 📦✂️</span>
            </p>

            {/* Quick Benefits */}
            <div className="space-y-2 text-sm md:text-base">
              <p className="flex items-center justify-center gap-2">
                <span className="text-lg">✅</span>
                <span className="font-semibold">Sem telas</span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="text-lg">✅</span>
                <span className="font-semibold">Criatividade e autonomia</span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="text-lg">✅</span>
                <span className="font-semibold">Momentos em família inesquecíveis</span>
              </p>
            </div>

            {/* Primary CTA */}
            <button
              onClick={onLoginClick}
              className="w-full bg-[#db143c] hover:bg-[#991B1B] text-white font-black text-base md:text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              👉 QUERO UM NATAL CRIATIVO
            </button>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-lg md:text-xl font-bold text-[#333] mb-3">
            ✨ "Você imprime. Eles montam. E o Natal ganha vida!"
          </p>

          {/* GIF Montagem */}
          <div className="rounded-xl overflow-hidden shadow-lg mb-4">
            <img
              src="/Natal/2gif-montagem.gif"
              alt="GIF montagem"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Quick Info */}
          <div className="space-y-2 text-sm md:text-base text-[#333]">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🎄</span>
              <span>Casa ou escola</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">✂️</span>
              <span>Passo a passo simples</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">💞</span>
              <span>Memórias afetivas que ficam pra sempre</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
