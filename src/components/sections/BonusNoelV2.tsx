import React from 'react';
import { ChevronDown } from 'lucide-react';

export const BonusNoelV2: React.FC = () => {
  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleDateString('pt-BR', { month: 'long' });
    const year = today.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const bonuses = [
    {
      image: '/Natal/bonus01.webp',
      number: '01',
      title: 'Kit de papercraft inspirado no nascimento de Jesus',
      desc: 'Ideal para atividades bíblicas e pedagógicas. Inclui personagens como Jesus Bebê, Maria, José e o Arcanjo Miguel, além de um cenário completo para montar.'
    },
    {
      image: '/Natal/bonus02.webp',
      number: '02',
      title: 'Trem do Noel + Jogos Educativos',
      desc: 'Dê vida ao trem do Papai Noel com montagem passo a passo e peças incríveis. Acompanha atividades lúdicas, caça-palavras e explorações visuais para aprender brincando.'
    },
    {
      image: '/Natal/bonus03.webp',
      number: '03',
      title: 'Caixinha de Presente Bichinhos',
      desc: 'Transforme bichinhos fofos em caixinhas de presente encantadoras! São mini papercrafts para montar, com versão para colorir e também já coloridos perfeitos para presentear, decorar e brincar com criatividade.'
    }
  ];

  return (
    <section id="bonus-exclusivos" className="py-12 md:py-16 px-4 bg-[#FFF3D6]">
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-2xl md:text-3xl font-black text-[#145C44] text-center">
          E não para por aí... tem mais<br />
          <span className="text-[#db143c]">Bônus Exclusivos</span>
          <br />
          <span className="text-lg md:text-2xl font-bold text-[#009944]">Valor R$147 (Hoje Grátis!)</span>
        </h2>

        {/* Bonus Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bonuses.map((bonus, idx) => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              {/* Image */}
              <div className="relative w-full overflow-hidden bg-gray-100" style={{ paddingTop: '100%' }}>
                <img
                  src={bonus.image}
                  alt={bonus.title}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <p className="text-sm font-bold text-[#db143c]">
                  {bonus.number} - BÔNUS
                </p>
                <h3 className="text-lg font-black text-[#145C44]">
                  {bonus.title}
                </h3>
                <p className="text-sm text-[#333] font-semibold">
                  {bonus.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Support text */}
        <div className="bg-white rounded-xl p-6 text-center border-2 border-[#f8c630]">
          <p className="text-xs md:text-sm font-bold mb-2">
            <span className="text-[#db143c]">SUPER DESCONTO COM BÔNUS APENAS HOJE</span>{' '}
            <span className="text-[#145C44]">{getCurrentDate()}</span>
          </p>
          <p className="text-base md:text-lg font-semibold text-[#145C44]">
            Conteúdos extras para enriquecer a experiência<br />
            e multiplicar a diversão
          </p>
        </div>

        {/* Seta para baixo */}
        <div className="flex justify-center pt-8">
          <ChevronDown className="w-8 h-8 text-[#145C44] animate-bounce" />
        </div>
      </div>
    </section>
  );
};
