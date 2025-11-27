import React from 'react';

export const DiferenciaisColorir: React.FC = () => {

  return (
    <section id="beneficios" className="py-16 md:py-24 bg-[#F8FBFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          {/* PERSONALIZADO - Novo texto */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-ink mb-8">
            Mais que um simples desenho, é um convite à arte que <span className="text-[#FF6B2C] font-extrabold">aproxima, educa e encanta</span>!
          </h2>

          {/* Banner Antes e Depois */}
          <div className="max-w-5xl mx-auto">
            <img
              src="/BANNER-ANTES-E-DEPOIS.webp"
              alt="Antes e Depois - Transformação artística"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
