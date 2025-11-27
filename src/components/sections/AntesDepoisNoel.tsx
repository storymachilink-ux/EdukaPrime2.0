import React from 'react';
import { ChevronDown } from 'lucide-react';

export const AntesDepoisNoel: React.FC = () => {
  return (
    <section className="py-12 md:py-16 px-4 bg-[#db143c]">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Imagem - maisconfiança.webp */}
        <img
          src="/Natal/maisconfiança.webp"
          alt="Transformação"
          className="w-full h-auto"
        />

        {/* Container do conteúdo */}
        <div className="bg-[#FFF8F1] rounded-2xl p-6 border-2 border-[#f8c630] shadow-lg space-y-4">
          <p className="text-[15px] md:text-base font-medium text-[#2B2B2B] text-center">
            <span className="text-[#E34242] text-lg mr-1">❌</span>
            <span className="text-[#db143c] font-semibold">Antes:</span> tempo demais no celular, tédio e ansiedade.
          </p>

          <p className="text-[15px] md:text-base font-medium text-[#2B2B2B] text-center">
            <span className="text-[#0F8A4A] text-lg mr-1">✅</span>
            <span className="text-[#0F8A4A] font-semibold">Depois:</span> mão na massa, imaginação e orgulho do que foi criado.
          </p>
        </div>

        {/* Resultado */}
        <div className="bg-[#145C44] rounded-2xl p-6 text-center border-2 border-[#f8c630]">
          <p className="text-base md:text-lg font-semibold text-white">
            <span className="text-[#f8c630]">✨</span> <span className="font-semibold">Resultado:</span> o Natal ganha vida em 3D dentro de casa ou da sala de aula! 🎄
          </p>
        </div>

        {/* Seta para baixo */}
        <div className="flex justify-center pt-8">
          <ChevronDown className="w-8 h-8 text-[#f8c630] animate-bounce" />
        </div>
      </div>
    </section>
  );
};
