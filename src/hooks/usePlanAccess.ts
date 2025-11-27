import { useAuth } from '../contexts/AuthContext';
import { planService, Plan } from '../lib/planService';
import { useEffect, useState } from 'react';

type ContentType = 'atividades' | 'videos' | 'bonus' | 'papercrafts' | 'comunidade' | 'suporte';

/**
 * Hook para verificar acesso a conteúdo baseado no plano do usuário
 * Retorna: se tem acesso, e qual plano libera o item
 */
export function usePlanAccess() {
  const { profile } = useAuth();
  const [userPlan, setUserPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar plano do usuário quando profile muda
  useEffect(() => {
    const loadUserPlan = async () => {
      try {
        console.log('📋 Carregando plano do usuário. Profile:', profile);

        if (!profile) {
          // Se não tem profile, usar Gratuito
          const gratuito = await planService.getPlanById('GRATUITO');
          console.log('✅ Plano Gratuito carregado (sem profile):', gratuito);
          setUserPlan(gratuito);
        } else if (!profile.plano_id) {
          // Se não tem plano_id, buscar o plano Gratuito
          const gratuito = await planService.getPlanById('GRATUITO');
          console.log('✅ Plano Gratuito carregado (sem plano_id):', gratuito);
          setUserPlan(gratuito);
        } else {
          const plan = await planService.getPlanById(profile.plano_id);
          console.log('✅ Plano do usuário carregado:', plan);
          setUserPlan(plan);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar plano do usuário:', error);
        // Fallback para plano Gratuito
        try {
          const gratuito = await planService.getPlanById('GRATUITO');
          console.log('✅ Fallback: Plano Gratuito carregado:', gratuito);
          setUserPlan(gratuito);
        } catch (fallbackError) {
          console.error('❌ Erro ao carregar fallback Gratuito:', fallbackError);
          setUserPlan(null);
        }
      } finally {
        setLoading(false);
        console.log('✅ Loading finalizado');
      }
    };

    loadUserPlan();
  }, [profile]);

  /**
   * Verificar se usuário tem acesso a um item específico
   */
  const hasAccessToItem = (contentType: ContentType, itemId: string): boolean => {
    if (!userPlan) {
      console.log(`❌ Sem userPlan para checar ${contentType}/${itemId}`);
      return false;
    }

    const allowed = planService.isItemAllowedInPlan(userPlan, contentType, itemId);
    const categoryPerms = userPlan.permissions[contentType];

    console.log(`🔍 Verificando ${contentType}/${itemId}:`);
    console.log(`   Mode: ${categoryPerms.mode}`);
    console.log(`   Allowed IDs:`, categoryPerms.allowed_ids);
    console.log(`   Item está em allowed_ids? ${categoryPerms.allowed_ids.includes(itemId)}`);
    console.log(`   RESULTADO: ${allowed ? '✅ TEM ACESSO' : '❌ SEM ACESSO'}`);

    return allowed;
  };

  /**
   * Obter todos os planos que liberam um item
   */
  const getPlansForItem = async (contentType: ContentType, itemId: string): Promise<Plan[]> => {
    return planService.findAllPlansForItem(contentType, itemId);
  };

  /**
   * Obter o plano mais barato que libera um item
   */
  const getCheapestPlanForItem = async (contentType: ContentType, itemId: string): Promise<Plan | null> => {
    return planService.findCheapestPlanForItem(contentType, itemId);
  };

  /**
   * Verificar se comunidade está habilitada
   */
  const hasCommunityAccess = (): boolean => {
    if (!userPlan) return false;
    return userPlan.permissions.comunidade.allowed_ids.length > 0;
  };

  return {
    userPlan,
    loading,
    hasAccessToItem,
    getPlansForItem,
    getCheapestPlanForItem,
    hasCommunityAccess
  };
}
