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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            id={tier.name === 'Plano Prime' ? 'plano-prime' : undefined}
            className={cn(
              "relative group transition-all duration-300",
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
                <span className="text-3xl font-bold text-[#0F2741]">
                  {tier.priceLabel}
                </span>
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
                            "text-xs leading-relaxed mt-1",
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
                  "w-full h-11 relative",
                  "border-2 border-[#0F2741]",
                  "shadow-[4px_4px_0px_0px] shadow-[#0F2741]",
                  "transition-all duration-300",
                  "hover:shadow-[6px_6px_0px_0px] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  tier.name === "Plano Prime"
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-yellow-600 shadow-yellow-600 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-yellow-600"
                    : tier.popular
                      ? "bg-[#17a34a] text-[#e3f2ff] border-[#29824a] shadow-[#29824a] hover:bg-[#17a34a]/90 hover:shadow-[#29824a]"
                      : "bg-white text-[#0F2741] hover:bg-[#F1F6FF]"
                )}
              >
                Assinar Agora
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };