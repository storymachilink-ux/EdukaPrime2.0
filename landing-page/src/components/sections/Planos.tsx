import React from 'react';
import { CheckCircle2, Pencil, Star, Sparkles } from 'lucide-react';
import { CreativePricing, type PricingTier } from '../ui/creative-pricing';
import AnimatedBorderCard from '../ui/animated-border-card';
import { CHECKOUT_LINKS } from '../../constants/checkout';
import { usePixelTracking } from '../../hooks/usePixelTracking';

export const Planos: React.FC = () => {
  const { trackCheckoutOpen } = usePixelTracking();

  const handleCheckoutClick = (planName: string, price: string, checkoutUrl: string) => {
    // Rastrear no pixel Utmify
    const priceNum = parseFloat(price.replace('R$ ', '').replace('/mês', '').replace(',', '.'));
    trackCheckoutOpen(planName, isNaN(priceNum) ? undefined : priceNum);

    // Build URL with UTM parameters
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || 'organic';
    const utm_medium = params.get('utm_medium') || 'landing-page';
    const utm_campaign = params.get('utm_campaign') || planName.toLowerCase();
    const utm_content = params.get('utm_content') || 'planos-section';
    const utm_term = params.get('utm_term') || '';

    const urlWithUtm = `${checkoutUrl}?utm_source=${utm_source}&utm_medium=${utm_medium}&utm_campaign=${utm_campaign}&utm_content=${utm_content}&utm_term=${utm_term}`;
    window.location.href = urlWithUtm;
  };

  const tiers: PricingTier[] = [
    {
      name: 'Plano Essencial',
      icon: <Pencil className="w-6 h-6" />,
      priceLabel: 'R$ 17,99/mês',
      features: [
        '+ Atividades Iniciais — Leitura e Matemática para os primeiros passos da aprendizagem.',
        '+ Atendimento WhatsApp — Tire dúvidas educacionais de forma rápida e direta.',
        '- Bônus Exclusivos — Jogos interativos e guia completo para planejamento de aulas.',
        '- Acervo Completo — Mais de 8.000 atividades alinhadas à BNCC, todas com gabarito.',
        '- Vídeos Educacionais — Conteúdos práticos com atividades interativas para aplicar de imediato.',
        '- Suporte VIP — Solicite novas atividades na hora e receba personalizadas.'
      ],
      color: 'amber',
      onSubscribe: () => {
        handleCheckoutClick('Plano Essencial', 'R$ 17,99/mês', CHECKOUT_LINKS.essencial);
      },
    },
    {
      name: 'Plano Evoluir',
      icon: <Star className="w-6 h-6" />,
      priceLabel: 'R$ 27,99/mês',
      features: [
        '+ Atividades Iniciais — Leitura e Matemática para os primeiros passos da aprendizagem.',
        '+ Atendimento WhatsApp — Tire dúvidas educacionais de forma rápida e direta.',
        '+ Bônus Exclusivos — Jogos interativos e guia completo para planejamento de aulas.',
        '+ Acervo Completo — Mais de 8.000 atividades alinhadas à BNCC, todas com gabarito.',
        '+ Vídeos Educacionais — Conteúdos práticos com atividades interativas para aplicar de imediato.',
        '- Suporte VIP — Solicite novas atividades na hora e receba personalizadas.'
      ],
      popular: true,
      color: 'blue',
      onSubscribe: () => {
        handleCheckoutClick('Plano Evoluir', 'R$ 27,99/mês', CHECKOUT_LINKS.evoluir);
      },
    },
    {
      name: 'Plano Prime',
      icon: <Sparkles className="w-6 h-6" />,
      priceLabel: 'R$ 49,99/mês',
      features: [
        '+ Atividades Iniciais — Leitura e Matemática para os primeiros passos da aprendizagem.',
        '+ Atendimento WhatsApp — Tire dúvidas educacionais de forma rápida e direta.',
        '+ Bônus Exclusivos — Jogos interativos e guia completo para planejamento de aulas.',
        '+ Acervo Completo — Mais de 8.000 atividades alinhadas à BNCC, todas com gabarito.',
        '+ Vídeos Educacionais — Conteúdos práticos com atividades interativas para aplicar de imediato.',
        '👑 Suporte VIP — Solicite novas atividades na hora e receba personalizadas.'
      ],
      color: 'purple',
      onSubscribe: () => {
        handleCheckoutClick('Plano Prime', 'R$ 49,99/mês', CHECKOUT_LINKS.prime);
      },
    }
  ];

  return (
    <section id="planos" className="py-16 md:py-24 bg-[#F8FBFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
              <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#9A6A00] relative z-10">
                Escolha o plano ideal para você
              </span>
            </div>
          </div>
          <p className="text-lg text-body max-w-2xl mx-auto">
            Transforme sua prática docente com o plano que mais se adapta às suas necessidades
          </p>
        </div>

        {/* Plans Grid */}
        <CreativePricing
          title=""
          description=""
          tiers={tiers}
        />

        {/* Como Funciona Section */}
        <div className="bg-[#F1F6FF] rounded-[24px] p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-4">
              Como Funciona
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Escolha seu Plano', description: 'Ative agora o acesso completo e aproveite todos os benefícios da plataforma.' },
              { step: '2', title: 'Faça Login', description: 'Converse com outros membros, compartilhe experiências e tenha acesso a todos os recursos exclusivos.' },
              { step: '3', title: 'Mais de 8.000 atividades prontas', description: 'Tudo separado por área, para o seu nível e prontas para usar quando quiser.' }
            ].map((item, index) => (
              <AnimatedBorderCard key={index}>
                <div className="text-center">
                  <div className="mx-auto mb-3 grid place-items-center w-10 h-10 rounded-full bg-[#F1F6FF] text-ink font-bold">
                    {item.step}
                  </div>
                  <div className="mb-4">
                    <img
                      src={`/0${item.step}.jpg`}
                      alt={`Passo ${item.step}`}
                      className="mx-auto w-auto h-40 border-2 border-[#FFE3A0] rounded-xl"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-ink mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-body">
                    {item.description}
                  </p>
                </div>
              </AnimatedBorderCard>
            ))}
          </div>

          {/* Botão CTA - Quero ter acesso */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                const primeCard = document.getElementById('plano-prime');
                if (primeCard) {
                  primeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="relative inline-block"
            >
              <div className="relative bg-[#D6FFE3] border-2 border-[#81C784] rounded-2xl px-8 py-4 shadow-lg transform rotate-[-1deg] hover:rotate-0 hover:scale-105 transition-all duration-300">
                {/* Bolinhas nos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#2E7D32] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#2E7D32] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#2E7D32] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#2E7D32] rounded-full transform translate-x-1 translate-y-1"></div>

                {/* Texto do botão */}
                <span className="text-2xl md:text-3xl font-bold text-[#2E7D32] relative z-10 flex items-center gap-2 justify-center">
                  Quero ter acesso
                  <img src="/cursor.png" alt="" className="w-7 h-7 inline-block" />
                </span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Guarantee Section */}
        <div className="bg-[#F1F6FF] rounded-[24px] p-8">
          {/* Post-it Title */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="relative bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                {/* Detalhes dos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>
                
                {/* Texto destacado */}
                <span className="text-2xl md:text-3xl font-bold text-[#9A6A00] relative z-10">
                  Risco ZERO para você! ✅
                </span>
              </div>
            </div>
          </div>
          
          {/* Guarantee Image */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <img
                src="/garantia.png"
                alt="30 dias de garantia - Ou seu dinheiro de volta - Acesso à plataforma com atividades atualizadas - Suporte especializado"
                className="w-full max-w-2xl mx-auto rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </div>
          </div>
          
          {/* Guarantee Text */}
          <div className="max-w-4xl mx-auto mt-8">
            <p className="text-lg text-[#4A5568] leading-relaxed text-center">
              Confiamos tanto na qualidade do Kit de Atividades EdukaPrime que oferecemos uma garantia estendida de 30 dias. Se dentro desse período você não ficar satisfeita com o material ou sentir que ele não ajudou sua rotina em sala de aula, devolvemos 100% do seu dinheiro. Compre com tranquilidade e descubra como nossas atividades podem transformar sua prática pedagógica!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};