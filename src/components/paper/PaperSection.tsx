import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  pdfUrl: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  ageRange: string;
  theme: string;
  emoji?: string;
  fullDescription?: string;
  gif?: string;
  benefits?: string[];
  tip?: string;
  items?: Array<{
    number: string;
    name: string;
    difficulty: 'Fácil' | 'Médio' | 'Difícil';
    ageRange: string;
    theme: string;
    type: string;
  }>;
}

interface PaperSectionProps {
  userPlan?: string;
  onUpsellClick?: () => void;
}

interface RestrictedCardProps {
  onDetailsClick?: () => void;
}

/**
 * Seção de Papers do EdukaBoo
 * Exibe cards de produtos e permite visualizar detalhes
 * Para plano básico: mostra todos os cards mas com botão de upsell
 */
export default function PaperSection({ userPlan = 'completo', onUpsellClick = () => {} }: PaperSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Verificar se é plano básico
  const isBasicPlan = userPlan === 'basico';

  // Verificar se é plano Natal Básico (user03natal)
  const isNatalBasicPlan = userPlan === 'natal-basico';

  // Verificar se é plano Natal Completo (user76natal)
  const isNatalCompletoPlan = userPlan === 'natal-completo';

  // Dados de exemplo dos produtos
  const products: Product[] = [
    {
      id: '1',
      title: 'Turma EdukaBoo',
      description: 'Conheça e monte todos os personagens icônicos da turma EdukaBoo',
      image: '/paperlogin/TurmaEdukaboo.png',
      pdfUrl: 'https://drive.google.com/drive/folders/1ctOt0vv0wbqJrChVUr7qXm2tecxTOHvw?usp=sharing',
      difficulty: 'fácil',
      ageRange: '4-12 anos',
      theme: 'Personagens',
      emoji: '🎃',
      fullDescription: `A Turma Halloween traz 27 papercrafts exclusivos com guias passo a passo para montar personagens, monstros e decorações divertidas.
Cada modelo foi pensado para estimular coordenação motora, foco e criatividade, com montagem simples e resultado encantador.

💡 Dica: Imprima em papel 120g ou colorido para melhor acabamento!`,
      gif: '/paperlogin/Gif-Turma-Edukaboo.gif',
      benefits: ['Coordenação motora', 'Concentração', 'Expressão criativa'],
      tip: 'Monte com fita adesiva dupla-face e adicione detalhes com canetinhas ou glitter para personalizar os personagens!',
      items: [
        { number: '00', name: 'Abobora com Carinhas', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '01', name: 'Jeff com Cartola', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '02', name: 'Caveirinha', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '03', name: 'Dracula', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '04', name: 'Mini-Morte', difficulty: 'Médio', ageRange: '7–12 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '05', name: 'Abobora Simples', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Halloween', type: 'Origami' },
        { number: '06', name: 'Abobora', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '07', name: 'Aranha', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '08', name: 'Bruxa Elegante', difficulty: 'Médio', ageRange: '7–12 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '09', name: 'Bruxa', difficulty: 'Fácil', ageRange: '5–9 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '10', name: 'Caveira', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '11', name: 'Frankenstein', difficulty: 'Médio', ageRange: '6–11 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '12', name: 'Franksteinx', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Halloween', type: 'Origami' },
        { number: '13', name: 'Gato Malvado', difficulty: 'Fácil', ageRange: '4–9 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '14', name: 'Gato', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '15', name: 'Fantasma', difficulty: 'Médio', ageRange: '7–12 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '16', name: 'Mago', difficulty: 'Fácil', ageRange: '4–9 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '17', name: 'Coruja', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '18', name: 'Vampirinho', difficulty: 'Fácil', ageRange: '5–9 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '19', name: 'Frankenstein 2', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '20', name: 'Mumia', difficulty: 'Médio', ageRange: '6–11 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '21', name: 'Morcego', difficulty: 'Médio', ageRange: '7–12 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '22', name: 'Mulher Gato Turma Halloween', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '23', name: 'Muminha', difficulty: 'Fácil', ageRange: '4–9 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '24', name: 'Pumpkin', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '25', name: 'Vampiro', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Halloween', type: 'Papercraft' },
        { number: '26', name: 'Casa Halloween', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Halloween', type: 'Papercraft' },
      ]
    },
    {
      id: '2',
      title: 'Decoração',
      description: 'Crie decorações incríveis para sua casa ou sala de aula',
      image: '/paperlogin/decoracaoboo.png',
      pdfUrl: 'https://drive.google.com/drive/folders/1FjgGiFowpJ2tZPXbkVKIhhZpRZPun5fm?usp=sharing',
      difficulty: 'médio',
      ageRange: '5-12 anos',
      theme: 'Decoração',
      emoji: '🎨',
      fullDescription: `Transforme qualquer espaço com nossas 25 decorações temáticas exclusivas! De adornos para festas até peças permanentes para sua sala de aula, cada design foi criado para impressionar.
Com instruções passo a passo e materiais acessíveis, suas crianças criarão decorações lindas que podem exibir com orgulho.

💡 Dica: Use papel colorido 200g para decorações mais resistentes e duradouras!`,
      gif: '/paperlogin/DecoracaoGif.gif',
      benefits: ['Criatividade sem limites', 'Organização espacial', 'Senso estético'],
      items: [
        { number: '00', name: 'Moldura Aranha', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Decoração', type: 'Papercraft' },
        { number: '01', name: 'Super Casa Halloween', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Decoração', type: 'Papercraft' },
        { number: '02', name: 'Super Casa Halloween Tutorial', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Decoração', type: 'Papercraft' },
        { number: '03', name: 'Guia Casa Halloween', difficulty: 'Médio', ageRange: '7–12 anos', theme: 'Decoração', type: 'Papercraft' },
        { number: '04', name: 'Casa Halloween', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Decoração', type: 'Origami' },
        { number: '05', name: 'Morcego 3D', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Decoração', type: 'Papercraft' },
        { number: '06', name: 'Morcego 3D Tutorial', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Decoração', type: 'Papercraft' },
        { number: '07', name: 'Quadro 3D', difficulty: 'Médio', ageRange: '7–12 anos', theme: 'Decoração', type: 'Papercraft' },
        { number: '08', name: 'Quadro 3D 2', difficulty: 'Fácil', ageRange: '5–9 anos', theme: 'Decoração', type: 'Papercraft' }
      ]
    },
    {
      id: '3',
      title: 'Histórias',
      description: 'Papercrafts temáticos inspirados em histórias clássicas e modernas',
      image: '/paperlogin/Historiaboo.png',
      pdfUrl: 'https://drive.google.com/drive/folders/1TF5IcqY_ZLF1t0WUs4Y2HANRMo9krP7v?usp=sharing',
      difficulty: 'médio',
      ageRange: '6-12 anos',
      theme: 'Narrativa',
      emoji: '📖',
      fullDescription: `Explore o lado assustador e intrigante com nossos clássicos do Halloween em desenhos! Cada personagem icônico foi cuidadosamente ilustrado para trazer a atmosfera mágica e misteriosa das histórias de horror à vida.
Perfeito para explorar a criatividade e a imaginação, essas peças ajudam as crianças a expressar seu lado criativo enquanto aprendem sobre as lendas clássicas.

💡 Dica: Combine com contações de histórias de horror para criar um clima imersivo!`,
      gif: '/paperlogin/Historinhas.gif',
      benefits: ['Imaginação criativa', 'Conexão com narrativas', 'Habilidades de contação'],
      items: [
        { number: '01', name: 'Drácula', difficulty: 'Médio', ageRange: '8–12 anos', theme: 'Clássicos do Halloween', type: 'Papercraft' },
        { number: '02', name: 'Ceifador', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Clássicos do Halloween', type: 'Papercraft' },
        { number: '03', name: 'Caveira Viva', difficulty: 'Médio', ageRange: '7–12 anos', theme: 'Clássicos do Halloween', type: 'Papercraft' },
        { number: '04', name: 'Cavaleiro sem Cabeça', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Clássicos do Halloween', type: 'Papercraft' }
      ]
    },
    {
      id: '4',
      title: 'Atividades Lúdicas',
      description: 'Atividades divertidas que combinam aprendizado com diversão',
      image: '/paperlogin/Atividadesboo.png',
      pdfUrl: 'https://drive.google.com/drive/folders/18q5zQv6a3PFeFWKQaX7qA3r2esGnJnwM?usp=sharing',
      difficulty: 'fácil',
      ageRange: '4-10 anos',
      theme: 'Educativo',
      emoji: '🎮',
      fullDescription: `Aprenda brincando com nossas 5 atividades lúdicas interativas! Cada proposta foi cuidadosamente criada para desenvolver competências essenciais como raciocínio lógico, coordenação e pensamento criativo.
Perfeito para sala de aula ou casa, nossas atividades tornam o aprendizado uma verdadeira aventura cheia de diversão e descobertas.

💡 Dica: Use em grupos para desenvolver habilidades sociais e trabalho em equipe!`,
      gif: '/paperlogin/gif-ludicas.gif',
      benefits: ['Raciocínio lógico', 'Coordenação motora', 'Pensamento estratégico'],
      items: [
        { number: '01', name: 'Dona Maria Cesta', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Educativo', type: 'Atividade' },
        { number: '02', name: 'Pegador Olho Completo', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Educativo', type: 'Atividade' },
        { number: '03', name: 'Oculos de Aventura', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Educativo', type: 'Atividade' },
        { number: '04', name: 'O Corvo', difficulty: 'Fácil', ageRange: '5–9 anos', theme: 'Educativo', type: 'Atividade' },
        { number: '05', name: 'Mini Caixoes', difficulty: 'Médio', ageRange: '7–10 anos', theme: 'Educativo', type: 'Atividade' },
        { number: '06', name: 'Moldura de Aranha 3D', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Educativo', type: 'Atividade' }
      ]
    },
    {
      id: '5',
      title: 'Kit Básico Natalino',
      description: 'Kit Básico Natalino — 20 modelos',
      image: '/Natal/BasicoNatal.png',
      pdfUrl: 'https://drive.google.com/drive/folders/1V90nnrd40jXu_IiVobVUmgAHqmMKrH0F?usp=sharing',
      difficulty: 'fácil',
      ageRange: '4-12 anos',
      theme: 'Natal',
      emoji: '🎄',
      fullDescription: `Inclui personagens clássicos, bonequinhos de neve, enfeites e projetos fáceis para começar a brincar imediatamente.
Perfeito para quem deseja introduzir o universo do papercraft com simplicidade e resultados lindos!

💡 Dica: Imprima em papel 120g ou colorido para melhor acabamento!`,
      gif: '/Natal/Gif-Basico.gif',
      benefits: ['Criatividade', 'Coordenação motora', 'Autonomia'],
      items: [
        { number: '01', name: 'Personagens de Natal', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '02', name: 'Combo Bonequinhos de Neve', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '03', name: 'Corrente de Papel Coloridas', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '04', name: 'Globo de Neve 3D para Colorir', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '05', name: 'Coroa de Natal 3D', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Natal', type: 'Papercraft' }
      ]
    },
    {
      id: '6',
      title: 'Kit Completo Natal',
      description: 'Kit Completo Natal — 60+ modelos',
      image: '/Natal/CompletoNatal.png',
      pdfUrl: 'https://drive.google.com/drive/folders/12N4qvr3v1q_5mYSzNdVolSR1C5W8z7SI?usp=sharing',
      difficulty: 'médio',
      ageRange: '4-12 anos',
      theme: 'Natal',
      emoji: '🎅',
      fullDescription: `A experiência natalina completa!
Mais de 60 papercrafts e cenários em 3D, com personagens, casas, vilas e kits especiais para montar um verdadeiro mundo mágico de Natal em papel. Perfeito para quem deseja introduzir o universo do papercraft com simplicidade e resultados lindos!

💡 Dica: Imprima em papel 120g ou colorido para melhor acabamento!`,
      gif: '/Natal/Gif-Completo.gif',
      benefits: ['Imaginação', 'Trabalho em equipe', 'Diversão familiar'],
      items: [
        { number: '01', name: 'Personagens de Natal', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '02', name: 'Combo Bonequinhos de Neve', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '03', name: 'Corrente de Papel Coloridas', difficulty: 'Fácil', ageRange: '4–8 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '04', name: 'Globo de Neve 3D para Colorir', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '05', name: 'Coroa de Natal 3D', difficulty: 'Médio', ageRange: '6–10 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '06', name: 'Avião do Papai Noel', difficulty: 'Médio', ageRange: '6–11 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '07', name: 'Casa do Papai Noel', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '08', name: 'Gorro do Papai Noel 3D', difficulty: 'Fácil', ageRange: '5–10 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '09', name: 'Cenário de Inverno 3D', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '10', name: 'Mini Livro de Natal 3D', difficulty: 'Médio', ageRange: '7–12 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '11', name: 'Globo de Neve 3D (versão 2)', difficulty: 'Médio', ageRange: '6–11 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '12', name: 'Vila de Natal — Casas, Lojas, Igreja e Personagens', difficulty: 'Difícil', ageRange: '8–12 anos', theme: 'Natal', type: 'Papercraft' }
      ]
    },
    {
      id: '7',
      title: 'Bônus Natalinos',
      description: 'Bônus Natalinos — Exclusivos',
      image: '/Natal/BonusNatal.png',
      pdfUrl: 'https://drive.google.com/drive/folders/1mzQtnYYc1itojKpkcq1DyL3AZyDcX5sS?usp=sharing',
      difficulty: 'médio',
      ageRange: '4-12 anos',
      theme: 'Natal',
      emoji: '🎁',
      fullDescription: `Surpresas encantadoras que dão um toque especial ao Natal!
Inclui kits temáticos como o Nascimento de Jesus, brincadeiras educativas e caixas-presente para montar e usar. Perfeito para quem quer mais do que atividades — quer memórias afetivas. 💛🎁`,
      gif: '/Natal/Gif-Bonus.gif',
      benefits: ['Exclusividade', 'Variedade de materiais', 'Encantamento natalino'],
      items: [
        { number: '01', name: 'Nascimento de Jesus (Presépio Papercraft)', difficulty: 'Médio', ageRange: '6–12 anos', theme: 'Natal', type: 'Papercraft' },
        { number: '02', name: 'Trenó do Papai Noel + Atividades de Natal', difficulty: 'Médio', ageRange: '6–12 anos', theme: 'Natal', type: 'Atividade' },
        { number: '03', name: 'Caixa de Presente Bichinhos (Para Colorir / Colorido)', difficulty: 'Fácil', ageRange: '4–10 anos', theme: 'Natal', type: 'Papercraft' }
      ]
    }
  ];

  return (
    <div>
      {selectedProduct ? (
        <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} userPlan={userPlan} />
      ) : (
        <>
          {/* Título e Descrição */}
          <div className="mb-12">
            <div className="relative inline-block mb-6">
              <div className="relative bg-purple-100 border-2 border-purple-600 rounded-2xl px-6 py-3 shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                <div className="absolute top-0 left-0 w-3 h-3 bg-purple-600 rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-purple-600 rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-purple-600 rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-600 rounded-full transform translate-x-1 translate-y-1"></div>

                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-900">
                  👻 Monte, aprenda e decore com os <span className="text-purple-700 font-extrabold">EdukaPapers</span>
                </span>
              </div>
            </div>

            {/* Bloco de boas-vindas */}
            <section aria-label="Aviso de boas-vindas EdukaBoo" className="mx-auto w-full max-w-3xl px-4 mt-6 mb-8">
              <div role="note" className="relative rounded-2xl border border-purple-300 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-all duration-200 px-5 py-4 md:px-6 md:py-5">

                {/* "pinos" nos cantos */}
                <span className="absolute -top-2 -left-2 h-3 w-3 rounded-full bg-purple-500"></span>
                <span className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-purple-500"></span>
                <span className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-purple-500"></span>
                <span className="absolute -bottom-2 -right-2 h-3 w-3 rounded-full bg-purple-500"></span>

                {/* "fitas" levemente inclinadas */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-purple-400/50" style={{ transform: 'rotate(-0.35deg)' }}></div>

                <div className="flex items-start gap-3 md:gap-4">
                  {/* badge de ícone */}
                  <div className="shrink-0">
                    <img src="/PROFILE-AVATAR.png" alt="EdukaBoo Avatar" className="h-10 w-10 rounded-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-purple-900 font-semibold leading-tight">
                      Seja muito bem-vindo! ✨
                    </h3>

                    <p className="mt-1 text-slate-700">
                      Esse projeto foi criado com carinho por <span className="font-bold text-green-600">diversos profissionais parceiros</span> e está sendo atualizado todos os dias.
                    </p>

                    <p className="mt-1 text-slate-700">
                      Se tiver alguma dúvida ou sugestão, estamos aqui para ajudar — é só chamar!
                    </p>

                    <div className="mt-3">
                      <a href="https://wa.me/+556793091209?text=Oii%20pode%20me%20ajudar%20com%20a%20plataforma%20EdukaBoo%3F%20"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 rounded-xl border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-800 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                         aria-label="Fale conosco pelo WhatsApp">
                        <img src="/whats.webp" alt="WhatsApp" className="h-4 w-4" />
                        Falar com a equipe
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Coleção Natal */}
          <div className="mb-16">
            {/* Botão Coleção de Natal */}
            <div className="flex justify-center mb-8">
              <div className="relative inline-block">
                <div className="relative bg-red-100 border-2 border-red-600 rounded-2xl px-6 py-3 shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300 cursor-pointer">
                  <div className="absolute top-0 left-0 w-3 h-3 bg-red-600 rounded-full transform -translate-x-1 -translate-y-1"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full transform translate-x-1 -translate-y-1"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-red-600 rounded-full transform -translate-x-1 translate-y-1"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-600 rounded-full transform translate-x-1 translate-y-1"></div>
                  <span className="text-xl md:text-2xl font-bold text-red-900 relative z-10">
                    Coleção de Natal
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de Produtos Natal */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
              {products.filter(p => p.theme === 'Natal').map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  userPlan={userPlan}
                  onDetailsClick={() => setSelectedProduct(product)}
                  onUpsellClick={onUpsellClick}
                />
              ))}
            </div>
          </div>

          {/* Coleção Halloween */}
          <div className="mb-16">
            {/* Botão Coleção Halloween */}
            <div className="flex justify-center mb-8">
              <div className="relative inline-block">
                <div className="relative bg-purple-100 border-2 border-purple-600 rounded-2xl px-6 py-3 shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300 cursor-pointer">
                  <div className="absolute top-0 left-0 w-3 h-3 bg-purple-600 rounded-full transform -translate-x-1 -translate-y-1"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-purple-600 rounded-full transform translate-x-1 -translate-y-1"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-purple-600 rounded-full transform -translate-x-1 translate-y-1"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-600 rounded-full transform translate-x-1 translate-y-1"></div>
                  <span className="text-xl md:text-2xl font-bold text-purple-900 relative z-10">
                    Coleção Halloween
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de Produtos Halloween */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
              {products.filter(p => p.theme !== 'Natal').map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  userPlan={userPlan}
                  onDetailsClick={() => setSelectedProduct(product)}
                  onUpsellClick={onUpsellClick}
                />
              ))}
            </div>
          </div>

          {/* Banner com link */}
          <div className="mt-12">
            <a href="https://www.ggcheckout.com/checkout/v2/hBUh7oMIyxUmWHEBM9Cm"
               target="_blank"
               rel="noopener noreferrer"
               className="block rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <img src="/2Banners-Area-Inicio.webp" alt="Banner EdukaBoo" className="w-full h-auto" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
