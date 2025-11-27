import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Check, Crown, Zap, Star, ArrowRight, Calendar, AlertCircle, X } from 'lucide-react';
import { PostItTitle } from '../components/ui/PostItTitle';
import { isPlanExpired, getDaysUntilExpiration } from '../lib/userPlanManager';
import { CHECKOUT_LINKS } from '../constants/checkout';
import { AreaBanner } from '../components/AreaBanner';
import { usePixelTracking } from '../hooks/usePixelTracking';
import { planService } from '../lib/planService';
import { useEffect, useState } from 'react';

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  id: number;
  name: string;
  icon: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  checkoutUrl?: string;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 0,
    name: 'Gratuito',
    icon: '📚',
    price: 'R$ 0',
    period: 'para sempre',
    description: 'Acesso limitado para conhecer a plataforma',
    features: [
      { text: 'Atividades Iniciais - Leitura e Matemática', included: false },
      { text: 'Atendimento WhatsApp', included: false },
      { text: 'Bônus Exclusivos - Jogos e Guias', included: false },
      { text: 'Acervo Completo (+8.000 atividades BNCC)', included: false },
      { text: 'Vídeos Educacionais', included: false },
      { text: 'Suporte VIP - Atividades personalizadas', included: false },
    ],
  },
  {
    id: 1,
    name: 'Essencial',
    icon: '⭐',
    price: 'R$ 17,99',
    period: '/mês',
    description: 'Atividades Iniciais - Leitura e Matemática para os primeiros passos da aprendizagem',
    checkoutUrl: CHECKOUT_LINKS.essencial,
    features: [
      { text: 'Atividades Iniciais - Leitura e Matemática', included: true, highlight: true },
      { text: 'Atendimento WhatsApp', included: true, highlight: true },
      { text: 'Bônus Exclusivos - Jogos e Guias', included: true },
      { text: 'Acervo Completo (+8.000 atividades BNCC)', included: false },
      { text: 'Vídeos Educacionais', included: false },
      { text: 'Suporte VIP - Atividades personalizadas', included: false },
    ],
  },
  {
    id: 2,
    name: 'Evoluir',
    icon: '🚀',
    price: 'R$ 27,99',
    period: '/mês',
    description: 'Acervo Completo com mais de 8.000 atividades alinhadas à BNCC, todas com gabarito',
    checkoutUrl: CHECKOUT_LINKS.evoluir,
    popular: true,
    badge: 'Mais Popular',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    features: [
      { text: 'Atividades Iniciais - Leitura e Matemática', included: true, highlight: true },
      { text: 'Atendimento WhatsApp', included: true, highlight: true },
      { text: 'Bônus Exclusivos - Jogos e Guias', included: true, highlight: true },
      { text: 'Acervo Completo (+8.000 atividades BNCC)', included: true, highlight: true },
      { text: 'Vídeos Educacionais', included: true, highlight: true },
      { text: 'Suporte VIP - Atividades personalizadas', included: false },
    ],
  },
  {
    id: 3,
    name: 'Prime',
    icon: '👑',
    price: 'R$ 49,99',
    period: '/mês',
    description: 'Experiência completa com Suporte VIP - Solicite atividades personalizadas na hora',
    checkoutUrl: CHECKOUT_LINKS.prime,
    badge: 'Premium',
    badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    features: [
      { text: 'Atividades Iniciais - Leitura e Matemática', included: true, highlight: true },
      { text: 'Atendimento WhatsApp', included: true, highlight: true },
      { text: 'Bônus Exclusivos - Jogos e Guias', included: true, highlight: true },
      { text: 'Acervo Completo (+8.000 atividades BNCC)', included: true, highlight: true },
      { text: 'Vídeos Educacionais', included: true, highlight: true },
      { text: 'Suporte VIP - Atividades personalizadas', included: true, highlight: true },
    ],
  },
];

export default function Planos() {
  const { profile } = useAuth();
  const { trackCheckoutOpen } = usePixelTracking();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // Carregar todos os planos (para poder pegar os nomes pelo ID)
      const allPlansData = await planService.getAllPlans();
      setAllPlans(allPlansData);

      // Carregar subscriptions do usuário
      if (profile?.id) {
        const subs = await planService.getUserActiveSubscriptions(profile.id);
        setSubscriptions(subs);
      }
    };
    loadData();
  }, [profile?.id]);

  // Separar plano mensal (principal) de adicionais
  const monthlyPlan = subscriptions.find(sub => sub.payment_type === 'mensal');
  const additionalPlans = subscriptions.filter(sub => sub.payment_type === 'unico');

  const currentPlan = monthlyPlan?.plan_id || 0;
  const expirationDate = monthlyPlan?.end_date;

  const isExpired = expirationDate ? isPlanExpired(expirationDate) : false;
  const daysUntilExpiration = expirationDate ? getDaysUntilExpiration(expirationDate) : null;

  const handleUpgrade = (checkoutUrl: string, planName: string, price?: string) => {
    // Rastrear no pixel Utmify
    trackCheckoutOpen(planName, price ? parseFloat(price.replace('R$ ', '').replace(',', '.')) : undefined);

    // Build URL with UTM parameters
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || 'organic';
    const utm_medium = params.get('utm_medium') || 'planos';
    const utm_campaign = params.get('utm_campaign') || planName.toLowerCase();
    const utm_content = params.get('utm_content') || 'upgrade';
    const utm_term = params.get('utm_term') || '';

    const urlWithUtm = `${checkoutUrl}?utm_source=${utm_source}&utm_medium=${utm_medium}&utm_campaign=${utm_campaign}&utm_content=${utm_content}&utm_term=${utm_term}`;

    // Navegar para checkout na página atual
    window.location.href = urlWithUtm;
  };

  const getPlanName = (planId: number) => {
    // Primeiro tenta nos planos carregados do banco
    const loadedPlan = allPlans.find(p => p.id === planId);
    if (loadedPlan) {
      return loadedPlan.display_name || loadedPlan.name;
    }
    // Fallback para array hardcoded (para os planos padrão)
    return plans.find(p => p.id === planId)?.name || `Plano #${planId}`;
  };

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#F8FBFF] min-h-screen">
        <PostItTitle
          title="Planos e Assinaturas"
          description="Escolha o plano ideal para sua jornada pedagógica"
        />

        {/* Alert de Plano Atual */}
        <div className="mb-8">
          <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-6">
            {/* Plano Principal (Mensal) */}
            <div className="flex items-start gap-4">
              <div className="text-4xl">{plans.find(p => p.id === currentPlan)?.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-[#0F2741]">
                    📅 Plano Atual: {getPlanName(currentPlan)}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                    Mensal
                  </span>
                </div>

                {expirationDate && (
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                      {isExpired
                        ? `⚠️ Expirado há ${Math.abs(daysUntilExpiration || 0)} dias`
                        : `Expira: ${new Date(expirationDate).toLocaleDateString('pt-BR')}`
                      }
                    </span>
                  </div>
                )}

                {isExpired && (
                  <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                      Seu plano expirou! Renove agora para continuar acessando todos os recursos.
                    </p>
                  </div>
                )}
                {!isExpired && daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0 && (
                  <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700">
                      Seu plano expira em breve! Renove para não perder o acesso.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Planos Adicionais (Pagamento Único) - Minimalista */}
            {additionalPlans.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">🎁 Planos Adicionais</h4>
                <div className="space-y-2">
                  {additionalPlans.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <span className="text-sm font-medium text-gray-700">{getPlanName(sub.plan_id)}</span>
                      </div>
                      {sub.end_date && (
                        <div className="text-xs text-gray-500">
                          Até {new Date(sub.end_date).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const isCurrent = currentPlan === plan.id;
            const canUpgrade = currentPlan < plan.id;
            const rotations = ['-1deg', '1deg', '-1.5deg', '0.5deg'];
            const rotation = rotations[index % 4];

            return (
              <div
                key={plan.id}
                className="relative group transition-all duration-300"
                style={{
                  transform: `rotate(${rotation})`,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Moldura sketch */}
                <div className={`absolute inset-0 bg-white rounded-xl transition-all duration-300 ${
                  plan.popular
                    ? 'border-4 border-purple-500 shadow-[6px_6px_0px_0px] shadow-purple-500 group-hover:shadow-[10px_10px_0px_0px]'
                    : 'border-2 border-[#0F2741] shadow-[4px_4px_0px_0px] shadow-[#0F2741] group-hover:shadow-[8px_8px_0px_0px]'
                } group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]`} />

                {/* Badge */}
                {plan.badge && (
                  <div
                    className={`absolute -top-3 -right-3 px-3 py-1 rounded-full rotate-12 text-sm border-2 border-[#0F2741] z-30 font-bold shadow-md text-white ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Badge "Plano Atual" */}
                {isCurrent && (
                  <div className="absolute -top-3 -left-3 px-3 py-1 rounded-full -rotate-12 text-sm border-2 border-[#0F2741] z-30 font-bold shadow-md bg-green-400 text-[#0F2741]">
                    Seu Plano
                  </div>
                )}

                <div className="relative p-6 rounded-xl">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">{plan.icon}</div>
                    <h3 className="text-2xl font-bold text-[#0F2741] mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-[#0F2741]">{plan.price}</span>
                      <span className="text-gray-600 text-sm ml-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 ${feature.highlight ? 'font-semibold' : ''}`}
                      >
                        {feature.included ? (
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            feature.highlight ? 'text-green-600' : 'text-green-500'
                          }`} />
                        ) : (
                          <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                            <span className="text-gray-300">✕</span>
                          </div>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  {plan.id === 0 ? (
                    <div className="text-center">
                      <div className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold border-2 border-gray-300">
                        Plano Gratuito
                      </div>
                    </div>
                  ) : isCurrent ? (
                    <div className="text-center">
                      <div className="px-4 py-3 bg-green-100 text-green-700 rounded-xl font-semibold border-2 border-green-300">
                        ✓ Plano Ativo
                      </div>
                    </div>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => plan.checkoutUrl && handleUpgrade(plan.checkoutUrl, plan.name, plan.price)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 border-2 border-[#0F2741]"
                    >
                      <Zap className="w-5 h-5" />
                      Fazer Upgrade
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold border-2 border-gray-300">
                        Plano Inferior
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ ou Info Adicional */}
        <div className="mt-12 bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-[#0F2741] mb-4 text-center">
            💡 Dúvidas sobre os planos?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <p className="font-semibold mb-2">📅 Posso cancelar a qualquer momento?</p>
              <p className="text-gray-600">Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">🔄 Posso fazer upgrade do meu plano?</p>
              <p className="text-gray-600">Claro! Você pode fazer upgrade a qualquer momento e aproveitar mais recursos.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">💳 Quais formas de pagamento aceitas?</p>
              <p className="text-gray-600">Aceitamos cartão de crédito, PIX e boleto bancário através do nosso checkout seguro.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">🎓 Recebo certificado?</p>
              <p className="text-gray-600">Assinantes do plano Prime recebem certificados de conclusão das atividades.</p>
            </div>
          </div>
        </div>

        {/* Banner Rodapé */}
        <AreaBanner area="planos_rodape" />
      </div>
    </DashboardLayout>
  );
}
