import { supabase } from './supabase';
import { notifyBadgeEarned } from './notificationSystem';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'material_download' | 'material_completed' | 'chat_points';
  requirement_value: number;
  color?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

/**
 * Busca todas as badges do sistema do banco de dados
 */
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('type', { ascending: true })
      .order('requirement_value', { ascending: true });

    if (error) throw error;

    // Adicionar cores baseadas no tipo
    return (data || []).map(badge => ({
      ...badge,
      color: getBadgeColor(badge.type, badge.requirement_value)
    }));
  } catch (error) {
    console.error('Erro ao buscar badges:', error);
    return [];
  }
}

/**
 * Retorna cor da badge baseado no tipo e requisito
 */
function getBadgeColor(type: string, requirement: number): string {
  if (type === 'material_download') {
    if (requirement === 1) return 'from-blue-400 to-blue-600';
    if (requirement === 5) return 'from-green-400 to-green-600';
    if (requirement === 10) return 'from-purple-400 to-purple-600';
    if (requirement === 15) return 'from-indigo-400 to-indigo-600';
  }

  if (type === 'material_completed') {
    if (requirement === 1) return 'from-teal-400 to-teal-600';
    if (requirement === 5) return 'from-emerald-400 to-emerald-600';
    if (requirement === 10) return 'from-amber-400 to-amber-600';
    if (requirement === 15) return 'from-yellow-400 to-yellow-600';
  }

  if (type === 'chat_points') {
    if (requirement === 100) return 'from-pink-400 to-pink-600';
    if (requirement === 500) return 'from-rose-400 to-rose-600';
    if (requirement === 1000) return 'from-violet-400 to-violet-600';
    if (requirement === 2000) return 'from-orange-400 to-orange-600';
  }

  return 'from-gray-400 to-gray-600';
}

/**
 * Busca todas as badges do usuário
 */
export async function getUserBadges(userId: string): Promise<Badge[]> {
  try {
    const { data: userBadges, error } = await supabase
      .from('user_badges')
      .select(`
        badge_id,
        earned_at,
        badges (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    return (userBadges || []).map((ub: any) => ({
      ...ub.badges,
      color: getBadgeColor(ub.badges.type, ub.badges.requirement_value)
    }));
  } catch (error) {
    console.error('Erro ao buscar badges do usuário:', error);
    return [];
  }
}

/**
 * Busca progresso do usuário em relação a todas as badges
 */
export async function getBadgeProgress(userId: string) {
  try {
    // Buscar todas as badges do sistema
    const allBadges = await getAllBadges();

    // Buscar estatísticas do usuário
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('status, resource_type, resource_id')
      .eq('user_id', userId)
      .in('resource_type', ['atividade', 'bonus']);

    if (progressError) throw progressError;

    // Buscar pontos de chat
    const { data: chatData, error: chatError } = await supabase
      .from('chat_user_stats')
      .select('total_points')
      .eq('user_id', userId)
      .single();

    if (chatError && chatError.code !== 'PGRST116') throw chatError;

    // Calcular estatísticas (usar DISTINCT resource_id para não contar duplicatas)
    const uniqueDownloads = new Set(
      progressData?.filter(p => p.status === 'started' || p.status === 'completed')
        .map(p => p.resource_id) || []
    );

    const uniqueCompleted = new Set(
      progressData?.filter(p => p.status === 'completed')
        .map(p => p.resource_id) || []
    );

    const stats = {
      downloads: uniqueDownloads.size,
      completed: uniqueCompleted.size,
      chat_points: chatData?.total_points || 0,
    };

    // Buscar badges já conquistadas
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const earnedBadgeIds = new Set(userBadges?.map(b => b.badge_id) || []);

    // Calcular progresso para cada badge
    const badgeProgress = allBadges.map(badge => {
      let userStat = 0;

      if (badge.type === 'material_download') {
        userStat = stats.downloads;
      } else if (badge.type === 'material_completed') {
        userStat = stats.completed;
      } else if (badge.type === 'chat_points') {
        userStat = stats.chat_points;
      }

      const progress = Math.min((userStat / badge.requirement_value) * 100, 100);
      const earned = earnedBadgeIds.has(badge.id);

      return {
        id: badge.id,
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        type: badge.type,
        requirement_value: badge.requirement_value,
        color: badge.color,
        progress,
        current: userStat,
        earned,
      };
    });

    return {
      badges: badgeProgress,
      stats,
      totalEarned: earnedBadgeIds.size,
      totalAvailable: allBadges.length,
    };
  } catch (error) {
    console.error('Erro ao buscar progresso de badges:', error);
    return {
      badges: [],
      stats: { downloads: 0, completed: 0, chat_points: 0 },
      totalEarned: 0,
      totalAvailable: 12,
    };
  }
}

/**
 * Verifica e concede badges ao usuário
 * NOTA: O sistema agora usa triggers do banco de dados para conceder badges automaticamente
 * Esta função é mantida para compatibilidade, mas os triggers fazem o trabalho principal
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  try {
    // As badges são concedidas automaticamente pelos triggers do banco
    // Esta função agora apenas retorna as badges recém-conquistadas se houver
    const { data: recentBadges, error } = await supabase
      .from('user_badges')
      .select(`
        badge_id,
        earned_at,
        badges (*)
      `)
      .eq('user_id', userId)
      .gte('earned_at', new Date(Date.now() - 5000).toISOString()) // Últimos 5 segundos
      .order('earned_at', { ascending: false });

    if (error) throw error;

    return (recentBadges || []).map((ub: any) => ({
      ...ub.badges,
      color: getBadgeColor(ub.badges.type, ub.badges.requirement_value)
    }));
  } catch (error) {
    console.error('Erro ao verificar badges:', error);
    return [];
  }
}
