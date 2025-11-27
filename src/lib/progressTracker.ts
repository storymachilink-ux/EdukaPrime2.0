import { supabase } from './supabase';

export type ResourceType = 'atividade' | 'video' | 'bonus';
export type ProgressStatus = 'started' | 'in_progress' | 'completed';

interface ProgressData {
  user_id: string;
  resource_type: ResourceType;
  resource_id: string;
  resource_title: string;
  status?: ProgressStatus;
  progress_percent?: number;
  time_spent?: number;
}

/**
 * Marca um recurso como iniciado (primeiro acesso)
 */
export async function markAsStarted(
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  resourceTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verifica se já existe progresso
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .single();

    // Se já existe, não faz nada
    if (existing) {
      return { success: true };
    }

    // Cria novo registro
    const { error } = await supabase
      .from('user_progress')
      .insert([{
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
        resource_title: resourceTitle,
        status: 'started',
        progress_percent: 0,
      }]);

    if (error) throw error;

    console.log(`✅ Recurso marcado como iniciado: ${resourceTitle}`);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao marcar recurso como iniciado:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca um recurso como concluído
 */
export async function markAsCompleted(
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  resourceTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
        resource_title: resourceTitle,
        status: 'completed',
        progress_percent: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,resource_type,resource_id'
      });

    if (error) throw error;

    console.log(`✅ Recurso marcado como concluído: ${resourceTitle}`);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao marcar recurso como concluído:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Atualiza o progresso de um recurso
 */
export async function updateProgress(
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  resourceTitle: string,
  progressPercent: number,
  timeSpent?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const status: ProgressStatus =
      progressPercent === 0 ? 'started' :
      progressPercent === 100 ? 'completed' :
      'in_progress';

    const updateData: any = {
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      resource_title: resourceTitle,
      status,
      progress_percent: progressPercent,
      updated_at: new Date().toISOString(),
    };

    if (timeSpent !== undefined) {
      updateData.time_spent = timeSpent;
    }

    if (progressPercent === 100) {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('user_progress')
      .upsert(updateData, {
        onConflict: 'user_id,resource_type,resource_id'
      });

    if (error) throw error;

    console.log(`📊 Progresso atualizado: ${resourceTitle} - ${progressPercent}%`);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar progresso:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca o progresso de um usuário em um recurso específico
 */
export async function getUserProgress(
  userId: string,
  resourceType: ResourceType,
  resourceId: string
) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    return { data: data || null, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar progresso:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Busca todo o progresso de um usuário
 */
export async function getAllUserProgress(userId: string, resourceType?: ResourceType) {
  try {
    let query = supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error: any) {
    console.error('Erro ao buscar progresso do usuário:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Busca estatísticas de progresso de um usuário
 */
export async function getUserProgressStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const total = data?.length || 0;
    const completed = data?.filter(p => p.status === 'completed').length || 0;
    const inProgress = data?.filter(p => p.status === 'in_progress').length || 0;

    const byType = {
      atividades: {
        total: data?.filter(p => p.resource_type === 'atividade').length || 0,
        completed: data?.filter(p => p.resource_type === 'atividade' && p.status === 'completed').length || 0,
      },
      videos: {
        total: data?.filter(p => p.resource_type === 'video').length || 0,
        completed: data?.filter(p => p.resource_type === 'video' && p.status === 'completed').length || 0,
      },
      bonus: {
        total: data?.filter(p => p.resource_type === 'bonus').length || 0,
        completed: data?.filter(p => p.resource_type === 'bonus' && p.status === 'completed').length || 0,
      },
    };

    const totalTimeSpent = data?.reduce((acc, p) => acc + (p.time_spent || 0), 0) || 0;

    return {
      total,
      completed,
      inProgress,
      byType,
      totalTimeSpent, // em segundos
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      error: null,
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas de progresso:', error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      byType: {
        atividades: { total: 0, completed: 0 },
        videos: { total: 0, completed: 0 },
        bonus: { total: 0, completed: 0 },
      },
      totalTimeSpent: 0,
      completionRate: 0,
      error: error.message,
    };
  }
}

/**
 * Busca recursos mais completados (para admin)
 */
export async function getMostCompletedResources(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('resource_type, resource_id, resource_title, status')
      .eq('status', 'completed');

    if (error) throw error;

    // Agrupar e contar
    const grouped = data?.reduce((acc: any, item) => {
      const key = `${item.resource_type}|${item.resource_id}`;
      if (!acc[key]) {
        acc[key] = {
          resource_type: item.resource_type,
          resource_id: item.resource_id,
          resource_title: item.resource_title,
          completions: 0,
        };
      }
      acc[key].completions++;
      return acc;
    }, {});

    // Converter para array e ordenar
    const sorted = Object.values(grouped || {})
      .sort((a: any, b: any) => b.completions - a.completions)
      .slice(0, limit);

    return { data: sorted, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar recursos mais completados:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Busca estatísticas globais de progresso (para admin)
 */
export async function getGlobalProgressStats() {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*');

    if (error) throw error;

    const totalResources = data?.length || 0;
    const totalCompleted = data?.filter(p => p.status === 'completed').length || 0;
    const totalInProgress = data?.filter(p => p.status === 'in_progress').length || 0;

    const avgCompletionRate = totalResources > 0
      ? Math.round((totalCompleted / totalResources) * 100)
      : 0;

    const uniqueUsers = new Set(data?.map(p => p.user_id)).size;

    return {
      totalResources,
      totalCompleted,
      totalInProgress,
      avgCompletionRate,
      uniqueUsers,
      error: null,
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas globais:', error);
    return {
      totalResources: 0,
      totalCompleted: 0,
      totalInProgress: 0,
      avgCompletionRate: 0,
      uniqueUsers: 0,
      error: error.message,
    };
  }
}
