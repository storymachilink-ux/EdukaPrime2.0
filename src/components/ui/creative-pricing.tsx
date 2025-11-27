import * as React from "react";
import { Button } from "./button";
import { Check, X, Crown, Pencil, Star, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  priceLabel: string;      // aceita "R$ 9,99/mês"
  description?: string;    // opcional
  features: string[];
  popular?: boolean;
  color?: string;          // ex.: "amber" | "blue" | "purple"
  onSubscribe?: () => void; // função para o botão de assinatura
}

function CreativePricing({
  tag = "",
  title,
  description,
  tiers,
}: {
  tag?: string;
  title: string;
  description: string;
  tiers: PricingTier[];
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center space-y-6 mb-12">
        {tag ? (
          <div className="font-handwritten text-xl text-blue-500 rotate-[-1deg]">
            {tag}
          </div>
        ) : null}
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F2741] rotate-[-1deg]">
            {title}
          </h2>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-44 h-2 bg-blue-500/15 rotate-[-1deg] rounded-full blur-[2px]" />
        </div>
        <p className="text-lg text-[#4A5568]">
          {description}
        </p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-8">
        {tiers.map((tier, index) => {
          // Ordem mobile: Prime (index 2) = order-1, Evoluir (index 1) = order-2, Essencial (index 0) = order-3
          const orderClass = index === 0 ? "order-3" : index === 1 ? "order-2" : "order-1";

          return (
            <div
              key={tier.name}
              id={tier.name === 'Plano Prime' ? 'plano-prime' : undefined}
              data-plan={tier.name === 'Plano Evoluir' ? 'evoluir' : undefined}
              className={cn(
                "relative group transition-all duration-300",
                orderClass,
                "md:!order-[unset]", // Remove ordenação no desktop
                index === 0 && "rotate-[-1deg]",
                index === 1 && "rotate-[1deg]",
                index === 2 && "rotate-[-2deg]"
              )}
            >
            {/* moldura "sketch" no tema claro */}
            <div
              className={cn(
                "absolute inset-0 bg-white",
                "border-2 border-[#0F2741]",
                "rounded-lg shadow-[4px_4px_0px_0px] shadow-[#0F2741]",
                "transition-all duration-300",
                "group-hover:shadow-[8px_8px_0px_0px]",
                "group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]"
              )}
            />
            <div className="relative p-6">
              {tier.popular && (
                <div className="absolute -top-2 -right-2 bg-amber-400 text-[#0F2741] px-3 py-1 rounded-full rotate-12 text-sm border-2 border-[#0F2741]">
                  MAIS POPULAR
                </div>
              )}
              {tier.name === 'Plano Prime' && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full rotate-12 text-sm border-2 border-green-700 font-bold">
                  75% OFF
                </div>
              )}

              <div className="mb-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full mb-4 flex items-center justify-center",
                    "border-2 border-[#0F2741]",
                    tier.color ? `text-${tier.color}-600` : "text-orange-600"
                  )}
                >
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-semibold text-[#0F2741]">{tier.name}</h3>
                {tier.description ? (
                  <p className="text-[#4A5568]">{tier.description}</p>
                ) : null}
              </div>

              {/* preço */}
              <div className="mb-6">
                {tier.name === 'Plano Prime' && (
                  <div className="text-sm text-red-500 line-through font-medium mb-1">
                    de R$ 88,00
                  </div>
                )}
                <div>
                  <span className="text-3xl font-bold text-[#0F2741]">
                    {tier.priceLabel.replace('/mês', '')}
                  </span>
                  <span className="text-sm text-gray-400 ml-1">/mês</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {tier.features.map((feature) => {
                  const isIncluded = feature.startsWith('+');
                  const isExcluded = feature.startsWith('-');
                  const isVIP = feature.startsWith('👑');

                  let fullText;
                  if (isVIP) {
                    fullText = feature.substring(2); // Remove o 👑 e o espaço
                  } else {
                    fullText = feature.substring(2); // Remove o + ou - e o espaço
                  }

                  // Separar título e descrição pelo separador " — "
                  const [title, description] = fullText.split(' — ');

                  return (
                    <div key={feature} className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                        isVIP
                          ? "border-yellow-500 bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-lg shadow-yellow-500/25"
                          : isIncluded
                            ? "border-green-500 bg-green-50"
                            : isExcluded
                              ? "border-red-500 bg-red-50"
                              : "border-[#0F2741]"
                      )}>
                        {isVIP ? (
                          <Crown className="w-3 h-3 text-yellow-600 drop-shadow-sm" />
                        ) : isIncluded ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : isExcluded ? (
                          <X className="w-3 h-3 text-red-600" />
                        ) : (
                          <Check className="w-3 h-3 text-[#0F2741]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          "font-semibold text-sm",
                          isVIP
                            ? "text-yellow-600 drop-shadow-sm"
                            : isIncluded
                              ? "text-[#0F2741]"
                              : isExcluded
                                ? "text-gray-600"
                                : "text-[#0F2741]"
                        )}>
                          {title}
                        </div>
                        {description && (
                          <div className={cn(
                            "text-[11px] leading-relaxed mt-1",
                            isVIP
                              ? "text-yellow-700/80"
                              : isIncluded
                                ? "text-[#4A5568]"
                                : isExcluded
                                  ? "text-gray-400"
                                  : "text-[#4A5568]"
                          )}>
                            {description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={tier.onSubscribe}
                className={cn(
                  "w-full h-14 relative text-lg font-bold uppercase tracking-wide",
                  "border-2 border-green-700",
                  "shadow-[4px_4px_0px_0px] shadow-green-700",
                  "transition-all duration-300",
                  "hover:shadow-[6px_6px_0px_0px] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  "bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                )}
              >
                Liberar Atividades
              </Button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };
