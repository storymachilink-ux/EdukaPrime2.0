import { supabase } from './supabase';

// Types
export interface Plan {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  price: number;
  currency: string;
  payment_type: 'mensal' | 'unico';
  duration_days: number | null;
  checkout_url: string | null;
  product_id_gateway: string | null;
  modal_image_url: string | null;
  modal_text: string | null;
  modal_button_text: string | null;
  icon: string | null;
  order_position: number;
  color_code: string | null;
  is_active: boolean;
  has_comunidade?: boolean;
  has_suporte_vip?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanFeature {
  id: string;
  plan_id: number;
  feature_name: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: number;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string | null;
  payment_id: string | null;
  product_id_gateway: string | null;
  payment_method: string | null;
  amount_paid: number | null;
  auto_renew: boolean;
  last_renewal_date: string | null;
  next_renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCurrentAccess {
  id: string;
  email: string;
  current_plan_id: number;
  plan_name: string;
  plan_display_name: string;
  has_lifetime_access: boolean;
  monthly_expires_at: string | null;
  next_renewal_date: string | null;
  monthly_subscription_id: string | null;
  lifetime_subscription_id: string | null;
}

// ========================================
// PLANOS - CRUD
// ========================================

export const planService = {
  // Buscar todos os planos ativos
  async getAllPlans(): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from('plans_v2')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar planos:', error);
      throw error;
    }
  },

  // Buscar plano por ID
  async getPlanById(id: number): Promise<Plan | null> {
    try {
      const { data, error } = await supabase
        .from('plans_v2')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`❌ Erro ao buscar plano ${id}:`, error);
      return null;
    }
  },

  // Buscar plano com suas features
  async getPlanWithFeatures(planId: number) {
    try {
      const { data, error } = await supabase
        .from('plans_v2')
        .select(
          `
          *,
          features:plan_features(id, feature_name, is_enabled)
        `
        )
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`❌ Erro ao buscar plano com features:`, error);
      return null;
    }
  },

  // Atualizar plano
  async updatePlan(id: number, updates: Partial<Plan>): Promise<Plan | null> {
    try {
      const { data, error } = await supabase
        .from('plans_v2')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`❌ Erro ao atualizar plano ${id}:`, error);
      throw error;
    }
  },

  // ========================================
  // FEATURES - Gerenciar o que cada plano libera
  // ========================================

  // Buscar todas as features de um plano
  async getPlanFeatures(planId: number): Promise<PlanFeature[]> {
    try {
      const { data, error } = await supabase
        .from('plan_features')
        .select('*')
        .eq('plan_id', planId)
        .order('feature_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`❌ Erro ao buscar features do plano ${planId}:`, error);
      return [];
    }
  },

  // Atualizar feature de um plano
  async updatePlanFeature(
    planId: number,
    featureName: string,
    isEnabled: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('plan_features')
        .update({ is_enabled: isEnabled })
        .eq('plan_id', planId)
        .eq('feature_name', featureName);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(
        `❌ Erro ao atualizar feature ${featureName} do plano ${planId}:`,
        error
      );
      return false;
    }
  },

  // Obter resumo de features de um plano (para admin)
  async getFeaturesSummary(
    planId: number
  ): Promise<Record<string, boolean> | null> {
    try {
      const features = await this.getPlanFeatures(planId);
      const summary: Record<string, boolean> = {};

      features.forEach((f) => {
        summary[f.feature_name] = f.is_enabled;
      });

      return summary;
    } catch (error) {
      console.error(`❌ Erro ao obter resumo de features:`, error);
      return null;
    }
  },

  // ========================================
  // ACESSO - Verificar permissões do usuário
  // ========================================

  // Verificar se usuário tem acesso a um feature ESPECÍFICA
  // Features suportadas: 'comunidade', 'suporte_vip'
  // Lógica: verifica se o plano ativo do user tem a feature habilitada
  async hasAccessToFeature(userId: string, featureName: string | 'comunidade' | 'suporte_vip'): Promise<boolean> {
    try {
      if (!userId) {
        console.log(`❌ ${featureName}: Usuário não informado`);
        return false;
      }

      // 1. Buscar o perfil do usuário para pegar o plano ativo
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('active_plan_id, is_admin, has_lifetime_access')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile) {
        console.error(`❌ Erro ao buscar perfil do usuário:`, profileError);
        return false;
      }

      // 2. Admin e lifetime access sempre têm todas as features
      if (userProfile.is_admin || userProfile.has_lifetime_access) {
        console.log(`✅ ${featureName}: ${userProfile.is_admin ? 'Admin' : 'Lifetime access'} tem acesso total`);
        return true;
      }

      // 3. Se usuário é gratuito (plan_id = 0), não tem acesso
      if (!userProfile.active_plan_id || userProfile.active_plan_id === 0) {
        console.log(`❌ ${featureName}: Usuário gratuito sem acesso`);
        return false;
      }

      // 4. Para features conhecidas, buscar do plano
      if (featureName === 'comunidade' || featureName === 'suporte_vip') {
        const { data: plan, error: planError } = await supabase
          .from('plans_v2')
          .select(`id, has_${featureName === 'comunidade' ? 'comunidade' : 'suporte_vip'}`)
          .eq('id', userProfile.active_plan_id)
          .single();

        if (planError || !plan) {
          console.error(`❌ Erro ao buscar plano:`, planError);
          return false;
        }

        const featureField = featureName === 'comunidade' ? 'has_comunidade' : 'has_suporte_vip';
        const hasFeature = plan[featureField as keyof typeof plan] === true;

        console.log(`🔍 ${featureName} para plano ${userProfile.active_plan_id}: ${hasFeature ? '✅ Habilitado' : '❌ Desabilitado'}`);
        return hasFeature;
      }

      // Fallback para features desconhecidas: retorna false (seguro)
      console.warn(`⚠️ Feature desconhecida: ${featureName}`);
      return false;
    } catch (error) {
      console.error(`❌ Erro ao verificar acesso a ${featureName}:`, error);
      return false;
    }
  },

  // Obter acesso atual do usuário
  async getUserCurrentAccess(userId: string): Promise<UserCurrentAccess | null> {
    try {
      const { data, error } = await supabase
        .from('user_current_access')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`❌ Erro ao buscar acesso atual do usuário:`, error);
      return null;
    }
  },

  // ========================================
  // SUBSCRIPTIONS - Histórico de compras
  // ========================================

  // Buscar subscriptions ativas de um usuário
  async getUserActiveSubscriptions(userId: string): Promise<(UserSubscription & { payment_type?: string })[]> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, plans_v2(payment_type)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear o payment_type do plano para a subscription
      return (data || []).map((sub: any) => ({
        ...sub,
        payment_type: sub.plans_v2?.payment_type
      }));
    } catch (error) {
      console.error(`❌ Erro ao buscar subscriptions do usuário:`, error);
      return [];
    }
  },

  // Buscar histórico completo de subscriptions de um usuário
  async getUserSubscriptionHistory(userId: string): Promise<UserSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`❌ Erro ao buscar histórico de subscriptions:`, error);
      return [];
    }
  },

  // ========================================
  // WEBHOOK - Ativar subscription (chamado pelo webhook)
  // ========================================

  // Ativar subscription via webhook (SQL function)
  async activateUserSubscription(
    userId: string,
    planId: number,
    paymentData: {
      payment_id: string;
      product_id_gateway?: string;
      payment_method?: string;
      amount_paid?: number;
    }
  ): Promise<string | null> {
    try {
      console.log('💾 Ativando subscription via webhook:', {
        userId,
        planId,
        paymentData,
      });

      const { data, error } = await supabase.rpc(
        'activate_user_subscription',
        {
          p_user_id: userId,
          p_plan_id: planId,
          p_payment_id: paymentData.payment_id,
          p_product_id_gateway: paymentData.product_id_gateway || null,
          p_payment_method: paymentData.payment_method || null,
          p_amount_paid: paymentData.amount_paid || null,
        }
      );

      if (error) throw error;

      console.log('✅ Subscription ativada com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao ativar subscription:', error);
      throw error;
    }
  },

  // ========================================
  // PLANOS PARA ITEM - Para modal de upgrade
  // ========================================

  // Encontrar todos os planos que liberam um feature
  async findAllPlansForFeature(featureName: string): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from('plan_features')
        .select('plan_id')
        .eq('feature_name', featureName)
        .eq('is_enabled', true);

      if (error) throw error;

      const planIds = data?.map((f) => f.plan_id) || [];

      if (planIds.length === 0) return [];

      const { data: plans, error: plansError } = await supabase
        .from('plans_v2')
        .select('*')
        .in('id', planIds)
        .eq('is_active', true)
        .order('price');

      if (plansError) throw plansError;
      return plans || [];
    } catch (error) {
      console.error(
        `❌ Erro ao encontrar planos para feature ${featureName}:`,
        error
      );
      return [];
    }
  },

  // Encontrar o plano mais barato que libera um feature
  async findCheapestPlanForFeature(featureName: string): Promise<Plan | null> {
    try {
      const plans = await this.findAllPlansForFeature(featureName);

      // Ordenar por preço (menor primeiro), excluindo GRATUITO
      const filtered = plans.filter((p) => p.id !== 0).sort((a, b) => a.price - b.price);

      return filtered.length > 0 ? filtered[0] : null;
    } catch (error) {
      console.error(
        `❌ Erro ao encontrar plano mais barato para ${featureName}:`,
        error
      );
      return null;
    }
  },

  // ========================================
  // SINCRONIZAÇÃO - Atualizar available_for_plans
  // ========================================

  // Sincronizar available_for_plans de um item com a junction table
  async syncItemPlanAccess(
    itemType: 'atividades' | 'videos' | 'bonus' | 'papercrafts',
    itemId: string
  ): Promise<boolean> {
    try {
      // Mapear tipo de item para tabela de junction
      const tableMap = {
        atividades: 'plan_atividades',
        videos: 'plan_videos',
        bonus: 'plan_bonus',
        papercrafts: 'plan_papercrafts',
      };

      const junctionTable = tableMap[itemType];
      const itemTable = itemType;
      const linkFieldName = itemType === 'bonus' ? 'bonus_id' : `${itemType.slice(0, -1)}_id`;

      // 1. Buscar todos os planos que têm este item vinculado
      const { data: junctionRows, error: junctionError } = await supabase
        .from(junctionTable)
        .select('plan_id')
        .eq(linkFieldName, itemId);

      if (junctionError) throw junctionError;

      const planIds = (junctionRows || []).map((row: any) => row.plan_id);

      // 2. Atualizar o item com os novos plan_ids
      const { error: updateError } = await supabase
        .from(itemTable)
        .update({ available_for_plans: planIds })
        .eq('id', itemId);

      if (updateError) throw updateError;

      console.log(`✅ Sincronizado ${itemType}(${itemId}): planos = ${planIds.join(', ')}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao sincronizar ${itemType}:`, error);
      return false;
    }
  },

  // Sincronizar TODOS os items de um tipo com base na junction table
  async syncAllItemPlanAccess(itemType: 'atividades' | 'videos' | 'bonus' | 'papercrafts'): Promise<boolean> {
    try {
      const tableMap = {
        atividades: 'plan_atividades',
        videos: 'plan_videos',
        bonus: 'plan_bonus',
        papercrafts: 'plan_papercrafts',
      };

      const junctionTable = tableMap[itemType];
      const itemTable = itemType;

      // 1. Buscar todos os items desta tabela
      const { data: allItems, error: itemsError } = await supabase
        .from(itemTable)
        .select('id');

      if (itemsError) throw itemsError;

      // 2. Para cada item, sincronizar seus planos
      let syncedCount = 0;
      for (const item of allItems || []) {
        const success = await this.syncItemPlanAccess(itemType, item.id);
        if (success) syncedCount++;
      }

      console.log(`✅ Sincronizados ${syncedCount}/${(allItems || []).length} ${itemType}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao sincronizar todos ${itemType}:`, error);
      return false;
    }
  },

  // Sincronizar TUDO (todos os tipos de items)
  async syncAllItemPlanAccessComplete(): Promise<boolean> {
    try {
      console.log('🔄 Iniciando sincronização completa...');

      const itemTypes: Array<'atividades' | 'videos' | 'bonus' | 'papercrafts'> = [
        'atividades',
        'videos',
        'bonus',
        'papercrafts',
      ];

      for (const itemType of itemTypes) {
        await this.syncAllItemPlanAccess(itemType);
      }

      console.log('✅ Sincronização completa finalizada!');
      return true;
    } catch (error) {
      console.error('❌ Erro durante sincronização completa:', error);
      return false;
    }
  },

  // ========================================
  // SINCRONIZAR UM PLANO ESPECÍFICO
  // ========================================

  // Sincronizar TODOS os items (todos os tipos) de um plano específico
  // Chamado quando admin clica "Salvar" no AdminPlanosManager
  async syncAllItemsForPlan(planId: number): Promise<{
    success: boolean;
    stats: {
      atividades: number;
      videos: number;
      bonus: number;
      papercrafts: number;
      total: number;
    };
    message: string;
  }> {
    try {
      console.log(`🔄 Sincronizando TODOS os items do plano ${planId}...`);

      const itemTypes: Array<'atividades' | 'videos' | 'bonus' | 'papercrafts'> = [
        'atividades',
        'videos',
        'bonus',
        'papercrafts',
      ];

      const stats = {
        atividades: 0,
        videos: 0,
        bonus: 0,
        papercrafts: 0,
        total: 0,
      };

      // Para cada tipo de item, sincronizar todos
      for (const itemType of itemTypes) {
        const tableMap = {
          atividades: 'plan_atividades',
          videos: 'plan_videos',
          bonus: 'plan_bonus',
          papercrafts: 'plan_papercrafts',
        };

        const junctionTable = tableMap[itemType];

        // 1. Buscar todos os items vinculados a este plano
        const { data: linkedItems, error: linkedError } = await supabase
          .from(junctionTable)
          .select('*')
          .eq('plan_id', planId);

        if (linkedError && linkedError.code !== 'PGRST116') {
          console.error(`❌ Erro ao buscar items de ${itemType}:`, linkedError);
          continue;
        }

        // 2. Para cada item vinculado, sincronizar seu available_for_plans
        const itemIds = (linkedItems || []).map((item: any) => {
          const linkFieldName = itemType === 'bonus' ? 'bonus_id' : `${itemType.slice(0, -1)}_id`;
          return item[linkFieldName];
        });

        for (const itemId of itemIds) {
          const syncSuccess = await this.syncItemPlanAccess(itemType, itemId);
          if (syncSuccess) {
            stats[itemType]++;
            stats.total++;
          }
        }

        console.log(`✅ ${itemType}: ${stats[itemType]} items sincronizados`);
      }

      const message = `✅ Sincronização concluída: ${stats.atividades} atividades, ${stats.videos} vídeos, ${stats.bonus} bônus, ${stats.papercrafts} papercrafts`;
      console.log(message);

      return {
        success: true,
        stats,
        message,
      };
    } catch (error) {
      console.error('❌ Erro ao sincronizar plano:', error);
      return {
        success: false,
        stats: {
          atividades: 0,
          videos: 0,
          bonus: 0,
          papercrafts: 0,
          total: 0,
        },
        message: `❌ Erro ao sincronizar: ${(error as any).message}`,
      };
    }
  },

  // ========================================
  // NOVA LÓGICA - Usar APENAS user_subscriptions + available_for_plans
  // ========================================

  // Verificar se user tem acesso a uma ÁREA (ex: papercrafts, videos)
  // Lógica: se tem subscription ativa com plan_id > 0 (qualquer plano pago), tem acesso
  async hasAccessToArea(userId: string): Promise<boolean> {
    try {
      if (!userId) return false;

      // 1. Buscar subscriptions ativas do usuário
      const subscriptions = await this.getUserActiveSubscriptions(userId);

      // 2. Se tem subscription ativa com plan_id > 0, tem acesso (qualquer plano pago)
      const hasActiveSubscription = subscriptions.some(sub => sub.plan_id > 0);

      console.log(`✅ User ${userId} acesso a áreas pagas: ${hasActiveSubscription}`);
      return hasActiveSubscription;
    } catch (error) {
      console.error('❌ Erro ao verificar acesso à área:', error);
      return false;
    }
  },

  // Verificar se user tem acesso a um ITEM específico
  // Lógica: verifica se algum plano do user está em available_for_plans do item
  async hasAccessToItem(
    userId: string,
    itemType: 'atividades' | 'videos' | 'bonus' | 'papercrafts',
    itemId: string
  ): Promise<boolean> {
    try {
      if (!userId || !itemId) return false;

      // 1. Buscar subscriptions ativas do usuário
      const subscriptions = await this.getUserActiveSubscriptions(userId);
      if (subscriptions.length === 0) return false;

      const userPlanIds = subscriptions.map(s => s.plan_id);

      // 2. Buscar o item
      const { data: item, error: itemError } = await supabase
        .from(itemType)
        .select('available_for_plans')
        .eq('id', itemId)
        .single();

      if (itemError || !item) {
        console.error(`❌ Item não encontrado: ${itemType}/${itemId}`);
        return false;
      }

      // 3. Verificar se algum plano do user está em available_for_plans
      const itemPlans = item.available_for_plans || [];
      const hasAccess = userPlanIds.some(planId => itemPlans.includes(planId));

      console.log(`✅ User ${userId} acesso a ${itemType}/${itemId}: ${hasAccess}`);
      return hasAccess;
    } catch (error) {
      console.error('❌ Erro ao verificar acesso ao item:', error);
      return false;
    }
  },

  // Obter planos disponíveis para um item específico (para o modal de upgrade)
  async getPlansForItem(
    itemType: 'atividades' | 'videos' | 'bonus' | 'papercrafts',
    itemId: string
  ): Promise<Plan[]> {
    try {
      // 1. Buscar o item para pegar available_for_plans
      const { data: item, error: itemError } = await supabase
        .from(itemType)
        .select('available_for_plans')
        .eq('id', itemId)
        .single();

      if (itemError || !item) return [];

      const planIds = item.available_for_plans || [];
      if (planIds.length === 0) return [];

      // 2. Buscar os planos com esses IDs
      const { data: plans, error: plansError } = await supabase
        .from('plans_v2')
        .select('*')
        .in('id', planIds)
        .eq('is_active', true)
        .order('price');

      if (plansError) return [];
      return plans || [];
    } catch (error) {
      console.error('❌ Erro ao buscar planos do item:', error);
      return [];
    }
  },

};
