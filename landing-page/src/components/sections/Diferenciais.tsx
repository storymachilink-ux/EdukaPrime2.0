import React from 'react';

export const Diferenciais: React.FC = () => {

  return (
    <section id="beneficios" className="py-16 md:py-24 bg-[#F8FBFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink mb-4">
            Um Acervo Completo Para Cada Fase do Aprendizado
          </h2>
        </div>
        
        {/* === POR QUE SOMOS DIFERENTES — NOVO GRID DE CARDS === */}
        <section id="diferenciais" className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Card 1 - Atividades Iniciais */}
            <div className="relative group transition-all duration-300 rotate-[-1deg]">
              <div className="absolute inset-0 bg-[#fbe9be] border-2 border-[#ffe3a0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#033258] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                <div className="flex items-start gap-4 mb-3">
                  <img src="/b01.png" alt="Atividades Iniciais" className="w-12 h-12 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-semibold text-[#033258] mb-2">
                      Atividades Iniciais
                    </h3>
                    <p className="text-[#033258]">
                      Primeiros passos na leitura, escrita e matemática.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Atividades Avançadas */}
            <div className="relative group transition-all duration-300 rotate-[1deg]">
              <div className="absolute inset-0 bg-[#fbe9be] border-2 border-[#ffe3a0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#033258] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                <div className="flex items-start gap-4 mb-3">
                  <img src="/b02.png" alt="Atividades Avançadas" className="w-12 h-12 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-semibold text-[#033258] mb-2">
                      Atividades Avançadas
                    </h3>
                    <p className="text-[#033258]">
                      Interpretação de texto, gramática e ortografia.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Diversidade de Conteúdo */}
            <div className="relative group transition-all duration-300 rotate-[-2deg]">
              <div className="absolute inset-0 bg-[#fbe9be] border-2 border-[#ffe3a0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#033258] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                <div className="flex items-start gap-4 mb-3">
                  <img src="/b03.png" alt="Diversidade de Conteúdo" className="w-12 h-12 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-semibold text-[#033258] mb-2">
                      Diversidade de Conteúdo
                    </h3>
                    <p className="text-[#033258]">
                      Literatura, gêneros textuais e muito mais em um só lugar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 - Sempre Atualizado */}
            <div className="relative group transition-all duration-300 rotate-[1.5deg]">
              <div className="absolute inset-0 bg-[#fbe9be] border-2 border-[#ffe3a0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#033258] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                <div className="flex items-start gap-4 mb-3">
                  <img src="/b04.png" alt="Sempre Atualizado" className="w-12 h-12 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-semibold text-[#033258] mb-2">
                      Sempre Atualizado
                    </h3>
                    <p className="text-[#033258]">
                      Novas atividades adicionadas regularmente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};