import { supabase } from './supabase';

/**
 * Busca o histórico de mudanças de plano de um usuário
 *
 * @param userId - ID do usuário
 * @returns Promise com histórico de planos
 */
export async function getUserPlanHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_plan_history')
      .select(`
        *,
        admin:changed_by (
          nome,
          email
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error: any) {
    console.error('Erro ao buscar histórico de planos:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Bloqueia um usuário
 *
 * @param userId - ID do usuário
 * @returns Promise com sucesso ou erro
 */
export async function blockUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status: 'bloqueado' })
      .eq('id', userId);

    if (error) throw error;

    console.log(`🔒 Usuário bloqueado: ${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao bloquear usuário:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Desbloqueia um usuário
 *
 * @param userId - ID do usuário
 * @returns Promise com sucesso ou erro
 */
export async function unblockUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status: 'ativo' })
      .eq('id', userId);

    if (error) throw error;

    console.log(`🔓 Usuário desbloqueado: ${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao desbloquear usuário:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verifica se o plano de um usuário está expirado
 *
 * @param dataExpiracao - Data de expiração
 * @returns true se expirado, false caso contrário
 */
export function isPlanExpired(dataExpiracao: string | null): boolean {
  if (!dataExpiracao) return false;

  const hoje = new Date();
  const expiracao = new Date(dataExpiracao);

  return expiracao < hoje;
}

/**
 * Verifica quantos dias faltam para o plano expirar
 *
 * @param dataExpiracao - Data de expiração
 * @returns Número de dias (negativo se já expirou)
 */
export function getDaysUntilExpiration(dataExpiracao: string | null): number | null {
  if (!dataExpiracao) return null;

  const hoje = new Date();
  const expiracao = new Date(dataExpiracao);

  const diffTime = expiracao.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Busca estatísticas gerais de usuários
 *
 * @returns Promise com estatísticas
 */
export async function getUserStats() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('plano_ativo, status, created_at');

    if (error) throw error;

    const total = users?.length || 0;
    const porPlano = {
      gratuito: users?.filter(u => u.plano_ativo === 0).length || 0,
      essencial: users?.filter(u => u.plano_ativo === 1).length || 0,
      evoluir: users?.filter(u => u.plano_ativo === 2).length || 0,
      prime: users?.filter(u => u.plano_ativo === 3).length || 0,
    };
    const bloqueados = users?.filter(u => u.status === 'bloqueado').length || 0;

    // Novos usuários na última semana
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
    const novosNaSemana = users?.filter(u => new Date(u.created_at) >= umaSemanaAtras).length || 0;

    return {
      total,
      porPlano,
      bloqueados,
      novosNaSemana,
      error: null
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      total: 0,
      porPlano: { gratuito: 0, essencial: 0, evoluir: 0, prime: 0 },
      bloqueados: 0,
      novosNaSemana: 0,
      error: error.message
    };
  }
}
