"use client";

import React from "react";

export function LoginGradientText() {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/+556793091209', '_blank');
  };

  return (
    <div className="w-full max-w-md mt-5 px-4" style={{ textAlign: 'center' }}>
      {/* Imagem de Suporte */}
      <img
        src="/compra.webp"
        alt="Suporte EdukaPrime"
        className="w-full h-auto mb-4"
        loading="lazy"
      />

      <button
        onClick={handleWhatsAppClick}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
      >
        <img
          src="/whats.png"
          alt="WhatsApp"
          className="w-6 h-6"
        />
        SUPORTE WhatsApp
      </button>
    </div>
  );
}
