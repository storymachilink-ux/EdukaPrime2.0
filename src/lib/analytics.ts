import { supabase } from './supabase';

/**
 * Busca estatísticas de crescimento de usuários ao longo do tempo
 */
export async function getUserGrowthStats(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: users, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })
      .limit(10000); // Limite para evitar sobrecarga

    if (error) throw error;

    // Agrupar por dia
    const now = new Date();
    const dailyData: { [key: string]: number } = {};

    // Inicializar todos os dias com 0
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = 0;
    }

    // Contar usuários por dia
    users?.forEach(user => {
      if (user.created_at) {
        const dateStr = user.created_at.split('T')[0];
        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr]++;
        }
      }
    });

    // Converter para array acumulativo
    let accumulated = 0;
    const chartData = Object.entries(dailyData).map(([date, count]) => {
      accumulated += count;
      return {
        date,
        novos: count,
        total: accumulated,
      };
    });

    return { data: chartData, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar crescimento de usuários:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Busca estatísticas de downloads e visualizações
 */
export async function getEngagementStats(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('created_at, activity_type, resource_type')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Agrupar por dia
    const dailyData: { [key: string]: { downloads: number; views: number } } = {};

    // Inicializar todos os dias
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { downloads: 0, views: 0 };
    }

    // Contar atividades por dia
    data?.forEach(activity => {
      const dateStr = activity.created_at.split('T')[0];
      if (dailyData[dateStr]) {
        if (activity.activity_type === 'download') {
          dailyData[dateStr].downloads++;
        } else if (activity.activity_type === 'view_video') {
          dailyData[dateStr].views++;
        }
      }
    });

    // Converter para array
    const chartData = Object.entries(dailyData).map(([date, counts]) => ({
      date,
      downloads: counts.downloads,
      visualizacoes: counts.views,
    }));

    return { data: chartData, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas de engajamento:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Busca recursos mais populares (downloads + views)
 */
export async function getMostPopularResources(limit: number = 10) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('resource_type, resource_id, resource_title, activity_type')
      .gte('created_at', startDate.toISOString())
      .limit(5000); // Limite para evitar sobrecarga

    if (error) throw error;

    // Agrupar e contar
    const resourceCounts: { [key: string]: any } = {};

    data?.forEach(activity => {
      const key = `${activity.resource_type}|${activity.resource_id}`;
      if (!resourceCounts[key]) {
        resourceCounts[key] = {
          resource_type: activity.resource_type,
          resource_id: activity.resource_id,
          resource_title: activity.resource_title,
          downloads: 0,
          views: 0,
          total: 0,
        };
      }

      if (activity.activity_type === 'download') {
        resourceCounts[key].downloads++;
      } else if (activity.activity_type === 'view_video') {
        resourceCounts[key].views++;
      }
      resourceCounts[key].total++;
    });

    // Converter para array e ordenar
    const sorted = Object.values(resourceCounts)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, limit);

    return { data: sorted, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar recursos mais populares:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Busca estatísticas de conclusão de recursos
 */
export async function getCompletionStats() {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .limit(10000); // Limite

    if (progressError) throw progressError;

    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_logs')
      .select('resource_type, resource_id')
      .eq('activity_type', 'download')
      .gte('created_at', startDate.toISOString())
      .limit(10000); // Limite

    if (activitiesError) throw activitiesError;

    // Calcular taxa de conclusão
    const totalStarted = new Set(activities?.map(a => `${a.resource_type}|${a.resource_id}`)).size;
    const totalCompleted = progress?.filter(p => p.status === 'completed').length || 0;

    const byType = {
      atividades: {
        started: activities?.filter(a => a.resource_type === 'atividade').length || 0,
        completed: progress?.filter(p => p.resource_type === 'atividade' && p.status === 'completed').length || 0,
      },
      videos: {
        started: activities?.filter(a => a.resource_type === 'video').length || 0,
        completed: progress?.filter(p => p.resource_type === 'video' && p.status === 'completed').length || 0,
      },
      bonus: {
        started: activities?.filter(a => a.resource_type === 'bonus').length || 0,
        completed: progress?.filter(p => p.resource_type === 'bonus' && p.status === 'completed').length || 0,
      },
    };

    return {
      totalStarted,
      totalCompleted,
      completionRate: totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0,
      byType,
      error: null,
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas de conclusão:', error);
    return {
      totalStarted: 0,
      totalCompleted: 0,
      completionRate: 0,
      byType: {
        atividades: { started: 0, completed: 0 },
        videos: { started: 0, completed: 0 },
        bonus: { started: 0, completed: 0 },
      },
      error: error.message,
    };
  }
}

/**
 * Busca usuários mais ativos
 */
export async function getMostActiveUsers(limit: number = 10) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('user_id, users(nome, email)')
      .gte('created_at', startDate.toISOString())
      .limit(5000); // Limite para evitar sobrecarga

    if (error) throw error;

    // Contar atividades por usuário
    const userCounts: { [key: string]: any } = {};

    data?.forEach((activity: any) => {
      const userId = activity.user_id;
      if (!userCounts[userId]) {
        userCounts[userId] = {
          user_id: userId,
          nome: activity.users?.nome || 'Sem nome',
          email: activity.users?.email || '',
          activities: 0,
        };
      }
      userCounts[userId].activities++;
    });

    // Converter para array e ordenar
    const sorted = Object.values(userCounts)
      .sort((a: any, b: any) => b.activities - a.activities)
      .slice(0, limit);

    return { data: sorted, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar usuários mais ativos:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Busca distribuição de usuários por plano
 */
export async function getUsersByPlanDistribution() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('plano_ativo');

    if (error) throw error;

    const distribution = {
      gratuito: data?.filter(u => u.plano_ativo === 0).length || 0,
      essencial: data?.filter(u => u.plano_ativo === 1).length || 0,
      evoluir: data?.filter(u => u.plano_ativo === 2).length || 0,
      prime: data?.filter(u => u.plano_ativo === 3).length || 0,
    };

    // Para gráfico de pizza
    const chartData = [
      { name: 'Gratuito', value: distribution.gratuito, color: '#9CA3AF' },
      { name: 'Essencial', value: distribution.essencial, color: '#3B82F6' },
      { name: 'Evoluir', value: distribution.evoluir, color: '#8B5CF6' },
      { name: 'Prime', value: distribution.prime, color: '#F59E0B' },
    ];

    return { data: chartData, distribution, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar distribuição por plano:', error);
    return {
      data: [],
      distribution: { gratuito: 0, essencial: 0, evoluir: 0, prime: 0 },
      error: error.message,
    };
  }
}

/**
 * Busca métricas gerais do dashboard
 */
export async function getOverviewMetrics() {
  try {
    // Usuários totais e novos hoje
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('created_at, plano_ativo, status')
      .limit(50000); // Limite para evitar sobrecarga

    if (usersError) throw usersError;

    const today = new Date().toISOString().split('T')[0];
    const newToday = allUsers?.filter(u => u.created_at && u.created_at.startsWith(today)).length || 0;
    const activeUsers = allUsers?.filter(u => u.status !== 'bloqueado').length || 0;

    // Downloads e visualizações (últimos 30 dias)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_logs')
      .select('activity_type')
      .gte('created_at', startDate.toISOString())
      .limit(50000); // Limite

    if (activitiesError) throw activitiesError;

    const totalDownloads = activities?.filter(a => a.activity_type === 'download').length || 0;
    const totalViews = activities?.filter(a => a.activity_type === 'view_video').length || 0;

    // Recursos completados (últimos 30 dias)
    const { data: completed, error: completedError } = await supabase
      .from('user_progress')
      .select('id')
      .eq('status', 'completed')
      .gte('updated_at', startDate.toISOString())
      .limit(50000);

    if (completedError) throw completedError;

    return {
      totalUsers: allUsers?.length || 0,
      newToday,
      activeUsers,
      totalDownloads,
      totalViews,
      totalCompleted: completed?.length || 0,
      error: null,
    };
  } catch (error: any) {
    console.error('Erro ao buscar métricas gerais:', error);
    return {
      totalUsers: 0,
      newToday: 0,
      activeUsers: 0,
      totalDownloads: 0,
      totalViews: 0,
      totalCompleted: 0,
      error: error.message,
    };
  }
}
