import { supabase } from './supabase';

/**
 * Tipos de atividades que podem ser registradas
 */
export type ActivityType = 'download' | 'view_video' | 'view_activity' | 'view_bonus';

/**
 * Tipos de recursos
 */
export type ResourceType = 'atividade' | 'video' | 'bonus';

/**
 * Interface para o log de atividade
 */
interface ActivityLog {
  user_id: string;
  activity_type: ActivityType;
  resource_type: ResourceType;
  resource_id: string;
  resource_title: string;
}

/**
 * Registra uma atividade do usuário no banco de dados
 *
 * @param userId - ID do usuário que realizou a atividade
 * @param activityType - Tipo de atividade (download, view_video, etc)
 * @param resourceType - Tipo de recurso (atividade, video, bonus)
 * @param resourceId - ID do recurso acessado
 * @param resourceTitle - Título do recurso para fácil visualização
 * @returns Promise com sucesso ou erro
 */
export async function logActivity(
  userId: string,
  activityType: ActivityType,
  resourceType: ResourceType,
  resourceId: string,
  resourceTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validações básicas
    if (!userId || !activityType || !resourceType || !resourceId || !resourceTitle) {
      console.error('ActivityLogger: Parâmetros inválidos', {
        userId,
        activityType,
        resourceType,
        resourceId,
        resourceTitle
      });
      return { success: false, error: 'Parâmetros inválidos' };
    }

    const activityLog: ActivityLog = {
      user_id: userId,
      activity_type: activityType,
      resource_type: resourceType,
      resource_id: resourceId,
      resource_title: resourceTitle
    };

    const { error } = await supabase
      .from('user_activity_logs')
      .insert([activityLog]);

    if (error) {
      console.error('ActivityLogger: Erro ao registrar atividade:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Atividade registrada:', activityLog);
    return { success: true };
  } catch (error: any) {
    console.error('ActivityLogger: Erro inesperado:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca o histórico de atividades de um usuário
 *
 * @param userId - ID do usuário
 * @param limit - Número máximo de registros (padrão: 50)
 * @param offset - Offset para paginação (padrão: 0)
 * @returns Promise com array de atividades
 */
export async function getUserActivityHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const { data, error, count } = await supabase
      .from('user_activity_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data: data || [], count: count || 0, error: null };
  } catch (error: any) {
    console.error('ActivityLogger: Erro ao buscar histórico:', error);
    return { data: [], count: 0, error: error.message };
  }
}

/**
 * Busca estatísticas de atividade de um usuário
 *
 * @param userId - ID do usuário
 * @returns Promise com estatísticas
 */
export async function getUserActivityStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('activity_type, resource_type')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      downloads: data?.filter(a => a.activity_type === 'download').length || 0,
      videoViews: data?.filter(a => a.activity_type === 'view_video').length || 0,
      atividadesDownloaded: data?.filter(a => a.resource_type === 'atividade').length || 0,
      videosWatched: data?.filter(a => a.resource_type === 'video').length || 0,
      bonusDownloaded: data?.filter(a => a.resource_type === 'bonus').length || 0,
    };

    return { stats, error: null };
  } catch (error: any) {
    console.error('ActivityLogger: Erro ao buscar estatísticas:', error);
    return {
      stats: {
        total: 0,
        downloads: 0,
        videoViews: 0,
        atividadesDownloaded: 0,
        videosWatched: 0,
        bonusDownloaded: 0,
      },
      error: error.message
    };
  }
}

/**
 * Busca atividades filtradas por tipo de recurso
 *
 * @param userId - ID do usuário
 * @param resourceType - Tipo de recurso para filtrar
 * @returns Promise com array de atividades
 */
export async function getUserActivitiesByType(
  userId: string,
  resourceType: ResourceType
) {
  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('resource_type', resourceType)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error: any) {
    console.error('ActivityLogger: Erro ao buscar atividades por tipo:', error);
    return { data: [], error: error.message };
  }
}
