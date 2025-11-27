import * as React from "react";
import { Pencil, Star, Crown, LucideIcon, Zap } from "lucide-react";
import { useAdminPlan } from "../../hooks/useAdminPlan";
import { usePermissions } from "../../hooks/usePermissions";
import { useNavigation } from "../../contexts/NavigationContext";

type PlanType = "Plano Essencial" | "Plano Evoluir" | "Plano Prime";

const styles: Record<
  PlanType,
  {
    bg: string;            // gradiente principal
    ring: string;          // borda/anel
    text: string;          // cor do texto
    icon: LucideIcon;      // ícone
  }
> = {
  "Plano Essencial": {
    bg: "bg-gradient-to-br from-gray-100 to-gray-200",
    ring: "ring-1 ring-gray-300/70",
    text: "text-gray-800",
    icon: Pencil
  },
  "Plano Evoluir": {
    bg: "bg-gradient-to-br from-blue-100 to-blue-200",
    ring: "ring-1 ring-blue-300/70",
    text: "text-blue-900",
    icon: Star
  },
  "Plano Prime": {
    bg: "bg-gradient-to-br from-purple-100 to-purple-200",
    ring: "ring-1 ring-purple-300/70",
    text: "text-purple-900",
    icon: Crown
  }
};

export function PlanBadge({ plan }: { plan?: PlanType }) {
  const { effectivePlan, isSimulating } = useAdminPlan();
  const { currentPlanNumber } = usePermissions();
  const { navigateToConfig } = useNavigation();

  // Convert plan key to display name
  const getPlanDisplayName = (planKey: string): PlanType => {
    switch (planKey) {
      case 'essencial': return 'Plano Essencial';
      case 'evoluir': return 'Plano Evoluir';
      case 'prime': return 'Plano Prime';
      default: return 'Plano Essencial';
    }
  };

  // Check if user is demo/free
  const isDemoUser = currentPlanNumber === 0;

  // If demo user, show upgrade card
  if (isDemoUser && !isSimulating) {
    return (
      <div className="space-y-4">
        {/* Demo Status Card */}
        <div className="relative overflow-hidden rounded-2xl px-5 py-4 shadow-md bg-gradient-to-br from-gray-100 to-gray-200 ring-1 ring-gray-300/70 text-gray-800">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -top-10 -left-6 h-28 w-40 rotate-[15deg] bg-white/50 blur-2xl" />
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/60">
              <Pencil className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-xs/4 opacity-70">Plano atual</p>
              <p className="text-lg font-bold">Demo/Gratuito</p>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div
          onClick={navigateToConfig}
          className="relative overflow-hidden rounded-2xl px-5 py-4 shadow-md bg-gradient-to-br from-[#F59E0B] to-[#D97706] ring-1 ring-orange-300/70 text-white cursor-pointer hover:from-[#D97706] hover:to-[#B45309] transition-all duration-200"
        >
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -top-10 -left-6 h-28 w-40 rotate-[15deg] bg-white/50 blur-2xl" />
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Zap className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-xs/4 opacity-90">⚡ Escolher Novo Plano</p>
              <p className="text-lg font-bold">Faça Upgrade</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use effective plan from context instead of prop
  const currentPlan = plan || getPlanDisplayName(effectivePlan);
  const S = styles[currentPlan as PlanType];
  const Icon = S.icon;

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl px-5 py-4 shadow-md",
        S.bg, S.ring, S.text,
        isSimulating ? "border-2 border-yellow-400" : ""
      ].join(" ")}
    >
      {/* efeito de reflexo suave */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-10 -left-6 h-28 w-40 rotate-[15deg] bg-white/50 blur-2xl" />
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/60">
          <Icon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-xs/4 opacity-70 flex items-center gap-1">
            Seu plano
            {isSimulating && <Crown className="w-3 h-3 text-yellow-600" />}
          </p>
          <p className="text-lg font-bold flex items-center gap-2">
            {currentPlan}
            {isSimulating && <span className="text-xs opacity-70">(Simulado)</span>}
          </p>
        </div>
      </div>
    </div>
  );
}