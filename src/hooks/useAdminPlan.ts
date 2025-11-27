import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAdminPlan = () => {
  const { user, profile, isAdmin, currentPlan } = useAuth();
  const [simulatedPlan, setSimulatedPlan] = useState<number | null>(null);

  // Carregar plano simulado do localStorage
  useEffect(() => {
    if (isAdmin) {
      const saved = localStorage.getItem('simulatedPlan');
      if (saved) {
        setSimulatedPlan(parseInt(saved));
      }
    }
  }, [isAdmin]);

  // Salvar plano simulado
  const setSimulatedPlanLevel = (planName: string) => {
    if (isAdmin) {
      // Converter nome do plano para número
      const planNumber = planName === 'demo' ? 0 :
                        planName === 'essencial' ? 1 :
                        planName === 'evoluir' ? 2 :
                        planName === 'prime' ? 3 :
                        planName === 'admin' ? 5 : 0;

      setSimulatedPlan(planNumber);
      localStorage.setItem('simulatedPlan', planNumber.toString());
    }
  };

  // Converter número do plano para nome
  const getPlanName = (planNumber: number) => {
    switch(planNumber) {
      case 0: return 'demo';
      case 1: return 'essencial';
      case 2: return 'evoluir';
      case 3: return 'prime';
      case 5: return 'admin';
      default: return 'demo';
    }
  };

  // Plano efetivo para uso (simulado se admin está simulando, senão o real)
  const effectivePlanNumber = isAdmin && simulatedPlan !== null ? simulatedPlan : currentPlan;
  const effectivePlan = getPlanName(effectivePlanNumber);

  return {
    isAdmin,
    simulatedPlan,
    effectivePlan,
    realPlan: getPlanName(profile?.plano_ativo || 0),
    setSimulatedPlan: setSimulatedPlanLevel,
    isSimulating: isAdmin && simulatedPlan !== null && simulatedPlan !== currentPlan
  };
};