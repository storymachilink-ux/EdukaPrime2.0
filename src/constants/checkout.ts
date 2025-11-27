/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔗 LINKS DE CHECKOUT - CONFIGURAÇÃO CENTRALIZADA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ IMPORTANTE: Este arquivo centraliza TODOS os links de checkout dos planos.
 *
 * 📍 Ao atualizar os links aqui, eles serão aplicados AUTOMATICAMENTE em:
 *    ✅ Landing Page (seção de planos)
 *    ✅ Área interna - Página de Planos (/planos)
 *    ✅ Modal de Upgrade (quando usuário tenta acessar conteúdo bloqueado)
 *    ✅ Todos os botões de "Assinar", "Fazer Upgrade", "Premium", etc.
 *
 * 🔄 COMO ATUALIZAR:
 *    1. Atualize os URLs abaixo com os novos links do checkout
 *    2. Salve o arquivo
 *    3. Pronto! Todos os botões estarão atualizados automaticamente
 *
 * 📅 Última atualização: 02/10/2025
 * 🔗 Sistema de checkout: GGCheckout
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CHECKOUT_LINKS = {
  essencial: 'https://checkout.edukaprime.com.br/VCCL1O8SCCGM',
  evoluir: 'https://checkout.edukaprime.com.br/VCCL1O8SCCGO',
  prime: 'https://checkout.edukaprime.com.br/VCCL1O8SCCGP',
} as const;

// Plan information for upgrade modal
export const PLAN_INFO = {
  essencial: {
    name: 'Plano Essencial',
    price: 'R$ 17,99/mês',
    features: [
      {
        name: 'Atividades Iniciais',
        description: 'Leitura e Matemática para os primeiros passos da aprendizagem.',
        included: true
      },
      {
        name: 'Atendimento WhatsApp',
        description: 'Tire dúvidas educacionais de forma rápida e direta.',
        included: true
      },
      {
        name: 'Bônus Exclusivos',
        description: 'Jogos interativos e guia completo para planejamento de aulas.',
        included: false
      },
      {
        name: 'Acervo Completo',
        description: 'Mais de 8.000 atividades alinhadas à BNCC, todas com gabarito.',
        included: false
      },
      {
        name: 'Vídeos Educacionais',
        description: 'Conteúdos práticos com atividades interativas para aplicar de imediato.',
        included: false
      },
      {
        name: 'Suporte VIP',
        description: 'Solicite novas atividades na hora e receba personalizadas.',
        included: false
      },
    ],
    popular: false,
  },
  evoluir: {
    name: 'Plano Evoluir',
    price: 'R$ 27,99/mês',
    features: [
      {
        name: 'Atividades Iniciais',
        description: 'Leitura e Matemática para os primeiros passos da aprendizagem.',
        included: true
      },
      {
        name: 'Atendimento WhatsApp',
        description: 'Tire dúvidas educacionais de forma rápida e direta.',
        included: true
      },
      {
        name: 'Bônus Exclusivos',
        description: 'Jogos interativos e guia completo para planejamento de aulas.',
        included: true
      },
      {
        name: 'Acervo Completo',
        description: 'Mais de 8.000 atividades alinhadas à BNCC, todas com gabarito.',
        included: true
      },
      {
        name: 'Vídeos Educacionais',
        description: 'Conteúdos práticos com atividades interativas para aplicar de imediato.',
        included: true
      },
      {
        name: 'Suporte VIP',
        description: 'Solicite novas atividades na hora e receba personalizadas.',
        included: false
      },
    ],
    popular: true,
  },
  prime: {
    name: 'Plano Prime',
    price: 'R$ 49,99/mês',
    features: [
      {
        name: 'Atividades Iniciais',
        description: 'Leitura e Matemática para os primeiros passos da aprendizagem.',
        included: true
      },
      {
        name: 'Atendimento WhatsApp',
        description: 'Tire dúvidas educacionais de forma rápida e direta.',
        included: true
      },
      {
        name: 'Bônus Exclusivos',
        description: 'Jogos interativos e guia completo para planejamento de aulas.',
        included: true
      },
      {
        name: 'Acervo Completo',
        description: 'Mais de 8.000 atividades alinhadas à BNCC, todas com gabarito.',
        included: true
      },
      {
        name: 'Vídeos Educacionais',
        description: 'Conteúdos práticos com atividades interativas para aplicar de imediato.',
        included: true
      },
      {
        name: 'Suporte VIP',
        description: 'Solicite novas atividades na hora e receba personalizadas.',
        included: true
      },
    ],
    popular: false,
  },
} as const;