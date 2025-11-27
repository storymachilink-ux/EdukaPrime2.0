import React, { useState } from 'react';

export const EducadoresColorirNoel: React.FC = () => {
  const [currentKidIndex, setCurrentKidIndex] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const kidImages = ['/Natal/kid01.webp', '/Natal/kid02.webp', '/Natal/kid03.webp', '/Natal/kid04.webp', '/Natal/kid05.webp', '/Natal/kid06.webp'];
  const productImages = ['/Natal/foto02.webp', '/Natal/foto04.webp', '/Natal/foto05.webp', '/Natal/foto06.webp', '/Natal/foto07.webp'];

  return (
    <section id="educadores" className="py-8 md:py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Avaliações Section */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-[#009944] text-center">
            ⭐ Avaliações reais
          </h2>

          {/* Review Images */}
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/Natal/kid03.webp"
                alt="Criança criando"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/Natal/kid05.webp"
                alt="Resultado final"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Rating Box */}
          <div className="bg-[#FFE8D4] rounded-xl p-4 md:p-6 border-2 border-[#db143c] text-center">
            <p className="text-2xl font-black text-[#db143c] mb-3">⭐️⭐️⭐️⭐️⭐️</p>
            <p className="text-base md:text-lg font-bold text-[#333] mb-4">
              Mais de 3.100 famílias felizes
            </p>
            <div className="space-y-2 text-sm md:text-base text-[#333]">
              <p>"Meu filho nunca ficou tão orgulhoso de algo!" — Ana</p>
              <p>"Usei na escola, as crianças amaram!" — Prof. Camila</p>
              <p>"Zero telas e muita imaginação ✨" — Júlia</p>
            </div>
          </div>

          <button
            onClick={() => alert('Veja todos os depoimentos')}
            className="w-full bg-white border-2 border-[#009944] text-[#009944] font-bold text-base py-2 rounded-lg transition-all hover:bg-green-50"
          >
            🎥 Veja depoimentos e fotos
          </button>
        </div>

        {/* O que seu pequeno vai montar */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-[#FF9D2A] text-center">
            🎁 O que seu pequeno vai montar
          </h2>

          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src="/Natal/foto07.webp"
              alt="Modelos para montar"
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm md:text-base font-semibold text-[#333]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎅</span>
              <span>Papai Noel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🦌</span>
              <span>Renas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">☃️</span>
              <span>Boneco de Neve</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏠</span>
              <span>Casinhas 3D</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎄</span>
              <span>Árvores e guirlandas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <span>Caixinhas e enfeites</span>
            </div>
          </div>

          <div className="bg-[#F3E5F5] rounded-xl p-3 text-center border-2 border-[#7B1FA2]">
            <p className="font-bold text-[#7B1FA2]">Versão para colorir 🎨</p>
          </div>

          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src="/Natal/foto02.webp"
              alt="Versão para colorir"
              className="w-full h-auto object-cover"
            />
          </div>

          <button
            onClick={() => alert('Ver mais modelos')}
            className="w-full bg-white border-2 border-[#FF9D2A] text-[#FF9D2A] font-bold text-base py-2 rounded-lg transition-all hover:bg-orange-50"
          >
            👉 VER MAIS MODELOS
          </button>
        </div>

        {/* Perfeito para */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-black text-[#333] text-center">
            👇 Perfeito para:
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-[#E3F2FD] p-3 rounded-lg border-l-4 border-[#1976D2]">
              <span className="text-2xl">🏠</span>
              <span className="font-semibold text-[#333]">Casa com a família</span>
            </div>
            <div className="flex items-center gap-3 bg-[#E8F5E9] p-3 rounded-lg border-l-4 border-[#388E3C]">
              <span className="text-2xl">👩‍🏫</span>
              <span className="font-semibold text-[#333]">Sala de aula</span>
            </div>
            <div className="flex items-center gap-3 bg-[#F3E5F5] p-3 rounded-lg border-l-4 border-[#7B1FA2]">
              <span className="text-2xl">🙏</span>
              <span className="font-semibold text-[#333]">Igreja / catequese</span>
            </div>
            <div className="flex items-center gap-3 bg-[#FFF3E0] p-3 rounded-lg border-l-4 border-[#F57C00]">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold text-[#333]">Oficinas e festas</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src="/Natal/kid06.webp"
              alt="Crianças em atividade"
              className="w-full h-auto object-cover"
            />
          </div>

          <p className="text-center text-base md:text-lg font-bold text-[#333]">
            Simples, lúdico e educativo.
          </p>
        </div>

        {/* Bônus Section */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-[#db143c] text-center">
            🎁 Bônus Exclusivos HOJE
          </h2>

          <div className="space-y-3">
            {/* Bônus 1 */}
            <div className="border-2 border-[#FF6B2C] rounded-xl overflow-hidden">
              <img
                src="/Natal/bonus01.webp"
                alt="Kit Nascimento de Jesus"
                className="w-full h-auto object-cover"
              />
              <div className="p-3 bg-white">
                <p className="text-xs font-bold mb-2">
                  <span className="bg-[#f3ce74] text-[#f44260] px-2 py-1 rounded">De R$25</span>
                  <span className="text-green-600 font-bold ml-2">Por R$0</span>
                </p>
                <h3 className="font-bold text-[#FF6B2C] text-sm">Kit Nascimento de Jesus</h3>
              </div>
            </div>

            {/* Bônus 2 */}
            <div className="border-2 border-[#FF6B2C] rounded-xl overflow-hidden">
              <img
                src="/Natal/bonus02.webp"
                alt="Trem do Noel"
                className="w-full h-auto object-cover"
              />
              <div className="p-3 bg-white">
                <p className="text-xs font-bold mb-2">
                  <span className="bg-[#f3ce74] text-[#f44260] px-2 py-1 rounded">De R$39,99</span>
                  <span className="text-green-600 font-bold ml-2">Por R$0</span>
                </p>
                <h3 className="font-bold text-[#FF6B2C] text-sm">Trem do Noel + jogos educativos</h3>
              </div>
            </div>

            {/* Bônus 3 */}
            <div className="border-2 border-[#FF6B2C] rounded-xl overflow-hidden">
              <img
                src="/Natal/bonus03.webp"
                alt="Caixinhas Bichinhos"
                className="w-full h-auto object-cover"
              />
              <div className="p-3 bg-white">
                <p className="text-xs font-bold mb-2">
                  <span className="bg-[#f3ce74] text-[#f44260] px-2 py-1 rounded">De R$10,99</span>
                  <span className="text-green-600 font-bold ml-2">Por R$0</span>
                </p>
                <h3 className="font-bold text-[#FF6B2C] text-sm">Caixinhas Bichinhos Natal</h3>
              </div>
            </div>
          </div>

          <div className="bg-[#db143c] text-white rounded-xl p-4 text-center">
            <p className="font-bold text-base md:text-lg">
              🎁 Pacote bônus total: R$75,98 → GRÁTIS
            </p>
          </div>

          <button
            onClick={() => alert('Ir para planos')}
            className="w-full bg-[#db143c] hover:bg-[#991B1B] text-white font-black text-base md:text-lg py-3 rounded-lg shadow-lg transition-all"
          >
            👉 QUERO COM BÔNUS
          </button>
        </div>
      </div>
    </section>
  );
};
