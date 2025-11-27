import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Marquee } from '../ui/3d-testimonails';
import { FeatureCarousel } from '../ui/feature-carousel';

export const EducadoresColorirNatal: React.FC = () => {
  // PERSONALIZE OS DEPOIMENTOS AQUI
  const testimonials = [
    {
      name: 'Mariana Souza',
      username: '@mariana_souza',
      role: 'Mãe — Filho de 7 anos',
      img: '/mariana.webp',
      body: 'Amei a plataforma da EdukaPrime, tudo é muito fácil de achar! Ensinei meu filho a ler com as atividades de fonética, em 2 semaninhas pegou super rápido.',
    },
    {
      name: 'Carla Mendes',
      username: '@carlamendes_prof',
      role: 'Professora — Ensino Fundamental I (2º ano)',
      img: '/carla.webp',
      body: 'Com a minha turma do 2º ano, eu precisava de materiais variados para leitura e escrita. A EdukaPrime oferece tudo pronto, alinhado à BNCC e fácil de adaptar, pensa na minha tranquilidade no final de semana 😂',
    },
    {
      name: 'Renata Oliveira',
      username: '@renata_oliveira',
      role: 'Mãe — Filha de 10 anos',
      img: '/renata.webp',
      body: 'Minha menina sempre teve dificuldade em interpretação de texto. Com os materiais da EdukaPrime ela melhorou muito, e eu economizo tempo porque já vem tudo pronto para imprimir, ameii! ❤️',
    },
    {
      name: 'Luciana Pereira',
      username: '@luciana_pereira5',
      role: 'Professora — Ensino Fundamental II (5º ano)',
      img: '/luciana.webp',
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

  function ReviewCarousel() {
    const reviews = ['/img/rev01.webp', '/img/rev02.webp', '/img/rev03.webp', '/img/rev04.webp'];
    const [currentIndex, setCurrentIndex] = useState(0);

    const prev = () => setCurrentIndex((i) => (i === 0 ? reviews.length - 1 : i - 1));
    const next = () => setCurrentIndex((i) => (i === reviews.length - 1 ? 0 : i + 1));

    return (
      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative">
          {/* Moldura com traçado */}
          <div className="relative p-5 border-4 border-dashed border-[#FFE3A0] rounded-2xl bg-white shadow-lg">
            {/* Contorno interno 20px com traçado */}
            <div className="border-2 border-dashed border-[#9A6A00] rounded-xl p-5">
              <img
                src={reviews[currentIndex]}
                alt={`Review ${currentIndex + 1}`}
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Botões de navegação */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-2 border-[#FFE3A0] rounded-full p-2 shadow-md transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-[#9A6A00]" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-2 border-[#FFE3A0] rounded-full p-2 shadow-md transition-all"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5 text-[#9A6A00]" />
          </button>
        </div>
      </div>
    );
  }

  function MockCarousel() {
    const mocks = ['/img/mockbonus.webp', '/img/mocksistema.webp', '/img/mockjogos.webp', '/img/mockmatematica.webp'];
    const [currentIndex, setCurrentIndex] = useState(0);

    const prev = () => setCurrentIndex((i) => (i === 0 ? mocks.length - 1 : i - 1));
    const next = () => setCurrentIndex((i) => (i === mocks.length - 1 ? 0 : i + 1));

    return (
      <div className="max-w-4xl mx-auto my-8">
        <div className="relative">
          <div className="relative bg-white rounded-2xl shadow-xl p-4 border-2 border-[#E6EEF7]">
            <img
              src={mocks[currentIndex]}
              alt={`Mock ${currentIndex + 1}`}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          {/* Botões de navegação */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-2 border-[#0F2741] rounded-full p-2 shadow-lg transition-all hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-[#0F2741]" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-2 border-[#0F2741] rounded-full p-2 shadow-lg transition-all hover:scale-110"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5 text-[#0F2741]" />
          </button>

          {/* Indicadores de página */}
          <div className="flex justify-center gap-2 mt-4">
            {mocks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-[#0F2741]' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Ir para imagem ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="educadores" className="py-16 md:py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Faixa Post-it - PERSONALIZADO */}
          <div className="relative inline-block mb-8">
            <div className="relative bg-[#FFE5E5] border-2 border-[#db143c] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
              {/* Detalhes dos cantos */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#db143c] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#db143c] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#db143c] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#db143c] rounded-full transform translate-x-1 translate-y-1"></div>

              {/* Texto destacado - VERDE */}
              <span className="text-xl md:text-2xl font-bold text-[#009944] relative z-10">
                Aqui a brincadeira vira <span className="text-[#F0AD4E] font-extrabold" style={{ textShadow: '-2px -2px 0 #1a5d3a, 2px -2px 0 #1a5d3a, -2px 2px 0 #1a5d3a, 2px 2px 0 #1a5d3a, 0px -2px 0 #1a5d3a, 0px 2px 0 #1a5d3a, -2px 0px 0 #1a5d3a, 2px 0px 0 #1a5d3a' }}>criação real</span>
              </span>
            </div>
          </div>

          {/* Texto adicional abaixo do banner - BRANCO */}
          <div className="text-lg md:text-xl text-white leading-relaxed max-w-4xl mx-auto mt-6 text-justify space-y-4">
            <p>
              Recortar, montar, decorar e transformar o ambiente com temas natalinos.
            </p>
            <p>
              Seu <span className="text-[#FFFACD] font-semibold">pequeno participa, cria e se envolve de verdade</span>.
            </p>
            <p>
              Você imprime, eles montam
            </p>
            <p>
              E o Natal ganha vida em 3D dentro de casa ou da sala de aula. 🎄✂️ <span style={{ textShadow: '0 0 10px rgba(0, 221, 136, 0.8), 0 0 20px rgba(0, 221, 136, 0.6)' }}>Simples. Lúdico. Educativo.</span>
            </p>
            <p>
              <span style={{ textShadow: '0 0 10px rgba(220, 38, 38, 0.8), 0 0 20px rgba(220, 38, 38, 0.6)' }}>Um jeito mágico e prático de aprender e se divertir nesse Natal.</span>
            </p>
          </div>

          {/* Carousel de Fotos EdukaBoo */}
          <div className="max-w-6xl mx-auto">
            <FeatureCarousel
              images={[
                { src: '/Natal/foto01.webp', alt: 'Foto Trabalho 1' },
                { src: '/Natal/foto02.webp', alt: 'Foto Trabalho 2' },
                { src: '/Natal/foto03.webp', alt: 'Foto Trabalho 3' },
                { src: '/Natal/foto04.webp', alt: 'Foto Trabalho 4' },
                { src: '/Natal/foto05.webp', alt: 'Foto Trabalho 5' },
                { src: '/Natal/foto06.webp', alt: 'Foto Trabalho 6' },
                { src: '/Natal/foto07.webp', alt: 'Foto Trabalho 7' },
              ]}
              className="bg-gray-900/50 rounded-2xl"
            />
          </div>

          {/* Banner EdukaPapers com animação pulsante - LARANJA CLARO */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="bg-[#FF9D2A] rounded-2xl px-8 py-8 shadow-xl animate-pulse-soft">
              <p className="text-lg md:text-xl text-black leading-relaxed text-center mb-8">
                Porque o mais mágico do Natal é ver eles criando
              </p>

              <p className="text-lg text-black font-semibold text-center mb-6">
                Cada dobrinha, cada recorte, cada peça encaixada…
              </p>

              <p className="text-lg text-black font-semibold text-center mb-6">
                E os pequenos desenvolvem:
              </p>

              <div className="flex flex-wrap gap-3 justify-center mb-8">
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-[#009944]" />
                  <span className="font-semibold text-black text-sm md:text-base">Concentração</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-[#009944]" />
                  <span className="font-semibold text-black text-sm md:text-base">Paciência</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-[#009944]" />
                  <span className="font-semibold text-black text-sm md:text-base">Coordenação</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-[#009944]" />
                  <span className="font-semibold text-black text-sm md:text-base">Autoestima</span>
                </div>
              </div>

              <p className="text-sm md:text-base text-black/70 text-center italic mt-6">
                Quando a criança monta, ela descobre o valor de dizer: <span className="font-semibold">"Fui eu que fiz".</span>
              </p>
            </div>
          </div>

          <style jsx>{`
            @keyframes pulse-soft {
              0%, 100% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.02);
                opacity: 0.95;
              }
            }
            .animate-pulse-soft {
              animation: pulse-soft 3s ease-in-out infinite;
            }
          `}</style>
        </div>

        {/* Imagem de Comentários */}
        <div className="max-w-6xl mx-auto mt-12">
          <img
            src="/Natal/dep01-natal.webp"
            alt="Comentários e depoimentos"
            className="w-full h-auto rounded-2xl shadow-lg"
          />
        </div>

        {/* Botão acima de Benefícios */}
        <div className="text-center my-12">
          <style>{`
            @keyframes float-gentle {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-8px);
              }
            }
            .float-button {
              animation: float-gentle 3s ease-in-out infinite;
            }
          `}</style>
          <button
            onClick={() => {
              // Scrollar até a seção preco-ajuste (Pequenos Gênios da Arte)
              const precoAjuste = document.getElementById('preco-ajuste');
              if (precoAjuste) {
                precoAjuste.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                // Fallback para o CTA da página /colorir
                const ctaColorir = document.getElementById('cta-button-colorir');
                if (ctaColorir) {
                  ctaColorir.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  // Fallback para o plano-prime da página principal
                  const primeCard = document.getElementById('plano-prime');
                  if (primeCard) {
                    primeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              }
            }}
            className="float-button inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span>Liberar meu acesso agora</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Benefícios Section - GRADIENTE BRANCO PARA LARANJA */}
        <div className="mb-0 bg-gradient-to-b from-white to-[#FFE8D4] rounded-t-[24px] p-8">
          <div className="text-center mb-12">
            {/* Texto acima do banner */}
            <p className="text-lg md:text-xl text-ink leading-relaxed max-w-4xl mx-auto mb-8 text-center">
              No Natal… o que fica são os <span className="font-extrabold">momentos feitos juntos</span>.
            </p>

            {/* Banner Livro */}
            <div className="max-w-5xl mx-auto mb-8">
              <img
                src="/Natal/Produto-Imagem.webp"
                alt="EdukaPapers Produto"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>

            {/* Faixa Post-it - VERMELHO PARA NATAL */}
            <div className="relative inline-block">
              <div className="relative bg-[#FFE5E5] border-2 border-[#db143c] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                {/* Detalhes dos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#db143c] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#db143c] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#db143c] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#db143c] rounded-full transform translate-x-1 translate-y-1"></div>

                {/* Texto destacado - VERMELHO com imagem */}
                <div className="flex items-center gap-2 relative z-10">
                  <img
                    src="/Natal/origami.png"
                    alt="Origami"
                    className="h-8 md:h-10 w-auto object-contain"
                  />
                  <span className="text-xl md:text-2xl font-bold text-[#991B1B]">
                    Mais de <span className="font-extrabold">60 personagens e cenários</span> de Natal para recortar e montar
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Novo conteúdo descritivo - ROXO CLARO PARA PAPER */}
          <div className="max-w-4xl mx-auto space-y-6 text-center lg:text-left">
            <p className="text-lg md:text-xl text-ink leading-relaxed">
              <span className="text-[#009944] font-semibold">Cenários 3D</span>, <span className="text-[#009944] font-semibold">personagens</span>, <span className="text-[#009944] font-semibold">mini decorações</span> e <span className="text-[#009944] font-semibold">brincadeiras temáticas</span> — tudo pensado para <span className="text-[#009944] font-semibold">transformar papel em magia</span>, com cola, tesoura e um <span className="text-[#009944] font-semibold">passo a passo simples</span>.
            </p>

            <p className="text-lg md:text-xl text-[#009944] leading-relaxed font-semibold mb-6">
              Durante a montagem, eles melhoram a:
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <span className="bg-[#E3F2FD] text-[#1976D2] px-4 py-2 rounded-full font-semibold text-sm md:text-base border border-[#1976D2]/30">
                Criatividade
              </span>
              <span className="bg-[#FFF3E0] text-[#F57C00] px-4 py-2 rounded-full font-semibold text-sm md:text-base border border-[#F57C00]/30">
                Foco e coordenação
              </span>
              <span className="bg-[#F3E5F5] text-[#7B1FA2] px-4 py-2 rounded-full font-semibold text-sm md:text-base border border-[#7B1FA2]/30">
                Autonomia
              </span>
              <span className="bg-[#FCE4EC] text-[#C2185B] px-4 py-2 rounded-full font-semibold text-sm md:text-base border border-[#C2185B]/30">
                Memórias afetivas
              </span>
            </div>
          </div>
        </div>

        {/* Seção Avaliações - LARANJA PARA PAPER */}
        <div className="bg-[#FFE8D4] rounded-b-[24px] p-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink mb-4">
              O que dizem os mais de 3100 clientes que compraram:
            </h2>
            <p className="text-xl md:text-2xl text-ink">
              ⭐️⭐️⭐️⭐️⭐️<br />
              <span className="text-green-600 font-extrabold">+ 600 avaliações positivas:</span>
            </p>
          </div>

          {/* Imagens de comentários */}
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <img
                src="/coment03.webp"
                alt="Comentários e avaliações - Parte 3"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <img
                src="/coment04.webp"
                alt="Comentários e avaliações - Parte 4"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <img
                src="/coment05.webp"
                alt="Comentários e avaliações - Parte 5"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
