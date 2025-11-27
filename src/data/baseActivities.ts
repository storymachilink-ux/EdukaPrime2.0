// Atividades base do sistema - estrutura fixa, links editáveis via admin
export interface BaseActivity {
  id: string; // ID único para identificar nas configurações
  title: string;
  age_range: string;
  description: string;
  image: string;
  category: string;
  niche: string;
  available_for_plans: number[]; // 1=Essencial, 2=Evoluir, 3=Prime
  default_drive_url: string; // Link padrão (fallback)
  order: number; // Ordem de exibição
}

export const BASE_ACTIVITIES: BaseActivity[] = [
  {
    id: 'atividades-fonetica',
    title: 'Atividades Fonéticas',
    age_range: '4-7 anos',
    description: 'Atividades completas para desenvolvimento da consciência fonológica e primeiros passos na leitura.',
    image: '/atividades/fonetica.webp',
    category: 'Leitura e Escrita',
    niche: 'Alfabetização',
    available_for_plans: [1, 2, 3], // Todos os planos
    default_drive_url: 'https://drive.google.com/drive/folders/1jPO2rcf0JTExMV3ygEmD00LaSrl64Vyn?usp=sharing',
    order: 1
  },
  {
    id: 'metodo-numerico-infantil',
    title: 'Método Numérico Infantil – Matemática Inicial',
    age_range: '4-8 anos',
    description: 'Método completo para ensinar conceitos matemáticos básicos de forma lúdica e eficaz.',
    image: '/atividades/matematica.webp',
    category: 'Matemática',
    niche: 'Números e Operações',
    available_for_plans: [1, 2, 3], // Todos os planos
    default_drive_url: 'https://drive.google.com/drive/folders/1cJyhpEAGsS188IKnqI8k5BDN4knSUEu-?usp=sharing',
    order: 2
  },
  {
    id: 'atividades-ortografia',
    title: 'Atividades de Ortografia',
    age_range: '6-10 anos',
    description: 'Exercícios práticos para desenvolvimento da escrita correta e regras ortográficas.',
    image: '/atividades/ortografia.webp',
    category: 'Leitura e Escrita',
    niche: 'Ortografia',
    available_for_plans: [1, 2, 3], // Todos os planos
    default_drive_url: 'https://drive.google.com/file/d/15JzN0qH0c0mluXlHI7nfoSdwwfFx6wVD/view?usp=sharing',
    order: 3
  },
  {
    id: 'atividades-gramatica',
    title: 'Atividades de Gramática',
    age_range: '7-12 anos',
    description: 'Exercícios completos para ensino de gramática de forma contextualizada e prática.',
    image: '/atividades/gramatica.webp',
    category: 'Leitura e Escrita',
    niche: 'Gramática',
    available_for_plans: [2, 3], // Evoluir e Prime
    default_drive_url: 'https://drive.google.com/file/d/1y9l1oK1xB-lowpqs053ahdRhwmJSdiYj/view?usp=sharing',
    order: 4
  },
  {
    id: 'atividades-interpretacao',
    title: 'Atividades de Interpretação de Texto',
    age_range: '6-12 anos',
    description: 'Atividades diversificadas para desenvolvimento da compreensão leitora e interpretação textual.',
    image: '/atividades/interpretacao.webp',
    category: 'Leitura e Escrita',
    niche: 'Interpretação',
    available_for_plans: [2, 3], // Evoluir e Prime
    default_drive_url: 'https://drive.google.com/file/d/1XVjvHgbAGh1z6kqSmdUUEgAY-xh0rdhu/view?usp=sharing',
    order: 5
  },
  {
    id: 'atividades-genero-textual',
    title: 'Atividades de Gênero Textual',
    age_range: '8-12 anos',
    description: 'Explorando diferentes gêneros textuais para ampliar o repertório e conhecimento dos alunos.',
    image: '/atividades/genero-textual.webp',
    category: 'Leitura e Escrita',
    niche: 'Gêneros Textuais',
    available_for_plans: [2, 3], // Evoluir e Prime
    default_drive_url: 'https://drive.google.com/file/d/1GooGfBmTNVbWz59KvR35HXLWxcYcjng1/view?usp=sharing',
    order: 6
  },
  {
    id: 'coletanea-textos-literarios',
    title: 'Coletânea de Textos Literários',
    age_range: '6-14 anos',
    description: 'Seleção cuidadosa de textos literários para despertar o amor pela leitura e literatura.',
    image: '/atividades/literatura.webp',
    category: 'Literatura',
    niche: 'Textos Literários',
    available_for_plans: [3], // Apenas Prime
    default_drive_url: 'https://drive.google.com/file/d/1nJ-gqn6vL_mj6y7znaMu2bfgbIba5Z5A/view?usp=sharing',
    order: 7
  }
];

// Helper para buscar atividade base por ID
export const getBaseActivityById = (id: string): BaseActivity | undefined => {
  return BASE_ACTIVITIES.find(activity => activity.id === id);
};

// Helper para obter todas as atividades base ordenadas
export const getOrderedBaseActivities = (): BaseActivity[] => {
  return [...BASE_ACTIVITIES].sort((a, b) => a.order - b.order);
};