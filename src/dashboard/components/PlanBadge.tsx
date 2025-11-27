import React from 'react';
import { Sparkles, Rocket, Crown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface PlanBadgeProps {
  className?: string;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ className }) => {
  const { user } = useAuth();

  const planName = user?.profile?.plan || 'Plano ativo';

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'essencial':
        return <Sparkles className="w-4 h-4" />;
      case 'evoluir':
        return <Rocket className="w-4 h-4" />;
      case 'prime':
        return <Crown className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 text-sm ${className || ''}`}
    >
      {getPlanIcon(planName)}
      {planName}
    </span>
  );
};