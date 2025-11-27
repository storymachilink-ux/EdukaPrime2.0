import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { planService, Plan } from '../lib/planService';

type FeatureName = 'atividades' | 'videos' | 'bonus' | 'papercrafts' | 'comunidade' | 'suporte_vip';

/**
 * Hook para verificar acesso a recursos baseado no novo sistema de planos
 * NOVA LÓGICA (OPÇÃO 2): Usa APENAS user_subscriptions + available_for_plans
 * Retorna: se tem acesso e quais planos liberam o recurso
 */
export function useFeatureAccess() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);

  // Verificar se usuário tem acesso a um feature/área
  // NOVA LÓGICA: usa planService.hasAccessToArea() em vez de RPC
  const hasAccess = async (featureName: FeatureName): Promise<boolean> => {
    try {
      if (!user?.id) {
        console.log(`❌ ${featureName}: Usuário não autenticado`);
        return false;
      }

      // Se é admin, sempre tem acesso
      if (profile?.is_admin) {
        console.log(`✅ ${featureName}: Admin tem acesso total`);
        return true;
      }

      // Se tem lifetime access, sempre tem acesso
      if (profile?.has_lifetime_access) {
        console.log(`✅ ${featureName}: Lifetime access tem acesso total`);
        return true;
      }

      // NOVO: Usar planService.hasAccessToArea() em vez de RPC
      // Isso verifica user_subscriptions diretamente
      const access = await planService.hasAccessToArea(user.id);

      if (access) {
        console.log(`✅ ${featureName}: TEM ACESSO (via user_subscriptions)`);
      } else {
        console.log(`❌ ${featureName}: SEM ACESSO (sem subscription ativa)`);
      }
      return access;
    } catch (error) {
      console.error(`❌ Erro ao verificar acesso a ${featureName}:`, error);
      return false;
    }
  };

  // Obter todos os planos PAGOS (qualquer plano > 0 dá acesso a áreas pagas)
  const getAvailablePlans = async (featureName: FeatureName): Promise<Plan[]> => {
    try {
      // NOVO: Retornar todos os planos pagos (plan_id > 0)
      // Qualquer plano pago dá acesso a papercrafts, videos, bonus, etc
      const plans = await planService.getAllPlans();
      const paidPlans = plans.filter(p => p.id > 0); // Excluir GRATUITO (id=0)
      console.log(`📋 Planos pagos para ${featureName}:`, paidPlans.length);
      return paidPlans;
    } catch (error) {
      console.error(`❌ Erro ao buscar planos para ${featureName}:`, error);
      return [];
    }
  };

  // Obter o plano mais barato (para upgrade)
  const getCheapestPlan = async (featureName: FeatureName): Promise<Plan | null> => {
    try {
      // NOVO: Retornar o plano MENSAL mais barato que não seja GRATUITO
      const plans = await planService.getAllPlans();
      const paidMonthlyPlans = plans.filter(p => p.id > 0 && p.payment_type === 'mensal');

      if (paidMonthlyPlans.length === 0) {
        console.log(`❌ Nenhum plano mensal disponível para ${featureName}`);
        return null;
      }

      const cheapest = paidMonthlyPlans.sort((a, b) => a.price - b.price)[0];
      console.log(`💰 Plano mais barato para ${featureName}: ${cheapest.display_name} (R$ ${cheapest.price})`);
      return cheapest;
    } catch (error) {
      console.error(`❌ Erro ao buscar plano mais barato:`, error);
      return null;
    }
  };

  useEffect(() => {
    // Loading completo quando perfil está carregado
    if (profile || !loading) {
      setLoading(false);
    }
  }, [profile]);

  return {
    loading,
    hasAccess,
    getAvailablePlans,
    getCheapestPlan,
  };
}
