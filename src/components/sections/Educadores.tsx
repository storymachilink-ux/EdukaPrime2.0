import React from 'react';
import { CheckCircle2, FileCheck, Shield, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Marquee } from '../ui/3d-testimonails';

export const Educadores: React.FC = () => {
  const testimonials = [
    {
      name: 'Mariana Souza',
      username: '@mariana_souza',
      role: 'Mãe — Filho de 7 anos',
      img: '/mariana.png',
      body: 'Amei a plataforma da EdukaPrime, tudo é muito fácil de achar! Ensinei meu filho a ler com as atividades de fonética, em 2 semaninhas pegou super rápido.',
    },
    {
      name: 'Carla Mendes',
      username: '@carlamendes_prof',
      role: 'Professora — Ensino Fundamental I (2º ano)',
      img: '/carla.png',
      body: 'Com a minha turma do 2º ano, eu precisava de materiais variados para leitura e escrita. A EdukaPrime oferece tudo pronto, alinhado à BNCC e fácil de adaptar, pensa na minha tranquilidade no final de semana 😂',
    },
    {
      name: 'Renata Oliveira',
      username: '@renata_oliveira',
      role: 'Mãe — Filha de 10 anos',
      img: '/renata.png',
      body: 'Minha menina sempre teve dificuldade em interpretação de texto. Com os materiais da EdukaPrime ela melhorou muito, e eu economizo tempo porque já vem tudo pronto para imprimir, ameii! ❤️',
    },
    {
      name: 'Luciana Pereira',
      username: '@luciana_pereira5',
      role: 'Professora — Ensino Fundamental II (5º ano)',
      img: '/luciana.png',
      body: 'Dou aula para o 5º ano e utilizo bastante os conteúdos de gramática e ortografia. A possibilidade de baixar em Word e personalizar facilita demais meu trabalho.',
    },
  ];

  function TestimonialCard({ name, username, role, body, img }: (typeof testimonials)[number]) {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
    
    return (
      <Card className="w-64 bg-white border-[#E6EEF7]">
        <CardContent>
          <div className="flex items-center gap-2.5">
            <Avatar className="size-9">
              <AvatarImage src={img} alt={name} />
              <AvatarFallback className="bg-[#F1F6FF] text-[#0F2741]">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <figcaption className="text-sm font-medium text-[#0F2741]">{name}</figcaption>
              <p className="text-xs text-[#4A5568]">{username}</p>
              <p className="text-xs text-[#4A5568]">{role}</p>
            </div>
          </div>
          <blockquote className="mt-3 text-sm text-[#0F2741]">{body}</blockquote>
        </CardContent>
      </Card>
    );
  }

  return (
    <section id="educadores" className="py-16 md:py-24 bg-[#F8FBFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Faixa Post-it */}
          <div className="relative inline-block mb-8">
            <div className="relative bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
              {/* Detalhes dos cantos */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>
              
              {/* Texto destacado */}
              <span className="text-xl md:text-2xl font-bold text-[#9A6A00] relative z-10">
                Mães e Professores Aprovaram
              </span>
            </div>
          </div>
        </div>
        
        <div className="border border-transparent rounded-lg relative flex h-96 w-full max-w-[800px] mx-auto flex-row items-center justify-center overflow-hidden gap-1.5 [perspective:300px]">
          <div
            className="flex flex-row items-center gap-4"
            style={{
              transform:
                'translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)',
            }}
          >
            {/* Vertical Marquee (downwards) */}
            <Marquee vertical pauseOnHover repeat={3} className="[--duration:40s]">
              {testimonials.map((review) => (
                <TestimonialCard key={review.username} {...review} />
              ))}
            </Marquee>
            {/* Vertical Marquee (upwards) */}
            <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:40s]">
              {testimonials.map((review) => (
                <TestimonialCard key={review.username} {...review} />
              ))}
            </Marquee>
            {/* Vertical Marquee (downwards) */}
            <Marquee vertical pauseOnHover repeat={3} className="[--duration:40s]">
              {testimonials.map((review) => (
                <TestimonialCard key={review.username} {...review} />
              ))}
            </Marquee>
            {/* Vertical Marquee (upwards) */}
            <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:40s]">
              {testimonials.map((review) => (
                <TestimonialCard key={review.username} {...review} />
              ))}
            </Marquee>
            {/* Gradient overlays for vertical marquee */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
          </div>
        </div>
        
        {/* Benefícios Section */}
        <div className="mb-0 bg-[#f1fcff] rounded-t-[24px] p-8">
          <div className="text-center mb-12">
            {/* Faixa Post-it */}
            <div className="relative inline-block">
              <div className="relative bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                {/* Detalhes dos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>
                
                {/* Texto destacado */}
                <span className="text-3xl md:text-4xl font-bold text-[#9A6A00] relative z-10">
                  Benefícios
                </span>
              </div>
            </div>
          </div>
          
          {/* Carrossel de Benefícios com Navegação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { title: 'Poupe Tempo', description: 'Tenha mais horas livres para você e sua família.' },
                { title: 'Aulas Sem Estresse', description: 'Chegue preparada com materiais de qualidade.' },
                { title: 'Personalização', description: 'Baixe em Word e edite do seu jeito.' },
                { title: 'Tranquilidade', description: 'Saiba que terá sempre atividades novas para aplicar.' },
                { title: 'Confiança', description: 'Materiais testados e aprovados por mães e professores.' },
              ].map((beneficio, index) => (
                <div key={index}>
                  <div className="relative group transition-all duration-300 rotate-[-1deg]">
                    <div className="absolute inset-0 bg-[#fbe9be] border-2 border-[#ffe3a0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#033258] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
                    <div className="relative p-6 text-center">
                      <div className="flex items-center gap-3 mb-3 justify-center">
                        <CheckCircle2 className="w-6 h-6 text-[#033258]" />
                        <h3 className="text-lg font-semibold text-[#033258]">
                          {beneficio.title}
                        </h3>
                      </div>
                      <p className="text-sm text-[#033258] leading-relaxed">
                        {beneficio.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Seção Dor + Solução */}
        <div className="bg-[#f1fcff] rounded-b-[24px] p-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink mb-6">
              Você já se pegou passando horas criando atividades do zero?
            </h2>
            <div className="mb-8">
              <img src="/gifeduka.gif" alt="GIF EdukaPrime" className="mx-auto mb-4" />
            </div>
            <p className="text-lg text-body max-w-3xl mx-auto mb-8">
              Tentando achar materiais soltos na internet e, no fim, se sentindo esgotada? A EdukaPrime resolve isso para você:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - Atividades Prontas */}
            <div className="relative group transition-all duration-300 rotate-[-1deg]">
              <div className="absolute inset-0 bg-[#fbe9be] border-2 border-[#ffe3a0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#033258] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileCheck className="w-6 h-6 text-[#033258]" />
                  <h3 className="text-2xl font-semibold text-[#033258]">
                    Atividades Prontas
                  </h3>
                </div>
                <p className="text-[#033258]">
                  Organizadas por tema e nível de dificuldade
                </p>
              </div>
            </div>


            {/* Card 2 - 100% Alinhado à BNCC 2023 */}
            <div className="relative group transition-all duration-300 rotate-[1deg]">
              <div className="absolute inset-0 bg-[#fbe9be] border-2 border-[#ffe3a0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#033258] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-[#033258]" />
                  <h3 className="text-2xl font-semibold text-[#033258]">
                    100% Alinhado à BNCC 2023
                  </h3>
                </div>
                <p className="text-[#033258]">
                  Conteúdo atualizado e em conformidade
                </p>
              </div>
            </div>

            {/* Card 3 - Planejamento Facilitado */}
            <div className="relative group transition-all duration-300 rotate-[-2deg]">
              <div className="absolute inset-0 bg-[#fbe9be] border-2 border-[#ffe3a0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#033258] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-[#033258]" />
                  <h3 className="text-2xl font-semibold text-[#033258]">
                    Planejamento Facilitado
                  </h3>
                </div>
                <p className="text-[#033258]">
                  Nunca mais corra contra o tempo para preparar aulas
                </p>
              </div>
            </div>
          </div>
            </div>
      </div>
    </section>
  );
};