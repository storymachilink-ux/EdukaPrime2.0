import React, { useState } from 'react';
import { Download, Eye } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  ageRange: string;
  description: string;
  image: string;
  category: 'Português' | 'Matemática' | 'Leitura Inicial' | 'Literatura';
  niche: string;
}

export const Atividades: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('Todos');

  const colorPalette = [
    '#156EF6', // Azul
    '#24D200', // Verde
    '#FC6800', // Laranja
    '#8F10F6', // Roxo
    '#E11D48', // Carmim
    '#0EA5E9', // Ciano
    '#F59E0B', // Âmbar
    '#10B981', // Verde-água
  ];

  const materials: Material[] = [
    {
      id: '1',
      title: 'Atividades de Fonética – Caderno N1, N2 e N3',
      ageRange: '4 a 6 anos (Pré-escola e início do 1º ano)',
      description: 'Atividades de fonética desenvolvidas para estimular a consciência sonora e facilitar o processo de leitura. As crianças aprendem a reconhecer, diferenciar e combinar sons das palavras de forma divertida e prática.',
      image: '/fonetica.jpg',
      category: 'Leitura Inicial',
      niche: 'Fonética'
    },
    {
      id: '2',
      title: 'Método Numérico Infantil – Matemática Inicial',
      ageRange: '4 a 6 anos (Pré-escola e início do 1º ano)',
      description: 'Atividades de matemática com método lúdico e infantil, voltadas para o início do conhecimento com números, noções de quantidade, contagem e primeiras somas. Um material simples e divertido para introduzir a matemática na vida das crianças.',
      image: '/numerico.jpg',
      category: 'Matemática',
      niche: 'Método Numérico Infantil'
    },
    {
      id: '3',
      title: 'Atividades de Ortografia',
      ageRange: '7 a 11 anos (2º ao 5º ano)',
      description: 'Mais de 600 atividades de ortografia, todas com gabarito. Elaboradas para fortalecer a escrita correta e ampliar o vocabulário, ajudando as crianças a identificar erros, completar palavras e aplicar regras ortográficas de forma divertida.',
      image: '/ortografia.jpg',
      category: 'Português',
      niche: 'Ortografia'
    },
    {
      id: '4',
      title: 'Atividades de Gramática',
      ageRange: '7 a 10 anos (2º ao 5º ano)',
      description: 'Mais de 600 atividades de gramática prontas para imprimir, organizadas de forma prática e com gabarito no final. Trabalham regras básicas de concordância, uso de pontuação e construção de frases, reforçando o aprendizado da língua portuguesa.',
      image: '/gramatica.jpg',
      category: 'Português',
      niche: 'Gramática'
    },
    {
      id: '5',
      title: 'Atividades de Interpretação de Texto',
      ageRange: '7 a 12 anos (2º ao 6º ano)',
      description: 'Mais de 600 atividades de interpretação de texto com gabarito incluso. Desenvolvidas para aprimorar a compreensão leitora, identificação de ideias principais e inferências, tudo de forma prática e organizada.',
      image: '/interpretacao.jpg',
      category: 'Português',
      niche: 'Interpretação de Texto'
    },
    {
      id: '6',
      title: 'Atividades de Gênero Textual',
      ageRange: '8 a 12 anos (3º ao 6º ano)',
      description: 'Acervo completo com mais de 700 atividades de gêneros textuais, com gabarito. Trabalha diferentes tipos de produção e análise de textos (narrativos, descritivos, argumentativos, poéticos), organizados de forma prática e eficiente.',
      image: '/genero.jpg',
      category: 'Português',
      niche: 'Gênero Textual'
    },
    {
      id: '7',
      title: 'Coletânea de Textos Literários',
      ageRange: '9 a 12 anos (4º ao 6º ano)',
      description: 'Material completo com atividades e leituras literárias voltadas para desenvolver a interpretação, apreciação e análise de textos. Trabalha diferentes gêneros literários de forma prática, organizada e acompanhada de gabarito, ajudando no desenvolvimento da leitura crítica e criativa.',
      image: '/literario.jpg',
      category: 'Literatura',
      niche: 'Textos Literários'
    }
  ];

  const getRandomColor = (index: number) => {
    return colorPalette[index % colorPalette.length];
  };

  const filters = ['Todos', 'Português', 'Matemática', 'Leitura Inicial', 'Literatura'];

  const filteredMaterials = activeFilter === 'Todos'
    ? materials
    : materials.filter(material => material.category === activeFilter);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#033258] mb-4">
          Acervo de atividades
        </h1>
        <p className="text-lg text-[#476178]">
          Explore nossa biblioteca de atividades educacionais
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24] ${
              activeFilter === filter
                ? 'bg-[#FFE3A0] text-[#033258] shadow-lg border border-[#F59E0B]'
                : 'bg-white text-[#033258] hover:bg-[#FFF3D6] border border-[#FFE3A0]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMaterials.map((material, index) => {
          const borderColor = getRandomColor(index);

          return (
            <div
              key={material.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-[#FFE3A0] p-6"
              style={{ borderTop: `4px solid ${borderColor}` }}
            >
              {/* Top Badge */}
              <div className="mb-4">
                <div className="inline-block">
                  <span
                    className="px-3 py-1 text-xs font-medium rounded-xl text-white"
                    style={{ backgroundColor: borderColor }}
                  >
                    {material.ageRange}
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="mb-4">
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <img
                    src={material.image}
                    alt={material.title}
                    className="w-full h-full object-fit transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-[#033258] mb-3 leading-tight">
                  {material.title}
                </h3>

                <p className="text-sm text-[#476178] mb-6 leading-relaxed">
                  {material.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#FBBF24]"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Agora
                  </button>

                  <button className="px-4 py-3 border border-[#FFE3A0] bg-white text-[#033258] hover:bg-[#FFF3D6] rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24]">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};