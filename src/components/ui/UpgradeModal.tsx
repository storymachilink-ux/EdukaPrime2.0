import React from 'react';
import { X, Check, Crown, Star, Pencil } from 'lucide-react';
import { CHECKOUT_LINKS, PLAN_INFO } from '../../constants/checkout';
import { usePermissions } from '../../hooks/usePermissions';
import { usePixelTracking } from '../../hooks/usePixelTracking';
import { trackInitiateCheckout } from '../../lib/tiktokTracker';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  title?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature = '',
  title = 'Upgrade necessário'
}) => {
  const { currentPlan, getUpgradeMessage, getRequiredPlan } = usePermissions();
  const { trackCheckoutOpen } = usePixelTracking();

  if (!isOpen) return null;

  const handleCheckoutClick = (planKey: string) => {
    const plan = PLAN_INFO[planKey as keyof typeof PLAN_INFO];
    const price = plan.price.replace('R$ ', '').replace(',', '.');
    const numPrice = parseFloat(price);

    // Rastrear em ambos os pixels: Utmify e TikTok
    trackCheckoutOpen(plan.name, numPrice);

    trackInitiateCheckout([
      {
        content_id: planKey,
        content_type: 'product',
        content_name: plan.name
      }
    ], numPrice, 'BRL');

    // Build URL with UTM parameters
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || 'organic';
    const utm_medium = params.get('utm_medium') || 'modal';
    const utm_campaign = params.get('utm_campaign') || planKey;
    const utm_content = params.get('utm_content') || 'upgrade-modal';
    const utm_term = params.get('utm_term') || '';

    const checkoutUrl = CHECKOUT_LINKS[planKey as keyof typeof CHECKOUT_LINKS];
    const urlWithUtm = `${checkoutUrl}?utm_source=${utm_source}&utm_medium=${utm_medium}&utm_campaign=${utm_campaign}&utm_content=${utm_content}&utm_term=${utm_term}`;

    // Abrir checkout em nova aba
    window.open(urlWithUtm, '_blank');
  };

  const requiredPlan = getRequiredPlan(feature);
  const upgradeMessage = getUpgradeMessage(feature);

  // Filter plans to show only upgrades available
  const availablePlans = () => {
    if (currentPlan === 'essencial') {
      return feature === 'vipSupport'
        ? ['prime'] // For VIP Support, only show Prime
        : ['evoluir', 'prime']; // For other features, show both upgrades
    }
    if (currentPlan === 'evoluir') {
      return ['prime']; // Only Prime upgrade available
    }
    return []; // Prime users shouldn't see this modal
  };

  const plans = availablePlans();

  const getPlanIcon = (planKey: string) => {
    switch (planKey) {
      case 'essencial': return <Pencil className="w-6 h-6" />;
      case 'evoluir': return <Star className="w-6 h-6" />;
      case 'prime': return <Crown className="w-6 h-6" />;
      default: return <Pencil className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planKey: string) => {
    switch (planKey) {
      case 'essencial': return 'border-gray-300 bg-gray-50';
      case 'evoluir': return 'border-blue-300 bg-blue-50';
      case 'prime': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Full screen on mobile, centered on desktop */}
      <div className="relative bg-white rounded-none md:rounded-3xl shadow-2xl w-full md:max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-auto md:m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#FFE3A0] p-4 md:p-6 rounded-none md:rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-lg md:text-2xl font-bold text-[#033258] truncate">{title}</h2>
              <p className="text-sm md:text-base text-[#624044] mt-1 line-clamp-2">{upgradeMessage}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#FFF3D6] rounded-xl transition-colors touch-manipulation flex-shrink-0"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-[#476178]" />
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-4 md:p-6">
          <div className={`grid gap-4 md:gap-6 ${plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
            {plans.map((planKey) => {
              const plan = PLAN_INFO[planKey as keyof typeof PLAN_INFO];

              return (
                <div
                  key={planKey}
                  className={`relative rounded-xl md:rounded-2xl border-2 p-4 md:p-6 transition-all duration-300 hover:shadow-lg ${getPlanColor(planKey)}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#F59E0B] text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-bold">
                        MAIS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-4 md:mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-white border-2 border-current mb-3 md:mb-4">
                      <div className="scale-75 md:scale-100">
                        {getPlanIcon(planKey)}
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-[#033258] mb-2">{plan.name}</h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#033258]">{plan.price}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 md:gap-3">
                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          feature.included
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                        }`}>
                          {feature.included ? (
                            <Check className="w-2 h-2 md:w-3 md:h-3 text-green-600" />
                          ) : (
                            <X className="w-2 h-2 md:w-3 md:h-3 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-xs md:text-sm ${
                            feature.included ? 'text-[#033258]' : 'text-gray-600'
                          }`}>
                            {feature.name}
                          </div>
                          <div className={`text-xs mt-1 leading-tight ${
                            feature.included ? 'text-[#4A5568]' : 'text-gray-400'
                          }`}>
                            {feature.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCheckoutClick(planKey)}
                    className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold transition-colors text-sm md:text-base touch-manipulation ${
                      planKey === 'prime'
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white'
                        : plan.popular
                          ? 'bg-[#17a34a] hover:bg-[#17a34a]/90 text-white'
                          : 'bg-[#033258] hover:bg-[#033258]/90 text-white'
                    }`}
                  >
                    Assinar Agora
                  </button>
                </div>
              );
            })}
          </div>

          {/* Close Button - Mobile Footer */}
          <div className="text-center mt-6 md:mt-8 md:hidden">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 border border-[#FFE3A0] text-[#033258] rounded-xl hover:bg-[#FFF3D6] transition-colors font-medium touch-manipulation"
            >
              Fechar
            </button>
          </div>

          {/* Close Button - Desktop */}
          <div className="text-center mt-8 hidden md:block">
            <button
              onClick={onClose}
              className="px-6 py-2 text-[#476178] hover:text-[#033258] transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};